#![no_std]
use soroban_sdk::{contract, contractimpl, contracterror, panic_with_error, Address, Env, Symbol};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 3,
    InvalidAmount = 102,
    FeeVaultEmpty = 302,
}

#[contract]
pub struct VaultContract;

#[contractimpl]
impl VaultContract {
    pub fn init(env: Env, admin: Address, treasury: Address) {
        if env.storage().instance().has(&Symbol::new(&env, "init")) {
            panic_with_error!(env, Error::AlreadyInitialized);
        }
        env.storage().instance().set(&Symbol::new(&env, "admin"), &admin);
        env.storage().instance().set(&Symbol::new(&env, "treasury"), &treasury);
        env.storage().instance().set(&Symbol::new(&env, "collected"), &0i128);
        env.storage().instance().set(&Symbol::new(&env, "init"), &true);
        env.events().publish((Symbol::new(&env, "vault_init"),), (admin, treasury));
    }

    pub fn deposit_fee(env: Env, fee: i128) {
        if fee <= 0 { panic_with_error!(env, Error::InvalidAmount); }
        let c: i128 = env.storage().instance().get(&Symbol::new(&env, "collected")).unwrap_or(0);
        env.storage().instance().set(&Symbol::new(&env, "collected"), &(c + fee));
        env.events().publish((Symbol::new(&env, "fee_in"),), (fee, c + fee));
    }

    pub fn distribute(env: Env, amount: i128) {
        let c: i128 = env.storage().instance().get(&Symbol::new(&env, "collected")).unwrap_or(0);
        if c == 0 { panic_with_error!(env, Error::FeeVaultEmpty); }
        let d = if amount == 0 || amount > c { c } else { amount };
        env.storage().instance().set(&Symbol::new(&env, "collected"), &(c - d));
        env.events().publish((Symbol::new(&env, "fee_out"),), (d, c - d));
    }

    pub fn get_collected(env: Env) -> i128 {
        env.storage().instance().get(&Symbol::new(&env, "collected")).unwrap_or(0)
    }

    pub fn get_treasury(env: Env) -> Address {
        env.storage().instance().get(&Symbol::new(&env, "treasury")).expect("no treasury")
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;

    #[test]
    fn test_deposit() {
        let env = Env::default();
        env.mock_all_auths();
        let admin = Address::generate(&env);
        let t = Address::generate(&env);
        let id = env.register_contract(None, VaultContract);
        VaultContract::init(&env, &id, &admin, &t);
        VaultContract::deposit_fee(&env, &id, 1000);
        assert_eq!(VaultContract::get_collected(&env, &id), 1000);
    }

    #[test]
    fn test_distribute() {
        let env = Env::default();
        env.mock_all_auths();
        let admin = Address::generate(&env);
        let t = Address::generate(&env);
        let id = env.register_contract(None, VaultContract);
        VaultContract::init(&env, &id, &admin, &t);
        VaultContract::deposit_fee(&env, &id, 1000);
        VaultContract::distribute(&env, &id, 500);
        assert_eq!(VaultContract::get_collected(&env, &id), 500);
    }
}
