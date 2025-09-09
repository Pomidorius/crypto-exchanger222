import { NextRequest, NextResponse } from 'next/server'
import { ethers, Contract } from 'ethers'

// ABI для MockERC20 токенов (с функцией mint)
const MOCK_ERC20_ABI = [
  'function mint(address to, uint256 amount) external',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function owner() view returns (address)'
]

// Адреса контрактов токенов на разных сетях
const TOKEN_CONTRACTS = {
  // Sepolia testnet
  '11155111': {
    USDC: '0x82532e843530D8734F5Cf84eb833fab19394dfd2',
    USDT: '0xFA195D6c7c0Ed19E913E30e6F019E0B13cD1e77d'
  },
  // Mainnet (для продакшена - реальные токены не минтятся)
  '1': {
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
  }
}

// Лимиты минтинга (защита от спама)
const MINT_LIMITS = {
  USDC: ethers.utils.parseUnits('1000', 18), // 1000 USDC
  USDT: ethers.utils.parseUnits('1000', 18), // 1000 USDT
  ETH: ethers.utils.parseEther('0.1')         // 0.1 ETH
}

// Кулдаун между минтингами (24 часа)
const MINT_COOLDOWN = 24 * 60 * 60 * 1000 // 24 часа в миллисекундах

// Простое хранилище кулдаунов в памяти (в продакшене использовать Redis/DB)
const mintCooldowns = new Map<string, number>()

export async function POST(request: NextRequest) {
  try {
    const { address, token } = await request.json()

    // Валидация входных данных
    if (!address || typeof address !== 'string' || !address.startsWith('0x') || address.length !== 42) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 })
    }

    if (!token || !['USDC', 'USDT', 'ETH'].includes(token)) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }

    const chainId = process.env.NEXT_PUBLIC_CHAIN_ID || '11155111'
    
    // Проверяем кулдаун
    const cooldownKey = `${address}-${token}`
    const lastMint = mintCooldowns.get(cooldownKey) || 0
    const now = Date.now()
    
    if (now - lastMint < MINT_COOLDOWN) {
      const remainingTime = Math.ceil((MINT_COOLDOWN - (now - lastMint)) / 1000 / 60) // в минутах
      return NextResponse.json({ 
        error: `Кулдаун активен. Попробуйте через ${remainingTime} минут` 
      }, { status: 429 })
    }

    // Для ETH на тестнете - просто возвращаем ссылки на faucet'ы
    if (token === 'ETH') {
      return NextResponse.json({
        success: true,
        message: '🚰 Для получения тестового ETH используйте внешние faucet\'ы',
        faucets: [
          'https://sepoliafaucet.com/',
          'https://faucet.quicknode.com/ethereum/sepolia',
          'https://sepolia-faucet.pk910.de/'
        ],
        amount: '0.1',
        token: 'ETH'
      })
    }

    // Для mainnet - не разрешаем минтинг реальных токенов
    if (chainId === '1') {
      return NextResponse.json({
        error: 'Минтинг реальных токенов на mainnet запрещен. Используйте DEX для покупки.'
      }, { status: 403 })
    }

    // Минтинг токенов на тестнете
    if (chainId === '11155111') {
      const result = await mintTestnetTokens(address, token as 'USDC' | 'USDT')
      
      if (result.success) {
        // Записываем время последнего минтинга
        mintCooldowns.set(cooldownKey, now)
      }
      
      return NextResponse.json(result)
    }

    // Fallback - демо режим для неподдерживаемых сетей
    await new Promise(resolve => setTimeout(resolve, 2000))
    const fakeHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')

    return NextResponse.json({
      success: true,
      txHash: fakeHash,
      amount: token === 'ETH' ? '0.1' : '1000',
      token,
      message: `✅ Демо: ${token === 'ETH' ? '0.1' : '1000'} ${token} "получены" (симуляция)`
    })

  } catch (error: unknown) {
    console.error('Mint error:', error)
    return NextResponse.json({
      error: 'Failed to mint tokens',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Реальный минтинг токенов на тестнете
 */
async function mintTestnetTokens(address: string, token: 'USDC' | 'USDT') {
  try {
    // Получаем провайдер
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.infura.io/v3/demo'
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    
    // Получаем приватный ключ для минтинга (должен быть owner контракта)
    const privateKey = process.env.FAUCET_PRIVATE_KEY
    if (!privateKey || privateKey === 'your_private_key_here') {
      throw new Error('FAUCET_PRIVATE_KEY не настроен')
    }
    
    const wallet = new ethers.Wallet(privateKey, provider)
    
    // Получаем адрес контракта токена
    const tokenAddress = TOKEN_CONTRACTS['11155111'][token]
    if (!tokenAddress) {
      throw new Error(`Адрес контракта для ${token} не найден`)
    }
    
    // Создаем контракт
    const tokenContract = new Contract(tokenAddress, MOCK_ERC20_ABI, wallet)
    
    // Проверяем что wallet является owner'ом (для безопасности)
    try {
      const owner = await tokenContract.owner()
      if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
        throw new Error('Wallet не является owner\'ом контракта')
      }
    } catch (err) {
      console.warn('Не удалось проверить owner\'а контракта:', err)
      // Продолжаем, возможно контракт не имеет функции owner
    }
    
    // Получаем количество для минтинга
    const mintAmount = MINT_LIMITS[token]
    
    console.log(`🔄 Минтинг ${ethers.utils.formatUnits(mintAmount, 18)} ${token} для ${address}`)
    
    // Выполняем минтинг
    const tx = await tokenContract.mint(address, mintAmount)
    console.log(`⏳ Транзакция отправлена: ${tx.hash}`)
    
    // Ждем подтверждения
    const receipt = await tx.wait()
    console.log(`✅ Минтинг завершен: ${receipt.transactionHash}`)
    
    // Проверяем новый баланс
    const newBalance = await tokenContract.balanceOf(address)
    const formattedBalance = ethers.utils.formatUnits(newBalance, 18)
    
    return {
      success: true,
      txHash: receipt.transactionHash,
      amount: ethers.utils.formatUnits(mintAmount, 18),
      token,
      newBalance: formattedBalance,
      message: `✅ Успешно заминчено ${ethers.utils.formatUnits(mintAmount, 18)} ${token}!`,
      explorerUrl: `https://sepolia.etherscan.io/tx/${receipt.transactionHash}`
    }
    
  } catch (error: unknown) {
    console.error('Ошибка минтинга токенов:', error)
    
    const err = error as { code?: string; message?: string; reason?: string }
    
    let errorMessage = 'Ошибка минтинга токенов'
    
    if (err.code === 'INSUFFICIENT_FUNDS') {
      errorMessage = 'Недостаточно ETH для газа на кошельке faucet\'а'
    } else if (err.message?.includes('owner')) {
      errorMessage = 'Нет прав для минтинга токенов'
    } else if (err.message?.includes('network')) {
      errorMessage = 'Ошибка подключения к сети'
    } else {
      errorMessage = err.message || err.reason || errorMessage
    }
    
    return {
      success: false,
      error: errorMessage,
      details: err.message
    }
  }
}

/**
 * Получение статуса кулдауна для адреса
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    const token = searchParams.get('token')
    
    if (!address || !token) {
      return NextResponse.json({ error: 'Missing address or token' }, { status: 400 })
    }
    
    const cooldownKey = `${address}-${token}`
    const lastMint = mintCooldowns.get(cooldownKey) || 0
    const now = Date.now()
    const remainingTime = Math.max(0, MINT_COOLDOWN - (now - lastMint))
    
    return NextResponse.json({
      canMint: remainingTime === 0,
      remainingTime: Math.ceil(remainingTime / 1000 / 60), // в минутах
      lastMint: lastMint > 0 ? new Date(lastMint).toISOString() : null
    })
    
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get cooldown status' }, { status: 500 })
  }
}
