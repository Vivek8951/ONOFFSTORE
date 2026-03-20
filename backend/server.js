require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Razorpay = require('razorpay');

// Route imports
const productRoutes = require('./src/routes/productRoutes');
const Order = require('./src/models/Order');

const app = express();

app.use(cors());
app.use(express.json());

// 1. Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/onoff_store')
  .then(() => console.log('✅ Connected to MongoDB (ONOFF Store Database)'))
  .catch(err => console.error('MongoDB connection error:', err));


// 2. Razorpay Initialization
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_onoff_fallback',
  key_secret: process.env.RAZORPAY_SECRET || 'fallback_secret'
});


// 3. Mount Product Routes
app.use('/api/products', productRoutes);


// 4. Order & Payment Routes
const orderRouter = express.Router();

// User: Create an Order Intent (Checkout)
orderRouter.post('/create', async (req, res) => {
  try {
    const { items, customerDetails, totalAmount } = req.body;
    
    // Create an initial order in MongoDB as 'Pending'
    const newOrder = new Order({
      customerDetails,
      items,
      totalAmount
    });
    await newOrder.save();

    // Create a counterpart order in Razorpay
    const options = {
      amount: totalAmount * 100, // Razorpay takes paise (₹1 = 100 paise)
      currency: "INR",
      receipt: newOrder._id.toString()
    };
    
    const rzpOrder = await razorpay.orders.create(options);
    
    // Update DB with Razorpay Order ID for verification later
    newOrder.paymentDetails.razorpayOrderId = rzpOrder.id;
    await newOrder.save();

    res.json({ success: true, dbOrderId: newOrder._id, razorpayOrder: rzpOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Razorpay Webhook Callback (Post-payment)
orderRouter.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // IN PRODUCTION: Verify the signature using crypto!
    // const crypto = require('crypto'); ...
    
    // Update the local database order status to Completed
    const order = await Order.findOne({ 'paymentDetails.razorpayOrderId': razorpay_order_id });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    order.paymentDetails.status = 'Completed';
    order.paymentDetails.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // 🔔 Real-time Admin Notification Trigger Stub (e.g. Socket.io emission here)
    console.log(`[ONOFF ADMIN ALERT] 🚨 New paid order received! Order ID: ${order._id}`);

    res.json({ success: true, message: 'Payment verified and order confirmed!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
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
app.listen(PORT, () => console.log(`🚀 ONOFF Backend Server running on port ${PORT}`));
