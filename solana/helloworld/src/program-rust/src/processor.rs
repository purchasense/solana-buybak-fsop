use std::mem;
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};


use crate::{instruction::MessagingAccount, instruction::AccountStore, instruction::ClientPairInstruction};

// Program entrypoint's implementation
pub struct Processor;

impl Processor {

    pub fn process(
        program_id:         &Pubkey,        // Public key of the account the hello world program was loaded into
        accounts:           &[AccountInfo], // The account to say hello to
        instruction_data:   &[u8],          // Ignored, all helloworld instructions are hellos
    ) -> ProgramResult {
        msg!("Hello World Rust program entrypoint for Nikita Nikolashin!");

        let instruction = ClientPairInstruction::unpack(instruction_data)?;

        let (cprice, cquantity, cstock) = match instruction {
            ClientPairInstruction::ClientOne { price, quantity, stock } => {
                msg!("ClientPairInstruction::ClientOne");
                (price, quantity, stock)
            }
            ClientPairInstruction::ClientTwo { price, quantity, stock } => {
                msg!("ClientPairInstruction::ClientTwo");
                (price, quantity, stock)
            }
            ClientPairInstruction::ClientThree { price, quantity, stock } => {
                msg!("ClientPairInstruction::ClientThree");
                (price, quantity, stock)
            }
        };

        msg!("Setting price {}, quantity {} stock {}", cprice, cquantity, cstock);

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
            stock:    cstock.into(),
        };

        msg!("user_data.size {} {}", mem::size_of::<MessagingAccount>(), AccountStore::<MessagingAccount>::size_of());
        data.add_data(user_data);
        data.pack(&mut &mut account.data.borrow_mut()[..]).unwrap();


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
