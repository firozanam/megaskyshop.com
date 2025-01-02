'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useToast } from "@/components/ui/toast-context"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, StarIcon } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { getBlobImageUrl } from '@/lib/blobStorage'

export default function SubmitReviewPage({ params }) {
    const [product, setProduct] = useState(null)
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState('')
    const [name, setName] = useState('')
    const [isAnonymous, setIsAnonymous] = useState(false)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const { data: session, status } = useSession()
    const { toast } = useToast()
    const router = useRouter()

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`/api/products/${params.id}`)
                if (!response.ok) {
                    throw new Error('Failed to fetch product')
                }
                const data = await response.json()
                data.product.image = getBlobImageUrl(data.product.image)
                setProduct(data.product)
                setName(session?.user?.name || '')
            } catch (error) {
                console.error('Error fetching product:', error)
                toast({
                    title: "Error",
                    description: "Failed to load product information",
                    variant: "destructive",
                })
            } finally {
                setLoading(false)
            }
        }

        if (status === 'authenticated') {
            fetchProduct()
        } else if (status === 'unauthenticated') {
            router.push('/login')
        }
    }, [params.id, status, toast, router, session])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const response = await fetch(`/api/products/${params.id}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    rating, 
                    comment, 
                    name: isAnonymous ? 'Anonymous' : name,
                    isAnonymous 
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to submit review')
            }

            toast({
                title: "Success",
                description: "Your review has been submitted successfully",
            })
            router.push(`/products/${params.id}`)
        } catch (error) {
            console.error('Error submitting review:', error)
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
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
                </div>
            </div>
            <h2 className="text-2xl font-bold mb-6">Submit Review for {product.name}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="rating" className="block text-sm font-medium text-gray-700">Rating</label>
                    <div className="flex items-center mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <StarIcon
                                key={star}
                                className={`h-6 w-6 cursor-pointer ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                onClick={() => setRating(star)}
                            />
                        ))}
                    </div>
                </div>
                {!isAnonymous && (
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required={!isAnonymous}
                        />
                    </div>
                )}
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="anonymous"
                        checked={isAnonymous}
                        onCheckedChange={setIsAnonymous}
                    />
                    <label htmlFor="anonymous" className="text-sm font-medium text-gray-700">
                        Submit as anonymous
                    </label>
                </div>
                <div>
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Comment</label>
                    <Textarea
                        id="comment"
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                    />
                </div>
                <Button type="submit" disabled={submitting}>
                    {submitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        'Submit Review'
                    )}
                </Button>
            </form>
        </div>
    )
}
