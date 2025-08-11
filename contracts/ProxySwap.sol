// contracts/ProxySwap.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ProxySwap {
    ISwapRouter public immutable swapRouter;
    address    public immutable owner;
    uint24     public constant POOL_FEE = 3000; // 0.3%

    // 0.1% комиссия → 1 / 1000
    uint256 public constant FEE_NUM = 1;
    uint256 public constant FEE_DEN = 1000;

    constructor(address _swapRouter) {
        swapRouter = ISwapRouter(_swapRouter);
        owner      = msg.sender;
    }

    /// @notice Свопит точную сумму tokenIn → tokenOut
    function swapExactInputSingle(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMinimum
    ) external returns (uint256 amountOutActual) {
        require(amountIn > 0, "AmountIn zero");

        // 1) переводим токены от пользователя
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);

        // 2) удерживаем 0.1%
        uint256 feeAmount      = (amountIn * FEE_NUM) / FEE_DEN;
        uint256 amountAfterFee = amountIn - feeAmount;

        // 3) отправляем комиссию владельцу
        IERC20(tokenIn).transfer(owner, feeAmount);

        // 4) разрешаем Router’у списать остаток
        IERC20(tokenIn).approve(address(swapRouter), amountAfterFee);

        // 5) параметры для Uniswap V3
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn:           tokenIn,
                tokenOut:          tokenOut,
                fee:               POOL_FEE,
                recipient:         msg.sender,
                deadline:          block.timestamp,
                amountIn:          amountAfterFee,
                amountOutMinimum:  amountOutMinimum,
                sqrtPriceLimitX96: 0
            });

        // 6) выполняем swap
        amountOutActual = swapRouter.exactInputSingle(params);
    }

    /// @notice Свопит ETH → токен
    function swapExactETHForTokens(
        address tokenOut,
        uint256 amountOutMinimum
    ) external payable returns (uint256 amountOutActual) {
        require(msg.value > 0, "ETH amount zero");
        
        // 1) удерживаем 0.1% комиссии
        uint256 feeAmount = (msg.value * FEE_NUM) / FEE_DEN;
        uint256 amountAfterFee = msg.value - feeAmount;
        
        // 2) отправляем комиссию владельцу
        payable(owner).transfer(feeAmount);
        
        // 3) параметры для свапа
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2, // WETH
                tokenOut: tokenOut,
                fee: POOL_FEE,
                recipient: msg.sender,
                deadline: block.timestamp,
                amountIn: amountAfterFee,
                amountOutMinimum: amountOutMinimum,
                sqrtPriceLimitX96: 0
            });
        
        amountOutActual = swapRouter.exactInputSingle{value: amountAfterFee}(params);
    }

    /// @notice Свопит токен → ETH  
    function swapExactTokensForETH(
        address tokenIn,
        uint256 amountIn,
        uint256 amountOutMinimum
    ) external returns (uint256 amountOutActual) {
        require(amountIn > 0, "AmountIn zero");
        
        // 1) переводим токены от пользователя
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        
        // 2) удерживаем комиссию
        uint256 feeAmount = (amountIn * FEE_NUM) / FEE_DEN;
        uint256 amountAfterFee = amountIn - feeAmount;
        
        // 3) отправляем комиссию владельцу
        IERC20(tokenIn).transfer(owner, feeAmount);
        
        // 4) разрешаем Router'у списать
        IERC20(tokenIn).approve(address(swapRouter), amountAfterFee);
        
        // 5) свап на WETH
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: tokenIn,
                tokenOut: 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2, // WETH
                fee: POOL_FEE,
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: amountAfterFee,
                amountOutMinimum: amountOutMinimum,
                sqrtPriceLimitX96: 0
            });
        
        amountOutActual = swapRouter.exactInputSingle(params);
        
        // 6) конвертируем WETH в ETH и отправляем пользователю
        IWETH(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2).withdraw(amountOutActual);
        payable(msg.sender).transfer(amountOutActual);
    }

    // Для получения ETH при unwrap WETH
    receive() external payable {}
}

// Интерфейс WETH
interface IWETH {
    function withdraw(uint256) external;
}
