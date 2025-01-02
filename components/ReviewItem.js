import React from 'react'

export default function ReviewItem({ review }) {
    return (
        <div className="border-b py-4">
            <div className="flex items-center mb-2">
                <span className="font-bold mr-2">{review.name || 'Anonymous'}</span>
                <span className="text-yellow-500">{'★'.repeat(review.rating)}</span>
            </div>
            <p>{review.comment}</p>
            <p className="text-sm text-gray-500 mt-1">
                {new Date(review.createdAt).toLocaleDateString()}
            </p>
        </div>
    )
}
