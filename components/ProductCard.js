import Image from 'next/image'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useToast } from "@/components/ui/toast-context"
import SafeImage from './SafeImage'
import { getBlobImageUrl } from '@/lib/blobStorage'

export default function ProductCard({ product }) {
    const [imgSrc, setImgSrc] = useState(getBlobImageUrl(product.image))
    const [addingToCart, setAddingToCart] = useState(false)
    const { addToCart } = useCart()
    const { toast } = useToast()

    useEffect(() => {
        if (product.image) {
            setImgSrc(getBlobImageUrl(product.image))
        }
    }, [product.image])

    const handleAddToCart = async () => {
        setAddingToCart(true)
        try {
            await addToCart(product)
            toast({
                title: "Success",
                description: "Product added to cart",
            })
        } catch (error) {
            console.error('Error adding to cart:', error)
            toast({
                title: "Error",
                description: "Failed to add product to cart",
                variant: "destructive",
            })
        } finally {
            setAddingToCart(false)
        }
    }

    return (
        <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden flex flex-col h-full group">
            <div className="relative w-full pt-[100%] overflow-hidden">
                <SafeImage
                    src={imgSrc}
                    alt={product.name}
                    layout="fill"
                    objectFit="cover"
                    onError={() => setImgSrc('/images/placeholder.png')}
                    className="group-hover:scale-110 transition-transform duration-500"
                />
                {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-lg font-semibold">Out of Stock</span>
                    </div>
                )}
            </div>
            <div className="p-6 flex flex-col flex-grow bg-gradient-to-b from-transparent to-card/5">
                <h3 className="text-lg font-semibold mb-2 line-clamp-2 h-14 text-foreground group-hover:text-[hsl(var(--primary))] transition-colors">{product.name}</h3>
                <p className="text-xl font-bold mb-4 mt-auto text-[hsl(var(--primary))]">{formatCurrency(product.price)}</p>
                <div className="flex items-center gap-2 mt-auto">
                    <Button
                        onClick={handleAddToCart}
                        disabled={addingToCart || product.stock <= 0}
                        variant={product.stock <= 0 ? "outline" : "default"}
                        className="flex-1 whitespace-nowrap"
                    >
                        {addingToCart ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Adding...
                            </>
                        ) : product.stock <= 0 ? (
                            'Out of Stock'
                        ) : (
                            'Add to Cart'
                        )}
                    </Button>
                    <Button 
                        variant="outline"
                        className="flex-1 whitespace-nowrap hover:bg-[hsl(var(--primary))] hover:text-white transition-colors"
                        asChild
                    >
                        <Link href={`/products/${product._id}`}>View Details</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
