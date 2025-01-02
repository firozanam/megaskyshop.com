import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req) {
    try {
        await dbConnect();
        const { email, password } = await req.json();

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
        }

        const token = jwt.sign(
            { userId: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        const response = NextResponse.json({ message: 'Login successful', token, isAdmin: user.isAdmin });
        response.cookies.set('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        return response;
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
