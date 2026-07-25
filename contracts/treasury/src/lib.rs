#![no_std]
use soroban_sdk::{contract, contractimpl, contracterror, panic_with_error, Address, Env, Symbol};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 3,
    InvalidAmount = 102,
    InsufficientBalance = 400,
    WithdrawalLimitExceeded = 401,
}

#[contract]
pub struct TreasuryContract;

#[contractimpl]
impl TreasuryContract {
    pub fn init(env: Env, admin: Address) {
        if env.storage().instance().has(&Symbol::new(&env, "init")) {
            panic_with_error!(env, Error::AlreadyInitialized);
        }
        env.storage().instance().set(&Symbol::new(&env, "admin"), &admin);
        env.storage().instance().set(&Symbol::new(&env, "balance"), &0i128);
        env.storage().instance().set(&Symbol::new(&env, "init"), &true);
        env.events().publish((Symbol::new(&env, "treasury_init"),), admin);
    }

    pub fn deposit(env: Env, amount: i128) {
        if amount <= 0 { panic_with_error!(env, Error::InvalidAmount); }
        let b: i128 = env.storage().instance().get(&Symbol::new(&env, "balance")).unwrap_or(0);
        env.storage().instance().set(&Symbol::new(&env, "balance"), &(b + amount));
        env.events().publish((Symbol::new(&env, "deposit"),), amount);
    }

    pub fn withdraw(env: Env, amount: i128, recipient: Address) {
        let admin: Address = env.storage().instance().get(&Symbol::new(&env, "admin")).expect("no admin");
        admin.require_auth();
        if amount <= 0 { panic_with_error!(env, Error::InvalidAmount); }
        let b: i128 = env.storage().instance().get(&Symbol::new(&env, "balance")).unwrap_or(0);
        if amount > b { panic_with_error!(env, Error::InsufficientBalance); }
        let max = b * 1000 / 10000;
        if amount > max { panic_with_error!(env, Error::WithdrawalLimitExceeded); }
        env.storage().instance().set(&Symbol::new(&env, "balance"), &(b - amount));
        env.events().publish((Symbol::new(&env, "withdraw"),), (amount, recipient));
    }

    pub fn get_balance(env: Env) -> i128 {
        env.storage().instance().get(&Symbol::new(&env, "balance")).unwrap_or(0)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;

    #[test]
    fn test_deposit_withdraw() {
        let env = Env::default();
        env.mock_all_auths();
        let admin = Address::generate(&env);
        let id = env.register_contract(None, TreasuryContract);
        TreasuryContract::init(&env, &id, &admin);
        TreasuryContract::deposit(&env, &id, 10000);
        assert_eq!(TreasuryContract::get_balance(&env, &id), 10000);
        let r = Address::generate(&env);
        TreasuryContract::withdraw(&env, &id, 500, &r);
        assert_eq!(TreasuryContract::get_balance(&env, &id), 9500);
    }
}
