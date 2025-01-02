import { NextResponse } from 'next/server';
import { transporter } from '@/lib/mailer';

export async function GET() {
    try {
        console.log('Verifying SMTP connection...');
        await transporter.verify();
        console.log('SMTP connection verified successfully');
        
        console.log('Sending test email...');
        const testResult = await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: process.env.ADMIN_EMAIL,
            subject: 'SMTP Test Email',
            text: 'If you receive this email, your SMTP configuration is working correctly.',
        });
        console.log('Test email sent successfully:', testResult);

        return NextResponse.json({ message: 'Test email sent successfully', result: testResult });
    } catch (error) {
        console.error('Failed to send test email:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            command: error.command,
            response: error.response,
        });
        return NextResponse.json({ 
            error: 'Failed to send test email', 
            details: error.message,
            code: error.code,
            command: error.command,
            response: error.response
        }, { status: 500 });
    }
}
