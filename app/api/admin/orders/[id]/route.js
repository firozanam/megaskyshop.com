import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb'
import Order from '@/models/Order'

export async function PUT(req, { params }) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user.isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { status } = await req.json()

        await dbConnect()
        const order = await Order.findByIdAndUpdate(params.id, { status }, { new: true })

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        return NextResponse.json({ message: 'Order updated successfully', order })
    } catch (error) {
        console.error('Failed to update order:', error)
        return NextResponse.json({ error: 'Failed to update order', details: error.message }, { status: 500 })
    }
}

export async function GET(req, { params }) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user.isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        await dbConnect()
        const order = await Order.findById(params.id)
            .populate('user', 'name email')
            .populate('items.product', 'name image price')
        
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        // Serialize the order object
        const serializedOrder = {
            ...order.toObject(),
            _id: order._id.toString(),
            user: order.user ? {
                _id: order.user._id.toString(),
                name: order.user.name,
                email: order.user.email
            } : null,
            items: order.items.map(item => ({
                ...item.toObject(),
                _id: item._id.toString(),
                product: item.product ? {
                    _id: item.product._id.toString(),
                    name: item.product.name,
                    image: item.product.image,
                    price: item.product.price
                } : null
            }))
        }

        return NextResponse.json(serializedOrder)
    } catch (error) {
        console.error('Failed to fetch order:', error)
        return NextResponse.json({ error: 'Failed to fetch order', details: error.message }, { status: 500 })
    }
}
