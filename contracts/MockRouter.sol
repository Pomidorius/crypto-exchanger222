// contracts/MockRouter.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// Нужный нам «минимальный» интерфейс с одним методом
interface ISwapRouterMinimal {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24  fee;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    function exactInputSingle(
        ExactInputSingleParams calldata params
    ) external payable returns (uint256 amountOut);
}

contract MockRouter is ISwapRouterMinimal {
    
    constructor() {
        // Пустой конструктор
    }

    /// Мок функция - просто возвращает фиксированный результат
    /// Не переводит реальные токены, только эмулирует успешный свап
    function exactInputSingle(
        ExactInputSingleParams calldata params
    ) external payable override returns (uint256) {
        // Для мока просто возвращаем входящую сумму (1:1 обмен)
        // В реальности здесь был бы сложный алгоритм Uniswap
        uint256 mockOutput = params.amountIn;
        
        // Убеждаемся что вернем хотя бы минимальную сумму
        require(mockOutput >= params.amountOutMinimum, "Insufficient output amount");
        
        return mockOutput;
    }
}
