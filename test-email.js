// test-email.js
// Node 16+ required
import nodemailer from 'nodemailer';

async function run() {
  const smtpHost = process.env.SMTP_HOST || 'smtp-pulse.com';
  const smtpPort = process.env.SMTP_PORT || 2525;
  const smtpUser = process.env.SMTP_USER || 'raysaga429@gmail.com';
  const smtpPass = process.env.SMTP_PASS || 'F37s8ePpa5T';
  const from = process.env.EMAIL_FROM || 'orders@seasideseafood.co.ke';
  const to = process.env.OWNER_EMAIL || 'orders.seasideseafood@gmail.com';

  console.log('Using SMTP', smtpHost, smtpPort, smtpUser, 'from', from, 'to', to);

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(smtpPort),
    secure: Number(smtpPort) === 465,
    auth: { user: smtpUser, pass: smtpPass },
    logger: true,
    debug: true,
  });

  try {
    const ok = await transporter.verify();
    console.log('transporter.verify() => OK', ok);
  } catch (e) {
    console.error('transporter.verify() failed:', e);
  }

  const mailOptions = {
    from,
    to,
    subject: `TEST email ${new Date().toISOString()}`,
    text: `This is a test from test-email.js at ${new Date().toISOString()}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('sendMail success:', info);
  } catch (err) {
    console.error('sendMail error:', err);
  }

  process.exit(0);
}

run();
