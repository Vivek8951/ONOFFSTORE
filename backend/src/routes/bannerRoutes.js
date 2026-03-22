const express = require('express');
const Banner = require('../models/Banner');
const router = express.Router();

// Get all banners
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find({ active: true }).sort({ createdAt: -1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Admin: Get all banners (including inactive)
router.get('/admin/all', async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Admin: Add a new banner
router.post('/', async (req, res) => {
  try {
    const newBanner = new Banner(req.body);
    const savedBanner = await newBanner.save();
    res.status(201).json(savedBanner);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Admin: Update Banner (New)
router.put('/:id', async (req, res) => {
  try {
    const updatedBanner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedBanner) return res.status(404).json({ error: 'Banner not found' });
    res.json(updatedBanner);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Admin: Delete a banner
router.delete('/:id', async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Banner Deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
