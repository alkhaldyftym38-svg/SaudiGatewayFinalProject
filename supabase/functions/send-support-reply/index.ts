import { createClient } from 'npm:@supabase/supabase-js@2';
import nodemailer from 'npm:nodemailer@6.9.16';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: cors });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'unauthorized' }, 401);

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return json({ error: 'unauthorized' }, 401);

    const service = createClient(supabaseUrl, serviceKey);

    const { data: profile } = await service
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const metaRole = user.user_metadata?.role;
    if (profile?.role !== 'admin' && metaRole !== 'admin') {
      return json({ error: 'forbidden' }, 403);
    }

    const { messageId, replyText } = await req.json();
    const text = typeof replyText === 'string' ? replyText.trim() : '';
    if (!messageId || !text) return json({ error: 'invalid_body' }, 400);

    const { data: message, error: messageError } = await service
      .from('support_messages')
      .select('id, name, email, subject, message')
      .eq('id', messageId)
      .single();

    if (messageError || !message) return json({ error: 'not_found' }, 404);

    const gmailUser = Deno.env.get('GMAIL_USER')?.trim();
    const gmailPass = Deno.env.get('GMAIL_APP_PASSWORD')?.trim();
    if (!gmailUser || !gmailPass) {
      return json({
        ok: true,
        emailSent: false,
        warning: 'email_not_configured',
        hint: 'Add GMAIL_USER and GMAIL_APP_PASSWORD in Edge Functions → Secrets, then redeploy send-support-reply.',
      });
    }

    const fromName = (Deno.env.get('SUPPORT_FROM_NAME') ?? 'Saudi Gateway Support').trim();
    const subject = `Re: ${message.subject || 'Saudi Gateway Support'}`;

    const html = `
      <p>${escapeHtml(`Hello ${message.name},`)}</p>
      <p>${escapeHtml(text).replace(/\n/g, '<br>')}</p>
      <hr>
      <p><small>Your message:</small></p>
      <blockquote>${escapeHtml(message.message).replace(/\n/g, '<br>')}</blockquote>
    `;

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    try {
      await transporter.sendMail({
        from: `"${fromName}" <${gmailUser}>`,
        to: message.email.trim(),
        subject,
        html,
      });
    } catch (mailErr) {
      const detail = mailErr instanceof Error ? mailErr.message : String(mailErr);
      console.error('Gmail SMTP error:', detail);

      const lower = detail.toLowerCase();
      let hintCode = 'unknown';
      if (lower.includes('username and password') || lower.includes('badcredentials') || lower.includes('auth')) {
        hintCode = 'invalid_credentials';
      } else if (lower.includes('less secure') || lower.includes('application-specific')) {
        hintCode = 'app_password_required';
      }

      return json({
        ok: true,
        emailSent: false,
        warning: 'send_failed',
        detail: detail.slice(0, 400),
        fromEmail: gmailUser,
        toEmail: message.email,
        hintCode,
      });
    }

    const { error: insertError } = await service.from('support_message_replies').insert({
      message_id: messageId,
      admin_id: user.id,
      body: text,
    });

    if (insertError) {
      console.error('Insert reply error:', insertError.message);
      return json({ ok: true, emailSent: true, warning: 'save_failed_after_email' });
    }

    await service
      .from('support_messages')
      .update({
        status: 'read',
        last_reply_at: new Date().toISOString(),
      })
      .eq('id', messageId);

    return json({ ok: true, emailSent: true });
  } catch (err) {
    console.error(err);
    return json({ error: 'internal' }, 500);
  }
});
