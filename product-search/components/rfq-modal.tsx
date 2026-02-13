'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  FileText,
  Send,
  CheckCircle,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  FlaskConical,
  Beaker,
  TestTubes,
  Layers,
  X,
  Loader2,
  Trash2,
} from 'lucide-react'
import type { Product } from '@/lib/products-data'
import { categoryInfo } from '@/lib/products-data'

type Category = 'api' | 'impurity' | 'intermediate' | 'chemical'

const categoryIcons: Record<Category, React.ReactNode> = {
  api: <FlaskConical className="w-3 h-3" />,
  impurity: <TestTubes className="w-3 h-3" />,
  intermediate: <Beaker className="w-3 h-3" />,
  chemical: <Layers className="w-3 h-3" />,
}

interface RFQModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedProducts: Product[]
  onSuccess: () => void
  onRemoveProduct?: (productId: string) => void
  onBack?: () => void
}

interface ProductQuantity {
  productId: string
  quantity: string
  unit: string
}

export function RFQModal({ open, onOpenChange, selectedProducts, onSuccess, onRemoveProduct, onBack }: RFQModalProps) {
  const [step, setStep] = useState<'products' | 'contact' | 'success'>('products')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [quantities, setQuantities] = useState<ProductQuantity[]>(
    selectedProducts.map((p) => ({ productId: p.id, quantity: '', unit: 'kg' }))
  )
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    country: '',
    message: '',
  })

  // Update quantities when products change
  if (quantities.length !== selectedProducts.length) {
    setQuantities(selectedProducts.map((p) => ({ productId: p.id, quantity: '', unit: 'kg' })))
  }

  const updateQuantity = (productId: string, field: 'quantity' | 'unit', value: string) => {
    setQuantities((prev) =>
      prev.map((q) => (q.productId === productId ? { ...q, [field]: value } : q))
    )
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Prepare products with quantities
      const productsWithQuantities = selectedProducts.map((p) => {
        const qty = quantities.find((q) => q.productId === p.id)
        return {
          ...p,
          quantity: qty?.quantity || '',
          unit: qty?.unit || '',
        }
      })

      // Call RFQ API
      const response = await fetch('/api/rfq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          products: productsWithQuantities,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to submit RFQ')
      }

      // Success
      setStep('success')
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to submit RFQ. Please try again later.'
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetAndClose = () => {
    setStep('products')
    setFormData({
      name: '',
      email: '',
      company: '',
      phone: '',
      country: '',
      message: '',
    })
    onOpenChange(false)
  }

  const handleSuccessClose = () => {
    resetAndClose()
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden max-h-[90vh] sm:max-h-[85vh] flex flex-col w-[calc(100%-1rem)] sm:w-full">
        {/* Header */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-border bg-gradient-to-b from-accent/5 to-transparent shrink-0">
          <DialogHeader>
            <div className="flex items-center gap-2 sm:gap-3 mb-1">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-accent/10">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
              </div>
              <DialogTitle className="text-lg sm:text-xl">Request for Quote</DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground text-sm">
              {step === 'products' && 'Specify quantities for each product.'}
              {step === 'contact' && 'Provide your contact details.'}
              {step === 'success' && 'Your request has been submitted!'}
            </DialogDescription>
          </DialogHeader>

          {/* Progress Steps */}
          {step !== 'success' && (
            <div className="flex items-center gap-1.5 sm:gap-2 mt-3 sm:mt-4">
              <div
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium transition-all ${
                  step === 'products'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-primary/10 text-primary'
                }`}
              >
                <Package className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Products
              </div>
              <div className="w-4 sm:w-8 h-px bg-border" />
              <div
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium transition-all ${
                  step === 'contact'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Contact
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {step === 'products' && (
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 pb-4">
                {selectedProducts.map((product) => {
                  const quantity = quantities.find((q) => q.productId === product.id)
                  const info = categoryInfo[product.category]
                  return (
                    <Card key={product.id} className="border-border/50 bg-card overflow-hidden group">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-col gap-2 sm:gap-3">
                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="font-medium text-sm text-foreground line-clamp-2 leading-tight">
                                {product.name}
                              </h4>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <Badge
                                  variant={product.category as 'api' | 'impurity' | 'intermediate' | 'chemical'}
                                  className="text-[10px]"
                                >
                                  <span className="hidden sm:inline-flex">{categoryIcons[product.category]}</span>
                                  <span className="sm:ml-1">{info.label}</span>
                                </Badge>
                                {onRemoveProduct && (
                                  <button
                                    type="button"
                                    onClick={() => onRemoveProduct(product.id)}
                                    className="p-1.5 rounded-md bg-destructive/10 hover:bg-destructive/20 active:bg-destructive/30 transition-colors"
                                    aria-label="Remove product"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground font-mono">
                              CAS: {product.casNumber}
                            </p>
                          </div>

                          {/* Quantity Input */}
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1 sm:flex-none">
                              <Input
                                type="number"
                                min="0"
                                step="0.1"
                                placeholder="Qty"
                                value={quantity?.quantity || ''}
                                onChange={(e) =>
                                  updateQuantity(product.id, 'quantity', e.target.value)
                                }
                                className="w-full sm:w-28 h-10 sm:h-9 text-sm"
                              />
                            </div>
                            <select
                              value={quantity?.unit || 'kg'}
                              onChange={(e) => updateQuantity(product.id, 'unit', e.target.value)}
                              className="h-10 sm:h-9 px-3 sm:px-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-[70px]"
                            >
                              <option value="mg">mg</option>
                              <option value="g">g</option>
                              <option value="kg">kg</option>
                              <option value="mt">MT</option>
                            </select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 border-t border-border bg-muted/30 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                {onBack && (
                  <Button 
                    type="button" 
                    variant="default"
                    size="sm"
                    onClick={() => {
                      resetAndClose()
                      onBack()
                    }}
                    className="gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Back</span>
                  </Button>
                )}
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''}
                </p>
              </div>
              <Button onClick={() => setStep('contact')} className="group" disabled={selectedProducts.length === 0}>
                Continue
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>
          </div>
        )}

        {step === 'contact' && (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 pb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <label htmlFor="rfq-name" className="text-sm font-medium text-foreground flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                      Full Name*
                    </label>
                    <Input
                      id="rfq-name"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      placeholder="Your name"
                      required
                      className="h-10 sm:h-9"
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <label htmlFor="rfq-email" className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                      Work Email*
                    </label>
                    <Input
                      id="rfq-email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      placeholder="you@company.com"
                      required
                      className="h-10 sm:h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <label htmlFor="rfq-company" className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                      Company*
                    </label>
                    <Input
                      id="rfq-company"
                      name="company"
                      value={formData.company}
                      onChange={handleFormChange}
                      placeholder="Company name"
                      required
                      className="h-10 sm:h-9"
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <label htmlFor="rfq-phone" className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                      Phone*
                    </label>
                    <Input
                      id="rfq-phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleFormChange}
                      placeholder="+1 (555) 000-0000"
                      required
                      className="h-10 sm:h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label htmlFor="rfq-country" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    Country*
                  </label>
                  <Input
                    id="rfq-country"
                    name="country"
                    value={formData.country}
                    onChange={handleFormChange}
                    placeholder="Your country"
                    required
                    className="h-10 sm:h-9"
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label htmlFor="rfq-message" className="text-sm font-medium text-foreground">
                    Additional Requirements
                  </label>
                  <textarea
                    id="rfq-message"
                    name="message"
                    value={formData.message}
                    onChange={handleFormChange}
                    rows={3}
                    placeholder="Requirements, timeline, specifications..."
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none min-h-[80px]"
                  />
                </div>

                {/* Summary */}
                <Card className="border-border/50 bg-muted/30">
                  <CardContent className="p-3 sm:p-4">
                    <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Package className="w-4 h-4 text-primary" />
                      Quote Summary ({selectedProducts.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {selectedProducts.map((product) => {
                        const qty = quantities.find((q) => q.productId === product.id)
                        return (
                          <Badge key={product.id} variant="outline" className="text-[10px] sm:text-xs font-mono">
                            <span>{product.casNumber}</span>
                            {qty?.quantity && (
                              <span className="ml-1 opacity-70">
                                ({qty.quantity}{qty.unit})
                              </span>
                            )}
                          </Badge>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 border-t border-border bg-muted/30 flex items-center justify-between gap-2 shrink-0">
              <Button type="button" variant="ghost" onClick={() => setStep('products')} size="sm" className="sm:size-default">
                Back
              </Button>
              <Button type="submit" disabled={isSubmitting} className="group min-w-[100px] sm:min-w-32">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">Submitting...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Submit RFQ</span>
                    <span className="sm:hidden">Submit</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {step === 'success' && (
          <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center min-h-[280px] sm:min-h-[300px]">
            {/* Success Animation */}
            <div className="relative mb-4 sm:mb-6">
              <div className="absolute inset-0 bg-accent/20 rounded-full animate-ping" />
              <div className="relative p-4 sm:p-5 rounded-full bg-gradient-to-br from-accent/20 to-primary/20">
                <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-accent" />
              </div>
            </div>

            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
              Quote Request Submitted!
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-sm mb-4 sm:mb-6 px-2">
              Thank you! Our team will review your request and respond within 24-48 hours.
            </p>

            {/* Submitted Products Summary */}
            <Card className="w-full max-w-md border-border/50 bg-muted/30 mb-4 sm:mb-6">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className="text-sm font-medium text-foreground">Products Requested</span>
                  <Badge variant="secondary">{selectedProducts.length}</Badge>
                </div>
                <div className="flex flex-wrap gap-1 sm:gap-1.5">
                  {selectedProducts.slice(0, 3).map((product) => (
                    <Badge key={product.id} variant="outline" className="text-[10px] sm:text-xs max-w-[120px] sm:max-w-none">
                      <span className="truncate">{product.name}</span>
                    </Badge>
                  ))}
                  {selectedProducts.length > 3 && (
                    <Badge variant="outline" className="text-[10px] sm:text-xs">
                      +{selectedProducts.length - 3} more
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto px-2 sm:px-0">
              <Button variant="outline" onClick={handleSuccessClose} className="w-full sm:w-auto">
                Close
              </Button>
              <Button onClick={handleSuccessClose} className="w-full sm:w-auto">
                <Sparkles className="w-4 h-4" />
                Continue Browsing
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

