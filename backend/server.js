require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Razorpay = require('razorpay');
const nodemailer = require('nodemailer');

// Route imports
const productRoutes = require('./src/routes/productRoutes');
const authRoutes = require('./src/routes/authRoutes');
const bannerRoutes = require('./src/routes/bannerRoutes');
const Order = require('./src/models/Order');

const app = express();

app.use(cors({
  origin: '*', // Allow all origins explicitly
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Increase body size limits for base64 images and invoice payloads
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Friendly payload error handler
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Payload too large. Please upload smaller files or send image URLs.' });
  }
  next(err);
});

// 1. Connect to MongoDB with Enhanced Stability
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/onoff_store';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB (SMARTON Database Ready)'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('💡 TIP: Check if your IP is whitelisted in MongoDB Atlas Network Security.');
  });


// 2. Razorpay Initialization
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_onoff_fallback',
  key_secret: process.env.RAZORPAY_SECRET || 'fallback_secret'
});


// 3. Mount Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/banners', bannerRoutes);


const { generateInvoicePDF } = require('./src/services/PDFService');
const stream = require('stream');

// 3.5. Email Service Setup (Nodemailer)
const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: { 
    user: process.env.EMAIL_USER, 
    // 💡 AUTO-CLEAN: Removes any spaces from the 16-digit App Password automatically
    pass: (process.env.EMAIL_PASS || '').replace(/\s/g, '') 
  }
});

const sendOrderConfirmation = async (order) => {
  try {
    const fileName = `SMARTON_INVOICE_${order._id.toString().slice(-6).toUpperCase()}.pdf`;
    
    // 💡 PDF STREAM SETUP
    const pdfStream = new stream.PassThrough();
    generateInvoicePDF(order, pdfStream);

    const pdfBuffer = await new Promise((resolve, reject) => {
      const chunks = [];
      pdfStream.on('data', chunk => chunks.push(chunk));
      pdfStream.on('end', () => resolve(Buffer.concat(chunks)));
      pdfStream.on('error', reject);
    });

    const mailOptions = {
      from: `"SMARTON BY ONOFF" <${process.env.EMAIL_USER}>`,
      to: order.customerDetails.email,
      subject: `Order Confirmed & Digital Bill: #${order._id.toString().slice(-6).toUpperCase()}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 30px; border-radius: 10px;">
          <h1 style="text-transform: uppercase; letter-spacing: 5px; text-align: center; color: #000;">SMARTON</h1>
          <p style="text-align: center; font-size: 10px; tracking: 2px; color: #888;">BY ONOFF STORE</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
          <h2 style="font-size: 14px; text-transform: uppercase;">Purchase Confirmation</h2>
          <p>Dear <b>${order.customerDetails.name}</b>,</p>
          <p>Your luxury pieces from SMARTON have been confirmed. We have attached your **Official Digital Bill** as a PDF to this email.</p>
          
          <div style="background: #fcfcfc; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0; font-size: 12px;"><b>Order ID:</b> ${order._id}</p>
            <p style="margin: 5px 0; font-size: 12px;"><b>Amount Paid:</b> ₹${order.totalAmount}</p>
          </div>

          <p style="font-size: 12px; color: #666; font-style: italic;">Thank you for your refined choice.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="font-size: 10px; color: #aaa; text-align: center; text-transform: uppercase; letter-spacing: 1px;">© ${new Date().getFullYear()} SMARTON WORLDWIDE • MUMBAI</p>
        </div>
      `,
      attachments: [{ filename: fileName, content: pdfBuffer }]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Premium Invoice & PDF Sent:', info.messageId);
  } catch (err) {
    console.log('⚠️ Failed to send PDF email. Service might be unconfigured.');
    console.error('Error:', err.message);
  }
};


// 4. Order & Payment Routes
const orderRouter = express.Router();

// User: Create an Order Intent (Checkout)
orderRouter.post('/create', async (req, res) => {
  try {
    const { items, customerDetails, totalAmount } = req.body;
    
    // 1. Save order to MongoDB first — always succeeds
    const newOrder = new Order({
      customerDetails,
      items,
      totalAmount,
      orderStatus: 'Pending',
      'paymentDetails.status': 'Pending'
    });
    await newOrder.save();

    // 2. Try Razorpay — skip gracefully if keys are not configured
    let rzpOrder = null;
    const hasRealKeys = process.env.RAZORPAY_KEY_ID && 
                        !process.env.RAZORPAY_KEY_ID.includes('fallback') && 
                        !process.env.RAZORPAY_KEY_ID.includes('test_onoff');
    if (hasRealKeys) {
      try {
        rzpOrder = await razorpay.orders.create({
          amount: totalAmount * 100,
          currency: 'INR',
          receipt: newOrder._id.toString()
        });
        newOrder.paymentDetails.razorpayOrderId = rzpOrder.id;
        await newOrder.save();
      } catch (rzpErr) {
        console.warn('⚠️ Razorpay skipped:', rzpErr.message);
      }
    }

    // 3. Auto-confirm payment for demo/dev mode (no real Razorpay)
    if (!rzpOrder) {
      newOrder.paymentDetails.status = 'Completed';
      newOrder.orderStatus = 'Pending'; // Admin still needs to accept
      await newOrder.save();
      // Send confirmation email
      try { await sendOrderConfirmation(newOrder); } catch(e) { console.warn('Email skipped:', e.message); }
    }

    res.json({ success: true, dbOrderId: newOrder._id, razorpayOrder: rzpOrder });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Razorpay Webhook Callback (Post-payment)
orderRouter.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id } = req.body;
    
    const order = await Order.findOne({ 'paymentDetails.razorpayOrderId': razorpay_order_id });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    order.paymentDetails.status = 'Completed';
    order.paymentDetails.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // 📧 Trigger Order Confirmation Email (Real-time)
    await sendOrderConfirmation(order);

    res.json({ success: true, message: 'Payment verified and order confirmed!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin: Resend Invoice via Email (Supports Sandbox Mode for Dummy IDs)
orderRouter.post('/resend-invoice', async (req, res) => {
  console.log('📧 Resend invoice request received:', req.body);
  try {
    const { orderId, overrideEmail } = req.body;
    let order;
    const sanitizedOrderId = (orderId || '').toString().trim().replace(/^#/, '');

    console.log('Processing orderId:', sanitizedOrderId, 'overrideEmail:', overrideEmail);

    if (!mongoose.Types.ObjectId.isValid(sanitizedOrderId)) {
       console.log(`[SANDBOX] Generating Mock PDF for Dummy ID: ${sanitizedOrderId}`);
       order = {
         _id: sanitizedOrderId || 'sandbox-'+Date.now(),
         createdAt: new Date(),
         totalAmount: 9999, 
         customerDetails: {
           name: 'Sandbox Tester',
           email: overrideEmail || 'vivek@example.com', // Prefer override
           phone: '0000000000',
           address: 'FASHION TEST HUB, SMARTON'
         },
         items: [{ name: 'MOCK LUXURY ITEM', quantity: 1, price: 9999 }]
       };
    } else {
       order = await Order.findById(orderId);
       // Allow overriding email even for real orders
       if (order && overrideEmail) order.customerDetails.email = overrideEmail;
    }

    if (!order) return res.status(404).json({ error: 'Order not found' });

    await sendOrderConfirmation(order);
    res.json({ success: true, message: `Digital Invoice sent to ${overrideEmail || order.customerDetails?.email}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin: Get all orders
// Admin: Update Status & Logistics
orderRouter.put('/:id/status', async (req, res) => {
  try {
    const { status, courier, trackingId } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Signal Lost: Order Not Found' });

    if (status) order.orderStatus = status;
    if (courier) {
      if (!order.shippingDetails) order.shippingDetails = {};
      order.shippingDetails.courier = courier;
    }
    if (trackingId) {
      if (!order.shippingDetails) order.shippingDetails = {};
      order.shippingDetails.trackingId = trackingId;
    }

    await order.save();
    res.json({ success: true, message: `Order Protocol Updated: ${status}` });
  } catch (error) {
    res.status(500).json({ error: 'Backend Transmission Failed' });
  }
});

// Admin: Get all orders
orderRouter.get('/admin/all', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.use('/api/orders', orderRouter);

// 5. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 ONOFF Backend Server running on port ${PORT} (Global Hub Open)`));


