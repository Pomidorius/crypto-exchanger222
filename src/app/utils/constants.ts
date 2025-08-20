/**  
 * Адрес ProxySwap для разных сетей
 */

// Определяем, в какой сети мы работаем
const getNetworkConfig = () => {
  // Всегда используем environment variables для определения сети
  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID || '1';
  return {
    chainId,
    isMainnet: chainId === '1',
    isSepolia: chainId === '11155111',
    isLocalhost: chainId === '31337'
  };
};

const network = getNetworkConfig();

// Отладочная информация
console.log('🔍 Network config:', {
  chainId: network.chainId,
  isLocalhost: network.isLocalhost,
  NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID
});

// Адреса контрактов для разных сетей
const CONTRACT_ADDRESSES = {
  // Localhost (для разработки)
  '31337': '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
  // Sepolia (для тестирования на Vercel)
  '11155111': process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA || '0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43',
  // Mainnet (для продакшена)
  '1': process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_MAINNET || '0x0000000000000000000000000000000000000001'
};

export const PROXY_SWAP_ADDRESS = CONTRACT_ADDRESSES[network.chainId as keyof typeof CONTRACT_ADDRESSES] || '0x0000000000000000000000000000000000000001';

console.log('🔍 Contract address:', PROXY_SWAP_ADDRESS, 'for chainId:', network.chainId);

// Константа для проверки что контракт задеплоен
export const TEMP_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000001';
export const isContractDeployed = () => {
  const deployed = PROXY_SWAP_ADDRESS !== TEMP_CONTRACT_ADDRESS;
  console.log('🔍 isContractDeployed called:', deployed, 'address:', PROXY_SWAP_ADDRESS);
  return deployed;
};

/**
 * Карта токенов для разных сетей
 */
export interface TokenInfo {
  address: string
  decimals: number
  symbol: string
}

// Токены для разных сетей
const TOKEN_ADDRESSES = {
  // Mainnet
  '1': {
    'ETH': { address: '0x0000000000000000000000000000000000000000', decimals: 18, symbol: 'ETH' },
    'WETH': { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', decimals: 18, symbol: 'WETH' },
    'USDC': { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6, symbol: 'USDC' },
    'USDT': { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6, symbol: 'USDT' }
  },
  // Sepolia testnet - обновленные адреса
  '11155111': {
    'ETH': { address: '0x0000000000000000000000000000000000000000', decimals: 18, symbol: 'ETH' },
    'WETH': { address: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9', decimals: 18, symbol: 'WETH' },
    'USDC': { address: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8', decimals: 6, symbol: 'USDC' },
    'USDT': { address: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0', decimals: 6, symbol: 'USDT' }
  },
  // Localhost (mock addresses)
  '31337': {
    'ETH': { address: '0x0000000000000000000000000000000000000000', decimals: 18, symbol: 'ETH' },
    'WETH': { address: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0', decimals: 18, symbol: 'WETH' },
    'USDC': { address: '0x5FbDB2315678afecb367f032d93F642f64180aa3', decimals: 6, symbol: 'USDC' },
    'USDT': { address: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', decimals: 6, symbol: 'USDT' }
  }
};

export const TokenMap: Record<string, TokenInfo> = TOKEN_ADDRESSES[network.chainId as keyof typeof TOKEN_ADDRESSES] || TOKEN_ADDRESSES['1'];

console.log('🔍 Token map for chainId', network.chainId, ':', TokenMap);

// Uniswap адреса для разных сетей
const UNISWAP_ADDRESSES = {
  // Mainnet
  '1': {
    V2_ROUTER: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    V3_ROUTER: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    V3_QUOTER: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'
  },
  // Sepolia testnet
  '11155111': {
    V2_ROUTER: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    V3_ROUTER: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    V3_QUOTER: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'
  },
  // Localhost (same as mainnet for testing)
  '31337': {
    V2_ROUTER: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    V3_ROUTER: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    V3_QUOTER: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'
  }
};

const uniswapConfig = UNISWAP_ADDRESSES[network.chainId as keyof typeof UNISWAP_ADDRESSES] || UNISWAP_ADDRESSES['1'];

export const UNISWAP_V2_ROUTER = uniswapConfig.V2_ROUTER;
export const UNISWAP_V3_ROUTER = uniswapConfig.V3_ROUTER;
export const UNISWAP_V3_QUOTER = uniswapConfig.V3_QUOTER;

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
