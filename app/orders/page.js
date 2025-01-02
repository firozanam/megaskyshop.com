'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useToast } from "@/components/ui/toast-context"
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { StatusBadge } from '@/components/StatusBadge'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function OrdersPage() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const { data: session, status } = useSession()
    const { toast } = useToast()
    const router = useRouter()

    useEffect(() => {
        const fetchOrders = async () => {
            if (status !== 'authenticated') {
                setLoading(false)
                return
            }

            try {
                const response = await fetch('/api/orders')
                if (!response.ok) {
                    throw new Error('Failed to fetch orders')
                }
                const data = await response.json()
                setOrders(data.orders)
            } catch (error) {
                console.error('Error fetching orders:', error)
                toast({
                    title: "Error",
                    description: "Failed to load orders",
                    variant: "destructive",
                })
            } finally {
                setLoading(false)
            }
        }

        fetchOrders()
    }, [status, toast])

    const handleReviewClick = (productId) => {
        router.push(`/products/${productId}/review`)
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!session) {
        return <div>Please log in to view your orders.</div>
    }

    if (orders.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">My Orders</h1>
                <p className="text-xl text-center">You haven't placed any orders yet.</p>
                <div className="text-center mt-4">
                    <Button onClick={() => router.push('/')}>
                        Continue Shopping
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
            <div className="space-y-8">
                {orders.map((order) => (
                    <Card key={order._id}>
                        <CardHeader>
                            <CardTitle className="text-xl">Order #{order._id.substring(0, 8)}</CardTitle>
                            <p className="text-sm text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4">
                                <p className="font-semibold">Status: <StatusBadge status={order.status} /></p>
                                <p>Total: {formatCurrency(order.total)}</p>
                            </div>
                            <div className="border-t pt-4">
                                <h3 className="font-semibold mb-2">Items:</h3>
                                <ul className="space-y-2">
                                    {order.items.map((item, index) => (
                                        <li key={index} className="flex justify-between items-center">
                                            <span>{item.name} x {item.quantity}</span>
                                            <span>{formatCurrency(item.price * item.quantity)}</span>
                                            {order.status === 'Delivered' && (
                                                <Link href={`/products/${item.id}/review`} passHref>
                                                    <Button variant="outline" size="sm">
                                                        Submit Review
                                                    </Button>
                                                </Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
