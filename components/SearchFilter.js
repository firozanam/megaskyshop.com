import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

export default function SearchFilter({ categories, onSearch }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const handleSearch = () => {
    onSearch({ searchTerm, category: selectedCategory })
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <Input
        type="text"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-grow"
      />
      <Select
        value={selectedCategory}
        onValueChange={setSelectedCategory}
        className="w-full sm:w-48"
      >
        <option value="">All Categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </Select>
      <Button onClick={handleSearch}>Search</Button>
    </div>
  )
}