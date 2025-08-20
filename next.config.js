/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Отключаем Hardhat-зависимые компоненты на production
  env: {
    DISABLE_HARDHAT_COMPONENTS: process.env.NODE_ENV === 'production' ? 'true' : 'false',
  },
  
  // Webpack конфигурация для Web3
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }
    
    // Исключаем node-специфичные модули из сборки
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push({
        'utf-8-validate': 'commonjs utf-8-validate',
        'bufferutil': 'commonjs bufferutil',
      });
    }
    
    return config;
  },
  
  // Experimental features для лучшей совместимости
  experimental: {
    esmExternals: 'loose',
  },
};

module.exports = nextConfig;
