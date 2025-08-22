import { NextRequest, NextResponse } from 'next/server'

// Адреса контрактов на Sepolia (наши новые MockERC20 токены)
const TOKENS = {
  USDC: '0x82532e843530D8734F5Cf84eb833fab19394dfd2',
  USDT: '0xFA195D6c7c0Ed19E913E30e6F019E0B13cD1e77d',
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
