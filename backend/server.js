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
import Promotion from './models/Promotion.js';
import ChatMessage from './models/ChatMessage.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Token Authenticator Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access Denied: No Token Provided' });

  jwt.verify(token, process.env.JWT_SECRET || 'grandcart-secret-key-2026', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or Expired Token' });
    req.user = user;
    next();
  });
};

// MongoDB Connection & Seeding
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected Successfully!');
    
    // Seed initial products if none exist
    const prodCount = await Product.countDocuments();
    if (prodCount === 0) {
      console.log('Product database is empty. Seeding initial tech products...');
      const seedWithStatus = SEED_PRODUCTS.map(p => ({
        ...p,
        status: 'approved',
        storeName: 'GrandCart Official'
      }));
      await Product.insertMany(seedWithStatus);
      console.log('Initial products seeded successfully!');
    }

    // Seed initial promotions if none exist
    const promoCount = await Promotion.countDocuments();
    if (promoCount === 0) {
      console.log('Promotion database is empty. Seeding initial flyer promotions...');
      await Promotion.insertMany(SEED_PROMOTIONS);
      console.log('Initial promotions seeded successfully!');
    }

    // Seed default administrator if none exist
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      console.log('No admin found. Seeding default admin account...');
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('admin123', salt);
      const defaultAdmin = new User({
        firstName: 'System',
        lastName: 'Admin',
        email: 'admin@grandcart.lk',
        phone: '+94 11 234 5678',
        password: passwordHash,
        role: 'admin',
        storeName: 'GrandCart Head Office'
      });
      await defaultAdmin.save();
      console.log('Default admin seeded: admin@grandcart.lk / admin123');
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
// Get all APPROVED products (for customer store catalog)
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({ status: 'approved' }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving products.', error });
  }
});

// Get seller-scoped products
app.get('/api/products/seller', authenticateToken, async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.user.id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving seller products.', error });
  }
});

// Get all products (for Admin review console)
app.get('/api/products/admin', authenticateToken, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving admin products.', error });
  }
});

// Add product (Sellers get pending, Admin gets auto-approved)
app.post('/api/products', authenticateToken, async (req, res) => {
  try {
    const { name, brand, category, price, oldPrice, image, stock, description, specs } = req.body;
    
    // Determine seller and status details
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User profile not found.' });

    const isAdm = user.role === 'admin';
    
    const newProduct = new Product({
      name,
      brand,
      category,
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : undefined,
      image,
      stock: Number(stock),
      description,
      specs: specs || {},
      sellerId: user._id,
      status: isAdm ? 'approved' : 'pending',
      storeName: user.role === 'seller' ? user.storeName : 'GrandCart Official'
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: 'Error listing product.', error });
  }
});

// Update product (re-review if seller edits)
app.put('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const { name, brand, category, price, oldPrice, image, stock, description, specs } = req.body;
    const user = await User.findById(req.user.id);

    const isAdm = user && user.role === 'admin';

    // If not admin, verify ownership
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    
    if (!isAdm && product.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized action on listing.' });
    }
    
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
        specs,
        status: isAdm ? product.status : 'pending' // Sellers trigger pending re-review
      },
      { new: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: 'Error updating product.', error });
  }
});

// Admin Review Product (Approve/Reject)
app.put('/api/products/:id/review', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Administrators only.' });
    }

    const { status } = req.body; // 'approved' or 'rejected'
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid review status value.' });
    }

    const reviewedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!reviewedProduct) return res.status(404).json({ message: 'Product not found.' });
    res.json(reviewedProduct);
  } catch (error) {
    res.status(400).json({ message: 'Error reviewing product.', error });
  }
});

// Delete product
app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    const isAdm = user && user.role === 'admin';
    if (!isAdm && product.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized action.' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product.', error });
  }
});

// ==========================================
// 3. AUTH API ROUTES
// ==========================================
// Customer Signup
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email address already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      password: passwordHash,
      role: 'customer'
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET || 'grandcart-secret-key-2026', { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user.', error });
  }
});

// Seller Signup
app.post('/api/auth/seller/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, storeName } = req.body;
    
    if (!storeName) return res.status(400).json({ message: 'Store Name is required.' });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email address already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      password: passwordHash,
      role: 'seller',
      storeName
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET || 'grandcart-secret-key-2026', { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        storeName: newUser.storeName
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering seller.', error });
  }
});

// General Login (Enforces block checks and role details)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, requiredRole } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials. User not found.' });
    }

    // Role gate enforcement (if specified)
    if (requiredRole && user.role !== requiredRole) {
      return res.status(403).json({ message: `Access denied. Authorized ${requiredRole}s only.` });
    }

    // Suspension check
    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been suspended by administration.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials. Incorrect password.' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'grandcart-secret-key-2026', { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        storeName: user.storeName
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

// Get seller-filtered orders
app.get('/api/orders/seller', authenticateToken, async (req, res) => {
  try {
    // Find all products of this seller
    const sellerProds = await Product.find({ sellerId: req.user.id });
    const sellerProdIds = sellerProds.map(p => p._id.toString());

    // Fetch all orders
    const orders = await Order.find().sort({ createdAt: -1 });

    // Filter order items to only return this seller's products
    const filteredOrders = orders.map(order => {
      const orderObj = order.toObject();
      const myItems = orderObj.items.filter(item => sellerProdIds.includes(item.productId.toString()));
      if (myItems.length > 0) {
        return {
          ...orderObj,
          items: myItems,
          total: myItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        };
      }
      return null;
    }).filter(o => o !== null);

    res.json(filteredOrders);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving seller orders.', error });
  }
});

// Get all orders (for Admin portal)
app.get('/api/orders/admin', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving admin orders.', error });
  }
});

// ==========================================
// 5. PROMOTIONS API ROUTES
// ==========================================
app.get('/api/promotions', async (req, res) => {
  try {
    const promotions = await Promotion.find().sort({ createdAt: -1 });
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ message: 'Error loading promotions.', error });
  }
});

app.post('/api/promotions', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Admin access required.' });

    const newPromo = new Promotion(req.body);
    await newPromo.save();
    res.status(201).json(newPromo);
  } catch (error) {
    res.status(400).json({ message: 'Error saving promotion.', error });
  }
});

app.delete('/api/promotions/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Admin access required.' });

    await Promotion.findByIdAndDelete(req.params.id);
    res.json({ message: 'Promotion deleted.' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting promotion.', error });
  }
});

// ==========================================
// 6. ADMIN USER CONTROLS
// ==========================================
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Admin access required.' });

    const users = await User.find({ _id: { $ne: req.user.id } }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error loading users.', error });
  }
});

app.put('/api/admin/users/:id/block', authenticateToken, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (!admin || admin.role !== 'admin') return res.status(403).json({ message: 'Admin access required.' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: 'Error toggling user block status.', error });
  }
});

// ==========================================
// 7. CHAT SYSTEM ROUTES
// ==========================================
// Send message (block checks)
app.post('/api/chats/send', authenticateToken, async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    
    // Check block list between these users
    const blockedCheck = await ChatMessage.findOne({
      $or: [
        { senderId: req.user.id, receiverId, isBlocked: true },
        { senderId: receiverId, receiverId: req.user.id, isBlocked: true }
      ]
    });

    if (blockedCheck) {
      return res.status(403).json({ message: 'Messaging is suspended for this conversation thread.' });
    }

    const newMessage = new ChatMessage({
      senderId: req.user.id,
      receiverId,
      message
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(400).json({ message: 'Error sending message.', error });
  }
});

// Chat history between current user and another
app.get('/api/chats/history/:otherUserId', authenticateToken, async (req, res) => {
  try {
    const messages = await ChatMessage.find({
      $or: [
        { senderId: req.user.id, receiverId: req.params.otherUserId },
        { senderId: req.params.otherUserId, receiverId: req.user.id }
      ]
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving chat history.', error });
  }
});

// Get active conversations list
app.get('/api/chats/conversations', authenticateToken, async (req, res) => {
  try {
    const myId = new mongoose.Types.ObjectId(req.user.id);
    
    // Aggregate distinct contacts chatted with
    const messages = await ChatMessage.find({
      $or: [{ senderId: myId }, { receiverId: myId }]
    }).sort({ timestamp: -1 });

    const contactIds = new Set();
    messages.forEach(msg => {
      if (msg.senderId.toString() !== req.user.id) contactIds.add(msg.senderId.toString());
      if (msg.receiverId.toString() !== req.user.id) contactIds.add(msg.receiverId.toString());
    });

    // Populate contacts profile
    const contacts = await User.find({ _id: { $in: Array.from(contactIds) } }).select('firstName lastName storeName role');
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Error loading active chats.', error });
  }
});

// Admin chat monitor
app.get('/api/chats/admin/monitor', authenticateToken, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (!admin || admin.role !== 'admin') return res.status(403).json({ message: 'Admin access required.' });

    // Fetch all messages and populate sender/receiver profiles
    const messages = await ChatMessage.find()
      .populate('senderId', 'firstName lastName role email storeName')
      .populate('receiverId', 'firstName lastName role email storeName')
      .sort({ timestamp: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error monitoring chats.', error });
  }
});

// Admin toggle block conversation
app.put('/api/chats/admin/block', authenticateToken, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (!admin || admin.role !== 'admin') return res.status(403).json({ message: 'Admin access required.' });

    const { userA, userB, blockStatus } = req.body; // blockStatus is Boolean

    await ChatMessage.updateMany(
      {
        $or: [
          { senderId: userA, receiverId: userB },
          { senderId: userB, receiverId: userA }
        ]
      },
      { isBlocked: blockStatus }
    );

    res.json({ message: blockStatus ? 'Thread blocked successfully.' : 'Thread unblocked successfully.' });
  } catch (error) {
    res.status(400).json({ message: 'Error reviewing chat thread status.', error });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Express API Server running on port ${PORT}`);
});

// ==========================================
// INITIAL DATABASE SEED PRODUCTS
// ==========================================
const SEED_PROMOTIONS = [
  { title: "Pro Laptops", subtitle: "MacBooks & ROG Zephyrus", badge: "Save Rs. 50,000", icon: "💻", category: "Laptops", bannerColor: "f1" },
  { title: "Flagships", subtitle: "iPhone 15 Pro & S24 Ultra", badge: "New In", icon: "📱", category: "Smartphones", bannerColor: "f2" },
  { title: "ANC Audio", subtitle: "Sony XM5 & AirPods Pro", badge: "15% Off", icon: "🎧", category: "Audio", bannerColor: "f3" },
  { title: "Gaming Zone", subtitle: "PS5 Slim & Nintendo OLED", badge: "In Stock", icon: "🎮", category: "Gaming", bannerColor: "f4" },
  { title: "Smart Watches", subtitle: "Apple Watch Ultra 2 & Watch 6", badge: "Free Strap", icon: "⌚", category: "Wearables", bannerColor: "f5" },
  { title: "Accessories", subtitle: "Keychron Keyboards & MX Mice", badge: "Hot Pick", icon: "⌨️", category: "Accessories", bannerColor: "f6" }
];

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
