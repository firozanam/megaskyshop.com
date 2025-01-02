'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TermsOfServicePage() {
  const router = useRouter();

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="mb-4">
        Welcome to Megaskyshop. By accessing or using our website, you agree to be bound by these Terms of Service and our Privacy Policy.
      </p>
      <h2 className="text-2xl font-semibold mb-4">1. Use of the Site</h2>
      <p className="mb-4">
        You may use the site for lawful purposes only. You agree not to use the site in any way that could damage, disable, overburden, or impair the site.
      </p>
      <h2 className="text-2xl font-semibold mb-4">2. Intellectual Property</h2>
      <p className="mb-4">
        All content on this site, including text, graphics, logos, and images, is the property of Megaskyshop or its content suppliers and is protected by international copyright laws.
      </p>
      <h2 className="text-2xl font-semibold mb-4">3. Limitation of Liability</h2>
      <p className="mb-4">
        Megaskyshop will not be liable for any damages of any kind arising from the use of this site, including, but not limited to, direct, indirect, incidental, punitive, and consequential damages.
      </p>
      <h2 className="text-2xl font-semibold mb-4">4. Changes to Terms</h2>
      <p className="mb-4">
        We reserve the right to make changes to our site, policies, and these Terms of Service at any time. Your continued use of the site following any changes indicates your acceptance of the new terms.
      </p>
      <p className="mb-4">
        If you have any questions about these Terms of Service, please contact us.
      </p>
    </div>
  );
}
