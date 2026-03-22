const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String, required: true },
  active: { type: Boolean, default: true },
  linkProductId: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Banner', BannerSchema);
