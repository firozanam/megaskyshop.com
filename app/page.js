"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast-context";
import { Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import HeroSection from "@/components/home/HeroSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import VideoSection from "@/components/home/VideoSection";
import OrderForm from "@/components/home/OrderForm";
import PriceInfo from "@/components/home/PriceInfo";

// Default data in case of API failure
const defaultHomePageData = {
  videoUrl: 'https://www.youtube.com/embed/Frev5m43eso?si=fBFJY5xpOl6IP1Er',
  heroHeading: '100% সিলিকনের তৈরি অরিজিনাল ম্যাজিক কনডম',
  heroParagraph: 'যৌন দুর্বলতা থেকে মুক্তি পেতে এবং দীর্ঘক্ষণ সঙ্গম করতে পারবেন, ৩০-৪০ মিনিট পর্যন্ত সঙ্গম করতে পারবেন।',
  heroImage: '/images/hero-bg.jpg',
  featuredProducts: [
    {
      _id: 'default1',
      name: 'Magic Condom',
      price: 1200,
      description: 'Original Magic Condom for long-lasting performance',
      image: '/images/product1.jpg',
      stock: 100,
      category: 'Condoms'
    },
    {
      _id: 'default2',
      name: 'Premium Condom',
      price: 1500,
      description: 'Premium quality condom for better experience',
      image: '/images/product2.jpg',
      stock: 100,
      category: 'Condoms'
    },
    {
      _id: 'default3',
      name: 'Delay Spray',
      price: 2500,
      description: 'Long-lasting delay spray for enhanced performance',
      image: '/images/product3.jpg',
      stock: 50,
      category: 'Sprays',
      avgRating: 4.5
    },
    {
      _id: 'default4',
      name: 'Power Capsule',
      price: 3000,
      description: 'Natural power enhancement capsule for better stamina',
      image: '/images/product4.jpg',
      stock: 75,
      category: 'Supplements',
      avgRating: 4.8
    }
  ],
  homePageProduct: {
    _id: 'default1',
    name: 'Magic Condom',
    price: 1200,
    description: 'Original Magic Condom for long-lasting performance',
    image: '/images/product1.jpg',
    stock: 100,
    category: 'Condoms'
  }
};

export default function Home() {
  const [homePageData, setHomePageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const [orderFormData, setOrderFormData] = useState({
    name: "",
    address: "",
    phone: "",
    quantity: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchHomePageData() {
      try {
        setLoading(true);
        setError(null);

        const [settingsRes, productsRes] = await Promise.all([
          fetch('/api/settings/home', {
            headers: { 'Cache-Control': 'no-cache' }
          }),
          fetch('/api/products', {
            headers: { 'Cache-Control': 'no-cache' }
          })
        ]);

        if (!settingsRes.ok || !productsRes.ok) {
          throw new Error(
            `Failed to fetch data: ${
              !settingsRes.ok ? 'Settings ' + settingsRes.status : ''
            } ${!productsRes.ok ? 'Products ' + productsRes.status : ''}`
          );
        }

        const [settingsData, productsData] = await Promise.all([
          settingsRes.json(),
          productsRes.json()
        ]);

        const featuredProducts = productsData.products.filter((product) =>
          settingsData.featuredProductIds?.includes(product._id)
        );

        const homePageProduct = settingsData.featuredProductId
          ? productsData.products.find(
              (p) => p._id === settingsData.featuredProductId
            )
          : null;

        setHomePageData({
          ...settingsData,
          featuredProducts: featuredProducts || [],
          homePageProduct
        });
      } catch (error) {
        console.error('Error fetching home page data:', error);
        setError(error.message);
        
        // Set default data after max retries
        if (retryCount >= maxRetries - 1) {
          console.log('Using default data after max retries');
          setHomePageData(defaultHomePageData);
          setError(null);
          return;
        }
        
        // Retry logic
        if (retryCount < maxRetries) {
          const timeout = Math.min(1000 * Math.pow(2, retryCount), 5000);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, timeout);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchHomePageData();
  }, [retryCount]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading content...</p>
          {retryCount > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Retry attempt {retryCount} of {maxRetries}...
            </p>
          )}
        </div>
      </div>
    );
  }

  // Use default data if no data is available after all retries
  const currentData = homePageData || defaultHomePageData;

  const { 
    videoUrl = defaultHomePageData.videoUrl, 
    heroHeading = defaultHomePageData.heroHeading, 
    heroParagraph = defaultHomePageData.heroParagraph, 
    heroImage = defaultHomePageData.heroImage, 
    featuredProducts = defaultHomePageData.featuredProducts, 
    homePageProduct = defaultHomePageData.homePageProduct 
  } = currentData;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (homePageData.homePageProduct) {
        const orderData = {
          items: [{
            id: homePageData.homePageProduct._id,
            name: homePageData.homePageProduct.name,
            price: homePageData.homePageProduct.price,
            quantity: orderFormData.quantity,
            image: homePageData.homePageProduct.image
          }],
          shippingAddress: orderFormData.address,
          name: orderFormData.name,
          mobile: orderFormData.phone,
          total: homePageData.homePageProduct.price * orderFormData.quantity,
          isGuest: true
        };

        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        });

        if (!response.ok) {
          throw new Error('Failed to create order');
        }

        const data = await response.json();
        toast({
          title: "Success",
          description: "Order placed successfully",
        });
        router.push(`/order-confirmation/${data.orderId}`);
      } else {
        throw new Error("No product selected for order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        title: "Error",
        description: "Failed to place order",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background text-foreground mb-4">
      <HeroSection 
        heroImage={heroImage}
        heroHeading={heroHeading}
        heroParagraph={heroParagraph}
      />
      <FeaturedProducts products={featuredProducts} />
      {/* Main content wrapper with margin */}
      <WhyChooseUs />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <VideoSection videoUrl={videoUrl} />
      </div>
      <PriceInfo />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <OrderForm 
          product={homePageProduct}
          formData={orderFormData}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>

    </div>
  );
}
