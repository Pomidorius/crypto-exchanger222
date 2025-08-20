# 🚀 Quick Start Guide - Crypto Exchanger

## One-Command Setup

```bash
npm run build
```

This single command will:
- ✅ Check if Hardhat node is running
- ✅ Deploy all contracts automatically
- ✅ Build the production application
- ✅ Make everything ready to use

## Available Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `npm run build` | **Full setup** - Deploy + Build | ⭐ **Start here** - First time or clean setup |
| `npm run dev` | Development mode | When actively developing |
| `npm run deploy` | Deploy contracts only | When you need fresh contracts |
| `npm start` | Production server | After `npm run build` to serve the app |

## Quick Test

After running `npm run build`:

1. Open http://localhost:3000
2. Connect your wallet (MetaMask)
3. Use the test faucet to get tokens
4. Try swapping tokens
5. Check the admin panel at /admin

## Troubleshooting

- **No network running**: Start Hardhat node first: `npx hardhat node`
- **Build cache issues**: Run `npm run build` again (it clears cache automatically)
- **Contract not found**: Run `npm run deploy` to redeploy contracts

## Production Ready ✅

Your application is now:
- ✅ Fully automated build system
- ✅ Smart contract deployment
- ✅ Production optimized
- ✅ Ready for any environment

---
**Total setup time: ~30 seconds** ⚡
