# CLAUDE.md — DeFi Protocol Development

This is a project-level CLAUDE.md for DeFi protocol development. It configures Claude Code for building automated market makers, lending protocols, oracle integrations, and governance systems on EVM-compatible chains. If you are building a DeFi protocol with Solidity, this file gives Claude the constraints, patterns, and safety rules that prevent costly mistakes.

## Project Overview

- **Stack:** Solidity 0.8.x, Foundry (primary) or Hardhat, OpenZeppelin, Chainlink/Pyth oracles
- **Protocol types:** AMM (concentrated liquidity), lending/borrowing, yield aggregation, governance
- **Networks:** Ethereum mainnet, Base, Arbitrum, Optimism (multi-chain deployment)
- **Testing:** Foundry fuzz testing, invariant testing, fork testing against mainnet state

## Project Structure

```
contracts/
├── core/               # Core protocol logic (pools, vaults, routers)
├── governance/          # Governance token, timelock, voting
├── interfaces/          # All interfaces (I*.sol)
├── libraries/           # Shared math, utils (FixedPointMath, SafeCast)
├── oracles/             # Oracle adapters (Chainlink, Pyth, TWAP)
├── periphery/           # Router contracts, multicall, quoter
├── rewards/             # Liquidity mining, fee distribution
└── security/            # Pause guardian, emergency withdraw
script/
├── Deploy.s.sol         # Deterministic deployment
├── Upgrade.s.sol        # Upgrade scripts (if using proxies)
└── config/              # Per-chain deployment configs
test/
├── unit/                # Unit tests per contract
├── integration/         # Multi-contract interaction tests
├── invariant/           # Invariant/stateful fuzz tests
├── fork/                # Fork tests against mainnet state
└── utils/               # Test helpers, mock contracts
```

## Naming Conventions

- Contracts: PascalCase (`LiquidityPool.sol`, `FeeDistributor.sol`)
- Interfaces: Prefix with `I` (`ILiquidityPool.sol`)
- Libraries: PascalCase with descriptive name (`FixedPointMathLib.sol`)
- Test files: `ContractName.t.sol` (Foundry convention)
- Script files: `ActionName.s.sol`
- Events: Past tense (`Deposited`, `Swapped`, `LiquidityAdded`)
- Errors: Custom errors prefixed with contract name (`Pool_InsufficientLiquidity()`)
- Constants: UPPER_SNAKE_CASE (`MAX_FEE_BPS`, `MINIMUM_LIQUIDITY`)
- Storage variables: Prefix internal with underscore (`_totalLiquidity`)

## Mathematical Precision

- **NEVER use floating point.** All calculations use fixed-point arithmetic.
- Use `uint256` for token amounts. Use `int256` only for P&L or signed deltas.
- Standard precision: 18 decimals (1e18) for internal math, but respect token decimals for external amounts.
- Always multiply before dividing to preserve precision.
- Use `mulDiv` from OpenZeppelin or Solady for safe multiplication with rounding control.
- Round against the user (round down for withdrawals, round up for deposits/fees).
- Document the rounding direction in comments for every division operation.

```solidity
// BAD — precision loss
uint256 share = (amount * totalShares) / totalAssets;

// GOOD — explicit rounding with mulDiv
uint256 share = amount.mulDiv(totalShares, totalAssets, Math.Rounding.Floor);
```

## Oracle Integration

- **Primary:** Chainlink Data Feeds for price data. Always check `updatedAt` for staleness.
- **Secondary:** Pyth Network for high-frequency price updates.
- **TWAP:** Use Uniswap V3 TWAP as manipulation-resistant on-chain oracle.
- **Staleness threshold:** Revert if oracle data is older than the configured heartbeat (e.g. 3600 seconds for Chainlink ETH/USD).
- **Sequencer check:** On L2s (Arbitrum, Optimism), always check the L2 sequencer uptime feed before using price data.

```solidity
(, int256 price, , uint256 updatedAt, ) = priceFeed.latestRoundData();
if (price <= 0) revert Oracle_InvalidPrice();
if (block.timestamp - updatedAt > STALENESS_THRESHOLD) revert Oracle_StalePrice();
```

## Flash Loan Protection

- Implement `block.number` checks for same-block manipulation prevention.
- Use `nonReentrant` on all external state-changing functions.
- For price-sensitive operations (liquidations, swaps), use TWAP rather than spot prices.
- Consider `initialDeposit` or `dead shares` pattern for vault-based protocols to prevent inflation attacks.

```solidity
mapping(address => uint256) private _lastActionBlock;

modifier noSameBlockAction() {
    if (_lastActionBlock[msg.sender] == block.number) revert SameBlockAction();
    _lastActionBlock[msg.sender] = block.number;
    _;
}
```

## MEV Protection

- Document all MEV-extractable surfaces in the protocol.
- Use commit-reveal schemes for governance votes and large trades where applicable.
- Set reasonable slippage parameters in router contracts (`amountOutMin`).
- Consider using Flashbots Protect or MEV-Share for deployment and sensitive transactions.
- For AMMs: implement concentrated liquidity tick ranges to reduce JIT liquidity attacks.

## Security Rules — HARD CONSTRAINTS

1. **No `delegatecall` to untrusted contracts.** Ever. No exceptions.
2. **No `selfdestruct`.** Deprecated and dangerous. Use pause mechanisms instead.
3. **No `tx.origin` for authentication.** Use `msg.sender` only.
4. **No arithmetic without overflow checks.** Do not use `unchecked` blocks for user-facing math.
5. **All external calls after state changes** (Checks-Effects-Interactions pattern).
6. **Reentrancy guards on all state-changing external functions.**
7. **Timelocked governance** — minimum 48-hour delay on parameter changes. No instant admin keys.
8. **Emergency pause** — circuit breaker that halts deposits/swaps but always allows withdrawals.
9. **Never hardcode addresses** — use immutable constructor parameters or upgradeable registries.
10. **Explicit approval patterns** — use `permit2` or EIP-2612 permits. Never require infinite approvals.

## Access Control

- Use OpenZeppelin `AccessControl` with role-based permissions.
- Separate roles: `DEFAULT_ADMIN_ROLE`, `GUARDIAN_ROLE` (pause), `KEEPER_ROLE` (harvest/compound), `GOVERNANCE_ROLE` (parameter changes).
- Multi-sig (Safe) as the owner for mainnet deployments. Never use an EOA as protocol admin.
- Timelock controller between governance and protocol contracts.

## Testing Requirements

- **Minimum 95% line coverage** for core contracts, 90% for periphery.
- **Fuzz testing:** Every arithmetic function must have fuzz tests with bounded inputs.
- **Invariant testing:** Protocol-wide invariants that hold across all function calls:
  - Total supply equals sum of all balances
  - Pool reserves match token balances
  - Fees are non-negative and bounded
  - No tokens can be permanently locked
- **Fork testing:** All integration tests must run against a mainnet fork with real oracle data and real token contracts.
- **Gas benchmarks:** Track gas usage for common operations. Fail CI if gas increases by >10%.

```bash
# Run all tests
forge test -vvv

# Run with gas report
forge test --gas-report

# Fork testing against mainnet
forge test --fork-url $ETH_RPC_URL --match-path test/fork/

# Invariant testing
forge test --match-test invariant_ -vvv
```

## Deployment Workflow

1. **Deploy to testnet** (Sepolia) first. Verify all contracts on Etherscan.
2. **Run fork tests** against the testnet deployment.
3. **Security review** — internal audit checklist must pass before mainnet.
4. **Deploy to mainnet** using deterministic deployment (CREATE2) for consistent addresses.
5. **Verify all contracts** on Etherscan/Basescan immediately after deployment.
6. **Transfer ownership** to multi-sig + timelock within the same deployment script.
7. **Monitor** — set up alerts for unusual activity (large swaps, oracle deviations, governance proposals).

```bash
# Deploy to testnet
forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC --broadcast --verify

# Deploy to mainnet
forge script script/Deploy.s.sol --rpc-url $ETH_RPC --broadcast --verify --slow
```

## Code Review Checklist

- [ ] No unchecked arithmetic on user inputs
- [ ] Reentrancy guards on all external state-changing functions
- [ ] Oracle staleness checks with appropriate thresholds
- [ ] Slippage protection on all swap/deposit/withdraw functions
- [ ] Access control on admin functions with timelock
- [ ] Events emitted for all state changes
- [ ] Custom errors (not require strings) for gas efficiency
- [ ] NatSpec documentation on all public/external functions
- [ ] No hardcoded addresses or magic numbers
- [ ] Emergency pause mechanism preserves user withdrawal capability
- [ ] Token approval patterns do not require infinite approvals
- [ ] Flash loan attack vectors documented and mitigated
- [ ] Gas benchmarks within acceptable range
- [ ] All tests pass including fuzz and invariant suites

## Common Pitfalls

1. **Inflation attack on ERC4626 vaults** — Always use virtual shares/assets or dead shares pattern.
2. **Fee-on-transfer tokens** — Measure balance before and after transfer, don't trust `amount`.
3. **Rebasing tokens** — Use wrapper contracts. Never hold rebasing tokens directly in pools.
4. **Permit replay** — Include `block.chainid` in permit signatures. Check on L2 forks.
5. **Proxy storage collisions** — Use EIP-1967 storage slots. Never add storage variables to base contracts after deployment.
6. **Governance attacks** — Require minimum quorum AND time delay. Flash-loan governance is a real attack vector.
7. **Oracle manipulation** — Never use spot prices from DEXs. Use TWAP with sufficient window (>=30 minutes).
8. **Precision loss in fee calculations** — Accumulate fees in high-precision format, round only on distribution.

## Economic Modelling

- Document all economic assumptions in `/docs/economics/`.
- Model worst-case scenarios: bank run (100% withdrawal), oracle failure, governance attack.
- Stress test with historical data: use fork tests replaying Black Thursday (March 2020) conditions.
- Define and enforce protocol invariants that guarantee solvency.

---

Part of The Hive Doctrine · hivedoctrine.com · Agent knowledge, sold to machines.
