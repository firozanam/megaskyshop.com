import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { MongoNetworkError, MongoServerError } from 'mongodb';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

async function connectWithRetry(retries = MAX_RETRIES) {
    try {
        const db = await getDatabase();
        if (!db) throw new Error('Database connection failed');
        await db.command({ ping: 1 });
        return db;
    } catch (error) {
        if (retries > 0) {
            console.log(`Retrying database connection... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return connectWithRetry(retries - 1);
        }
        throw error;
    }
}

function handleDatabaseError(error) {
    console.error('Database error:', error);
    console.error('Stack trace:', error.stack);
    
    if (error instanceof MongoNetworkError) {
        return { 
            statusCode: 503,
            error: 'Service Unavailable',
            message: 'Database connection error'
        };
    }
    if (error instanceof MongoServerError) {
        return { 
            statusCode: 502,
            error: 'Bad Gateway',
            message: 'Database server error'
        };
    }
    return { 
        statusCode: 500,
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    };
}

export async function GET() {
    try {
        const db = await connectWithRetry();
        const products = await db.collection('products')
            .find({})
            .project({
                name: 1,
                price: 1,
                description: 1,
                category: 1,
                stock: 1,
                image: 1,
                avgRating: 1
            })
            .toArray();

        return NextResponse.json({ 
            success: true,
            products: products || [] 
        });
    } catch (error) {
        const { statusCode, error: errorType, message } = handleDatabaseError(error);
        return NextResponse.json({ 
            success: false,
            error: errorType,
            message
        }, { 
            status: statusCode 
        });
    }
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user.isAdmin) {
            return NextResponse.json({ 
                success: false,
                error: 'Forbidden',
                message: 'Not authorized'
            }, { 
                status: 403 
            });
        }

        const data = await request.json();
        const { name, price, description, category, stock, image } = data;

        const validationErrors = [];
        if (!name?.trim()) validationErrors.push('Name is required');
        if (!price || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
            validationErrors.push('Valid price is required (must be a positive number)');
        }
        if (!description?.trim()) validationErrors.push('Description is required');
        if (!category?.trim()) validationErrors.push('Category is required');
        if (!stock || isNaN(parseInt(stock)) || parseInt(stock) < 0) {
            validationErrors.push('Valid stock quantity is required (must be a non-negative integer)');
        }

        if (validationErrors.length > 0) {
            return NextResponse.json({ 
                success: false,
                error: 'Validation Error',
                details: validationErrors 
            }, { 
                status: 400 
            });
        }

        const db = await connectWithRetry();
        const result = await db.collection('products').insertOne({
            name: name.trim(),
            price: parseFloat(price),
            description: description.trim(),
            category: category.trim(),
            stock: parseInt(stock),
            image,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return NextResponse.json({ 
            success: true,
            message: 'Product created successfully',
            productId: result.insertedId 
        });
    } catch (error) {
        const { statusCode, error: errorType, message } = handleDatabaseError(error);
        return NextResponse.json({ 
            success: false,
            error: errorType,
            message
        }, { 
            status: statusCode 
        });
    }
}

export async function PUT(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user.isAdmin) {
            return NextResponse.json({ 
                success: false,
                error: 'Forbidden',
                message: 'Not authorized'
            }, { 
                status: 403 
            });
        }

        const data = await request.json();
        const { id, ...updateData } = data;

        if (!id) {
            return NextResponse.json({ 
                success: false,
                error: 'Validation Error',
                message: 'Product ID is required'
            }, { 
                status: 400 
            });
        }

        const validationErrors = [];
        if (updateData.name !== undefined && !updateData.name?.trim()) {
            validationErrors.push('Name cannot be empty');
        }
        if (updateData.price !== undefined && (isNaN(parseFloat(updateData.price)) || parseFloat(updateData.price) < 0)) {
            validationErrors.push('Price must be a positive number');
        }
        if (updateData.stock !== undefined && (isNaN(parseInt(updateData.stock)) || parseInt(updateData.stock) < 0)) {
            validationErrors.push('Stock must be a non-negative integer');
        }

        if (validationErrors.length > 0) {
            return NextResponse.json({ 
                success: false,
                error: 'Validation Error',
                details: validationErrors 
            }, { 
                status: 400 
            });
        }

        const db = await connectWithRetry();
        const result = await db.collection('products').updateOne(
            { _id: id },
            { 
                $set: {
                    ...updateData,
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ 
                success: false,
                error: 'Not Found',
                message: 'Product not found'
            }, { 
                status: 404 
            });
        }

        return NextResponse.json({ 
            success: true,
            message: 'Product updated successfully'
        });
    } catch (error) {
        const { statusCode, error: errorType, message } = handleDatabaseError(error);
        return NextResponse.json({ 
            success: false,
            error: errorType,
            message
        }, { 
            status: statusCode 
        });
    }
}

export async function DELETE(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user.isAdmin) {
            return NextResponse.json({ 
                success: false,
                error: 'Forbidden',
                message: 'Not authorized'
            }, { 
                status: 403 
            });
        }

        const data = await request.json();
        const { id } = data;

        if (!id) {
            return NextResponse.json({ 
                success: false,
                error: 'Validation Error',
                message: 'Product ID is required'
            }, { 
                status: 400 
            });
        }

        const db = await connectWithRetry();
        const result = await db.collection('products').deleteOne({ _id: id });

        if (result.deletedCount === 0) {
            return NextResponse.json({ 
                success: false,
                error: 'Not Found',
                message: 'Product not found'
            }, { 
                status: 404 
            });
        }

        return NextResponse.json({ 
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        const { statusCode, error: errorType, message } = handleDatabaseError(error);
        return NextResponse.json({ 
            success: false,
            error: errorType,
            message
        }, { 
            status: statusCode 
        });
    }
}
