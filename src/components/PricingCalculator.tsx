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
import { Calculator, Save, AlertCircle, BookOpen, Trash2, HelpCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDecimal, formatPercentage, parseNumber } from '@/lib/formatters';

interface CalculationResult {
  calculatedWeight: number;
  isHeavy: boolean;
  fixedFee: number;
  commissionRate: number;
  commission: number;
  shippingCoparticipation: number;
  shippingCoparticipationCalculated: boolean;
  shippingWeightRange: string;
  tax: number;
  totalDeductions: number;
  estimatedReceipt: number;
  contributionMargin: number;
  contributionMarginPercentage: number;
  profitMargin: number;
  profitPercentage: number;
}

interface GlobalSettings {
  fixed_fee: number;
  commission_moda_antecipado: number;
  commission_moda_parcelado: number;
  commission_demais_antecipado: number;
  commission_demais_parcelado: number;
}

interface CommissionOption {
  value: string;
  label: string;
  rate: number;
  category: string;
  modality: string;
}

export function PricingCalculator() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Form states
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [commissionType, setCommissionType] = useState('');
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
  
  // Settings and options
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings | null>(null);
  const [customCommissionEnabled, setCustomCommissionEnabled] = useState(false);
  const [customCommissionRate, setCustomCommissionRate] = useState<number | null>(null);
  const [commissionOptions, setCommissionOptions] = useState<CommissionOption[]>([]);
  
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDimensionSuggestion, setShowDimensionSuggestion] = useState(false);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
    const savedLevel = localStorage.getItem('dispatchLevel');
    if (savedLevel) {
      setDispatchLevel(savedLevel);
    }
  }, [user]);

  // Show dimension suggestion when price > R$ 79
  useEffect(() => {
    const priceValue = parseNumber(price);
    if (priceValue > 79 && (!height || !width || !length || !weight)) {
      setShowDimensionSuggestion(true);
    } else {
      setShowDimensionSuggestion(false);
    }
  }, [price, height, width, length, weight]);

  const loadSettings = async () => {
    try {
      // Load global settings
      const { data: settings } = await supabase
        .from('global_settings')
        .select('*')
        .single();

      if (settings) {
        setGlobalSettings(settings);
        buildCommissionOptions(settings, null);
      }

      // Load user custom settings
      if (user) {
        const { data: customSettings } = await supabase
          .from('user_custom_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (customSettings && customSettings.custom_commission_enabled) {
          setCustomCommissionEnabled(true);
          setCustomCommissionRate(customSettings.custom_commission_rate);
          buildCommissionOptions(settings, customSettings.custom_commission_rate);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const buildCommissionOptions = (settings: GlobalSettings, customRate: number | null) => {
    const options: CommissionOption[] = [
      {
        value: 'moda_antecipado',
        label: `Moda e Acessórios - Antecipado (${formatPercentage(settings.commission_moda_antecipado)})`,
        rate: settings.commission_moda_antecipado,
        category: 'Moda',
        modality: 'Antecipado',
      },
      {
        value: 'demais_antecipado',
        label: `Demais Categorias - Antecipado (${formatPercentage(settings.commission_demais_antecipado)})`,
        rate: settings.commission_demais_antecipado,
        category: 'Demais',
        modality: 'Antecipado',
      },
      {
        value: 'moda_parcelado',
        label: `Moda e Acessórios - Fluxo Parcelado (${formatPercentage(settings.commission_moda_parcelado)})`,
        rate: settings.commission_moda_parcelado,
        category: 'Moda',
        modality: 'Parcelado',
      },
      {
        value: 'demais_parcelado',
        label: `Demais Categorias - Fluxo Parcelado (${formatPercentage(settings.commission_demais_parcelado)})`,
        rate: settings.commission_demais_parcelado,
        category: 'Demais',
        modality: 'Parcelado',
      },
    ];

    if (customRate !== null) {
      options.push({
        value: 'custom',
        label: `Personalizada (${formatPercentage(customRate)})`,
        rate: customRate,
        category: 'Personalizada',
        modality: 'Personalizada',
      });
    }

    setCommissionOptions(options);
  };

  const dispatchLevels = [
    { value: 'above_97', label: 'Acima de 97%', discount: 50 },
    { value: 'between_92_97', label: 'Entre 92% e 97%', discount: 25 },
    { value: 'below_92', label: 'Abaixo de 92%', discount: 0 },
    { value: 'fulfilment', label: 'Fulfilment', discount: 75 },
  ];

  const handleDispatchLevelChange = (value: string) => {
    setDispatchLevel(value);
    localStorage.setItem('dispatchLevel', value);
  };

  // Shipping coparticipation table
  const getShippingCoparticipation = (weightKg: number): { value: number; range: string } => {
    if (weightKg <= 0.5) return { value: 35.90, range: 'Até 0,5 kg' };
    if (weightKg <= 1) return { value: 40.90, range: '0,5 kg a 1 kg' };
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

  const calculatePricing = () => {
    const priceValue = parseNumber(price);
    
    if (!priceValue || priceValue <= 0) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preço do produto é obrigatório",
      });
      return;
    }

    if (!commissionType) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Tipo de comissão é obrigatório",
      });
      return;
    }

    if (!dispatchLevel) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Nível de despacho é obrigatório",
      });
      return;
    }

    if (!globalSettings) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Configurações não carregadas",
      });
      return;
    }

    // Get commission rate
    const selectedCommission = commissionOptions.find(opt => opt.value === commissionType);
    if (!selectedCommission) return;

    const commissionRate = selectedCommission.rate;
    const commission = (priceValue * commissionRate) / 100;

    // Fixed fee
    const fixedFee = priceValue > 10 ? globalSettings.fixed_fee : 0;

    // Calculate shipping coparticipation
    let shippingCoparticipation = 0;
    let shippingWeightRange = 'N/A';
    let calculatedWeight = 0;
    let isHeavy = false;
    let shippingCalculated = false;

    // Convert dimensions and weight
    const heightCm = dimensionUnit === 'm' ? parseNumber(height) * 100 : parseNumber(height);
    const widthCm = dimensionUnit === 'm' ? parseNumber(width) * 100 : parseNumber(width);
    const lengthCm = dimensionUnit === 'm' ? parseNumber(length) * 100 : parseNumber(length);
    const weightKg = weightUnit === 'g' ? parseNumber(weight) / 1000 : parseNumber(weight);

    // Check if we can calculate coparticipation
    const canCalculateShipping = priceValue > 79 && 
                                  weightKg > 0 && 
                                  heightCm > 0 && 
                                  widthCm > 0 && 
                                  lengthCm > 0;

    if (canCalculateShipping) {
      // Calculate cubic weight
      const volume = heightCm * widthCm * lengthCm;
      const cubicWeight = volume / 6000;
      calculatedWeight = Math.max(cubicWeight, weightKg);

      // Product classification
      const sumDimensions = heightCm + widthCm + lengthCm;
      const maxDimension = Math.max(heightCm, widthCm, lengthCm);
      isHeavy = maxDimension > 100 || sumDimensions > 200 || calculatedWeight >= 30;

      // Get shipping coparticipation
      const shippingData = getShippingCoparticipation(calculatedWeight);
      const baseShipping = shippingData.value;
      shippingWeightRange = shippingData.range;

      // Apply dispatch level discount
      const levelData = dispatchLevels.find(l => l.value === dispatchLevel);
      const discount = levelData?.discount || 0;
      shippingCoparticipation = baseShipping * (1 - discount / 100);
      shippingCalculated = true;
    } else if (heightCm > 0 || widthCm > 0 || lengthCm > 0 || weightKg > 0) {
      // Partial dimensions provided, calculate what we can for display
      if (heightCm > 0 && widthCm > 0 && lengthCm > 0 && weightKg > 0) {
        const volume = heightCm * widthCm * lengthCm;
        const cubicWeight = volume / 6000;
        calculatedWeight = Math.max(cubicWeight, weightKg);
        
        const sumDimensions = heightCm + widthCm + lengthCm;
        const maxDimension = Math.max(heightCm, widthCm, lengthCm);
        isHeavy = maxDimension > 100 || sumDimensions > 200 || calculatedWeight >= 30;
      }
    }

    // Total Magalu deductions
    const totalDeductions = fixedFee + commission + shippingCoparticipation;

    // Estimated receipt
    const estimatedReceipt = priceValue - totalDeductions;

    // Tax calculation (on product price, not on receipt)
    const taxValue = taxPercentage ? (priceValue * parseNumber(taxPercentage)) / 100 : 0;

    // Contribution margin: receipt - tax - product cost
    const costProduct = parseNumber(productCost);
    const contributionMargin = estimatedReceipt - taxValue - costProduct;
    const contributionMarginPercentage = priceValue > 0 ? (contributionMargin / priceValue) * 100 : 0;

    // Profit margin: contribution margin - operational cost
    const costOperational = parseNumber(operationalCost);
    const profitMargin = contributionMargin - costOperational;
    const profitPercentage = priceValue > 0 ? (profitMargin / priceValue) * 100 : 0;

    const calculationResult: CalculationResult = {
      calculatedWeight,
      isHeavy,
      fixedFee,
      commissionRate,
      commission,
      shippingCoparticipation,
      shippingCoparticipationCalculated: shippingCalculated,
      shippingWeightRange,
      tax: taxValue,
      totalDeductions,
      estimatedReceipt,
      contributionMargin,
      contributionMarginPercentage,
      profitMargin,
      profitPercentage,
    };

    setResult(calculationResult);
  };

  const saveToHistory = async () => {
    if (!result || !user) return;
    
    setLoading(true);
    try {
      const heightCm = dimensionUnit === 'm' ? parseNumber(height) * 100 : parseNumber(height);
      const widthCm = dimensionUnit === 'm' ? parseNumber(width) * 100 : parseNumber(width);
      const lengthCm = dimensionUnit === 'm' ? parseNumber(length) * 100 : parseNumber(length);
      const weightKg = weightUnit === 'g' ? parseNumber(weight) / 1000 : parseNumber(weight);

      const selectedCommission = commissionOptions.find(opt => opt.value === commissionType);

      const { error } = await supabase.from('pricing_history').insert({
        user_id: user.id,
        product_name: productName || null,
        product_price: parseNumber(price),
        commission_type: selectedCommission?.label || '',
        commission_rate: result.commissionRate,
        is_custom_commission: commissionType === 'custom',
        product_category: selectedCommission?.category || '',
        financial_modality: selectedCommission?.modality || '',
        dispatch_level: dispatchLevel,
        tax_percentage: taxPercentage ? parseNumber(taxPercentage) : 0,
        product_cost: productCost ? parseNumber(productCost) : 0,
        operational_cost: operationalCost ? parseNumber(operationalCost) : 0,
        height_cm: heightCm || null,
        width_cm: widthCm || null,
        length_cm: lengthCm || null,
        weight_kg: weightKg || null,
        calculated_weight: result.calculatedWeight,
        is_heavy: result.isHeavy,
        fixed_fee: result.fixedFee,
        shipping_coparticipation: result.shippingCoparticipation,
        shipping_coparticipation_calculated: result.shippingCoparticipationCalculated,
        shipping_coparticipation_value: result.shippingCoparticipation,
        estimated_receipt: result.estimatedReceipt,
        contribution_margin: result.contributionMargin,
        contribution_margin_percentage: result.contributionMarginPercentage,
        profit_margin: result.profitMargin,
        profit_margin_percentage: result.profitPercentage,
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

  const clearForm = () => {
    setProductName('');
    setPrice('');
    setTaxPercentage('');
    setProductCost('');
    setOperationalCost('');
    setHeight('');
    setWidth('');
    setLength('');
    setWeight('');
    setResult(null);
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
            type="text"
            placeholder="100,00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="commissionType">Tipo de Comissão *</Label>
          <Select value={commissionType} onValueChange={setCommissionType}>
            <SelectTrigger id="commissionType">
              <SelectValue placeholder="Selecione o tipo de comissão" />
            </SelectTrigger>
            <SelectContent>
              {commissionOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
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
          <Label htmlFor="tax">Imposto (%) (opcional)</Label>
          <Input
            id="tax"
            type="text"
            placeholder="0"
            value={taxPercentage}
            onChange={(e) => setTaxPercentage(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="productCost">Custo do Produto (R$) (opcional)</Label>
          <Input
            id="productCost"
            type="text"
            placeholder="0,00"
            value={productCost}
            onChange={(e) => setProductCost(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="operationalCost">Custo Operacional (R$) (opcional)</Label>
          <Input
            id="operationalCost"
            type="text"
            placeholder="0,00"
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
            Como o preço do produto é superior a R$ 79,00, preencha <strong>TODAS as dimensões (altura, largura e comprimento) e o peso</strong> para calcular a coparticipação no frete corretamente.
          </AlertDescription>
        </Alert>
      )}

      {/* Dimensions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Dimensões do Produto</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dimensionUnit" className="flex items-center gap-2">
              Unidade de Medida
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Esta unidade se aplica a todos os campos de dimensão (altura, largura e comprimento)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Select value={dimensionUnit} onValueChange={setDimensionUnit}>
              <SelectTrigger id="dimensionUnit" className="w-full md:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cm">Centímetros (cm)</SelectItem>
                <SelectItem value="m">Metros (m)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="height">Altura</Label>
              <Input
                id="height"
                type="text"
                placeholder="0"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="width">Largura</Label>
              <Input
                id="width"
                type="text"
                placeholder="0"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="length">Comprimento</Label>
              <Input
                id="length"
                type="text"
                placeholder="0"
                value={length}
                onChange={(e) => setLength(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weightUnit">Unidade de Peso</Label>
            <Select value={weightUnit} onValueChange={setWeightUnit}>
              <SelectTrigger id="weightUnit" className="w-full md:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">Quilogramas (kg)</SelectItem>
                <SelectItem value="g">Gramas (g)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Peso</Label>
            <Input
              id="weight"
              type="text"
              placeholder="0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full md:w-64"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={calculatePricing} className="flex-1">
          <Calculator className="mr-2 h-4 w-4" />
          Calcular
        </Button>
        <Button onClick={clearForm} variant="outline">
          <Trash2 className="mr-2 h-4 w-4" />
          Limpar
        </Button>
      </div>

      {/* Results */}
      {result && (
        <Card className="bg-gradient-subtle border-primary/20">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Análise Financeira Completa</h3>
              <Button variant="outline" size="sm" onClick={saveToHistory} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </Button>
            </div>
            
            <Separator />

            <div>
              <h4 className="font-semibold mb-3">Detalhes do Cálculo</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Tipo de Produto</p>
                  <p className="text-lg font-semibold">
                    {result.isHeavy ? 'Pesado' : 'Leve'}
                  </p>
                </div>

                {result.calculatedWeight > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">Peso Considerado</p>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Maior valor entre cubagem (volume÷6000) e peso real</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <p className="text-lg font-semibold">{formatDecimal(result.calculatedWeight, 3)} kg</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-3">Deduções do Magalu</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Taxa Fixa</p>
                  <p className="text-lg font-semibold">{formatCurrency(result.fixedFee)}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Comissão ({formatPercentage(result.commissionRate)})
                  </p>
                  <p className="text-lg font-semibold">{formatCurrency(result.commission)}</p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <p className="text-sm text-muted-foreground">Coparticipação Frete</p>
                  {result.shippingCoparticipationCalculated ? (
                    <>
                      <p className="text-lg font-semibold">{formatCurrency(result.shippingCoparticipation)}</p>
                      <p className="text-xs text-muted-foreground">
                        Faixa: {result.shippingWeightRange}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      {parseNumber(price) <= 79 
                        ? 'ℹ️ Coparticipação não aplicável (produto abaixo de R$ 79,00)' 
                        : '⚠️ Informe peso e TODAS as dimensões (altura, largura e comprimento) para calcular a coparticipação no frete'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10">
              <span className="text-lg font-semibold">Previsão de Recebimento</span>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(result.estimatedReceipt)}
              </span>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-3">Custos Variáveis (para Margem de Contribuição)</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Imposto ({taxPercentage ? formatPercentage(parseNumber(taxPercentage)) : '0%'})
                  </p>
                  <p className="text-lg font-semibold">{formatCurrency(result.tax)}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Custo do Produto (CMV)</p>
                  <p className="text-lg font-semibold">{formatCurrency(parseNumber(productCost))}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-success/10">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">Margem de Contribuição</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Quanto sobra após custos variáveis (deduções + impostos + CMV)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-success">
                  {formatCurrency(result.contributionMargin)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatPercentage(result.contributionMarginPercentage)} do preço
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-3">Custos Fixos</h4>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Custo Operacional</p>
                <p className="text-lg font-semibold">{formatCurrency(parseNumber(operationalCost))}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">Margem de Lucro Líquida</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Lucro final após todos os custos (variáveis + fixos)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(result.profitMargin)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatPercentage(result.profitPercentage)} do preço
                </p>
              </div>
            </div>

            <Separator />

            <Link to="/ajuda/magalu-taxas">
              <Button variant="link" className="p-0 h-auto">
                <BookOpen className="mr-2 h-4 w-4" />
                Entenda as Taxas
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
