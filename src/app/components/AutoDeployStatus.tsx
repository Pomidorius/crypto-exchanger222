import { useAutoDeployCheck } from '../hooks/useAutoDeployCheck'
import { isContractDeployed } from '../utils/constants'

export function AutoDeployStatus() {
  const { isChecking, deploymentStatus, retryDeploy } = useAutoDeployCheck()
  
  // Отключаем автодеплой на production/Vercel
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return null
  }

  // Показываем только для localhost (chainId 31337)
  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID
  if (chainId !== '31337') {
    return null
  }

  // Если контракт уже задеплоен, показываем статус
  if (isContractDeployed()) {
    return (
      <div className="auto-deploy-status deployed">
        <p>✅ Localhost контракт готов к работе</p>
      </div>
    )
  }

  if (isChecking) {
    return (
      <div className="auto-deploy-status checking">
        <div className="spinner"></div>
        <p>🔍 Проверяем локальный контракт...</p>
      </div>
    )
  }

  if (deploymentStatus === 'deploying') {
    return (
      <div className="auto-deploy-status deploying">
        <div className="spinner"></div>
        <p>🚀 Деплоим контракт автоматически...</p>
        <p className="note">Это займет 1-2 минуты</p>
      </div>
    )
  }

  if (deploymentStatus === 'missing') {
    return (
      <div className="auto-deploy-status missing">
        <p>⚠️ Локальный контракт не найден</p>
        <p className="note">Запустите Hardhat node и попробуйте снова</p>
        <button onClick={retryDeploy} className="retry-button">
          🔄 Попробовать снова
        </button>
        <div className="instructions">
          <h4>Или запустите вручную:</h4>
          <pre><code>npm run dev:auto</code></pre>
        </div>
      </div>
    )
  }

  return null
}

// CSS стили (добавьте в globals.css)
export const autoDeployStyles = `
.auto-deploy-status {
  margin: 20px 0;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
}

.auto-deploy-status.checking {
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  color: #0c4a6e;
}

.auto-deploy-status.deployed {
  background: #f0fdf4;
  border: 1px solid #22c55e;
  color: #14532d;
}

.auto-deploy-status.deploying {
  background: #fefce8;
  border: 1px solid #eab308;
  color: #854d0e;
}

.auto-deploy-status.missing {
  background: #fef2f2;
  border: 1px solid #ef4444;
  color: #7f1d1d;
}

.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.note {
  font-size: 0.9em;
  margin-top: 5px;
  opacity: 0.8;
}

.retry-button {
  margin-top: 10px;
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.retry-button:hover {
  background: #2563eb;
}

.instructions {
  margin-top: 15px;
  text-align: left;
}

.instructions h4 {
  margin: 0 0 8px 0;
  font-size: 1em;
}

.instructions pre {
  background: #1f2937;
  color: #f9fafb;
  padding: 8px;
  border-radius: 4px;
  font-size: 0.9em;
}
`
