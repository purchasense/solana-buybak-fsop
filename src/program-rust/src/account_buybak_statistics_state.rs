//! @brief state manages account data

use crate::error::SampleError;
use crate::{shared_lib::ACCOUNT_STATE_SPACE, shared_lib::pack_buybak_statistics_into_slice, shared_lib::unpack_buybak_statistics_from_slice};
use solana_program::{
    msg,
    entrypoint::ProgramResult,
    program_error::ProgramError,
    program_pack::{IsInitialized, Pack, Sealed},
};
use std::collections::BTreeMap;

use crate::{instruction::BuybakStatistics};

/// Maintains global accumulator
#[derive(Debug, Default)]
pub struct BuybakStatsAccountState {
    is_initialized: bool,
    btree_storage: BTreeMap<String, BuybakStatistics>,
}

impl BuybakStatsAccountState {
    ///
    pub fn set_initialized(&mut self) {
        self.is_initialized = true;
    }
    /// Adds a new key/value pair to the account
    pub fn add(&mut self, value: u32, key: String) -> ProgramResult {
        // Let's delete the key, and then re-insert it.
        if self.btree_storage.contains_key(&key) {
            self.remove(&key)?;
        }
        match self.btree_storage.contains_key(&key) {
            true => Err(SampleError::KeyAlreadyExists.into()),
            false => {
                msg!("BBK: btree.insert({} {})", key.clone(), value.clone());
                let stock = key.clone();
                let bbk = BuybakStatistics {
                    value:    value,
                    transactions: 1,
                    stock:    stock.into(),
                };
                self.btree_storage.insert(key, bbk);
                Ok(())
            }
        }
    }

    /// update stock price
    pub fn update(&mut self, key: String, value: u32) -> ProgramResult {

        // Let's delete the key, and then re-insert it.
        let mut price = 0;
        let mut trans = 0;
        if self.btree_storage.contains_key(&key) {
            price = self.btree_storage.get(&key).unwrap().value;
            trans = self.btree_storage.get(&key).unwrap().transactions;
            self.remove(&key)?;
        }
        match self.btree_storage.contains_key(&key) {
            true => Err(SampleError::KeyAlreadyExists.into()),
            false => {
                msg!("BBK: BuybakStats::btree.insert({} {})", key.clone(), (price+value));
                let stock = key.clone();
                let bbk = BuybakStatistics {
                    value: (price + value),
                    transactions: (trans + 1),
                    stock:    stock.into(),
                };
                self.btree_storage.insert(key, bbk);
                Ok(())
            }
        }
    }

    pub fn get(&self, stock: String) -> Option<&BuybakStatistics> {
        msg!("BBK: btree_storage.get({})", stock.clone());
        // self.btree_storage.get(&stock).unwrap()

        match self.btree_storage.get(&stock) {
            Some(buybak_statistics) => std::option::Option::Some(buybak_statistics),
            None => std::option::Option::None,
        }
    }

    /// Removes a key from account and returns the keys value
    pub fn remove(&mut self, key: &str) -> Result<BuybakStatistics, SampleError> {
        match self.btree_storage.contains_key(key) {
            true => Ok(self.btree_storage.remove(key).unwrap()),
            false => Err(SampleError::KeyNotFoundInAccount),
        }
    }

    /// Removes a key from account and returns the keys value
    pub fn get_btree_ptr(&mut self) -> & BTreeMap<String, BuybakStatistics> {
        &self.btree_storage
    }

    pub fn print(&mut self) -> ProgramResult {
        
        for (retailer, bbk) in &self.btree_storage {
            msg!("BBK: BTREE: {} => {:?}", retailer, bbk);
        }
        Ok(())
    }
}

impl Sealed for BuybakStatsAccountState {}

impl IsInitialized for BuybakStatsAccountState {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

impl Pack for BuybakStatsAccountState {

    const LEN: usize = ACCOUNT_STATE_SPACE;

    /// Store 'state' of account to its data area
    fn pack_into_slice(&self, dst: &mut [u8]) {
        pack_buybak_statistics_into_slice(self.is_initialized, &self.btree_storage, dst);
    }

    /// Retrieve 'state' of account from account data area
    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        match unpack_buybak_statistics_from_slice(src) {
            Ok((is_initialized, btree_map)) => Ok(BuybakStatsAccountState {
                is_initialized,
                btree_storage: btree_map,
            }),
            Err(_) => Err(ProgramError::InvalidAccountData),
        }
    }
}
