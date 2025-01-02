'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
    const [cart, setCart] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
            setCart(JSON.parse(savedCart))
        }
        setIsLoading(false)
    }, [])

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart))
    }, [cart])

    const addToCart = (product) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.id === product.id)
            if (existingItem) {
                return prevCart.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                )
            }
            return [...prevCart, { 
                id: product.id, 
                name: product.name, 
                price: parseFloat(product.price) || 0, 
                quantity: 1,
                image: product.image
            }]
        })
    }

    const updateQuantity = (id, quantity) => {
        setCart((prevCart) =>
            prevCart.map((item) =>
                item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
            )
        )
    }

    const removeFromCart = (id) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== id))
    }

    return (
        <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, isLoading }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    return useContext(CartContext)
}
