'use client';

import { useEffect } from 'react';

export default function PrivacyPolicyPage() {
  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4">
        Welcome to Megaskyshop. This Privacy Policy outlines how we collect, use, and protect your information when you visit our website.
      </p>
      <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
      <p className="mb-4">
        We collect information that you provide to us directly, such as when you create an account, place an order, or contact us for support.
      </p>
      <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
      <p className="mb-4">
        We use your information to process your orders, improve our services, and communicate with you about your account or transactions.
      </p>
      <h2 className="text-2xl font-semibold mb-4">3. Sharing Your Information</h2>
      <p className="mb-4">
        We do not share your personal information with third parties except as necessary to provide our services or as required by law.
      </p>
      <h2 className="text-2xl font-semibold mb-4">4. Security</h2>
      <p className="mb-4">
        We take reasonable measures to protect your information from unauthorized access, use, or disclosure.
      </p>
      <h2 className="text-2xl font-semibold mb-4">5. Changes to This Policy</h2>
      <p className="mb-4">
        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on our website.
      </p>
      <p className="mb-4">
        If you have any questions about this Privacy Policy, please contact us.
      </p>
    </div>
  );
}
