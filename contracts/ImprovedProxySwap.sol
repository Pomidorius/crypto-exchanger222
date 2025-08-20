// contracts/ImprovedProxySwap.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ImprovedProxySwap is Ownable, ReentrancyGuard {
    
    // Комиссия 0.1% (1/1000)
    uint256 public constant FEE_NUMERATOR = 1;
    uint256 public constant FEE_DENOMINATOR = 1000;
    
    // Накопленные комиссии
    mapping(address => uint256) public accumulatedFees;
    
    // Мок курсы обмена (для тестирования)
    mapping(address => mapping(address => uint256)) public exchangeRates;
    
    // События для отслеживания
    event SwapExecuted(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 feeAmount
    );
    
    event FeeWithdrawn(address indexed token, uint256 amount, address indexed to);
    
    constructor() Ownable(msg.sender) {
        // Ownable автоматически устанавливает msg.sender как owner
    }
    
    /// @notice Установка курса обмена (только владелец)
    function setExchangeRate(address tokenIn, address tokenOut, uint256 rate) external onlyOwner {
        exchangeRates[tokenIn][tokenOut] = rate;
    }
    
    /// @notice Обмен токен -> токен
    function swapExactInputSingle(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMinimum
    ) external nonReentrant returns (uint256 amountOut) {
        require(amountIn > 0, "Amount must be greater than 0");
        require(tokenIn != tokenOut, "Same token swap not allowed");
        
        // Переводим токены от пользователя
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        
        // Рассчитываем комиссию
        uint256 feeAmount = (amountIn * FEE_NUMERATOR) / FEE_DENOMINATOR;
        uint256 amountAfterFee = amountIn - feeAmount;
        
        // Накапливаем комиссию
        accumulatedFees[tokenIn] += feeAmount;
        
        // Рассчитываем выходную сумму
        uint256 rate = exchangeRates[tokenIn][tokenOut];
        require(rate > 0, "Exchange rate not set");
        
        amountOut = (amountAfterFee * rate) / 1e18;
        require(amountOut >= amountOutMinimum, "Insufficient output amount");
        require(IERC20(tokenOut).balanceOf(address(this)) >= amountOut, "Insufficient contract balance");
        
        // Отправляем токены пользователю
        IERC20(tokenOut).transfer(msg.sender, amountOut);
        
        emit SwapExecuted(msg.sender, tokenIn, tokenOut, amountIn, amountOut, feeAmount);
    }
    
    /// @notice Обмен ETH -> токен
    function swapExactETHForTokens(
        address tokenOut,
        uint256 amountOutMinimum
    ) external payable nonReentrant returns (uint256 amountOut) {
        require(msg.value > 0, "Must send ETH");
        
        // Рассчитываем комиссию
        uint256 feeAmount = (msg.value * FEE_NUMERATOR) / FEE_DENOMINATOR;
        uint256 amountAfterFee = msg.value - feeAmount;
        
        // Накапливаем комиссию в ETH (address(0) = ETH)
        accumulatedFees[address(0)] += feeAmount;
        
        // Рассчитываем выходную сумму
        uint256 rate = exchangeRates[address(0)][tokenOut];
        require(rate > 0, "Exchange rate not set");
        
        amountOut = (amountAfterFee * rate) / 1e18;
        require(amountOut >= amountOutMinimum, "Insufficient output amount");
        require(IERC20(tokenOut).balanceOf(address(this)) >= amountOut, "Insufficient contract balance");
        
        // Отправляем токены пользователю
        IERC20(tokenOut).transfer(msg.sender, amountOut);
        
        emit SwapExecuted(msg.sender, address(0), tokenOut, msg.value, amountOut, feeAmount);
    }
    
    /// @notice Обмен токен -> ETH
    function swapExactTokensForETH(
        address tokenIn,
        uint256 amountIn,
        uint256 amountOutMinimum
    ) external nonReentrant returns (uint256 amountOut) {
        require(amountIn > 0, "Amount must be greater than 0");
        
        // Переводим токены от пользователя
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        
        // Рассчитываем комиссию
        uint256 feeAmount = (amountIn * FEE_NUMERATOR) / FEE_DENOMINATOR;
        uint256 amountAfterFee = amountIn - feeAmount;
        
        // Накапливаем комиссию
        accumulatedFees[tokenIn] += feeAmount;
        
        // Рассчитываем выходную сумму в ETH
        uint256 rate = exchangeRates[tokenIn][address(0)];
        require(rate > 0, "Exchange rate not set");
        
        amountOut = (amountAfterFee * rate) / 1e18;
        require(amountOut >= amountOutMinimum, "Insufficient output amount");
        require(address(this).balance >= amountOut + accumulatedFees[address(0)], "Insufficient ETH balance");
        
        // Отправляем ETH пользователю
        payable(msg.sender).transfer(amountOut);
        
        emit SwapExecuted(msg.sender, tokenIn, address(0), amountIn, amountOut, feeAmount);
    }
    
    /// @notice Вывод накопленных комиссий (только владелец)
    function withdrawFees(address token, address to) external onlyOwner {
        require(to != address(0), "Invalid recipient");
        
        uint256 amount = accumulatedFees[token];
        require(amount > 0, "No fees to withdraw");
        
        accumulatedFees[token] = 0;
        
        if (token == address(0)) {
            // Вывод ETH
            payable(to).transfer(amount);
        } else {
            // Вывод токенов
            IERC20(token).transfer(to, amount);
        }
        
        emit FeeWithdrawn(token, amount, to);
    }
    
    /// @notice Вывод всех накопленных комиссий в ETH (только владелец)
    function withdrawAllETHFees(address to) external onlyOwner {
        uint256 amount = accumulatedFees[address(0)];
        require(amount > 0, "No ETH fees to withdraw");
        require(to != address(0), "Invalid recipient");
        
        accumulatedFees[address(0)] = 0;
        payable(to).transfer(amount);
        
        emit FeeWithdrawn(address(0), amount, to);
    }
    
    /// @notice Проверка накопленных комиссий
    function getAccumulatedFees(address token) external view returns (uint256) {
        return accumulatedFees[token];
    }
    
    /// @notice Пополнение контракта ETH
    function fundContract() external payable {
        // Принимаем ETH для ликвидности (не комиссия)
    }
    
    /// @notice Пополнение контракта токенами
    function fundTokens(address token, uint256 amount) external {
        IERC20(token).transferFrom(msg.sender, address(this), amount);
    }
    
    /// @notice Экстренный вывод средств (только владелец)
    function emergencyWithdraw(address token, uint256 amount, address to) external onlyOwner {
        require(to != address(0), "Invalid recipient");
        
        if (token == address(0)) {
            require(address(this).balance >= amount, "Insufficient balance");
            payable(to).transfer(amount);
        } else {
            require(IERC20(token).balanceOf(address(this)) >= amount, "Insufficient balance");
            IERC20(token).transfer(to, amount);
        }
    }
    
    /// @notice Получение баланса контракта
    function getContractBalance(address token) external view returns (uint256) {
        if (token == address(0)) {
            return address(this).balance;
        } else {
            return IERC20(token).balanceOf(address(this));
        }
    }
    
    // Для получения ETH
    receive() external payable {
        // Принимаем ETH
    }
}
