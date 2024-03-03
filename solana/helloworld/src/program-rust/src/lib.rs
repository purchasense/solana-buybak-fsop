use borsh::{BorshDeserialize, BorshSerialize};
use thiserror::Error;
use std::convert::TryInto;
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};


#[derive(Error, Debug, Copy, Clone)]
pub enum ClientPairError {
    /// Invalid instruction
    #[error("Invalid Instruction")]
    InvalidInstruction,
    /// Not Rent Exempt
    #[error("Not Rent Exempt")]
    NotRentExempt,
    /// Expected Amount Mismatch
    #[error("Expected Amount Mismatch")]
    ExpectedAmountMismatch,
    /// Amount Overflow
    #[error("Amount Overflow")]
    AmountOverflow,
}

impl From<ClientPairError> for ProgramError {
    fn from(e: ClientPairError) -> Self {
        ProgramError::Custom(e as u32)
    }
}

pub enum ClientPairInstruction {
    ClientOne {
        pair: u64,
    },
    ClientTwo {
        pair: u64,
    },
    ClientThree {
        pair: u64,
    },
}


impl ClientPairInstruction {
    /// Unpacks a byte buffer into a [ClientPairInstruction](enum.ClientPairInstruction.html).
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let (tag, rest) = input.split_first().ok_or(ClientPairError::InvalidInstruction)?;

        Ok(match tag {
            0 => Self::ClientOne {
                pair: Self::unpack_pair(rest)?,
            },
            1 => Self::ClientTwo {
                pair: Self::unpack_pair(rest)?,
            },
            2 => Self::ClientThree {
                pair: Self::unpack_pair(rest)?,
            },
            _ => return Err(ClientPairError::InvalidInstruction.into()),
        })
    }

    fn unpack_pair(input: &[u8]) -> Result<u64, ProgramError> {
        let pair = input
            .get(..8)
            .and_then(|slice| slice.try_into().ok())
            .map(u64::from_le_bytes)
            .ok_or(ClientPairError::InvalidInstruction)?;
        Ok(pair)
    }
}

/// Define the type of state stored in accounts
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct GreetingAccount {
    /// number of greetings
    pub counter:      u32,
    pub client_pair:  u64,
}

// Declare and export the program's entrypoint
entrypoint!(process_instruction);

// Program entrypoint's implementation
pub fn process_instruction(
    program_id: &Pubkey, // Public key of the account the hello world program was loaded into
    accounts: &[AccountInfo], // The account to say hello to
    instruction_data: &[u8], // Ignored, all helloworld instructions are hellos
) -> ProgramResult {
    msg!("Hello World Rust program entrypoint for Nikita Nikolashin!");

    let instruction = ClientPairInstruction::unpack(instruction_data)?;

    let cpair: u64 = match instruction {
        ClientPairInstruction::ClientOne { pair } => {
            msg!("ClientPairInstruction::ClientOne");
            pair
        }
        ClientPairInstruction::ClientTwo { pair } => {
            msg!("ClientPairInstruction::ClientTwo");
            pair
        }
        ClientPairInstruction::ClientThree { pair } => {
            msg!("ClientPairInstruction::ClientThree");
            pair
        }
    };

    msg!("Setting value {}", cpair);

    // Iterating accounts is safer than indexing
    let accounts_iter = &mut accounts.iter();

    // Get the account to say hello to
    let account = next_account_info(accounts_iter)?;

    // The account must be owned by the program in order to modify its data
    if account.owner != program_id {
        msg!("Greeted account does not have the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    }

    // Increment and store the number of times the account has been greeted
    let mut greeting_account = GreetingAccount::try_from_slice(&account.data.borrow())?;
    greeting_account.counter += 1;
    greeting_account.client_pair = cpair;
    greeting_account.serialize(&mut &mut account.data.borrow_mut()[..])?;

    msg!("Nikita Greeted {} time(s), with {}!", greeting_account.counter, greeting_account.client_pair);

    Ok(())
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

        assert_eq!(
            GreetingAccount::try_from_slice(&accounts[0].data.borrow())
                .unwrap()
                .counter,
            0
        );
        process_instruction(&program_id, &accounts, &instruction_data).unwrap();
        assert_eq!(
            GreetingAccount::try_from_slice(&accounts[0].data.borrow())
                .unwrap()
                .counter,
            1
        );
        process_instruction(&program_id, &accounts, &instruction_data).unwrap();
        assert_eq!(
            GreetingAccount::try_from_slice(&accounts[0].data.borrow())
                .unwrap()
                .counter,
            2
        );
    }
}
