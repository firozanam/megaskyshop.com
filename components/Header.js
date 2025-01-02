'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'

export default function Header() {
    const { data: session } = useSession()
    const { cart } = useCart()

    return (
        <header className="bg-white shadow-md">
            <nav className="container mx-auto px-6 py-3">
                <div className="flex justify-between items-center">
                    <Link href="/" className="text-2xl font-bold text-gray-800">Megaskyshop</Link>
                    <div className="flex items-center">
                        <Link href="/products" className="text-gray-600 hover:text-gray-900 px-3 py-2">Products</Link>
                        <Link href="/cart" className="text-gray-600 hover:text-gray-900 px-3 py-2">
                            Cart ({cart.length})
                        </Link>
                        {session ? (
                            <>
                                <Link href="/account" className="text-gray-600 hover:text-gray-900 px-3 py-2">Account</Link>
                                <Button onClick={() => signOut()} variant="outline" className="ml-3">Sign Out</Button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="text-gray-600 hover:text-gray-900 px-3 py-2">Login</Link>
                                <Link href="/register" className="text-gray-600 hover:text-gray-900 px-3 py-2">Register</Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    )
}
