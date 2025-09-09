// src/app/components/Header.tsx
'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { SettingsModal } from './SettingsModal'
import { useLivePrices } from '../utils/live-prices'

export function Header() {
  const [activeMenu, setActiveMenu] = useState('exchange')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const { isConnected } = useAccount()
  const { prices, getPrice } = useLivePrices()

  // Обновляем время каждую секунду
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const menuItems = [
    { 
      id: 'exchange', 
      label: 'Обмен', 
      icon: '🔄',
      onClick: () => {
        document.querySelector('.swap-card')?.scrollIntoView({ behavior: 'smooth' })
      }
    },
    { 
      id: 'portfolio', 
      label: 'Портфель', 
      icon: '📊',
      onClick: () => {
        const portfolioBar = document.querySelector('.portfolio-bar')
        if (portfolioBar) {
          portfolioBar.click() // Открываем портфель
        }
      }
    },
    { 
      id: 'history', 
      label: 'История', 
      icon: '📋',
      onClick: () => {
        const footer = document.querySelector('.footer')
        if (footer) {
          footer.scrollIntoView({ behavior: 'smooth' })
          // Переключаем на вкладку истории
          const historyTab = footer.querySelector('[data-tab="history"]') as HTMLElement
          if (historyTab) historyTab.click()
        }
      }
    },
    { 
      id: 'settings', 
      label: 'Настройки', 
      icon: '⚙️',
      onClick: () => {
        setIsSettingsOpen(true)
      }
    },
  ]

  const handleMenuClick = (item: typeof menuItems[0]) => {
    setActiveMenu(item.id)
    if (item.onClick) {
      item.onClick()
    }
  }

  // Определяем статус сети
  const getNetworkStatus = () => {
    const chainId = process.env.NEXT_PUBLIC_CHAIN_ID
    switch (chainId) {
      case '1':
        return { name: 'Mainnet', color: '#10b981', icon: '🌐' }
      case '11155111':
        return { name: 'Sepolia', color: '#f59e0b', icon: '🧪' }
      case '31337':
        return { name: 'Localhost', color: '#6b7280', icon: '🏠' }
      default:
        return { name: 'Unknown', color: '#ef4444', icon: '❓' }
    }
  }

  const networkStatus = getNetworkStatus()
  const ethPrice = getPrice('ETH')

  return (
    <>
      <header className="header">
        <div className="header-content">
          {/* Логотип */}
          <div className="logo" onClick={() => window.location.reload()}>
            <div className="logo-icon">
              <span>🔄</span>
            </div>
            <div className="logo-text">
              <h1>CryptoExchanger</h1>
              <div className="version">v2.0 • Live</div>
            </div>
          </div>

          {/* Центральная навигация */}
          <nav className="nav">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item)}
                className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
                title={item.label}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {item.id === 'portfolio' && isConnected && (
                  <span className="nav-badge">•</span>
                )}
              </button>
            ))}
          </nav>

          {/* Правая часть - Статус, цены, время, кошелек */}
          <div className="header-right">
            {/* Время и статус */}
            <div className="status-info">
              <div className="time-display">
                {currentTime.toLocaleTimeString('ru-RU', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              
              {ethPrice > 0 && (
                <div className="price-display" title="Цена ETH">
                  ⟠ ${ethPrice.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}
                </div>
              )}
            </div>

            {/* Статус сети */}
            <div className="network-status" title={`Подключено к ${networkStatus.name}`}>
              <div 
                className="network-indicator"
                style={{ backgroundColor: networkStatus.color }}
              ></div>
              <span className="network-icon">{networkStatus.icon}</span>
              <span className="network-name">{networkStatus.name}</span>
            </div>

            {/* Быстрые действия */}
            <div className="quick-actions">
              <button 
                className="quick-action-btn"
                onClick={() => window.location.reload()}
                title="Обновить страницу"
              >
                🔄
              </button>
              
              <button 
                className="quick-action-btn"
                onClick={() => {
                  const theme = document.documentElement.classList.contains('dark') ? 'light' : 'dark'
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark')
                  } else {
                    document.documentElement.classList.remove('dark')
                  }
                }}
                title="Переключить тему"
              >
                🌙
              </button>
              
              <button 
                className="quick-action-btn"
                onClick={() => setIsSettingsOpen(true)}
                title="Настройки"
              >
                ⚙️
              </button>
            </div>

            {/* Кошелек */}
            <div className="wallet-section">
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      {/* Модальное окно настроек */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

      <style jsx>{`
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 12px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .logo:hover {
          transform: scale(1.05);
        }

        .logo-icon {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .logo-text h1 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: white;
          background: linear-gradient(135deg, #60a5fa, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .version {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 500;
        }

        .nav {
          display: flex;
          gap: 4px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 6px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: none;
          border: none;
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
          font-weight: 500;
          position: relative;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .nav-item.active {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }

        .nav-icon {
          font-size: 16px;
        }

        .nav-badge {
          position: absolute;
          top: 6px;
          right: 6px;
          color: #10b981;
          font-size: 12px;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .status-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
        }

        .time-display {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 600;
          font-family: 'Courier New', monospace;
        }

        .price-display {
          font-size: 11px;
          color: #10b981;
          font-weight: 500;
        }

        .network-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
          transition: all 0.2s;
        }

        .network-status:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .network-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .network-icon {
          font-size: 14px;
        }

        .network-name {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
        }

        .quick-actions {
          display: flex;
          gap: 4px;
        }

        .quick-action-btn {
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .quick-action-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          transform: translateY(-1px);
        }

        .wallet-section {
          margin-left: 8px;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @media (max-width: 1024px) {
          .status-info {
            display: none;
          }
          
          .network-name {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .header-content {
            padding: 10px 16px;
            gap: 12px;
          }

          .nav {
            display: none;
          }

          .logo-text h1 {
            font-size: 16px;
          }

          .quick-actions {
            gap: 2px;
          }

          .quick-action-btn {
            width: 32px;
            height: 32px;
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          .network-status {
            padding: 6px 8px;
          }

          .network-icon {
            display: none;
          }

          .logo-text {
            display: none;
          }
        }
      `}</style>
    </>
  )
}
