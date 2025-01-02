'use client'

import { useState, useEffect } from 'react'
import ProductCard from '@/components/ProductCard'
import { Loader2 } from 'lucide-react'
import { useToast } from "@/components/ui/toast-context"
import { getBlobImageUrl } from '@/lib/blobStorage'

export default function ProductsPage() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/products')
                if (!res.ok) throw new Error('Failed to fetch products')
                const data = await res.json()
                const productsWithBlobImages = data.products.map(product => ({
                    ...product,
                    image: getBlobImageUrl(product.image)
                }))
                setProducts(productsWithBlobImages)
            } catch (error) {
                console.error('Error fetching products:', error)
                toast({
                    title: "Error",
                    description: "Failed to load products",
                    variant: "destructive",
                })
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [toast])

    if (loading) {
        return <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">All Products</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>
        </div>
    )
}
