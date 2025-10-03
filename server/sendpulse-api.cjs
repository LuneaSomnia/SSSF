// project/server/sendpulse-api.cjs

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const CLIENT_ID = process.env.SENDPULSE_ID;
const CLIENT_SECRET = process.env.SENDPULSE_SECRET;
if (!CLIENT_ID || !CLIENT_SECRET) {
  console.warn('SENDPULSE_ID / SENDPULSE_SECRET not set — SendPulse API will not function.');
}

const TOKEN_CACHE = path.join(__dirname, '.sendpulse_token.json');

async function getToken() {
  try {
    const cached = JSON.parse(fs.readFileSync(TOKEN_CACHE, 'utf8'));
    if (cached.access_token && cached.expires_at && Date.now() < cached.expires_at - 30 * 1000) {
      return cached.access_token;
    }
  } catch (e) {
    // no cache or invalid
  }

  const resp = await axios.post(
    'https://api.sendpulse.com/oauth/access_token',
    {
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    },
    { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
  );

  if (!resp.data || !resp.data.access_token) {
    throw new Error('Failed to obtain SendPulse access token: ' + JSON.stringify(resp.data));
  }

  const token = resp.data.access_token;
  const ttl = resp.data.expires_in || 3600;
  const cache = {
    access_token: token,
    expires_at: Date.now() + ttl * 1000
  };
  fs.writeFileSync(TOKEN_CACHE, JSON.stringify(cache));
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
 */
async function sendMail({ from, to, subject, html, text }) {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('SendPulse credentials not configured (SENDPULSE_ID / SENDPULSE_SECRET)');
  }

  const token = await getToken();

  const fromObj = (from && (from.address || from.email)) ? {
    email: from.address || from.email,
    name: from.name || ''
  } : {
    email: process.env.EMAIL_FROM || 'no-reply@yourdomain.com',
    name: process.env.EMAIL_FROM_NAME || 'SeasideSeafood'
  };

  const toArr = normalizeToArray(to).map(t => {
    if (typeof t === 'string') {
      return { email: t };
    }
    return { email: t.email || t.address, name: t.name || '' };
  });

  const payload = {
    email: {
      html: html || '',
      text: text || (html ? html.replace(/<[^>]+>/g, '') : ''),
      subject: subject || '',
      from: fromObj,
      to: toArr
    }
  };

  const res = await axios.post(
    'https://api.sendpulse.com/smtp/emails',
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    }
  );

  return res.data;
}

module.exports = { sendMail };
