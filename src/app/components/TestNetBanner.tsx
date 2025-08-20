'use client'

export function TestNetBanner() {
  // Проверяем, находимся ли мы в тестовой сети
  const isTestnet = process.env.NEXT_PUBLIC_CHAIN_ID === '11155111'
  
  if (!isTestnet) return null

  return (
    <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-400 p-4 rounded-lg mb-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🧪</span>
        <div className="flex-1">
          <h3 className="font-bold text-yellow-800 text-lg">Тестовая версия - Sepolia</h3>
          <p className="text-yellow-700 text-sm mt-1">
            Это безопасная тестовая сеть! Используйте бесплатные тестовые ETH для экспериментов.
          </p>
        </div>
      </div>
      
      <div className="mt-3 flex flex-wrap gap-2">
        <a 
          href="https://sepoliafaucet.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center px-3 py-1 bg-yellow-500 text-yellow-900 rounded-md text-sm font-medium hover:bg-yellow-600 transition-colors"
        >
          💧 Получить тестовые ETH
        </a>
        
        <a 
          href="https://chainlist.org/chain/11155111" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center px-3 py-1 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          🔗 Добавить Sepolia в MetaMask
        </a>
      </div>
      
      <div className="mt-2 text-xs text-yellow-600">
        💡 Тестовые ETH не имеют реальной ценности - экспериментируйте свободно!
      </div>
    </div>
  )
}
