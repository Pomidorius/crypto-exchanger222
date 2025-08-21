import { NextRequest, NextResponse } from 'next/server'

// Адреса контрактов на Sepolia (публичные тестовые токены)
const TOKENS = {
  USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
  USDT: '0x509Ee0d083DdF8AC028f2a56731412edD63223B9',
  ETH: '0x0000000000000000000000000000000000000000' // Native ETH
}

export async function POST(request: NextRequest) {
  try {
    const { address, token } = await request.json()

    // Простая проверка адреса
    if (!address || typeof address !== 'string' || !address.startsWith('0x') || address.length !== 42) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 })
    }

    if (!token || !TOKENS[token as keyof typeof TOKENS]) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }

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
      message: `✅ Демо: ${amount} ${tokenDisplay} "получены" (симуляция)`
    })

  } catch (error: unknown) {
    console.error('Mint error:', error)
    return NextResponse.json({
      error: 'Failed to mint tokens',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
