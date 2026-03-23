const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// SEND OTP (Instant Hub Protocol)
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone number required' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60000).toISOString();

    // Upsert into Supabase OTPs
    const { data: existing } = await supabase.from('otps').select('id').eq('phone', phone).single();
    if (existing) {
       await supabase.from('otps').update({ code, expires_at: expiresAt }).eq('phone', phone);
    } else {
       await supabase.from('otps').insert({ phone, code, expires_at: expiresAt });
    }

    console.log(`[AUTH-HUB-MOCK] OTP for ${phone} is ${code}`);
    res.status(200).json({ message: 'OTP sent successfully', mockOTP: code });
  } catch (error) {
    res.status(500).json({ error: 'Supabase Auth Blocked' });
  }
});

// VERIFY OTP (Instant Hub Verification)
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) return res.status(400).json({ message: 'Phone and code required' });

    const { data: otpRecord, error } = await supabase.from('otps').select('*').eq('phone', phone).eq('code', code).single();
    if (!otpRecord || new Date(otpRecord.expires_at) < new Date()) {
       return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Find or create user in Supabase
    let { data: user } = await supabase.from('users').select('*').eq('phone', phone).single();
    if (!user) {
       const { data: newUser } = await supabase.from('users').insert({ phone }).select().single();
       user = newUser;
    }

    // Delete used OTP
    await supabase.from('otps').delete().eq('phone', phone).eq('code', code);

    res.status(200).json({ 
      message: 'Login successful', 
      user: { 
        id: user.id, 
        phone: user.phone, 
        name: user.name || 'Atelier Member' 
      },
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' // Hardcoded mock token for now
    });
  } catch (error) {
    res.status(500).json({ error: 'Verification Hub Failure' });
  }
});

module.exports = router;
