'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useToast } from "@/components/ui/toast-context"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, User, MapPin, CreditCard, Package, FileText, Settings, Edit, Eye, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useRouter } from 'next/navigation'
import { StatusBadge } from '@/components/StatusBadge'
import { formatCurrency } from '@/lib/utils'

export default function AccountPage() {
    const [userData, setUserData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [editMode, setEditMode] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    })
    const [billingAddresses, setBillingAddresses] = useState([])
    const [shippingAddresses, setShippingAddresses] = useState([])
    const [newBillingAddress, setNewBillingAddress] = useState({
        name: '',
        email: '',
        address: '',
        phone: ''
    })
    const [newShippingAddress, setNewShippingAddress] = useState({
        name: '',
        email: '',
        address: '',
        phone: ''
    })
    const [showNewBillingForm, setShowNewBillingForm] = useState(false)
    const [showNewShippingForm, setShowNewShippingForm] = useState(false)
    const [editingAddress, setEditingAddress] = useState(null)
    const [orders, setOrders] = useState([])
    const { data: session, status } = useSession()
    const { toast } = useToast()
    const router = useRouter()

    useEffect(() => {
        const fetchUserData = async () => {
            if (status !== 'authenticated' || !session?.user) {
                setLoading(false)
                return
            }

            try {
                const response = await fetch('/api/user')
                if (!response.ok) {
                    throw new Error(`Failed to fetch user data: ${response.status} ${response.statusText}`)
                }
                const data = await response.json()
                setUserData(data)
                setFormData({
                    name: data.name || '',
                    email: data.email || '',
                })
                setBillingAddresses(data.billingAddresses || [])
                setShippingAddresses(data.shippingAddresses || [])
            } catch (error) {
                console.error('Error fetching user data:', error)
                toast({
                    title: "Error",
                    description: `Failed to load user data: ${error.message}`,
                    variant: "destructive",
                })
            } finally {
                setLoading(false)
            }
        }

        const fetchOrders = async () => {
            if (status !== 'authenticated' || !session?.user) {
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
            }
        }

        fetchUserData()
        fetchOrders()
    }, [status, session, toast])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleBillingAddressChange = (e) => {
        const { name, value } = e.target
        setNewBillingAddress(prev => ({ ...prev, [name]: value }))
    }

    const handleShippingAddressChange = (e) => {
        const { name, value } = e.target
        setNewShippingAddress(prev => ({ ...prev, [name]: value }))
    }

    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const response = await fetch('/api/user', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to update profile')
            }
            const updatedData = await response.json()
            setUserData(updatedData)
            setEditMode(false)
            toast({
                title: "Success",
                description: "Profile updated successfully",
            })
        } catch (error) {
            console.error('Error updating profile:', error)
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleAddBillingAddress = async (e) => {
        e.preventDefault()
        const updatedBillingAddresses = [...billingAddresses, newBillingAddress]
        try {
            const response = await fetch('/api/user', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...userData, billingAddresses: updatedBillingAddresses })
            })
            if (!response.ok) {
                throw new Error('Failed to add billing address')
            }
            const updatedData = await response.json()
            setBillingAddresses(updatedData.billingAddresses)
            setNewBillingAddress({ name: '', email: '', address: '', phone: '' })
            setShowNewBillingForm(false)
            toast({
                title: "Success",
                description: "Billing address added successfully",
            })
        } catch (error) {
            console.error('Error adding billing address:', error)
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        }
    }

    const handleAddShippingAddress = async (e) => {
        e.preventDefault()
        const updatedShippingAddresses = [...shippingAddresses, newShippingAddress]
        try {
            const response = await fetch('/api/user', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...userData, shippingAddresses: updatedShippingAddresses })
            })
            if (!response.ok) {
                throw new Error('Failed to add shipping address')
            }
            const updatedData = await response.json()
            setShippingAddresses(updatedData.shippingAddresses)
            setNewShippingAddress({ name: '', email: '', address: '', phone: '' })
            setShowNewShippingForm(false)
            toast({
                title: "Success",
                description: "Shipping address added successfully",
            })
        } catch (error) {
            console.error('Error adding shipping address:', error)
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        }
    }

    const handleRemoveAddress = async (type, index) => {
        const updatedAddresses = type === 'billing' 
            ? billingAddresses.filter((_, i) => i !== index)
            : shippingAddresses.filter((_, i) => i !== index)
        
        try {
            const response = await fetch('/api/user', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    ...userData, 
                    [type === 'billing' ? 'billingAddresses' : 'shippingAddresses']: updatedAddresses 
                })
            })
            if (!response.ok) {
                throw new Error(`Failed to remove ${type} address`)
            }
            const updatedData = await response.json()
            if (type === 'billing') {
                setBillingAddresses(updatedData.billingAddresses)
            } else {
                setShippingAddresses(updatedData.shippingAddresses)
            }
            toast({
                title: "Success",
                description: `${type.charAt(0).toUpperCase() + type.slice(1)} address removed successfully`,
            })
        } catch (error) {
            console.error(`Error removing ${type} address:`, error)
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        }
    }

    const handleEditAddress = (type, address, index) => {
        setEditingAddress({ type, address, index })
    }

    const handleUpdateAddress = async (e) => {
        e.preventDefault()
        const { type, address, index } = editingAddress
        const updatedAddresses = type === 'billing'
            ? billingAddresses.map((addr, i) => i === index ? address : addr)
            : shippingAddresses.map((addr, i) => i === index ? address : addr)

        try {
            const response = await fetch('/api/user', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...userData,
                    [type === 'billing' ? 'billingAddresses' : 'shippingAddresses']: updatedAddresses
                })
            })
            if (!response.ok) {
                throw new Error(`Failed to update ${type} address`)
            }
            const updatedData = await response.json()
            if (type === 'billing') {
                setBillingAddresses(updatedData.billingAddresses)
            } else {
                setShippingAddresses(updatedData.shippingAddresses)
            }
            setEditingAddress(null)
            toast({
                title: "Success",
                description: `${type.charAt(0).toUpperCase() + type.slice(1)} address updated successfully`,
            })
        } catch (error) {
            console.error(`Error updating ${type} address:`, error)
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        }
    }

    const renderAddressCard = (address, type, index) => (
        <Card key={index} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-4">
            <CardContent className="p-4">
                <div className="text-sm">
                    <p className="font-semibold">{address.name}</p>
                    <p className="text-gray-600 truncate">{address.email}</p>
                    <p className="text-gray-600 truncate">{address.address}</p>
                    <p className="text-gray-600">{address.phone}</p>
                </div>
                <div className="flex justify-end space-x-2 mt-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditAddress(type, address, index)}>
                        <Edit className="h-3 w-3" />
                    </Button>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Eye className="h-3 w-3" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>{type.charAt(0).toUpperCase() + type.slice(1)} Address Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-2">
                                <p><strong>Name:</strong> {address.name}</p>
                                <p><strong>Email:</strong> {address.email}</p>
                                <p><strong>Address:</strong> {address.address}</p>
                                <p><strong>Phone:</strong> {address.phone}</p>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Button variant="destructive" size="sm" onClick={() => handleRemoveAddress(type, index)}>
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )

    // Add this function to handle navigation to /orders
    const handleViewAllOrders = () => {
        router.push('/orders')
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (status === 'unauthenticated') {
        return <div>Please log in to view your account information.</div>
    }

    if (!userData) {
        return <div>No user data available. Please try refreshing the page.</div>
    }

    const totalSpent = orders.reduce((total, order) => total + order.total, 0)
    const recentOrders = orders.slice(0, 5)

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
            <Tabs defaultValue="profile">
                <TabsList>
                    <TabsTrigger value="profile"><User className="mr-2" /> Profile</TabsTrigger>
                    <TabsTrigger value="addresses"><MapPin className="mr-2" /> Addresses</TabsTrigger>
                    <TabsTrigger value="orders"><Package className="mr-2" /> Orders</TabsTrigger>
                    <TabsTrigger value="billing"><CreditCard className="mr-2" /> Billing</TabsTrigger>
                </TabsList>
                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {editMode ? (
                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            placeholder="Leave blank to keep current password"
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            'Update Profile'
                                        )}
                                    </Button>
                                </form>
                            ) : (
                                <div className="space-y-4">
                                    <p><strong>Name:</strong> {userData.name}</p>
                                    <p><strong>Email:</strong> {userData.email}</p>
                                    <Button onClick={() => setEditMode(true)}>
                                        Edit Profile
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="addresses">
                    <div className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Billing Addresses</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-4">
                                    {billingAddresses.map((address, index) => renderAddressCard(address, 'billing', index))}
                                </div>
                                {!showNewBillingForm && (
                                    <Button onClick={() => setShowNewBillingForm(true)} className="mt-4">
                                        Add New Billing Address
                                    </Button>
                                )}
                                {showNewBillingForm && (
                                    <form onSubmit={handleAddBillingAddress} className="mt-4 space-y-4">
                                        <h3 className="text-lg font-semibold">Add New Billing Address</h3>
                                        <div>
                                            <label htmlFor="billing-name" className="block text-sm font-medium text-gray-700">Name</label>
                                            <Input
                                                id="billing-name"
                                                name="name"
                                                value={newBillingAddress.name}
                                                onChange={handleBillingAddressChange}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="billing-email" className="block text-sm font-medium text-gray-700">Email (Optional)</label>
                                            <Input
                                                id="billing-email"
                                                name="email"
                                                type="email"
                                                value={newBillingAddress.email}
                                                onChange={handleBillingAddressChange}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="billing-address" className="block text-sm font-medium text-gray-700">Billing Address</label>
                                            <Textarea
                                                id="billing-address"
                                                name="address"
                                                value={newBillingAddress.address}
                                                onChange={handleBillingAddressChange}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="billing-phone" className="block text-sm font-medium text-gray-700">Phone</label>
                                            <Input
                                                id="billing-phone"
                                                name="phone"
                                                type="tel"
                                                value={newBillingAddress.phone}
                                                onChange={handleBillingAddressChange}
                                                required
                                            />
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                            <Button type="submit">Add Billing Address</Button>
                                            <Button type="button" variant="outline" onClick={() => setShowNewBillingForm(false)}>Cancel</Button>
                                        </div>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Shipping Addresses</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-4">
                                    {shippingAddresses.map((address, index) => renderAddressCard(address, 'shipping', index))}
                                </div>
                                {!showNewShippingForm && (
                                    <Button onClick={() => setShowNewShippingForm(true)} className="mt-4">
                                        Add New Shipping Address
                                    </Button>
                                )}
                                {showNewShippingForm && (
                                    <form onSubmit={handleAddShippingAddress} className="mt-4 space-y-4">
                                        <h3 className="text-lg font-semibold">Add New Shipping Address</h3>
                                        <div>
                                            <label htmlFor="shipping-name" className="block text-sm font-medium text-gray-700">Name</label>
                                            <Input
                                                id="shipping-name"
                                                name="name"
                                                value={newShippingAddress.name}
                                                onChange={handleShippingAddressChange}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="shipping-email" className="block text-sm font-medium text-gray-700">Email (Optional)</label>
                                            <Input
                                                id="shipping-email"
                                                name="email"
                                                type="email"
                                                value={newShippingAddress.email}
                                                onChange={handleShippingAddressChange}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="shipping-address" className="block text-sm font-medium text-gray-700">Shipping Address</label>
                                            <Textarea
                                                id="shipping-address"
                                                name="address"
                                                value={newShippingAddress.address}
                                                onChange={handleShippingAddressChange}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="shipping-phone" className="block text-sm font-medium text-gray-700">Phone</label>
                                            <Input
                                                id="shipping-phone"
                                                name="phone"
                                                type="tel"
                                                value={newShippingAddress.phone}
                                                onChange={handleShippingAddressChange}
                                                required
                                            />
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                            <Button type="submit">Add Shipping Address</Button>
                                            <Button type="button" variant="outline" onClick={() => setShowNewShippingForm(false)}>Cancel</Button>
                                        </div>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                <TabsContent value="orders">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {orders.length > 0 ? (
                                    <>
                                        <ul className="space-y-4">
                                            {orders.slice(0, 5).map(order => (
                                                <li key={order._id} className="border p-4 rounded-lg">
                                                    <p><strong>Order ID:</strong> {order._id}</p>
                                                    <p><strong>Status:</strong> <StatusBadge status={order.status} /></p>
                                                    <p><strong>Total:</strong> {formatCurrency(order.total)}</p>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm text-gray-500">Showing last 5 orders</p>
                                            <Button onClick={handleViewAllOrders}>
                                                View All Orders
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <p>No recent orders available.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="billing">
                    <Card>
                        <CardHeader>
                            <CardTitle>Billing Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <p><strong>Total Orders:</strong> {orders.length}</p>
                                <p><strong>Total Spent:</strong> ৳{totalSpent.toFixed(2)}</p>
                                <p><strong>Delivered Orders:</strong> {orders.filter(order => order.status === 'Delivered').length}</p>
                                <p><strong>Pending Orders:</strong> {orders.filter(order => order.status === 'Pending').length}</p>
                                <p><strong>Canceled Orders:</strong> {orders.filter(order => order.status === 'Canceled').length}</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            {editingAddress && (
                <Dialog open={!!editingAddress} onOpenChange={() => setEditingAddress(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit {editingAddress.type.charAt(0).toUpperCase() + editingAddress.type.slice(1)} Address</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleUpdateAddress} className="space-y-4">
                            <div>
                                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">Name</label>
                                <Input
                                    id="edit-name"
                                    name="name"
                                    value={editingAddress.address.name}
                                    onChange={(e) => setEditingAddress({
                                        ...editingAddress,
                                        address: { ...editingAddress.address, name: e.target.value }
                                    })}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700">Email</label>
                                <Input
                                    id="edit-email"
                                    name="email"
                                    type="email"
                                    value={editingAddress.address.email}
                                    onChange={(e) => setEditingAddress({
                                        ...editingAddress,
                                        address: { ...editingAddress.address, email: e.target.value }
                                    })}
                                />
                            </div>
                            <div>
                                <label htmlFor="edit-address" className="block text-sm font-medium text-gray-700">Address</label>
                                <Textarea
                                    id="edit-address"
                                    name="address"
                                    value={editingAddress.address.address}
                                    onChange={(e) => setEditingAddress({
                                        ...editingAddress,
                                        address: { ...editingAddress.address, address: e.target.value }
                                    })}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="edit-phone" className="block text-sm font-medium text-gray-700">Phone</label>
                                <Input
                                    id="edit-phone"
                                    name="phone"
                                    type="tel"
                                    value={editingAddress.address.phone}
                                    onChange={(e) => setEditingAddress({
                                        ...editingAddress,
                                        address: { ...editingAddress.address, phone: e.target.value }
                                    })}
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button type="submit">Update Address</Button>
                                <Button type="button" variant="outline" onClick={() => setEditingAddress(null)}>Cancel</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}
