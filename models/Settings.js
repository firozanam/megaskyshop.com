import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
