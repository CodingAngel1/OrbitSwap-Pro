#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, contracterror, panic_with_error, Address, Env, Symbol};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 3,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct SwapEv {
    pub sender: Address,
    pub in_asset: Symbol,
    pub out_asset: Symbol,
    pub in_amt: i128,
    pub out_amt: i128,
    pub fee: i128,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct LiqEv {
    pub provider: Address,
    pub ta: Symbol,
    pub tb: Symbol,
    pub aa: i128,
    pub ab: i128,
    pub shares: i128,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct FeeEv {
    pub source: Symbol,
    pub amount: i128,
    pub dest: Address,
}

#[contract]
pub struct EventContract;

#[contractimpl]
impl EventContract {
    pub fn init(env: Env, admin: Address) {
        if env.storage().instance().has(&Symbol::new(&env, "init")) {
            panic_with_error!(env, Error::AlreadyInitialized);
        }
        env.storage().instance().set(&Symbol::new(&env, "admin"), &admin);
        env.storage().instance().set(&Symbol::new(&env, "count"), &0i128);
        env.storage().instance().set(&Symbol::new(&env, "init"), &true);
        env.events().publish((Symbol::new(&env, "evt_init"),), admin);
    }

    pub fn emit_swap(env: Env, sender: Address, in_a: Symbol, out_a: Symbol, in_amt: i128, out_amt: i128, fee: i128) {
        let c: i128 = env.storage().instance().get(&Symbol::new(&env, "count")).unwrap_or(0);
        env.storage().instance().set(&Symbol::new(&env, "count"), &(c + 1));
        env.events().publish((Symbol::new(&env, "swap_evt"),), SwapEv { sender, in_asset: in_a, out_asset: out_a, in_amt, out_amt, fee });
    }

    pub fn emit_liq(env: Env, provider: Address, ta: Symbol, tb: Symbol, aa: i128, ab: i128, shares: i128, add: bool) {
        env.events().publish(
            (if add { Symbol::new(&env, "liq_add") } else { Symbol::new(&env, "liq_rem") },),
            LiqEv { provider, ta, tb, aa, ab, shares },
        );
    }

    pub fn emit_fee(env: Env, source: Symbol, amount: i128, dest: Address) {
        env.events().publish((Symbol::new(&env, "fee_evt"),), FeeEv { source, amount, dest });
    }

    pub fn get_count(env: Env) -> i128 {
        env.storage().instance().get(&Symbol::new(&env, "count")).unwrap_or(0)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use core::cell::Cell;

    #[test]
    fn test_emit_swap() {
        let env = Env::default();
        env.mock_all_auths();
        let admin = Address::generate(&env);
        let user = Address::generate(&env);
        let id = env.register_contract(None, EventContract);

        env.as_contract(&id, || {
            EventContract::init(env.clone(), admin.clone());
        });

        env.as_contract(&id, || {
            EventContract::emit_swap(
                env.clone(), user,
                Symbol::new(&env, "XLM"), Symbol::new(&env, "USDC"),
                1000, 99, 3,
            );
        });

        let count = Cell::new(0i128);
        env.as_contract(&id, || {
            count.set(EventContract::get_count(env.clone()));
        });
        assert_eq!(count.get(), 1);
    }
}
