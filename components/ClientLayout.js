'use client'

import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Providers } from '@/components/Providers'

export function ClientLayout({ children }) {
  return (
    <Providers>
      <Header />
      {children}
      <Footer />
    </Providers>
  )
}
