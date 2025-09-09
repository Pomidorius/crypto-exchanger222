import { NextRequest, NextResponse } from 'next/server'

// Адреса контрактов на Sepolia (наши новые MockERC20 токены)
const TOKENS = {
  USDC: '0x82532e843530D8734F5Cf84eb833fab19394dfd2',
  USDT: '0xFA195D6c7c0Ed19E913E30e6F019E0B13cD1e77d',
  ETH: '0x0000000000000000000000000000000000000000' // Native ETH
}

/**
 * Главная функция минтинга - автоматически выбирает реальный или демо режим
 */
export async function POST(request: NextRequest) {
  try {
    const { address, token } = await request.json()

    // Валидация входных данных
    if (!address || typeof address !== 'string' || !address.startsWith('0x') || address.length !== 42) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 })
    }

    if (!token || !TOKENS[token as keyof typeof TOKENS]) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }

    // Определяем, использовать ли реальный минтинг
    const shouldUseReal = shouldUseRealMinting()
    
    if (shouldUseReal) {
      console.log('🚀 Выполняем РЕАЛЬНЫЙ минтинг токенов')
      
      // Перенаправляем на реальный API
      try {
        const realMintResponse = await fetch(`${request.nextUrl.origin}/api/mint-tokens-real`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ address, token }),
        })
        
        const result = await realMintResponse.json()
        return NextResponse.json(result, { status: realMintResponse.status })
        
      } catch (error) {
        console.error('Ошибка реального минтинга, используем fallback:', error)
        // Fallback на демо режим
      }
    }
    
    // Демо минтинг (оригинальная логика)
    console.log('🎭 Выполняем ДЕМО минтинг (симуляция)')
    return await executeDemoMinting(address, token)

  } catch (error: unknown) {
    console.error('Mint error:', error)
    return NextResponse.json({
      error: 'Failed to mint tokens',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Определяет, следует ли использовать реальный минтинг
 */
function shouldUseRealMinting(): boolean {
  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID || '1'
  
  // Для localhost всегда используем демо
  if (chainId === '31337') {
    return false
  }
  
  // Для sepolia используем реальный минтинг (если настроен FAUCET_PRIVATE_KEY)
  if (chainId === '11155111') {
    const faucetKey = process.env.FAUCET_PRIVATE_KEY
    return !!(faucetKey && faucetKey !== 'your_private_key_here')
  }
  
  // Для mainnet не используем минтинг
  return false
}

/**
 * Демо минтинг (оригинальная логика)
 */
async function executeDemoMinting(address: string, token: string) {
  // Симулируем задержку минтинга
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Генерируем фейковый hash транзакции
  const fakeHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')

  // Разные количества для разных токенов
  const amounts = {
    USDC: '1000',
    USDT: '1000', 
    ETH: '0.1'
  }
  
  const amount = amounts[token as keyof typeof amounts] || '0'
  const tokenDisplay = token === 'ETH' ? 'SepoliaETH' : token

  return NextResponse.json({
    success: true,
    txHash: fakeHash,
    amount,
    token,
    message: `✅ Демо: ${amount} ${tokenDisplay} "получены" (симуляция)`,
    isDemo: true
  })
}

/**
 * GET endpoint для проверки статуса кулдауна
 */
export async function GET(request: NextRequest) {
  const shouldUseReal = shouldUseRealMinting()
  
  if (shouldUseReal) {
    // Перенаправляем на реальный API
    try {
      const realResponse = await fetch(`${request.nextUrl.origin}/api/mint-tokens-real${request.nextUrl.search}`)
      const result = await realResponse.json()
      return NextResponse.json(result, { status: realResponse.status })
    } catch (error) {
      console.error('Ошибка получения статуса кулдауна:', error)
    }
  }
  
  // Для демо режима - всегда можно минтить
  return NextResponse.json({
    canMint: true,
    remainingTime: 0,
    lastMint: null,
    isDemo: true
  })
}
