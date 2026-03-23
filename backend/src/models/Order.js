const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  // user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional for guest checkout
  customerDetails: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true }
  },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    size: { type: String, default: 'M' }
  }],
  totalAmount: { type: Number, required: true },
  paymentDetails: {
    razorpayOrderId: String,
    razorpayPaymentId: String,
    status: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' }
  },
  orderStatus: { type: String, enum: ['Pending', 'Accepted', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
  shippingDetails: {
    courier: String,
    trackingId: String
  },
  isArchived: { type: Boolean, default: false },
  systemLogs: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
