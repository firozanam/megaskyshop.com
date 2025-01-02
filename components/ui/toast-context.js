"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'
import { ToastProvider as RadixToastProvider } from './toast'
import { Toaster } from './Toaster'

const ToastContext = createContext()

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((toast) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prevToasts) => [...prevToasts, { id, ...toast }])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }, [])

  const toast = useCallback((props) => {
    addToast(props)
  }, [addToast])

  return (
    <ToastContext.Provider value={{ toast, removeToast, toasts }}>
      <RadixToastProvider>
        {children}
        <Toaster />
      </RadixToastProvider>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
