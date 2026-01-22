import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Building2, 
  MapPin, 
  FlaskConical, 
  FileCheck, 
  Send,
  CheckCircle2,
  Package,
  Beaker
} from 'lucide-react';
import type { SearchFilters } from './SearchFilters';

interface Product {
  id: string;
  name: string;
  casNumber: string;
  manufacturer: string;
  location: string;
  accreditations: string[];
  category: string;
  purity: string;
  packagingOptions: string[];
}

// Sample product data
const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Paracetamol',
    casNumber: '103-90-2',
    manufacturer: 'Cipla Ltd.',
    location: 'Maharashtra',
    accreditations: ['FDA Approved', 'WHO-GMP', 'ISO 9001'],
    category: 'API',
    purity: '99.5%',
    packagingOptions: ['25kg drums', '50kg drums', 'Bulk'],
  },
  {
    id: '2',
    name: 'Metformin HCl',
    casNumber: '1115-70-4',
    manufacturer: 'Sun Pharmaceutical',
    location: 'Gujarat',
    accreditations: ['EU-GMP', 'FDA Approved', 'CEP'],
    category: 'API',
    purity: '99.8%',
    packagingOptions: ['20kg drums', '25kg drums'],
  },
  {
    id: '3',
    name: 'Aspirin',
    casNumber: '50-78-2',
    manufacturer: 'Dr. Reddy\'s',
    location: 'Telangana',
    accreditations: ['FDA Approved', 'DMF', 'ISO 9001'],
    category: 'API',
    purity: '99.5%',
    packagingOptions: ['25kg bags', '50kg drums', 'Bulk'],
  },
  {
    id: '4',
    name: 'Ibuprofen',
    casNumber: '15687-27-1',
    manufacturer: 'Lupin Limited',
    location: 'Maharashtra',
    accreditations: ['WHO-GMP', 'EU-GMP', 'CDSCO'],
    category: 'API',
    purity: '99.0%',
    packagingOptions: ['10kg drums', '25kg drums'],
  },
  {
    id: '5',
    name: 'Omeprazole',
    casNumber: '73590-58-6',
    manufacturer: 'Zydus Lifesciences',
    location: 'Gujarat',
    accreditations: ['FDA Approved', 'WHO-GMP', 'CEP'],
    category: 'API',
    purity: '99.7%',
    packagingOptions: ['5kg drums', '10kg drums', '25kg drums'],
  },
  {
    id: '6',
    name: 'Atorvastatin Calcium',
    casNumber: '134523-03-8',
    manufacturer: 'Biocon Limited',
    location: 'Karnataka',
    accreditations: ['EU-GMP', 'FDA Approved', 'ISO 14001'],
    category: 'API',
    purity: '99.9%',
    packagingOptions: ['1kg containers', '5kg containers'],
  },
];

interface ProductResultsProps {
  filters: SearchFilters;
}

export function ProductResults({ filters }: ProductResultsProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [rfqSubmitted, setRfqSubmitted] = useState(false);
  const [rfqData, setRfqData] = useState({
    quantity: '',
    unit: 'kg',
    deliveryLocation: '',
    notes: '',
  });

  // Filter products based on search criteria
  const filteredProducts = sampleProducts.filter((product) => {
    const matchesName = !filters.productName || 
      product.name.toLowerCase().includes(filters.productName.toLowerCase());
    const matchesCas = !filters.casNumber || 
      product.casNumber.includes(filters.casNumber);
    const matchesAccreditation = !filters.accreditation || 
      filters.accreditation === 'all' ||
      product.accreditations.some(a => 
        a.toLowerCase().includes(filters.accreditation.toLowerCase().replace('-', ' '))
      );
    return matchesName && matchesCas && matchesAccreditation;
  });

  const handleRfqSubmit = () => {
    // Simulate RFQ submission
    setRfqSubmitted(true);
    setTimeout(() => {
      setSelectedProduct(null);
      setRfqSubmitted(false);
      setRfqData({ quantity: '', unit: 'kg', deliveryLocation: '', notes: '' });
    }, 2000);
  };

  const getAccreditationColor = (acc: string) => {
    if (acc.includes('FDA')) return 'bg-blue-500/10 text-blue-700 border-blue-200';
    if (acc.includes('WHO')) return 'bg-green-500/10 text-green-700 border-green-200';
    if (acc.includes('EU')) return 'bg-purple-500/10 text-purple-700 border-purple-200';
    if (acc.includes('ISO')) return 'bg-amber-500/10 text-amber-700 border-amber-200';
    return 'bg-primary/10 text-primary border-primary/20';
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filteredProducts.length}</span> products
        </p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {filteredProducts.map((product, index) => (
          <Card 
            key={product.id}
            className="group hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer animate-fade-in-up overflow-hidden"
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
            onClick={() => setSelectedProduct(product)}
          >
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-start justify-between gap-2 sm:gap-4">
                <div className="flex-1 min-w-0">
                  {/* Product Header */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors flex-shrink-0">
                      <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm sm:text-base truncate">
                        {product.name}
                      </h4>
                      <p className="text-[10px] sm:text-xs font-mono text-muted-foreground">
                        CAS: {product.casNumber}
                      </p>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="space-y-1 sm:space-y-2 mt-2 sm:mt-3">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{product.manufacturer}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>{product.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <Beaker className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>Purity: {product.purity}</span>
                    </div>
                  </div>

                  {/* Accreditations */}
                  <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-2 sm:mt-3">
                    {product.accreditations.slice(0, 2).map((acc) => (
                      <Badge 
                        key={acc} 
                        variant="outline" 
                        className={`text-[10px] sm:text-xs py-0 sm:py-0.5 ${getAccreditationColor(acc)}`}
                      >
                        <FileCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                        <span className="hidden xs:inline">{acc}</span>
                        <span className="xs:hidden">{acc.split(' ')[0]}</span>
                      </Badge>
                    ))}
                    {product.accreditations.length > 2 && (
                      <Badge variant="outline" className="text-[10px] sm:text-xs py-0 sm:py-0.5">
                        +{product.accreditations.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* RFQ Button */}
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shrink-0 h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProduct(product);
                  }}
                >
                  <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">RFQ</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <FlaskConical className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted-foreground/40 mb-3 sm:mb-4" />
          <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">No products found</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Try adjusting your search filters to find what you're looking for.
          </p>
        </div>
      )}

      {/* RFQ Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
          {rfqSubmitted ? (
            <div className="py-6 sm:py-8 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-accent" />
              </div>
              <DialogTitle className="text-lg sm:text-xl mb-2">RFQ Submitted!</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Your request for quote has been sent to {selectedProduct?.manufacturer}. 
                You'll receive a response within 24-48 hours.
              </DialogDescription>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                    <Send className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  Request for Quote
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  Submit an RFQ for <span className="font-medium text-foreground">{selectedProduct?.name}</span> from {selectedProduct?.manufacturer}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
                {/* Product Summary */}
                <div className="p-3 sm:p-4 rounded-lg bg-muted/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground">Product</span>
                    <span className="font-medium text-sm sm:text-base">{selectedProduct?.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground">CAS Number</span>
                    <span className="font-mono text-xs sm:text-sm">{selectedProduct?.casNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground">Purity</span>
                    <span className="font-medium text-sm sm:text-base">{selectedProduct?.purity}</span>
                  </div>
                </div>

                {/* Quantity */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="col-span-2">
                    <label className="text-xs sm:text-sm font-medium text-foreground mb-1 sm:mb-1.5 block">
                      Quantity Required
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter quantity"
                      value={rfqData.quantity}
                      onChange={(e) => setRfqData(prev => ({ ...prev, quantity: e.target.value }))}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-foreground mb-1 sm:mb-1.5 block">
                      Unit
                    </label>
                    <Select
                      value={rfqData.unit}
                      onValueChange={(value) => setRfqData(prev => ({ ...prev, unit: value }))}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="g">g</SelectItem>
                        <SelectItem value="mt">MT</SelectItem>
                        <SelectItem value="lb">lb</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Delivery Location */}
                <div>
                  <label className="text-xs sm:text-sm font-medium text-foreground mb-1 sm:mb-1.5 block">
                    Delivery Location
                  </label>
                  <Input
                    placeholder="City, Country"
                    value={rfqData.deliveryLocation}
                    onChange={(e) => setRfqData(prev => ({ ...prev, deliveryLocation: e.target.value }))}
                    className="text-sm"
                  />
                </div>

                {/* Packaging Preference */}
                <div>
                  <label className="text-xs sm:text-sm font-medium text-foreground mb-1 sm:mb-1.5 block">
                    Packaging Preference
                  </label>
                  <Select>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select packaging" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProduct?.packagingOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="text-xs sm:text-sm font-medium text-foreground mb-1 sm:mb-1.5 block">
                    Additional Notes <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <textarea
                    className="flex min-h-[60px] sm:min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    placeholder="Any specific requirements..."
                    value={rfqData.notes}
                    onChange={(e) => setRfqData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </div>

              <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setSelectedProduct(null)} className="w-full sm:w-auto text-sm">
                  Cancel
                </Button>
                <Button 
                  onClick={handleRfqSubmit}
                  disabled={!rfqData.quantity || !rfqData.deliveryLocation}
                  className="bg-primary hover:bg-primary/90 w-full sm:w-auto text-sm"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit RFQ
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

