'use client'

import { useState, useEffect, useCallback } from 'react'
import { useToast } from "@/components/ui/toast-context"
import { Loader2, TrendingUp, TrendingDown, DollarSign, Package, ShoppingCart, Users, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'

export default function AdminDashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [timeRange, setTimeRange] = useState('7d')
    const { toast } = useToast()

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/admin/stats?timeRange=${timeRange}`)
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`)
            }
            const data = await res.json()
            setStats(data)
            console.log('Fetched stats:', data)
        } catch (error) {
            console.error('Error fetching admin stats:', error)
            toast({
                title: "Error",
                description: "Failed to fetch admin stats. Please try again later.",
                variant: "destructive",
            })
            setStats(null) // Reset stats on error
        } finally {
            setLoading(false)
        }
    }, [timeRange, toast])

    useEffect(() => {
        fetchStats()
    }, [fetchStats])

    const StatCard = ({ title, value, icon, change }) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {change !== undefined && (
                    <p className={`text-xs ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {change >= 0 ? <TrendingUp className="inline mr-1" /> : <TrendingDown className="inline mr-1" />}
                        {Math.abs(change).toFixed(2)}% from last period
                    </p>
                )}
            </CardContent>
        </Card>
    )

    if (loading) {
        return <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    }

    // Ensure that stats object and its properties exist before rendering
    const hasStats = stats && typeof stats === 'object'
    const orderTrend = hasStats && Array.isArray(stats.orderTrend) ? stats.orderTrend : []
    const revenueTrend = hasStats && Array.isArray(stats.revenueTrend) ? stats.revenueTrend : []
    const topProducts = hasStats && Array.isArray(stats.topProducts) ? stats.topProducts : []

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-5">Admin Dashboard</h1>
            
            <div className="flex justify-between items-center mb-5">
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last 90 days</SelectItem>
                    </SelectContent>
                </Select>
                <Button onClick={fetchStats} disabled={loading}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : hasStats ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <StatCard 
                            title="Total Users" 
                            value={stats.totalUsers || 0} 
                            icon={<Users className="h-4 w-4 text-muted-foreground" />}
                            change={stats.totalUsersChange}
                        />
                        <StatCard 
                            title="Total Products" 
                            value={stats.totalProducts || 0} 
                            icon={<Package className="h-4 w-4 text-muted-foreground" />}
                            change={stats.totalProductsChange}
                        />
                        <StatCard 
                            title="Total Orders" 
                            value={stats.totalOrders || 0} 
                            icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
                            change={stats.totalOrdersChange}
                        />
                        <StatCard 
                            title="Total Revenue" 
                            value={formatCurrency(stats.totalRevenue || 0)} 
                            icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
                            change={stats.totalRevenueChange}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Trend</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={orderTrend}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="orders" stroke="#8884d8" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Revenue Trend</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={revenueTrend}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="revenue" stroke="#82ca9d" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Top Selling Products</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={topProducts}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="totalSales" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </>
            ) : (
                <div className="text-center py-10">
                    <p>Failed to load stats. Please try again.</p>
                    <Button onClick={fetchStats} className="mt-4">
                        Retry
                    </Button>
                </div>
            )}
        </div>
    )
}
