# CLAUDE.md — Solidity / Smart Contract Development

> Author: Melisia Archimedes
> Version: 1.0
> Stack: Foundry (primary), Hardhat (alternative), Solidity 0.8.24+, OpenZeppelin, Slither

## Project Overview

This configuration governs Solidity smart contract development. Smart contracts are immutable once deployed. Bugs are permanent and exploitable. The cost of a mistake is not a service restart — it is lost funds. Every convention in this file exists because someone lost money when they did not follow it.

## Project Structure (Foundry)

```
├── src/
│   ├── core/
│   │   ├── Token.sol                    # Core ERC20/721 implementation
│   │   ├── Vault.sol                    # Fund management
│   │   └── Registry.sol                 # Address registry
│   ├── interfaces/
│   │   ├── IToken.sol                   # Interface definitions
│   │   ├── IVault.sol
│   │   └── IRegistry.sol
│   ├── libraries/
│   │   ├── MathLib.sol                  # Math utilities
│   │   └── SafeTransfer.sol             # Safe token transfer helpers
│   ├── periphery/
│   │   ├── Router.sol                   # User-facing entry point
│   │   └── Multicall.sol                # Batch call support
│   └── proxy/
│       ├── UUPSProxy.sol                # UUPS upgrade proxy
│       └── ProxyAdmin.sol               # Proxy administration
├── test/
│   ├── unit/
│   │   ├── Token.t.sol                  # Unit tests per contract
│   │   ├── Vault.t.sol
│   │   └── Registry.t.sol
│   ├── integration/
│   │   └── FullFlow.t.sol               # End-to-end integration tests
│   ├── fuzz/
│   │   └── Vault.fuzz.t.sol             # Fuzz testing
│   ├── invariant/
│   │   ├── Invariants.t.sol             # Invariant test definitions
│   │   └── Handlers.sol                 # Invariant test handlers
│   └── fork/
│       └── MainnetFork.t.sol            # Mainnet fork tests
├── script/
│   ├── Deploy.s.sol                     # Deployment script
│   ├── Upgrade.s.sol                    # Upgrade script
│   └── Verify.s.sol                     # Etherscan verification
├── lib/                                  # Foundry dependencies (git submodules)
│   ├── forge-std/
│   └── openzeppelin-contracts/
├── audits/                               # Audit reports
├── docs/
│   ├── architecture.md                   # System architecture
│   └── deployment.md                     # Deployment addresses and procedures
├── foundry.toml                          # Foundry configuration
├── remappings.txt                        # Import remappings
└── .github/
    └── workflows/
        └── ci.yml                        # Build, test, lint, static analysis
```

## Naming Conventions

- **Contracts:** PascalCase, nouns (`TokenVault`, `LiquidityPool`, `AccessRegistry`)
- **Interfaces:** PascalCase prefixed with `I` (`ITokenVault`, `ILiquidityPool`)
- **Libraries:** PascalCase suffixed with `Lib` (`MathLib`, `TransferLib`)
- **Events:** PascalCase, past tense verb (`Deposited`, `Withdrawn`, `RoleGranted`)
- **Errors:** PascalCase, descriptive (`InsufficientBalance`, `Unauthorised`, `InvalidAmount`)
- **Functions:** camelCase, verb-first (`deposit`, `withdraw`, `transferOwnership`)
- **State variables:** camelCase, private prefixed with underscore (`_totalSupply`, `_owner`)
- **Constants:** SCREAMING_SNAKE_CASE (`MAX_SUPPLY`, `BASIS_POINTS`)
- **Mappings:** descriptive key-value names (`mapping(address user => uint256 balance) private _balances`)
- **Test files:** `[Contract].t.sol` for unit, `[Contract].fuzz.t.sol` for fuzz
- **Deploy scripts:** `Deploy.s.sol`, `Upgrade.s.sol`

## Solidity Rules

### Compiler and Pragma
- Use Solidity 0.8.24+ (built-in overflow protection, custom errors, transient storage)
- Lock pragma to specific version in deployable contracts: `pragma solidity 0.8.24;`
- Use range pragma in libraries and interfaces: `pragma solidity ^0.8.20;`
- Enable optimizer with 200 runs for general contracts, 10000 runs for frequently called contracts

### Gas Optimisation
- Use custom errors instead of revert strings (saves ~50 gas per revert)
- Use `uint256` by default — smaller types (`uint8`, `uint128`) cost more gas unless packed in storage
- Pack storage variables: group variables that fit within a single 32-byte slot
- Use `calldata` for function parameters that are not modified (cheaper than `memory`)
- Cache storage reads in local variables when accessed multiple times in a function
- Use `unchecked` blocks only where overflow is mathematically impossible — document why
- Prefer `++i` over `i++` in loops (marginal but consistent)
- Events are cheaper than storage for data that only needs to be read off-chain

```solidity
// CORRECT — gas-efficient error handling
error InsufficientBalance(uint256 available, uint256 required);

function withdraw(uint256 amount) external {
    uint256 balance = _balances[msg.sender]; // Cache storage read
    if (balance < amount) revert InsufficientBalance(balance, amount);
    _balances[msg.sender] = balance - amount;
    // ...
}

// WRONG — expensive string revert
function withdraw(uint256 amount) external {
    require(_balances[msg.sender] >= amount, "Insufficient balance");
    // ...
}
```

### Access Control
- Use OpenZeppelin's `AccessControl` or `Ownable2Step` (not `Ownable` — two-step transfer prevents accidents)
- Define granular roles: `ADMIN_ROLE`, `OPERATOR_ROLE`, `PAUSER_ROLE`
- Implement a pause mechanism (`Pausable`) for emergency stops
- Use timelocks for sensitive admin operations (ownership transfer, parameter changes)
- Multi-sig ownership for production contracts — never a single EOA

### Upgrade Patterns
- UUPS proxy pattern (preferred) — upgrade logic in the implementation, not the proxy
- Transparent proxy pattern — upgrade logic in ProxyAdmin, clearer separation
- Never use delegatecall without understanding storage layout implications
- Storage layout: new versions must be storage-compatible. Never reorder, remove, or change the type of existing storage variables. Only append new variables.
- Initializers: use `initializer` modifier instead of constructors in upgradeable contracts. Disable initializers in the implementation contract.
- Test upgrades: deploy V1, upgrade to V2, verify state is preserved

## Testing Requirements

| Type | Tool | Coverage Target | What to Test |
|------|------|----------------|--------------|
| Unit | Foundry (forge test) | 95% line coverage | Every function, every revert path |
| Fuzz | Foundry fuzz | Critical functions | Random inputs to find edge cases |
| Invariant | Foundry invariant | System-level properties | "Total supply always equals sum of balances" |
| Fork | Foundry fork testing | External integrations | Test against live mainnet state |
| Static analysis | Slither | All contracts | Known vulnerability patterns |
| Formal verification | Certora / Halmos | Critical invariants | Mathematical proof of correctness |
| Gas | Foundry gas reports | All functions | Gas regression detection |

### Fuzz Testing
```solidity
function testFuzz_DepositWithdraw(uint256 amount) public {
    amount = bound(amount, 1, type(uint128).max); // Bound input to valid range
    deal(address(token), address(this), amount);

    vault.deposit(amount);
    assertEq(vault.balanceOf(address(this)), amount);

    vault.withdraw(amount);
    assertEq(vault.balanceOf(address(this)), 0);
}
```

### Invariant Testing
```solidity
function invariant_TotalSupplyMatchesBalances() public {
    uint256 sumOfBalances = 0;
    for (uint256 i = 0; i < actors.length; i++) {
        sumOfBalances += token.balanceOf(actors[i]);
    }
    assertEq(token.totalSupply(), sumOfBalances);
}
```

### Testing Rules
- 95% line coverage minimum. 100% for contracts handling funds.
- Every `revert` path must have a test that triggers it
- Test with boundary values: 0, 1, type(uint256).max, empty arrays
- Fork tests for any interaction with external protocols (Uniswap, Aave, Chainlink)
- Gas snapshot: run `forge snapshot` and track gas changes across PRs
- Never deploy a contract that has not passed Slither analysis with zero high-severity findings

## Deployment Workflow

### Multi-Chain Deployment
1. **Testnet first:** Deploy to Sepolia/Goerli. Run full test suite against testnet.
2. **Staging:** Deploy to a less-used L2 testnet for integration testing with frontend
3. **Mainnet:** Deploy with verified source code on Etherscan/Blockscout
4. **Verification:** `forge verify-contract` immediately after deployment
5. **Record:** Document deployed addresses, block numbers, and transaction hashes in `docs/deployment.md`

### Deployment Script Pattern
```solidity
contract Deploy is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        vm.startBroadcast(deployerKey);

        Token token = new Token("MyToken", "MTK", 1_000_000e18);
        Vault vault = new Vault(address(token));

        vm.stopBroadcast();

        // Log deployed addresses
        console.log("Token:", address(token));
        console.log("Vault:", address(vault));
    }
}
```

### Post-Deployment Checklist
- Verify source code on block explorer
- Transfer ownership to multi-sig
- Set up monitoring (Forta, OpenZeppelin Defender)
- Revoke deployer permissions if no longer needed
- Update frontend contract addresses and ABIs

## Security Rules (Critical)

1. **Reentrancy:** Follow checks-effects-interactions pattern. Use OpenZeppelin's `ReentrancyGuard` on any function that sends ETH or calls external contracts. Never update state after an external call.
2. **Front-running:** Sensitive operations (swaps, auctions, reveals) need commit-reveal patterns or use private mempools (Flashbots Protect).
3. **Integer overflow:** Solidity 0.8+ has built-in overflow checks. Use `unchecked` only with mathematical proof of safety. Document the proof in comments.
4. **Access control:** Every state-changing function must have explicit access control. Default to restricted, not permissive.
5. **Oracle manipulation:** Never use spot prices from AMMs as oracle prices. Use time-weighted averages (TWAP) or Chainlink price feeds.
6. **Approval front-running:** Use `increaseAllowance`/`decreaseAllowance` instead of `approve` for ERC20 tokens.
7. **Denial of service:** Avoid unbounded loops over user-controlled arrays. Use pull-over-push patterns for distributions.
8. **Flash loan attacks:** Assume any external call can be made with billions in borrowed capital. Design accordingly.
9. **Signature replay:** Include chain ID and nonce in all signed messages. Use EIP-712 typed structured data.
10. **Self-destruct:** `selfdestruct` can force-send ETH to any contract. Never rely on `address(this).balance` for accounting — use internal tracking variables.

## Common Pitfalls

- **Missing reentrancy guards.** Any function that transfers ETH or calls an external contract is a reentrancy target. Apply `nonReentrant` modifier even if you think it is safe — defence in depth.
- **Storage variable ordering in upgrades.** Reordering storage variables between upgrade versions corrupts all stored data. Always append new variables at the end. Never change existing variable types.
- **Trusting msg.value in loops.** `msg.value` is the same in every iteration of a loop. If processing multiple payments, pass amounts as parameters, not relying on msg.value.
- **Using tx.origin for auth.** `tx.origin` is the original caller, not the immediate caller. It can be manipulated via phishing contracts. Always use `msg.sender`.
- **Not testing revert paths.** If a require/revert is not tested, you do not know if it works. An untested revert is an assumption, not a guarantee.
- **Deploying without multi-sig.** A single EOA controlling a production contract is a single point of failure (key compromise). Transfer ownership to a multi-sig immediately after deployment.

## Code Review Checklist

- [ ] Reentrancy protection on all external-call functions
- [ ] Checks-effects-interactions pattern followed
- [ ] Custom errors used (not revert strings)
- [ ] Access control on every state-changing function
- [ ] Storage layout compatible with previous version (if upgradeable)
- [ ] No unbounded loops over user-controlled data
- [ ] Events emitted for all state changes
- [ ] NatSpec documentation on all public/external functions
- [ ] Fuzz tests on functions accepting numeric inputs
- [ ] Invariant tests for system-level properties
- [ ] Slither analysis passes with zero high-severity findings
- [ ] Gas snapshot compared against previous version
- [ ] All external calls wrapped in try/catch or handled for failure
- [ ] No use of `tx.origin` for authentication

---

Part of The Hive Doctrine · hivedoctrine.com · Agent knowledge, sold to machines.
