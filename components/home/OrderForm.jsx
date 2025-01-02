import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Minus } from "lucide-react";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { getImageWithFallback } from '@/lib/blobStorage';
import React from 'react';

export default function OrderForm({ 
  product, 
  formData, 
  onInputChange, 
  onSubmit, 
  isSubmitting 
}) {
  if (!product) {
    return (
      <section
        id="order-form"
        className="bg-card text-card-foreground rounded-3xl p-12 md:p-20 shadow-lg mb-24"
      >
        <h2 className="text-4xl font-bold mb-6 text-center">
          No Product Available
        </h2>
        <p className="text-center text-lg mb-5">
          Sorry, there is currently no product available for order. Please
          check back later.
        </p>
      </section>
    );
  }

  const imageUrl = getImageWithFallback(product?.image, '/images/product1.jpg');

  const handleQuantityChange = (change) => {
    const newQuantity = Math.max(1, parseInt(formData.quantity) + change);
    onInputChange({
      target: {
        name: 'quantity',
        value: newQuantity
      }
    });
  };

  const handleDirectQuantityInput = (e) => {
    const value = parseInt(e.target.value) || 1;
    const newQuantity = Math.max(1, value);
    onInputChange({
      target: {
        name: 'quantity',
        value: newQuantity
      }
    });
  };

  return (
    <section
      id="order-form"
      className="max-w-6xl mx-auto p-8 border border-[hsl(var(--primary))] rounded-lg bg-card"
    >
      <h2 className="text-2xl font-semibold text-center mb-8 text-[hsl(var(--primary))]">
        আপনার নাম, ঠিকানা ও মোবাইল নম্বরটি লিখে অর্ডার কনফার্ম করুন
      </h2>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left side - Billing details */}
        <div className="md:w-1/2">
          <h3 className="text-xl font-semibold mb-6 text-foreground">Billing details</h3>
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <Label
                htmlFor="name"
                className="block text-sm font-medium text-foreground"
              >
                আপনার নাম <span className="text-[hsl(var(--destructive))]">*</span>
              </Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={onInputChange}
                required
                className="mt-1 block w-full"
                placeholder="আপনার নাম লিখুনঃ"
              />
            </div>
            <div>
              <Label
                htmlFor="address"
                className="block text-sm font-medium text-foreground"
              >
                আপনার ঠিকানা <span className="text-[hsl(var(--destructive))]">*</span>
              </Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={onInputChange}
                required
                className="mt-1 block w-full"
                placeholder="আপনার ঠিকানা/এলাকার নাম, থানা, জেলা"
                rows={3}
              />
            </div>
            <div>
              <Label
                htmlFor="phone"
                className="block text-sm font-medium text-foreground"
              >
                মোবাইল নাম্বার <span className="text-[hsl(var(--destructive))]">*</span>
              </Label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={onInputChange}
                required
                className="mt-1 block w-full"
                placeholder="আপনার মোবাইল নাম্বার লিখুনঃ"
              />
            </div>
          </form>
        </div>
        
        {/* Right side - Order summary */}
        <div className="md:w-1/2">
          <h3 className="text-xl font-semibold mb-6 text-foreground">Your order</h3>
          <div className="space-y-4">
            <div className="border-b border-border pb-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="relative aspect-square w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {imageUrl && (
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        quality={85}
                      />
                    )}
                  </div>
                  <span className="text-foreground">{product.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  {/* Quantity controls */}
                  <div className="flex items-center border border-input rounded">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(-1)}
                      className="p-2 hover:bg-accent border-r border-input"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={handleDirectQuantityInput}
                      className="w-16 text-center border-none focus:ring-0 bg-transparent"
                      min="1"
                    />
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(1)}
                      className="p-2 hover:bg-accent border-l border-input"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-foreground">{formatCurrency(product.price)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">{formatCurrency(product.price * formData.quantity)}</span>
            </div>
            
            <div className="flex justify-between py-2 border-t border-b border-border">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-semibold text-foreground">{formatCurrency(product.price * formData.quantity)}</span>
            </div>

            <div className="bg-accent/50 p-4 rounded">
              <h4 className="font-medium mb-2 text-foreground">ক্যাশ অন ডেলিভারি</h4>
              <p className="text-sm text-muted-foreground">
                ডেলিভারি ম্যান গেলে ডেলিভারি চার্জসহ ক্যাশ টাকা পেমেন্ট করবেন।
                ডেলিভারি ম্যান ব্যবহারকারীর মন্য দামে নিয়ে যাবেন।
              </p>
            </div>

            <Button
              type="submit"
              onClick={onSubmit}
              variant="destructive"
              size="xl"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  অর্ডার প্রক্রিয়াধীন...
                </>
              ) : (
                `অর্ডার সম্পন্ন করুন ${formatCurrency(product.price * formData.quantity)}`
              )}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
