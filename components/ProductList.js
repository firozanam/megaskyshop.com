import ProductCard from './ProductCard'

export default function ProductList({ products }) {
  console.log('ProductList received products:', products) // Add this line for debugging

  if (!products || !Array.isArray(products) || products.length === 0) {
    return <div className="text-center py-8">No products available.</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  )
}
