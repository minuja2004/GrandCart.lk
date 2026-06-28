import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Models
import Product from './models/Product.js';
import User from './models/User.js';
import Order from './models/Order.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected Successfully!');
    // Seed initial products if none exist
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('Product database is empty. Seeding initial tech products...');
      await Product.insertMany(SEED_PRODUCTS);
      console.log('Initial products seeded successfully!');
    }
  })
  .catch(err => console.error('MongoDB Connection Error:', err));

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer in-memory storage for Cloudinary streaming uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ==========================================
// 1. UPLOAD ROUTE (Cloudinary Integration)
// ==========================================
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  // Upload to Cloudinary using upload_stream
  const uploadStream = cloudinary.uploader.upload_stream(
    { folder: 'grandcart-tech' },
    (error, result) => {
      if (error) {
        console.error('Cloudinary Upload Error:', error);
        return res.status(500).json({ message: 'Cloudinary upload failed.', error });
      }
      res.json({ url: result.secure_url });
    }
  );

  uploadStream.end(req.file.buffer);
});

// ==========================================
// 2. PRODUCTS API ROUTES
// ==========================================
// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving products.', error });
  }
});

// Add product
app.post('/api/products', async (req, res) => {
  try {
    const { name, brand, category, price, oldPrice, image, stock, description, specs } = req.body;
    
    const newProduct = new Product({
      name,
      brand,
      category,
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : undefined,
      image,
      stock: Number(stock),
      description,
      specs: specs || {}
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: 'Error listing product.', error });
  }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
  try {
    const { name, brand, category, price, oldPrice, image, stock, description, specs } = req.body;
    
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        brand,
        category,
        price: Number(price),
        oldPrice: oldPrice ? Number(oldPrice) : undefined,
        image,
        stock: Number(stock),
        description,
        specs
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: 'Error updating product.', error });
  }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product.', error });
  }
});

// ==========================================
// 3. AUTH API ROUTES
// ==========================================
// User Signup
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email address already registered.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      password: passwordHash
    });

    await newUser.save();

    // Create Token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user.', error });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials. Incorrect password.' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in.', error });
  }
});

// ==========================================
// 4. ORDERS API ROUTES
// ==========================================
// Create Order
app.post('/api/orders', async (req, res) => {
  try {
    const { orderId, items, customerDetails, paymentMethod, subtotal, deliveryFee, discount, total } = req.body;

    const newOrder = new Order({
      orderId,
      items,
      customerDetails,
      paymentMethod,
      subtotal,
      deliveryFee,
      discount,
      total
    });

    // Reduce product stocks reactively
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity }
      });
    }

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: 'Error processing order.', error });
  }
});

// Get all orders (for Seller portal)
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving orders.', error });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Express API Server running on port ${PORT}`);
});

// ==========================================
// INITIAL DATABASE SEED PRODUCTS
// ==========================================
const SEED_PRODUCTS = [
  {
    name: "MacBook Pro 14\" M3 Max (16-Core CPU, 40-Core GPU, 48GB RAM, 1TB SSD)",
    brand: "Apple",
    category: "Laptops",
    price: 945000,
    oldPrice: 995000,
    rating: 5,
    stars: "★★★★★",
    image: "💻",
    badge: "New",
    badgeType: "new",
    stock: 8,
    reviews: 14,
    description: "The Apple MacBook Pro 14-inch with M3 Max chip is the ultimate powerhouse for developers, creators, and professionals. Features a stunning Liquid Retina XDR display, up to 18 hours of battery life, and unparalleled processing speed.",
    specs: {
      "Processor": "Apple M3 Max (16-Core CPU)",
      "Graphics": "40-Core GPU",
      "Memory": "48GB Unified Memory",
      "Storage": "1TB Superfast SSD",
      "Display": "14.2\" Liquid Retina XDR (3024 x 1964)",
      "Battery": "Up to 18 hours",
      "Warranty": "1 Year Apple Care Warranty"
    }
  },
  {
    name: "iPhone 15 Pro Max 256GB - Natural Titanium",
    brand: "Apple",
    category: "Smartphones",
    price: 369000,
    oldPrice: 395000,
    rating: 5,
    stars: "★★★★★",
    image: "📱",
    badge: "-7%",
    badgeType: "sale",
    stock: 12,
    reviews: 42,
    description: "Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever with 5x optical zoom.",
    specs: {
      "Processor": "Apple A17 Pro Chip",
      "Camera": "48MP Main | 12MP Ultra-Wide | 12MP 5x Telephoto",
      "Memory": "8GB RAM | 256GB NVMe",
      "Display": "6.7\" Super Retina XDR OLED with ProMotion",
      "Battery": "Up to 29 hours video playback",
      "Weight": "221g",
      "Warranty": "1 Year Genxt Warranty"
    }
  },
  {
    name: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    brand: "Sony",
    category: "Audio",
    price: 98000,
    oldPrice: 115000,
    rating: 4,
    stars: "★★★★☆",
    image: "🎧",
    badge: "Popular",
    badgeType: "new",
    stock: 15,
    reviews: 88,
    description: "The Sony WH-1000XM5 headphones rewrite the rules for distraction-free listening. Two processors control 8 microphones for unprecedented noise cancelling and exceptional call quality.",
    specs: {
      "Connectivity": "Bluetooth 5.2 | Wired 3.5mm",
      "Battery Life": "Up to 30 Hours (ANC On) | 40 Hours (ANC Off)",
      "Noise Cancelling": "Industry-leading Dual Processor Auto NC Optimizer",
      "Drivers": "30mm specially designed driver unit",
      "Charging": "USB-C Power Delivery Quick Charge (3 mins for 3 hrs)",
      "Warranty": "6 Months Seller Warranty"
    }
  },
  {
    name: "PlayStation 5 Slim Digital Edition",
    brand: "Sony",
    category: "Gaming",
    price: 165000,
    oldPrice: 185000,
    rating: 5,
    stars: "★★★★★",
    image: "🎮",
    badge: "Sale",
    badgeType: "sale",
    stock: 5,
    reviews: 56,
    description: "Experience lightning-fast loading with an ultra-high-speed SSD, deeper immersion with support for haptic feedback, adaptive triggers, and 3D Audio, and an all-new generation of incredible PlayStation games.",
    specs: {
      "Processor": "AMD Ryzen Zen 2 (8-Core)",
      "Graphics": "AMD Radeon RDNA 2-based graphics engine",
      "Memory": "16GB GDDR6",
      "Storage": "1TB Custom SSD",
      "Resolution": "Support for 4K 120Hz TVs, 8K TVs, VRR",
      "Warranty": "1 Year Agent Warranty"
    }
  },
  {
    name: "ASUS ROG Zephyrus G14 Gaming Laptop",
    brand: "ASUS",
    category: "Laptops",
    price: 545000,
    oldPrice: 585000,
    rating: 5,
    stars: "★★★★★",
    image: "💻",
    badge: "Hot Buy",
    badgeType: "new",
    stock: 4,
    reviews: 19,
    description: "Powerful, portable, and versatile. The ASUS ROG Zephyrus G14 features a stunning Nebula HDR display, AMD Ryzen 9 processor, and NVIDIA GeForce RTX 4070 GPU for incredible gaming and multitasking performance.",
    specs: {
      "Processor": "AMD Ryzen 9 8945HS",
      "Graphics": "NVIDIA GeForce RTX 4070 8GB GDDR6",
      "Memory": "32GB LPDDR5X",
      "Storage": "1TB PCIe 4.0 NVMe M.2 SSD",
      "Display": "14\" QHD+ 120Hz ROG Nebula Display",
      "Weight": "1.50 kg",
      "Warranty": "2 Years ASUS Global Warranty"
    }
  },
  {
    name: "Samsung Galaxy S24 Ultra 5G 512GB - Titanium Black",
    brand: "Samsung",
    category: "Smartphones",
    price: 385000,
    oldPrice: 410000,
    rating: 5,
    stars: "★★★★★",
    image: "📱",
    badge: "New",
    badgeType: "new",
    stock: 10,
    reviews: 29,
    description: "Welcome to the era of mobile AI. With Galaxy S24 Ultra in your hands, you can unleash whole new levels of creativity, productivity, and possibility, starting with the most important device in your life.",
    specs: {
      "Processor": "Snapdragon 8 Gen 3 for Galaxy",
      "Camera": "200MP Main | 50MP Periscope | 12MP Ultra-Wide | 10MP Tele",
      "S-Pen": "Included (Embedded in body)",
      "Display": "6.8\" Dynamic AMOLED 2X, QHD+, 120Hz",
      "Battery": "5000mAh with 45W Fast Charging",
      "Warranty": "1 Year Samsung Company Warranty"
    }
  }
];
