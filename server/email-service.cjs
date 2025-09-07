const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Log environment variables on startup (without sensitive data)
console.log('Email service starting with config:');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
console.log('OWNER_EMAIL:', process.env.OWNER_EMAIL);

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-pulse.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'raysaga429@gmail.com',
      pass: process.env.SMTP_PASS || 'F37s8ePpa5T',
    },
    tls: {
      rejectUnauthorized: false
    },
    debug: true, // Enable debug logging
    logger: true // Enable logger
  });
};

// Get delivery option label
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

// Format currency
const formatKES = (amount) => {
  return `KSh ${amount.toLocaleString()}`;
};

// Generate email HTML content
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
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #0891b2 0%, #f97316 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🐟 NEW ORDER RECEIVED</h1>
        <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">SeasideSeafood Order Notification</p>
      </div>

      <!-- Order Info -->
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

      <!-- Customer Info -->
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

      <!-- Items Ordered -->
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

      <!-- Payment & Total -->
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

      <!-- Action Required -->
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

      <!-- Footer -->
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

// Generate plain text version
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

// API endpoint to send email
app.post('/api/send-order-email', async (req, res) => {
  try {
    console.log('Received order email request:', JSON.stringify(req.body, null, 2));
    
    const order = req.body;
    
    // Validate required fields
    if (!order.orderId || !order.customerName || !order.customerPhone || !order.items || !Array.isArray(order.items)) {
      console.error('Invalid order data received:', order);
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required order fields',
        received: Object.keys(order)
      });
    }
    
    const transporter = createTransporter();
    
    // Test connection before sending
    console.log('Testing SMTP connection...');
    await transporter.verify();
    console.log('SMTP connection verified successfully');
    
    const mailOptions = {
      from: {
        name: 'SeasideSeafood Orders',
        address: process.env.FROM_EMAIL || process.env.EMAIL_FROM || 'orders@seasideseafood.co.ke'
      },
      to: process.env.TO_EMAIL || process.env.OWNER_EMAIL || 'orders.seasideseafood@gmail.com',
      subject: `🐟 New ${order.orderType === 'bulk' ? 'BULK' : ''} Order #${order.orderId} - ${formatKES(order.totalAmount)}`,
      text: generateEmailText(order),
      html: generateEmailHTML(order),
      priority: 'high',
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    };

    console.log('Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('Owner notification email sent successfully:', info.messageId);
    console.log('Email info:', info);
    
    res.json({ success: true, messageId: info.messageId });
    
  } catch (error) {
    console.error('Failed to send owner notification email:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Email service running on port ${PORT}`);
});