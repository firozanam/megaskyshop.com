import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from "@/components/ui/toast-context"
import Link from 'next/link'

export default function AuthDialog({ onClose, onGuestCheckout }) {
    const [isLogin, setIsLogin] = useState(true)
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const router = useRouter()
    const { toast } = useToast()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (isLogin) {
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
                onClose()
            }
        } else {
            if (password !== confirmPassword) {
                toast({
                    title: "Error",
                    description: "Passwords do not match",
                    variant: "destructive",
                })
                return
            }
            try {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: fullName, email, password }),
                })
                if (res.ok) {
                    await signIn('credentials', {
                        redirect: false,
                        email,
                        password,
                    })
                    onClose()
                } else {
                    const data = await res.json()
                    throw new Error(data.error || 'Registration failed')
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: error.message,
                    variant: "destructive",
                })
            }
        }
    }

    return (
        <Dialog open={true} onOpenChange={() => {}}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-3xl font-bold">
                        {isLogin ? 'Login' : 'Create an Account'}
                    </DialogTitle>
                    <DialogDescription className="text-base text-gray-500">
                        {isLogin 
                            ? 'Log in to your account or continue as a guest.'
                            : 'Join our community and enjoy exclusive benefits!'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    {!isLogin && (
                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                            <Input
                                id="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required={!isLogin}
                                className="w-full"
                            />
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full"
                        />
                    </div>
                    {!isLogin && (
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required={!isLogin}
                                className="w-full"
                            />
                        </div>
                    )}
                    <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 text-white">
                        {isLogin ? 'Login' : 'Register'}
                    </Button>
                </form>
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <Button
                            variant="link"
                            className="p-0 text-blue-600 hover:underline"
                            onClick={() => setIsLogin(!isLogin)}
                        >
                            {isLogin ? 'Sign up now' : 'Log in here'}
                        </Button>
                    </p>
                </div>
                {isLogin && (
                    <div className="mt-4">
                        <Button 
                            onClick={onGuestCheckout} 
                            variant="secondary" 
                            className="w-full bg-pink-100 text-pink-600 hover:bg-pink-200"
                        >
                            Continue as Guest
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
