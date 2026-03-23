const express = require('express');
const supabase = require('../config/supabase');
const router = express.Router();

// Get active banners
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('banners').select('*').eq('active', true).order('id', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Supabase Feed Error' });
  }
});

// Admin: Get all banners
router.get('/admin/all', async (req, res) => {
  try {
    const { data, error } = await supabase.from('banners').select('*').order('id', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Supabase Feed Error' });
  }
});

// Admin: Add a new banner
router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('banners').insert(req.body).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Admin: Update Banner
router.put('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('banners').update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Admin: Delete a banner
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('banners').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, message: 'Banner Deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
