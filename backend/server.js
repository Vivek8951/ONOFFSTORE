// ❤️ ONOFF STORE V2 - SUPABASE EDITION (Fastest Hub)
const dns = require('dns');
// 💡 CLOUD-HARDENED DNS: Force IPv4 and use Google Resolvers (8.8.8.8)
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Razorpay = require('razorpay');
const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');

// 🚀 SUPABASE SECURE HUB: High-Performance Database
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// 1. Razorpay Initialization
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_onoff_fallback',
  key_secret: process.env.RAZORPAY_SECRET || 'fallback_secret'
});

const { generateInvoicePDF } = require('./src/services/PDFService');
const stream = require('stream');

// 🔐 GMAIL DISPATCH HUB (Gmail API via HTTPS)
const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

console.log('✅ ATELIER SUPABASE DISPATCH HUB READY');

const sendOrderConfirmation = (order) => {
  setImmediate(async () => {
    try {
      console.log(`[ORDER SIGNAL] Processing email for Order: ${order.id}`);
      const fileName = `SMARTON_INVOICE_${order.id.slice(-6).toUpperCase()}.pdf`;
      
      const pdfStream = new stream.PassThrough();
      // Adjust PDFService for Supabase order object
      generateInvoicePDF(order, pdfStream);

      const pdfBuffer = await new Promise((resolve, reject) => {
        const chunks = [];
        pdfStream.on('data', chunk => chunks.push(chunk));
        pdfStream.on('error', reject);
        pdfStream.on('end', () => resolve(Buffer.concat(chunks)));
      });

      const message = [
        `To: ${order.customer_details.email}`,
        'Subject: 🏛️ ATELIER HUB: Order Confirmation Received',
        'Mime-Version: 1.0',
        'Content-Type: multipart/mixed; boundary="boundary_foo"',
        '',
        '--boundary_foo',
        'Content-Type: text/html; charset="UTF-8"',
        '',
        `<div style="font-family: serif; color: #0a0a0b; padding: 40px; background: #faf9f6; border: 20px solid #800000;">
           <h1 style="text-align: center; color: #800000; letter-spacing: 0.5em; text-transform: uppercase;">ONOFF</h1>
           <p style="font-size: 18px; text-transform: uppercase; letter-spacing: 0.2em; text-align: center; color: #d4af37;">Confirmed Archive Arrival</p>
           <p>Dear ${order.customer_details.name},</p>
           <p>We have successfully archived your commission. Your order <strong>#${order.id.slice(-6).toUpperCase()}</strong> is now being processed within the Atelier Hub.</p>
           <div style="background: #fff; padding: 20px; border: 1px solid #d4af37;">
             <p>Total Commission: ${order.total_amount}</p>
             <p>Status: Registered</p>
           </div>
           <p>Your digital certificate of purchase is attached below.</p>
         </div>`,
        '',
        '--boundary_foo',
        `Content-Type: application/pdf; name="${fileName}"`,
        'Content-Transfer-Encoding: base64',
        `Content-Disposition: attachment; filename="${fileName}"`,
        '',
        pdfBuffer.toString('base64'),
        '',
        '--boundary_foo--'
      ].join('\r\n');

      const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      await gmail.users.messages.send({ userId: 'me', requestBody: { raw: encodedMessage } });
      console.log('✅ DIGITAL BILL DISPATCHED');
    } catch (err) {
      console.error('❌ EMAIL SIGNAL ERROR:', err.message);
    }
  });
};

// 🏛️ ORDER PROTOCOL (Supabase Hub)
const orderRouter = express.Router();

orderRouter.post('/create', async (req, res) => {
  try {
    const { customerDetails, items, totalAmount } = req.body;

    // 1. 🚀 SUPABASE HUB: Instant Creation
    const { data: sbOrder, error: sbErr } = await supabase.from('orders').insert({
      total_amount: totalAmount,
      customer_details: customerDetails,
      items,
      order_status: 'Accepted'
    }).select().single();

    if (sbErr) {
      console.error('Supabase Hub Reject:', sbErr.message);
      return res.status(500).json({ error: 'Supabase Registry Failed' });
    }

    // 2. Razorpay Initialization (Service Bridge)
    let rzpOrder = null;
    const hasRealKeys = process.env.RAZORPAY_KEY_ID && !process.env.RAZORPAY_KEY_ID.includes('fallback');
    
    if (hasRealKeys) {
      try {
        rzpOrder = await razorpay.orders.create({
          amount: totalAmount * 100, currency: 'INR', receipt: sbOrder.id
        });
        await supabase.from('orders').update({ shipping_details: { rzpOrderId: rzpOrder.id } }).eq('id', sbOrder.id);
      } catch (rzpErr) {
        console.warn('⚠️ Razorpay deferred:', rzpErr.message);
      }
    }

    // 3. Background Signal: Stock & Email
    setImmediate(async () => {
      // Stock Adjustment in Supabase
      for (const item of items) {
        const { data: prod } = await supabase.from('products').select('stock').eq('id', item.product).single();
        if (prod && prod.stock > 0) {
          await supabase.from('products').update({ stock: Math.max(0, prod.stock - (item.quantity || 1)) }).eq('id', item.product);
        }
      }
      sendOrderConfirmation(sbOrder);
    });

    res.json({ success: true, dbOrderId: sbOrder.id, razorpayOrder: rzpOrder });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

orderRouter.get('/admin/all', async (req, res) => {
  try {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Atelier Feed Blocked' }); }
});

orderRouter.put('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, courier, trackingId } = req.body;
    
    const { error } = await supabase.from('orders').update({ 
      order_status: status, 
      shipping_details: { courier, trackingId } 
    }).eq('id', orderId);

    if (error) throw error;
    res.json({ success: true, message: 'Registry Protocol Updated' });
  } catch (error) { res.status(500).json({ error: 'Atelier Feed Blocked' }); }
});

app.use('/api/orders', orderRouter);

// 🛠️ Hub Mount: Legacy Routing Removal
// For now, I'll redirect Product/Auth routes to Supabase logic directly here or rewrite routes files.
// Let's rewrite the Routes files in a moment.

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ATELIER HUB LIVE ON PORT ${PORT} (SUPABASE CORE)`);
});
