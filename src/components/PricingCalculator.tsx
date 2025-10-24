import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Calculator, Save } from 'lucide-react';

interface CalculationResult {
  calculatedWeight: number;
  isHeavy: boolean;
  fixedFee: number;
  commissionRate: number;
  commission: number;
  shippingCoparticipation: number;
  tax: number;
  totalDeductions: number;
  estimatedReceipt: number;
  profitMargin: number;
  profitPercentage: number;
}

export function PricingCalculator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [dispatchLevel, setDispatchLevel] = useState('');
  const [taxPercentage, setTaxPercentage] = useState('');
  const [productCost, setProductCost] = useState('');
  const [operationalCost, setOperationalCost] = useState('');
  const [height, setHeight] = useState('');
  const [width, setWidth] = useState('');
  const [length, setLength] = useState('');
  const [weight, setWeight] = useState('');
  const [dimensionUnit, setDimensionUnit] = useState('cm');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const dispatchLevels = [
    { value: 'standard', label: 'Standard', discount: 0 },
    { value: 'bronze', label: 'Bronze', discount: 5 },
    { value: 'silver', label: 'Silver', discount: 10 },
    { value: 'gold', label: 'Gold', discount: 15 },
    { value: 'platinum', label: 'Platinum', discount: 20 },
  ];

  const calculatePricing = () => {
    const priceValue = parseFloat(price);
    if (!priceValue || priceValue <= 0) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preço do produto é obrigatório",
      });
      return;
    }

    // Convert dimensions to cm
    const heightCm = dimensionUnit === 'm' ? parseFloat(height) * 100 : parseFloat(height) || 0;
    const widthCm = dimensionUnit === 'm' ? parseFloat(width) * 100 : parseFloat(width) || 0;
    const lengthCm = dimensionUnit === 'm' ? parseFloat(length) * 100 : parseFloat(length) || 0;
    
    // Convert weight to kg
    const weightKg = weightUnit === 'g' ? parseFloat(weight) / 1000 : parseFloat(weight) || 0;

    // Calculate cubagem (Volume/6000)
    const volume = heightCm * widthCm * lengthCm;
    const cubicWeight = volume / 6000;
    
    // Calculated weight is the maximum between cubic weight and actual weight
    const calculatedWeight = Math.max(cubicWeight, weightKg);
    
    // Product is heavy if weight > 8kg or any dimension > 60cm
    const isHeavy = calculatedWeight > 8 || heightCm > 60 || widthCm > 60 || lengthCm > 60;

    // Get dispatch level discount
    const levelData = dispatchLevels.find(l => l.value === dispatchLevel);
    const discount = levelData?.discount || 0;

    // Calculate fees based on product type
    let fixedFee = 0;
    let commissionRate = 0;
    
    if (isHeavy) {
      // Heavy product: fixed fee + 12% commission
      fixedFee = priceValue <= 79 ? 6.90 : 10.00;
      commissionRate = 12;
    } else {
      // Light product: fixed fee + 16.5% commission
      fixedFee = priceValue <= 79 ? 4.90 : 7.00;
      commissionRate = 16.5;
    }

    const commission = (priceValue * commissionRate) / 100;
    
    // Shipping coparticipation (simplified - could be more complex)
    const baseShipping = isHeavy ? 15 : 10;
    const shippingCoparticipation = baseShipping * (1 - discount / 100);

    // Tax calculation
    const tax = taxPercentage ? (priceValue * parseFloat(taxPercentage)) / 100 : 0;

    // Total deductions
    const totalDeductions = fixedFee + commission + shippingCoparticipation + tax;
    
    // Estimated receipt
    const estimatedReceipt = priceValue - totalDeductions;

    // Profit calculation
    const costs = (parseFloat(productCost) || 0) + (parseFloat(operationalCost) || 0);
    const profitMargin = estimatedReceipt - costs;
    const profitPercentage = priceValue > 0 ? (profitMargin / priceValue) * 100 : 0;

    const calculationResult: CalculationResult = {
      calculatedWeight,
      isHeavy,
      fixedFee,
      commissionRate,
      commission,
      shippingCoparticipation,
      tax,
      totalDeductions,
      estimatedReceipt,
      profitMargin,
      profitPercentage,
    };

    setResult(calculationResult);
  };

  const saveToHistory = async () => {
    if (!result || !user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from('pricing_history').insert({
        user_id: user.id,
        product_name: productName || null,
        product_price: parseFloat(price),
        dispatch_level: dispatchLevel,
        tax_percentage: taxPercentage ? parseFloat(taxPercentage) : 0,
        product_cost: productCost ? parseFloat(productCost) : 0,
        operational_cost: operationalCost ? parseFloat(operationalCost) : 0,
        height_cm: height ? parseFloat(height) : null,
        width_cm: width ? parseFloat(width) : null,
        length_cm: length ? parseFloat(length) : null,
        weight_kg: weight ? parseFloat(weight) : null,
        calculated_weight: result.calculatedWeight,
        is_heavy: result.isHeavy,
        fixed_fee: result.fixedFee,
        commission_rate: result.commissionRate,
        shipping_coparticipation: result.shippingCoparticipation,
        estimated_receipt: result.estimatedReceipt,
        profit_margin: result.profitMargin,
      });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Cálculo salvo no histórico.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="productName">Nome do Produto (opcional)</Label>
          <Input
            id="productName"
            placeholder="Ex: Notebook Dell"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="price">Preço do Produto (R$) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            placeholder="100.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dispatchLevel">Nível de Despacho *</Label>
          <Select value={dispatchLevel} onValueChange={setDispatchLevel}>
            <SelectTrigger id="dispatchLevel">
              <SelectValue placeholder="Selecione o nível" />
            </SelectTrigger>
            <SelectContent>
              {dispatchLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label} ({level.discount}% desconto)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tax">Imposto (%)</Label>
          <Input
            id="tax"
            type="number"
            step="0.01"
            placeholder="0"
            value={taxPercentage}
            onChange={(e) => setTaxPercentage(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="productCost">Custo do Produto (R$)</Label>
          <Input
            id="productCost"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={productCost}
            onChange={(e) => setProductCost(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="operationalCost">Custo Operacional (R$)</Label>
          <Input
            id="operationalCost"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={operationalCost}
            onChange={(e) => setOperationalCost(e.target.value)}
          />
        </div>
      </div>

      <Separator />

      {/* Dimensions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Dimensões do Produto</h3>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="height">Altura</Label>
            <div className="flex gap-2">
              <Input
                id="height"
                type="number"
                step="0.01"
                placeholder="0"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
              <Select value={dimensionUnit} onValueChange={setDimensionUnit}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cm">cm</SelectItem>
                  <SelectItem value="m">m</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="width">Largura</Label>
            <Input
              id="width"
              type="number"
              step="0.01"
              placeholder="0"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="length">Comprimento</Label>
            <Input
              id="length"
              type="number"
              step="0.01"
              placeholder="0"
              value={length}
              onChange={(e) => setLength(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Peso</Label>
            <div className="flex gap-2">
              <Input
                id="weight"
                type="number"
                step="0.001"
                placeholder="0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
              <Select value={weightUnit} onValueChange={setWeightUnit}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="g">g</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={calculatePricing} className="flex-1">
          <Calculator className="mr-2 h-4 w-4" />
          Calcular
        </Button>
      </div>

      {/* Results */}
      {result && (
        <Card className="bg-gradient-subtle border-primary/20">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Resultado do Cálculo</h3>
              <Button variant="outline" size="sm" onClick={saveToHistory} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </Button>
            </div>
            
            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Tipo de Produto</p>
                <p className="text-lg font-semibold">
                  {result.isHeavy ? 'Pesado' : 'Leve'}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Peso Considerado</p>
                <p className="text-lg font-semibold">{result.calculatedWeight.toFixed(3)} kg</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Taxa Fixa</p>
                <p className="text-lg font-semibold">R$ {result.fixedFee.toFixed(2)}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Comissão ({result.commissionRate}%)</p>
                <p className="text-lg font-semibold">R$ {result.commission.toFixed(2)}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Coparticipação Frete</p>
                <p className="text-lg font-semibold">R$ {result.shippingCoparticipation.toFixed(2)}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Impostos</p>
                <p className="text-lg font-semibold">R$ {result.tax.toFixed(2)}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10">
                <span className="text-lg font-semibold">Previsão de Recebimento</span>
                <span className="text-2xl font-bold text-primary">
                  R$ {result.estimatedReceipt.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-success/10">
                <span className="text-lg font-semibold">Margem de Lucro</span>
                <div className="text-right">
                  <p className="text-2xl font-bold text-success">
                    R$ {result.profitMargin.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {result.profitPercentage.toFixed(2)}% do preço
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
