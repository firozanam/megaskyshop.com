'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast-context'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import { getBlobImageUrl } from '@/lib/blobStorage'

export default function OrderConfirmationPage({ params }) {
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const { toast } = useToast()

    useEffect(() => {
        const fetchOrder = async () => {
            if (!params.id) {
                console.error('Order ID is undefined')
                toast({
                    title: "Error",
                    description: "Invalid order ID",
                    variant: "destructive",
                })
                router.push('/orders')
                return
            }

            try {
                const res = await fetch(`/api/orders/${params.id}`)
                if (!res.ok) {
                    throw new Error('Failed to fetch order')
                }
                const data = await res.json()
                setOrder(data)
            } catch (error) {
                console.error('Error fetching order:', error)
                toast({
                    title: "Error",
                    description: "Failed to fetch order details",
                    variant: "destructive",
                })
                router.push('/orders')
            } finally {
                setLoading(false)
            }
        }

        fetchOrder()
    }, [params.id, router, toast])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!order) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-4">Order Not Found</h1>
                <p>We couldn't find the order you're looking for.</p>
                <Button onClick={() => router.push('/orders')} className="mt-4">
                    View All Orders
                </Button>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">Order Confirmation</h1>
            <p className="text-lg mb-4">Thank you for your order!</p>
            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-2">Order Details</h2>
                <p><strong>Order ID:</strong> {order._id}</p>
                <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                <p><strong>Status:</strong> {order.status}</p>
                <p><strong>Total:</strong> {formatCurrency(order.total)}</p>

                <h3 className="text-lg font-semibold mt-4 mb-2">Items</h3>
                <ul className="space-y-2">
                    {order.items.map((item, index) => (
                        <li key={index} className="flex items-center space-x-4">
                            <Image
                                src={getBlobImageUrl(item.image) || '/images/placeholder.png'}
                                alt={item.name}
                                width={50}
                                height={50}
                                className="rounded-md"
                            />
                            <div>
                                <p className="font-medium">{item.name}</p>
                                <p>Quantity: {item.quantity}</p>
                                <p>Price: {formatCurrency(item.price)}</p>
                            </div>
                        </li>
                    ))}
                </ul>

                <h3 className="text-lg font-semibold mt-4 mb-2">Shipping Information</h3>
                <p><strong>Name:</strong> {order.name}</p>
                <p><strong>Mobile:</strong> {order.mobile}</p>
                <p><strong>Address:</strong> {order.shippingAddress}</p>
            </div>
            <Button onClick={() => router.push('/orders')} className="mt-6">
                View All Orders
            </Button>
        </div>
    )
}
