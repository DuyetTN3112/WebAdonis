import { Link } from '@inertiajs/react'
import { Button } from '@/lib/ui/button'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  className?: string
}

export default function Pagination({ currentPage, totalPages, className = '' }: PaginationProps) {
  if (totalPages <= 1) return null

  const range = 2 // Number of pages to show around current page
  const dots = <span className="px-2 py-1 text-gray-400">...</span>

  const renderPageLink = (pageNum: number) => {
    const isActive = pageNum === currentPage

    return (
      <Link key={pageNum} href={`?page=${pageNum}`}>
        <Button
          variant={isActive ? 'default' : 'ghost'}
          className={`h-8 w-8 p-0 ${isActive ? 'bg-orange-500 text-black hover:bg-orange-600' : 'text-gray-400 hover:text-white'}`}
        >
          {pageNum}
        </Button>
      </Link>
    )
  }

  

  const renderPages = () => {
    const pages = []
    
    // Always show first page
    pages.push(renderPageLink(1))

    // Show dots if current page is far from start
    if (currentPage > range + 2) {
      pages.push(dots)
    }

    // Pages around current page
    const start = Math.max(2, currentPage - range)
    const end = Math.min(totalPages - 1, currentPage + range)

    for (let i = start; i <= end; i++) {
      pages.push(renderPageLink(i))
    }

    // Show dots if current page is far from end
    if (currentPage < totalPages - range - 1) {
      pages.push(dots)
    }

    // Always show last page if there's more than 1 page
    if (totalPages > 1) {
      pages.push(renderPageLink(totalPages))
    }

    return pages
  }

  return (
    <div className={`flex items-center justify-center space-x-1 ${className}`}>
      {/* First Page Button */}
      <Link href={`?page=1`}>
        <Button variant="ghost" size="icon" disabled={currentPage === 1}>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
      </Link>

      {/* Previous Page Button */}
      <Link href={`?page=${currentPage - 1}`}>
        <Button variant="ghost" size="icon" disabled={currentPage === 1}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </Link>

      {/* Page Numbers */}
      {renderPages()}

      {/* Next Page Button */}
      <Link href={`?page=${currentPage + 1}`}>
        <Button variant="ghost" size="icon" disabled={currentPage === totalPages}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </Link>

      {/* Last Page Button */}
      <Link href={`?page=${totalPages}`}>
        <Button variant="ghost" size="icon" disabled={currentPage === totalPages}>
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  )
}