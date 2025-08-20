'use client'

import { isContractDeployed, PROXY_SWAP_ADDRESS } from '../utils/constants'

export function ContractStatus() {
  const contractDeployed = isContractDeployed()
  const envChainId = process.env.NEXT_PUBLIC_CHAIN_ID
  
  // Если контракт задеплоен, показываем успешный статус
  if (contractDeployed) {
    return (
      <div className="bg-green-100 border border-green-400 p-4 rounded-lg mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div className="flex-1">
            <h3 className="font-bold text-green-800 text-lg">Контракт готов к работе</h3>
            <p className="text-green-700 text-sm mt-1">
              Смарт-контракт успешно развернут и готов для обмена токенов.
            </p>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-green-600">
          <p>Адрес контракта: <code className="bg-green-50 px-1 rounded">{PROXY_SWAP_ADDRESS}</code></p>
          {envChainId === '11155111' && (
            <a 
              href={`https://sepolia.etherscan.io/address/${PROXY_SWAP_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-800 underline"
            >
              🔍 Посмотреть в Etherscan
            </a>
          )}
        </div>
      </div>
    )
  }

  // Если контракт не задеплоен
  return (
    <div className="bg-orange-100 border border-orange-400 p-4 rounded-lg mb-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-2xl">⚠️</span>
        <div className="flex-1">
          <h3 className="font-bold text-orange-800 text-lg">Контракт не найден</h3>
          <p className="text-orange-700 text-sm mt-1">
            {envChainId === '11155111' 
              ? 'Смарт-контракт не задеплоен на Sepolia testnet.'
              : envChainId === '31337'
              ? 'Запустите локальный Hardhat node и задеплойте контракт.'
              : 'Смарт-контракт не найден в текущей сети.'
            }
          </p>
        </div>
      </div>
      
      <div className="mt-3 text-sm text-orange-600">
        {envChainId === '11155111' ? (
          <div>
            <p className="mb-2">Для деплоя на Sepolia:</p>
            <div className="bg-orange-50 p-3 rounded border">
              <code className="text-xs">
                npm run deploy:sepolia
              </code>
            </div>
          </div>
        ) : envChainId === '31337' ? (
          <div>
            <p className="mb-2">Для локальной разработки:</p>
            <div className="bg-orange-50 p-3 rounded border">
              <code className="text-xs">
                npm run node &<br/>
                npm run deploy:local
              </code>
            </div>
          </div>
        ) : (
          <div>
            <p className="mb-2">Для разработчика:</p>
            <div className="bg-orange-50 p-3 rounded border">
              <code className="text-xs">
                npm run deploy:sepolia  # для тестирования<br/>
                npm run deploy:mainnet  # для продакшена
              </code>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
