'use client'

import { useState, useEffect } from 'react'
import { useToast } from "@/components/ui/toast-context"
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function StorageSettingsPage() {
    const [loading, setLoading] = useState(true)
    const [activeStorage, setActiveStorage] = useState('local')
    const [settings, setSettings] = useState({
        local: {
            enabled: true,
            path: '/uploads'
        },
        vercelBlob: {
            enabled: false,
            token: ''
        },
        s3: {
            enabled: false,
            accessKey: '',
            secretKey: '',
            bucket: '',
            region: ''
        }
    })
    const { toast } = useToast()

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/storage-settings')
            if (!res.ok) throw new Error('Failed to fetch settings')
            const data = await res.json()
            if (data.settings) {
                setSettings(data.settings)
                // Set active storage based on which one is enabled
                if (data.settings.vercelBlob?.enabled) setActiveStorage('vercelBlob')
                else if (data.settings.s3?.enabled) setActiveStorage('s3')
                else setActiveStorage('local')
            }
        } catch (error) {
            console.error('Error fetching storage settings:', error)
            toast({
                title: "Error",
                description: "Failed to fetch storage settings",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch('/api/admin/storage-settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings }),
            })
            if (!res.ok) throw new Error('Failed to update settings')
            toast({
                title: "Success",
                description: "Storage settings updated successfully",
            })
        } catch (error) {
            console.error('Error updating storage settings:', error)
            toast({
                title: "Error",
                description: "Failed to update storage settings",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleStorageToggle = (type) => {
        setSettings(prev => ({
            ...prev,
            local: {
                ...prev.local,
                enabled: type === 'local'
            },
            vercelBlob: {
                ...prev.vercelBlob,
                enabled: type === 'vercelBlob'
            },
            s3: {
                ...prev.s3,
                enabled: type === 's3'
            }
        }))
        setActiveStorage(type)
    }

    if (loading) {
        return <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-5">Storage Settings</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Storage Provider</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="local-storage">Local Storage</Label>
                                <Switch
                                    id="local-storage"
                                    checked={settings.local.enabled}
                                    onCheckedChange={() => handleStorageToggle('local')}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="vercel-blob">Vercel Blob Storage</Label>
                                <Switch
                                    id="vercel-blob"
                                    checked={settings.vercelBlob.enabled}
                                    onCheckedChange={() => handleStorageToggle('vercelBlob')}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="s3">Amazon S3</Label>
                                <Switch
                                    id="s3"
                                    checked={settings.s3.enabled}
                                    onCheckedChange={() => handleStorageToggle('s3')}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Tabs value={activeStorage} className="w-full">
                    <TabsList className="w-full">
                        <TabsTrigger value="local" className="flex-1">Local Storage</TabsTrigger>
                        <TabsTrigger value="vercelBlob" className="flex-1">Vercel Blob</TabsTrigger>
                        <TabsTrigger value="s3" className="flex-1">Amazon S3</TabsTrigger>
                    </TabsList>

                    <TabsContent value="local">
                        <Card>
                            <CardHeader>
                                <CardTitle>Local Storage Configuration</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="local-path">Upload Path</Label>
                                        <Input
                                            id="local-path"
                                            value={settings.local.path}
                                            onChange={(e) => setSettings(prev => ({
                                                ...prev,
                                                local: { ...prev.local, path: e.target.value }
                                            }))}
                                            placeholder="/uploads"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="vercelBlob">
                        <Card>
                            <CardHeader>
                                <CardTitle>Vercel Blob Configuration</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="blob-token">Blob Storage Token</Label>
                                        <Input
                                            id="blob-token"
                                            type="password"
                                            value={settings.vercelBlob.token}
                                            onChange={(e) => setSettings(prev => ({
                                                ...prev,
                                                vercelBlob: { ...prev.vercelBlob, token: e.target.value }
                                            }))}
                                            placeholder="Enter your Vercel Blob storage token"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="s3">
                        <Card>
                            <CardHeader>
                                <CardTitle>Amazon S3 Configuration</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="access-key">Access Key</Label>
                                        <Input
                                            id="access-key"
                                            value={settings.s3.accessKey}
                                            onChange={(e) => setSettings(prev => ({
                                                ...prev,
                                                s3: { ...prev.s3, accessKey: e.target.value }
                                            }))}
                                            placeholder="Enter your AWS access key"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="secret-key">Secret Key</Label>
                                        <Input
                                            id="secret-key"
                                            type="password"
                                            value={settings.s3.secretKey}
                                            onChange={(e) => setSettings(prev => ({
                                                ...prev,
                                                s3: { ...prev.s3, secretKey: e.target.value }
                                            }))}
                                            placeholder="Enter your AWS secret key"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="bucket">Bucket Name</Label>
                                        <Input
                                            id="bucket"
                                            value={settings.s3.bucket}
                                            onChange={(e) => setSettings(prev => ({
                                                ...prev,
                                                s3: { ...prev.s3, bucket: e.target.value }
                                            }))}
                                            placeholder="Enter your S3 bucket name"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="region">Region</Label>
                                        <Input
                                            id="region"
                                            value={settings.s3.region}
                                            onChange={(e) => setSettings(prev => ({
                                                ...prev,
                                                s3: { ...prev.s3, region: e.target.value }
                                            }))}
                                            placeholder="e.g., us-east-1"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <Button type="submit" disabled={loading} className="w-full">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Settings
                </Button>
            </form>
        </div>
    )
}
