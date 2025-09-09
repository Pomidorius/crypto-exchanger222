'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useLivePrices } from '../utils/live-prices'
import { useMonitoring } from '../utils/monitoring'

interface MarketData {
  symbol: string
  price: number
  change: number
  volume: number
  icon: string
  color: string
}

export function Footer() {
  const [activeTab, setActiveTab] = useState<'market' | 'history'>('market')
  const [mounted, setMounted] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30) // секунды
  
  const { address, isConnected } = useAccount()
  const { prices, isLoading: pricesLoading, getPrice, getChange, getVolume } = useLivePrices()
  const { getLogs, getStats } = useMonitoring()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Получаем живые транзакции из мониторинга
  const transactions = getLogs({ 
    userAddress: isConnected ? address : undefined, 
    limit: 10 
  })

  const stats = getStats('day')

  // Формируем данные рынка из живых цен
  const marketData: MarketData[] = Object.entries(prices).map(([symbol, data]) => ({
    symbol: `${symbol}/USD`,
    price: data.price,
    change: data.change24h,
    volume: data.volume24h,
    icon: getTokenIcon(symbol),
    color: `market-${symbol.toLowerCase()}`
  })).sort((a, b) => b.volume - a.volume) // Сортируем по объему торгов

  // Автообновление
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      // Данные уже обновляются через useLivePrices
      console.log('Автообновление данных...')
    }, refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])

  if (!mounted) {
    return (
      <footer className="footer">
        <div className="footer-content">
          <div className="loading-container">
            <div className="loading-shimmer"></div>
          </div>
        </div>
      </footer>
    )
  }

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days}д назад`
    if (hours > 0) return `${hours}ч назад`
    if (minutes > 0) return `${minutes}м назад`
    return 'только что'
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'swap': return '🔄'
      case 'mint': return '🪙'
      case 'approve': return '✅'
      default: return '📝'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#10b981'
      case 'pending': return '#f59e0b'
      case 'failed': return '#ef4444'
      default: return '#6b7280'
    }
  }

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Заголовок с контролами */}
        <div className="footer-header">
          <div className="footer-tabs">
            <button
              onClick={() => setActiveTab('market')}
              className={`footer-tab ${activeTab === 'market' ? 'active' : ''}`}
            >
              📈 <span>Рынок</span>
              {!pricesLoading && marketData.length > 0 && (
                <span className="tab-badge">{marketData.length}</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`footer-tab ${activeTab === 'history' ? 'active' : ''}`}
            >
              📋 <span>История</span>
              {transactions.length > 0 && (
                <span className="tab-badge">{transactions.length}</span>
              )}
            </button>
          </div>

          <div className="footer-controls">
            <div className="refresh-control">
              <button
                className={`auto-refresh-btn ${autoRefresh ? 'active' : ''}`}
                onClick={() => setAutoRefresh(!autoRefresh)}
                title={autoRefresh ? 'Отключить автообновление' : 'Включить автообновление'}
              >
                {autoRefresh ? '🔄' : '⏸️'}
              </button>
              
              {autoRefresh && (
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="refresh-interval"
                >
                  <option value={10}>10с</option>
                  <option value={30}>30с</option>
                  <option value={60}>1м</option>
                  <option value={300}>5м</option>
                </select>
              )}
            </div>

            <div className="footer-stats">
              <span className="stat-item">
                Сегодня: {stats.totalTransactions} транзакций
              </span>
              <span className="stat-item">
                Успешность: {stats.totalTransactions > 0 ? 
                  ((stats.successfulTransactions / stats.totalTransactions) * 100).toFixed(1) : '100'}%
              </span>
            </div>
          </div>
        </div>

        {/* Контент */}
        <div className="footer-body">
          {activeTab === 'market' ? (
            <div className="market-section">
              {pricesLoading ? (
                <div className="loading-grid">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="market-card-skeleton">
                      <div className="skeleton-line"></div>
                      <div className="skeleton-line short"></div>
                    </div>
                  ))}
                </div>
              ) : marketData.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📊</div>
                  <div className="empty-text">
                    <div>Данные рынка недоступны</div>
                    <div className="empty-hint">Проверьте подключение к интернету</div>
                  </div>
                  <button 
                    className="retry-btn"
                    onClick={() => window.location.reload()}
                  >
                    Обновить
                  </button>
                </div>
              ) : (
                <div className="market-grid">
                  {marketData.map((token) => (
                    <div
                      key={token.symbol}
                      className="market-card"
                      onClick={() => {
                        // Клик по карточке токена - переходим к форме обмена
                        const swapForm = document.querySelector('.swap-form')
                        if (swapForm) {
                          swapForm.scrollIntoView({ behavior: 'smooth' })
                        }
                      }}
                    >
                      <div className="market-header">
                        <span className={`market-icon ${token.color}`}>{token.icon}</span>
                        <div className="market-info">
                          <div className="market-symbol">{token.symbol}</div>
                          <div className="market-volume">
                            Vol: ${token.volume.toLocaleString('ru-RU', { 
                              notation: 'compact', 
                              maximumFractionDigits: 1 
                            })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="market-price">
                        ${token.price.toLocaleString('ru-RU', {
                          minimumFractionDigits: token.price < 1 ? 4 : 2,
                          maximumFractionDigits: token.price < 1 ? 4 : 2
                        })}
                      </div>
                      
                      <div className={`market-change ${token.change >= 0 ? 'positive' : 'negative'}`}>
                        {token.change >= 0 ? '+' : ''}{token.change.toFixed(2)}%
                        <span className="change-arrow">
                          {token.change >= 0 ? '↗' : '↘'}
                        </span>
                      </div>

                      <div className="market-actions">
                        <button 
                          className="market-action-btn buy"
                          onClick={(e) => {
                            e.stopPropagation()
                            console.log(`Покупка ${token.symbol.split('/')[0]}`)
                          }}
                        >
                          Купить
                        </button>
                        <button 
                          className="market-action-btn sell"
                          onClick={(e) => {
                            e.stopPropagation()
                            console.log(`Продажа ${token.symbol.split('/')[0]}`)
                          }}
                        >
                          Продать
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="history-section">
              {transactions.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <div className="empty-text">
                    <div>История транзакций пуста</div>
                    <div className="empty-hint">
                      {isConnected ? 
                        'Совершите первую транзакцию для отображения истории' : 
                        'Подключите кошелёк для просмотра истории'
                      }
                    </div>
                  </div>
                  {!isConnected && (
                    <button 
                      className="connect-btn"
                      onClick={() => document.querySelector('.connect-wallet-button')?.click()}
                    >
                      Подключить кошелёк
                    </button>
                  )}
                </div>
              ) : (
                <div className="history-list">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="history-item">
                      <div className="history-icon">
                        {getTransactionIcon(tx.type)}
                      </div>
                      
                      <div className="history-details">
                        <div className="history-main">
                          <div className="history-type">
                            {tx.type === 'swap' && `${tx.fromToken} → ${tx.toToken}`}
                            {tx.type === 'mint' && `Получение ${tx.toToken}`}
                            {tx.type === 'approve' && `Разрешение ${tx.fromToken}`}
                          </div>
                          <div className="history-amount">
                            {tx.amount && `${tx.amount} ${tx.fromToken || tx.toToken}`}
                          </div>
                        </div>
                        
                        <div className="history-meta">
                          <span className="history-time">
                            {formatTimeAgo(tx.timestamp)}
                          </span>
                          <span 
                            className="history-status"
                            style={{ color: getStatusColor(tx.status) }}
                          >
                            {tx.status === 'success' && '✅ Успешно'}
                            {tx.status === 'pending' && '⏳ Ожидание'}
                            {tx.status === 'failed' && '❌ Ошибка'}
                          </span>
                        </div>
                      </div>

                      <div className="history-actions">
                        {tx.txHash && (
                          <button
                            className="view-tx-btn"
                            onClick={() => {
                              const baseUrl = process.env.NEXT_PUBLIC_CHAIN_ID === '1' ? 
                                'https://etherscan.io' : 'https://sepolia.etherscan.io'
                              window.open(`${baseUrl}/tx/${tx.txHash}`, '_blank')
                            }}
                            title="Посмотреть в Etherscan"
                          >
                            🔗
                          </button>
                        )}
                        
                        {tx.status === 'success' && tx.type === 'swap' && (
                          <button
                            className="repeat-tx-btn"
                            onClick={() => {
                              // Повторить транзакцию с теми же параметрами
                              console.log('Повторить транзакцию:', tx)
                              document.querySelector('.swap-form')?.scrollIntoView({ behavior: 'smooth' })
                            }}
                            title="Повторить транзакцию"
                          >
                            🔄
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .footer {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          margin-bottom: 80px; /* Отступ для PortfolioBar */
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .footer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-tabs {
          display: flex;
          gap: 8px;
        }

        .footer-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
          font-weight: 500;
        }

        .footer-tab:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .footer-tab.active {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border-color: #3b82f6;
        }

        .tab-badge {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          font-size: 12px;
          padding: 2px 6px;
          border-radius: 10px;
          font-weight: 600;
        }

        .footer-controls {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .refresh-control {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .auto-refresh-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: rgba(255, 255, 255, 0.7);
          width: 32px;
          height: 32px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
        }

        .auto-refresh-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .auto-refresh-btn.active {
          background: #10b981;
          color: white;
        }

        .refresh-interval {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }

        .footer-stats {
          display: flex;
          gap: 15px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 12px;
        }

        .stat-item {
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }

        .footer-body {
          min-height: 200px;
        }

        .market-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }

        .market-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }

        .market-card:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .market-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .market-icon {
          font-size: 24px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }

        .market-symbol {
          font-weight: 600;
          color: white;
          font-size: 16px;
        }

        .market-volume {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }

        .market-price {
          font-size: 20px;
          font-weight: 700;
          color: white;
          margin-bottom: 8px;
        }

        .market-change {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .market-change.positive {
          color: #10b981;
        }

        .market-change.negative {
          color: #ef4444;
        }

        .change-arrow {
          font-size: 12px;
        }

        .market-actions {
          display: flex;
          gap: 8px;
        }

        .market-action-btn {
          flex: 1;
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
        }

        .market-action-btn.buy {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .market-action-btn.buy:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .market-action-btn.sell {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
        }

        .market-action-btn.sell:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 300px;
          overflow-y: auto;
          padding-right: 8px;
        }

        .history-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          transition: all 0.2s;
        }

        .history-item:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .history-icon {
          font-size: 20px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }

        .history-details {
          flex: 1;
        }

        .history-main {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .history-type {
          font-weight: 500;
          color: white;
          font-size: 14px;
        }

        .history-amount {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
          font-family: monospace;
        }

        .history-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .history-time {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }

        .history-status {
          font-size: 12px;
          font-weight: 500;
        }

        .history-actions {
          display: flex;
          gap: 4px;
        }

        .view-tx-btn, .repeat-tx-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: rgba(255, 255, 255, 0.7);
          width: 28px;
          height: 28px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 12px;
        }

        .view-tx-btn:hover, .repeat-tx-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          text-align: center;
          color: rgba(255, 255, 255, 0.6);
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.7;
        }

        .empty-text {
          margin-bottom: 20px;
        }

        .empty-text div:first-child {
          font-size: 16px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 8px;
        }

        .empty-hint {
          font-size: 14px;
          line-height: 1.4;
        }

        .retry-btn, .connect-btn {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .retry-btn:hover, .connect-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .loading-container {
          padding: 40px 20px;
        }

        .loading-shimmer {
          height: 200px;
          background: linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
        }

        .loading-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }

        .market-card-skeleton {
          height: 120px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 16px;
        }

        .skeleton-line {
          height: 16px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          margin-bottom: 8px;
          animation: shimmer 1.5s infinite;
        }

        .skeleton-line.short {
          width: 60%;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        /* Стили для скроллбара */
        .history-list::-webkit-scrollbar {
          width: 4px;
        }

        .history-list::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }

        .history-list::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
        }

        .history-list::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        @media (max-width: 768px) {
          .footer-header {
            flex-direction: column;
            gap: 15px;
            align-items: stretch;
          }

          .footer-controls {
            justify-content: space-between;
          }

          .footer-stats {
            flex-direction: column;
            gap: 8px;
          }

          .market-grid {
            grid-template-columns: 1fr;
          }

          .history-main {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }

          .history-actions {
            display: none;
          }
        }
      `}</style>
    </footer>
  )
}

function getTokenIcon(symbol: string): string {
  const icons: Record<string, string> = {
    'ETH': '⟠',
    'WETH': '🔄',
    'USDC': '💵',
    'USDT': '💲',
    'DAI': '🪙',
    'WBTC': '₿',
    'BTC': '₿',
    'BNB': '🔸',
    'ADA': '🔷'
  }
  return icons[symbol] || '🪙'
}