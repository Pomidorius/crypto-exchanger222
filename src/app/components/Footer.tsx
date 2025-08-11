// src/app/components/Footer.tsx
'use client'

import { useState, useEffect } from 'react'

interface MarketData {
  symbol: string
  price: number
  change: number
  icon: string
  color: string
}

interface Transaction {
  id: string
  type: 'swap' | 'send' | 'receive'
  from: string
  to: string
  amount: string
  timestamp: string
  status: 'success' | 'pending' | 'failed'
}

export function Footer() {
  const [activeTab, setActiveTab] = useState<'market' | 'history'>('market')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const marketData: MarketData[] = [
    { symbol: 'ETH/USD', price: 3500.45, change: 2.34, icon: '⟠', color: 'market-eth' },
    { symbol: 'BTC/USD', price: 65432.10, change: -1.23, icon: '₿', color: 'market-btc' },
    { symbol: 'USDC/USD', price: 1.00, change: 0.01, icon: '💵', color: 'market-usdc' },
    { symbol: 'USDT/USD', price: 0.999, change: -0.02, icon: '💲', color: 'market-usdt' },
    { symbol: 'BNB/USD', price: 598.76, change: 3.45, icon: '🔸', color: 'market-bnb' },
    { symbol: 'ADA/USD', price: 0.487, change: 1.87, icon: '🔷', color: 'market-ada' },
  ]

  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'swap',
      from: '1.5 ETH',
      to: '5250 USDC',
      amount: '$5,250',
      timestamp: '2 мин назад',
      status: 'success'
    },
    {
      id: '2',
      type: 'swap',
      from: '100 USDT',
      to: '0.0285 ETH',
      amount: '$100',
      timestamp: '15 мин назад',
      status: 'success'
    },
    {
      id: '3',
      type: 'swap',
      from: '0.5 ETH',
      to: '1750 USDC',
      amount: '$1,750',
      timestamp: '1 час назад',
      status: 'pending'
    },
  ]

  if (!mounted) {
    return (
      <footer className="footer">
        <div className="footer-content">
          <div style={{animation: 'pulse 2s infinite'}}>
            <div style={{height: '1.5rem', background: '#334155', borderRadius: '0.25rem', marginBottom: '1rem'}}></div>
            <div style={{height: '5rem', background: '#334155', borderRadius: '0.25rem'}}></div>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Табы */}
        <div className="footer-tabs">
          <button
            onClick={() => setActiveTab('market')}
            className={`footer-tab ${activeTab === 'market' ? 'active' : ''}`}
          >
            📈 <span>Рынок</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`footer-tab ${activeTab === 'history' ? 'active' : ''}`}
          >
            📋 <span>История</span>
          </button>
        </div>

        {/* Контент */}
        {activeTab === 'market' ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            {marketData.map((token) => (
              <div
                key={token.symbol}
                style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  border: '1px solid var(--border-primary)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div className="flex items-center gap-3" style={{marginBottom: '0.5rem'}}>
                  <span style={{fontSize: '1.125rem'}} className={token.color}>{token.icon}</span>
                  <span style={{color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: '500'}}>{token.symbol}</span>
                </div>
                <div style={{color: 'var(--text-primary)', fontWeight: '600'}}>
                  ${token.price.toLocaleString()}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: token.change >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'
                }}>
                  {token.change >= 0 ? '+' : ''}{token.change.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{maxHeight: '8rem', overflowY: 'auto'}}>
            {transactions.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem 0',
                color: 'var(--text-muted)'
              }}>
                Нет транзакций
              </div>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'var(--bg-secondary)',
                      borderRadius: '0.5rem',
                      padding: '0.75rem',
                      border: '1px solid var(--border-primary)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div style={{
                        width: '0.5rem',
                        height: '0.5rem',
                        borderRadius: '50%',
                        background: tx.status === 'success' ? 'var(--accent-green)' :
                                   tx.status === 'pending' ? '#eab308' : 'var(--accent-red)'
                      }}></div>
                      <div>
                        <div style={{color: 'var(--text-primary)', fontSize: '0.875rem'}}>
                          {tx.from} → {tx.to}
                        </div>
                        <div style={{color: 'var(--text-muted)', fontSize: '0.75rem'}}>{tx.timestamp}</div>
                      </div>
                    </div>
                    <div style={{textAlign: 'right'}}>
                      <div style={{color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: '500'}}>{tx.amount}</div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: tx.status === 'success' ? 'var(--accent-green)' :
                               tx.status === 'pending' ? '#eab308' : 'var(--accent-red)'
                      }}>
                        {tx.status === 'success' ? 'Завершен' :
                         tx.status === 'pending' ? 'Ожидание' : 'Ошибка'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </footer>
  )
}
