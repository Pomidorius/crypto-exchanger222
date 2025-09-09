import { utils } from 'ethers';
import { TokenMap as ConstantsTokenMap } from './constants';
import { getRealQuote, checkLiquidity } from './uniswap-real';
const { parseUnits, formatUnits } = utils;

export interface QuoteResult {
  quotedAmount: string;
  protocolFee: string;
  priceImpact?: string;
  gasEstimate?: string;
}

// Адреса токенов (импортируем из constants)
export const TokenMap = ConstantsTokenMap;

/**
 * Получение котировки - автоматически выбирает реальную или mock в зависимости от сети
 */
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

  // Определяем, использовать ли реальные котировки
  const shouldUseReal = await shouldUseRealQuotes();
  
  if (shouldUseReal) {
    try {
      console.log(`🔄 Получение реальной котировки для ${fromSymbol} -> ${toSymbol}`);
      const realQuote = await getRealQuote(fromSymbol, toSymbol, amount, slippagePercent);
      
      return {
        quotedAmount: realQuote.quotedAmount,
        protocolFee: realQuote.fee,
        priceImpact: realQuote.priceImpact,
        gasEstimate: realQuote.gasEstimate
      };
    } catch (error) {
      console.warn('Ошибка получения реальной котировки, используем fallback:', error);
      // Fallback на mock котировку
    }
  }
  
  // Mock котировка (для localhost или в случае ошибок)
  console.log(`🎭 Использование mock котировки для ${fromSymbol} -> ${toSymbol}`);
  return getMockQuote(fromSymbol, toSymbol, amount, slippagePercent);
}

/**
 * Определяет, следует ли использовать реальные котировки
 */
async function shouldUseRealQuotes(): Promise<boolean> {
  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID || '1';
  
  // Для localhost всегда используем mock
  if (chainId === '31337') {
    return false;
  }
  
  // Для mainnet и sepolia пробуем реальные котировки
  if (chainId === '1' || chainId === '11155111') {
    return true;
  }
  
  return false;
}

/**
 * Mock котировка (оригинальная логика)
 */
function getMockQuote(
  fromSymbol: string,
  toSymbol: string,
  amount: string,
  slippagePercent: number
): QuoteResult {
  const tokenIn = TokenMap[fromSymbol as keyof typeof TokenMap];
  const tokenOut = TokenMap[toSymbol as keyof typeof TokenMap];
  
  const amountIn = parseUnits(amount, tokenIn.decimals);
  
  // Обновленные mock курсы (ближе к реальным)
  const mockRates: Record<string, Record<string, number>> = {
    'ETH': { 'USDC': 3500, 'USDT': 3500, 'WETH': 1 },
    'USDC': { 'ETH': 1/3500, 'USDT': 1, 'WETH': 1/3500 },
    'USDT': { 'ETH': 1/3500, 'USDC': 1, 'WETH': 1/3500 },
    'WETH': { 'ETH': 1, 'USDC': 3500, 'USDT': 3500 }
  };
  
  const rate = mockRates[fromSymbol]?.[toSymbol] || 1;
  const amountInFloat = parseFloat(formatUnits(amountIn, tokenIn.decimals));
  const amountOutFloat = amountInFloat * rate;
  
  // Применяем комиссию 0.1%
  const feeAmount = amountInFloat * 0.001; // 0.1%
  const amountAfterFee = amountOutFloat * (1 - 0.001);
  
  const mockQuote = parseUnits(amountAfterFee.toFixed(tokenOut.decimals), tokenOut.decimals);
  const protocolFee = parseUnits(feeAmount.toFixed(tokenIn.decimals), tokenIn.decimals);
  
  return {
    quotedAmount: mockQuote.toString(),
    protocolFee: protocolFee.toString(),
    priceImpact: '0.1', // Минимальный impact для mock
    gasEstimate: '150000'
  };
}
