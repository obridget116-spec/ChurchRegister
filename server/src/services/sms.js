const env = require('../config/env');

const MNOTIFY_SMS_ENDPOINT = 'https://api.mnotify.com/api/sms/quick';

function isMnotifyConfigured() {
  return Boolean(env.mnotify.apiKey && env.mnotify.senderId);
}

async function sendViaMnotify(phone, message) {
  const { apiKey, senderId } = env.mnotify;
  const url = new URL(MNOTIFY_SMS_ENDPOINT);
  url.searchParams.set('key', apiKey);

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipient: [String(phone)],
      sender: senderId,
      message,
      is_schedule: false,
      schedule_date: '',
    }),
  });
  const body = await res.text();
  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    payload = null;
  }
  return {
    ok: res.ok && payload && payload.status === 'success',
    status: res.status,
    response: body.slice(0, 500),
  };
}

/** Replace {{first_name}} {{full_name}} {{church_name}} placeholders. */
function renderTemplate(template, vars) {
  const v = vars || {};
  const first = String(v.full_name || '').split(' ')[0];
  return String(template || '')
    .replace(/{{\s*first_name\s*}}/gi, first)
    .replace(/{{\s*full_name\s*}}/gi, v.full_name || '')
    .replace(/{{\s*church_name\s*}}/gi, v.church_name || '')
    .trim();
}

module.exports = { isMnotifyConfigured, sendViaMnotify, renderTemplate };