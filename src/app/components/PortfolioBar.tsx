'use client'

import { useState, useEffect } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { useLivePrices } from '../utils/live-prices'
import { TokenMap } from '../utils/constants'
import { ethers } from 'ethers'

interface TokenBalance {
  symbol: string
  balance: number
  usdValue: number
  change24h: number
  icon: string
  price: number
}

export function PortfolioBar() {
  const { address, isConnected } = useAccount()
  const { data: ethBalance } = useBalance({ address })
  const { prices, isLoading: pricesLoading, getPrice, getChange } = useLivePrices()
  const [mounted, setMounted] = useState(false)
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [totalValue, setTotalValue] = useState(0)
  const [totalChange24h, setTotalChange24h] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Получение балансов токенов
  useEffect(() => {
    if (!isConnected || !address || pricesLoading) return

    const fetchTokenBalances = async () => {
      setIsRefreshing(true)
      const balances: TokenBalance[] = []
      let totalVal = 0
      let totalChange = 0

      try {
        // ETH баланс
        if (ethBalance) {
          const ethAmount = parseFloat(ethBalance.formatted)
          const ethPrice = getPrice('ETH')
          const ethValue = ethAmount * ethPrice
          const ethChange = getChange('ETH')

          if (ethAmount > 0) {
            balances.push({
              symbol: 'ETH',
              balance: ethAmount,
              usdValue: ethValue,
              change24h: ethChange,
              price: ethPrice,
              icon: '⟠'
            })

            totalVal += ethValue
            totalChange += (ethValue * ethChange / 100)
          }
        }

        // ERC20 токены
        if (window.ethereum) {
          const provider = new ethers.providers.Web3Provider(window.ethereum)
          
          for (const [symbol, tokenInfo] of Object.entries(TokenMap)) {
            if (symbol === 'ETH') continue

            try {
              const tokenContract = new ethers.Contract(
                tokenInfo.address,
                ['function balanceOf(address) view returns (uint256)'],
                provider
              )

              const balance = await tokenContract.balanceOf(address)
              const tokenAmount = parseFloat(ethers.utils.formatUnits(balance, tokenInfo.decimals))
              
              if (tokenAmount > 0.0001) { // Показываем только значимые балансы
                const tokenPrice = getPrice(symbol)
                const tokenValue = tokenAmount * tokenPrice
                const tokenChange = getChange(symbol)

                balances.push({
                  symbol,
                  balance: tokenAmount,
                  usdValue: tokenValue,
                  change24h: tokenChange,
                  price: tokenPrice,
                  icon: getTokenIcon(symbol)
                })

                totalVal += tokenValue
                totalChange += (tokenValue * tokenChange / 100)
              }
            } catch (error) {
              console.warn(`Ошибка получения баланса ${symbol}:`, error)
            }
          }
        }

        // Сортируем по стоимости (убывание)
        balances.sort((a, b) => b.usdValue - a.usdValue)

        setTokenBalances(balances)
        setTotalValue(totalVal)
        setTotalChange24h(totalChange)

      } catch (error) {
        console.error('Ошибка получения балансов:', error)
      } finally {
        setIsRefreshing(false)
      }
    }

    fetchTokenBalances()
  }, [isConnected, address, ethBalance, prices, pricesLoading, getPrice, getChange])

  if (!mounted) {
    return (
      <div className="portfolio-bar">
        <div className="portfolio-content">
          <div className="portfolio-loading">
            <div className="loading-shimmer"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="portfolio-bar">
        <div className="portfolio-content">
          <div className="portfolio-message">
            <span className="icon">👛</span>
            <span>Подключите кошелёк для просмотра портфеля</span>
          </div>
        </div>
      </div>
    )
  }

  const totalChangePercent = totalValue > 0 ? (totalChange24h / totalValue) * 100 : 0
  const isPositive = totalChange24h >= 0

  const refreshBalances = () => {
    // Принудительное обновление балансов
    window.location.reload()
  }

  return (
    <div className={`portfolio-bar ${isExpanded ? 'expanded' : ''}`}>
      <div className="portfolio-content">
        {/* Основная информация */}
        <div className="portfolio-main" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="portfolio-section">
            <div className="portfolio-label">Общий баланс</div>
            <div className="portfolio-value">
              ${totalValue.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          
          <div className="portfolio-section">
            <div className="portfolio-label">24ч изменение</div>
            <div className={`portfolio-value ${isPositive ? 'positive' : 'negative'}`}>
              {isPositive ? '+' : ''}${Math.abs(totalChange24h).toFixed(2)} 
              <span className="change-percent">
                ({isPositive ? '+' : ''}{totalChangePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
          
          <div className="portfolio-section">
            <div className="portfolio-label">Активы</div>
            <div className="portfolio-value">
              {tokenBalances.length}
            </div>
          </div>

          <div className="portfolio-section">
            <div className="portfolio-label">Топ актив</div>
            <div className="portfolio-value">
              {tokenBalances.length > 0 ? tokenBalances[0].symbol : 'N/A'}
            </div>
          </div>

          <div className="portfolio-actions">
            <button 
              className="refresh-btn"
              onClick={(e) => {
                e.stopPropagation()
                refreshBalances()
              }}
              disabled={isRefreshing}
              title="Обновить балансы"
            >
              {isRefreshing ? '🔄' : '↻'}
            </button>
            <div className="expand-button">
              {isExpanded ? '▲' : '▼'}
            </div>
          </div>
        </div>

        {/* Детализация (показывается при развертывании) */}
        {isExpanded && (
          <div className="portfolio-details">
            <div className="portfolio-header">
              <h3>Детализация портфеля</h3>
              <div className="portfolio-stats">
                <span>Обновлено: {new Date().toLocaleTimeString('ru-RU')}</span>
              </div>
            </div>

            <div className="portfolio-tokens">
              {tokenBalances.map(token => (
                <div key={token.symbol} className="token-row">
                  <div className="token-info">
                    <span className="token-icon">{token.icon}</span>
                    <div className="token-details">
                      <div className="token-symbol">{token.symbol}</div>
                      <div className="token-balance">
                        {token.balance.toFixed(token.symbol === 'ETH' ? 4 : 2)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="token-price">
                    <div className="token-price-value">
                      ${token.price.toLocaleString('ru-RU', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: token.price < 1 ? 4 : 2 
                      })}
                    </div>
                    <div className={`token-change ${token.change24h >= 0 ? 'positive' : 'negative'}`}>
                      {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                    </div>
                  </div>

                  <div className="token-value">
                    <div className="token-usd">
                      ${token.usdValue.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="token-percent">
                      {totalValue > 0 ? ((token.usdValue / totalValue) * 100).toFixed(1) : '0.0'}%
                    </div>
                  </div>

                  <div className="token-actions">
                    <button 
                      className="action-btn buy"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Устанавливаем токен для покупки в форме
                        const swapForm = document.querySelector('.swap-form')
                        if (swapForm) {
                          swapForm.scrollIntoView({ behavior: 'smooth' })
                          // Можно добавить логику установки токена в форму
                        }
                      }}
                      title={`Купить ${token.symbol}`}
                    >
                      Купить
                    </button>
                    <button 
                      className="action-btn sell"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Устанавливаем токен для продажи в форме
                        const swapForm = document.querySelector('.swap-form')
                        if (swapForm) {
                          swapForm.scrollIntoView({ behavior: 'smooth' })
                          // Можно добавить логику установки токена в форму
                        }
                      }}
                      title={`Продать ${token.symbol}`}
                    >
                      Продать
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {tokenBalances.length === 0 && !pricesLoading && (
              <div className="no-tokens">
                <div className="no-tokens-icon">💎</div>
                <div className="no-tokens-text">
                  <div>Токены не найдены</div>
                  <div className="no-tokens-hint">
                    Получите токены для начала торговли или проверьте подключение к сети
                  </div>
                </div>
                <div className="no-tokens-actions">
                  <button 
                    className="get-tokens-btn"
                    onClick={() => {
                      document.querySelector('.swap-card')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                  >
                    Перейти к обмену
                  </button>
                  <button 
                    className="refresh-tokens-btn"
                    onClick={refreshBalances}
                  >
                    Обновить
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .portfolio-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%);
          backdrop-filter: blur(10px);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 100;
          transition: all 0.3s ease;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
        }

        .portfolio-bar.expanded {
          max-height: 500px;
          overflow-y: auto;
        }

        .portfolio-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .portfolio-main {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr auto;
          gap: 20px;
          align-items: center;
          padding: 15px 0;
          cursor: pointer;
          transition: background 0.2s;
          border-radius: 8px;
        }

        .portfolio-main:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .portfolio-section {
          text-align: center;
        }

        .portfolio-label {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 4px;
          text-transform: uppercase;
          font-weight: 500;
          letter-spacing: 0.5px;
        }

        .portfolio-value {
          font-size: 16px;
          font-weight: 600;
          color: white;
        }

        .portfolio-value.positive {
          color: #10b981;
        }

        .portfolio-value.negative {
          color: #ef4444;
        }

        .change-percent {
          font-size: 14px;
          margin-left: 4px;
        }

        .portfolio-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .refresh-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: rgba(255, 255, 255, 0.7);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .refresh-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .expand-button {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          transition: transform 0.2s;
        }

        .portfolio-details {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding: 20px 0;
        }

        .portfolio-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .portfolio-header h3 {
          color: white;
          font-size: 18px;
          margin: 0;
        }

        .portfolio-stats {
          color: rgba(255, 255, 255, 0.6);
          font-size: 12px;
        }

        .portfolio-tokens {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .token-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr auto;
          gap: 15px;
          align-items: center;
          padding: 15px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          transition: all 0.2s;
          border: 1px solid transparent;
        }

        .token-row:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }

        .token-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .token-icon {
          font-size: 24px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .token-symbol {
          font-weight: 700;
          color: white;
          font-size: 16px;
        }

        .token-balance {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.6);
          font-family: 'Courier New', monospace;
        }

        .token-price {
          text-align: center;
        }

        .token-price-value {
          font-weight: 600;
          color: white;
          font-size: 14px;
          margin-bottom: 2px;
        }

        .token-value {
          text-align: center;
        }

        .token-usd {
          font-weight: 600;
          color: white;
          font-size: 15px;
          margin-bottom: 2px;
        }

        .token-percent {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }

        .token-change {
          font-size: 12px;
          font-weight: 500;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .token-change.positive {
          color: #10b981;
          background: rgba(16, 185, 129, 0.1);
        }

        .token-change.negative {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .token-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .action-btn.buy {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
        }

        .action-btn.buy:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(16, 185, 129, 0.4);
        }

        .action-btn.sell {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
        }

        .action-btn.sell:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(239, 68, 68, 0.4);
        }

        .no-tokens {
          text-align: center;
          padding: 40px 20px;
          color: rgba(255, 255, 255, 0.8);
        }

        .no-tokens-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }

        .no-tokens-text {
          margin-bottom: 25px;
        }

        .no-tokens-text div:first-child {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .no-tokens-hint {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.4;
        }

        .no-tokens-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .get-tokens-btn, .refresh-tokens-btn {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
        }

        .get-tokens-btn:hover, .refresh-tokens-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
        }

        .refresh-tokens-btn {
          background: linear-gradient(135deg, #6b7280, #4b5563);
          box-shadow: 0 2px 4px rgba(107, 114, 128, 0.3);
        }

        .refresh-tokens-btn:hover {
          box-shadow: 0 4px 8px rgba(107, 114, 128, 0.4);
        }

        .portfolio-message {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          padding: 20px;
          color: rgba(255, 255, 255, 0.8);
        }

        .portfolio-message .icon {
          font-size: 24px;
        }

        .portfolio-loading {
          padding: 20px;
        }

        .loading-shimmer {
          height: 40px;
          background: linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        @media (max-width: 768px) {
          .portfolio-main {
            grid-template-columns: 1fr 1fr auto;
            gap: 10px;
          }

          .portfolio-section:nth-child(3),
          .portfolio-section:nth-child(4) {
            display: none;
          }

          .token-row {
            grid-template-columns: 1fr auto;
            gap: 10px;
          }

          .token-price, .token-value {
            display: none;
          }

          .token-actions {
            flex-direction: column;
            gap: 4px;
          }

          .action-btn {
            font-size: 10px;
            padding: 6px 8px;
          }
        }
      `}</style>
    </div>
  )
}

function getTokenIcon(symbol: string): string {
  const icons: Record<string, string> = {
    'ETH': '⟠',
    'WETH': '🔄',
    'USDC': '💵',
    'USDT': '💲',
    'DAI': '🪙',
    'WBTC': '₿'
  }
  return icons[symbol] || '🪙'
}