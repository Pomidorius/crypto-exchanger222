import { utils } from 'ethers';
import { TokenMap as ConstantsTokenMap } from './constants';
const { parseUnits, formatUnits } = utils;

export interface QuoteResult {
  quotedAmount: string;
  protocolFee: string;
}

// Адреса токенов для локальной разработки (импортируем из constants)
export const TokenMap = ConstantsTokenMap;

export async function quoteExactInput(
  fromSymbol: string,
  toSymbol: string,
  amount: string,
  slippagePercent: number
): Promise<QuoteResult> {
  const tokenIn = TokenMap[fromSymbol as keyof typeof TokenMap];
  const tokenOut = TokenMap[toSymbol as keyof typeof TokenMap];
  if (!tokenIn || !tokenOut) {
    throw new Error(`Unsupported token ${fromSymbol} or ${toSymbol}`);
  }

  const amountIn = parseUnits(amount, tokenIn.decimals);
  
  // Для локального тестирования всегда используем фиксированные курсы
  const mockRates: Record<string, Record<string, number>> = {
    'ETH': { 'USDC': 2000, 'USDT': 2000, 'WETH': 1 },
    'USDC': { 'ETH': 0.0005, 'USDT': 1, 'WETH': 0.0005 },
    'USDT': { 'ETH': 0.0005, 'USDC': 1, 'WETH': 0.0005 },
    'WETH': { 'ETH': 1, 'USDC': 2000, 'USDT': 2000 }
  };
  
  const rate = mockRates[fromSymbol]?.[toSymbol] || 1;
  const amountInFloat = parseFloat(formatUnits(amountIn, tokenIn.decimals));
  const amountOutFloat = amountInFloat * rate;
  
  // Применяем комиссию 0.1% к входящей сумме
  const feeAmount = amountInFloat * 0.001; // 0.1%
  const amountAfterFee = amountOutFloat * (1 - 0.001); // вычитаем комиссию из результата
  
  const mockQuote = parseUnits(amountAfterFee.toFixed(tokenOut.decimals), tokenOut.decimals);
  const protocolFee = parseUnits(feeAmount.toFixed(tokenIn.decimals), tokenIn.decimals);
  
  return {
    quotedAmount: mockQuote.toString(),
    protocolFee: protocolFee.toString(),
  };
}
