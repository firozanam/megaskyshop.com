'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from "@/components/ui/toast-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from 'next/image'
import { uploadToBlob } from '@/lib/blobStorage'

export default function AddProductPage() {
    const [name, setName] = useState('')
    const [price, setPrice] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('')
    const [stock, setStock] = useState('')
    const [image, setImage] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImage(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            let imageUrl = ''
            if (image) {
                try {
                    imageUrl = await uploadToBlob(image)
                } catch (uploadError) {
                    console.error('Error uploading image:', uploadError)
                    toast({
                        title: "Error",
                        description: "Failed to upload image. Please try again.",
                        variant: "destructive",
                    })
                    setLoading(false)
                    return
                }
            }

            const productData = {
                name,
                price: parseFloat(price),
                description,
                category,
                stock: parseInt(stock),
                image: imageUrl
            }

            const response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData),
            })

            if (!response.ok) {
                throw new Error('Failed to add product')
            }

            toast({
                title: "Success",
                description: "Product added successfully",
            })
            router.push('/admin/products')
        } catch (error) {
            console.error('Error adding product:', error)
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-5">Add New Product</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="price">Price</Label>
                    <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Magic Condom">Magic Condom</SelectItem>
                            <SelectItem value="Dradon Condom">Dradon Condom</SelectItem>
                            <SelectItem value="Lock Love Condom">Lock Love Condom</SelectItem>
                            <SelectItem value="Love Toy Condom">Love Toy Condom</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                        id="stock"
                        type="number"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="image">Image</Label>
                    <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        required
                    />
                    {imagePreview && (
                        <div className="mt-2">
                            <Image
                                src={imagePreview}
                                alt="Product preview"
                                width={100}
                                height={100}
                                className="object-cover rounded"
                            />
                        </div>
                    )}
                </div>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Product'}
                </Button>
            </form>
        </div>
    )
}
