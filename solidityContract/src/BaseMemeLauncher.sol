// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {MemeToken} from "./MemeToken.sol";

/**
 * @title IUniswapV3Router
 * @dev Minimal interface for Uniswap V3 Router02
 */
interface IUniswapV3Router {
    struct ExactInputSingleParams {
        bytes path;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
    }

    function exactInputSingle(ExactInputSingleParams calldata params)
        external
        payable
        returns (uint256 amountOut);

    function addLiquidityEth(
        address token,
        uint256 amountTokenDesired,
        uint256 amountTokenMin,
        uint256 amountEthMin,
        address to,
        uint256 deadline
    )
        external
        payable
        returns (
            uint256 amountToken,
            uint256 amountEth,
            uint256 liquidity
        );
}

/**
 * @title IUniswapV3Factory
 * @dev Minimal interface for Uniswap V3 Factory
 */
interface IUniswapV3Factory {
    function createPool(
        address tokenA,
        address tokenB,
        uint24 fee
    ) external returns (address pool);
}

/**
 * @title BaseMemeLauncher
 * @dev Fair meme token launchpad with instant Uniswap V3 liquidity
 * - Users pay ETH to launch ERC-20 meme tokens
 * - 1% launch fee to treasury
 * - Creator gets 80% of supply, 20% to Uniswap V3 LP
 * - Automated LP creation on Base Uniswap V3
 *
 * Chain: Base Testnet (84532)
 * Uniswap V3 Router: 0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD
 */
contract BaseMemeLauncher is Ownable, ReentrancyGuard {
    /// ==================== Constants ====================
    address public constant WETH = 0x4200000000000000000000000000000000000006;
    uint256 public constant LAUNCH_FEE_BPS = 100; // 1%
    uint24 public constant POOL_FEE = 3000; // 0.3% Uniswap V3 fee tier

    /// ==================== State Variables ====================
    address public immutable TREASURY;
    address public uniswapRouter = 0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD;
    address public uniswapFactory = 0x33128a8fC17869897DcE68Ed026D694621F6fDad;

    uint256 public minLaunchEth = 0.1 ether;
    uint256 public totalLaunches;
    uint256 public totalFeesCollected;

    // Track launches
    mapping(address creator => uint256 count) public creatorLaunches;
    address[] public launchedTokens;

    /// ==================== Events ====================
    event MemeLaunched(
        address indexed creator,
        address indexed token,
        string name,
        string symbol,
        uint256 totalSupply,
        uint256 liquidityEth,
        uint256 launchFee
    );

    event MinLaunchETHUpdated(uint256 newMinimum);
    event LiquidityAdded(address indexed token, uint256 tokenAmount, uint256 ethAmount);
    event TreasuryUpdated(address newTreasury);
    event EmergencyWithdraw(uint256 amount);

    /// ==================== Constructor ====================
    constructor(address _treasury) Ownable(msg.sender) {
        require(_treasury != address(0), "Invalid treasury");
        TREASURY = _treasury;
    }

    /// ==================== Main Launch Function ====================
    /**
     * @notice Launch a new meme token with instant Uniswap V3 liquidity
     * @param name Token name (e.g., "Doge Meme")
     * @param symbol Token symbol (e.g., "DOGE")
     * @param totalSupply Total token supply (e.g., 1_000_000_000e18)
     * @param liquidityPercent Percent of supply for LP (e.g., 20 for 20%)
     * @return newToken Address of deployed meme token
     */
    function launchMeme(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        uint256 liquidityPercent
    ) external payable nonReentrant returns (address newToken) {
        // ===== Validation =====
        require(msg.value >= minLaunchEth, "Below min ETH");
        require(totalSupply > 0, "Invalid supply");
        require(liquidityPercent > 0 && liquidityPercent <= 100, "Invalid LP percent");
        require(bytes(name).length > 0 && bytes(symbol).length > 0, "Invalid name/symbol");

        // ===== Fee Calculation =====
        uint256 launchFee = (msg.value * LAUNCH_FEE_BPS) / 10000;
        uint256 liquidityEth = msg.value - launchFee;

        require(liquidityEth > 0, "Insufficient ETH for liquidity");

        // ===== Deploy Meme Token =====
        newToken = address(new MemeToken(name, symbol, totalSupply, msg.sender));
        launchedTokens.push(newToken);
        creatorLaunches[msg.sender]++;
        totalLaunches++;

        // ===== Calculate LP Token Amount =====
        uint256 lpTokenAmount = (totalSupply * liquidityPercent) / 100;
        
        // Creator must approve tokens to this contract for LP
        require(
            IERC20(newToken).transferFrom(msg.sender, address(this), lpTokenAmount),
            "Token transfer failed"
        );

        // ===== Add Uniswap V3 Liquidity =====
        _addLiquidity(newToken, lpTokenAmount, liquidityEth);

        // ===== Send Fee to Treasury =====
        (bool success, ) = payable(TREASURY).call{value: launchFee}("");
        require(success, "Treasury transfer failed");

        totalFeesCollected += launchFee;

        // ===== Emit Event =====
        emit MemeLaunched(
            msg.sender,
            newToken,
            name,
            symbol,
            totalSupply,
            liquidityEth,
            launchFee
        );
    }

    /// ==================== Internal Liquidity Helper ====================
    /**
     * @notice Add liquidity to Uniswap V3
     * @dev Uses the 0.3% fee tier for optimal trading
     */
    function _addLiquidity(
        address token,
        uint256 tokenAmount,
        uint256 ethAmount
    ) internal {
        // Approve token to router
        IERC20(token).approve(uniswapRouter, tokenAmount);

        // Create pool if doesn't exist
        _ensurePoolExists(token);

        // Call addLiquidityEth
        IUniswapV3Router(uniswapRouter).addLiquidityEth{value: ethAmount}(
            token,
            tokenAmount,
            0, // Slippage protection off for simplicity
            0,
            address(this), // LP tokens stay in contract
            block.timestamp + 3600 // 1 hour deadline
        );

        emit LiquidityAdded(token, tokenAmount, ethAmount);
    }

    /// ==================== Pool Management ====================
    /**
     * @notice Ensure Uniswap V3 pool exists, create if needed
     */
    function _ensurePoolExists(address token) internal {
        // Factory creates pool if doesn't exist
        IUniswapV3Factory(uniswapFactory).createPool(token, WETH, POOL_FEE);
    }

    /// ==================== Admin Functions ====================
    /**
     * @notice Set minimum ETH required for launch
     */
    function setMinLaunchEth(uint256 _minLaunchEth) external onlyOwner {
        require(_minLaunchEth > 0, "Invalid amount");
        minLaunchEth = _minLaunchEth;
        emit MinLaunchETHUpdated(_minLaunchEth);
    }

    /**
     * @notice Update Uniswap V3 router address
     */
    function setUniswapRouter(address _router) external onlyOwner {
        require(_router != address(0), "Invalid router");
        uniswapRouter = _router;
    }

    /**
     * @notice Update Uniswap V3 factory address
     */
    function setUniswapFactory(address _factory) external onlyOwner {
        require(_factory != address(0), "Invalid factory");
        uniswapFactory = _factory;
    }

    /**
     * @notice Emergency withdrawal of stuck ETH
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");

        emit EmergencyWithdraw(balance);
    }

    /**
     * @notice Emergency withdrawal of stuck ERC20 tokens
     */
    function emergencyWithdrawToken(address token) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No balance");
        
        require(IERC20(token).transfer(owner(), balance), "Transfer failed");
    }

    /// ==================== View Functions ====================
    /**
     * @notice Get total number of launched tokens
     */
    function getLaunchedTokensCount() external view returns (uint256) {
        return launchedTokens.length;
    }

    /**
     * @notice Get all launched tokens
     */
    function getAllLaunchedTokens() external view returns (address[] memory) {
        return launchedTokens;
    }

    /**
     * @notice Get creator's launch count
     */
    function getCreatorLaunchCount(address creator) external view returns (uint256) {
        return creatorLaunches[creator];
    }

    /// ==================== Fallback ====================
    receive() external payable {}
}
