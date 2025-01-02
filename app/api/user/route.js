import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { ObjectId } from 'mongodb'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const db = await getDatabase()
        const user = await db.collection('users').findOne(
            { _id: new ObjectId(session.user.id) },
            { projection: { password: 0 } }
        )

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            billingAddresses: user.billingAddresses || [],
            shippingAddresses: user.shippingAddresses || []
        })
    } catch (error) {
        console.error('Error in GET /api/user:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

export async function PUT(req) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const { name, email, billingAddresses, shippingAddresses } = await req.json()

        const db = await getDatabase()
        const result = await db.collection('users').updateOne(
            { _id: new ObjectId(session.user.id) },
            { $set: { 
                name, 
                email, 
                billingAddresses: billingAddresses || [],
                shippingAddresses: shippingAddresses || []
            } }
        )

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Fetch the updated user data
        const updatedUser = await db.collection('users').findOne(
            { _id: new ObjectId(session.user.id) },
            { projection: { password: 0 } }
        )

        return NextResponse.json(updatedUser)
    } catch (error) {
        console.error('Error in PUT /api/user:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
