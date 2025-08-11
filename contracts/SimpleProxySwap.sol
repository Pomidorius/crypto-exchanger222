// contracts/SimpleProxySwap.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Интерфейс WETH для обертывания/развертывания ETH
interface IWETH {
    function deposit() external payable;
    function withdraw(uint wad) external;
    function transfer(address to, uint value) external returns (bool);
    function transferFrom(address from, address to, uint value) external returns (bool);
    function balanceOf(address owner) external view returns (uint);
}

contract SimpleProxySwap {
    address public immutable owner;
    
    // 0.1% комиссия
    uint256 public constant FEE_NUM = 1;
    uint256 public constant FEE_DEN = 1000;
    
    // Мок курсы обмена (для локального тестирования)
    mapping(address => mapping(address => uint256)) public exchangeRates;
    
    constructor() {
        owner = msg.sender;
    }
    
    // Установка курсов обмена (только для тестирования)
    function setExchangeRate(address tokenIn, address tokenOut, uint256 rate) external {
        require(msg.sender == owner, "Only owner");
        exchangeRates[tokenIn][tokenOut] = rate;
    }
    
    /// @notice Свопит точную сумму токена в токен
    function swapExactInputSingle(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMinimum
    ) external returns (uint256 amountOut) {
        require(amountIn > 0, "AmountIn zero");
        
        // Переводим токены от пользователя
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        
        // Удерживаем комиссию 0.1%
        uint256 feeAmount = (amountIn * FEE_NUM) / FEE_DEN;
        uint256 amountAfterFee = amountIn - feeAmount;
        
        // Отправляем комиссию владельцу
        IERC20(tokenIn).transfer(owner, feeAmount);
        
        // Рассчитываем выходную сумму по мок курсу
        uint256 rate = exchangeRates[tokenIn][tokenOut];
        require(rate > 0, "No exchange rate set");
        
        amountOut = (amountAfterFee * rate) / 1e18; // rate в wei, нормализуем
        require(amountOut >= amountOutMinimum, "Insufficient output amount");
        
        // Отправляем токены пользователю
        IERC20(tokenOut).transfer(msg.sender, amountOut);
    }
    
    /// @notice Свопит ETH в токены
    function swapExactETHForTokens(
        address tokenOut,
        uint256 amountOutMinimum
    ) external payable returns (uint256 amountOut) {
        require(msg.value > 0, "No ETH sent");
        
        // Удерживаем комиссию 0.1%
        uint256 feeAmount = (msg.value * FEE_NUM) / FEE_DEN;
        uint256 amountAfterFee = msg.value - feeAmount;
        
        // Отправляем комиссию владельцу
        payable(owner).transfer(feeAmount);
        
        // Рассчитываем выходную сумму
        // Используем специальный адрес для ETH
        address ethAddress = address(0);
        uint256 rate = exchangeRates[ethAddress][tokenOut];
        require(rate > 0, "No exchange rate set");
        
        // Упрощенный расчет: 1 ETH = 2000 USDT/USDC
        // amountAfterFee в wei (1e18), нужно получить токены в их decimals
        if (tokenOut == 0x95401dc811bb5740090279Ba06cfA8fcF6113778 || // USDC
            tokenOut == 0x998abeb3E57409262aE5b751f60747921B33613E) { // USDT
            // Для 6-decimal токенов: rate уже в правильном формате
            amountOut = (amountAfterFee * rate) / 1e18;
        } else {
            // Для 18-decimal токенов
            amountOut = (amountAfterFee * rate) / 1e18;
        }
        
        require(amountOut >= amountOutMinimum, "Insufficient output amount");
        
        // Отправляем токены пользователю
        IERC20(tokenOut).transfer(msg.sender, amountOut);
    }
    
    /// @notice Свопит токены в ETH
    function swapExactTokensForETH(
        address tokenIn,
        uint256 amountIn,
        uint256 amountOutMinimum
    ) external returns (uint256 amountOut) {
        require(amountIn > 0, "AmountIn zero");
        
        // Переводим токены от пользователя
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        
        // Удерживаем комиссию 0.1%
        uint256 feeAmount = (amountIn * FEE_NUM) / FEE_DEN;
        uint256 amountAfterFee = amountIn - feeAmount;
        
        // Отправляем комиссию владельцу
        IERC20(tokenIn).transfer(owner, feeAmount);
        
        // Рассчитываем выходную сумму в ETH
        address ethAddress = address(0);
        uint256 rate = exchangeRates[tokenIn][ethAddress];
        require(rate > 0, "No exchange rate set");
        
        amountOut = (amountAfterFee * rate) / 1e18;
        require(amountOut >= amountOutMinimum, "Insufficient output amount");
        require(address(this).balance >= amountOut, "Insufficient ETH balance");
        
        // Отправляем ETH пользователю
        payable(msg.sender).transfer(amountOut);
    }
    
    // Функция для пополнения контракта ETH (для выплат)
    function fundContract() external payable {
        // Просто принимаем ETH
    }
    
    // Функция для пополнения контракта токенами (для выплат)
    function fundTokens(address token, uint256 amount) external {
        IERC20(token).transferFrom(msg.sender, address(this), amount);
    }
    
    // Для получения ETH
    receive() external payable {}
}
