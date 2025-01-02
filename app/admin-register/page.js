'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AdminRegisterPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [adminCode, setAdminCode] = useState('')
    const [error, setError] = useState('')
    const router = useRouter()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        try {
            const res = await fetch('/api/auth/register-admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, adminCode }),
            })

            if (res.ok) {
                router.push('/login')
            } else {
                const data = await res.json()
                setError(data.error || 'Registration failed')
            }
        } catch (error) {
            setError('An error occurred. Please try again.')
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Admin Registration</h1>
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="adminCode">Admin Code</Label>
                        <Input
                            id="adminCode"
                            type="password"
                            value={adminCode}
                            onChange={(e) => setAdminCode(e.target.value)}
                            required
                        />
                    </div>
                </div>
                {error && <p className="text-red-500 mt-4">{error}</p>}
                <Button type="submit" className="w-full mt-6">
                    Register as Admin
                </Button>
            </form>
        </div>
    )
}
