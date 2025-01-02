'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { useToast } from "@/components/ui/toast-context"
import { Loader2, Eye, Edit, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export default function AdminUsersPage() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [viewDialogOpen, setViewDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [userToDelete, setUserToDelete] = useState(null)
    const [userToView, setUserToView] = useState(null)
    const [userToEdit, setUserToEdit] = useState(null)
    const [adminPassword, setAdminPassword] = useState('')
    const { toast } = useToast()

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users')
            if (!res.ok) throw new Error('Failed to fetch users')
            const data = await res.json()
            setUsers(data)
        } catch (error) {
            console.error('Error fetching users:', error)
            toast({
                title: "Error",
                description: "Failed to fetch users",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleViewUser = (user) => {
        setUserToView(user)
        setViewDialogOpen(true)
    }

    const handleUpdateUser = (user) => {
        setUserToEdit({ ...user })
        setEditDialogOpen(true)
    }

    const handleDeleteUser = (user) => {
        setUserToDelete(user)
        setDeleteDialogOpen(true)
    }

    const confirmDeleteUser = async () => {
        if (!userToDelete) return

        try {
            const res = await fetch(`/api/admin/users/${userToDelete._id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminPassword: userToDelete.isAdmin ? adminPassword : undefined }),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Failed to delete user')
            }

            setUsers(users.filter(user => user._id !== userToDelete._id))
            toast({
                title: "Success",
                description: "User deleted successfully",
            })
        } catch (error) {
            console.error('Error deleting user:', error)
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setDeleteDialogOpen(false)
            setUserToDelete(null)
            setAdminPassword('')
        }
    }

    const confirmUpdateUser = async () => {
        if (!userToEdit) return

        try {
            const res = await fetch(`/api/admin/users/${userToEdit._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userToEdit),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Failed to update user')
            }

            setUsers(users.map(user => user._id === userToEdit._id ? userToEdit : user))
            toast({
                title: "Success",
                description: "User updated successfully",
            })
        } catch (error) {
            console.error('Error updating user:', error)
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setEditDialogOpen(false)
            setUserToEdit(null)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-5">Manage Users</h1>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user._id}>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.isAdmin ? 'Admin' : 'User'}</TableCell>
                            <TableCell>
                                <div className="flex space-x-2">
                                    <Button
                                        onClick={() => handleViewUser(user)}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        onClick={() => handleUpdateUser(user)}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        onClick={() => handleDeleteUser(user)}
                                        variant="outline"
                                        size="sm"
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* View User Dialog */}
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        {userToView && (
                            <div>
                                <p><strong>Name:</strong> {userToView.name}</p>
                                <p><strong>Email:</strong> {userToView.email}</p>
                                <p><strong>Role:</strong> {userToView.isAdmin ? 'Admin' : 'User'}</p>
                            </div>
                        )}
                    </DialogDescription>
                    <DialogFooter>
                        <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        {userToEdit && (
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={userToEdit.name}
                                        onChange={(e) => setUserToEdit({ ...userToEdit, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        value={userToEdit.email}
                                        onChange={(e) => setUserToEdit({ ...userToEdit, email: e.target.value })}
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="isAdmin"
                                        checked={userToEdit.isAdmin}
                                        onCheckedChange={(checked) => setUserToEdit({ ...userToEdit, isAdmin: checked })}
                                    />
                                    <Label htmlFor="isAdmin">Is Admin</Label>
                                </div>
                            </div>
                        )}
                    </DialogDescription>
                    <DialogFooter>
                        <Button onClick={() => setEditDialogOpen(false)} variant="outline">Cancel</Button>
                        <Button onClick={confirmUpdateUser}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete User Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Delete User</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        Are you sure you want to delete this user? This action cannot be undone.
                    </DialogDescription>
                    {userToDelete?.isAdmin && (
                        <div className="mt-4">
                            <Label htmlFor="adminPassword">Admin Password</Label>
                            <Input
                                type="password"
                                id="adminPassword"
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setDeleteDialogOpen(false)} variant="outline">
                            Cancel
                        </Button>
                        <Button onClick={confirmDeleteUser} variant="destructive">
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
