// src/utils/slippage.ts
import { BigNumber } from 'ethers'

/**
 * Рассчитать минимальный выход с учётом slippage% (например, 0.5 => 0.5%)
 * quoted и slippageFactor в базисных пунктах: 10000 = 100%
 */
export function calcMinOut(
  quoted: BigNumber,
  slippagePercent: number
): BigNumber {
  const factor = BigNumber.from(10000 - Math.floor(slippagePercent * 100))
  return quoted.mul(factor).div(10000)
}
