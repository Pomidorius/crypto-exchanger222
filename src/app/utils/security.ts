// src/app/utils/security.ts
import { ethers } from 'ethers'

/**
 * Утилиты для обеспечения безопасности приложения
 */

// Максимальные лимиты для защиты от больших потерь
export const SECURITY_LIMITS = {
  MAX_SWAP_AMOUNT_ETH: ethers.utils.parseEther('10'), // 10 ETH максимум
  MAX_SLIPPAGE_PERCENT: 5, // 5% максимальный slippage
  MIN_SLIPPAGE_PERCENT: 0.1, // 0.1% минимальный slippage
  MAX_GAS_PRICE_GWEI: 200, // 200 gwei максимальная цена газа
  TRANSACTION_TIMEOUT: 300000, // 5 минут таймаут
}

// Известные опасные адреса (можно расширить)
const BLACKLISTED_ADDRESSES = new Set([
  '0x0000000000000000000000000000000000000000',
  // Добавить известные scam адреса
])

// Известные безопасные контракты
const WHITELISTED_CONTRACTS = new Set([
  '0xE592427A0AEce92De3Edee1F18E0157C05861564', // Uniswap V3 Router
  '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // Uniswap V2 Router
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
])

/**
 * Проверка безопасности транзакции перед выполнением
 */
export async function validateTransactionSecurity(params: {
  fromToken: string
  toToken: string
  amount: string
  slippage: number
  userAddress: string
  contractAddress: string
}): Promise<{ isValid: boolean; warnings: string[]; errors: string[] }> {
  const warnings: string[] = []
  const errors: string[] = []
  
  const { fromToken, toToken, amount, slippage, userAddress, contractAddress } = params
  
  // 1. Проверка адресов
  if (!ethers.utils.isAddress(userAddress)) {
    errors.push('Неверный адрес пользователя')
  }
  
  if (!ethers.utils.isAddress(contractAddress)) {
    errors.push('Неверный адрес контракта')
  }
  
  if (BLACKLISTED_ADDRESSES.has(userAddress.toLowerCase())) {
    errors.push('Адрес пользователя в черном списке')
  }
  
  // 2. Проверка суммы
  try {
    const amountBN = ethers.utils.parseEther(amount)
    if (amountBN.gt(SECURITY_LIMITS.MAX_SWAP_AMOUNT_ETH)) {
      warnings.push(`Большая сумма свапа: ${amount} ETH (макс. ${ethers.utils.formatEther(SECURITY_LIMITS.MAX_SWAP_AMOUNT_ETH)} ETH)`)
    }
    
    if (amountBN.lte(0)) {
      errors.push('Сумма должна быть больше нуля')
    }
  } catch (error) {
    errors.push('Неверный формат суммы')
  }
  
  // 3. Проверка slippage
  if (slippage > SECURITY_LIMITS.MAX_SLIPPAGE_PERCENT) {
    errors.push(`Slippage слишком высокий: ${slippage}% (макс. ${SECURITY_LIMITS.MAX_SLIPPAGE_PERCENT}%)`)
  }
  
  if (slippage < SECURITY_LIMITS.MIN_SLIPPAGE_PERCENT) {
    warnings.push(`Низкий slippage: ${slippage}% (мин. ${SECURITY_LIMITS.MIN_SLIPPAGE_PERCENT}%)`)
  }
  
  // 4. Проверка токенов
  if (fromToken === toToken) {
    errors.push('Нельзя обменивать токен сам на себя')
  }
  
  // 5. Проверка газа
  try {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const gasPrice = await provider.getGasPrice()
      const gasPriceGwei = parseFloat(ethers.utils.formatUnits(gasPrice, 'gwei'))
      
      if (gasPriceGwei > SECURITY_LIMITS.MAX_GAS_PRICE_GWEI) {
        warnings.push(`Высокая цена газа: ${gasPriceGwei.toFixed(1)} gwei`)
      }
    }
  } catch (error) {
    warnings.push('Не удалось проверить цену газа')
  }
  
  return {
    isValid: errors.length === 0,
    warnings,
    errors
  }
}

/**
 * Проверка безопасности контракта
 */
export async function validateContractSecurity(contractAddress: string): Promise<{
  isValid: boolean
  warnings: string[]
  errors: string[]
  contractInfo?: {
    isContract: boolean
    hasCode: boolean
    isVerified?: boolean
  }
}> {
  const warnings: string[] = []
  const errors: string[] = []
  
  try {
    if (!ethers.utils.isAddress(contractAddress)) {
      errors.push('Неверный адрес контракта')
      return { isValid: false, warnings, errors }
    }
    
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const code = await provider.getCode(contractAddress)
    
    const contractInfo = {
      isContract: code !== '0x',
      hasCode: code !== '0x'
    }
    
    if (!contractInfo.isContract) {
      errors.push('По указанному адресу нет контракта')
    }
    
    // Проверяем whitelist
    if (!WHITELISTED_CONTRACTS.has(contractAddress.toLowerCase())) {
      warnings.push('Контракт не в белом списке проверенных контрактов')
    }
    
    return {
      isValid: errors.length === 0,
      warnings,
      errors,
      contractInfo
    }
    
  } catch (error) {
    errors.push(`Ошибка проверки контракта: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return { isValid: false, warnings, errors }
  }
}

/**
 * Проверка баланса пользователя
 */
export async function checkUserBalance(
  userAddress: string, 
  tokenAddress: string, 
  requiredAmount: string
): Promise<{ 
  hasEnoughBalance: boolean 
  currentBalance: string 
  requiredBalance: string 
  warnings: string[] 
}> {
  const warnings: string[] = []
  
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    let balance: ethers.BigNumber
    
    if (tokenAddress === '0x0000000000000000000000000000000000000000') {
      // ETH balance
      balance = await provider.getBalance(userAddress)
    } else {
      // ERC20 balance
      const tokenContract = new ethers.Contract(tokenAddress, [
        'function balanceOf(address) view returns (uint256)'
      ], provider)
      balance = await tokenContract.balanceOf(userAddress)
    }
    
    const required = ethers.utils.parseEther(requiredAmount)
    const hasEnough = balance.gte(required)
    
    // Предупреждение если баланс близок к нулю
    if (balance.lt(required.mul(110).div(100))) { // меньше чем 110% от требуемого
      warnings.push('Баланс близок к минимуму, учтите комиссию за газ')
    }
    
    return {
      hasEnoughBalance: hasEnough,
      currentBalance: ethers.utils.formatEther(balance),
      requiredBalance: requiredAmount,
      warnings
    }
    
  } catch (error) {
    warnings.push(`Ошибка проверки баланса: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return {
      hasEnoughBalance: false,
      currentBalance: '0',
      requiredBalance: requiredAmount,
      warnings
    }
  }
}

/**
 * Генерация безопасного nonce для предотвращения replay атак
 */
export function generateSecureNonce(): string {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2)
  return `${timestamp}-${random}`
}

/**
 * Проверка подлинности подписи (для будущих функций)
 */
export async function verifySignature(
  message: string,
  signature: string,
  expectedSigner: string
): Promise<boolean> {
  try {
    const recoveredAddress = ethers.utils.verifyMessage(message, signature)
    return recoveredAddress.toLowerCase() === expectedSigner.toLowerCase()
  } catch (error) {
    console.error('Ошибка проверки подписи:', error)
    return false
  }
}

/**
 * Защита от sandwich атак - проверка изменения цены
 */
export async function detectPriceManipulation(
  tokenIn: string,
  tokenOut: string,
  expectedPrice: string,
  actualPrice: string,
  tolerancePercent: number = 2
): Promise<{ 
  isPotentialManipulation: boolean 
  priceDeviation: number 
  warning?: string 
}> {
  try {
    const expected = parseFloat(expectedPrice)
    const actual = parseFloat(actualPrice)
    
    if (expected === 0) {
      return { isPotentialManipulation: false, priceDeviation: 0 }
    }
    
    const deviation = Math.abs((actual - expected) / expected * 100)
    const isPotentialManipulation = deviation > tolerancePercent
    
    return {
      isPotentialManipulation,
      priceDeviation: deviation,
      warning: isPotentialManipulation ? 
        `Подозрительное изменение цены: ${deviation.toFixed(2)}%` : 
        undefined
    }
  } catch (error) {
    return { 
      isPotentialManipulation: true, 
      priceDeviation: 0,
      warning: 'Ошибка проверки цены' 
    }
  }
}

/**
 * Rate limiting для предотвращения спама
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  private maxRequests: number
  private timeWindow: number // в миллисекундах
  
  constructor(maxRequests: number = 10, timeWindow: number = 60000) {
    this.maxRequests = maxRequests
    this.timeWindow = timeWindow
  }
  
  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const userRequests = this.requests.get(identifier) || []
    
    // Удаляем старые запросы
    const validRequests = userRequests.filter(time => now - time < this.timeWindow)
    
    if (validRequests.length >= this.maxRequests) {
      return false
    }
    
    validRequests.push(now)
    this.requests.set(identifier, validRequests)
    return true
  }
  
  getRemainingRequests(identifier: string): number {
    const now = Date.now()
    const userRequests = this.requests.get(identifier) || []
    const validRequests = userRequests.filter(time => now - time < this.timeWindow)
    return Math.max(0, this.maxRequests - validRequests.length)
  }
}

// Глобальный rate limiter для свапов
export const swapRateLimiter = new RateLimiter(5, 60000) // 5 свапов в минуту

/**
 * Логирование подозрительной активности
 */
export async function logSuspiciousActivity(
  type: 'HIGH_SLIPPAGE' | 'LARGE_AMOUNT' | 'RAPID_TRANSACTIONS' | 'PRICE_MANIPULATION',
  details: {
    userAddress: string
    amount?: string
    slippage?: number
    timestamp: number
    additionalInfo?: any
  }
) {
  try {
    // В продакшене отправлять на сервер мониторинга
    console.warn(`🚨 Подозрительная активность: ${type}`, details)
    
    // Можно интегрироваться с Sentry, Telegram, или другими системами уведомлений
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      // Sentry.captureMessage(`Suspicious activity: ${type}`, 'warning', { extra: details })
    }
    
    // Сохраняем локально для анализа
    const logEntry = {
      type,
      ...details,
      id: generateSecureNonce()
    }
    
    const existingLogs = JSON.parse(localStorage.getItem('securityLogs') || '[]')
    existingLogs.unshift(logEntry)
    localStorage.setItem('securityLogs', JSON.stringify(existingLogs.slice(0, 100))) // Храним последние 100
    
  } catch (error) {
    console.error('Ошибка логирования подозрительной активности:', error)
  }
}
