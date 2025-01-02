import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const term = searchParams.get('term');
        const category = searchParams.get('category');
        const sortBy = searchParams.get('sortBy');

        let query = {};
        if (term) {
            query.$or = [
                { name: { $regex: term, $options: 'i' } },
                { description: { $regex: term, $options: 'i' } },
            ];
        }
        if (category) {
            query.category = category;
        }

        let sort = {};
        if (sortBy === 'price_asc') {
            sort.price = 1;
        } else if (sortBy === 'price_desc') {
            sort.price = -1;
        } else {
            sort.name = 1;
        }

        const products = await Product.find(query).sort(sort);
        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}