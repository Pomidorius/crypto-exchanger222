// src/app/components/PortfolioBar.tsx
'use client'

import { useAccount, useBalance } from 'wagmi'
import { useState, useEffect } from 'react'
import { TokenMap } from '../utils/constants'

export function PortfolioBar() {
  const { address, isConnected } = useAccount()
  const [mounted, setMounted] = useState(false)
  const [totalValue, setTotalValue] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Получаем балансы основных токенов
  const { data: ethBalance } = useBalance({ address: mounted ? address : undefined })
  const { data: usdcBalance } = useBalance({ address: mounted ? address : undefined, token: TokenMap.USDC.address as `0x${string}` })
  const { data: usdtBalance } = useBalance({ address: mounted ? address : undefined, token: TokenMap.USDT.address as `0x${string}` })

  const portfolioTokens = [
    { symbol: 'ETH', balance: ethBalance, price: 3500, icon: '⟠', color: 'token-eth' },
    { symbol: 'USDC', balance: usdcBalance, price: 1, icon: '💵', color: 'token-usdc' },
    { symbol: 'USDT', balance: usdtBalance, price: 1, icon: '💲', color: 'token-usdt' },
  ]

  useEffect(() => {
    if (mounted && isConnected) {
      let total = 0
      const tokens = [
        { balance: ethBalance, price: 3500 },
        { balance: usdcBalance, price: 1 },
        { balance: usdtBalance, price: 1 },
      ]
      
      tokens.forEach((token) => {
        if (token.balance) {
          const amount = parseFloat(token.balance.formatted)
          total += amount * token.price
        }
      })
      setTotalValue(total)
    }
  }, [mounted, isConnected, ethBalance, usdcBalance, usdtBalance])

  if (!mounted) {
    return (
      <div className="portfolio-bar">
        <div className="portfolio-content">
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', animation: 'pulse 2s infinite'}}>
            <div style={{height: '1rem', background: '#334155', borderRadius: '0.25rem', width: '8rem'}}></div>
            <div style={{height: '1rem', background: '#334155', borderRadius: '0.25rem', width: '6rem'}}></div>
          </div>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="portfolio-bar">
        <div className="portfolio-content">
          <div style={{color: '#64748b', fontSize: '0.875rem'}}>
            📊 Подключите кошелёк для просмотра портфеля
          </div>
          <div style={{color: '#64748b', fontSize: '0.875rem'}}>
            Общая стоимость: $0.00
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="portfolio-bar">
      <div className="portfolio-content">
        {/* Токены портфеля */}
        <div className="flex items-center gap-3">
          <span style={{color: '#64748b', fontSize: '0.875rem', fontWeight: '500'}}>Портфель:</span>
          {portfolioTokens.map((token) => {
            const amount = token.balance ? parseFloat(token.balance.formatted) : 0
            const value = amount * token.price
            
            if (amount === 0) return null

            return (
              <div key={token.symbol} className="flex items-center gap-3">
                <span style={{fontSize: '0.875rem'}} className={token.color}>{token.icon}</span>
                <span style={{color: '#f8fafc', fontSize: '0.875rem', fontWeight: '500'}}>
                  {amount.toFixed(4)} {token.symbol}
                </span>
                <span style={{color: '#64748b', fontSize: '0.75rem'}}>
                  (${value.toFixed(2)})
                </span>
              </div>
            )
          })}
        </div>

        {/* Общая стоимость */}
        <div className="flex items-center gap-3">
          <div style={{fontSize: '0.875rem'}}>
            <span style={{color: '#64748b'}}>Общая стоимость: </span>
            <span style={{color: '#f8fafc', fontWeight: '600'}}>
              ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div style={{fontSize: '0.75rem', color: '#10b981'}}>
            +2.45% за 24ч
          </div>
        </div>
      </div>
    </div>
  )
}
