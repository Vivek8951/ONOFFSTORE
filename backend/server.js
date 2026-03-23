const dns = require('dns');
// 💡 CLOUD-HARDENED DNS: Force IPv4 and use Google Resolvers (8.8.8.8)
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Razorpay = require('razorpay');
const nodemailer = require('nodemailer');
const { Resend } = require('resend');

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

// 3.5. Digital Dispatch Hub (Resend API)
// 💡 CLOUD-NATIVE: Using HTTP API instead of SMTP to bypass Render port blocks.
const resend = new Resend(process.env.RESEND_API_KEY || 're_FnttV3RD_5qPELZ2AXQ87r4vA8CtBGysQ');

console.log('✅ ATELIER DISPATCH HUB READY (Resend API Initialized)');


const sendOrderConfirmation = (order) => {
  setImmediate(async () => {
    try {
      console.log(`[ORDER SIGNAL] Deep processing email for Order: ${order._id}`);
      const fileName = `SMARTON_INVOICE_${order._id.toString().slice(-6).toUpperCase()}.pdf`;
      
      const pdfStream = new stream.PassThrough();
      generateInvoicePDF(order, pdfStream);

      const pdfBuffer = await new Promise((resolve, reject) => {
        const chunks = [];
        pdfStream.on('data', chunk => chunks.push(chunk));
        pdfStream.on('end', () => resolve(Buffer.concat(chunks)));
        pdfStream.on('error', reject);
      });

      const { data, error } = await resend.emails.send({
        from: 'SMARTON ATELIER <onboarding@resend.dev>', // 💡 TIP: Verify your domain in Resend for custom email
        to: order.customerDetails?.email || 'vicvivek9@gmail.com',
        subject: `Order Confirmed & Digital Bill: #${order._id.toString().slice(-6).toUpperCase()}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 30px; border-radius: 10px; background: #fff;">
            <h1 style="text-transform: uppercase; letter-spacing: 5px; text-align: center; color: #000;">SMARTON</h1>
            <p style="text-align: center; font-size: 10px; tracking: 2px; color: #888;">BY ONOFF STORE</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
            <h2 style="font-size: 14px; text-transform: uppercase;">Purchase Confirmation</h2>
            <p>Dear <b>${order.customerDetails?.name || 'Valued Member'}</b>,</p>
            <p>Your luxury pieces from SMARTON have been confirmed. We have attached your **Official Digital Bill** as a PDF to this email.</p>
            
            <div style="background: #fbfbfb; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #f0f0f0;">
              <p style="margin: 5px 0; font-size: 12px; color: #333;"><b>Order ID:</b> #${order._id.toString().slice(-8).toUpperCase()}</p>
              <p style="margin: 5px 0; font-size: 12px; color: #8b0000;"><b>Amount Paid:</b> ₹${order.totalAmount}</p>
            </div>

            <p style="font-size: 12px; color: #666; font-style: italic;">Thank you for your refined choice.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="font-size: 10px; color: #aaa; text-align: center; text-transform: uppercase; letter-spacing: 2px;">© ${new Date().getFullYear()} SMARTON WORLDWIDE • ATELIER DISPATCH</p>
          </div>
        `,
        attachments: [
          {
            filename: fileName,
            content: pdfBuffer,
          },
        ],
      });

      if (error) throw error;

      console.log('[ORDER SIGNAL] Digital Bill successfully dispatched via Resend API.');
      await mongoose.model('Order').findByIdAndUpdate(order._id, { $push: { systemLogs: `SECURE DISPATCHED: ${new Date().toLocaleTimeString()} (API)` } });
    } catch (err) {
      console.error('[ORDER SIGNAL] API Transmission Failed:', err.message);
      
      // Detailed logging for the Admin to see
      let errorMsg = err.message;
      if (err.message.includes('authorized')) {
        errorMsg = "RESEND: Verify your domain/email in Resend Dashboard to send to customers.";
      }
      
      await mongoose.model('Order').findByIdAndUpdate(order._id, { $push: { systemLogs: `API ERROR: ${errorMsg}` } });
    }
  });
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

    // 💡 ATELIER INVENTORY HUB: Decrement stock for purchased items
    try {
      for (const item of items) {
        const product = await mongoose.model('Product').findById(item.product);
        if (product && product.stock > 0) {
          product.stock = Math.max(0, product.stock - (item.quantity || 1));
          await product.save();
        }
      }
    } catch (stockErr) {
      console.warn('⚠️ Stock adjustment deferred:', stockErr.message);
    }

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
      // Send confirmation email background
      sendOrderConfirmation(newOrder);
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
    
    // 💡 SECURE BYPASS: Recognize local/demo verification signals
    if (razorpay_order_id && razorpay_order_id.startsWith('demo_')) {
      console.log('⚡ Local/Demo Verification Signal:', razorpay_order_id);
      return res.json({ success: true, message: 'Demo verification complete.' });
    }

    const order = await Order.findOne({ 'paymentDetails.razorpayOrderId': razorpay_order_id });
    if (!order) {
       console.error('❌ Order Lost During Verification:', razorpay_order_id);
       return res.status(404).json({ error: 'Signal Lost: Order matching this ID not found.' });
    }
    
    order.paymentDetails.status = 'Completed';
    order.paymentDetails.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // 📧 Trigger Order Confirmation Email (Real-time background)
    sendOrderConfirmation(order);

    res.json({ success: true, message: 'Payment verified and order confirmed!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin: Resend Invoice via Email (Supports Sandbox Mode for Dummy IDs)
orderRouter.post('/resend-invoice', async (req, res) => {
  const rid = Math.random().toString(36).slice(2, 7).toUpperCase();
  console.log(`[${rid}] ⚡ INCOMING: Resend Invoice for ${req.body.orderId}`);
  console.time(`[${rid}] TRACE`);

  try {
    const { orderId, overrideEmail } = req.body;
    let order;
    const sanitizedOrderId = (orderId || '').toString().trim().replace(/^#/, '');

    console.time(`[${rid}] MD_FIND`);
    if (!mongoose.Types.ObjectId.isValid(sanitizedOrderId)) {
       console.log(`[${rid}] Sandbox Mode Detected`);
       order = {
         _id: sanitizedOrderId || 'sandbox-'+Date.now(),
         createdAt: new Date(),
         totalAmount: 9999, 
         customerDetails: {
           name: 'Sandbox Tester',
           email: overrideEmail || 'vivek@example.com',
           phone: '0000000000',
           address: 'LIVE TEST LOCATION, SMARTON'
         },
         items: [{ name: 'MOCK LUXURY ITEM', quantity: 1, price: 9999 }]
       };
    } else {
       order = await Order.findById(sanitizedOrderId);
       if (order && overrideEmail) order.customerDetails.email = overrideEmail;
    }
    console.timeEnd(`[${rid}] MD_FIND`);

    if (!order) {
      console.timeEnd(`[${rid}] TRACE`);
      return res.status(404).json({ error: 'Order signal not found in database registry.' });
    }

    // 🔥 PURE FIRE-AND-FORGET
    console.log(`[${rid}] Queuing email background task...`);
    sendOrderConfirmation(order); // Non-blocking
    
    console.timeEnd(`[${rid}] TRACE`);
    return res.json({ 
      success: true, 
      message: `Atelier Hub: Digital Invoice queued for ${overrideEmail || order.customerDetails?.email}`,
      traceId: rid 
    });
  } catch (err) {
    console.timeEnd(`[${rid}] TRACE`);
    console.error(`[${rid}] Hub Exception:`, err.message);
    res.status(500).json({ success: false, error: 'Hub transmission failure: ' + err.message });
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

// Admin: Toggle Archive Signal
orderRouter.put('/:id/archive', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order Signal Missing' });
    order.isArchived = !order.isArchived;
    await order.save();
    res.json({ success: true, isArchived: order.isArchived });
  } catch (error) {
    res.status(500).json({ error: 'Archive Logic Failure' });
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


