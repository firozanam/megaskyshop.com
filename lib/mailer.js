import nodemailer from 'nodemailer'
import { formatCurrency } from '@/lib/utils'

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendMail = async ({ to, subject, text, html }) => {
  return transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    text,
    html,
  });
};

// Verify SMTP connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log('SMTP connection error:', error);
  } else {
    console.log('SMTP connection is ready to take our messages');
  }
});

function logSmtpConfig() {
  console.log('SMTP Configuration:', {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE,
    user: process.env.SMTP_USER,
  });
}

export async function sendOrderConfirmationEmail(order) {
  try {
    logSmtpConfig();
    const message = {
      from: process.env.SMTP_FROM,
      to: order.email,
      subject: `Order Confirmation - Order #${order._id}`,
      html: `
        <h1>Thank you for your order!</h1>
        <p>Your order #${order._id} has been received and is being processed.</p>
        <h2>Order Details:</h2>
        <ul>
          ${order.items.map(item => `<li>${item.name} - ${formatCurrency(item.price)} x ${item.quantity}</li>`).join('')}
        </ul>
        <p><strong>Total: ${formatCurrency(order.total)}</strong></p>
        <p><strong>Shipping Address:</strong> ${order.shippingAddress || 'Not provided'}</p>
        <p>We'll notify you when your order has been shipped.</p>
      `,
    }

    await transporter.sendMail(message)
    console.log('Order confirmation email sent successfully')
  } catch (error) {
    console.error('Error sending order confirmation email:', error)
    throw error;
  }
}

export async function sendAdminOrderNotificationEmail(order) {
  try {
    logSmtpConfig();
    const message = {
      from: process.env.SMTP_FROM,
      to: process.env.ADMIN_EMAIL,
      subject: `New Order Received - Order #${order._id}`,
      html: `
        <h1>New Order Received</h1>
        <p>A new order has been placed. Order details are as follows:</p>
        <h2>Order #${order._id}</h2>
        <p><strong>Customer:</strong> ${order.name} (${order.email || 'Guest'})</p>
        <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
        <p><strong>Status:</strong> ${order.status}</p>
        <h3>Items:</h3>
        <ul>
          ${order.items.map(item => `<li>${item.name} - ${formatCurrency(item.price)} x ${item.quantity}</li>`).join('')}
        </ul>
        <p><strong>Total: ${formatCurrency(order.total)}</strong></p>
        <p><strong>Shipping Address:</strong> ${order.shippingAddress || 'Not provided'}</p>
        <p><strong>Phone:</strong> ${order.mobile}</p>
        <p>Please log in to the admin panel to process this order.</p>
      `,
    }

    await transporter.sendMail(message)
    console.log('Admin order notification email sent successfully')
  } catch (error) {
    console.error('Error sending admin order notification email:', error)
    throw error;
  }
}
