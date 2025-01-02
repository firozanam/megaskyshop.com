import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(req, { params }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const db = await getDatabase()
        const { rating, comment, name, isAnonymous } = await req.json()
        
        // Input validation
        if (!rating || !comment || (typeof isAnonymous !== 'boolean')) {
            return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
        }

        if (!params.id || typeof params.id !== 'string') {
            return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
        }

        let productId
        try {
            productId = new ObjectId(params.id)
        } catch (error) {
            return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 })
        }

        const product = await db.collection('products').findOne({ _id: productId })
        
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        }

        // Ensure product.reviews is an array
        if (!Array.isArray(product.reviews)) {
            await db.collection('products').updateOne(
                { _id: productId },
                { $set: { reviews: [], avgRating: 0 } }
            )
            product.reviews = []
            product.avgRating = 0
        }

        // Check if the user has purchased the product and if the order is delivered
        const order = await db.collection('orders').findOne({
            userId: session.user.id,
            'items.id': params.id,
            status: 'Delivered'
        })

        if (!order) {
            return NextResponse.json({ error: 'You are not eligible to review this product' }, { status: 403 })
        }

        // Check if the user has already reviewed this product
        const existingReview = product.reviews.find(review => review.userId.toString() === session.user.id)
        if (existingReview) {
            return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 403 })
        }

        const newReview = {
            _id: new ObjectId(),
            userId: new ObjectId(session.user.id),
            rating: Number(rating),
            comment,
            name: isAnonymous ? 'Anonymous' : name,
            isAnonymous,
            createdAt: new Date()
        }

        const result = await db.collection('products').updateOne(
            { _id: productId },
            { 
                $push: { reviews: newReview },
                $set: { 
                    avgRating: ((product.avgRating || 0) * product.reviews.length + Number(rating)) / (product.reviews.length + 1)
                }
            }
        )

        if (result.modifiedCount === 0) {
            return NextResponse.json({ error: 'Failed to add review' }, { status: 500 })
        }

        return NextResponse.json({ message: 'Review added successfully', review: newReview })
    } catch (error) {
        console.error('Failed to add review:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
