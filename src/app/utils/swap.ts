// src/app/utils/swap.ts
import { providers, Contract, BigNumber } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import { PROXY_SWAP_ADDRESS, ProxySwapAbi, TokenMap, isContractDeployed } from './constants'
import { quoteExactInput } from './uniswap'

// Минимальный ABI ERC20 для allowance/approve
const ERC20_ABI = [
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)'
]

export interface SwapParams {
  fromToken: string
  toToken: string
  amount: string
  slippage: number
  userAddress: string
}

export async function executeSwap(params: SwapParams): Promise<string> {
  const { fromToken, toToken, amount, slippage, userAddress } = params

  // Проверяем что контракт задеплоен
  if (!isContractDeployed()) {
    throw new Error('Контракт не задеплоен. Обмен временно недоступен.')
  }

  if (!window.ethereum) {
    throw new Error('MetaMask не найден')
  }

  const provider = new providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()

  // Получаем информацию о токенах
  const fromTokenInfo = TokenMap[fromToken]
  const toTokenInfo = TokenMap[toToken]

  if (!fromTokenInfo || !toTokenInfo) {
    throw new Error('Неподдерживаемый токен')
  }

  // Конвертируем сумму в wei
  const amountIn = parseUnits(amount, fromTokenInfo.decimals)

  try {
    // Если это не ETH, нужно проверить и дать разрешение (approve)
    if (fromToken !== 'ETH') {
      const tokenContract = new Contract(fromTokenInfo.address, ERC20_ABI, signer)
      
      // Проверяем текущее разрешение
      const allowance = await tokenContract.allowance(userAddress, PROXY_SWAP_ADDRESS)
      
      if (allowance.lt(amountIn)) {
        console.log('Требуется разрешение токена...')
        const approveTx = await tokenContract.approve(PROXY_SWAP_ADDRESS, amountIn)
        await approveTx.wait()
        console.log('Разрешение получено')
      }
    }

    // Создаем контракт свапа
    const swapContract = new Contract(PROXY_SWAP_ADDRESS, ProxySwapAbi, signer)

    // Получаем котировку для расчета минимальной выходной суммы
    const { quotedAmount } = await quoteExactInput(fromToken, toToken, amount, slippage)
    const expectedOut = BigNumber.from(quotedAmount)
    
    // Рассчитываем минимальную сумму получения с учетом slippage
    // Применяем slippage к ожидаемой выходной сумме
    const slippageBp = Math.floor(slippage * 100) // slippage в базисных пунктах (0.5% = 50bp)
    const minAmountOut = expectedOut.mul(10000 - slippageBp).div(10000)

    console.log('Выполняем свап:', {
      fromToken,
      toToken,
      amountIn: amountIn.toString(),
      expectedOut: expectedOut.toString(),
      minAmountOut: minAmountOut.toString(),
      slippage: `${slippage}%`
    })

    // Выполняем свап
    let tx
    if (fromToken === 'ETH') {
      // ETH -> Token
      tx = await swapContract.swapExactETHForTokens(
        toTokenInfo.address,
        minAmountOut,
        { value: amountIn }
      )
    } else if (toToken === 'ETH') {
      // Token -> ETH
      tx = await swapContract.swapExactTokensForETH(
        fromTokenInfo.address,
        amountIn,
        minAmountOut
      )
    } else {
      // Token -> Token
      tx = await swapContract.swapExactInputSingle(
        fromTokenInfo.address,
        toTokenInfo.address,
        amountIn,
        minAmountOut
      )
    }

    console.log('Транзакция отправлена:', tx.hash)
    
    // Ждем подтверждения
    const receipt = await tx.wait()
    console.log('Транзакция подтверждена:', receipt.transactionHash)

    return receipt.transactionHash
  } catch (error: unknown) {
    console.error('Ошибка свапа:', error)
    
    const err = error as { code?: number | string; message?: string }
    if (err.code === 4001) {
      throw new Error('Пользователь отклонил транзакцию')
    } else if (err.code === 'INSUFFICIENT_FUNDS') {
      throw new Error('Недостаточно средств для газа')
    } else if (err.message?.includes('slippage')) {
      throw new Error('Превышено допустимое проскальзывание')
    } else {
      throw new Error(err.message || 'Ошибка при выполнении обмена')
    }
  }
}

export async function checkTokenAllowance(
  tokenAddress: string, 
  userAddress: string, 
  spenderAddress: string
): Promise<BigNumber> {
  if (!window.ethereum) {
    throw new Error('MetaMask не найден')
  }

  const provider = new providers.Web3Provider(window.ethereum)
  const tokenContract = new Contract(tokenAddress, ERC20_ABI, provider)
  
  return await tokenContract.allowance(userAddress, spenderAddress)
}

export async function getTokenBalance(
  tokenAddress: string, 
  userAddress: string
): Promise<BigNumber> {
  if (!window.ethereum) {
    throw new Error('MetaMask не найден')
  }

  const provider = new providers.Web3Provider(window.ethereum)
  
  if (tokenAddress === TokenMap.ETH.address) {
    return await provider.getBalance(userAddress)
  } else {
    const tokenContract = new Contract(tokenAddress, ERC20_ABI, provider)
    return await tokenContract.balanceOf(userAddress)
  }
}
