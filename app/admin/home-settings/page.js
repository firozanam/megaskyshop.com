'use client'

import { useState, useEffect, useCallback } from 'react'
import { useToast } from "@/components/ui/toast-context"
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { getBlobImageUrl } from '@/lib/blobStorage'

const getProxiedImageUrl = (url) => {
  if (!url) return '/images/placeholder.png';
  if (url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return getBlobImageUrl(url);
};

// Add this function to fetch the featured product
const fetchFeaturedProduct = async (productId) => {
  if (!productId) return null;
  try {
    const response = await fetch(`/api/products/${productId}`);
    if (!response.ok) {
      console.error(`Failed to fetch product. Status: ${response.status}`);
      throw new Error('Failed to fetch product');
    }
    const data = await response.json();
    console.log('Fetched product data:', data);
    return data.product; // Return the product object directly
  } catch (error) {
    console.error('Error fetching featured product:', error);
    return null;
  }
};

export default function AdminHomeSettingsPage() {
    const [loading, setLoading] = useState(true)
    const [featuredProductId, setFeaturedProductId] = useState('')
    const [featuredProductIds, setFeaturedProductIds] = useState([])
    const [currentProduct, setCurrentProduct] = useState(null)
    const [products, setProducts] = useState([])
    const [videoUrl, setVideoUrl] = useState('')
    const [heroHeading, setHeroHeading] = useState('')
    const [heroParagraph, setHeroParagraph] = useState('')
    const [heroImage, setHeroImage] = useState('')
    const { toast } = useToast()

    const fetchSettings = useCallback(async () => {
        try {
            const res = await fetch('/api/settings/home')
            if (!res.ok) throw new Error('Failed to fetch settings')
            const data = await res.json()
            console.log('Fetched settings:', data) // Add this line
            setFeaturedProductId(data.featuredProductId || '')
            setFeaturedProductIds(data.featuredProductIds || [])
            setVideoUrl(data.videoUrl || '')
            setHeroHeading(data.heroHeading || '')
            setHeroParagraph(data.heroParagraph || '')
            setHeroImage(data.heroImage || '')
            
            // Fetch the featured product immediately after setting the ID
            if (data.featuredProductId) {
                const product = await fetchFeaturedProduct(data.featuredProductId)
                setCurrentProduct(product)
            }
        } catch (error) {
            console.error('Error fetching settings:', error)
            toast({
                title: "Error",
                description: "Failed to fetch home settings",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }, [toast])

    const fetchProducts = useCallback(async () => {
        try {
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
        }
    }, [toast])

    useEffect(() => {
        fetchSettings()
        fetchProducts()
    }, [fetchSettings, fetchProducts])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch('/api/settings/home', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ featuredProductId, featuredProductIds, videoUrl, heroHeading, heroParagraph, heroImage }),
            })
            if (!res.ok) throw new Error('Failed to update settings')
            toast({
                title: "Success",
                description: "Home settings updated successfully",
            })
            // Refetch the current product after updating settings
            if (featuredProductId) {
                const updatedProduct = await fetchFeaturedProduct(featuredProductId);
                setCurrentProduct(updatedProduct);
            }
        } catch (error) {
            console.error('Error updating settings:', error)
            toast({
                title: "Error",
                description: "Failed to update home settings",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleFeaturedProductChange = (selectedId) => {
        if (selectedId && !featuredProductIds.includes(selectedId)) {
            if (featuredProductIds.length < 4) {
                setFeaturedProductIds([...featuredProductIds, selectedId])
            } else {
                toast({
                    title: "Warning",
                    description: "You can select a maximum of 4 featured products",
                    variant: "warning",
                })
            }
        }
    }

    const removeFeaturedProduct = (id) => {
        setFeaturedProductIds(featuredProductIds.filter(productId => productId !== id))
    }

    const validateImageUrl = (url) => {
        return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
    };

    const handleHeroImageChange = (e) => {
        const url = e.target.value;
        setHeroImage(url);
        if (!validateImageUrl(url)) {
            toast({
                title: "Warning",
                description: "Please enter a valid image URL (starting with / for local images or http:// or https:// for external images)",
                variant: "warning",
            });
        }
    };

    // Add this effect to fetch the product when the ID changes
    useEffect(() => {
        console.log('featuredProductId changed:', featuredProductId);
        const loadFeaturedProduct = async () => {
            if (featuredProductId) {
                const product = await fetchFeaturedProduct(featuredProductId);
                console.log('Fetched product:', product);
                setCurrentProduct(product);
            } else {
                setCurrentProduct(null);
            }
        };
        loadFeaturedProduct();
    }, [featuredProductId]);

    // Add this near the top of your component function
    console.log('Current Product:', currentProduct);
    console.log('Featured Product ID:', featuredProductId);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Home Page Settings</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Home Page Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="featuredProduct" className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Promoted Product Here
                                </label>
                                <Select
                                    value={featuredProductId}
                                    onValueChange={(value) => {
                                        console.log('Selected product ID:', value) // Add this line
                                        setFeaturedProductId(value)
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a product" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.map((product) => (
                                            <SelectItem key={product._id} value={product._id}>
                                                {product.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label htmlFor="featuredProducts" className="block text-sm font-medium text-gray-700 mb-1">
                                    Featured Products (Select up to 4)
                                </label>
                                <Select
                                    value=""
                                    onValueChange={handleFeaturedProductChange}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Add a featured product" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.map((product) => (
                                            <SelectItem key={product._id} value={product._id}>
                                                {product.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div className="mt-2 space-y-2">
                                    {featuredProductIds.map((id) => {
                                        const product = products.find(p => p._id === id)
                                        return product ? (
                                            <div key={id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                                                <div className="flex items-center space-x-2">
                                                    <div className="relative aspect-square rounded-sm overflow-hidden">
                                                        <Image
                                                            src={product.image ? getProxiedImageUrl(product.image) : "/images/placeholder.png"}
                                                            alt={product.name}
                                                            width={50}
                                                            height={50}
                                                            style={{ objectFit: "cover" }}
                                                            className="rounded"
                                                        />
                                                    </div>
                                                    <span>{product.name}</span>
                                                </div>
                                                <Button 
                                                    onClick={() => removeFeaturedProduct(id)}
                                                    variant="ghost"
                                                    size="sm"
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        ) : null
                                    })}
                                </div>
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    'Update Settings'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Current Promoted Product</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {console.log('Rendering current product:', currentProduct)}
                        {currentProduct ? (
                            <div className="space-y-4">
                                <div className="border border-gray-200 p-4 rounded-lg">
                                    <div className="relative w-full h-[300px]">
                                        <Image
                                            src={currentProduct.image ? getProxiedImageUrl(currentProduct.image) : "/images/placeholder.png"}
                                            alt={currentProduct.name || "Product image"}
                                            layout="fill"
                                            objectFit="contain"
                                            className="rounded-md"
                                            priority
                                        />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold">{currentProduct.name}</h3>
                                <p className="text-sm line-clamp-3">{currentProduct.description}</p>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm"><span className="font-semibold">Category:</span> {currentProduct.category || 'N/A'}</p>
                                    <p className="text-2xl font-bold">{formatCurrency(currentProduct.price)}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500">No main featured product selected</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Hero Section & YouTube Video</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4 w-full">
                            <div>
                                <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-1">
                                    YouTube Video URL
                                </label>
                                <Input
                                    id="videoUrl"
                                    type="text"
                                    value={videoUrl}
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                    placeholder="Enter YouTube embed URL"
                                />
                            </div>
                            <div>
                                <label htmlFor="heroHeading" className="block text-sm font-medium text-gray-700 mb-1">
                                    Hero Heading
                                </label>
                                <Input
                                    id="heroHeading"
                                    type="text"
                                    value={heroHeading}
                                    onChange={(e) => setHeroHeading(e.target.value)}
                                    placeholder="Enter hero heading"
                                />
                            </div>
                            <div>
                                <label htmlFor="heroParagraph" className="block text-sm font-medium text-gray-700 mb-1">
                                    Hero Paragraph
                                </label>
                                <Textarea
                                    id="heroParagraph"
                                    value={heroParagraph}
                                    onChange={(e) => setHeroParagraph(e.target.value)}
                                    placeholder="Enter hero paragraph"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label htmlFor="heroImage" className="block text-sm font-medium text-gray-700 mb-1">
                                    Hero Image URL
                                </label>
                                <Input
                                    id="heroImage"
                                    type="text"
                                    value={heroImage}
                                    onChange={handleHeroImageChange}
                                    placeholder="Enter hero image URL (e.g., /images/hero.jpg or https://example.com/image.jpg)"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Enter a local image path (starting with /) or a full URL (starting with http:// or https://).
                                    For best results, use local images or images from stable hosting services.
                                </p>
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    'Update Settings'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}
