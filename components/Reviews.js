'use client';

import React, { useState, useEffect } from 'react';
import ReviewItem from './ReviewItem';

export default function Reviews({ productId, initialReviews = [] }) {
    const [reviews, setReviews] = useState(initialReviews);

    useEffect(() => {
        if (Array.isArray(initialReviews)) {
            setReviews(initialReviews);
        } else {
            console.error('initialReviews is not an array:', initialReviews);
            setReviews([]);
        }
    }, [initialReviews]);

    return (
        <div>
            <h2>Customer Reviews</h2>
            {reviews.length > 0 ? (
                reviews.map((review) => (
                    <ReviewItem key={review._id} review={review} />
                ))
            ) : (
                <p>No reviews yet.</p>
            )}
        </div>
    );
}
