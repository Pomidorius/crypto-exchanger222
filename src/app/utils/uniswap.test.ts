import { quoteExactInput, TokenMap } from './uniswap'
import { BigNumber } from 'ethers'

// Мокаем контракт quoter, чтобы любой вызов quoteExactInputSingle возвращал 12345n
jest.mock('ethers', () => {
  const original = jest.requireActual('ethers')
  return {
    ...original,
    providers: {
      JsonRpcProvider: jest.fn().mockImplementation(() => ({})),
    },
    Contract: jest.fn().mockImplementation(() => ({
      // мок метода quoteExactInputSingle
      quoteExactInputSingle: jest.fn().mockResolvedValue(BigInt(12345)),
    })),
  }
})

describe('quoteExactInput util', () => {
  it('should throw on unsupported token', async () => {
    await expect(
      quoteExactInput('FOO', 'BAR', '1', 0.5)
    ).rejects.toThrow(/Unsupported token/)
  })

  it('should return quotedAmount and protocolFee=0', async () => {
    const result = await quoteExactInput('ETH', 'USDC', '2', 1)
    expect(result).toEqual({
      quotedAmount: '12345', // из мока
      protocolFee: '0',
    })
  })
})
