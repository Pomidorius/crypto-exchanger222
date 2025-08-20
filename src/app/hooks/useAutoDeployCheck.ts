import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { PROXY_SWAP_ADDRESS, TEMP_CONTRACT_ADDRESS, isContractDeployed } from '../utils/constants'

export function useAutoDeployCheck() {
  const [isChecking, setIsChecking] = useState(true)
  const [deploymentStatus, setDeploymentStatus] = useState<'checking' | 'deployed' | 'missing' | 'deploying'>('checking')
  const { isConnected } = useAccount()

  useEffect(() => {
    checkAndDeploy()
  }, [isConnected])

  async function checkAndDeploy() {
    if (!isConnected) {
      setIsChecking(false)
      return
    }

    try {
      // Проверяем, задеплоен ли контракт
      if (isContractDeployed()) {
        // Дополнительная проверка - существует ли контракт в сети
        const provider = new (await import('ethers')).ethers.JsonRpcProvider('http://127.0.0.1:8545')
        const code = await provider.getCode(PROXY_SWAP_ADDRESS)
        
        if (code !== '0x') {
          setDeploymentStatus('deployed')
          setIsChecking(false)
          return
        }
      }

      // Контракт не найден, пробуем автодеплой
      setDeploymentStatus('missing')
      
      // Проверяем, запущен ли локальный узел
      try {
        const provider = new (await import('ethers')).ethers.JsonRpcProvider('http://127.0.0.1:8545')
        await provider.getNetwork()
        
        // Узел запущен, пробуем автодеплой
        setDeploymentStatus('deploying')
        await triggerAutoDeploy()
        
      } catch (nodeError) {
        // Локальный узел не запущен
        setDeploymentStatus('missing')
      }
      
    } catch (error) {
      console.error('Auto-deploy check failed:', error)
      setDeploymentStatus('missing')
    } finally {
      setIsChecking(false)
    }
  }

  async function triggerAutoDeploy() {
    try {
      // Отправляем запрос на автодеплой через API
      const response = await fetch('/api/auto-deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setDeploymentStatus('deployed')
          // Перезагружаем страницу для обновления адреса контракта
          window.location.reload()
        } else {
          setDeploymentStatus('missing')
        }
      } else {
        setDeploymentStatus('missing')
      }
    } catch (error) {
      console.error('Auto-deploy failed:', error)
      setDeploymentStatus('missing')
    }
  }

  return {
    isChecking,
    deploymentStatus,
    isDeployed: deploymentStatus === 'deployed',
    isDeploying: deploymentStatus === 'deploying',
    isMissing: deploymentStatus === 'missing',
    retryDeploy: checkAndDeploy
  }
}
