'use client'

import { useState, useEffect } from 'react'
import { useMonitoring } from '../utils/monitoring'
import type { TransactionLog, Alert } from '../utils/monitoring'

export function AdminDashboard() {
  const monitoring = useMonitoring()
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'alerts' | 'metrics'>('overview')
  const [timeRange, setTimeRange] = useState<'hour' | 'day' | 'week'>('day')
  const [stats, setStats] = useState<any>(null)
  const [logs, setLogs] = useState<TransactionLog[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])

  useEffect(() => {
    const updateData = () => {
      setStats(monitoring.getStats(timeRange))
      setLogs(monitoring.getLogs({ limit: 50 }))
      setAlerts(monitoring.getAlerts({ limit: 20 }))
    }

    updateData()
    const interval = setInterval(updateData, 5000) // обновляем каждые 5 секунд

    return () => clearInterval(interval)
  }, [timeRange, monitoring])

  if (!stats) {
    return (
      <div className="admin-dashboard loading">
        <div className="loading-spinner">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>📊 Панель администратора</h1>
        <div className="time-range-selector">
          <label>Период:</label>
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value as any)}>
            <option value="hour">Последний час</option>
            <option value="day">Последний день</option>
            <option value="week">Последняя неделя</option>
          </select>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Обзор
        </button>
        <button 
          className={activeTab === 'transactions' ? 'active' : ''}
          onClick={() => setActiveTab('transactions')}
        >
          Транзакции ({logs.length})
        </button>
        <button 
          className={activeTab === 'alerts' ? 'active' : ''}
          onClick={() => setActiveTab('alerts')}
        >
          Алерты ({alerts.filter(a => !a.resolved).length})
        </button>
        <button 
          className={activeTab === 'metrics' ? 'active' : ''}
          onClick={() => setActiveTab('metrics')}
        >
          Метрики
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && <OverviewTab stats={stats} />}
        {activeTab === 'transactions' && <TransactionsTab logs={logs} />}
        {activeTab === 'alerts' && <AlertsTab alerts={alerts} monitoring={monitoring} />}
        {activeTab === 'metrics' && <MetricsTab stats={stats} />}
      </div>

      <style jsx>{`
        .admin-dashboard {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 2px solid #e5e7eb;
        }

        .dashboard-header h1 {
          margin: 0;
          color: #1f2937;
        }

        .time-range-selector {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .time-range-selector select {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
        }

        .dashboard-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 20px;
          border-bottom: 1px solid #e5e7eb;
        }

        .dashboard-tabs button {
          padding: 12px 20px;
          border: none;
          background: none;
          cursor: pointer;
          border-radius: 6px 6px 0 0;
          font-weight: 500;
          color: #6b7280;
          transition: all 0.2s;
        }

        .dashboard-tabs button:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .dashboard-tabs button.active {
          background: #3b82f6;
          color: white;
        }

        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
        }

        .loading-spinner {
          font-size: 18px;
          color: #6b7280;
        }
      `}</style>
    </div>
  )
}

function OverviewTab({ stats }: { stats: any }) {
  const successRate = stats.totalTransactions > 0 
    ? (stats.successfulTransactions / stats.totalTransactions * 100).toFixed(1)
    : '100.0'

  return (
    <div className="overview-tab">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalTransactions}</div>
            <div className="stat-label">Всего транзакций</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.successfulTransactions}</div>
            <div className="stat-label">Успешных</div>
          </div>
        </div>

        <div className="stat-card error">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <div className="stat-value">{stats.failedTransactions}</div>
            <div className="stat-label">Неудачных</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{successRate}%</div>
            <div className="stat-label">Успешность</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⛽</div>
          <div className="stat-content">
            <div className="stat-value">{stats.averageGasUsed.toLocaleString()}</div>
            <div className="stat-label">Средний газ</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalVolume.toFixed(2)}</div>
            <div className="stat-label">Объем ETH</div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">🚨</div>
          <div className="stat-content">
            <div className="stat-value">{stats.criticalAlerts}</div>
            <div className="stat-label">Критичных алертов</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-value">{stats.pendingTransactions}</div>
            <div className="stat-label">В ожидании</div>
          </div>
        </div>
      </div>

      {stats.topTokens.length > 0 && (
        <div className="top-tokens">
          <h3>Популярные токены</h3>
          <div className="token-list">
            {stats.topTokens.map((token: any, index: number) => (
              <div key={token.token} className="token-item">
                <span className="token-rank">#{index + 1}</span>
                <span className="token-name">{token.token}</span>
                <span className="token-count">{token.count} операций</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          transition: transform 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .stat-card.success {
          border-left: 4px solid #10b981;
        }

        .stat-card.error {
          border-left: 4px solid #ef4444;
        }

        .stat-card.warning {
          border-left: 4px solid #f59e0b;
        }

        .stat-icon {
          font-size: 24px;
          opacity: 0.8;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
        }

        .stat-label {
          font-size: 14px;
          color: #6b7280;
        }

        .top-tokens {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
        }

        .top-tokens h3 {
          margin: 0 0 15px 0;
          color: #1f2937;
        }

        .token-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .token-item:last-child {
          border-bottom: none;
        }

        .token-rank {
          font-weight: 600;
          color: #6b7280;
          min-width: 30px;
        }

        .token-name {
          font-weight: 500;
          flex: 1;
        }

        .token-count {
          color: #6b7280;
          font-size: 14px;
        }
      `}</style>
    </div>
  )
}

function TransactionsTab({ logs }: { logs: TransactionLog[] }) {
  return (
    <div className="transactions-tab">
      <div className="transactions-table">
        <div className="table-header">
          <div>Время</div>
          <div>Тип</div>
          <div>Пользователь</div>
          <div>Токены</div>
          <div>Сумма</div>
          <div>Статус</div>
          <div>TX Hash</div>
        </div>
        {logs.map(log => (
          <div key={log.id} className="table-row">
            <div className="timestamp">
              {new Date(log.timestamp).toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            <div className="type">{log.type}</div>
            <div className="address" title={log.userAddress}>
              {log.userAddress.slice(0, 6)}...{log.userAddress.slice(-4)}
            </div>
            <div className="tokens">
              {log.fromToken && log.toToken ? `${log.fromToken} → ${log.toToken}` : '-'}
            </div>
            <div className="amount">{log.amount || '-'}</div>
            <div className={`status ${log.status}`}>
              {log.status === 'success' && '✅'}
              {log.status === 'failed' && '❌'}
              {log.status === 'pending' && '⏳'}
              {log.status}
            </div>
            <div className="hash">
              {log.txHash ? (
                <a
                  href={`https://etherscan.io/tx/${log.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hash-link"
                >
                  {log.txHash.slice(0, 8)}...
                </a>
              ) : '-'}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .transactions-table {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }

        .table-header {
          display: grid;
          grid-template-columns: 120px 80px 120px 120px 100px 100px 120px;
          gap: 15px;
          padding: 15px;
          background: #f9fafb;
          font-weight: 600;
          color: #374151;
          border-bottom: 1px solid #e5e7eb;
        }

        .table-row {
          display: grid;
          grid-template-columns: 120px 80px 120px 120px 100px 100px 120px;
          gap: 15px;
          padding: 12px 15px;
          border-bottom: 1px solid #f3f4f6;
          align-items: center;
        }

        .table-row:hover {
          background: #f9fafb;
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .timestamp {
          font-size: 13px;
          color: #6b7280;
        }

        .type {
          font-size: 12px;
          padding: 4px 8px;
          background: #e5e7eb;
          border-radius: 4px;
          text-align: center;
          width: fit-content;
        }

        .address {
          font-family: monospace;
          font-size: 13px;
          color: #6b7280;
        }

        .tokens {
          font-size: 13px;
          font-weight: 500;
        }

        .amount {
          font-size: 13px;
          font-weight: 500;
        }

        .status {
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 4px;
          text-align: center;
          width: fit-content;
        }

        .status.success {
          background: #d1fae5;
          color: #065f46;
        }

        .status.failed {
          background: #fee2e2;
          color: #991b1b;
        }

        .status.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .hash-link {
          font-family: monospace;
          font-size: 13px;
          color: #3b82f6;
          text-decoration: none;
        }

        .hash-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}

function AlertsTab({ alerts, monitoring }: { alerts: Alert[], monitoring: any }) {
  const unresolvedAlerts = alerts.filter(alert => !alert.resolved)
  const resolvedAlerts = alerts.filter(alert => alert.resolved)

  return (
    <div className="alerts-tab">
      {unresolvedAlerts.length > 0 && (
        <div className="alerts-section">
          <h3>🚨 Активные алерты ({unresolvedAlerts.length})</h3>
          <div className="alerts-list">
            {unresolvedAlerts.map(alert => (
              <AlertItem key={alert.id} alert={alert} monitoring={monitoring} />
            ))}
          </div>
        </div>
      )}

      {resolvedAlerts.length > 0 && (
        <div className="alerts-section">
          <h3>✅ Разрешенные алерты ({resolvedAlerts.length})</h3>
          <div className="alerts-list">
            {resolvedAlerts.map(alert => (
              <AlertItem key={alert.id} alert={alert} monitoring={monitoring} />
            ))}
          </div>
        </div>
      )}

      {alerts.length === 0 && (
        <div className="no-alerts">
          <div className="no-alerts-icon">🎉</div>
          <div className="no-alerts-text">Алертов нет!</div>
        </div>
      )}

      <style jsx>{`
        .alerts-section {
          margin-bottom: 30px;
        }

        .alerts-section h3 {
          margin: 0 0 15px 0;
          color: #1f2937;
        }

        .alerts-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .no-alerts {
          text-align: center;
          padding: 60px 20px;
          color: #6b7280;
        }

        .no-alerts-icon {
          font-size: 48px;
          margin-bottom: 10px;
        }

        .no-alerts-text {
          font-size: 18px;
          font-weight: 500;
        }
      `}</style>
    </div>
  )
}

function AlertItem({ alert, monitoring }: { alert: Alert, monitoring: any }) {
  const levelColors = {
    info: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
    warning: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
    error: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
    critical: { bg: '#fecaca', border: '#dc2626', text: '#7f1d1d' }
  }

  const colors = levelColors[alert.level]

  return (
    <div className="alert-item" style={{ 
      backgroundColor: colors.bg, 
      borderLeftColor: colors.border 
    }}>
      <div className="alert-header">
        <div className="alert-title" style={{ color: colors.text }}>
          {alert.title}
        </div>
        <div className="alert-meta">
          <span className="alert-level">{alert.level.toUpperCase()}</span>
          <span className="alert-time">
            {new Date(alert.timestamp).toLocaleString('ru-RU')}
          </span>
        </div>
      </div>
      
      <div className="alert-message">{alert.message}</div>
      
      {alert.metadata && (
        <div className="alert-metadata">
          <details>
            <summary>Дополнительная информация</summary>
            <pre>{JSON.stringify(alert.metadata, null, 2)}</pre>
          </details>
        </div>
      )}
      
      <div className="alert-actions">
        {!alert.resolved && (
          <button 
            onClick={() => monitoring.resolveAlert(alert.id)}
            className="resolve-button"
          >
            Разрешить
          </button>
        )}
        {alert.resolved && (
          <span className="resolved-badge">
            Разрешено {new Date(alert.resolvedAt!).toLocaleString('ru-RU')}
          </span>
        )}
      </div>

      <style jsx>{`
        .alert-item {
          border: 1px solid #e5e7eb;
          border-left: 4px solid;
          border-radius: 6px;
          padding: 15px;
          opacity: ${alert.resolved ? 0.7 : 1};
        }

        .alert-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }

        .alert-title {
          font-weight: 600;
          font-size: 16px;
        }

        .alert-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .alert-level {
          font-size: 11px;
          font-weight: 700;
          padding: 2px 6px;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
        }

        .alert-time {
          font-size: 12px;
          color: #6b7280;
        }

        .alert-message {
          color: #374151;
          margin-bottom: 10px;
          line-height: 1.4;
        }

        .alert-metadata {
          margin-bottom: 10px;
        }

        .alert-metadata details {
          font-size: 12px;
        }

        .alert-metadata pre {
          background: rgba(0, 0, 0, 0.05);
          padding: 8px;
          border-radius: 4px;
          margin-top: 5px;
          overflow-x: auto;
        }

        .alert-actions {
          display: flex;
          justify-content: flex-end;
          align-items: center;
        }

        .resolve-button {
          background: #10b981;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .resolve-button:hover {
          background: #059669;
        }

        .resolved-badge {
          font-size: 12px;
          color: #6b7280;
          font-style: italic;
        }
      `}</style>
    </div>
  )
}

function MetricsTab({ stats }: { stats: any }) {
  return (
    <div className="metrics-tab">
      <div className="metrics-grid">
        <div className="metric-card">
          <h4>📈 Производительность</h4>
          <div className="metric-items">
            <div className="metric-item">
              <span>Успешность транзакций:</span>
              <span>{stats.totalTransactions > 0 ? (stats.successfulTransactions / stats.totalTransactions * 100).toFixed(1) : '100.0'}%</span>
            </div>
            <div className="metric-item">
              <span>Средний газ:</span>
              <span>{stats.averageGasUsed.toLocaleString()}</span>
            </div>
            <div className="metric-item">
              <span>Ожидающих транзакций:</span>
              <span>{stats.pendingTransactions}</span>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <h4>🛡️ Безопасность</h4>
          <div className="metric-items">
            <div className="metric-item">
              <span>Критичных алертов:</span>
              <span className="critical">{stats.criticalAlerts}</span>
            </div>
            <div className="metric-item">
              <span>Алертов ошибок:</span>
              <span className="error">{stats.errorAlerts}</span>
            </div>
            <div className="metric-item">
              <span>Предупреждений:</span>
              <span className="warning">{stats.warningAlerts}</span>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <h4>💼 Бизнес-метрики</h4>
          <div className="metric-items">
            <div className="metric-item">
              <span>Общий объем:</span>
              <span>{stats.totalVolume.toFixed(4)} ETH</span>
            </div>
            <div className="metric-item">
              <span>Всего транзакций:</span>
              <span>{stats.totalTransactions}</span>
            </div>
            <div className="metric-item">
              <span>Неудачных транзакций:</span>
              <span>{stats.failedTransactions}</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .metric-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
        }

        .metric-card h4 {
          margin: 0 0 15px 0;
          color: #1f2937;
          font-size: 16px;
        }

        .metric-items {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .metric-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .metric-item:last-child {
          border-bottom: none;
        }

        .metric-item span:first-child {
          color: #6b7280;
        }

        .metric-item span:last-child {
          font-weight: 600;
          color: #1f2937;
        }

        .critical {
          color: #dc2626 !important;
        }

        .error {
          color: #ef4444 !important;
        }

        .warning {
          color: #f59e0b !important;
        }
      `}</style>
    </div>
  )
}
