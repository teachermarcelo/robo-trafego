export type SupportedCurrencyCode =
  | 'BRL'
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'AUD'
  | 'CAD'
  | 'MXN'
  | 'ARS'
  | 'COP';

export interface CurrencyOption {
  code: SupportedCurrencyCode;
  symbol: string;
  label: string;
  decimalSeparator: ',' | '.';
}

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: 'BRL', symbol: 'R$', label: '🇧🇷 Real Brasileiro (R$ BRL)', decimalSeparator: ',' },
  { code: 'USD', symbol: '$', label: '🇺🇸 Dólar Americano ($ USD)', decimalSeparator: '.' },
  { code: 'EUR', symbol: '€', label: '🇪🇺 Euro (€ EUR)', decimalSeparator: ',' },
  { code: 'GBP', symbol: '£', label: '🇬🇧 Libra Esterlina (£ GBP)', decimalSeparator: '.' },
  { code: 'AUD', symbol: 'A$', label: '🇦🇺 Dólar Australiano (A$ AUD)', decimalSeparator: '.' },
  { code: 'CAD', symbol: 'C$', label: '🇨🇦 Dólar Canadense (C$ CAD)', decimalSeparator: '.' },
  { code: 'MXN', symbol: 'MX$', label: '🇲🇽 Peso Mexicano (MX$ MXN)', decimalSeparator: '.' },
  { code: 'ARS', symbol: 'AR$', label: '🇦🇷 Peso Argentino (AR$ ARS)', decimalSeparator: ',' },
  { code: 'COP', symbol: 'COL$', label: '🇨🇴 Peso Colombiano (COL$ COP)', decimalSeparator: '.' },
];

export function getCurrencyOption(code?: string): CurrencyOption {
  const upper = String(code || 'BRL').trim().toUpperCase();
  return CURRENCY_OPTIONS.find((c) => c.code === upper) || CURRENCY_OPTIONS[0];
}

export function getCurrencySymbol(code?: string): string {
  return getCurrencyOption(code).symbol;
}

export function formatCurrencyPrice(value: number | string, code?: string): string {
  const num =
    typeof value === 'number'
      ? value
      : parseFloat(String(value || '0').replace(',', '.')) || 0;
  const opt = getCurrencyOption(code);
  const fixed = num.toFixed(2);
  const formatted = opt.decimalSeparator === ',' ? fixed.replace('.', ',') : fixed;
  return `${opt.symbol} ${formatted}`;
}

export function replacePriceCurrencyPrefix(priceText: string, nextCode: string): string {
  const raw = String(priceText || '').trim();
  const match = raw.match(/(\d+(?:[.,]\d{1,2})?)/);
  if (!match) return raw;
  const numericVal = parseFloat(match[1].replace(',', '.'));
  if (!Number.isFinite(numericVal) || numericVal <= 0) return raw;
  // Preserve descriptive text like "Up to 75% Off" unless it's clearly a monetary price
  if (/%|\boff\b|\bdesconto\b/i.test(raw) && !/(R\$|\$|€|£|A\$|C\$|MX\$|AR\$|COL\$)/i.test(raw)) {
    return raw;
  }
  return formatCurrencyPrice(numericVal, nextCode);
}
