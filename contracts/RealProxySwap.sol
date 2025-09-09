// contracts/RealProxySwap.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/interfaces/IQuoter.sol";

/**
 * @title RealProxySwap
 * @dev Контракт для реальных свапов через Uniswap V3
 * @notice Этот контракт интегрируется с реальным Uniswap для выполнения обменов
 */
contract RealProxySwap is Ownable, ReentrancyGuard, Pausable {
    
    // Uniswap V3 контракты
    ISwapRouter public immutable swapRouter;
    IQuoter public immutable quoter;
    
    // Комиссия протокола (0.1% = 10 базисных пунктов)
    uint256 public constant PROTOCOL_FEE_BPS = 10;
    uint256 public constant BASIS_POINTS = 10000;
    
    // Максимальный slippage (5% = 500 базисных пунктов)
    uint256 public constant MAX_SLIPPAGE_BPS = 500;
    
    // Минимальные и максимальные суммы для свапа
    uint256 public minSwapAmount = 0.001 ether; // 0.001 ETH минимум
    uint256 public maxSwapAmount = 100 ether;   // 100 ETH максимум
    
    // Накопленные комиссии протокола
    mapping(address => uint256) public protocolFees;
    
    // Whitelist токенов для дополнительной безопасности
    mapping(address => bool) public supportedTokens;
    
    // События
    event SwapExecuted(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 protocolFee,
        uint24 poolFee
    );
    
    event ProtocolFeeWithdrawn(
        address indexed token,
        uint256 amount,
        address indexed recipient
    );
    
    event TokenSupportUpdated(address indexed token, bool supported);
    event SwapLimitsUpdated(uint256 minAmount, uint256 maxAmount);
    event EmergencyWithdraw(address indexed token, uint256 amount, address indexed recipient);
    
    // Модификаторы
    modifier onlySupportedToken(address token) {
        require(token == address(0) || supportedTokens[token], "Token not supported");
        _;
    }
    
    modifier validSwapAmount(uint256 amount) {
        require(amount >= minSwapAmount && amount <= maxSwapAmount, "Invalid swap amount");
        _;
    }
    
    /**
     * @dev Конструктор контракта
     * @param _swapRouter Адрес Uniswap V3 SwapRouter
     * @param _quoter Адрес Uniswap V3 Quoter
     */
    constructor(
        address _swapRouter,
        address _quoter
    ) Ownable(msg.sender) {
        require(_swapRouter != address(0), "Invalid swap router");
        require(_quoter != address(0), "Invalid quoter");
        
        swapRouter = ISwapRouter(_swapRouter);
        quoter = IQuoter(_quoter);
        
        // Добавляем основные токены в whitelist при деплое
        supportedTokens[address(0)] = true; // ETH
        
        emit TokenSupportUpdated(address(0), true);
    }
    
    /**
     * @notice Выполнение свапа ETH -> Token
     * @param tokenOut Адрес выходного токена
     * @param amountOutMinimum Минимальная сумма получения (с учетом slippage)
     * @param poolFee Комиссия пула (500, 3000, 10000)
     * @param deadline Дедлайн транзакции
     */
    function swapExactETHForTokens(
        address tokenOut,
        uint256 amountOutMinimum,
        uint24 poolFee,
        uint256 deadline
    ) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
        onlySupportedToken(tokenOut)
        validSwapAmount(msg.value)
        returns (uint256 amountOut) 
    {
        require(msg.value > 0, "Must send ETH");
        require(deadline >= block.timestamp, "Transaction expired");
        require(tokenOut != address(0), "Invalid token address");
        
        // Рассчитываем комиссию протокола
        uint256 protocolFee = (msg.value * PROTOCOL_FEE_BPS) / BASIS_POINTS;
        uint256 amountToSwap = msg.value - protocolFee;
        
        // Накапливаем комиссию
        protocolFees[address(0)] += protocolFee;
        
        // Получаем WETH адрес (предполагаем что он известен)
        address WETH = swapRouter.WETH9();
        
        // Параметры свапа
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            tokenIn: WETH,
            tokenOut: tokenOut,
            fee: poolFee,
            recipient: msg.sender,
            deadline: deadline,
            amountIn: amountToSwap,
            amountOutMinimum: amountOutMinimum,
            sqrtPriceLimitX96: 0
        });
        
        // Выполняем свап
        amountOut = swapRouter.exactInputSingle{value: amountToSwap}(params);
        
        emit SwapExecuted(
            msg.sender,
            address(0), // ETH
            tokenOut,
            msg.value,
            amountOut,
            protocolFee,
            poolFee
        );
    }
    
    /**
     * @notice Выполнение свапа Token -> ETH
     * @param tokenIn Адрес входного токена
     * @param amountIn Сумма входного токена
     * @param amountOutMinimum Минимальная сумма получения ETH
     * @param poolFee Комиссия пула
     * @param deadline Дедлайн транзакции
     */
    function swapExactTokensForETH(
        address tokenIn,
        uint256 amountIn,
        uint256 amountOutMinimum,
        uint24 poolFee,
        uint256 deadline
    )
        external
        nonReentrant
        whenNotPaused
        onlySupportedToken(tokenIn)
        validSwapAmount(amountIn)
        returns (uint256 amountOut)
    {
        require(amountIn > 0, "Amount must be greater than 0");
        require(deadline >= block.timestamp, "Transaction expired");
        require(tokenIn != address(0), "Invalid token address");
        
        // Переводим токены от пользователя
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        
        // Рассчитываем комиссию протокола
        uint256 protocolFee = (amountIn * PROTOCOL_FEE_BPS) / BASIS_POINTS;
        uint256 amountToSwap = amountIn - protocolFee;
        
        // Накапливаем комиссию
        protocolFees[tokenIn] += protocolFee;
        
        // Даем разрешение SwapRouter
        IERC20(tokenIn).approve(address(swapRouter), amountToSwap);
        
        address WETH = swapRouter.WETH9();
        
        // Параметры свапа
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            tokenIn: tokenIn,
            tokenOut: WETH,
            fee: poolFee,
            recipient: msg.sender,
            deadline: deadline,
            amountIn: amountToSwap,
            amountOutMinimum: amountOutMinimum,
            sqrtPriceLimitX96: 0
        });
        
        // Выполняем свап
        amountOut = swapRouter.exactInputSingle(params);
        
        emit SwapExecuted(
            msg.sender,
            tokenIn,
            address(0), // ETH
            amountIn,
            amountOut,
            protocolFee,
            poolFee
        );
    }
    
    /**
     * @notice Выполнение свапа Token -> Token
     * @param tokenIn Адрес входного токена
     * @param tokenOut Адрес выходного токена  
     * @param amountIn Сумма входного токена
     * @param amountOutMinimum Минимальная сумма получения
     * @param poolFee Комиссия пула
     * @param deadline Дедлайн транзакции
     */
    function swapExactInputSingle(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMinimum,
        uint24 poolFee,
        uint256 deadline
    )
        external
        nonReentrant
        whenNotPaused
        onlySupportedToken(tokenIn)
        onlySupportedToken(tokenOut)
        validSwapAmount(amountIn)
        returns (uint256 amountOut)
    {
        require(amountIn > 0, "Amount must be greater than 0");
        require(deadline >= block.timestamp, "Transaction expired");
        require(tokenIn != tokenOut, "Same token swap not allowed");
        
        // Переводим токены от пользователя
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        
        // Рассчитываем комиссию протокола
        uint256 protocolFee = (amountIn * PROTOCOL_FEE_BPS) / BASIS_POINTS;
        uint256 amountToSwap = amountIn - protocolFee;
        
        // Накапливаем комиссию
        protocolFees[tokenIn] += protocolFee;
        
        // Даем разрешение SwapRouter
        IERC20(tokenIn).approve(address(swapRouter), amountToSwap);
        
        // Параметры свапа
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            fee: poolFee,
            recipient: msg.sender,
            deadline: deadline,
            amountIn: amountToSwap,
            amountOutMinimum: amountOutMinimum,
            sqrtPriceLimitX96: 0
        });
        
        // Выполняем свап
        amountOut = swapRouter.exactInputSingle(params);
        
        emit SwapExecuted(
            msg.sender,
            tokenIn,
            tokenOut,
            amountIn,
            amountOut,
            protocolFee,
            poolFee
        );
    }
    
    /**
     * @notice Получение котировки от Uniswap
     * @param tokenIn Адрес входного токена
     * @param tokenOut Адрес выходного токена
     * @param amountIn Сумма входного токена
     * @param poolFee Комиссия пула
     */
    function getQuote(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint24 poolFee
    ) external returns (uint256 amountOut) {
        // Для ETH используем WETH
        if (tokenIn == address(0)) {
            tokenIn = swapRouter.WETH9();
        }
        if (tokenOut == address(0)) {
            tokenOut = swapRouter.WETH9();
        }
        
        return quoter.quoteExactInputSingle(
            tokenIn,
            tokenOut,
            poolFee,
            amountIn,
            0
        );
    }
    
    // === ADMIN ФУНКЦИИ ===
    
    /**
     * @notice Добавление/удаление токена из whitelist
     */
    function setSupportedToken(address token, bool supported) external onlyOwner {
        supportedTokens[token] = supported;
        emit TokenSupportUpdated(token, supported);
    }
    
    /**
     * @notice Установка лимитов свапа
     */
    function setSwapLimits(uint256 _minAmount, uint256 _maxAmount) external onlyOwner {
        require(_minAmount < _maxAmount, "Invalid limits");
        minSwapAmount = _minAmount;
        maxSwapAmount = _maxAmount;
        emit SwapLimitsUpdated(_minAmount, _maxAmount);
    }
    
    /**
     * @notice Вывод накопленных комиссий протокола
     */
    function withdrawProtocolFees(address token, address recipient) external onlyOwner {
        require(recipient != address(0), "Invalid recipient");
        
        uint256 amount = protocolFees[token];
        require(amount > 0, "No fees to withdraw");
        
        protocolFees[token] = 0;
        
        if (token == address(0)) {
            // Вывод ETH
            payable(recipient).transfer(amount);
        } else {
            // Вывод токенов
            IERC20(token).transfer(recipient, amount);
        }
        
        emit ProtocolFeeWithdrawn(token, amount, recipient);
    }
    
    /**
     * @notice Экстренная пауза контракта
     */
    function emergencyPause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Снятие паузы
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @notice Экстренный вывод средств (только в крайнем случае)
     */
    function emergencyWithdraw(
        address token,
        uint256 amount,
        address recipient
    ) external onlyOwner whenPaused {
        require(recipient != address(0), "Invalid recipient");
        
        if (token == address(0)) {
            require(address(this).balance >= amount, "Insufficient balance");
            payable(recipient).transfer(amount);
        } else {
            require(IERC20(token).balanceOf(address(this)) >= amount, "Insufficient balance");
            IERC20(token).transfer(recipient, amount);
        }
        
        emit EmergencyWithdraw(token, amount, recipient);
    }
    
    /**
     * @notice Получение баланса контракта
     */
    function getBalance(address token) external view returns (uint256) {
        if (token == address(0)) {
            return address(this).balance;
        } else {
            return IERC20(token).balanceOf(address(this));
        }
    }
    
    /**
     * @notice Получение информации о накопленных комиссиях
     */
    function getProtocolFees(address token) external view returns (uint256) {
        return protocolFees[token];
    }
    
    // Для получения ETH
    receive() external payable {
        // Принимаем ETH только от WETH контракта или для пополнения
    }
}
