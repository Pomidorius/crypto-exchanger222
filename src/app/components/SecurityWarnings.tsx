'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

interface SecurityWarning {
  id: string
  type: 'warning' | 'error' | 'info'
  title: string
  message: string
  action?: {
    text: string
    onClick: () => void
  }
  dismissible?: boolean
  autoHide?: number // секунды
}

export function SecurityWarnings() {
  const { address, isConnected } = useAccount()
  const [warnings, setWarnings] = useState<SecurityWarning[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!isConnected) return

    const checkSecurityWarnings = () => {
      const newWarnings: SecurityWarning[] = []

      // 1. Проверка сети
      const chainId = process.env.NEXT_PUBLIC_CHAIN_ID
      if (chainId === '1') {
        newWarnings.push({
          id: 'mainnet-warning',
          type: 'warning',
          title: '⚠️ Mainnet режим',
          message: 'Вы работаете с реальными деньгами! Будьте осторожны с большими суммами.',
          dismissible: true
        })
      }

      // 2. Проверка высокой цены газа
      checkGasPrice().then(gasPrice => {
        if (gasPrice > 100) {
          newWarnings.push({
            id: 'high-gas',
            type: 'warning',
            title: '⛽ Высокая цена газа',
            message: `Текущая цена газа: ${gasPrice} gwei. Рекомендуется подождать.`,
            dismissible: true,
            autoHide: 30
          })
        }
      })

      // 3. Проверка slippage tolerance
      const savedSlippage = localStorage.getItem('slippageTolerance')
      if (savedSlippage && parseFloat(savedSlippage) > 3) {
        newWarnings.push({
          id: 'high-slippage',
          type: 'error',
          title: '🚨 Высокий slippage',
          message: `Slippage установлен на ${savedSlippage}%. Это может привести к большим потерям!`,
          action: {
            text: 'Изменить',
            onClick: () => {
              localStorage.setItem('slippageTolerance', '0.5')
              setWarnings(prev => prev.filter(w => w.id !== 'high-slippage'))
            }
          }
        })
      }

      // 4. Проверка подозрительной активности
      const securityLogs = JSON.parse(localStorage.getItem('securityLogs') || '[]')
      const recentLogs = securityLogs.filter((log: any) => 
        Date.now() - log.timestamp < 3600000 // последний час
      )
      
      if (recentLogs.length > 5) {
        newWarnings.push({
          id: 'suspicious-activity',
          type: 'warning',
          title: '🔍 Активная торговля',
          message: 'Обнаружена повышенная активность. Убедитесь, что все транзакции выполняете вы.',
          dismissible: true
        })
      }

      // 5. Проверка версии браузера и MetaMask
      if (typeof window !== 'undefined') {
        if (!window.ethereum) {
          newWarnings.push({
            id: 'no-wallet',
            type: 'error',
            title: '🦊 Кошелек не найден',
            message: 'Установите MetaMask или другой Web3 кошелек для безопасной работы.',
            action: {
              text: 'Установить MetaMask',
              onClick: () => window.open('https://metamask.io/', '_blank')
            }
          })
        }
      }

      // Фильтруем уже скрытые предупреждения
      const filteredWarnings = newWarnings.filter(w => !dismissed.has(w.id))
      setWarnings(filteredWarnings)
    }

    checkSecurityWarnings()
    
    // Периодическая проверка
    const interval = setInterval(checkSecurityWarnings, 30000) // каждые 30 секунд
    
    return () => clearInterval(interval)
  }, [isConnected, dismissed])

  // Автоматическое скрытие предупреждений
  useEffect(() => {
    warnings.forEach(warning => {
      if (warning.autoHide) {
        setTimeout(() => {
          dismissWarning(warning.id)
        }, warning.autoHide * 1000)
      }
    })
  }, [warnings])

  const dismissWarning = (id: string) => {
    setDismissed(prev => new Set([...prev, id]))
    setWarnings(prev => prev.filter(w => w.id !== id))
  }

  if (warnings.length === 0) return null

  return (
    <div className="security-warnings">
      {warnings.map(warning => (
        <div
          key={warning.id}
          className={`security-warning ${warning.type}`}
        >
          <div className="warning-content">
            <div className="warning-header">
              <h4 className="warning-title">{warning.title}</h4>
              {warning.dismissible && (
                <button
                  onClick={() => dismissWarning(warning.id)}
                  className="dismiss-button"
                  aria-label="Закрыть"
                >
                  ✕
                </button>
              )}
            </div>
            
            <p className="warning-message">{warning.message}</p>
            
            {warning.action && (
              <button
                onClick={warning.action.onClick}
                className="warning-action-button"
              >
                {warning.action.text}
              </button>
            )}
          </div>
        </div>
      ))}
      
      <style jsx>{`
        .security-warnings {
          position: fixed;
          top: 80px;
          right: 20px;
          z-index: 1000;
          max-width: 400px;
          space-y: 10px;
        }
        
        .security-warning {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          padding: 16px;
          margin-bottom: 10px;
          border-left: 4px solid;
          animation: slideIn 0.3s ease-out;
        }
        
        .security-warning.warning {
          border-left-color: #f59e0b;
          background: #fef3c7;
        }
        
        .security-warning.error {
          border-left-color: #dc2626;
          background: #fee2e2;
        }
        
        .security-warning.info {
          border-left-color: #2563eb;
          background: #dbeafe;
        }
        
        .warning-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }
        
        .warning-title {
          font-size: 14px;
          font-weight: 600;
          margin: 0;
          color: #1f2937;
        }
        
        .dismiss-button {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #6b7280;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s;
        }
        
        .dismiss-button:hover {
          background: rgba(0, 0, 0, 0.1);
          color: #374151;
        }
        
        .warning-message {
          font-size: 13px;
          color: #374151;
          margin: 0 0 12px 0;
          line-height: 1.4;
        }
        
        .warning-action-button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .warning-action-button:hover {
          background: #2563eb;
        }
        
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @media (max-width: 640px) {
          .security-warnings {
            position: relative;
            top: auto;
            right: auto;
            max-width: 100%;
            margin: 10px;
          }
        }
      `}</style>
    </div>
  )
}

/**
 * Проверка текущей цены газа
 */
async function checkGasPrice(): Promise<number> {
  try {
    if (typeof window !== 'undefined' && window.ethereum) {
      const { ethers } = await import('ethers')
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const gasPrice = await provider.getGasPrice()
      return parseFloat(ethers.utils.formatUnits(gasPrice, 'gwei'))
    }
  } catch (error) {
    console.error('Ошибка получения цены газа:', error)
  }
  return 0
}

/**
 * Хук для добавления предупреждений из компонентов
 */
export function useSecurityWarnings() {
  const addWarning = (warning: Omit<SecurityWarning, 'id'>) => {
    const warningWithId = {
      ...warning,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
    
    // Добавляем в глобальное состояние или используем context
    // Пока просто логируем
    console.warn('Security warning:', warningWithId)
    
    // В будущем можно использовать React Context или state management
    return warningWithId.id
  }
  
  return { addWarning }
}
