'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import { useToast } from "@/components/ui/toast-context"

export default function AddToCartButton({ product }) {
    const [isAdding, setIsAdding] = useState(false)
    const { addToCart } = useCart()
    const { toast } = useToast()

    const handleAddToCart = async () => {
        setIsAdding(true)
        try {
            await addToCart(product)
            toast({
                title: "Success",
                description: "Product added to cart",
            })
        } catch (error) {
            console.error('Error adding to cart:', error)
            toast({
                title: "Error",
                description: "Failed to add product to cart",
                variant: "destructive",
            })
        } finally {
            setIsAdding(false)
        }
    }

    return (
        <Button onClick={handleAddToCart} disabled={isAdding}>
            {isAdding ? 'Adding...' : 'Add to Cart'}
        </Button>
    )
}
