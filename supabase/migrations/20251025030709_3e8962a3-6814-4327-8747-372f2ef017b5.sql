-- Add new columns to pricing_history table for Magalu Marketplace rules
ALTER TABLE public.pricing_history
ADD COLUMN product_category TEXT,
ADD COLUMN financial_modality TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.pricing_history.product_category IS 'Category: Moda e Acessórios or Demais Categorias';
COMMENT ON COLUMN public.pricing_history.financial_modality IS 'Financial modality: No Fluxo (Parcelado) or Antecipação Automática (À Vista)';