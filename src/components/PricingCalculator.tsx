import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Calculator, Save, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CalculationResult {
  calculatedWeight: number;
  isHeavy: boolean;
  fixedFee: number;
  commissionRate: number;
  commission: number;
  shippingCoparticipation: number;
  shippingWeightRange: string;
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
  const [category, setCategory] = useState('');
  const [financialModality, setFinancialModality] = useState('');
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
  const [showDimensionSuggestion, setShowDimensionSuggestion] = useState(false);

  // Load saved dispatch level from localStorage
  useEffect(() => {
    const savedLevel = localStorage.getItem('dispatchLevel');
    if (savedLevel) {
      setDispatchLevel(savedLevel);
    }
  }, []);

  // Save dispatch level to localStorage when changed
  const handleDispatchLevelChange = (value: string) => {
    setDispatchLevel(value);
    localStorage.setItem('dispatchLevel', value);
  };

  // Show dimension suggestion when price > R$ 79
  useEffect(() => {
    const priceValue = parseFloat(price);
    if (priceValue > 79 && (!height || !width || !length || !weight)) {
      setShowDimensionSuggestion(true);
    } else {
      setShowDimensionSuggestion(false);
    }
  }, [price, height, width, length, weight]);

  const dispatchLevels = [
    { value: 'above_97', label: 'Acima de 97%', discount: 50 },
    { value: 'between_92_97', label: 'Entre 92% e 97%', discount: 25 },
    { value: 'below_92', label: 'Abaixo de 92%', discount: 0 },
    { value: 'fulfilment', label: 'Fulfilment', discount: 75 },
  ];

  // Shipping coparticipation table based on weight
  const getShippingCoparticipation = (weightKg: number): { value: number; range: string } => {
    if (weightKg <= 0.5) return { value: 35.90, range: 'Até 0.5 kg' };
    if (weightKg <= 1) return { value: 40.90, range: '0.5 kg a 1 kg' };
    if (weightKg <= 2) return { value: 42.90, range: '1 kg a 2 kg' };
    if (weightKg <= 5) return { value: 50.90, range: '2 kg a 5 kg' };
    if (weightKg <= 9) return { value: 77.90, range: '5 kg a 9 kg' };
    if (weightKg <= 13) return { value: 98.90, range: '9 kg a 13 kg' };
    if (weightKg <= 17) return { value: 111.90, range: '13 kg a 17 kg' };
    if (weightKg <= 23) return { value: 134.90, range: '17 kg a 23 kg' };
    if (weightKg <= 29) return { value: 148.90, range: '23 kg a 29 kg' };
    if (weightKg <= 40) return { value: 159.90, range: '30 kg a 40 kg' };
    if (weightKg <= 50) return { value: 189.90, range: '40 kg a 50 kg' };
    if (weightKg <= 60) return { value: 197.90, range: '50 kg a 60 kg' };
    if (weightKg <= 70) return { value: 206.90, range: '60 kg a 70 kg' };
    if (weightKg <= 80) return { value: 215.90, range: '70 kg a 80 kg' };
    if (weightKg <= 90) return { value: 225.90, range: '80 kg a 90 kg' };
    if (weightKg <= 100) return { value: 235.90, range: '90 kg a 100 kg' };
    if (weightKg <= 110) return { value: 245.90, range: '100 kg a 110 kg' };
    if (weightKg <= 120) return { value: 256.90, range: '110 kg a 120 kg' };
    if (weightKg <= 130) return { value: 267.90, range: '120 kg a 130 kg' };
    if (weightKg <= 140) return { value: 279.90, range: '130 kg a 140 kg' };
    if (weightKg <= 150) return { value: 291.90, range: '140 kg a 150 kg' };
    if (weightKg <= 160) return { value: 304.90, range: '150 kg a 160 kg' };
    if (weightKg <= 170) return { value: 317.90, range: '160 kg a 170 kg' };
    if (weightKg <= 180) return { value: 331.90, range: '170 kg a 180 kg' };
    if (weightKg <= 190) return { value: 345.90, range: '180 kg a 190 kg' };
    if (weightKg <= 200) return { value: 360.90, range: '190 kg a 200 kg' };
    return { value: 375.90, range: 'Acima de 200 kg' };
  };

  // Get commission rate based on category and financial modality
  const getCommissionRate = (cat: string, modality: string): number => {
    if (cat === 'moda') {
      return modality === 'parcelado' ? 18 : 20;
    } else {
      return modality === 'parcelado' ? 14.8 : 18;
    }
  };

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

    if (!category) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Categoria do produto é obrigatória",
      });
      return;
    }

    if (!financialModality) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Modalidade financeira é obrigatória",
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
    
    // Product classification (LEVE vs PESADO)
    // LEVE: All dimensions <= 100cm AND sum of dimensions <= 200cm AND weight < 30kg
    const sumDimensions = heightCm + widthCm + lengthCm;
    const maxDimension = Math.max(heightCm, widthCm, lengthCm);
    const isHeavy = maxDimension > 100 || sumDimensions > 200 || calculatedWeight >= 30;

    // Fixed fee: R$ 5.00 if price > R$ 10.00, otherwise R$ 0.00
    const fixedFee = priceValue > 10 ? 5.00 : 0;

    // Commission rate based on category and financial modality
    const commissionRate = getCommissionRate(category, financialModality);
    const commission = (priceValue * commissionRate) / 100;
    
    // Shipping coparticipation
    let shippingCoparticipation = 0;
    let shippingWeightRange = 'N/A';
    
    // Only charge coparticipation if price > R$ 79.00
    if (priceValue > 79) {
      const shippingData = getShippingCoparticipation(calculatedWeight);
      const baseShipping = shippingData.value;
      shippingWeightRange = shippingData.range;
      
      // Apply dispatch level discount
      const levelData = dispatchLevels.find(l => l.value === dispatchLevel);
      const discount = levelData?.discount || 0;
      shippingCoparticipation = baseShipping * (1 - discount / 100);
    }

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
      shippingWeightRange,
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
      // Convert dimensions to cm for storage
      const heightCm = dimensionUnit === 'm' ? parseFloat(height) * 100 : parseFloat(height) || 0;
      const widthCm = dimensionUnit === 'm' ? parseFloat(width) * 100 : parseFloat(width) || 0;
      const lengthCm = dimensionUnit === 'm' ? parseFloat(length) * 100 : parseFloat(length) || 0;
      const weightKg = weightUnit === 'g' ? parseFloat(weight) / 1000 : parseFloat(weight) || 0;

      const { error } = await supabase.from('pricing_history').insert({
        user_id: user.id,
        product_name: productName || null,
        product_price: parseFloat(price),
        product_category: category,
        financial_modality: financialModality,
        dispatch_level: dispatchLevel,
        tax_percentage: taxPercentage ? parseFloat(taxPercentage) : 0,
        product_cost: productCost ? parseFloat(productCost) : 0,
        operational_cost: operationalCost ? parseFloat(operationalCost) : 0,
        height_cm: heightCm || null,
        width_cm: widthCm || null,
        length_cm: lengthCm || null,
        weight_kg: weightKg || null,
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
          <Label htmlFor="category">Categoria do Produto *</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="moda">Moda e Acessórios</SelectItem>
              <SelectItem value="demais">Demais Categorias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="financialModality">Modalidade Financeira *</Label>
          <Select value={financialModality} onValueChange={setFinancialModality}>
            <SelectTrigger id="financialModality">
              <SelectValue placeholder="Selecione a modalidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="parcelado">No Fluxo (Parcelado)</SelectItem>
              <SelectItem value="avista">Antecipação Automática (À Vista)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dispatchLevel">Nível de Despacho *</Label>
          <Select value={dispatchLevel} onValueChange={handleDispatchLevelChange}>
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

      {showDimensionSuggestion && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Como o preço do produto é superior a R$ 79,00, preencha as dimensões e peso para calcular a coparticipação no frete corretamente.
          </AlertDescription>
        </Alert>
      )}

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
                <p className="text-sm text-muted-foreground">
                  Comissão ({result.commissionRate}% - {category === 'moda' ? 'Moda' : 'Demais'}/{financialModality === 'parcelado' ? 'Parcelado' : 'À Vista'})
                </p>
                <p className="text-lg font-semibold">R$ {result.commission.toFixed(2)}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Coparticipação Frete ({result.shippingWeightRange})
                </p>
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
