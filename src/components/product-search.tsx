import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  Beaker,
  Check,
  FileText,
  FlaskConical,
  Hash,
  Layers,
  Loader2,
  Package,
  Search,
  TestTubes,
  Type,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RFQModal } from './rfq-modal'
import {
  categoryInfo,
  searchProductsPaginated,
  type Product,
  type SearchType,
} from '@/lib/products-data'
import { useFilterData } from '@/contexts/FilterDataContext'

type Category = 'api' | 'impurity' | 'intermediate' | 'chemical'

const PAGE_SIZE = 24

const categoryIcons: Record<Category, ReactNode> = {
  api: <FlaskConical className="h-4 w-4" />,
  impurity: <TestTubes className="h-4 w-4" />,
  intermediate: <Beaker className="h-4 w-4" />,
  chemical: <Layers className="h-4 w-4" />,
}

const categoryClasses: Record<Category, string> = {
  api: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  impurity: 'border-teal-200 bg-teal-50 text-teal-800',
  intermediate: 'border-lime-200 bg-lime-50 text-lime-800',
  chemical: 'border-green-200 bg-green-50 text-green-800',
}

function highlightText(text: string, query: string) {
  const trimmed = query.trim()
  if (!trimmed) return text

  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  const parts = text.split(regex)

  return parts.map((part, index) => {
    if (part.toLowerCase() === trimmed.toLowerCase()) {
      return (
        <mark
          key={`${part}-${index}`}
          className="rounded bg-primary/15 px-1 py-0.5 text-foreground"
        >
          {part}
        </mark>
      )
    }

    return part
  })
}

export function ProductSearch() {
  const { platformStats } = useFilterData()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<SearchType>('name')
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([])

  const [products, setProducts] = useState<Product[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const [selectedProducts, setSelectedProducts] = useState<Product[]>([])
  const [rfqOpen, setRfqOpen] = useState(false)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      searchInputRef.current?.focus()
    }, 80)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [])

  const performSearch = useCallback(
    async (
      query: string,
      type: SearchType,
      categories: Category[],
      page: number,
      append = false
    ) => {
      if (!query.trim() && categories.length === 0) {
        setProducts([])
        setTotalCount(0)
        setHasMore(false)
        setHasSearched(false)
        return
      }

      if (append) {
        setIsLoadingMore(true)
      } else {
        setIsLoading(true)
      }

      try {
        const response = await searchProductsPaginated({
          query,
          searchType: type,
          categories,
          page,
          pageSize: PAGE_SIZE,
        })

        setProducts((prev) => (append ? [...prev, ...response.products] : response.products))
        setTotalCount(response.total)
        setHasMore(response.hasMore)
        setCurrentPage(page)
        setHasSearched(true)
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    },
    []
  )

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      performSearch(searchQuery, searchType, selectedCategories, 1, false)
    }, 220)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [performSearch, searchQuery, searchType, selectedCategories])

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      performSearch(searchQuery, searchType, selectedCategories, currentPage + 1, true)
    }
  }, [currentPage, hasMore, isLoadingMore, performSearch, searchQuery, searchType, selectedCategories])

  const toggleCategory = useCallback((category: Category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    )
  }, [])

  const toggleProductSelection = useCallback((product: Product) => {
    setSelectedProducts((prev) =>
      prev.some((item) => item.id === product.id)
        ? prev.filter((item) => item.id !== product.id)
        : [...prev, product]
    )
  }, [])

  const clearSelections = useCallback(() => {
    setSelectedProducts([])
  }, [])

  const handleRequestQuote = useCallback(() => {
    if (selectedProducts.length > 0) {
      setRfqOpen(true)
    }
  }, [selectedProducts.length])

  const handleRfqSuccess = useCallback(() => {
    setSelectedProducts([])
    setRfqOpen(false)
  }, [])

  const isProductSelected = useCallback(
    (product: Product) => selectedProducts.some((item) => item.id === product.id),
    [selectedProducts]
  )

  const allVisibleSelected = products.length > 0
    && products.every((product) => selectedProducts.some((item) => item.id === product.id))

  const resultSummary = useMemo(() => {
    if (!hasSearched) return `${platformStats.products.toLocaleString()} products`
    if (isLoading) return 'Searching...'
    if (totalCount === 0) return 'No results'
    return `${totalCount.toLocaleString()} results`
  }, [hasSearched, isLoading, platformStats.products, totalCount])

  return (
    <>
      <div className="space-y-6">
        <section className="rounded-[1.5rem] border border-white/80 bg-white/84 p-4 shadow-[0_24px_80px_-52px_rgba(15,118,110,0.45)] sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Product search
              </h2>
            </div>
            <Badge className="w-fit border-primary/10 bg-primary/10 text-primary">
              {platformStats.products.toLocaleString()}
            </Badge>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)]">
            <div className="rounded-[1rem] border border-border/70 bg-white p-1">
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setSearchType('name')}
                  className={`flex items-center justify-center gap-2 rounded-[0.8rem] px-3 py-2 text-sm font-medium transition-colors ${
                    searchType === 'name'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground'
                  }`}
                >
                  <Type className="h-4 w-4" />
                  Name
                </button>
                <button
                  type="button"
                  onClick={() => setSearchType('cas')}
                  className={`flex items-center justify-center gap-2 rounded-[0.8rem] px-3 py-2 text-sm font-medium transition-colors ${
                    searchType === 'cas'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground'
                  }`}
                >
                  <Hash className="h-4 w-4" />
                  CAS
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={searchType === 'cas' ? 'Search by CAS number' : 'Search by product name'}
                  className="h-12 rounded-[1rem] border-border/70 bg-white pl-11 pr-11 text-sm shadow-none"
                  style={{ fontFamily: searchType === 'cas' ? 'var(--font-jetbrains), monospace' : 'inherit' }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {(['api', 'impurity', 'intermediate', 'chemical'] as Category[]).map((category) => {
                  const isActive = selectedCategories.includes(category)
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
                        isActive
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border/70 bg-white text-foreground hover:border-primary/20'
                      }`}
                    >
                      <span className={isActive ? 'text-primary-foreground' : 'text-primary'}>
                        {categoryIcons[category]}
                      </span>
                      {categoryInfo[category].label}
                    </button>
                  )
                })}
                {selectedCategories.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategories([])}
                    className="px-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_320px] lg:items-start">
          <section className="min-w-0 rounded-[1.5rem] border border-white/80 bg-white/84 shadow-[0_24px_80px_-52px_rgba(15,118,110,0.45)]">
            <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-4 sm:px-5">
              <p className="text-sm font-medium text-foreground">{resultSummary}</p>
              {products.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (allVisibleSelected) {
                      setSelectedProducts((prev) =>
                        prev.filter((item) => !products.some((product) => product.id === item.id))
                      )
                      return
                    }

                    setSelectedProducts((prev) => {
                      const next = [...prev]
                      for (const product of products) {
                        if (!next.some((item) => item.id === product.id)) {
                          next.push(product)
                        }
                      }
                      return next
                    })
                  }}
                  className="rounded-full"
                >
                  {allVisibleSelected ? 'Clear visible' : `Select visible (${products.length})`}
                </Button>
              )}
            </div>

            <div className="min-h-[560px] px-3 py-3 sm:px-4">
              {isLoading && (
                <div className="flex min-h-[440px] flex-col items-center justify-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                  <p className="mt-4 text-base font-medium text-foreground">Searching</p>
                </div>
              )}

              {!isLoading && !hasSearched && (
                <div className="flex min-h-[440px] flex-col items-center justify-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Search className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-base font-medium text-foreground">Search by name or CAS</p>
                </div>
              )}

              {!isLoading && hasSearched && products.length === 0 && (
                <div className="flex min-h-[440px] flex-col items-center justify-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Package className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-base font-medium text-foreground">No results</p>
                </div>
              )}

              {!isLoading && products.length > 0 && (
                <div className="space-y-3">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isSelected={isProductSelected(product)}
                      onToggle={() => toggleProductSelection(product)}
                      searchQuery={searchQuery}
                      searchType={searchType}
                    />
                  ))}

                  {hasMore && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="mt-2 h-11 w-full rounded-[1rem]"
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading more
                        </>
                      ) : (
                        <>
                          Load more
                          <span className="ml-2 text-muted-foreground">
                            {Math.max(totalCount - products.length, 0).toLocaleString()} remaining
                          </span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </section>

          <aside className="lg:sticky lg:top-24">
            <div className="rounded-[1.5rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(240,253,250,0.96))] shadow-[0_24px_80px_-52px_rgba(15,118,110,0.35)]">
              <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-4 sm:px-5">
                <p className="text-sm font-semibold text-foreground">Shortlist</p>
                <Badge className="border-primary/10 bg-primary/10 text-primary">
                  {selectedProducts.length}
                </Badge>
              </div>

              <div className="px-4 py-4 sm:px-5">
                {selectedProducts.length === 0 ? (
                  <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[1.2rem] border border-dashed border-primary/15 bg-white/70 px-6 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-sm font-medium text-foreground">No products selected</p>
                  </div>
                ) : (
                  <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
                    {selectedProducts.map((product) => (
                      <div
                        key={product.id}
                        className="rounded-[1rem] border border-white/80 bg-white/80 p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-sm font-medium leading-6 text-foreground">
                              {product.name}
                            </p>
                            <p className="mt-1 font-mono text-xs text-muted-foreground">
                              {product.casNumber}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleProductSelection(product)}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-3">
                          <Badge className={categoryClasses[product.category]}>
                            <span className="mr-1.5">{categoryIcons[product.category]}</span>
                            {categoryInfo[product.category].label}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-border/70 px-4 py-4 sm:px-5">
                {selectedProducts.length > 0 && (
                  <button
                    type="button"
                    onClick={clearSelections}
                    className="mb-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Clear shortlist
                  </button>
                )}
                <Button
                  type="button"
                  onClick={handleRequestQuote}
                  disabled={selectedProducts.length === 0}
                  className="h-11 w-full rounded-[1rem]"
                >
                  Request quote
                  {selectedProducts.length > 0 && (
                    <span className="ml-2 opacity-80">({selectedProducts.length})</span>
                  )}
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <RFQModal
        open={rfqOpen}
        onOpenChange={setRfqOpen}
        selectedProducts={selectedProducts}
        onSuccess={handleRfqSuccess}
        onRemoveProduct={(productId) => {
          setSelectedProducts((prev) => prev.filter((product) => product.id !== productId))
        }}
        onBack={() => {
          setRfqOpen(false)
        }}
      />
    </>
  )
}

interface ProductCardProps {
  product: Product
  isSelected: boolean
  onToggle: () => void
  searchType: SearchType
  searchQuery: string
}

function ProductCard({
  product,
  isSelected,
  onToggle,
  searchQuery,
  searchType,
}: ProductCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full rounded-[1.1rem] border px-4 py-4 text-left transition-colors ${
        isSelected
          ? 'border-primary/30 bg-primary/[0.06]'
          : 'border-border/70 bg-white hover:border-primary/20'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
            isSelected
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-white text-transparent'
          }`}
        >
          <Check className="h-3.5 w-3.5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-6 text-foreground sm:text-base">
                {searchType === 'name' ? highlightText(product.name, searchQuery) : product.name}
              </p>
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                {searchType === 'cas'
                  ? highlightText(product.casNumber, searchQuery)
                  : product.casNumber}
              </p>
            </div>

            <Badge className={`${categoryClasses[product.category]} shrink-0`}>
              <span className="mr-1.5">{categoryIcons[product.category]}</span>
              {categoryInfo[product.category].label}
            </Badge>
          </div>
        </div>
      </div>
    </button>
  )
}
