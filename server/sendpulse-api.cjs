// project/server/sendpulse-api.cjs
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const CLIENT_ID = process.env.SENDPULSE_ID;
const CLIENT_SECRET = process.env.SENDPULSE_SECRET;
if (!CLIENT_ID || !CLIENT_SECRET) {
  console.warn('SENDPULSE_ID / SENDPULSE_SECRET not set — SendPulse API will not be available.');
}

const TOKEN_CACHE = path.join(__dirname, '.sendpulse_token.json');

async function getToken() {
  // Try cache
  try {
    const cached = JSON.parse(fs.readFileSync(TOKEN_CACHE, 'utf8'));
    if (cached.access_token && cached.expires_at && Date.now() < cached.expires_at - 30*1000) {
      return cached.access_token;
    }
  } catch (e) { /* no cache or parse error */ }

  // Fetch token
  const resp = await axios.post('https://api.sendpulse.com/oauth/access_token', {
    grant_type: 'client_credentials',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET
  }, { headers: { 'Content-Type': 'application/json' }, timeout: 10000 });

  const token = resp.data.access_token;
  const ttl = resp.data.expires_in || 3600;
  fs.writeFileSync(TOKEN_CACHE, JSON.stringify({ access_token: token, expires_at: Date.now() + ttl * 1000 }));
  return token;
}

function normalizeToArray(to) {
  if (!to) return [];
  if (Array.isArray(to)) {
    return to.map(t => (typeof t === 'string' ? { email: t } : t));
  }
  if (typeof to === 'string') return [{ email: to }];
  if (typeof to === 'object') return [to];
  return [];
}

/**
 * sendMail({ from, to, subject, html, text })
 * - from can be: { name, address } or string email
 * - to can be string or array
 */
async function sendMail({ from, to, subject, html, text }) {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('SendPulse credentials not configured (SENDPULSE_ID / SENDPULSE_SECRET)');
  }

  const token = await getToken();

  const fromObj = (from && (from.address || from.email)) ? {
    email: from.address || from.email,
    name: from.name || ''
  } : { email: process.env.EMAIL_FROM || 'no-reply@yourdomain.com', name: process.env.EMAIL_FROM_NAME || 'SeasideSeafood' };

  const toArr = normalizeToArray(to).map(t => ({ email: t.email || t.address || t }));

  const payload = {
    email: {
      html: html || '',
      text: text || (html ? html.replace(/<[^>]+>/g, '') : ''),
      subject: subject || '',
      from: fromObj,
      to: toArr
    }
  };

  const res = await axios.post('https://api.sendpulse.com/smtp/emails', payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    timeout: 15000
  });

  // Return raw API response so the caller can inspect it
  return res.data;
}

module.exports = { sendMail };
