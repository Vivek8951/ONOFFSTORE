const express = require('express');
const router = express.Router();
const OTP = require('../models/OTP');
const User = require('../models/User');

// SIMULATE SEND OTP
router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: 'Phone number required' });

  // Generate a random 6-digit OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Save/Update OTP in DB
  await OTP.findOneAndUpdate(
    { phone },
    { code, expiresAt: new Date(Date.now() + 5 * 60000) }, // 5 mins from now
    { upsert: true }
  );

  // MOCK: In a real app, use Twilio or SMS Gupshup here
  // For the user to see the code, I'll log it to console and send it back also (for demo)
  console.log(`[AUTH-MOCK] OTP for ${phone} is ${code}`);

  res.status(200).json({ message: 'OTP sent successfully', mockOTP: code });
});

// VERIFY OTP
router.post('/verify-otp', async (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ message: 'Phone and code required' });

  const otpRecord = await OTP.findOne({ phone, code });

  if (!otpRecord) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  // Find or create user
  let user = await User.findOne({ phone });
  if (!user) {
    user = await User.create({ phone });
  }

  // Delete used OTP
  await OTP.deleteOne({ phone, code });

  // MOCK AUTH: In production, return a JWT (Token)
  res.status(200).json({ 
    message: 'Login successful', 
    user: { 
      id: user._id, 
      phone: user.phone, 
      name: user.name 
    },
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' // Hardcoded mock token for now
  });
});

module.exports = router;
