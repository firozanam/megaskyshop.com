import { useCart } from '@/contexts/CartContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CartSummary() {
    const { cart } = useCart()

    const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1), 0)
    const tax = subtotal * 0.0 // Assuming 10% tax
    const total = subtotal + tax

    return (
        <Card>
            <CardHeader>
                <CardTitle>Cart Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>৳{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Tax (00%):</span>
                        <span>৳{tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>৳{total.toFixed(2)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}