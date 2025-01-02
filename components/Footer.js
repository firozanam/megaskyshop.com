import React from 'react'
import Link from 'next/link'
import { Facebook, Instagram, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-100 mt-auto">
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-0">© 2024 Megaskyshop. All rights reserved.</p>
          <div className="flex flex-wrap justify-center sm:justify-end space-x-2 sm:space-x-4">
            <Link href="/privacy" className="text-gray-600 hover:text-gray-900 text-xs sm:text-sm mb-1 sm:mb-0">Privacy Policy</Link>
            <Link href="/terms" className="text-gray-600 hover:text-gray-900 text-xs sm:text-sm mb-1 sm:mb-0">Terms of Service</Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900 text-xs sm:text-sm mb-1 sm:mb-0">About Us</Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900 text-xs sm:text-sm mb-1 sm:mb-0">Contact Us</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
