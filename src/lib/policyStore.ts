import type { Quote } from './types';

const STORAGE_KEY = 'policy_admin_quotes';

const read = (): Quote[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Quote[]) : [];
  } catch {
    return [];
  }
};

const write = (quotes: Quote[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
};

export const listQuotes = (): Quote[] =>
  read().sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export const getQuote = (id: string): Quote | undefined =>
  read().find((quote) => quote.id === id);

export interface CreateQuoteInput {
  applicantName: string;
  product: string;
  coverageAmount: number;
  createdBy?: string;
}

// Simple premium model: 1.8% of coverage with a $250 policy minimum.
export const calculatePremium = (coverageAmount: number): number => {
  const premium = coverageAmount * 0.018;
  return Math.max(250, Math.round(premium * 100) / 100);
};

export const createQuote = (input: CreateQuoteInput): Quote => {
  const quotes = read();
  const quote: Quote = {
    id: `Q-${Date.now().toString(36).toUpperCase()}`,
    applicantName: input.applicantName,
    product: input.product,
    coverageAmount: input.coverageAmount,
    premium: calculatePremium(input.coverageAmount),
    status: 'quoted',
    createdAt: new Date().toISOString(),
    createdBy: input.createdBy,
  };
  quotes.push(quote);
  write(quotes);
  return quote;
};

export const bindQuote = (id: string): Quote | undefined => {
  const quotes = read();
  const index = quotes.findIndex((quote) => quote.id === id);
  if (index === -1) {
    return undefined;
  }

  if (quotes[index].status === 'bound') {
    return quotes[index];
  }

  quotes[index] = {
    ...quotes[index],
    status: 'bound',
    policyNumber: `POL-${Date.now().toString(36).toUpperCase()}`,
    boundAt: new Date().toISOString(),
  };
  write(quotes);
  return quotes[index];
};
