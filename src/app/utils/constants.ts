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
    address: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', // Sepolia WETH
    decimals: 18,
    symbol: 'WETH'
  },
  'USDC': {
    address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Sepolia USDC
    decimals: 6,
    symbol: 'USDC'
  },
  'USDT': {
    address: '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06', // Sepolia USDT (example)
    decimals: 6,
    symbol: 'USDT'
  }
};

// Uniswap Routers and Quoter (Sepolia testnet)
export const UNISWAP_V2_ROUTER = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'; // V2 Router на Sepolia
export const UNISWAP_V3_ROUTER = '0xE592427A0AEce92De3Edee1F18E0157C05861564'; // V3 Router на Sepolia
export const UNISWAP_V3_QUOTER = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'; // V3 Quoter на Sepolia

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
