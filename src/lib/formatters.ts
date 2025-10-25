// Funções de formatação PT-BR para toda aplicação

/**
 * Formata valor monetário em PT-BR
 * @param value Valor numérico
 * @returns String formatada (ex: R$ 1.234,56)
 */
export const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

/**
 * Formata número decimal em PT-BR
 * @param value Valor numérico
 * @param decimals Número de casas decimais
 * @returns String formatada (ex: 1,234)
 */
export const formatDecimal = (value: number, decimals: number = 2): string => {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Formata percentual em PT-BR
 * @param value Valor numérico (ex: 14.8)
 * @returns String formatada (ex: 14,8%)
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }) + '%';
};

/**
 * Converte string de entrada para número (aceita vírgula ou ponto)
 * @param value String com valor (ex: "1.234,56" ou "1234.56")
 * @returns Número ou 0 se inválido
 */
export const parseNumber = (value: string): number => {
  if (!value) return 0;
  // Remove pontos de milhar e substitui vírgula por ponto
  const normalized = value.replace(/\./g, '').replace(',', '.');
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
};
