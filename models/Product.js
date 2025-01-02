import { Schema, model, models } from 'mongoose';

const ReviewSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    isAnonymous: { type: Boolean, default: false },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
}, { timestamps: true });

const ProductSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { 
        type: Number, 
        required: true,
        set: v => parseFloat(v).toFixed(2)  // Ensure price is always stored with 2 decimal places
    },
    image: { type: String, required: true },
    category: { type: String, required: true },
    featured: { type: Boolean, default: false },
    stock: { type: Number, required: true, default: 0 },
    reviews: [ReviewSchema],
}, { timestamps: true });

const Product = models.Product || model('Product', ProductSchema);

export default Product;

// Export a function to create a product object compatible with MongoDB driver
export function createProductObject(data) {
    return {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price).toFixed(2),
        image: data.image,
        category: data.category,
        featured: data.featured === true || data.featured === 'true',
        stock: parseInt(data.stock) || 0,
        reviews: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}
