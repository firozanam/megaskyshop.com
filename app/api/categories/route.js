import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET() {
    try {
        await dbConnect();
        const categories = await Product.distinct('category');
        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
