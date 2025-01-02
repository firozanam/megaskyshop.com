import { NextResponse } from 'next/server';
import { sendMail } from '@/lib/mailer';

export async function POST(request) {
  try {
    const { name, email, message } = await request.json();

    await sendMail({
      to: process.env.ADMIN_EMAIL,
      subject: 'New Contact Form Submission',
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    });

    return NextResponse.json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Failed to send contact form message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
