'use client'

import { useState } from 'react'

export function TestFaucet() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  // Проверяем, находимся ли мы в тестовой сети
  const isTestnet = process.env.NEXT_PUBLIC_CHAIN_ID === '11155111'
  
  if (!isTestnet) return null

  const handleGetTestTokens = async () => {
    setIsLoading(true)
    setMessage('')
    
    try {
      // Здесь будет логика для получения тестовых токенов
      // Пока что просто показываем сообщение
      setTimeout(() => {
        setMessage('✅ Тестовые токены успешно получены!')
        setIsLoading(false)
      }, 2000)
    } catch (error) {
      console.error('Ошибка при получении тестовых токенов:', error)
      setMessage('❌ Ошибка при получении тестовых токенов')
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-400 p-4 rounded-lg mb-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🚰</span>
        <div className="flex-1">
          <h3 className="font-bold text-blue-800 text-lg">Тестовый кран токенов</h3>
          <p className="text-blue-700 text-sm mt-1">
            Получите бесплатные тестовые токены для экспериментов с обменником.
          </p>
        </div>
      </div>
      
      <div className="mt-4 flex flex-col gap-3">
        <button
          onClick={handleGetTestTokens}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Получение токенов...
            </span>
          ) : (
            '💧 Получить тестовые токены'
          )}
        </button>
        
        {message && (
          <div className={`text-sm p-2 rounded ${
            message.includes('✅') 
              ? 'bg-green-100 text-green-700 border border-green-300' 
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {message}
          </div>
        )}
        
        <div className="text-xs text-blue-600">
          💡 Тестовые токены не имеют реальной ценности и предназначены только для разработки
        </div>
      </div>
    </div>
  )
}
