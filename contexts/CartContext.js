'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const CartContext = createContext()

export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadCart = () => {
            const savedCart = localStorage.getItem('cart')
            if (savedCart) {
                setCart(JSON.parse(savedCart))
            }
            setIsLoading(false)
        }
        loadCart()
    }, [])

    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem('cart', JSON.stringify(cart))
        }
    }, [cart, isLoading])

    const addToCart = useCallback((product, quantity = 1) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item._id === product._id)
            if (existingItem) {
                return prevCart.map(item =>
                    item._id === product._id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                )
            } else {
                return [...prevCart, { ...product, quantity }]
            }
        })
    }, [])

    const updateQuantity = useCallback((productId, quantity) => {
        setCart(prevCart =>
            prevCart.map(item =>
                item._id === productId ? { ...item, quantity } : item
            )
        )
    }, [])

    const removeFromCart = useCallback((productId) => {
        setCart(prevCart => prevCart.filter(item => item._id !== productId))
    }, [])

    const clearCart = useCallback(() => {
        setCart([])
        localStorage.removeItem('cart')
    }, [])

    const getCartItemCount = useCallback(() => {
        return cart.reduce((total, item) => total + item.quantity, 0)
    }, [cart])

    const getCartTotal = useCallback(() => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0)
    }, [cart])

    const value = {
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartItemCount,
        getCartTotal,
        isLoading
    }

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    )
}
