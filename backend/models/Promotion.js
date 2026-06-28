import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  badge: { type: String, required: true },
  icon: { type: String, required: true },
  category: { type: String, required: true },
  bannerColor: { type: String, required: true }, // Class names like f1, f2, f3, f4, f5, f6
  createdAt: { type: Date, default: Date.now }
});

const Promotion = mongoose.model('Promotion', promotionSchema);
export default Promotion;
