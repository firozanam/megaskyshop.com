import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { sendOrderConfirmationEmail, sendAdminOrderNotificationEmail } from '@/lib/mailer';

export async function POST(request) {
    try {
        const db = await getDatabase();
        const session = await getServerSession(authOptions);
        const { name, shippingAddress, mobile, items, total, email, status, userId } = await request.json();

        console.log('Received order data:', { name, shippingAddress, mobile, items, total, email, status, userId });

        // Fetch product details for each item
        const itemsWithDetails = await Promise.all(items.map(async (item) => {
            const product = await db.collection('products').findOne({ _id: new ObjectId(item.id) });
            return {
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                image: item.image
            };
        }));

        const order = {
            userId: userId || null,
            name,
            email,
            shippingAddress,
            mobile,
            items: itemsWithDetails,
            total,
            status: status || 'Pending',
            createdAt: new Date()
        };

        const result = await db.collection('orders').insertOne(order);
        const newOrder = { ...order, _id: result.insertedId };

        let emailErrors = [];

        // Send order confirmation email to customer
        if (email) {
            try {
                await sendOrderConfirmationEmail(newOrder);
            } catch (emailError) {
                console.error('Failed to send order confirmation email:', emailError);
                emailErrors.push('Failed to send order confirmation email');
            }
        }

        // Send order notification email to admin
        try {
            await sendAdminOrderNotificationEmail(newOrder);
        } catch (emailError) {
            console.error('Failed to send admin order notification email:', emailError);
            emailErrors.push('Failed to send admin order notification email');
        }

        return NextResponse.json({ 
            message: 'Order created successfully', 
            orderId: result.insertedId,
            emailErrors: emailErrors.length > 0 ? emailErrors : undefined
        });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ error: 'Failed to create order', details: error.message }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        const db = await getDatabase();
        const orders = await db.collection('orders')
            .find({ userId: session.user.id })
            .sort({ createdAt: -1 })
            .toArray();

        // Check if each product in the order has been reviewed
        const productsWithReviews = await db.collection('products')
            .find({ 'reviews.userId': new ObjectId(session.user.id) })
            .project({ _id: 1 })
            .toArray();

        const reviewedProductIds = new Set(productsWithReviews.map(p => p._id.toString()));

        const ordersWithReviewInfo = orders.map(order => ({
            ...order,
            items: order.items.map(item => ({
                ...item,
                reviewed: reviewedProductIds.has(item.id)
            }))
        }));

        return NextResponse.json({ orders: ordersWithReviewInfo });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
