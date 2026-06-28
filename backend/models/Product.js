import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  oldPrice: { type: Number },
  rating: { type: Number, default: 5 },
  stars: { type: String, default: '★★★★★' },
  image: { type: String, required: true }, // Holds Cloudinary URL
  badge: { type: String },
  badgeType: { type: String }, // 'sale' or 'new'
  stock: { type: Number, required: true, default: 0 },
  reviews: { type: Number, default: 0 },
  description: { type: String },
  specs: { type: Map, of: String },
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);
export default Product;
