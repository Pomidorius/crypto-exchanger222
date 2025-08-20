'use client'

import { useState } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { providers, Contract } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import toast from 'react-hot-toast'
import { TokenMap } from '../utils/constants'

// ABI для mint функции MockERC20
const MOCK_ERC20_ABI = [
  'function mint(address to, uint256 amount) public',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)'
]

// Sepolia Faucets
const SEPOLIA_FAUCETS = {
  ETH: [
    { name: 'Sepolia Faucet', url: 'https://sepoliafaucet.com/' },
    { name: 'Alchemy Faucet', url: 'https://sepoliafaucet.com/' },
    { name: 'Infura Faucet', url: 'https://www.infura.io/faucet/sepolia' }
  ],
  USDC: [
    { name: 'Circle Testnet', url: 'https://faucet.circle.com/' }
  ],
  USDT: [
    { name: 'Sepolia USDT Faucet', url: 'https://faucet.paradigm.xyz/' }
  ]
}

export function TestFaucet() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [isLoading, setIsLoading] = useState(false)

  // Не показываем если кошелек не подключен
  if (!isConnected) {
    return null
  }

  const isLocalhost = chainId === 31337
  const isSepolia = chainId === 11155111
  const isMainnet = chainId === 1

  // Для mainnet показываем предупреждение
  if (isMainnet) {
    return (
      <div className="test-faucet mainnet-warning">
        <div className="faucet-header">
          <h3>⚠️ Внимание: Mainnet</h3>
          <p>Вы подключены к основной сети Ethereum. Все операции выполняются с реальными токенами!</p>
        </div>
        <div className="mainnet-info">
          <p>🔴 Это не тестовая среда</p>
          <p>💰 Все транзакции требуют реальный ETH для комиссий</p>
          <p>⚡ Переключитесь на Sepolia для безопасного тестирования</p>
        </div>
      </div>
    )
  }

  // Для Sepolia показываем ссылки на faucets
  if (isSepolia) {
    return (
      <div className="test-faucet">
        <div className="faucet-header">
          <h3>🚰 Тестовые краны Sepolia</h3>
          <p>Получите бесплатные тестовые токены для проверки функционала</p>
        </div>
        
        <div className="faucet-links">
          <div className="faucet-section">
            <h4>💎 ETH (тестовый)</h4>
            <div className="faucet-buttons-links">
              {SEPOLIA_FAUCETS.ETH.map((faucet, index) => (
                <a 
                  key={index}
                  href={faucet.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="faucet-link-btn eth-btn"
                >
                  {faucet.name} ↗
                </a>
              ))}
            </div>
          </div>
          
          <div className="faucet-section">
            <h4>💵 USDC (тестовый)</h4>
            <div className="faucet-buttons-links">
              {SEPOLIA_FAUCETS.USDC.map((faucet, index) => (
                <a 
                  key={index}
                  href={faucet.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="faucet-link-btn usdc-btn"
                >
                  {faucet.name} ↗
                </a>
              ))}
            </div>
          </div>
        </div>
        
        <div className="faucet-info">
          <p>ℹ️ Скопируйте ваш адрес: <code className="address-code">{address}</code></p>
          <p>🔄 Тестовые токены бесплатны и без ограничений</p>
          <p>⏱️ Получение токенов может занять несколько минут</p>
        </div>
      </div>
    )
  }

  // Для localhost показываем mint кнопки
  if (isLocalhost) {
    const handleMintTokens = async (tokenSymbol: string) => {
      if (!address) return

      setIsLoading(true)
      try {
        const web3Provider = new providers.Web3Provider(window.ethereum as providers.ExternalProvider)
        const signer = web3Provider.getSigner()
        
        const tokenAddress = TokenMap[tokenSymbol]?.address
        if (!tokenAddress) {
          toast.error(`Токен ${tokenSymbol} не найден`)
          return
        }

        const tokenContract = new Contract(tokenAddress, MOCK_ERC20_ABI, signer)
        
        // Получаем информацию о токене
        const [, symbol, decimals] = await Promise.all([
          tokenContract.name(),
          tokenContract.symbol(),
          tokenContract.decimals()
        ])

        // Минтим 1000 токенов
        const amount = parseUnits('1000', decimals)
        
        toast('Получаем тестовые токены...', { icon: '⏳' })
        
        const tx = await tokenContract.mint(address, amount)
        await tx.wait()
        
        toast.success(`Получено 1000 ${symbol}!`)
        
      } catch (error: unknown) {
        const err = error as { code?: number; message?: string }
        console.error('Mint error:', error)
        if (err.code === 4001) {
          toast('Транзакция отменена', { icon: '⚠️' })
        } else {
          toast.error(`Ошибка: ${err.message || 'Неизвестная ошибка'}`)
        }
      } finally {
        setIsLoading(false)
      }
    }

    const handleMintETH = async () => {
      if (!address) return

      setIsLoading(true)
      try {
        const web3Provider = new providers.Web3Provider(window.ethereum as providers.ExternalProvider)
        const signer = web3Provider.getSigner()
        
        // Отправляем 10 ETH с одного из аккаунтов Hardhat
        // В localhost у нас есть предзаполненные аккаунты
        toast('Получаем тестовый ETH...', { icon: '⏳' })
        
        const tx = await signer.sendTransaction({
          to: address,
          value: parseUnits('10', 18) // 10 ETH
        })
        
        await tx.wait()
        toast.success('Получено 10 ETH!')
        
      } catch (error: unknown) {
        const err = error as { code?: number; message?: string }
        console.error('ETH mint error:', error)
        if (err.code === 4001) {
          toast('Транзакция отменена', { icon: '⚠️' })
        } else {
          // Для ETH можем просто показать сообщение
          toast.error('Для получения ETH используйте аккаунты Hardhat с балансом')
        }
      } finally {
        setIsLoading(false)
      }
    }

    return (
      <div className="test-faucet">
        <div className="faucet-header">
          <h3>🚰 Локальный тестовый кран</h3>
          <p>Получите тестовые токены для проверки функционала на localhost</p>
        </div>
        
        <div className="faucet-buttons">
          <button 
            onClick={handleMintETH}
            disabled={isLoading}
            className="faucet-btn eth-btn"
          >
            {isLoading ? '⏳' : '💎'} Получить 10 ETH
          </button>
          
          <button 
            onClick={() => handleMintTokens('USDT')}
            disabled={isLoading}
            className="faucet-btn usdt-btn"
          >
            {isLoading ? '⏳' : '💵'} Получить 1000 USDT
          </button>
          
          <button 
            onClick={() => handleMintTokens('USDC')}
            disabled={isLoading}
            className="faucet-btn usdc-btn"
          >
            {isLoading ? '⏳' : '💰'} Получить 1000 USDC
          </button>
          
          <button 
            onClick={() => handleMintTokens('DAI')}
            disabled={isLoading}
            className="faucet-btn dai-btn"
          >
            {isLoading ? '⏳' : '🪙'} Получить 1000 DAI
          </button>
        </div>
        
        <div className="faucet-info">
          <p>ℹ️ Тестовые токены доступны только в localhost сети</p>
          <p>🔄 Можно получать токены неограниченное количество раз</p>
        </div>
      </div>
    )
  }

  // Для других сетей не показываем ничего
  return null
}

  const handleMintTokens = async (tokenSymbol: string) => {
    if (!address) return

    setIsLoading(true)
    try {
      const web3Provider = new providers.Web3Provider(window.ethereum as providers.ExternalProvider)
      const signer = web3Provider.getSigner()
      
      const tokenAddress = networkConfig.TOKEN_ADDRESSES[tokenSymbol]
      if (!tokenAddress) {
        toast.error(`Токен ${tokenSymbol} не найден`)
        return
      }

      const tokenContract = new Contract(tokenAddress, MOCK_ERC20_ABI, signer)
      
      // Получаем информацию о токене
      const [, symbol, decimals] = await Promise.all([
        tokenContract.name(),
        tokenContract.symbol(),
        tokenContract.decimals()
      ])

      // Минтим 1000 токенов
      const amount = parseUnits('1000', decimals)
      
      toast('Получаем тестовые токены...', { icon: '⏳' })
      
      const tx = await tokenContract.mint(address, amount)
      await tx.wait()
      
      toast.success(`Получено 1000 ${symbol}!`)
      
    } catch (error: unknown) {
      const err = error as { code?: number; message?: string }
      console.error('Mint error:', error)
      if (err.code === 4001) {
        toast('Транзакция отменена', { icon: '⚠️' })
      } else {
        toast.error(`Ошибка: ${err.message || 'Неизвестная ошибка'}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleMintETH = async () => {
    if (!address) return

    setIsLoading(true)
    try {
      const web3Provider = new providers.Web3Provider(window.ethereum as providers.ExternalProvider)
      const signer = web3Provider.getSigner()
      
      // Отправляем 10 ETH с одного из аккаунтов Hardhat
      // В localhost у нас есть предзаполненные аккаунты
      toast('Получаем тестовый ETH...', { icon: '⏳' })
      
      const tx = await signer.sendTransaction({
        to: address,
        value: parseUnits('10', 18) // 10 ETH
      })
      
      await tx.wait()
      toast.success('Получено 10 ETH!')
      
    } catch (error: unknown) {
      const err = error as { code?: number; message?: string }
      console.error('ETH mint error:', error)
      if (err.code === 4001) {
        toast('Транзакция отменена', { icon: '⚠️' })
      } else {
        // Для ETH можем просто показать сообщение
        toast.error('Для получения ETH используйте аккаунты Hardhat с балансом')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="test-faucet">
      <div className="faucet-header">
        <h3>🚰 Тестовый кран</h3>
        <p>Получите тестовые токены для проверки функционала</p>
      </div>
      
      <div className="faucet-buttons">
        <button 
          onClick={handleMintETH}
          disabled={isLoading}
          className="faucet-btn eth-btn"
        >
          {isLoading ? '⏳' : '💎'} Получить 10 ETH
        </button>
        
        <button 
          onClick={() => handleMintTokens('USDT')}
          disabled={isLoading}
          className="faucet-btn usdt-btn"
        >
          {isLoading ? '⏳' : '💵'} Получить 1000 USDT
        </button>
        
        <button 
          onClick={() => handleMintTokens('USDC')}
          disabled={isLoading}
          className="faucet-btn usdc-btn"
        >
          {isLoading ? '⏳' : '💰'} Получить 1000 USDC
        </button>
        
        <button 
          onClick={() => handleMintTokens('DAI')}
          disabled={isLoading}
          className="faucet-btn dai-btn"
        >
          {isLoading ? '⏳' : '🪙'} Получить 1000 DAI
        </button>
      </div>
      
      <div className="faucet-info">
        <p>ℹ️ Тестовые токены доступны только в localhost сети</p>
        <p>🔄 Можно получать токены неограниченное количество раз</p>
      </div>
    </div>
  )
}
