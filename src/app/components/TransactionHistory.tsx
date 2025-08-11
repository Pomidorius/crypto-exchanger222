// src/app/components/TransactionHistory.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

interface Transaction {
  id: string
  type: 'swap' | 'send' | 'receive'
  fromToken: string
  toToken?: string
  amount: string
  value: number
  timestamp: Date
  status: 'completed' | 'pending' | 'failed'
  hash: string
}

export function TransactionHistory() {
  const { address, isConnected } = useAccount()
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    if (isConnected) {
      // Загружаем историю транзакций из localStorage или генерируем моковые данные
      const savedHistory = localStorage.getItem(`transactions_${address}`)
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory)
        setTransactions(parsed.map((tx: any) => ({
          ...tx,
          timestamp: new Date(tx.timestamp)
        })))
      } else {
        // Генерируем моковые данные
        const mockTransactions: Transaction[] = [
          {
            id: '1',
            type: 'swap',
            fromToken: 'ETH',
            toToken: 'USDC',
            amount: '1.0',
            value: 2000,
            timestamp: new Date(Date.now() - 3600000),
            status: 'completed',
            hash: '0x1234...5678'
          },
          {
            id: '2',
            type: 'swap',
            fromToken: 'USDC',
            toToken: 'USDT',
            amount: '500',
            value: 500,
            timestamp: new Date(Date.now() - 7200000),
            status: 'completed',
            hash: '0x2345...6789'
          },
          {
            id: '3',
            type: 'swap',
            fromToken: 'USDT',
            toToken: 'WETH',
            amount: '1000',
            value: 500,
            timestamp: new Date(Date.now() - 10800000),
            status: 'failed',
            hash: '0x3456...7890'
          }
        ]
        setTransactions(mockTransactions)
      }
    }
  }, [address, isConnected])

  // Функция для сохранения новой транзакции
  const addTransaction = (tx: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTx: Transaction = {
      ...tx,
      id: Date.now().toString(),
      timestamp: new Date()
    }
    
    const updatedTransactions = [newTx, ...transactions].slice(0, 50) // Храним последние 50 транзакций
    setTransactions(updatedTransactions)
    
    if (address) {
      localStorage.setItem(`transactions_${address}`, JSON.stringify(updatedTransactions))
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅'
      case 'pending': return '⏳'
      case 'failed': return '❌'
      default: return '❓'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'swap': return '🔄'
      case 'send': return '📤'
      case 'receive': return '📥'
      default: return '❓'
    }
  }

  if (!isConnected) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4">История транзакций</h2>
        <p className="text-gray-500">Подключите кошелек для просмотра истории</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">История транзакций</h2>
        <button className="text-sm text-blue-500 hover:text-blue-600">
          Экспорт CSV
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📊</div>
          <p>Транзакций пока нет</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="text-xl">{getTypeIcon(tx.type)}</div>
                <div>
                  <div className="font-semibold">
                    {tx.type === 'swap' 
                      ? `${tx.fromToken} → ${tx.toToken}`
                      : `${tx.type} ${tx.fromToken}`
                    }
                  </div>
                  <div className="text-sm text-gray-500">
                    {tx.timestamp.toLocaleString('ru')}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-semibold">{tx.amount} {tx.fromToken}</div>
                <div className="text-sm text-gray-500">
                  ≈ ${tx.value.toLocaleString('ru')}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-lg">{getStatusIcon(tx.status)}</span>
                <button 
                  className="text-xs text-blue-500 hover:text-blue-600"
                  onClick={() => window.open(`https://etherscan.io/tx/${tx.hash}`, '_blank')}
                >
                  {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
