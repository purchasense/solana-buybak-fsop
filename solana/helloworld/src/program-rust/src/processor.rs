use std::mem;
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
    program_pack::{IsInitialized, Pack},
};

use crate::{account_state::ProgramAccountState}; 
use crate::{instruction::MessagingAccount, instruction::AccountStore, instruction::ClientPairInstruction};

// Program entrypoint's implementation
pub struct Processor;

/// Initialize the programs account, which is the first in accounts
fn initialize_account(accounts: &[AccountInfo], program_id: &Pubkey, retailer: String, stock: String) -> ProgramResult {
    msg!("initialize_account()");

    // Iterating accounts is safer than indexing
    let accounts_iter = &mut accounts.iter();

    // Get the account to say hello to
    let account = next_account_info(accounts_iter)?;

    // The account must be owned by the program in order to modify its data
    if account.owner != program_id {
        msg!("StockAccount does not have the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    }

    let mut account_data = account.data.borrow_mut();

    // Just using unpack will check to see if initialized and will
    // fail if not
    let mut account_state = ProgramAccountState::unpack_unchecked(&account_data)?;

    // Where this is a logic error in trying to initialize the same
    // account more than once
    if !account_state.is_initialized() {
        account_state.set_initialized();
    }

    msg!("btree_storage: {} --> {}", retailer, stock);
    account_state.add(retailer, stock)?;

    ProgramAccountState::pack(account_state, &mut account_data).unwrap();

    Ok(())
}

/// Initialize the programs account, which is the first in accounts
fn find_retailer(accounts: &[AccountInfo], program_id: &Pubkey, retailer: String) -> ProgramResult {
    msg!("find_retailer()");

    // Iterating accounts is safer than indexing
    let accounts_iter = &mut accounts.iter();

    // Get the account to say hello to
    let account = next_account_info(accounts_iter)?;

    // The account must be owned by the program in order to modify its data
    if account.owner != program_id {
        msg!("StockAccount does not have the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    }

    let mut account_data = account.data.borrow_mut();

    // Just using unpack will check to see if initialized and will
    // fail if not
    let mut account_state = ProgramAccountState::unpack_unchecked(&account_data)?;

    // Where this is a logic error in trying to initialize the same
    // account more than once
    if !account_state.is_initialized() {
        account_state.set_initialized();
    }

    let value = account_state.get(retailer);
    msg!("find_retailer() = {}", value);

    ProgramAccountState::pack(account_state, &mut account_data).unwrap();

    Ok(())
}

impl Processor {

    pub fn process(
        program_id:         &Pubkey,        // Public key of the account the hello world program was loaded into
        accounts:           &[AccountInfo], // The account to say hello to
        instruction_data:   &[u8],          // Ignored, all helloworld instructions are hellos
    ) -> ProgramResult {
        msg!("Hello World Rust program entrypoint for Nikita Nikolashin!");

        let instruction = ClientPairInstruction::unpack(instruction_data)?;

        let (cprice, cquantity, cretailer, cstock) = match instruction {
            ClientPairInstruction::ClientOne { price, quantity, retailer, stock } => {
                msg!("ClientPairInstruction::ClientOne");
                (price, quantity, retailer, stock)
            }
            ClientPairInstruction::ClientTwo { price, quantity, retailer, stock } => {
                msg!("ClientPairInstruction::ClientTwo");
                (price, quantity, retailer, stock)
            }
            ClientPairInstruction::ClientThree { price, quantity, retailer, stock } => {
                msg!("ClientPairInstruction::ClientThree");
                (price, quantity, retailer, stock)
            }
            ClientPairInstruction::InitializeAccount { price: _, quantity: _, retailer, stock} => {
                msg!("ClientPairInstruction::InitializeAccount");
                let _outcome = initialize_account(accounts, program_id, retailer, stock);
                (0, 0, "".to_string(), "".to_string())
            }
            ClientPairInstruction::FindRetailer { price: _, quantity: _, retailer, stock: _} => {
                msg!("ClientPairInstruction::FindRetailer");
                let _outcome = find_retailer(accounts, program_id, retailer);
                (0, 0, "".to_string(), "".to_string())
            }
        };

        msg!("Setting price {}, quantity {} stock {}", cprice, cquantity, cstock);

        if cquantity != 0 {
            // Iterating accounts is safer than indexing
            let accounts_iter = &mut accounts.iter();

            // Get the account to say hello to
            let account = next_account_info(accounts_iter)?;

            // The account must be owned by the program in order to modify its data
            if account.owner != program_id {
                msg!("StockAccount does not have the correct program id");
                return Err(ProgramError::IncorrectProgramId);
            }

            let mut data = AccountStore::<MessagingAccount>::unpack(&account.data.as_ref().borrow()).unwrap();

            let user_data = MessagingAccount {
                price:    cprice,
                quantity: cquantity,
                retailer: cretailer.into(),
                stock:    cstock.into(),
            };

            msg!("user_data.size {} {}", mem::size_of::<MessagingAccount>(), AccountStore::<MessagingAccount>::size_of());
            data.add_data(user_data);
            data.pack(&mut &mut account.data.borrow_mut()[..]).unwrap();
        }

        Ok(())
    }
}

// Sanity tests
#[cfg(test)]
mod test {
    use super::*;
    use solana_program::clock::Epoch;
    use std::mem;

    #[test]
    fn test_sanity() {
        let program_id = Pubkey::default();
        let key = Pubkey::default();
        let mut lamports = 0;
        let mut data = vec![0; mem::size_of::<u32>()];
        let owner = Pubkey::default();
        let account = AccountInfo::new(
            &key,
            false,
            true,
            &mut lamports,
            &mut data,
            &owner,
            false,
            Epoch::default(),
        );
        let instruction_data: Vec<u8> = Vec::new();

        let accounts = vec![account];

        process_instruction(&program_id, &accounts, &instruction_data).unwrap();
        /*
        assert_eq!(
            GreetingAccount::try_from_slice(&accounts[0].data.borrow())
                .unwrap()
                .counter,
            1
        );
        */
        process_instruction(&program_id, &accounts, &instruction_data).unwrap();
        /*
        assert_eq!(
            GreetingAccount::try_from_slice(&accounts[0].data.borrow())
                .unwrap()
                .counter,
            2
        );
        */
    }
}
