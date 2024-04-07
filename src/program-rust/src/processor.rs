use std::mem;
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
    program_pack::{IsInitialized, Pack},
};

use crate::{account_buybak_statistics_state::BuybakStatsAccountState, account_state::ProgramAccountState, account_user_profile_state::UserProfileState, account_user_portfolio_state::UserPortfolioState}; 
use crate::{instruction::BuybakPortfolio, instruction::AccountStore, instruction::ClientPairInstruction};

// Program entrypoint's implementation
pub struct Processor;

/// Initialize the programs account, which is the first in accounts
fn initialize_account(accounts: &[AccountInfo], program_id: &Pubkey, price: u32, quantity: u32, retailer: String, stock: String) -> ProgramResult {
    msg!("BBK: initialize_account()");

    // Iterating accounts is safer than indexing
    let accounts_iter = &mut accounts.iter();

    // Get the account to say hello to
    let account = next_account_info(accounts_iter)?;

    // The account must be owned by the program in order to modify its data
    if account.owner != program_id {
        msg!("BBK: StockAccount does not have the correct program id");
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

    msg!("BBK: btree_storage: {} --> {} @ {} = {} {}", stock, quantity, price,  retailer, stock);
    account_state.add(price, quantity, retailer, stock)?;

    ProgramAccountState::pack(account_state, &mut account_data).unwrap();

    Ok(())
}

/// Initialize the programs account, which is the first in accounts
fn find_retailer(accounts: &[AccountInfo], program_id: &Pubkey, stock: String) -> ProgramResult {
    msg!("BBK: find_retailer({})", stock.clone());

    // Iterating accounts is safer than indexing
    let accounts_iter = &mut accounts.iter();

    // Get the account to say hello to
    let account = next_account_info(accounts_iter)?;

    // The account must be owned by the program in order to modify its data
    if account.owner != program_id {
        msg!("BBK: StockAccount does not have the correct program id");
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
    msg!("BBK: find_retailer() = {:?}", opt.unwrap());
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

fn call_init_user_portfolio(accounts: &[AccountInfo], program_id: &Pubkey, username: String, fullname: String, email: String, phone: String, address: String) -> ProgramResult {

    msg!("BBK: call_init_user_portfolio({} {} {} {} {})", username, fullname, email, phone, address);

    // Iterating accounts is safer than indexing
    let accounts_iter = &mut accounts.iter();

    // Get the account to say hello to
    let account = next_account_info(accounts_iter)?;

    // The account must be owned by the program in order to modify its data
    if account.owner != program_id {
        msg!("BBK: StockAccount does not have the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    }

    let mut account_data = account.data.borrow_mut();

    // Just using unpack will check to see if initialized and will
    // fail if not
    let mut user_profile_state = UserProfileState::unpack_unchecked(&account_data)?;

    // Where this is a logic error in trying to initialize the same
    // account more than once
    if !user_profile_state.is_initialized() {
        user_profile_state.set_initialized();
    }

    msg!("BBK: btree_storage: {} --> {}, {}, {}, {}, {}", username, username, fullname, email, phone, address);
    user_profile_state.add(username, fullname, email, phone, address)?;

    UserProfileState::pack(user_profile_state, &mut account_data).unwrap();

    Ok(())
}

fn call_mint_to_user_portfolio(accounts: &[AccountInfo], program_id: &Pubkey, username: String, fsop: u32, average_price: u32, stock: String) -> ProgramResult {

    msg!("BBK: call_mint_to_user_portfolio({} {} {} {})", username, fsop, average_price, stock);

    // Iterating accounts is safer than indexing
    let accounts_iter = &mut accounts.iter();

    ////////////////////
    // User Mint Account
    ////////////////////
    let user_account = next_account_info(accounts_iter)?;
    // The account must be owned by the program in order to modify its data
    if user_account.owner != program_id {
        msg!("BBK: UserAccount does not have the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    }
    let mut user_account_data = user_account.data.borrow_mut();
    // Just using unpack will check to see if initialized and will fail if not
    let mut user_portfolio_state = UserPortfolioState::unpack_unchecked(&user_account_data)?;
    // Where this is a logic error in trying to initialize the same account more than once
    if !user_portfolio_state.is_initialized() {
        user_portfolio_state.set_initialized();
    }

    ////////////////////
    // Stock xfer Account
    ////////////////////
    let stock_account = next_account_info(accounts_iter)?;
    // The account must be owned by the program in order to modify its data
    if stock_account.owner != program_id {
        msg!("BBK: StockAccount does not have the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    }
    let mut stock_account_data = stock_account.data.borrow_mut();
    // Just using unpack will check to see if initialized and will fail if not
    let mut stock_account_state = ProgramAccountState::unpack_unchecked(&stock_account_data)?;
    // Where this is a logic error in trying to initialize the same account more than once
    if !stock_account_state.is_initialized() {
        stock_account_state.set_initialized();
    }

    ////////////////////
    // Buybak Statistics Account
    ////////////////////
    let stats_account = next_account_info(accounts_iter)?;
    // The account must be owned by the program in order to modify its data
    if stats_account.owner != program_id {
        msg!("BBK: StockAccount does not have the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    }
    let mut stats_account_data = stats_account.data.borrow_mut();
    // Just using unpack will check to see if initialized and will fail if not
    let mut stats_account_state = BuybakStatsAccountState::unpack_unchecked(&stats_account_data)?;
    // Where this is a logic error in trying to initialize the same account more than once
    if !stats_account_state.is_initialized() {
        stats_account_state.set_initialized();
    }

    // Let's get the Stock here.
    msg!("BBK: find_retailer() ------------------> for stock {} ", stock.clone());
    let opt = stock_account_state.get(stock.clone());
    
    match opt {
        Some(value) => {
            let new_value = &mut BuybakPortfolio {
                price: value.price, 
                quantity: value.quantity, 
                retailer: value.retailer.clone().into(), 
                stock: value.stock.clone().into(),
            };

            // BuybakPortfolio {price: u32, qty: u32, retailer: String, stock: String}
            msg!("BBK: find_retailer() = {:?}", value);

            // Subtract the qty 
            msg!("BBK: BEFOR STOCK --> find_retailer() = {} {}", new_value.stock.clone(), new_value.quantity);
            new_value.quantity -= fsop;
            msg!("BBK: AFTER STOCK --> find_retailer() = {} {}", new_value.stock.clone(), new_value.quantity);

            stock_account_state.update(new_value.price, new_value.quantity, new_value.retailer.clone(), new_value.stock.clone())?;

            user_portfolio_state.add(username, fsop, average_price, stock.clone())?;

            let svalue = average_price * fsop;
            stats_account_state.update(stock.clone(), svalue)?;
            let stats_opt = stats_account_state.get(stock.clone());
            match stats_opt {
                Some(value) => {
                    msg!("BBK: mint: buybak_stats {:?}", value);
                }
                None => {
                    return Err(ProgramError::IncorrectProgramId);
                }
            }

            UserPortfolioState::pack(user_portfolio_state, &mut user_account_data).unwrap();
            ProgramAccountState::pack(stock_account_state, &mut stock_account_data).unwrap();
            BuybakStatsAccountState::pack(stats_account_state, &mut stats_account_data).unwrap();
        }
        None => {
            return Err(ProgramError::IncorrectProgramId);
        }
    }

    Ok(())
}

fn call_return_from_user_portfolio(accounts: &[AccountInfo], program_id: &Pubkey, username: String, fsop: u32, stock: String) -> ProgramResult {

    msg!("BBK: call_return_from_user_portfolio({} {} {})", username, fsop, stock);

    // Iterating accounts is safer than indexing
    let accounts_iter = &mut accounts.iter();

    ////////////////////
    // User Mint Account
    ////////////////////
    let user_account = next_account_info(accounts_iter)?;
    // The account must be owned by the program in order to modify its data
    if user_account.owner != program_id {
        msg!("BBK: UserAccount does not have the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    }
    let mut user_account_data = user_account.data.borrow_mut();
    // Just using unpack will check to see if initialized and will fail if not
    let mut user_portfolio_state = UserPortfolioState::unpack_unchecked(&user_account_data)?;
    // Where this is a logic error in trying to initialize the same account more than once
    if !user_portfolio_state.is_initialized() {
        user_portfolio_state.set_initialized();
    }

    ////////////////////
    // Stock xfer Account
    ////////////////////
    let stock_account = next_account_info(accounts_iter)?;
    // The account must be owned by the program in order to modify its data
    if stock_account.owner != program_id {
        msg!("BBK: StockAccount does not have the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    }
    let mut stock_account_data = stock_account.data.borrow_mut();
    // Just using unpack will check to see if initialized and will fail if not
    let mut stock_account_state = ProgramAccountState::unpack_unchecked(&stock_account_data)?;
    // Where this is a logic error in trying to initialize the same account more than once
    if !stock_account_state.is_initialized() {
        stock_account_state.set_initialized();
    }


    // TODO TMD let _result = stock_account_state.print();

    // Let's get the Stock here.
    msg!("BBK: find_retailer() ------------------> for stock {} ", stock.clone());
    let opt = stock_account_state.get(stock.clone());
    
    match opt {
        Some(value) => {

            // Increment stock_quantity by fsop amount, keep all else equal.
            stock_account_state.add(value.price, fsop, value.retailer.clone(), value.stock.clone())?;

            // subtract fsop from user_portfolio for stock.
            user_portfolio_state.subtract(username, fsop, stock)?;

            UserPortfolioState::pack(user_portfolio_state, &mut user_account_data).unwrap();
            ProgramAccountState::pack(stock_account_state, &mut stock_account_data).unwrap();
        }
        None => {
            return Err(ProgramError::IncorrectProgramId);
        }
    }

    Ok(())
}

fn call_update_stock_prices(accounts: &[AccountInfo], program_id: &Pubkey, stock: String, price: u32) -> ProgramResult {
    msg!("BBK: call_update_stock_prices()");

    // Iterating accounts is safer than indexing
    let accounts_iter = &mut accounts.iter();

    // Get the account to say hello to
    let account = next_account_info(accounts_iter)?;

    // The account must be owned by the program in order to modify its data
    if account.owner != program_id {
        msg!("BBK: StockAccount does not have the correct program id");
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

    account_state.update_stock_price(stock, price)?;

    ProgramAccountState::pack(account_state, &mut account_data).unwrap();

    Ok(())
}

fn call_client_payload_pair(accounts: &[AccountInfo], program_id: &Pubkey, cprice: u32, cquantity: u32, cretailer: String, cstock: String) -> ProgramResult {
        msg!("BBK: Setting price {}, quantity {} stock {}", cprice, cquantity, cstock);

        if cquantity != 0 {
            // Iterating accounts is safer than indexing
            let accounts_iter = &mut accounts.iter();

            // Get the account to say hello to
            let account = next_account_info(accounts_iter)?;

            // The account must be owned by the program in order to modify its data
            if account.owner != program_id {
                msg!("BBK: StockAccount does not have the correct program id");
                return Err(ProgramError::IncorrectProgramId);
            }

            let mut data = AccountStore::<BuybakPortfolio>::unpack(&account.data.as_ref().borrow()).unwrap();

            let user_data = BuybakPortfolio {
                price:    cprice,
                quantity: cquantity,
                retailer: cretailer.into(),
                stock:    cstock.into(),
            };

            msg!("BBK: user_data.size {} {}", mem::size_of::<BuybakPortfolio>(), AccountStore::<BuybakPortfolio>::size_of());
            data.add_data(user_data);
            data.pack(&mut &mut account.data.borrow_mut()[..]).unwrap();
        }

        Ok(())
}

impl Processor {

    pub fn process(
        program_id:         &Pubkey,        // Public key of the account the hello world program was loaded into
        accounts:           &[AccountInfo], // The account to say hello to
        instruction_data:   &[u8],          // Look at instruction.rs
    ) -> ProgramResult {
        msg!("BBK: Solana-BuyBak-FSOP entrypoint - Sameer Kulkarni (sameer@buybak.xyz)!");

        let instruction = ClientPairInstruction::unpack(instruction_data)?;

        match instruction {
            ClientPairInstruction::ClientOne ( price, quantity, retailer, stock ) => {
                msg!("BBK: ClientPairInstruction::ClientOne");
                call_client_payload_pair(accounts, program_id, price, quantity, retailer, stock)
            }
            ClientPairInstruction::ClientTwo ( price, quantity, retailer, stock ) => {
                msg!("BBK: ClientPairInstruction::ClientTwo");
                call_client_payload_pair(accounts, program_id, price, quantity, retailer, stock)
            }
            ClientPairInstruction::ClientThree ( price, quantity, retailer, stock ) => {
                msg!("BBK: ClientPairInstruction::ClientThree");
                call_client_payload_pair(accounts, program_id, price, quantity, retailer, stock)
            }
            ClientPairInstruction::InitializeAccount ( price, quantity, retailer, stock) => {
                msg!("BBK: ClientPairInstruction::InitializeAccount");
                initialize_account(accounts, program_id, price, quantity, retailer, stock)
            }
            ClientPairInstruction::FindRetailer ( _price, _quantity, _retailer, stock) => {
                msg!("BBK: ClientPairInstruction::FindRetailer");
                find_retailer(accounts, program_id, stock)
            }
            ClientPairInstruction::InitUserPortfolio ( username, fullname, email, phone, address) => {
                msg!("BBK: ClientPairInstruction::InitUserPortfolio");
                call_init_user_portfolio(accounts, program_id, username, fullname, email, phone, address)
            }
            ClientPairInstruction::MintToUserPortfolio ( username, fsop, average_price, stock) => {
                msg!("BBK: ClientPairInstruction::MintToUserPortfolio");
                call_mint_to_user_portfolio(accounts, program_id, username, fsop, average_price, stock)
            }
            ClientPairInstruction::ReturnFromUserPortfolio ( username, fsop, _average_price, stock) => {
                msg!("BBK: ClientPairInstruction::ReturnFromUserPortfolio");
                call_return_from_user_portfolio(accounts, program_id, username, fsop, stock)
            }
            ClientPairInstruction::UpdateStockPrices ( price, _quantity, _retailer, stock) => {
                msg!("BBK: ClientPairInstruction::UpdateStockPrices");
                call_update_stock_prices(accounts, program_id, stock, price)
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
