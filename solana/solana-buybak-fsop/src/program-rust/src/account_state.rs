//! @brief state manages account data

use crate::error::SampleError;
use crate::{shared_lib::ACCOUNT_STATE_SPACE, shared_lib::pack_buybak_portfolio_into_slice, shared_lib::unpack_buybak_portfolio_from_slice};
use solana_program::{
    msg,
    entrypoint::ProgramResult,
    program_error::ProgramError,
    program_pack::{IsInitialized, Pack, Sealed},
};
use std::collections::BTreeMap;

use crate::{instruction::BuybakPortfolio};

/// Maintains global accumulator
#[derive(Debug, Default)]
pub struct ProgramAccountState {
    is_initialized: bool,
    btree_storage: BTreeMap<String, BuybakPortfolio>,
}

impl ProgramAccountState {
    ///
    pub fn set_initialized(&mut self) {
        self.is_initialized = true;
    }
    /// Adds a new key/value pair to the account
    pub fn add(&mut self, price: u32, quantity: u32, value: String, key: String) -> ProgramResult {
        // Let's delete the key, and then re-insert it.
        if self.btree_storage.contains_key(&key) {
            self.remove(&key)?;
        }
        match self.btree_storage.contains_key(&key) {
            true => Err(SampleError::KeyAlreadyExists.into()),
            false => {
                msg!("btree.insert({} {})", key.clone(), value.clone());
                let stock = key.clone();
                let bbk = BuybakPortfolio {
                    price:    price,
                    quantity: quantity,
                    retailer: value.into(),
                    stock:    stock.into(),
                };
                self.btree_storage.insert(key, bbk);
                Ok(())
            }
        }
    }

    pub fn get(&self, stock: String) -> Option<&BuybakPortfolio> {
        msg!("btree_storage.get({})", stock.clone());
        // self.btree_storage.get(&stock).unwrap()

        match self.btree_storage.get(&stock) {
            Some(buybak_portfolio) => std::option::Option::Some(buybak_portfolio),
            None => std::option::Option::None,
        }
    }

    /// Removes a key from account and returns the keys value
    pub fn remove(&mut self, key: &str) -> Result<BuybakPortfolio, SampleError> {
        match self.btree_storage.contains_key(key) {
            true => Ok(self.btree_storage.remove(key).unwrap()),
            false => Err(SampleError::KeyNotFoundInAccount),
        }
    }

    /// Removes a key from account and returns the keys value
    pub fn get_btree_ptr(&mut self) -> & BTreeMap<String, BuybakPortfolio> {
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

impl Sealed for ProgramAccountState {}

impl IsInitialized for ProgramAccountState {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

impl Pack for ProgramAccountState {

    const LEN: usize = ACCOUNT_STATE_SPACE;

    /// Store 'state' of account to its data area
    fn pack_into_slice(&self, dst: &mut [u8]) {
        pack_buybak_portfolio_into_slice(self.is_initialized, &self.btree_storage, dst);
    }

    /// Retrieve 'state' of account from account data area
    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        match unpack_buybak_portfolio_from_slice(src) {
            Ok((is_initialized, btree_map)) => Ok(ProgramAccountState {
                is_initialized,
                btree_storage: btree_map,
            }),
            Err(_) => Err(ProgramError::InvalidAccountData),
        }
    }
}
