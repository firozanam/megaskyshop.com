'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { StarIcon, Loader2 } from 'lucide-react'

export default function ReviewForm({ productId, onSubmit }) {
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState('')
    const [name, setName] = useState('')
    const [isAnonymous, setIsAnonymous] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        await onSubmit({ 
            rating, 
            comment, 
            name: isAnonymous ? 'Anonymous' : name, 
            isAnonymous 
        })
        setSubmitting(false)
        setRating(5)
        setComment('')
        setName('')
        setIsAnonymous(false)
    }

    return (
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
            <div>
            <p className="text-sm text-gray-600 mb-4">
              You must purchase and receive the product before submitting a review.
              You will find the review submission option in your <span>
                <Link href="/orders" className="text-primary hover:underline">( Order List ) </Link>
              </span> once the product is delivered.
            </p>
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
    )
}
