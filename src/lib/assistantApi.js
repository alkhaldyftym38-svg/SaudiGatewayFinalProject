const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('invalid_blob'));
        return;
      }
      const base64 = result.split(',')[1];
      resolve(base64 ?? '');
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function invokeAssistant(body, signal) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/assistant-chat`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (data?.error === 'groq_not_configured') {
      return { ok: false, reason: 'groq_not_configured' };
    }
    if (data?.error === 'transcribe_failed') {
      return { ok: false, reason: 'transcribe_failed' };
    }
    if (res.status === 404) {
      return { ok: false, reason: 'not_deployed' };
    }
    return { ok: false, reason: 'invoke_error', message: data?.error ?? res.statusText };
  }

  if (data?.error) {
    return { ok: false, reason: data.error, message: String(data.error) };
  }

  return {
    ok: true,
    answer: data.answer ?? '',
    transcript: data.transcript ?? '',
    links: Array.isArray(data.links) ? data.links : [],
    showHumanSupport: Boolean(data.showHumanSupport),
    mode: data.mode ?? 'unknown',
  };
}

export async function askAssistant(query, lang = 'en', history = [], signal) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return { ok: false, reason: 'missing_env' };
  }

  try {
    return await invokeAssistant({ query, lang, history }, signal);
  } catch (err) {
    if (err?.name === 'AbortError') {
      return { ok: false, reason: 'aborted' };
    }
    return { ok: false, reason: 'invoke_error', message: err?.message ?? 'network_error' };
  }
}

export async function askAssistantVoice(audioBlob, lang = 'en', history = [], signal) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return { ok: false, reason: 'missing_env' };
  }

  try {
    const audioBase64 = await blobToBase64(audioBlob);
    return await invokeAssistant({
      query: '',
      lang,
      history,
      audioBase64,
      audioMime: audioBlob.type || 'audio/webm',
    }, signal);
  } catch (err) {
    if (err?.name === 'AbortError') {
      return { ok: false, reason: 'aborted' };
    }
    return { ok: false, reason: 'invoke_error', message: err?.message ?? 'network_error' };
  }
}

export function canRecordVoice() {
  return typeof window !== 'undefined'
    && Boolean(navigator.mediaDevices?.getUserMedia)
    && typeof MediaRecorder !== 'undefined';
}
