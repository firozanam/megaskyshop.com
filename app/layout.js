import { Inter } from 'next/font/google'
import './globals.css'
import './layout.css'
import { Providers } from '@/components/Providers'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { CartProvider } from '@/contexts/CartContext'
import { ToastProvider } from '@/components/ui/toast-context'
import ErrorBoundary from '@/components/ErrorBoundary'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

export const metadata = {
  title: 'Megaskyshop',
  description: 'Description of your app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} flex flex-col min-h-screen`} suppressHydrationWarning={true}>
        <CartProvider>
          <Providers>
            <ToastProvider>
              <Navbar />
              <main className="flex-1 flex flex-col bg-background">
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </main>
              <Footer />
            </ToastProvider>
          </Providers>
        </CartProvider>
      </body>
    </html>
  )
}
