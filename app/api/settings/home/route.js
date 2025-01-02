import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

async function connectWithRetry(retries = MAX_RETRIES) {
    try {
        const db = await getDatabase();
        if (!db) throw new Error('Database connection failed');
        // Verify connection with ping
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

const validateImageUrl = (url) => {
    if (!url) return false;
    return url.startsWith('/') || url.match(/^https?:\/\/.+/);
};

export async function GET() {
    try {
        const db = await connectWithRetry();
        const settings = await db.collection('settings').findOne({ key: 'homePageSettings' });
        
        // Default fallback data if no settings found
        const defaultData = {
            featuredProductId: null,
            featuredProductIds: [],
            videoUrl: 'https://www.youtube.com/embed/P2gW89OxtJY?si=vw-kbKkYT2MSjon8',
            heroHeading: '100% সিলিকনের তৈরি অরিজিনাল ম্যাজিক কনডম',
            heroParagraph: 'যৌন দুর্বলতা থেকে মুক্তি পেতে এবং দীর্ঘক্ষণ সঙ্গম করতে পারবেন, ৩০-৪০ মিনিট পর্যন্ত সঙ্গম করতে পারবেন।',
            heroImage: '/images/hero-bg.jpg'
        };

        return NextResponse.json(settings || defaultData);
    } catch (error) {
        console.error('Error fetching home settings:', error);
        console.error('Stack trace:', error.stack);
        
        let statusCode = 500;
        let errorMessage = 'Internal Server Error';
        
        if (error.name === 'MongoNetworkError') {
            statusCode = 503;
            errorMessage = 'Database connection error';
        } else if (error.name === 'MongoServerError') {
            statusCode = 502;
            errorMessage = 'Database server error';
        }
        
        return NextResponse.json({ 
            error: errorMessage,
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { 
            status: statusCode 
        });
    }
}

export async function PUT(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user.isAdmin) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        const { featuredProductId, featuredProductIds, videoUrl, heroHeading, heroParagraph, heroImage } = await request.json();
        
        if (heroImage && !validateImageUrl(heroImage)) {
            return NextResponse.json({ error: 'Invalid hero image URL' }, { status: 400 });
        }

        const db = await connectWithRetry();
        const result = await db.collection('settings').updateOne(
            { key: 'homePageSettings' },
            {
                $set: {
                    featuredProductId,
                    featuredProductIds,
                    videoUrl,
                    heroHeading,
                    heroParagraph,
                    heroImage,
                    updatedAt: new Date()
                }
            },
            { upsert: true }
        );

        return NextResponse.json({ 
            message: 'Settings updated successfully',
            modifiedCount: result.modifiedCount,
            upsertedId: result.upsertedId
        });
    } catch (error) {
        console.error('Error updating home settings:', error);
        console.error('Stack trace:', error.stack);
        
        let statusCode = 500;
        let errorMessage = 'Internal Server Error';
        
        if (error.name === 'MongoNetworkError') {
            statusCode = 503;
            errorMessage = 'Database connection error';
        } else if (error.name === 'MongoServerError') {
            statusCode = 502;
            errorMessage = 'Database server error';
        }
        
        return NextResponse.json({ 
            error: errorMessage,
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { 
            status: statusCode 
        });
    }
}
