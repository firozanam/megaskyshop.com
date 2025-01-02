import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/mongodb'
import Order from '@/models/Order'

export async function GET(request) {
    try {
        await dbConnect()
        
        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '10')

        const orders = await Order.find().sort({ createdAt: -1 }).limit(limit).lean()

        console.log('Debug: Recent orders:', orders)

        return NextResponse.json({
            orderCount: await Order.countDocuments(),
            recentOrders: orders
        })
    } catch (error) {
        console.error('Error fetching debug order info:', error)
        return NextResponse.json({ error: 'Failed to fetch debug order info' }, { status: 500 })
    }
}
