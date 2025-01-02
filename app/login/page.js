'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast-context'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    })
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      // Fetch user data to check if the user is an admin
      const userResponse = await fetch('/api/user')
      if (userResponse.ok) {
        const userData = await userResponse.json()
        if (userData.isAdmin) {
          router.push('/admin')
        } else {
          router.push('/')
        }
      } else {
        router.push('/')
      }
    }
  }

  return (
    <div className="flex-1 bg-background flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <h2 className="text-center text-3xl font-bold text-foreground mb-6">
          Login
        </h2>
        <div className="bg-card text-card-foreground rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Register now
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
