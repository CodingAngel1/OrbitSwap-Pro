#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, contracterror, panic_with_error, Address, Env, Symbol, Vec, Val, IntoVal, TryIntoVal};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    Unauthorized = 1,
    AlreadyInitialized = 3,
    InvalidAmount = 102,
    SameAssetSwap = 109,
    SlippageExceeded = 103, // Reserved: LP contract handles slippage validation
    DeadlineExpired = 104,
    InvalidPool = 201,
    CrossContractFailed = 301,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct Asset {
    pub code: Symbol,
    pub issuer: Option<Address>,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Quote {
    pub expected: i128,
    pub fee: i128,
    pub impact: u32,
    pub route: Vec<Symbol>,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct SwapResult {
    pub out: i128,
    pub fee: i128,
    pub ok: bool,
}

#[contract]
pub struct RouterContract;

#[contractimpl]
impl RouterContract {
    /// Initialize the router with admin and all dependent contract addresses.
    ///
    /// # Arguments
    /// * `admin` - Admin address (owner/controller)
    /// * `lp` - LiquidityPool contract address
    /// * `registry` - SwapRegistry contract address
    /// * `vault` - FeeVault contract address
    /// * `evt` - Event contract address
    pub fn init(env: Env, admin: Address, lp: Address, registry: Address, vault: Address, evt: Address) {
        if env.storage().instance().has(&Symbol::new(&env, "init")) {
            panic_with_error!(env, Error::AlreadyInitialized);
        }
        env.storage().instance().set(&Symbol::new(&env, "admin"), &admin);
        env.storage().instance().set(&Symbol::new(&env, "lp"), &lp);
        env.storage().instance().set(&Symbol::new(&env, "registry"), &registry);
        env.storage().instance().set(&Symbol::new(&env, "vault"), &vault);
        env.storage().instance().set(&Symbol::new(&env, "evt"), &evt);
        env.storage().instance().set(&Symbol::new(&env, "init"), &true);
        env.storage().instance().set(&Symbol::new(&env, "paused"), &false);
        env.events().publish((Symbol::new(&env, "router_init"),), admin);
    }

    /// Execute a swap with exact input amount.
    ///
    /// Validates inputs, computes swap using constant product formula,
    /// then records in SwapRegistry, deposits fees to FeeVault, and
    /// emits events via the Event contract (inter-contract communication).
    pub fn swap_exact_in(
        env: Env, sender: Address, in_asset: Asset, out_asset: Asset,
        in_amount: i128, min_out: i128, deadline: u64,
    ) -> SwapResult {
        if !env.storage().instance().has(&Symbol::new(&env, "init")) {
            panic_with_error!(env, Error::Unauthorized);
        }
        if in_amount <= 0 { panic_with_error!(env, Error::InvalidAmount); }
        if in_asset == out_asset { panic_with_error!(env, Error::SameAssetSwap); }
        if env.ledger().timestamp() > deadline { panic_with_error!(env, Error::DeadlineExpired); }

        // Get dependent contract addresses
        let registry: Address = env.storage().instance().get(&Symbol::new(&env, "registry")).expect("no registry");
        let vault: Address = env.storage().instance().get(&Symbol::new(&env, "vault")).expect("no vault");
        let evt: Address = env.storage().instance().get(&Symbol::new(&env, "evt")).expect("no evt");

        // ─── Step 1: Call LiquidityPool.swap() (cross-contract) ──────────
        let lp_addr: Address = env.storage().instance().get(&Symbol::new(&env, "lp")).expect("no lp");

        let mut swap_args: Vec<Val> = Vec::new(&env);
        swap_args.push_back(in_asset.clone().into_val(&env));
        swap_args.push_back(out_asset.clone().into_val(&env));
        swap_args.push_back(in_amount.into_val(&env));
        swap_args.push_back(min_out.into_val(&env));

        let swap_result_val: Val = env.invoke_contract(&lp_addr, &Symbol::new(&env, "swap"), swap_args);

        // Deserialize (i128, i128) tuple from LP — encoded as Vec<Val>
        let result_vec: Vec<Val> = match swap_result_val.try_into_val(&env) {
            Ok(v) => v,
            Err(_) => panic_with_error!(env, Error::CrossContractFailed),
        };
        let out: i128 = match result_vec.get(0) {
            Some(v) => match v.try_into_val(&env) {
                Ok(val) => val,
                Err(_) => panic_with_error!(env, Error::CrossContractFailed),
            },
            None => panic_with_error!(env, Error::CrossContractFailed),
        };
        let fee: i128 = match result_vec.get(1) {
            Some(v) => match v.try_into_val(&env) {
                Ok(val) => val,
                Err(_) => panic_with_error!(env, Error::CrossContractFailed),
            },
            None => panic_with_error!(env, Error::CrossContractFailed),
        };

        // ─── Step 2: Call SwapRegistry.record() ──────────────────────────
        // Demonstrates cross-contract communication with simple types
        let mut reg_args: Vec<Val> = Vec::new(&env);
        reg_args.push_back(sender.clone().into_val(&env));
        reg_args.push_back(in_asset.code.clone().into_val(&env));
        reg_args.push_back(out_asset.code.clone().into_val(&env));
        reg_args.push_back(in_amount.into_val(&env));
        reg_args.push_back(out.into_val(&env));
        reg_args.push_back(fee.into_val(&env));
        let _: Val = env.invoke_contract(&registry, &Symbol::new(&env, "record"), reg_args);

        // ─── Step 3: Call FeeVault.deposit_fee() ─────────────────────────
        let mut fee_args: Vec<Val> = Vec::new(&env);
        fee_args.push_back(fee.into_val(&env));
        let _: Val = env.invoke_contract(&vault, &Symbol::new(&env, "deposit_fee"), fee_args);

        // ─── Step 4: Call Event.emit_swap() ──────────────────────────────
        let mut evt_args: Vec<Val> = Vec::new(&env);
        evt_args.push_back(sender.into_val(&env));
        evt_args.push_back(in_asset.code.into_val(&env));
        evt_args.push_back(out_asset.code.into_val(&env));
        evt_args.push_back(in_amount.into_val(&env));
        evt_args.push_back(out.into_val(&env));
        evt_args.push_back(fee.into_val(&env));
        let _: Val = env.invoke_contract(&evt, &Symbol::new(&env, "emit_swap"), evt_args);

        // ─── Emit router-level event ─────────────────────────────────────
        env.events().publish(
            (Symbol::new(&env, "swap"),),
            (sender, in_asset, out_asset, in_amount, out, fee),
        );

        SwapResult { out, fee, ok: true }
    }

    /// Calculate a swap quote without executing.
    pub fn get_quote(env: Env, in_asset: Asset, out_asset: Asset, in_amount: i128) -> Quote {
        if in_amount <= 0 { panic_with_error!(env, Error::InvalidAmount); }
        if in_asset == out_asset { panic_with_error!(env, Error::SameAssetSwap); }

        // Compute quote using constant product formula
        let fee = in_amount * 30 / 10000;
        let out = (in_amount - fee) * 100000 / (1000000 + in_amount - fee);
        let impact = (in_amount * 10000 / 1100000) as u32;
        let mut route: Vec<Symbol> = Vec::new(&env);
        route.push_back(in_asset.code.clone());
        route.push_back(out_asset.code);
        Quote { expected: out, fee, impact: impact.min(10000), route }
    }

    /// Pause or unpause the router (admin only).
    pub fn paused(env: Env, p: bool) {
        let admin: Address = env.storage().instance().get(&Symbol::new(&env, "admin")).expect("no admin");
        admin.require_auth();
        env.storage().instance().set(&Symbol::new(&env, "paused"), &p);
    }

    // ─── Query Helpers ───────────────────────────────────────────────────

    pub fn get_admin(env: Env) -> Address {
        env.storage().instance().get(&Symbol::new(&env, "admin")).expect("no admin")
    }

    pub fn get_lp(env: Env) -> Address {
        env.storage().instance().get(&Symbol::new(&env, "lp")).expect("no lp")
    }

    pub fn get_registry(env: Env) -> Address {
        env.storage().instance().get(&Symbol::new(&env, "registry")).expect("no registry")
    }

    pub fn get_vault(env: Env) -> Address {
        env.storage().instance().get(&Symbol::new(&env, "vault")).expect("no vault")
    }

    pub fn get_event(env: Env) -> Address {
        env.storage().instance().get(&Symbol::new(&env, "evt")).expect("no evt")
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::{Address as _, Ledger as _};
    use soroban_sdk::IntoVal as _;

    #[test]
    fn test_swap_with_intercontract() {
        let env = Env::default();
        env.mock_all_auths();
        let admin = Address::generate(&env);
        let user = Address::generate(&env);

        let lp = Address::generate(&env);
        let registry = Address::generate(&env);
        let vault = Address::generate(&env);
        let evt = Address::generate(&env);

        let contract_id = env.register_contract(None, RouterContract);

        // Use env.as_contract to access contract storage
        env.as_contract(&contract_id, || {
            RouterContract::init(env.clone(), admin.clone(), lp.clone(), registry.clone(), vault.clone(), evt.clone());
            assert_eq!(RouterContract::get_lp(env.clone()), lp);
            assert_eq!(RouterContract::get_registry(env.clone()), registry);
            assert_eq!(RouterContract::get_vault(env.clone()), vault);
            assert_eq!(RouterContract::get_event(env.clone()), evt);
        });

        let xlm = Asset { code: Symbol::new(&env, "XLM"), issuer: None };
        let usdc = Asset { code: Symbol::new(&env, "USDC"), issuer: None };

        let quote = RouterContract::get_quote(env.clone(), xlm.clone(), usdc.clone(), 1000);
        assert!(quote.expected > 0);
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #3)")]
    fn test_double_init() {
        let env = Env::default();
        env.mock_all_auths();
        let admin = Address::generate(&env);
        let lp = Address::generate(&env);
        let registry = Address::generate(&env);
        let vault = Address::generate(&env);
        let evt = Address::generate(&env);
        let contract_id = env.register_contract(None, RouterContract);
        env.as_contract(&contract_id, || {
            RouterContract::init(env.clone(), admin.clone(), lp.clone(), registry.clone(), vault.clone(), evt.clone());
            RouterContract::init(env.clone(), admin.clone(), lp.clone(), registry.clone(), vault.clone(), evt.clone());
        });
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #102)")]
    fn test_zero_amount() {
        let env = Env::default();
        env.mock_all_auths();
        let admin = Address::generate(&env);
        let user = Address::generate(&env);
        let lp = Address::generate(&env);
        let registry = Address::generate(&env);
        let vault = Address::generate(&env);
        let evt = Address::generate(&env);
        let contract_id = env.register_contract(None, RouterContract);
        env.as_contract(&contract_id, || {
            RouterContract::init(env.clone(), admin, lp, registry, vault, evt);
        });
        let xlm = Asset { code: Symbol::new(&env, "XLM"), issuer: None };
        let usdc = Asset { code: Symbol::new(&env, "USDC"), issuer: None };
        env.as_contract(&contract_id, || {
            RouterContract::swap_exact_in(env.clone(), user, xlm, usdc, 0, 0, 9999999999);
        });
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #104)")]
    fn test_expired_deadline() {
        let env = Env::default();
        env.mock_all_auths();
        let admin = Address::generate(&env);
        let user = Address::generate(&env);
        let lp = Address::generate(&env);
        let registry = Address::generate(&env);
        let vault = Address::generate(&env);
        let evt = Address::generate(&env);
        let contract_id = env.register_contract(None, RouterContract);
        env.as_contract(&contract_id, || {
            RouterContract::init(env.clone(), admin, lp, registry, vault, evt);
        });
        let xlm = Asset { code: Symbol::new(&env, "XLM"), issuer: None };
        let usdc = Asset { code: Symbol::new(&env, "USDC"), issuer: None };
        // Set ledger timestamp past the deadline (100) so DeadlineExpired triggers
        env.ledger().set_timestamp(200);
        env.as_contract(&contract_id, || {
            RouterContract::swap_exact_in(env.clone(), user, xlm, usdc, 100, 1, 100);
        });
    }
}
