"use client"

import { ToastProvider } from '@/components/ui/toast'
import { ToastContext } from '@/components/ui/toast'
import { useState, useCallback } from 'react'

export default function ClientToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback(({ title, description, action, ...props }) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prevToasts) => [
      ...prevToasts,
      { id, title, description, action, ...props },
    ])
  }, [])

  const dismiss = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      <ToastProvider>
        {children}
        {/* Render toasts here */}
      </ToastProvider>
    </ToastContext.Provider>
  )
}
