//! @brief state manages account data

use crate::error::SampleError;
use crate::{shared_lib::ACCOUNT_STATE_SPACE, shared_lib::pack_user_profile_into_slice, shared_lib::unpack_user_profile_from_slice};
use solana_program::{
    msg,
    entrypoint::ProgramResult,
    program_error::ProgramError,
    program_pack::{IsInitialized, Pack, Sealed},
};
use std::collections::BTreeMap;

use crate::{instruction::UserProfile};

/// Maintains global accumulator
#[derive(Debug, Default)]
pub struct UserProfileState {
    is_initialized: bool,
    btree_storage: BTreeMap<String, UserProfile>,
}

impl UserProfileState {
    ///
    pub fn set_initialized(&mut self) {
        self.is_initialized = true;
    }
    /// Adds a new key/value pair to the account
    pub fn add(&mut self, username: String, fullname: String, email: String, phone: String, address: String) -> ProgramResult {
        if self.btree_storage.contains_key(&username) {
            self.remove(&username)?;
        }
        match self.btree_storage.contains_key(&username) {
            true => Err(SampleError::KeyAlreadyExists.into()),
            false => {
                msg!("btree.insert({} {})", username.clone(), fullname.clone());
                let key = username.clone();
                let bbk = UserProfile {
                    username: username.into(),
                    fullname: fullname.into(),
                    email:    email.into(),
                    phone:    phone.into(),
                    address:  address.into(),
                };
                self.btree_storage.insert(key, bbk);
                Ok(())
            }
        }
    }

    pub fn get(&self, username: String) -> Option<&UserProfile> {
        msg!("btree_storage.get({})", username.clone());
        // self.btree_storage.get(&stock).unwrap()

        match self.btree_storage.get(&username) {
            Some(user_profile) => std::option::Option::Some(user_profile),
            None => std::option::Option::None,
        }
    }

    /// Removes a key from account and returns the keys value
    pub fn remove(&mut self, username: &str) -> Result<UserProfile, SampleError> {
        match self.btree_storage.contains_key(username) {
            true => Ok(self.btree_storage.remove(username).unwrap()),
            false => Err(SampleError::KeyNotFoundInAccount),
        }
    }

    /// Removes a key from account and returns the keys value
    pub fn get_btree_ptr(&mut self) -> & BTreeMap<String, UserProfile> {
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

impl Sealed for UserProfileState {}

impl IsInitialized for UserProfileState {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

impl Pack for UserProfileState {

    const LEN: usize = ACCOUNT_STATE_SPACE;

    /// Store 'state' of account to its data area
    fn pack_into_slice(&self, dst: &mut [u8]) {
        pack_user_profile_into_slice(self.is_initialized, &self.btree_storage, dst);
    }

    /// Retrieve 'state' of account from account data area
    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        match unpack_user_profile_from_slice(src) {
            Ok((is_initialized, btree_map)) => Ok(UserProfileState {
                is_initialized,
                btree_storage: btree_map,
            }),
            Err(_) => Err(ProgramError::InvalidAccountData),
        }
    }
}
