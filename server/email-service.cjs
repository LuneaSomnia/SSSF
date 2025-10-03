// project/server/email-service.cjs

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const { sendMail: sendViaSendPulse } = require('./sendpulse-api.cjs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Startup logging
console.log('Email service starting:');
console.log('USE_SENDPULSE_API:', process.env.USE_SENDPULSE_API);
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
console.log('OWNER_EMAIL:', process.env.OWNER_EMAIL);

// Create transporter to fallback (if needed)
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Helper functions for formatting
const getDeliveryOptionLabel = (item) => {
  if (item.deliveryOption === 'asis') return 'As Is';
  const category = item.category;
  if (category === 'fish') return 'Fillet & Gutted';
  if (category === 'whole-fish') return 'Cleaned & Descaled';
  if (category === 'prawns') return 'Deveined & Peeled';
  if (category === 'other' && ['kalamari', 'octopus'].some(id => item.name.toLowerCase().includes(id))) {
    return 'Cleaned';
  }
  return 'As Is';
};

const formatKES = (amount) => {
  return `KSh ${amount.toLocaleString()}`;
};

const generateEmailHTML = (order) => {
  const itemsHTML = order.items.map(item => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px; border-right: 1px solid #e5e7eb;">
        <strong>${item.name}</strong><br>
        <small style="color: #6b7280;">${item.categoryDisplay}</small>
      </td>
      <td style="padding: 12px; text-align: center; border-right: 1px solid #e5e7eb;">
        ${item.quantity} KG
      </td>
      <td style="padding: 12px; text-align: center; border-right: 1px solid #e5e7eb;">
        ${formatKES(item.price)} per KG
      </td>
      <td style="padding: 12px; text-align: center; border-right: 1px solid #e5e7eb;">
        ${getDeliveryOptionLabel(item)}
        ${item.cleaningFee > 0 ? `<br><small style="color: #059669;">+${formatKES(item.cleaningFee)} processing</small>` : ''}
      </td>
      <td style="padding: 12px; text-align: right; font-weight: bold; color: #0891b2;">
        ${formatKES(item.totalPrice)}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order - SeasideSeafood</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #0891b2 0%, #f97316 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🐟 NEW ORDER RECEIVED</h1>
        <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">SeasideSeafood Order Notification</p>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
        <h2 style="color: #1e40af; margin-top: 0; font-size: 20px;">📋 Order Details</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div>
            <strong>Order ID:</strong><br>
            <span style="color: #059669; font-family: monospace; font-size: 14px;">${order.orderId}</span>
          </div>
          <div>
            <strong>Order Type:</strong><br>
            <span style="color: ${order.orderType === 'bulk' ? '#dc2626' : '#0891b2'}; font-weight: bold;">
              ${order.orderType === 'bulk' ? '🛒 BULK ORDER' : '📦 Single Item'}
            </span>
          </div>
        </div>
      </div>
      <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
        <h2 style="color: #1e40af; margin-top: 0; font-size: 20px;">👤 Customer Information</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div>
            <strong>Name:</strong><br>
            ${order.customerName}
          </div>
          <div>
            <strong>Phone:</strong><br>
            <a href="tel:${order.customerPhone}" style="color: #0891b2; text-decoration: none;">${order.customerPhone}</a>
          </div>
        </div>
        <div style="margin-top: 15px;">
          <strong>Delivery Location:</strong><br>
          📍 ${order.deliveryLocation}
        </div>
        ${order.customerEmail ? `
        <div style="margin-top: 15px;">
          <strong>Email:</strong><br>
          <a href="mailto:${order.customerEmail}" style="color: #0891b2; text-decoration: none;">${order.customerEmail}</a>
        </div>
        ` : ''}
      </div>
      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
        <h2 style="color: #1e40af; margin-top: 0; font-size: 20px;">🐟 Items Ordered (${order.items.length} item${order.items.length > 1 ? 's' : ''})</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <thead>
            <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
              <th style="padding: 12px; text-align: left; font-weight: bold; color: #475569;">Item</th>
              <th style="padding: 12px; text-align: center; font-weight: bold; color: #475569;">Quantity</th>
              <th style="padding: 12px; text-align: center; font-weight: bold; color: #475569;">Unit Price</th>
              <th style="padding: 12px; text-align: center; font-weight: bold; color: #475569;">Preparation</th>
              <th style="padding: 12px; text-align: right; font-weight: bold; color: #475569;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
      </div>
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
        <h2 style="color: #166534; margin-top: 0; font-size: 20px;">💳 Payment & Total</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
          <div>
            <strong>Payment Method:</strong><br>
            <span style="color: ${order.paymentMethod === 'mpesa' ? '#059669' : '#0891b2'}; font-weight: bold;">
              ${order.paymentMethod === 'mpesa' ? '📱 M-Pesa (Till: 6030812)' : '💵 Cash on Delivery'}
            </span>
          </div>
          <div>
            <strong>Items Count:</strong><br>
            ${order.items.length} item${order.items.length > 1 ? 's' : ''}
          </div>
        </div>
        <div style="background: white; border: 2px solid #059669; border-radius: 8px; padding: 20px; text-align: center;">
          <div style="font-size: 16px; color: #374151; margin-bottom: 5px;">TOTAL AMOUNT</div>
          <div style="font-size: 32px; font-weight: bold; color: #059669;">${formatKES(order.totalAmount)}</div>
          ${order.paymentMethod === 'mpesa' ? 
            '<div style="font-size: 14px; color: #6b7280; margin-top: 10px;">Payment will be verified on delivery</div>' : 
            '<div style="font-size: 14px; color: #6b7280; margin-top: 10px;">Customer will pay on delivery</div>'
          }
        </div>
      </div>
      <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
        <h2 style="color: #92400e; margin-top: 0; font-size: 20px;">⏰ Action Required</h2>
        <p style="margin: 0; color: #92400e; font-weight: bold; font-size: 16px;">
          Please reply to the customer with delivery time in MINUTES or HOURS<br>
          (e.g., "30 minutes", "1 hour", "2 hours")
        </p>
        <div style="margin-top: 15px; padding: 15px; background: white; border-radius: 6px;">
          <strong>Customer Contact:</strong><br>
          📞 <a href="tel:${order.customerPhone}" style="color: #0891b2; text-decoration: none;">${order.customerPhone}</a><br>
          💬 <a href="https://wa.me/${order.customerPhone.replace(/\D/g, '')}" style="color: #059669; text-decoration: none;">WhatsApp</a>
        </div>
      </div>
      <div style="text-align: center; padding: 20px; color: #6b7280; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; font-size: 14px;">
          This is an automated notification from SeasideSeafood<br>
          🌊 Fresh Seafood from Diani • Home By The Sea 😊
        </p>
        <p style="margin: 10px 0 0 0; font-size: 12px;">
          Order received at: ${new Date().toLocaleString('en-KE', { 
            timeZone: 'Africa/Nairobi',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })} (EAT)
        </p>
      </div>
    </body>
    </html>
  `;
};

const generateEmailText = (order) => {
  const itemsText = order.items.map(item =>
    `• ${item.name} (${item.categoryDisplay})
  Quantity: ${item.quantity} KG
  Unit Price: ${formatKES(item.price)} per KG
  Preparation: ${getDeliveryOptionLabel(item)}
  ${item.cleaningFee > 0 ? `Processing Fee: ${formatKES(item.cleaningFee)}` : ''}
  Total: ${formatKES(item.totalPrice)}`
  ).join('\n\n');

  return `🐟 NEW ORDER RECEIVED - SeasideSeafood

ORDER DETAILS:
Order ID: ${order.orderId}
Order Type: ${order.orderType === 'bulk' ? 'BULK ORDER' : 'Single Item'}

CUSTOMER INFORMATION:
Name: ${order.customerName}
Phone: ${order.customerPhone}
${order.customerEmail ? `Email: ${order.customerEmail}` : ''}
Delivery Location: ${order.deliveryLocation}

ITEMS ORDERED (${order.items.length} item${order.items.length > 1 ? 's' : ''}):
${itemsText}

PAYMENT & TOTAL:
Payment Method: ${order.paymentMethod === 'mpesa' ? 'M-Pesa (Till: 6030812)' : 'Cash on Delivery'}
TOTAL AMOUNT: ${formatKES(order.totalAmount)}
${order.paymentMethod === 'mpesa' ? 'Payment will be verified on delivery' : 'Customer will pay on delivery'}

ACTION REQUIRED:
Please reply to the customer with delivery time in MINUTES or HOURS
(e.g., "30 minutes", "1 hour", "2 hours")

Customer Contact: ${order.customerPhone}
WhatsApp: https://wa.me/${order.customerPhone.replace(/\D/g, '')}

---
This is an automated notification from SeasideSeafood
Fresh Seafood from Diani • Home By The Sea 😊
Order received at: ${new Date().toLocaleString('en-KE', { 
  timeZone: 'Africa/Nairobi',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
})} (EAT)`;
};

app.post('/api/send-order-email', async (req, res) => {
  try {
    console.log('Request body for order email:', JSON.stringify(req.body, null, 2));
    const order = req.body;
    if (!order.orderId || !order.customerName || !order.customerPhone || !order.items || !Array.isArray(order.items)) {
      console.error('Missing required order fields:', order);
      return res.status(400).json({
        success: false,
        error: 'Missing required order fields'
      });
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: 'SeasideSeafood Orders',
        address: process.env.EMAIL_FROM || 'orders@seasideseafood.co.ke'
      },
      to: process.env.OWNER_EMAIL,
      subject: `🐟 New ${order.orderType === 'bulk' ? 'BULK ' : ''}Order #${order.orderId} - ${formatKES(order.totalAmount)}`,
      text: generateEmailText(order),
      html: generateEmailHTML(order),
      priority: 'high',
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    };

    console.log('Preparing to send email:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    if (process.env.USE_SENDPULSE_API === 'true') {
      try {
        const apiResp = await sendViaSendPulse({
          from: mailOptions.from,
          to: mailOptions.to,
          subject: mailOptions.subject,
          html: mailOptions.html,
          text: mailOptions.text
        });
        console.log('SendPulse API response:', apiResp);
        return res.json({ success: true, apiResponse: apiResp });
      } catch (apiErr) {
        console.error('Error sending via SendPulse API:', apiErr && (apiErr.response ? apiErr.response.data : apiErr.message));
        if (process.env.ALLOW_SMTP_FALLBACK === 'true') {
          const info = await transporter.sendMail(mailOptions);
          console.log('Fallback SMTP mail sent, messageId =', info && info.messageId);
          return res.json({ success: true, messageId: info.messageId, fallback: true });
        } else {
          return res.status(500).json({ success: false, error: 'SendPulse API error' });
        }
      }
    } else {
      const info = await transporter.sendMail(mailOptions);
      console.log('SMTP email sent successfully, messageId =', info.messageId);
      return res.json({ success: true, messageId: info.messageId });
    }

  } catch (err) {
    console.error('Failed sending order email:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Email service running on port ${PORT}`);
});

// Error wrappers
process.on('unhandledRejection', err => {
  console.error('Unhandled Rejection:', err);
});
process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
});
