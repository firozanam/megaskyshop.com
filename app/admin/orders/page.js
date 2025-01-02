'use client'

import { useState, useEffect, useCallback } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { useToast } from "@/components/ui/toast-context"
import { Loader2 } from 'lucide-react'
import Image from 'next/image'
import OrderDetailsModal from '@/components/OrderDetailsModal'
import { StatusBadge } from '@/components/StatusBadge'
import { formatCurrency } from '@/lib/utils'
import { ORDER_STATUSES } from '@/lib/constants'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getBlobImageUrl } from '@/lib/blobStorage'

const OrdersPage = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [statusFilter, setStatusFilter] = useState('all')
    const { toast } = useToast()

    const fetchOrders = useCallback(async () => {
        try {
            const url = statusFilter === 'all' 
                ? '/api/admin/orders' 
                : `/api/admin/orders?status=${statusFilter}`
            const res = await fetch(url)
            if (!res.ok) throw new Error('Failed to fetch orders')
            const data = await res.json()
            setOrders(data)
        } catch (error) {
            console.error('Error fetching orders:', error)
            toast({
                title: "Error",
                description: "Failed to fetch orders",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }, [statusFilter, toast])

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    const openOrderDetails = (order) => {
        setSelectedOrder(order)
        setIsModalOpen(true)
    }

    const handleStatusUpdate = (orderId, newStatus) => {
        setOrders(orders.map(order => 
            order._id === orderId ? { ...order, status: newStatus } : order
        ))
    }

    const filteredOrders = statusFilter === 'all' 
        ? orders 
        : orders.filter(order => order.status === statusFilter)

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Manage Orders</h1>
            <div className="mb-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {ORDER_STATUSES.map(status => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredOrders.map((order) => (
                        <TableRow key={order._id}>
                            <TableCell>{order._id}</TableCell>
                            <TableCell>{order.name || 'Guest'}</TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-2">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="relative w-12 h-12">
                                            <Image
                                                src={getBlobImageUrl(item.image) || '/images/placeholder.png'}
                                                alt={item.name || 'Product'}
                                                width={48}
                                                height={48}
                                                className="rounded object-cover"
                                            />
                                            <span className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                                {item.quantity}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </TableCell>
                            <TableCell>৳{(order.total || 0).toFixed(2)}</TableCell>
                            <TableCell>
                                <StatusBadge status={order.status} />
                            </TableCell>
                            <TableCell>
                                <Button 
                                    onClick={() => openOrderDetails(order)} 
                                    variant="outline"
                                    size="sm"
                                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    View Details
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <OrderDetailsModal
                order={selectedOrder}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                isAdmin={true}
                onStatusUpdate={handleStatusUpdate}
                orderStatuses={ORDER_STATUSES}
            />
        </div>
    )
}

export default OrdersPage
