'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'

export default function Cart() {
    const { cart, updateQuantity, removeFromCart, clearCart, isLoading, getCartItemCount } = useCart()
    const [imgSrc, setImgSrc] = useState('/images/placeholder.png')
    const [itemCount, setItemCount] = useState(0)

    useEffect(() => {
        setItemCount(getCartItemCount())
    }, [cart, getCartItemCount])

    const total = cart.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1), 0)

    if (isLoading) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Your Cart ({itemCount} items)</h2>
            {cart.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <>
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
                                <CartItem key={item.id} item={item} updateQuantity={updateQuantity} removeItem={removeFromCart} />
                            ))}
                        </TableBody>
                    </Table>
                    <div className="mt-4 flex justify-between items-center">
                        <p className="text-xl font-bold">Total: ৳{total.toFixed(2)}</p>
                        <Link href="/checkout">
                            <Button size="lg">Proceed to Checkout</Button>
                        </Link>
                    </div>
                    {cart.length > 0 && (
                        <div className="mt-4">
                            <Button variant="outline" onClick={clearCart}>Clear Cart</Button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

function CartItem({ item, updateQuantity, removeItem }) {
    const [imgSrc, setImgSrc] = useState('/images/placeholder.png')

    useEffect(() => {
        if (item.image) {
            setImgSrc(item.image === '/placeholder.jpg' ? '/images/placeholder.png' : item.image)
        }
    }, [item.image])

    return (
        <TableRow>
            <TableCell>
                <Image 
                    src={imgSrc}
                    alt={item.name} 
                    width={50} 
                    height={50}
                    onError={() => setImgSrc('/images/placeholder.png')}
                />
                {item.name}
            </TableCell>
            <TableCell>৳{(parseFloat(item.price) || 0).toFixed(2)}</TableCell>
            <TableCell>
                <input
                    type="number"
                    min="1"
                    value={item.quantity || 1}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                    className="w-16 p-1 border rounded"
                />
            </TableCell>
            <TableCell>৳{((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1)).toFixed(2)}</TableCell>
            <TableCell>
                <Button variant="destructive" onClick={() => removeItem(item.id)}>
                    Remove
                </Button>
            </TableCell>
        </TableRow>
    )
}
