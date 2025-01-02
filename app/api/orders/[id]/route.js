import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
    const db = await getDatabase();
    try {
        const order = await db.collection('orders').findOne({ _id: new ObjectId(params.id) });
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }
        return NextResponse.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const db = await getDatabase();
        const { status } = await request.json();

        const result = await db.collection('orders').updateOne(
            { _id: new ObjectId(params.id) },
            { $set: { status } }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Order status updated successfully' });
    } catch (error) {
        console.error('Failed to update order status:', error);
        return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
    }
}
