import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import User from '@/models/User'

export async function GET() {
    try {
        const db = await getDatabase()
        const users = await db.collection('users').find({}, { projection: { password: 0 } }).toArray()
        return NextResponse.json(users.map(user => ({
            ...user,
            _id: user._id.toString() // Convert ObjectId to string
        })))
    } catch (error) {
        console.error('Failed to fetch users:', error)
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }
}

export async function PUT(req) {
    try {
        const { id, role } = await req.json()
        const db = await getDatabase()
        const result = await db.collection('users').updateOne(
            { _id: new ObjectId(id) },
            { $set: { role } }
        )
        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }
        return NextResponse.json({ message: 'User updated successfully' })
    } catch (error) {
        console.error('Failed to update user:', error)
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }
}
