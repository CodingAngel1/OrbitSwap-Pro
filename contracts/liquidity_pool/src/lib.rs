#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, contracterror, panic_with_error, Address, Env, Symbol};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 3,
    InvalidInput = 5,
    InvalidAmount = 102,
    ZeroLiquidity = 204,
    MinimumLiquidity = 203,
    InsufficientLPTokens = 201,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct Asset {
    pub code: Symbol,
    pub issuer: Option<Address>,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct FeeSplit {
    pub lp_fee: i128,
    pub protocol: i128,
    pub total: i128,
}

#[contract]
pub struct PoolContract;

#[contractimpl]
impl PoolContract {
    pub fn init(env: Env, admin: Address, ta: Asset, tb: Asset, fee_bps: u32) {
        if env.storage().instance().has(&Symbol::new(&env, "init")) {
            panic_with_error!(env, Error::AlreadyInitialized);
        }
        if ta == tb { panic_with_error!(env, Error::InvalidInput); }
        env.storage().instance().set(&Symbol::new(&env, "admin"), &admin);
        env.storage().instance().set(&Symbol::new(&env, "ta"), &ta);
        env.storage().instance().set(&Symbol::new(&env, "tb"), &tb);
        env.storage().instance().set(&Symbol::new(&env, "ra"), &0i128);
        env.storage().instance().set(&Symbol::new(&env, "rb"), &0i128);
        env.storage().instance().set(&Symbol::new(&env, "fb"), &fee_bps);
        env.storage().instance().set(&Symbol::new(&env, "sh"), &0i128);
        env.storage().instance().set(&Symbol::new(&env, "init"), &true);
        env.events().publish((Symbol::new(&env, "pool_init"),), (ta, tb, fee_bps));
    }

    pub fn add_liq(env: Env, provider: Address, aa: i128, ab: i128) -> i128 {
        if aa <= 0 || ab <= 0 { panic_with_error!(env, Error::InvalidAmount); }
        let ra: i128 = env.storage().instance().get(&Symbol::new(&env, "ra")).unwrap_or(0);
        let rb: i128 = env.storage().instance().get(&Symbol::new(&env, "rb")).unwrap_or(0);
        let ts: i128 = env.storage().instance().get(&Symbol::new(&env, "sh")).unwrap_or(0);

        let shares = if ts == 0 {
            let s = aa * ab / 1000;
            if s <= 1000 { panic_with_error!(env, Error::MinimumLiquidity); }
            s
        } else {
            let sa = aa * ts / ra;
            let sb = ab * ts / rb;
            let s = if sa < sb { sa } else { sb };
            if s <= 0 { panic_with_error!(env, Error::InsufficientLPTokens); }
            s
        };

        env.storage().instance().set(&Symbol::new(&env, "ra"), &(ra + aa));
        env.storage().instance().set(&Symbol::new(&env, "rb"), &(rb + ab));
        env.storage().instance().set(&Symbol::new(&env, "sh"), &(ts + shares));
        env.events().publish((Symbol::new(&env, "liq_add"),), (provider, aa, ab, shares));
        shares
    }

    pub fn rem_liq(env: Env, provider: Address, shares: i128) -> (i128, i128) {
        if shares <= 0 { panic_with_error!(env, Error::InvalidAmount); }
        let ra: i128 = env.storage().instance().get(&Symbol::new(&env, "ra")).unwrap_or(0);
        let rb: i128 = env.storage().instance().get(&Symbol::new(&env, "rb")).unwrap_or(0);
        let ts: i128 = env.storage().instance().get(&Symbol::new(&env, "sh")).unwrap_or(0);
        if shares > ts { panic_with_error!(env, Error::InsufficientLPTokens); }

        let aa = shares * ra / ts;
        let ab = shares * rb / ts;
        env.storage().instance().set(&Symbol::new(&env, "ra"), &(ra - aa));
        env.storage().instance().set(&Symbol::new(&env, "rb"), &(rb - ab));
        env.storage().instance().set(&Symbol::new(&env, "sh"), &(ts - shares));
        env.events().publish((Symbol::new(&env, "liq_rem"),), (provider, aa, ab, shares));
        (aa, ab)
    }

    pub fn swap(env: Env, in_a: Asset, out_a: Asset, in_amt: i128, min_out: i128) -> (i128, i128) {
        let ta: Asset = env.storage().instance().get(&Symbol::new(&env, "ta")).expect("no ta");
        let tb: Asset = env.storage().instance().get(&Symbol::new(&env, "tb")).expect("no tb");
        let is_a = in_a == ta;
        if !(if is_a { out_a == tb } else { out_a == ta }) { panic_with_error!(env, Error::InvalidInput); }

        let ra: i128 = env.storage().instance().get(&Symbol::new(&env, "ra")).unwrap_or(0);
        let rb: i128 = env.storage().instance().get(&Symbol::new(&env, "rb")).unwrap_or(0);
        let fb: u32 = env.storage().instance().get(&Symbol::new(&env, "fb")).unwrap_or(30);

        let (ir, or_) = if is_a { (ra, rb) } else { (rb, ra) };
        if ir <= 0 || or_ <= 0 { panic_with_error!(env, Error::ZeroLiquidity); }

        let fee = in_amt * fb as i128 / 10000;
        let out = (in_amt - fee) * or_ / (ir + in_amt - fee);
        if out < min_out { panic_with_error!(env, Error::InvalidInput); }

        if is_a {
            env.storage().instance().set(&Symbol::new(&env, "ra"), &(ra + in_amt));
            env.storage().instance().set(&Symbol::new(&env, "rb"), &(rb - out));
        } else {
            env.storage().instance().set(&Symbol::new(&env, "ra"), &(ra - out));
            env.storage().instance().set(&Symbol::new(&env, "rb"), &(rb + in_amt));
        }
        (out, fee)
    }

    pub fn get_reserves(env: Env) -> (i128, i128) {
        (env.storage().instance().get(&Symbol::new(&env, "ra")).unwrap_or(0),
         env.storage().instance().get(&Symbol::new(&env, "rb")).unwrap_or(0))
    }

    pub fn get_shares(env: Env) -> i128 {
        env.storage().instance().get(&Symbol::new(&env, "sh")).unwrap_or(0)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use core::cell::Cell;

    #[test]
    fn test_add_remove() {
        let env = Env::default();
        env.mock_all_auths();
        let admin = Address::generate(&env);
        let p = Address::generate(&env);
        let id = env.register_contract(None, PoolContract);
        let ta = Asset { code: Symbol::new(&env, "XLM"), issuer: None };
        let tb = Asset { code: Symbol::new(&env, "USDC"), issuer: None };

        env.as_contract(&id, || {
            PoolContract::init(env.clone(), admin.clone(), ta.clone(), tb.clone(), 30);
        });

        let shares = Cell::new(0i128);
        env.as_contract(&id, || {
            let s = PoolContract::add_liq(env.clone(), p.clone(), 1000000, 100000);
            shares.set(s);
        });
        assert!(shares.get() > 0);

        let reserves_a = Cell::new(0i128);
        let reserves_b = Cell::new(0i128);
        env.as_contract(&id, || {
            let (a, b) = PoolContract::get_reserves(env.clone());
            reserves_a.set(a);
            reserves_b.set(b);
        });
        assert_eq!(reserves_a.get(), 1000000);
        assert_eq!(reserves_b.get(), 100000);
    }

    #[test]
    fn test_swap() {
        let env = Env::default();
        env.mock_all_auths();
        let admin = Address::generate(&env);
        let p = Address::generate(&env);
        let id = env.register_contract(None, PoolContract);
        let ta = Asset { code: Symbol::new(&env, "XLM"), issuer: None };
        let tb = Asset { code: Symbol::new(&env, "USDC"), issuer: None };

        env.as_contract(&id, || {
            PoolContract::init(env.clone(), admin.clone(), ta.clone(), tb.clone(), 30);
        });
        env.as_contract(&id, || {
            PoolContract::add_liq(env.clone(), p.clone(), 1000000, 100000);
        });

        let out_val = Cell::new(0i128);
        let fee_val = Cell::new(0i128);
        env.as_contract(&id, || {
            let (out, fee) = PoolContract::swap(env.clone(), ta, tb, 100000, 1);
            out_val.set(out);
            fee_val.set(fee);
        });
        assert!(out_val.get() > 0);
        assert!(fee_val.get() > 0);
    }
}
