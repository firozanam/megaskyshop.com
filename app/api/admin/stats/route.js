import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import { getDatabase } from '@/lib/mongodb'

export async function GET(request) {
    try {
        console.log('Fetching admin stats...');
        
        const session = await getServerSession(authOptions)
        if (!session || !session.user.isAdmin) {
            console.log('Unauthorized access attempt');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        console.log('User authorized');

        const { searchParams } = new URL(request.url)
        const timeRange = searchParams.get('timeRange') || '7d'
        console.log('Time range:', timeRange);

        const db = await getDatabase()
        console.log('Connected to database');
        
        const startDate = getDateFromTimeRange(timeRange)
        const previousStartDate = getDateFromTimeRange(timeRange, true)
        console.log('Start date:', startDate);
        console.log('Previous start date:', previousStartDate);
        
        console.log('Fetching orders...');
        const orders = await db.collection('orders').find({ createdAt: { $gte: startDate } }).toArray()
        const previousOrders = await db.collection('orders').find({ createdAt: { $gte: previousStartDate, $lt: startDate } }).toArray()
        console.log('Orders fetched:', orders.length);
        console.log('Previous orders fetched:', previousOrders.length);

        const revenue = calculateRevenue(orders)
        const previousRevenue = calculateRevenue(previousOrders)
        const orderCount = orders.length
        const previousOrderCount = previousOrders.length
        
        console.log('Fetching user count...');
        const userCount = await db.collection('users').countDocuments({ createdAt: { $gte: startDate } })
        const previousUserCount = await db.collection('users').countDocuments({ createdAt: { $gte: previousStartDate, $lt: startDate } })
        console.log('User count:', userCount);
        console.log('Previous user count:', previousUserCount);

        console.log('Fetching product count...');
        const productCount = await db.collection('products').countDocuments()
        const previousProductCount = await db.collection('products').countDocuments({ createdAt: { $lt: startDate } })
        console.log('Product count:', productCount);
        console.log('Previous product count:', previousProductCount);

        const orderTrend = calculateOrderTrend(orders)
        const revenueTrend = calculateRevenueTrend(orders)
        const topProducts = await getTopSellingProducts(db, startDate)

        const stats = {
            totalUsers: userCount,
            totalUsersChange: calculatePercentageChange(userCount, previousUserCount),
            totalProducts: productCount,
            totalProductsChange: calculatePercentageChange(productCount, previousProductCount),
            totalOrders: orderCount,
            totalOrdersChange: calculatePercentageChange(orderCount, previousOrderCount),
            totalRevenue: revenue,
            totalRevenueChange: calculatePercentageChange(revenue, previousRevenue),
            orderTrend,
            revenueTrend,
            topProducts,
        }

        console.log('Stats calculated:', stats);

        return NextResponse.json(stats)
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

function getDateFromTimeRange(timeRange, isPrevious = false) {
    const now = new Date()
    let days;
    switch (timeRange) {
        case '7d':
            days = 7;
            break;
        case '30d':
            days = 30;
            break;
        case '90d':
            days = 90;
            break;
        default:
            days = 7;
    }
    if (isPrevious) {
        return new Date(now.setDate(now.getDate() - (2 * days)))
    }
    return new Date(now.setDate(now.getDate() - days))
}

function calculatePercentageChange(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
}

function calculateRevenue(orders) {
    return orders.reduce((total, order) => total + (order.total || 0), 0)
}

function calculateOrderTrend(orders) {
    // Group orders by date and count
    const trend = orders.reduce((acc, order) => {
        const date = new Date(order.createdAt).toISOString().split('T')[0]
        acc[date] = (acc[date] || 0) + 1
        return acc
    }, {})

    // Convert to array and sort by date
    return Object.entries(trend)
        .map(([date, count]) => ({ date, orders: count }))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
}

function calculateRevenueTrend(orders) {
    // Group orders by date and sum revenue
    const trend = orders.reduce((acc, order) => {
        const date = new Date(order.createdAt).toISOString().split('T')[0]
        acc[date] = (acc[date] || 0) + (order.total || 0)
        return acc
    }, {})

    // Convert to array and sort by date
    return Object.entries(trend)
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
}

async function getTopSellingProducts(db, startDate) {
    const pipeline = [
        { $match: { createdAt: { $gte: startDate } } },
        { $unwind: "$items" },
        { $group: { _id: "$items.id", name: { $first: "$items.name" }, totalSales: { $sum: "$items.quantity" } } },
        { $sort: { totalSales: -1 } },
        { $limit: 5 }
    ]

    return await db.collection('orders').aggregate(pipeline).toArray()
}
