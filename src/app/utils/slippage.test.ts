// src/utils/slippage.test.ts
import { calcMinOut } from './slippage'
import { BigNumber } from 'ethers'

describe('calcMinOut', () => {
  it('0% slippage returns quoted unchanged', () => {
    const quoted = BigNumber.from(1000)
    expect(calcMinOut(quoted, 0).toString()).toBe('1000')
  })

  it('1% slippage deducts 1%', () => {
    const quoted = BigNumber.from(1000)
    // 1000 * (10000 - 100) / 10000 = 1000 * 9900 / 10000 = 990
    expect(calcMinOut(quoted, 1).toString()).toBe('990')
  })

  it('0.5% slippage deducts 0.5%', () => {
    const quoted = BigNumber.from(2000)
    // 2000 * 9950 / 10000 = 1990
    expect(calcMinOut(quoted, 0.5).toString()).toBe('1990')
  })
})
