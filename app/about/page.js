'use client';

import { useEffect } from 'react';

export default function AboutPage() {
  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">About Megaskyshop</h1>
      <p className="mb-4">
        Megaskyshop is a leading e-commerce platform dedicated to providing high-quality products to our customers. Our mission is to offer a seamless shopping experience with a wide range of products, exceptional customer service, and fast delivery.
      </p>
      <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
      <p className="mb-4">
        Founded in 2023, Megaskyshop started with a vision to revolutionize the online shopping experience in Bangladesh. We began with a small team of passionate individuals committed to bringing the best products to our customers.
      </p>
      <h2 className="text-2xl font-semibold mb-4">Our Values</h2>
      <ul className="list-disc pl-5 mb-4">
        <li>Customer Satisfaction: We prioritize our customers' needs and strive to exceed their expectations.</li>
        <li>Quality Products: We offer a curated selection of products that meet our high standards of quality.</li>
        <li>Innovation: We continuously seek new ways to improve our platform and services.</li>
      </ul>
      <h2 className="text-2xl font-semibold mb-4">Our Team</h2>
      <p className="mb-4">
        Our team is composed of dedicated professionals with diverse backgrounds in technology, marketing, and customer service. We work together to ensure that Megaskyshop remains a trusted and reliable platform for our customers.
      </p>
      <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
      <p className="mb-4">
        If you have any questions or feedback, please feel free to contact us. We are always here to help and look forward to hearing from you.
      </p>
    </div>
  );
}
