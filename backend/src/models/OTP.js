const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    default: Date.now,
    index: { expires: '5m' } // Automatically delete after 5 minutes
  }
});

module.exports = mongoose.model('OTP', otpSchema);
