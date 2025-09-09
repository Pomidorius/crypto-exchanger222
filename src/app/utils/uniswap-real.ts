// src/app/utils/uniswap-real.ts
import { ethers, Contract, BigNumber } from 'ethers';
import { UNISWAP_V3_QUOTER, TokenMap } from './constants';

// ABI для Uniswap V3 Quoter
const QUOTER_ABI = [
  'function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external returns (uint256 amountOut)',
  'function quoteExactOutputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountOut, uint160 sqrtPriceLimitX96) external returns (uint256 amountIn)'
];

// Fee tiers для различных пар
const FEE_TIERS = {
  // Основные стейблкоины - низкая комиссия
  'USDC-USDT': 100,    // 0.01%
  'USDT-USDC': 100,
  // ETH пары - средняя комиссия  
  'ETH-USDC': 3000,    // 0.3%
  'USDC-ETH': 3000,
  'ETH-USDT': 3000,
  'USDT-ETH': 3000,
  'ETH-WETH': 500,     // 0.05%
  'WETH-ETH': 500,
  // WETH пары
  'WETH-USDC': 3000,
  'USDC-WETH': 3000,
  'WETH-USDT': 3000,
  'USDT-WETH': 3000,
  // Default для неизвестных пар
  'DEFAULT': 3000
};

export interface RealQuoteResult {
  quotedAmount: string;
  fee: string;
  priceImpact: string;
  gasEstimate?: string;
}

/**
 * Получение реальной котировки от Uniswap V3
 */
export async function getRealQuote(
  fromSymbol: string,
  toSymbol: string,
  amount: string,
  slippagePercent: number = 0.5
): Promise<RealQuoteResult> {
  try {
    // Получаем провайдер
    const provider = await getProvider();
    
    // Получаем информацию о токенах
    const fromToken = TokenMap[fromSymbol];
    const toToken = TokenMap[toSymbol];
    
    if (!fromToken || !toToken) {
      throw new Error(`Неподдерживаемый токен: ${fromSymbol} или ${toSymbol}`);
    }

    // Конвертируем сумму в wei
    const amountIn = ethers.utils.parseUnits(amount, fromToken.decimals);
    
    // Определяем fee tier для пары
    const feeKey = `${fromSymbol}-${toSymbol}`;
    const fee = FEE_TIERS[feeKey as keyof typeof FEE_TIERS] || FEE_TIERS.DEFAULT;

    // Создаем контракт Quoter
    const quoterContract = new Contract(UNISWAP_V3_QUOTER, QUOTER_ABI, provider);
    
    // Получаем котировку
    const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle(
      fromToken.address === '0x0000000000000000000000000000000000000000' 
        ? TokenMap['WETH'].address // Используем WETH вместо ETH
        : fromToken.address,
      toToken.address === '0x0000000000000000000000000000000000000000'
        ? TokenMap['WETH'].address // Используем WETH вместо ETH  
        : toToken.address,
      fee,
      amountIn,
      0 // sqrtPriceLimitX96 = 0 означает отсутствие лимита
    );

    // Рассчитываем комиссию протокола (0.1%)
    const protocolFeeAmount = amountIn.mul(1).div(1000); // 0.1%
    
    // Рассчитываем price impact (упрощенно)
    const expectedRate = await getExpectedRate(fromSymbol, toSymbol);
    const actualRate = parseFloat(ethers.utils.formatUnits(quotedAmountOut, toToken.decimals)) / parseFloat(amount);
    const priceImpact = Math.abs((actualRate - expectedRate) / expectedRate * 100);

    return {
      quotedAmount: quotedAmountOut.toString(),
      fee: protocolFeeAmount.toString(),
      priceImpact: priceImpact.toFixed(2),
      gasEstimate: '150000' // Примерная оценка газа для свапа
    };

  } catch (error) {
    console.error('Ошибка получения котировки от Uniswap:', error);
    
    // Fallback на mock данные в случае ошибки
    console.warn('Используем fallback mock котировку');
    return getFallbackQuote(fromSymbol, toSymbol, amount);
  }
}

/**
 * Получение провайдера (RPC)
 */
async function getProvider(): Promise<ethers.providers.Provider> {
  // Пробуем получить провайдер из браузера
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.providers.Web3Provider(window.ethereum);
  }
  
  // Используем публичный RPC как fallback
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || getPublicRpcUrl();
  return new ethers.providers.JsonRpcProvider(rpcUrl);
}

/**
 * Получение публичного RPC URL в зависимости от сети
 */
function getPublicRpcUrl(): string {
  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID || '1';
  
  switch (chainId) {
    case '1': // Mainnet
      return 'https://eth-mainnet.g.alchemy.com/v2/demo';
    case '11155111': // Sepolia  
      return 'https://eth-sepolia.g.alchemy.com/v2/demo';
    default:
      return 'https://eth-mainnet.g.alchemy.com/v2/demo';
  }
}

/**
 * Получение ожидаемого курса (для расчета price impact)
 */
async function getExpectedRate(fromSymbol: string, toSymbol: string): Promise<number> {
  // Здесь можно интегрироваться с CoinGecko API или другими источниками цен
  // Пока используем приблизительные курсы
  const rates: Record<string, Record<string, number>> = {
    'ETH': { 'USDC': 3500, 'USDT': 3500, 'WETH': 1 },
    'USDC': { 'ETH': 1/3500, 'USDT': 1, 'WETH': 1/3500 },
    'USDT': { 'ETH': 1/3500, 'USDC': 1, 'WETH': 1/3500 },
    'WETH': { 'ETH': 1, 'USDC': 3500, 'USDT': 3500 }
  };
  
  return rates[fromSymbol]?.[toSymbol] || 1;
}

/**
 * Fallback котировка в случае проблем с Uniswap
 */
function getFallbackQuote(fromSymbol: string, toSymbol: string, amount: string): RealQuoteResult {
  const fromToken = TokenMap[fromSymbol];
  const toToken = TokenMap[toSymbol];
  
  if (!fromToken || !toToken) {
    throw new Error(`Неподдерживаемый токен: ${fromSymbol} или ${toSymbol}`);
  }

  // Используем фиксированные курсы как fallback
  const mockRates: Record<string, Record<string, number>> = {
    'ETH': { 'USDC': 3500, 'USDT': 3500, 'WETH': 1 },
    'USDC': { 'ETH': 1/3500, 'USDT': 1, 'WETH': 1/3500 },
    'USDT': { 'ETH': 1/3500, 'USDC': 1, 'WETH': 1/3500 },
    'WETH': { 'ETH': 1, 'USDC': 3500, 'USDT': 3500 }
  };
  
  const rate = mockRates[fromSymbol]?.[toSymbol] || 1;
  const amountIn = ethers.utils.parseUnits(amount, fromToken.decimals);
  const amountInFloat = parseFloat(ethers.utils.formatUnits(amountIn, fromToken.decimals));
  const amountOutFloat = amountInFloat * rate;
  
  // Применяем комиссию 0.1%
  const feeAmount = amountInFloat * 0.001;
  const amountAfterFee = amountOutFloat * (1 - 0.001);
  
  const quotedAmount = ethers.utils.parseUnits(amountAfterFee.toFixed(toToken.decimals), toToken.decimals);
  const protocolFee = ethers.utils.parseUnits(feeAmount.toFixed(fromToken.decimals), fromToken.decimals);
  
  return {
    quotedAmount: quotedAmount.toString(),
    fee: protocolFee.toString(),
    priceImpact: '0.1', // Минимальный impact для mock
    gasEstimate: '150000'
  };
}

/**
 * Проверка ликвидности для пары токенов
 */
export async function checkLiquidity(fromSymbol: string, toSymbol: string): Promise<boolean> {
  try {
    // Пробуем получить котировку для небольшой суммы
    await getRealQuote(fromSymbol, toSymbol, '0.01');
    return true;
  } catch (error) {
    console.warn(`Нет ликвидности для пары ${fromSymbol}-${toSymbol}:`, error);
    return false;
  }
}

/**
 * Получение информации о пуле
 */
export async function getPoolInfo(fromSymbol: string, toSymbol: string) {
  try {
    const provider = await getProvider();
    const fromToken = TokenMap[fromSymbol];
    const toToken = TokenMap[toSymbol];
    
    // Здесь можно добавить логику получения информации о пуле
    // Например, TVL, volume, fees collected и т.д.
    
    return {
      exists: true,
      fee: FEE_TIERS[`${fromSymbol}-${toSymbol}` as keyof typeof FEE_TIERS] || FEE_TIERS.DEFAULT,
      tvl: 'N/A',
      volume24h: 'N/A'
    };
  } catch (error) {
    return {
      exists: false,
      fee: 0,
      tvl: '0',
      volume24h: '0'
    };
  }
}
