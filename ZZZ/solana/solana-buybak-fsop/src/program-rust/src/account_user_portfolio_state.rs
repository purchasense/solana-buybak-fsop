//! @brief state manages account data

use crate::error::SampleError;
use crate::{shared_lib::ACCOUNT_STATE_SPACE, shared_lib::pack_user_portfolio_into_slice, shared_lib::unpack_user_portfolio_from_slice};
use solana_program::{
    msg,
    entrypoint::ProgramResult,
    program_error::ProgramError,
    program_pack::{IsInitialized, Pack, Sealed},
};
use std::collections::BTreeMap;

use crate::{instruction::UserPortfolio};

/// Maintains global accumulator
#[derive(Debug, Default)]
pub struct UserPortfolioState {
    is_initialized: bool,
    btree_storage: BTreeMap<String, UserPortfolio>,
}

impl UserPortfolioState {
    ///
    pub fn set_initialized(&mut self) {
        self.is_initialized = true;
    }
    /// Adds a new key/value pair to the account
    pub fn add(&mut self, username: String, fsop: u32, stock: String) -> ProgramResult {
        if self.btree_storage.contains_key(&stock) {
            self.remove(&stock)?;
        }
        match self.btree_storage.contains_key(&stock) {
            true => Err(SampleError::KeyAlreadyExists.into()),
            false => {
                msg!("btree.insert({} -> {} {})", stock.clone(), fsop, username.clone());
                let key = stock.clone();
                let bbk = UserPortfolio {
                    username: username.into(),
                    fsop:     fsop,
                    stock:    stock.into(),
                };
                self.btree_storage.insert(key, bbk);
                Ok(())
            }
        }
    }

    pub fn get(&self, stock: String) -> Option<&UserPortfolio> {
        msg!("btree_storage.get({})", stock.clone());
        // self.btree_storage.get(&stock).unwrap()

        match self.btree_storage.get(&stock) {
            Some(user_portfolio) => std::option::Option::Some(user_portfolio),
            None => std::option::Option::None,
        }
    }

    /// Removes a key from account and returns the keys value
    pub fn remove(&mut self, key: &str) -> Result<UserPortfolio, SampleError> {
        match self.btree_storage.contains_key(key) {
            true => Ok(self.btree_storage.remove(key).unwrap()),
            false => Err(SampleError::KeyNotFoundInAccount),
        }
    }

    /// Removes a key from account and returns the keys value
    pub fn get_btree_ptr(&mut self) -> & BTreeMap<String, UserPortfolio> {
        &self.btree_storage
    }

    pub fn print(&mut self) -> ProgramResult {
        
        /* 
        for (retailer, bbk) in &self.btree_storage {
            msg!("BTREE: {} => {:?}", retailer, bbk);
        }
         */
        Ok(())
    }
}

impl Sealed for UserPortfolioState {}

impl IsInitialized for UserPortfolioState {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

impl Pack for UserPortfolioState {

    const LEN: usize = ACCOUNT_STATE_SPACE;

    /// Store 'state' of account to its data area
    fn pack_into_slice(&self, dst: &mut [u8]) {
        pack_user_portfolio_into_slice(self.is_initialized, &self.btree_storage, dst);
    }

    /// Retrieve 'state' of account from account data area
    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        match unpack_user_portfolio_from_slice(src) {
            Ok((is_initialized, btree_map)) => Ok(UserPortfolioState {
                is_initialized,
                btree_storage: btree_map,
            }),
            Err(_) => Err(ProgramError::InvalidAccountData),
        }
    }
}
