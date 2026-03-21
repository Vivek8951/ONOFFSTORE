require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const Order = require('./src/models/Order');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/onoff_store';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🌱 Connected for seeding...');

    // 🌪️ Clear Existing Data (Fresh Start)
    await Product.deleteMany({});
    // await Order.deleteMany({}); // Optional: Keep orders if you want

    // 📦 HIGH-FASHION PRODUCT ARCHIVE
    const products = [
      {
        name: "Oversized Parachute Cargo",
        slug: "parachute-cargo-black",
        description: "Industrial grade techear cargos with multiple utility pockets and adjustable cinched cuffs. Black obsidian finish.",
        price: 8499,
        category: "Ethnic", 
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800",
        hoverImage: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800",
        stock: 12,
        colors: ["#000000", "#1a1a1a"],
        isNewArrival: true
      },
      {
        name: "Vanguard Utility Jacket",
        slug: "vanguard-jacket-v1",
        description: "Heavyweight canvas jacket featuring modular pockets and waterproof zippers. Architectural fit.",
        price: 12999,
        category: "Fusion",
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800",
        hoverImage: "https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?w=800",
        stock: 5,
        colors: ["#2d2d2d"],
        isNewArrival: true
      },
      {
        name: "Cyber-Knit Monochrome Tee",
        slug: "cyber-knit-v9",
        description: "Precision-knit luxury cotton with a structured boxy silhouette. Signature monochromatic palette.",
        price: 4500,
        category: "Ethnic",
        image: "https://images.unsplash.com/photo-1558769132-cb1fac0840c2?w=800",
        hoverImage: "https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?w=800",
        stock: 25,
        colors: ["#ffffff", "#000000"],
        isNewArrival: false
      },
      {
        name: "Distressed Raw Denim",
        slug: "distressed-denim-01",
        description: "Hand-distressed raw Japanese denim with silver-tone hardware. Slim-straight luxury cut.",
        price: 15999,
        category: "Fusion",
        image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800",
        hoverImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800",
        stock: 8,
        colors: ["#0a0a0a"],
        isNewArrival: true
      }
    ];

    await Product.insertMany(products);
    console.log('✅ 4+ Premium Products Injected into Archive.');

    // 🛒 MOCK LOGISTICS ORDERS
    const mockOrder = {
      customerDetails: {
        name: "MEMBER_001",
        email: "onoff.fashion.hub@gmail.com",
        phone: "9876543210",
        address: "Private Residence, Mumbai Hub"
      },
      items: [{ name: "Oversized Parachute Cargo", quantity: 1, price: 8499 }],
      totalAmount: 8499,
      paymentDetails: {
        status: "Completed",
        razorpayPaymentId: "pay_mock_12345"
      }
    };

    const count = await Order.countDocuments();
    if(count === 0) {
      await Order.create(mockOrder);
      console.log('✅ Mock Order Signal Created for Admin Dashboard.');
    }

    console.log('🏁 SEEDING COMPLETE. The SMARTON World is now LIVE.');
    process.exit();
  } catch (err) {
    console.error('❌ Seeding Failed:', err.message);
    process.exit(1);
  }
};

seedData();
