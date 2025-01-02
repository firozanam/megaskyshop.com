import clientPromise from './mongodb';
import { ObjectId } from 'mongodb';

export async function fetchProduct(id) {
  const client = await clientPromise;
  const db = client.db('your_database_name');
  const product = await db.collection('products').findOne({ _id: new ObjectId(id) });
  return product;
}

export async function fetchReviews(productId) {
  const client = await clientPromise;
  const db = client.db('your_database_name');
  const reviews = await db.collection('reviews').find({ product_id: new ObjectId(productId) }).toArray();
  return reviews;
}
