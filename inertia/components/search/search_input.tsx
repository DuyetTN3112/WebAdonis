import { useState, useRef, useEffect } from 'react'
import { Search } from 'lucide-react'
import SearchResults from './search_results'

export default function SearchInput() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [type, setType] = useState('post')
  const [isOpen, setIsOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const handleSearch = async (searchQuery: string) => {
    if (searchQuery.trim().length === 0) {
      setResults([])
      setIsOpen(false)
      return
    }

    try {
      const response = await fetch(`/search?query=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      setType(data.type)
      setResults(data.results)
      setIsOpen(data.results.length > 0)
    } catch (error) {
      console.error('Search error:', error)
      setIsOpen(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) handleSearch(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative flex-grow max-w-[20cm] mx-auto" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          placeholder="Search on ForumGW"
          className="w-full h-[1cm] py-1 px-4 pl-10 bg-black text-gray-300 rounded-full 
                   focus:outline-none focus:ring-2 focus:ring-[#FF9900] text-lg border border-[#333333]
                   placeholder:text-[#555555]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FF9900] w-5 h-5" />
      </div>
      
      {isOpen && (
        <SearchResults 
          type={type} 
          results={results} 
          onResultClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}