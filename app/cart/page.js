'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import CartSummary from '@/components/CartSummary'
import { formatCurrency } from '@/lib/utils'
import { getBlobImageUrl } from '@/lib/blobStorage'

export default function CartPage() {
    const { cart, updateQuantity, removeFromCart, getCartItemCount, getCartTotal, isLoading } = useCart()
    const [imgSrc, setImgSrc] = useState('/images/placeholder.png')

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="mr-2 h-16 w-16 animate-spin" />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Your Cart ({getCartItemCount()} items)</h1>
            {cart.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cart.map((item) => (
                                    <TableRow key={item._id}>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <Image 
                                                    src={getBlobImageUrl(item.image) || '/images/placeholder.png'}
                                                    alt={item.name || 'Product'} 
                                                    width={50} 
                                                    height={50}
                                                    onError={() => setImgSrc('/images/placeholder.png')}
                                                    className="mr-4"
                                                />
                                                {item.name || 'Unknown Product'}
                                            </div>
                                        </TableCell>
                                        <TableCell>{formatCurrency(item.price)}</TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateQuantity(item._id, parseInt(e.target.value) || 1)}
                                                className="w-20"
                                            />
                                        </TableCell>
                                        <TableCell>{formatCurrency(item.price * item.quantity)}</TableCell>
                                        <TableCell>
                                            <Button variant="destructive" onClick={() => removeFromCart(item._id)}>
                                                Remove
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div>
                        <CartSummary total={getCartTotal()} />
                        <div className="mt-4">
                            <Link href="/checkout">
                                <Button size="lg" className="w-full">Proceed to Checkout</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
