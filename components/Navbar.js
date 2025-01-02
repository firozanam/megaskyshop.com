'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useCart } from '@/contexts/CartContext'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Menu, X } from 'lucide-react'

export default function Navbar() {
    const { data: session } = useSession()
    const { cart, getCartItemCount } = useCart()
    const [cartItemCount, setCartItemCount] = useState(0)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    useEffect(() => {
        setCartItemCount(getCartItemCount())
    }, [cart, getCartItemCount])

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

    return (
        <nav className="bg-white shadow-lg">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between items-center py-4">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center">
                            <span className="font-semibold text-foreground text-lg">Megaskyshop</span>
                        </Link>
                    </div>
                    <div className="hidden md:flex items-center space-x-1">
                        <Link href="/" className="py-2 px-3 text-foreground hover:text-primary transition duration-300">Home</Link>
                        <Link href="/products" className="py-2 px-3 text-foreground hover:text-primary transition duration-300">Products</Link>
                        <Link href="/about" className="py-2 px-3 text-foreground hover:text-primary transition duration-300">About</Link>
                        <Link href="/contact" className="py-2 px-3 text-foreground hover:text-primary transition duration-300">Contact</Link>
                    </div>
                    <div className="hidden md:flex items-center space-x-3">
                        <Button asChild variant="outline" className="relative">
                            <Link href="/cart" className="flex items-center">
                                <ShoppingCart className="h-5 w-5 mr-1" />
                                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {cartItemCount}
                                </span>
                            </Link>
                        </Button>
                        {session ? (
                            <>
                                <Button asChild variant="outline">
                                    <Link href="/account">Account</Link>
                                </Button>
                                <Button asChild>
                                    <Link href="/api/auth/signout">Sign Out</Link>
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button asChild>
                                    <Link href="/api/auth/signin">Sign In</Link>
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href="/register">Sign Up</Link>
                                </Button>
                            </>
                        )}
                    </div>
                    <div className="md:hidden flex items-center">
                        <Button asChild variant="outline" className="relative mr-2">
                            <Link href="/cart" className="flex items-center">
                                <ShoppingCart className="h-5 w-5" />
                                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {cartItemCount}
                                </span>
                            </Link>
                        </Button>
                        <button onClick={toggleMenu} className="text-foreground focus:outline-none">
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
                {isMenuOpen && (
                    <div className="md:hidden pb-4">
                        <Link href="/" className="block py-2 px-4 text-sm text-foreground hover:text-primary">Home</Link>
                        <Link href="/products" className="block py-2 px-4 text-sm text-foreground hover:text-primary">Products</Link>
                        <Link href="/about" className="block py-2 px-4 text-sm text-foreground hover:text-primary">About</Link>
                        <Link href="/contact" className="block py-2 px-4 text-sm text-foreground hover:text-primary">Contact</Link>
                        {session ? (
                            <>
                                <Link href="/account" className="block py-2 px-4 text-sm text-foreground hover:text-primary">Account</Link>
                                <Link href="/api/auth/signout" className="block py-2 px-4 text-sm text-foreground hover:text-primary">Sign Out</Link>
                            </>
                        ) : (
                            <>
                                <Link href="/api/auth/signin" className="block py-2 px-4 text-sm text-foreground hover:text-primary">Sign In</Link>
                                <Link href="/register" className="block py-2 px-4 text-sm text-foreground hover:text-primary">Sign Up</Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    )
}
