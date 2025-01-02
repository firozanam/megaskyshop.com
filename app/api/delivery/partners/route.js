import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import DeliveryPartner from '@/models/DeliveryPartner';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const partners = await DeliveryPartner.find({}).sort({ createdAt: -1 });
        return NextResponse.json(partners);
    } catch (error) {
        console.error('GET partners error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            console.log('Unauthorized: No session found');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        console.log('Received data:', data);

        await dbConnect();
        console.log('Database connected');

        // Validate required fields
        const requiredFields = ['name', 'logo', 'apiKey', 'baseUrl', 'transitTime', 'provider'];
        const missingFields = requiredFields.filter(field => !data[field]);
        
        if (missingFields.length > 0) {
            console.log('Missing required fields:', missingFields);
            return NextResponse.json({ 
                error: `Missing required fields: ${missingFields.join(', ')}` 
            }, { status: 400 });
        }

        // Convert transitTime to number if it's a string
        if (typeof data.transitTime === 'string') {
            data.transitTime = parseInt(data.transitTime, 10);
        }

        // Generate code from name if not provided
        if (!data.code) {
            data.code = data.name
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '')
                .slice(0, 10);
        }

        const partner = await DeliveryPartner.create({
            ...data,
            isActive: true
        });
        
        console.log('Partner created:', partner);
        return NextResponse.json(partner);
    } catch (error) {
        console.error('POST partner error:', error);
        
        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return NextResponse.json({ 
                error: `A delivery partner with this ${field} already exists.`,
                field: field
            }, { status: 409 });
        }

        return NextResponse.json({ 
            error: error.message,
            details: error.errors
        }, { status: 500 });
    }
}
