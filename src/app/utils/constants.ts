/**  
 * Адрес ProxySwap, задеплоенного у вас локально или в Sepolia/Goerli.  
 * Замените на нужный адрес после деплоя.  
 */
// Временный адрес для предотвращения ENS ошибки (замените после деплоя)
export const PROXY_SWAP_ADDRESS = '0x0000000000000000000000000000000000000001';

// Константа для проверки что контракт задеплоен
export const TEMP_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000001';
export const isContractDeployed = () => PROXY_SWAP_ADDRESS !== TEMP_CONTRACT_ADDRESS;

/**
 * Карта токенов для локального тестирования
 */
export interface TokenInfo {
  address: string
  decimals: number
  symbol: string
}

export const TokenMap: Record<string, TokenInfo> = {
  'ETH': {
    address: '0x0000000000000000000000000000000000000000',
    decimals: 18,
    symbol: 'ETH'
  },
  'WETH': {
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    decimals: 18,
    symbol: 'WETH'
  },
  'USDC': {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    decimals: 6,
    symbol: 'USDC'
  },
  'USDT': {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6,
    symbol: 'USDT'
  }
};

// Uniswap Routers and Quoter (mainnet)
export const UNISWAP_V2_ROUTER = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
export const UNISWAP_V3_ROUTER = '0xE592427A0AEce92De3Edee1F18E0157C05861564';
export const UNISWAP_V3_QUOTER = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6';

/**
 * Минимальный ABI для SimpleProxySwap — упрощенная версия для локального тестирования.
 */
export const ProxySwapAbi = [
  // Token → Token
  'function swapExactInputSingle(address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOutMinimum) external returns (uint256)',
  // ETH → Token
  'function swapExactETHForTokens(address tokenOut, uint256 amountOutMinimum) external payable returns (uint256)',
  // Token → ETH
  'function swapExactTokensForETH(address tokenIn, uint256 amountIn, uint256 amountOutMinimum) external returns (uint256)',
  // Utility functions
  'function setExchangeRate(address tokenIn, address tokenOut, uint256 rate) external',
  'function fundContract() external payable',
  'function fundTokens(address token, uint256 amount) external'
] as const;
