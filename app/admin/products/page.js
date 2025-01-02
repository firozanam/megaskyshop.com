'use client'

import { useState, useEffect } from 'react'
import { useToast } from "@/components/ui/toast-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { getBlobImageUrl } from '@/lib/blobStorage'

export default function AdminProductsPage() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/products')
            if (!res.ok) throw new Error('Failed to fetch products')
            const data = await res.json()
            setProducts(data.products)
        } catch (error) {
            console.error('Error fetching products:', error)
            toast({
                title: "Error",
                description: "Failed to fetch products",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const deleteProduct = async (productId) => {
        if (!confirm('Are you sure you want to delete this product?')) return

        try {
            const res = await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
            })
            if (!res.ok) throw new Error('Failed to delete product')
            await fetchProducts()
            toast({
                title: "Success",
                description: "Product deleted successfully",
            })
        } catch (error) {
            console.error('Error deleting product:', error)
            toast({
                title: "Error",
                description: "Failed to delete product",
                variant: "destructive",
            })
        }
    }

    if (loading) {
        return <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-5">
                <h1 className="text-2xl font-bold">Manage Products</h1>
                <Button asChild>
                    <Link href="/admin/products/add">Add New Product</Link>
                </Button>
            </div>
            {products && products.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product._id}>
                                <TableCell>
                                    <Image 
                                        src={getBlobImageUrl(product.image) || '/images/placeholder.png'} 
                                        alt={product.name} 
                                        width={50} 
                                        height={50}
                                        className="object-cover"
                                    />
                                </TableCell>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>{formatCurrency(product.price)}</TableCell>
                                <TableCell>{product.category}</TableCell>
                                <TableCell>
                                    <Button asChild variant="outline" className="mr-2">
                                        <Link href={`/admin/products/edit/${product._id}`}>Edit</Link>
                                    </Button>
                                    <Button onClick={() => deleteProduct(product._id)} variant="destructive">
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <p>No products found.</p>
            )}
        </div>
    )
}
