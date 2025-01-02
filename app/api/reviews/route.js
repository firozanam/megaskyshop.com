import { ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'
import clientPromise from '@/lib/mongodb'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let client
  try {
    client = await clientPromise
  } catch (error) {
    console.error('Failed to connect to the database:', error)
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
  }

  const db = client.db('sample_mflix')

  const { movieId, review, rating } = await req.json()
  
  if (!movieId || !review || rating === undefined) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const newReview = {
    name: session.user.name,
    user_id: session.user.email,
    movie_id: new ObjectId(movieId),
    review,
    rating: parseInt(rating),
    date: new Date(),
  }

  try {
    const result = await db.collection('reviews').insertOne(newReview)
    console.log('Review added successfully:', result.insertedId)
    return NextResponse.json({ message: 'Review added successfully', reviewId: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error('Error adding review:', error)
    return NextResponse.json({ error: 'Error adding review', details: error.message }, { status: 500 })
  }
}
