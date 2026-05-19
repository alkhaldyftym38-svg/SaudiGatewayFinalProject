import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Link = { label: string; url: string };
type HistoryMessage = { role: 'user' | 'assistant'; content: string };

const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-versatile';
const WHISPER_MODEL = 'whisper-large-v3';
const MAX_HISTORY_TURNS = 12;
const MAX_AUDIO_BYTES = 8 * 1024 * 1024;

function sanitizeHistory(raw: unknown): HistoryMessage[] {
  if (!Array.isArray(raw)) return [];
  const out: HistoryMessage[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const role = (item as { role?: string }).role;
    const content = typeof (item as { content?: string }).content === 'string'
      ? (item as { content: string }).content.trim()
      : '';
    if (!content || (role !== 'user' && role !== 'assistant')) continue;
    out.push({ role, content: content.slice(0, 2000) });
  }
  return out.slice(-MAX_HISTORY_TURNS);
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

function platformFacts(lang: string): string {
  if (lang === 'ar') {
    return `منصة بوابة السعودية (Saudi Gateway): موقع إرشادي ثنائي اللغة عن التراث والفعاليات والاستثمار في المملكة.
ليست بوابة حكومية رسمية. المساعد الذكي (AI). أقسام الموقع: /heritage /events /investment /support /favorites`;
  }
  return `Saudi Gateway: bilingual guidance site for heritage, events, and investment in Saudi Arabia.
Not an official government portal. AI assistant. Sections: /heritage /events /investment /support /favorites`;
}

type QueryTopics = { events: boolean; heritage: boolean; investment: boolean };

function isGreetingOrSmallTalk(query: string): boolean {
  const t = query.trim();
  if (!t) return true;
  const q = t.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();

  const pureGreeting = /^(مرحبا|مرحباً|اهلا|أهلاً|أهلا|هلا|السلام عليكم|صباح الخير|مساء الخير|شكرا|شكراً|thanks|thank you|hi|hello|hey|good morning|good evening)([\s!.,؟?]*)*$/i.test(q);
  if (pureGreeting) return true;

  if (t.length < 35 && /^(مرحبا|مرحباً|اهلا|أهلا|هلا|hi|hello|hey)\b/i.test(q)) return true;

  const chitchat = /كيف حالك|كيفك|how are you|who are you|من انت|من أنت|what are you|ماذا تستطيع|what can you do/i.test(q);
  if (chitchat && !/فعاليات|تراث|استثمار|event|heritage|invest|مهرجان|موقع/i.test(q)) return true;

  return false;
}

function detectTopics(query: string): QueryTopics | null {
  if (isGreetingOrSmallTalk(query)) return null;

  const q = query.toLowerCase();
  const events = /فعاليات|فعالية|فعاليه|event|مهرجان|حفل|معرض|قادم|قادمة|upcoming|ongoing|تقويم|calendar|concert|festival/i.test(q);
  const heritage = /تراث|مواقع تراث|موقع تراث|heritage|unesco|معلم|أثار|اثار/i.test(q);
  const investment = /استثمار|invest|شركة|startup|قطاع|misa|رخصة|تقنية|أعمال|اعمال|business|رؤية 2030|vision 2030/i.test(q);

  if (!events && !heritage && !investment) return null;

  return { events, heritage, investment };
}

function extractSearchTerms(query: string): string[] {
  const stop = new Set([
    'ما', 'هي', 'هل', 'من', 'في', 'على', 'عن', 'ان', 'أن', 'اذا', 'إذا', 'the', 'what', 'how',
    'is', 'are', 'can', 'you', 'me', 'my', 'tell', 'please', 'قل', 'لي', 'أخبر', 'اخبر', 'موجود',
    'موجوده', 'الموجود', 'الموجودة', 'قادمة', 'قادم',
  ]);
  return query
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 3 && !stop.has(w.toLowerCase()))
    .slice(0, 4);
}

type DbFetchResult = { context: string; itemLinks: Link[]; hasRows: boolean };

function linkKey(link: Link): string {
  return `${link.url}\0${link.label}`;
}

function mergeAssistantLinks(itemLinks: Link[], query: string, lang: string): Link[] {
  const seen = new Set<string>();
  const out: Link[] = [];

  const push = (link: Link) => {
    const key = linkKey(link);
    if (!link.url || !link.label || seen.has(key)) return;
    seen.add(key);
    out.push({ label: link.label.slice(0, 96), url: link.url });
  };

  for (const link of itemLinks) push(link);
  for (const link of suggestLinks(query, lang)) push(link);

  return out.slice(0, 14);
}

async function fetchLiveDatabaseContext(
  service: ReturnType<typeof createClient>,
  query: string,
  lang: string,
): Promise<DbFetchResult> {
  const isAr = lang === 'ar';
  const topics = detectTopics(query);
  if (!topics) return { context: '', itemLinks: [], hasRows: false };

  const terms = extractSearchTerms(query);
  const lines: string[] = [];
  const itemLinks: Link[] = [];
  const seenLinks = new Set<string>();

  const addItemLink = (label: string, url: string) => {
    const trimmed = label.trim();
    if (!trimmed || !url) return;
    const link: Link = { label: trimmed.slice(0, 96), url };
    const key = linkKey(link);
    if (seenLinks.has(key)) return;
    seenLinks.add(key);
    itemLinks.push(link);
  };

  const heritageSelect = isAr
    ? 'id, name_ar, location_ar, desc_ar, category'
    : 'id, name_en, location_en, desc_en, category';
  const eventsSelect = isAr
    ? 'id, title_ar, location_ar, desc_ar, date, end_date, status, is_free, price'
    : 'id, title_en, location_en, desc_en, date, end_date, status, is_free, price';

  const tasks: Promise<void>[] = [];

  if (topics.events) {
    tasks.push((async () => {
      const upcoming = /قادم|قادمة|upcoming|soon|future/i.test(query);
      let q = service.from('events').select(eventsSelect);
      if (upcoming) q = q.in('status', ['upcoming', 'ongoing']);
      q = q.order('date', { ascending: true, nullsFirst: false }).limit(12);
      const { data, error } = await q;
      if (error) console.error('events fetch', error.message);
      for (const row of data ?? []) {
        const r = row as Record<string, string | boolean>;
        const title = ((isAr ? r.title_ar : r.title_en) || r.title_ar || r.title_en || '') as string;
        const loc = (r.location_ar || r.location_en || '') as string;
        const desc = ((r.desc_ar || r.desc_en || '') as string).slice(0, 140);
        const price = r.is_free ? (isAr ? 'مجاني' : 'Free') : ((r.price as string) || '');
        lines.push(
          `Event|id=${r.id}|path=/events/${r.id}|${title}|date=${r.date || '?'}|status=${r.status}|${loc}|${price}|${desc}`,
        );
        addItemLink(title, `/events/${r.id}`);
      }
    })());
  }

  if (topics.heritage) {
    tasks.push((async () => {
      let q = service.from('heritage_sites').select(heritageSelect).limit(10);
      if (terms.length > 0) {
        const p = `%${terms[0]}%`;
        q = q.or(
          isAr
            ? `name_ar.ilike.${p},desc_ar.ilike.${p},location_ar.ilike.${p}`
            : `name_en.ilike.${p},desc_en.ilike.${p},location_en.ilike.${p}`,
        );
      }
      const { data, error } = await q;
      if (error) console.error('heritage fetch', error.message);
      for (const row of data ?? []) {
        const r = row as Record<string, string>;
        const name = (isAr ? r.name_ar : r.name_en) || r.name_ar || r.name_en || '';
        lines.push(
          `Heritage|id=${r.id}|path=/heritage/${r.id}|${name}|${r.location_ar || r.location_en || ''}|${r.category || ''}|${((r.desc_ar || r.desc_en || '') as string).slice(0, 140)}`,
        );
        addItemLink(name, `/heritage/${r.id}`);
      }
    })());
  }

  if (topics.investment) {
    tasks.push((async () => {
      const [sectors, steps] = await Promise.all([
        service
          .from('investment_sectors')
          .select(isAr ? 'id, name_ar, desc_ar, growth, opportunities' : 'id, name_en, desc_en, growth, opportunities')
          .order('sort_order')
          .limit(8),
        service
          .from('investment_steps')
          .select(isAr ? 'step, title_ar, desc_ar, duration' : 'step, title_en, desc_en, duration')
          .order('step')
          .limit(6),
      ]);
      for (const row of sectors.data ?? []) {
        const r = row as Record<string, string | number>;
        const sectorName = (isAr ? r.name_ar : r.name_en) || r.name_ar || r.name_en || '';
        lines.push(
          `InvestmentSector|id=${r.id}|path=/investment?tab=sectors|${sectorName}|growth=${r.growth}|opportunities=${r.opportunities}|${((r.desc_ar || r.desc_en || '') as string).slice(0, 100)}`,
        );
        addItemLink(sectorName, '/investment?tab=sectors');
      }
      for (const row of steps.data ?? []) {
        const r = row as Record<string, string | number>;
        const stepTitle = (isAr ? r.title_ar : r.title_en) || r.title_ar || r.title_en || '';
        lines.push(
          `InvestmentStep|step=${r.step}|path=/investment?tab=steps|${stepTitle}|${r.duration || ''}`,
        );
        const stepLabel = isAr
          ? `الخطوة ${r.step}: ${stepTitle}`
          : `Step ${r.step}: ${stepTitle}`;
        addItemLink(stepLabel, '/investment?tab=steps');
      }
    })());
  }

  await Promise.all(tasks);

  if (!lines.length) {
    return { context: '', itemLinks: [], hasRows: false };
  }

  const header = isAr
    ? '=== بيانات حية من قاعدة بيانات المنصة (يجب استخدامها في الإجابة؛ لكل صف حقل path لرابط مباشر) ==='
    : '=== Live rows from platform database (use in your answer; each row has a path for a direct link) ===';
  return { context: `${header}\n${lines.join('\n')}`, itemLinks, hasRows: true };
}

function suggestLinks(query: string, lang: string): Link[] {
  const q = query.toLowerCase();
  const topics = detectTopics(query);
  const out: Link[] = [];

  if (topics?.heritage) out.push({ label: lang === 'ar' ? 'كل مواقع التراث' : 'All heritage sites', url: '/heritage' });
  if (topics?.events) out.push({ label: lang === 'ar' ? 'كل الفعاليات' : 'All events', url: '/events' });
  if (topics?.investment) out.push({ label: lang === 'ar' ? 'دليل الاستثمار' : 'Investment guide', url: '/investment?tab=sectors' });

  if (/visa|تأشيرة|تأشيره|evisa|tourist visa|سياحة|سياحي|tourist/i.test(q)) {
    out.push(
      { label: lang === 'ar' ? 'زيارة السعودية' : 'Visit Saudi', url: 'https://visitsaudi.com' },
      { label: lang === 'ar' ? 'منصة التأشيرات' : 'Visa platform', url: 'https://visa.visitsaudi.com' },
      { label: lang === 'ar' ? 'أبشر' : 'Absher', url: 'https://www.absher.sa' },
    );
  }
  if (/invest|استثمار|misa|شركة|company|startup/i.test(q)) {
    out.push(
      { label: 'MISA', url: 'https://misa.gov.sa' },
      { label: lang === 'ar' ? 'استثمر السعودية' : 'Invest Saudi', url: 'https://investsaudi.sa' },
    );
  }
  if (/heritage|تراث|permit|تصريح|unesco/i.test(q)) {
    out.push({ label: lang === 'ar' ? 'هيئة التراث' : 'Heritage Commission', url: 'https://her.gov.sa' });
  }

  return out.slice(0, 6);
}

function decodeBase64Audio(data: string): Uint8Array {
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function whisperPrompt(lang: string): string {
  return lang === 'ar'
    ? 'محادثة بالعربية عن المملكة العربية السعودية، التراث، الفعاليات، الاستثمار، والتأشيرة.'
    : 'Conversation in English about Saudi Arabia, heritage, events, investment, and visas.';
}

function transcriptLooksWrong(text: string, lang: string): boolean {
  if (!text) return true;
  const arCount = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const latinCount = (text.match(/[a-zA-ZÀ-ÿ]/g) || []).length;
  if (lang === 'ar') return arCount < 2 && latinCount > 5;
  return arCount > 10 && latinCount < 2;
}

async function callWhisper(
  bytes: Uint8Array,
  audioMime: string,
  apiKey: string,
  opts: { language?: string; prompt?: string },
): Promise<string | null> {
  const ext = audioMime.includes('webm') ? 'webm' : audioMime.includes('mp4') ? 'm4a' : 'wav';
  const blob = new Blob([bytes], { type: audioMime || 'audio/webm' });
  const form = new FormData();
  form.append('file', blob, `voice.${ext}`);
  form.append('model', WHISPER_MODEL);
  form.append('response_format', 'json');
  form.append('temperature', '0');
  if (opts.language) form.append('language', opts.language);
  if (opts.prompt) form.append('prompt', opts.prompt);

  const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!res.ok) {
    console.error('Whisper error', await res.text());
    return null;
  }

  const data = await res.json();
  const text = typeof data?.text === 'string' ? data.text.trim() : '';
  return text || null;
}

async function transcribeAudio(
  audioBase64: string,
  audioMime: string,
  lang: string,
  apiKey: string,
): Promise<string | null> {
  const bytes = decodeBase64Audio(audioBase64);
  if (bytes.byteLength < 1500) {
    console.error('Audio too short', bytes.byteLength);
    return null;
  }
  if (bytes.byteLength > MAX_AUDIO_BYTES) {
    console.error('Audio too large', bytes.byteLength);
    return null;
  }

  const prompt = whisperPrompt(lang);
  const language = lang === 'ar' ? 'ar' : 'en';

  let text = await callWhisper(bytes, audioMime, apiKey, { language, prompt });
  if (text && transcriptLooksWrong(text, lang)) {
    text = await callWhisper(bytes, audioMime, apiKey, { prompt });
  }
  if (text && transcriptLooksWrong(text, lang)) {
    return null;
  }
  return text;
}

async function loadGroqConfig(
  service: ReturnType<typeof createClient>,
): Promise<{ apiKey: string; model: string }> {
  const { data, error } = await service
    .from('site_settings')
    .select('key, value')
    .in('key', ['groq_api_key', 'groq_model']);

  if (error) {
    console.error('site_settings read failed', error.message);
  }

  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    map[row.key] = typeof row.value === 'string' ? row.value.trim() : '';
  }

  const apiKey = map.groq_api_key || Deno.env.get('GROQ_API_KEY')?.trim() || '';
  const model = map.groq_model || DEFAULT_GROQ_MODEL;
  return { apiKey, model };
}

async function generateWithGroq(
  query: string,
  lang: string,
  dbContext: string,
  dbHasRows: boolean,
  history: HistoryMessage[],
  apiKey: string,
  model: string,
): Promise<string | null> {
  const continuing = history.length > 0;

  let system = lang === 'ar'
    ? `أنت مساعد AI هادئ لبوابة السعودية. ردّ بقدر السؤال دون إطالة.
إذا كان المستخدم يلقي تحية فقط (مرحباً، أهلاً، هلا): ردّ بجملة أو جملتين ترحيباً وتسأل كيف تساعده.
إذا لم تُرفق صفوف من قاعدة بيانات المنصة: أجب من معرفتك العامة الموثوقة عن السعودية (تأشيرة، سياحة، استثمار، تراث…). لا تقل فقط «لا توجد بيانات» ولا ترفض الإجابة. لا تخترع أسماء فعاليات أو مواقع محددة من كتالوج المنصة.
عند وجود صفوف من قاعدة البيانات: اذكر الأسماء والتواريخ منها (نقاط مختصرة). لا تخترع صفوفاً غير موجودة. روابط العناصر تظهر تحت ردك — لا تكتب markdown للروابط.
المنصة إرشادية وليست حكومية رسمية — اذكر ذلك بجملة قصيرة عند الحديث عن تأشيرة أو إجراءات رسمية، ووجّه للمواقع الرسمية.
إذا كان السؤال قصيراً (نعم، أكمل)، استخدم سياق المحادثة السابقة.`
    : `You are a calm Saudi Gateway AI assistant. Match reply length to the question.
If the user only greets: one or two friendly sentences, then ask how you can help.
If no platform database rows are attached: answer from reliable general knowledge about Saudi Arabia (visas, tourism, investment, heritage). Never reply with only "no data in the database" or refuse to help. Do not invent specific event/site names from the platform catalog.
When database rows ARE attached: use those names and dates in short bullets. Do not invent catalog rows. Item links appear below your reply — no markdown links in text.
The platform is guidance-only, not an official government portal — say so briefly for visas or official procedures, and point to official sites.
If the question is short (yes, continue), use prior conversation context.`;

  if (continuing) {
    system += lang === 'ar'
      ? '\n\nمهم: المحادثة مستمرة. لا تقل «مرحباً» أو تعرّف بنفسك من جديد. تابع من حيث توقف الحوار.'
      : '\n\nImportant: This is a continuing conversation. Do not say hello or re-introduce yourself. Continue from context.';
  }

  system += `\n\n${platformFacts(lang)}`;

  const userContent = continuing
    ? (dbHasRows
      ? (lang === 'ar'
        ? `مرجع من قاعدة البيانات:\n${dbContext}\n\nالسؤال الحالي للزائر: ${query}`
        : `Database reference:\n${dbContext}\n\nVisitor's current message: ${query}`)
      : (lang === 'ar'
        ? `السؤال الحالي للزائر (أجب من معرفتك العامة — لا توجد صفوف مطابقة في كتالوج المنصة): ${query}`
        : `Visitor's current message (answer from general knowledge — no matching platform catalog rows): ${query}`))
    : (dbHasRows
      ? (lang === 'ar'
        ? `بيانات من قاعدة البيانات:\n${dbContext}\n\nسؤال الزائر: ${query}`
        : `Database context:\n${dbContext}\n\nVisitor question: ${query}`)
      : (lang === 'ar'
        ? `سؤال الزائر (أجب من معرفتك العامة — لا توجد صفوف مطابقة في كتالوج المنصة): ${query}`
        : `Visitor question (answer from general knowledge — no matching platform catalog rows): ${query}`));

  const groqMessages: { role: string; content: string }[] = [
    { role: 'system', content: system },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userContent },
  ];

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model || DEFAULT_GROQ_MODEL,
      temperature: dbHasRows ? 0.55 : 0.5,
      max_tokens: dbHasRows ? 900 : 650,
      messages: groqMessages,
    }),
  });

  if (!res.ok) {
    console.error('Groq error', await res.text());
    return null;
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  return typeof text === 'string' && text.trim() ? text.trim() : null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: cors });
  }

  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405);
  }

  try {
    const body = await req.json();
    const lang = body.lang === 'ar' ? 'ar' : 'en';
    let query = typeof body.query === 'string' ? body.query.trim() : '';
    const audioBase64 = typeof body.audioBase64 === 'string' ? body.audioBase64.trim() : '';
    const audioMime = typeof body.audioMime === 'string' ? body.audioMime : 'audio/webm';

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const service = createClient(supabaseUrl, serviceKey);

    const { apiKey: groqKey, model: groqModel } = await loadGroqConfig(service);
    if (!groqKey) {
      return json({ error: 'groq_not_configured' }, 503);
    }

    let transcript = '';
    if (audioBase64) {
      const spoken = await transcribeAudio(audioBase64, audioMime, lang, groqKey);
      if (!spoken) {
        return json({ error: 'transcribe_failed' }, 400);
      }
      transcript = spoken;
      query = spoken;
    }

    if (!query) {
      return json({ error: 'invalid_body' }, 400);
    }

    const history = sanitizeHistory(body.history);
    const { context: dbContext, itemLinks, hasRows: dbHasRows } = await fetchLiveDatabaseContext(service, query, lang);
    const answer = await generateWithGroq(query, lang, dbContext, dbHasRows, history, groqKey, groqModel);

    if (!answer) {
      return json({ error: 'groq_failed', showHumanSupport: true }, 502);
    }

    return json({
      answer,
      transcript: transcript || query,
      links: mergeAssistantLinks(itemLinks, query, lang),
      showHumanSupport: false,
      mode: audioBase64 ? 'groq_voice' : 'groq',
      historyUsed: history.length,
    });
  } catch (err) {
    console.error(err);
    return json({ error: 'internal' }, 500);
  }
});
