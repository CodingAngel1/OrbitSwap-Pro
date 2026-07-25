#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, contracterror, panic_with_error, Address, Env, Symbol, Vec};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 3,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct SwapRec {
    pub sender: Address,
    pub in_asset: Symbol,
    pub out_asset: Symbol,
    pub in_amt: i128,
    pub out_amt: i128,
    pub fee: i128,
}

#[contract]
pub struct RegistryContract;

#[contractimpl]
impl RegistryContract {
    pub fn init(env: Env, admin: Address) {
        if env.storage().instance().has(&Symbol::new(&env, "init")) {
            panic_with_error!(env, Error::AlreadyInitialized);
        }
        env.storage().instance().set(&Symbol::new(&env, "admin"), &admin);
        env.storage().instance().set(&Symbol::new(&env, "count"), &0i128);
        env.storage().instance().set(&Symbol::new(&env, "init"), &true);
        env.events().publish((Symbol::new(&env, "reg_init"),), admin);
    }

    pub fn record(env: Env, sender: Address, in_a: Symbol, out_a: Symbol, in_amt: i128, out_amt: i128, fee: i128) {
        let c: i128 = env.storage().instance().get(&Symbol::new(&env, "count")).unwrap_or(0);
        let idx = c + 1;
        env.storage().instance().set(&Symbol::new(&env, "count"), &idx);

        let rec = SwapRec { sender, in_asset: in_a, out_asset: out_a, in_amt, out_amt, fee };
        env.storage().instance().set(&Symbol::new(&env, "last"), &rec);
        env.events().publish((Symbol::new(&env, "recorded"),), idx);
    }

    pub fn get_count(env: Env) -> i128 {
        env.storage().instance().get(&Symbol::new(&env, "count")).unwrap_or(0)
    }

    pub fn get_last(env: Env) -> SwapRec {
        env.storage().instance().get(&Symbol::new(&env, "last")).expect("no records")
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;

    #[test]
    fn test_record() {
        let env = Env::default();
        env.mock_all_auths();
        let admin = Address::generate(&env);
        let user = Address::generate(&env);
        let id = env.register_contract(None, RegistryContract);
        RegistryContract::init(&env, &id, &admin);

        RegistryContract::record(&env, &id, user.clone(), Symbol::new(&env, "XLM"), Symbol::new(&env, "USDC"), 1000, 99, 3);
        assert_eq!(RegistryContract::get_count(&env, &id), 1);

        let last = RegistryContract::get_last(&env, &id);
        assert_eq!(last.sender, user);
    }
}
