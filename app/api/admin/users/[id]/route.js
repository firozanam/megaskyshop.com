import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { getDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

export async function GET(req, { params }) {
    try {
        const db = await getDatabase();
        const session = await getServerSession(authOptions);

        if (!session || !session.user.isAdmin) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        const user = await db.collection('users').findOne(
            { _id: new ObjectId(params.id) },
            { projection: { password: 0 } }
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const db = await getDatabase();
        const session = await getServerSession(authOptions);

        if (!session || !session.user.isAdmin) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        const { name, email, isAdmin } = await req.json();

        const result = await db.collection('users').updateOne(
            { _id: new ObjectId(params.id) },
            { $set: { name, email, isAdmin } }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const db = await getDatabase();
        const session = await getServerSession(authOptions);

        if (!session || !session.user.isAdmin) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        const userToDelete = await db.collection('users').findOne({ _id: new ObjectId(params.id) });

        if (!userToDelete) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (userToDelete.isAdmin) {
            const { adminPassword } = await req.json();
            const adminUser = await db.collection('users').findOne({ _id: new ObjectId(session.user.id) });
            const isPasswordValid = await bcrypt.compare(adminPassword, adminUser.password);

            if (!isPasswordValid) {
                return NextResponse.json({ error: 'Invalid admin password' }, { status: 400 });
            }
        }

        const result = await db.collection('users').deleteOne({ _id: new ObjectId(params.id) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
