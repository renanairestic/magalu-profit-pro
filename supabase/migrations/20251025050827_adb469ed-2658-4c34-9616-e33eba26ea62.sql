-- Criar tabela global_settings para configurações globais do sistema
CREATE TABLE IF NOT EXISTS public.global_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fixed_fee NUMERIC NOT NULL DEFAULT 5.00,
  commission_moda_antecipado NUMERIC NOT NULL DEFAULT 20.0,
  commission_moda_parcelado NUMERIC NOT NULL DEFAULT 18.0,
  commission_demais_antecipado NUMERIC NOT NULL DEFAULT 18.0,
  commission_demais_parcelado NUMERIC NOT NULL DEFAULT 14.8,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Inserir valores padrão
INSERT INTO public.global_settings (fixed_fee, commission_moda_antecipado, commission_moda_parcelado, commission_demais_antecipado, commission_demais_parcelado)
VALUES (5.00, 20.0, 18.0, 18.0, 14.8);

-- Enable RLS
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;

-- Policies: todos podem ler, apenas admins podem atualizar (por enquanto todos podem ler)
CREATE POLICY "Anyone can view global settings"
ON public.global_settings
FOR SELECT
USING (true);

-- Criar tabela user_custom_settings para comissões personalizadas por usuário
CREATE TABLE IF NOT EXISTS public.user_custom_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  custom_commission_enabled BOOLEAN DEFAULT false,
  custom_commission_rate NUMERIC,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_custom_settings ENABLE ROW LEVEL SECURITY;

-- Policies: usuário vê apenas suas próprias configurações
CREATE POLICY "Users can view own custom settings"
ON public.user_custom_settings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own custom settings"
ON public.user_custom_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own custom settings"
ON public.user_custom_settings
FOR UPDATE
USING (auth.uid() = user_id);

-- Criar tabela help_pages para sistema de ajuda editável
CREATE TABLE IF NOT EXISTS public.help_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  platform TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.help_pages ENABLE ROW LEVEL SECURITY;

-- Policies: todos podem ler páginas ativas
CREATE POLICY "Anyone can view active help pages"
ON public.help_pages
FOR SELECT
USING (active = true);

-- Adicionar novos campos à tabela pricing_history
ALTER TABLE public.pricing_history
ADD COLUMN IF NOT EXISTS commission_type TEXT,
ADD COLUMN IF NOT EXISTS commission_rate NUMERIC,
ADD COLUMN IF NOT EXISTS is_custom_commission BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS shipping_coparticipation_calculated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS shipping_coparticipation_value NUMERIC,
ADD COLUMN IF NOT EXISTS contribution_margin NUMERIC,
ADD COLUMN IF NOT EXISTS contribution_margin_percentage NUMERIC,
ADD COLUMN IF NOT EXISTS profit_margin_percentage NUMERIC;

-- Criar trigger para atualizar updated_at na tabela help_pages
CREATE TRIGGER update_help_pages_updated_at
BEFORE UPDATE ON public.help_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Inserir página de ajuda padrão do Magalu
INSERT INTO public.help_pages (slug, title, content, platform, active)
VALUES (
  'magalu-taxas',
  'Entenda as Taxas do Magalu Marketplace',
  '<h2>Taxa Fixa</h2><p>Valor cobrado por venda realizada. Atualmente R$ 5,00 para produtos acima de R$ 10,00.</p><h2>Comissão</h2><p>Percentual sobre o preço do produto que varia conforme categoria e modalidade de recebimento:</p><ul><li>Moda e Acessórios - Fluxo Parcelado: 18%</li><li>Moda e Acessórios - Antecipação: 20%</li><li>Demais Categorias - Fluxo Parcelado: 14,8%</li><li>Demais Categorias - Antecipação: 18%</li></ul><h2>Coparticipação no Frete</h2><p>A coparticipação no frete é calculada com base no peso considerado (maior entre peso real e cubagem) e pode receber descontos conforme seu nível de despacho.</p><h2>Níveis de Despacho</h2><ul><li>Acima de 97%: 50% de desconto</li><li>Entre 92% e 97%: 25% de desconto</li><li>Abaixo de 92%: sem desconto</li><li>Fulfilment: 75% de desconto</li></ul>',
  'Magalu',
  true
);