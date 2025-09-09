// src/app/utils/monitoring.ts
import { ethers } from 'ethers'

/**
 * Система мониторинга и логирования для crypto exchanger
 */

export interface TransactionLog {
  id: string
  type: 'swap' | 'mint' | 'approve' | 'error'
  userAddress: string
  txHash?: string
  fromToken?: string
  toToken?: string
  amount?: string
  gasUsed?: string
  gasPrice?: string
  status: 'pending' | 'success' | 'failed'
  error?: string
  timestamp: number
  blockNumber?: number
  networkId: string
}

export interface SystemMetric {
  id: string
  name: string
  value: number | string
  unit?: string
  timestamp: number
  category: 'performance' | 'security' | 'business' | 'technical'
}

export interface Alert {
  id: string
  level: 'info' | 'warning' | 'error' | 'critical'
  title: string
  message: string
  timestamp: number
  resolved?: boolean
  resolvedAt?: number
  metadata?: any
}

class MonitoringService {
  private logs: TransactionLog[] = []
  private metrics: SystemMetric[] = []
  private alerts: Alert[] = []
  private maxLogs = 1000
  private maxMetrics = 500
  private maxAlerts = 100

  constructor() {
    this.loadFromStorage()
    this.startPeriodicTasks()
  }

  /**
   * Логирование транзакции
   */
  logTransaction(log: Omit<TransactionLog, 'id' | 'timestamp'>): string {
    const transactionLog: TransactionLog = {
      ...log,
      id: this.generateId(),
      timestamp: Date.now()
    }

    this.logs.unshift(transactionLog)
    
    // Ограничиваем количество логов
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }

    this.saveToStorage()
    this.checkForAlerts(transactionLog)
    
    console.log('📊 Transaction logged:', transactionLog)
    return transactionLog.id
  }

  /**
   * Обновление статуса транзакции
   */
  updateTransactionStatus(
    id: string, 
    updates: Partial<Pick<TransactionLog, 'status' | 'txHash' | 'error' | 'gasUsed' | 'blockNumber'>>
  ) {
    const logIndex = this.logs.findIndex(log => log.id === id)
    if (logIndex !== -1) {
      this.logs[logIndex] = { ...this.logs[logIndex], ...updates }
      this.saveToStorage()
      
      if (updates.status === 'failed' && updates.error) {
        this.createAlert('error', 'Транзакция не удалась', updates.error, { transactionId: id })
      }
    }
  }

  /**
   * Запись метрики
   */
  recordMetric(
    name: string,
    value: number | string,
    category: SystemMetric['category'] = 'technical',
    unit?: string
  ): string {
    const metric: SystemMetric = {
      id: this.generateId(),
      name,
      value,
      unit,
      category,
      timestamp: Date.now()
    }

    this.metrics.unshift(metric)
    
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(0, this.maxMetrics)
    }

    this.saveToStorage()
    return metric.id
  }

  /**
   * Создание алерта
   */
  createAlert(
    level: Alert['level'],
    title: string,
    message: string,
    metadata?: any
  ): string {
    const alert: Alert = {
      id: this.generateId(),
      level,
      title,
      message,
      timestamp: Date.now(),
      metadata
    }

    this.alerts.unshift(alert)
    
    if (this.alerts.length > this.maxAlerts) {
      this.alerts = this.alerts.slice(0, this.maxAlerts)
    }

    this.saveToStorage()
    this.notifyAlert(alert)
    
    console.warn(`🚨 Alert created [${level.toUpperCase()}]: ${title}`, alert)
    return alert.id
  }

  /**
   * Разрешение алерта
   */
  resolveAlert(id: string) {
    const alertIndex = this.alerts.findIndex(alert => alert.id === id)
    if (alertIndex !== -1) {
      this.alerts[alertIndex].resolved = true
      this.alerts[alertIndex].resolvedAt = Date.now()
      this.saveToStorage()
    }
  }

  /**
   * Получение статистики
   */
  getStats(timeRange: 'hour' | 'day' | 'week' = 'day') {
    const now = Date.now()
    const timeRangeMs = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000
    }[timeRange]

    const cutoff = now - timeRangeMs
    const recentLogs = this.logs.filter(log => log.timestamp > cutoff)
    const recentAlerts = this.alerts.filter(alert => alert.timestamp > cutoff)

    const stats = {
      totalTransactions: recentLogs.length,
      successfulTransactions: recentLogs.filter(log => log.status === 'success').length,
      failedTransactions: recentLogs.filter(log => log.status === 'failed').length,
      pendingTransactions: recentLogs.filter(log => log.status === 'pending').length,
      totalAlerts: recentAlerts.length,
      criticalAlerts: recentAlerts.filter(alert => alert.level === 'critical').length,
      errorAlerts: recentAlerts.filter(alert => alert.level === 'error').length,
      warningAlerts: recentAlerts.filter(alert => alert.level === 'warning').length,
      averageGasUsed: this.calculateAverageGas(recentLogs),
      totalVolume: this.calculateTotalVolume(recentLogs),
      topTokens: this.getTopTokens(recentLogs)
    }

    return stats
  }

  /**
   * Получение логов
   */
  getLogs(filter?: {
    type?: TransactionLog['type']
    status?: TransactionLog['status']
    userAddress?: string
    limit?: number
  }) {
    let filteredLogs = this.logs

    if (filter) {
      if (filter.type) {
        filteredLogs = filteredLogs.filter(log => log.type === filter.type)
      }
      if (filter.status) {
        filteredLogs = filteredLogs.filter(log => log.status === filter.status)
      }
      if (filter.userAddress) {
        filteredLogs = filteredLogs.filter(log => 
          log.userAddress.toLowerCase() === filter.userAddress!.toLowerCase()
        )
      }
    }

    return filter?.limit ? filteredLogs.slice(0, filter.limit) : filteredLogs
  }

  /**
   * Получение алертов
   */
  getAlerts(filter?: {
    level?: Alert['level']
    resolved?: boolean
    limit?: number
  }) {
    let filteredAlerts = this.alerts

    if (filter) {
      if (filter.level) {
        filteredAlerts = filteredAlerts.filter(alert => alert.level === filter.level)
      }
      if (filter.resolved !== undefined) {
        filteredAlerts = filteredAlerts.filter(alert => !!alert.resolved === filter.resolved)
      }
    }

    return filter?.limit ? filteredAlerts.slice(0, filter.limit) : filteredAlerts
  }

  /**
   * Экспорт данных для анализа
   */
  exportData() {
    return {
      logs: this.logs,
      metrics: this.metrics,
      alerts: this.alerts,
      stats: this.getStats('week'),
      exportedAt: Date.now()
    }
  }

  // Приватные методы

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private loadFromStorage() {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('monitoring-data')
        if (stored) {
          const data = JSON.parse(stored)
          this.logs = data.logs || []
          this.metrics = data.metrics || []
          this.alerts = data.alerts || []
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки данных мониторинга:', error)
    }
  }

  private saveToStorage() {
    try {
      if (typeof window !== 'undefined') {
        const data = {
          logs: this.logs,
          metrics: this.metrics,
          alerts: this.alerts,
          lastSaved: Date.now()
        }
        localStorage.setItem('monitoring-data', JSON.stringify(data))
      }
    } catch (error) {
      console.error('Ошибка сохранения данных мониторинга:', error)
    }
  }

  private checkForAlerts(log: TransactionLog) {
    // Проверяем различные условия для создания алертов
    
    // Высокая цена газа
    if (log.gasPrice) {
      const gasPriceGwei = parseFloat(ethers.utils.formatUnits(log.gasPrice, 'gwei'))
      if (gasPriceGwei > 100) {
        this.createAlert(
          'warning',
          'Высокая цена газа',
          `Транзакция выполнена с ценой газа ${gasPriceGwei.toFixed(1)} gwei`,
          { transactionId: log.id, gasPrice: gasPriceGwei }
        )
      }
    }

    // Большая сумма
    if (log.amount && log.fromToken === 'ETH') {
      const amount = parseFloat(log.amount)
      if (amount > 5) {
        this.createAlert(
          'warning',
          'Большая сумма транзакции',
          `Транзакция на сумму ${amount} ETH`,
          { transactionId: log.id, amount }
        )
      }
    }

    // Частые транзакции от одного пользователя
    const recentUserLogs = this.logs.filter(l => 
      l.userAddress === log.userAddress && 
      Date.now() - l.timestamp < 300000 // 5 минут
    )
    
    if (recentUserLogs.length > 5) {
      this.createAlert(
        'info',
        'Активная торговля',
        `Пользователь ${log.userAddress.slice(0, 6)}...${log.userAddress.slice(-4)} совершил ${recentUserLogs.length} транзакций за 5 минут`,
        { userAddress: log.userAddress, transactionCount: recentUserLogs.length }
      )
    }
  }

  private notifyAlert(alert: Alert) {
    // Отправка уведомлений
    
    // Telegram (если настроен)
    if (process.env.TELEGRAM_BOT_TOKEN && alert.level === 'critical') {
      this.sendTelegramAlert(alert)
    }

    // Browser notification
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted' && alert.level === 'error') {
        new Notification(alert.title, {
          body: alert.message,
          icon: '/favicon.ico'
        })
      }
    }

    // Console log
    const emoji = {
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌',
      critical: '🚨'
    }[alert.level]
    
    console.log(`${emoji} [${alert.level.toUpperCase()}] ${alert.title}: ${alert.message}`)
  }

  private async sendTelegramAlert(alert: Alert) {
    try {
      const botToken = process.env.TELEGRAM_BOT_TOKEN
      const chatId = process.env.TELEGRAM_CHAT_ID
      
      if (!botToken || !chatId) return

      const message = `🚨 *CRITICAL ALERT*\n\n*${alert.title}*\n${alert.message}\n\nTime: ${new Date(alert.timestamp).toISOString()}`
      
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown'
        })
      })
    } catch (error) {
      console.error('Ошибка отправки Telegram уведомления:', error)
    }
  }

  private calculateAverageGas(logs: TransactionLog[]): number {
    const logsWithGas = logs.filter(log => log.gasUsed)
    if (logsWithGas.length === 0) return 0
    
    const totalGas = logsWithGas.reduce((sum, log) => sum + parseInt(log.gasUsed!), 0)
    return Math.round(totalGas / logsWithGas.length)
  }

  private calculateTotalVolume(logs: TransactionLog[]): number {
    return logs
      .filter(log => log.amount && log.fromToken === 'ETH')
      .reduce((sum, log) => sum + parseFloat(log.amount!), 0)
  }

  private getTopTokens(logs: TransactionLog[]) {
    const tokenCounts: Record<string, number> = {}
    
    logs.forEach(log => {
      if (log.fromToken) tokenCounts[log.fromToken] = (tokenCounts[log.fromToken] || 0) + 1
      if (log.toToken) tokenCounts[log.toToken] = (tokenCounts[log.toToken] || 0) + 1
    })
    
    return Object.entries(tokenCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([token, count]) => ({ token, count }))
  }

  private startPeriodicTasks() {
    // Периодическая очистка старых данных
    setInterval(() => {
      const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000) // 7 дней
      
      this.logs = this.logs.filter(log => log.timestamp > cutoff)
      this.metrics = this.metrics.filter(metric => metric.timestamp > cutoff)
      this.alerts = this.alerts.filter(alert => alert.timestamp > cutoff)
      
      this.saveToStorage()
    }, 60 * 60 * 1000) // каждый час

    // Периодическая запись системных метрик
    setInterval(() => {
      this.recordSystemMetrics()
    }, 5 * 60 * 1000) // каждые 5 минут
  }

  private recordSystemMetrics() {
    try {
      // Метрики производительности
      if (typeof window !== 'undefined' && 'performance' in window) {
        const memory = (performance as any).memory
        if (memory) {
          this.recordMetric('heap_used', memory.usedJSHeapSize, 'performance', 'bytes')
          this.recordMetric('heap_total', memory.totalJSHeapSize, 'performance', 'bytes')
        }
      }

      // Метрики бизнеса
      const stats = this.getStats('hour')
      this.recordMetric('transactions_per_hour', stats.totalTransactions, 'business', 'count')
      this.recordMetric('success_rate', 
        stats.totalTransactions > 0 ? (stats.successfulTransactions / stats.totalTransactions * 100) : 100, 
        'business', 
        '%'
      )
      
    } catch (error) {
      console.error('Ошибка записи системных метрик:', error)
    }
  }
}

// Глобальный экземпляр сервиса мониторинга
export const monitoring = new MonitoringService()

/**
 * Хуки для использования в React компонентах
 */
export function useMonitoring() {
  return {
    logTransaction: (log: Omit<TransactionLog, 'id' | 'timestamp'>) => monitoring.logTransaction(log),
    updateTransaction: (id: string, updates: Parameters<typeof monitoring.updateTransactionStatus>[1]) => 
      monitoring.updateTransactionStatus(id, updates),
    recordMetric: (name: string, value: number | string, category?: SystemMetric['category'], unit?: string) =>
      monitoring.recordMetric(name, value, category, unit),
    createAlert: (level: Alert['level'], title: string, message: string, metadata?: any) =>
      monitoring.createAlert(level, title, message, metadata),
    getStats: (timeRange?: 'hour' | 'day' | 'week') => monitoring.getStats(timeRange),
    getLogs: (filter?: Parameters<typeof monitoring.getLogs>[0]) => monitoring.getLogs(filter),
    getAlerts: (filter?: Parameters<typeof monitoring.getAlerts>[0]) => monitoring.getAlerts(filter)
  }
}
