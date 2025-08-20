'use client'

import { PROXY_SWAP_ADDRESS } from '../utils/constants'

export function ContractStatus() {
  const isContractDeployed = PROXY_SWAP_ADDRESS !== '' && PROXY_SWAP_ADDRESS !== '0x0000000000000000000000000000000000000001'
  
  if (isContractDeployed) return null

  return (
    <div className="bg-orange-100 border border-orange-400 p-4 rounded-lg mb-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-2xl">⚠️</span>
        <div className="flex-1">
          <h3 className="font-bold text-orange-800 text-lg">Контракт не задеплоен</h3>
          <p className="text-orange-700 text-sm mt-1">
            Смарт-контракт еще не развернут. Функции обмена временно недоступны.
          </p>
        </div>
      </div>
      
      <div className="mt-3 text-sm text-orange-600">
        <p className="mb-2">Для разработчика:</p>
        <div className="bg-orange-50 p-3 rounded border">
          <code className="text-xs">
            npm run deploy:sepolia  # для тестирования<br/>
            npm run deploy:mainnet  # для продакшена
          </code>
        </div>
      </div>
    </div>
  )
}
