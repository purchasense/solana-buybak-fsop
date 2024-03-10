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
use crate::{instruction::BuybakPortfolio, instruction::AccountStore, instruction::ClientPairInstruction};

// Program entrypoint's implementation
pub struct Processor;

/// Initialize the programs account, which is the first in accounts
fn initialize_account(accounts: &[AccountInfo], program_id: &Pubkey, price: u32, quantity: u32, retailer: String, stock: String) -> ProgramResult {
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

    msg!("btree_storage: {} --> {} @ {} = {} {}", stock, quantity, price,  retailer, stock);
    account_state.add(price, quantity, retailer, stock)?;

    ProgramAccountState::pack(account_state, &mut account_data).unwrap();

    Ok(())
}

/// Initialize the programs account, which is the first in accounts
fn find_retailer(accounts: &[AccountInfo], program_id: &Pubkey, stock: String) -> ProgramResult {
    msg!("find_retailer({})", stock.clone());

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

    let opt = account_state.get(stock);
    msg!("find_retailer() = {:?}", opt.unwrap());
    let _result = account_state.print();


    /*
    let btree = account_state.get_btree_ptr();

    for (retailer, bbkportfolio) in btree {
        msg!("{} => {:?}", retailer, bbkportfolio);
    }
    */

    ProgramAccountState::pack(account_state, &mut account_data).unwrap();

    Ok(())
}

fn call_init_user_portfolio(_accounts: &[AccountInfo], _program_id: &Pubkey, username: String, fullname: String, email: String, phone: String, address: String) -> ProgramResult {

    msg!("call_init_user_portfolio({} {} {} {} {})", username, fullname, email, phone, address);
    Ok(())
}
fn call_update_user_portfolio(_accounts: &[AccountInfo], _program_id: &Pubkey, username: String, fsop: u32, stock: String) -> ProgramResult {

    msg!("call_update_user_portfolio({} {} {})", username, fsop, stock);
    Ok(())
}

fn call_client_payload_pair(accounts: &[AccountInfo], program_id: &Pubkey, cprice: u32, cquantity: u32, cretailer: String, cstock: String) -> ProgramResult {
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

            let mut data = AccountStore::<BuybakPortfolio>::unpack(&account.data.as_ref().borrow()).unwrap();

            let user_data = BuybakPortfolio {
                price:    cprice,
                quantity: cquantity,
                retailer: cretailer.into(),
                stock:    cstock.into(),
            };

            msg!("user_data.size {} {}", mem::size_of::<BuybakPortfolio>(), AccountStore::<BuybakPortfolio>::size_of());
            data.add_data(user_data);
            data.pack(&mut &mut account.data.borrow_mut()[..]).unwrap();
        }

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

        match instruction {
            ClientPairInstruction::ClientOne ( price, quantity, retailer, stock ) => {
                msg!("ClientPairInstruction::ClientOne");
                call_client_payload_pair(accounts, program_id, price, quantity, retailer, stock)
            }
            ClientPairInstruction::ClientTwo ( price, quantity, retailer, stock ) => {
                msg!("ClientPairInstruction::ClientTwo");
                call_client_payload_pair(accounts, program_id, price, quantity, retailer, stock)
            }
            ClientPairInstruction::ClientThree ( price, quantity, retailer, stock ) => {
                msg!("ClientPairInstruction::ClientThree");
                call_client_payload_pair(accounts, program_id, price, quantity, retailer, stock)
            }
            ClientPairInstruction::InitializeAccount ( price, quantity, retailer, stock) => {
                msg!("ClientPairInstruction::InitializeAccount");
                initialize_account(accounts, program_id, price, quantity, retailer, stock)
            }
            ClientPairInstruction::FindRetailer ( _price, _quantity, _retailer, stock) => {
                msg!("ClientPairInstruction::FindRetailer");
                find_retailer(accounts, program_id, stock)
            }
            ClientPairInstruction::InitUserPortfolio ( username, fullname, email, phone, address) => {
                msg!("ClientPairInstruction::InitUserPortfolio");
                call_init_user_portfolio(accounts, program_id, username, fullname, email, phone, address)
            }
            ClientPairInstruction::UpdateUserPortfolio ( username, fsop, stock) => {
                msg!("ClientPairInstruction::UpdateUserPortfolio");
                call_update_user_portfolio(accounts, program_id, username, fsop, stock)
            }
        }
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
