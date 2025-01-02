'use client'

import { SessionProvider } from "next-auth/react"
import { ToastProvider } from '@/components/ui/toast-context'
import { CartProvider } from '@/contexts/CartContext'

export function Providers({ children }) {
  return (
    <SessionProvider>
      <CartProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </CartProvider>
    </SessionProvider>
  )
}
