'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useToast } from "@/components/ui/toast-context"
import Reviews from '@/components/Reviews'
import ReviewForm from '@/components/ReviewForm'
import { formatCurrency } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import { Loader2 } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { Input } from '@/components/ui/input'
import { getBlobImageUrl } from '@/lib/blobStorage'

export default function ProductPage({ params }) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [canReview, setCanReview] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const router = useRouter()
  const { addToCart } = useCart()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch product')
        }
        const data = await response.json()
        // Ensure reviews is always an array
        data.product.reviews = Array.isArray(data.product.reviews) ? data.product.reviews : [];
        data.product.image = getBlobImageUrl(data.product.image)
        setProduct(data.product)

        // Check if the user can review
        if (session?.user) {
          const orderResponse = await fetch(`/api/orders?productId=${params.id}`)
          if (orderResponse.ok) {
            const orderData = await orderResponse.json()
            setCanReview(orderData.canReview)
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error)
        toast({
          title: "Error",
          description: "Failed to load product details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id, session, toast])

  const handleReviewSubmit = async (reviewData) => {
    try {
      const response = await fetch(`/api/products/${params.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit review')
      }

      const { review } = await response.json()
      setProduct(prevProduct => ({
        ...prevProduct,
        reviews: [...(prevProduct.reviews || []), review]
      }))

      toast({
        title: "Success",
        description: "Your review has been submitted successfully",
      })
      setCanReview(false)
    } catch (error) {
      console.error('Error submitting review:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      })
    }
  }

  const handleAddToCart = () => {
    addToCart(product, quantity)
    toast({
      title: "Success",
      description: `Added ${quantity} ${quantity > 1 ? 'items' : 'item'} to cart`,
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!product) {
    return <div>Product not found</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <Image
            src={product.image}
            alt={product.name}
            width={500}
            height={500}
            className="rounded-lg"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-2xl font-semibold mb-4">{formatCurrency(product.price)}</p>
          <p className="mb-4">{product.description}</p>
          <p className="mb-4">Category: {product.category}</p>
          <p className="mb-4">In Stock: {product.stock}</p>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-4">
              <Input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                className="w-20"
              />
              <Button onClick={handleAddToCart} disabled={product.stock === 0} className="flex-grow">
                Add to Cart
              </Button>
            </div>
            <Button onClick={() => router.push(`/products/${params.id}/review`)} variant="outline" className="w-full">
              Write a Review
            </Button>
          </div>
        </div>
      </div>
      {canReview && <ReviewForm onSubmit={handleReviewSubmit} />}
      <Reviews productId={params.id} initialReviews={product.reviews} />
    </div>
  )
}
