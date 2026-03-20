const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  price: { type: Number, required: true }, // In INR
  category: { type: String, enum: ['Ethnic', 'Fusion', 'Accessories'], required: true },
  image: { type: String, required: true },
  hoverImage: { type: String },
  stock: { type: Number, default: 0 },
  colors: [{ type: String }],
  isNewArrival: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
