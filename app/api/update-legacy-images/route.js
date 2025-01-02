import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
    try {
        const db = await getDatabase();
        const Product = db.collection('products');

        const result = await Product.updateMany(
            { image: '/placeholder.jpg' },
            { $set: { image: '/images/placeholder.png' } }
        );

        return NextResponse.json({ message: 'Updated legacy image paths', modifiedCount: result.modifiedCount });
    } catch (error) {
        console.error('Error updating legacy image paths:', error);
        return NextResponse.json({ error: 'Failed to update legacy image paths' }, { status: 500 });
    }
}
