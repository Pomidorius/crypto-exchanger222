// src/app/utils/swap-real.ts
import { providers, Contract, BigNumber } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import { PROXY_SWAP_ADDRESS, TokenMap } from './constants'
import { getRealQuote } from './uniswap-real'

// ABI для нового RealProxySwap контракта
const REAL_PROXY_SWAP_ABI = [
  // ETH -> Token
  'function swapExactETHForTokens(address tokenOut, uint256 amountOutMinimum, uint24 poolFee, uint256 deadline) external payable returns (uint256)',
  // Token -> ETH  
  'function swapExactTokensForETH(address tokenIn, uint256 amountIn, uint256 amountOutMinimum, uint24 poolFee, uint256 deadline) external returns (uint256)',
  // Token -> Token
  'function swapExactInputSingle(address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOutMinimum, uint24 poolFee, uint256 deadline) external returns (uint256)',
  // Котировки
  'function getQuote(address tokenIn, address tokenOut, uint256 amountIn, uint24 poolFee) external returns (uint256)',
  // Utility
  'function supportedTokens(address) external view returns (bool)',
  'function getBalance(address) external view returns (uint256)',
  'function getProtocolFees(address) external view returns (uint256)'
]

// Минимальный ABI ERC20 для allowance/approve
const ERC20_ABI = [
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)'
]

// Fee tiers для разных пар токенов
const POOL_FEES = {
  // Стейблкоины - низкая комиссия
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
  // Default
  'DEFAULT': 3000
} as const;

export interface RealSwapParams {
  fromToken: string
  toToken: string
  amount: string
  slippage: number
  userAddress: string
}

/**
 * Выполнение реального свапа через Uniswap V3
 */
export async function executeRealSwap(params: RealSwapParams): Promise<string> {
  const { fromToken, toToken, amount, slippage, userAddress } = params

  if (!window.ethereum) {
    throw new Error('MetaMask не найден')
  }

  const provider = new providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()

  // Проверяем что мы подключены к правильному адресу
  const connectedAddress = await signer.getAddress()
  if (connectedAddress.toLowerCase() !== userAddress.toLowerCase()) {
    throw new Error('Адрес кошелька не совпадает')
  }

  // Получаем информацию о токенах
  const fromTokenInfo = TokenMap[fromToken]
  const toTokenInfo = TokenMap[toToken]

  if (!fromTokenInfo || !toTokenInfo) {
    throw new Error('Неподдерживаемый токен')
  }

  // Конвертируем сумму
  const amountIn = parseUnits(amount, fromTokenInfo.decimals)

  try {
    // Получаем котировку для расчета минимальной выходной суммы
    console.log('🔄 Получение котировки для реального свапа...')
    const { quotedAmount } = await getRealQuote(fromToken, toToken, amount, slippage)
    const expectedOut = BigNumber.from(quotedAmount)
    
    // Рассчитываем минимальную сумму с учетом slippage
    const slippageBp = Math.floor(slippage * 100) // в базисных пунктах
    const minAmountOut = expectedOut.mul(10000 - slippageBp).div(10000)

    // Определяем fee tier для пары
    const feeKey = `${fromToken}-${toToken}`
    const poolFee = POOL_FEES[feeKey as keyof typeof POOL_FEES] || POOL_FEES.DEFAULT

    // Deadline через 20 минут
    const deadline = Math.floor(Date.now() / 1000) + 1200

    console.log('🔄 Параметры реального свапа:', {
      fromToken,
      toToken,
      amountIn: amountIn.toString(),
      minAmountOut: minAmountOut.toString(),
      poolFee,
      deadline,
      slippage: `${slippage}%`
    })

    // Создаем контракт
    const swapContract = new Contract(PROXY_SWAP_ADDRESS, REAL_PROXY_SWAP_ABI, signer)

    // Проверяем поддержку токенов
    if (fromToken !== 'ETH') {
      const isSupported = await swapContract.supportedTokens(fromTokenInfo.address)
      if (!isSupported) {
        throw new Error(`Токен ${fromToken} не поддерживается контрактом`)
      }
    }

    if (toToken !== 'ETH') {
      const isSupported = await swapContract.supportedTokens(toTokenInfo.address)
      if (!isSupported) {
        throw new Error(`Токен ${toToken} не поддерживается контрактом`)
      }
    }

    let tx

    if (fromToken === 'ETH') {
      // ETH -> Token
      console.log('🔄 Выполняем ETH -> Token свап')
      tx = await swapContract.swapExactETHForTokens(
        toTokenInfo.address,
        minAmountOut,
        poolFee,
        deadline,
        { value: amountIn }
      )
    } else if (toToken === 'ETH') {
      // Token -> ETH
      console.log('🔄 Выполняем Token -> ETH свап')
      
      // Сначала проверяем и даем разрешение
      const tokenContract = new Contract(fromTokenInfo.address, ERC20_ABI, signer)
      const allowance = await tokenContract.allowance(userAddress, PROXY_SWAP_ADDRESS)
      
      if (allowance.lt(amountIn)) {
        console.log('🔄 Даем разрешение токена...')
        const approveTx = await tokenContract.approve(PROXY_SWAP_ADDRESS, amountIn)
        await approveTx.wait()
        console.log('✅ Разрешение получено')
      }

      tx = await swapContract.swapExactTokensForETH(
        fromTokenInfo.address,
        amountIn,
        minAmountOut,
        poolFee,
        deadline
      )
    } else {
      // Token -> Token
      console.log('🔄 Выполняем Token -> Token свап')
      
      // Сначала проверяем и даем разрешение
      const tokenContract = new Contract(fromTokenInfo.address, ERC20_ABI, signer)
      const allowance = await tokenContract.allowance(userAddress, PROXY_SWAP_ADDRESS)
      
      if (allowance.lt(amountIn)) {
        console.log('🔄 Даем разрешение токена...')
        const approveTx = await tokenContract.approve(PROXY_SWAP_ADDRESS, amountIn)
        await approveTx.wait()
        console.log('✅ Разрешение получено')
      }

      tx = await swapContract.swapExactInputSingle(
        fromTokenInfo.address,
        toTokenInfo.address,
        amountIn,
        minAmountOut,
        poolFee,
        deadline
      )
    }

    console.log('🔄 Транзакция отправлена:', tx.hash)
    
    // Ждем подтверждения
    const receipt = await tx.wait()
    console.log('✅ Реальный свап выполнен:', receipt.transactionHash)

    return receipt.transactionHash

  } catch (error: unknown) {
    console.error('❌ Ошибка реального свапа:', error)
    
    const err = error as { code?: number | string; message?: string; reason?: string }
    
    if (err.code === 4001) {
      throw new Error('Пользователь отклонил транзакцию')
    } else if (err.code === 'INSUFFICIENT_FUNDS') {
      throw new Error('Недостаточно средств для газа')
    } else if (err.message?.includes('slippage') || err.reason?.includes('slippage')) {
      throw new Error('Превышено допустимое проскальзывание')
    } else if (err.message?.includes('EXPIRED')) {
      throw new Error('Транзакция истекла, попробуйте снова')
    } else if (err.message?.includes('supported')) {
      throw new Error('Токен не поддерживается')
    } else {
      throw new Error(err.message || err.reason || 'Ошибка при выполнении обмена')
    }
  }
}

/**
 * Проверка поддержки токена контрактом
 */
export async function checkTokenSupport(tokenSymbol: string): Promise<boolean> {
  try {
    if (tokenSymbol === 'ETH') return true // ETH всегда поддерживается
    
    const provider = new providers.Web3Provider(window.ethereum)
    const contract = new Contract(PROXY_SWAP_ADDRESS, REAL_PROXY_SWAP_ABI, provider)
    const tokenInfo = TokenMap[tokenSymbol]
    
    if (!tokenInfo) return false
    
    return await contract.supportedTokens(tokenInfo.address)
  } catch (error) {
    console.warn(`Ошибка проверки поддержки токена ${tokenSymbol}:`, error)
    return false
  }
}

/**
 * Получение баланса контракта
 */
export async function getContractBalance(tokenSymbol: string): Promise<string> {
  try {
    const provider = new providers.Web3Provider(window.ethereum)
    const contract = new Contract(PROXY_SWAP_ADDRESS, REAL_PROXY_SWAP_ABI, provider)
    const tokenInfo = TokenMap[tokenSymbol]
    
    const balance = await contract.getBalance(
      tokenSymbol === 'ETH' ? '0x0000000000000000000000000000000000000000' : tokenInfo.address
    )
    
    return balance.toString()
  } catch (error) {
    console.warn(`Ошибка получения баланса контракта для ${tokenSymbol}:`, error)
    return '0'
  }
}

/**
 * Получение накопленных комиссий
 */
export async function getProtocolFees(tokenSymbol: string): Promise<string> {
  try {
    const provider = new providers.Web3Provider(window.ethereum)
    const contract = new Contract(PROXY_SWAP_ADDRESS, REAL_PROXY_SWAP_ABI, provider)
    const tokenInfo = TokenMap[tokenSymbol]
    
    const fees = await contract.getProtocolFees(
      tokenSymbol === 'ETH' ? '0x0000000000000000000000000000000000000000' : tokenInfo.address
    )
    
    return fees.toString()
  } catch (error) {
    console.warn(`Ошибка получения комиссий для ${tokenSymbol}:`, error)
    return '0'
  }
}
