use solana_program::program_error::ProgramError;
// use std::convert::TryInto;
use borsh::{BorshDeserialize};

use crate::error::ClientPairError::InvalidInstruction;

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

#[derive(BorshDeserialize)]
struct ClientPairPayload {
    pair: u64,
}

impl ClientPairInstruction {
    /// Unpacks a byte buffer into a [ClientPairInstruction](enum.ClientPairInstruction.html).

    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        // Take the first byte as the variant to
        // determine which instruction to execute
        let (&variant, rest) = input.split_first().ok_or(InvalidInstruction)?;

        // Use the temporary payload struct to deserialize
        let payload = ClientPairPayload::try_from_slice(rest).unwrap();

        // Match the variant to determine which data struct is expected by
        // the function and return the TestStruct or an error
        Ok(match variant {
            0 => Self::ClientOne {
                pair: payload.pair,
            },
            1 => Self::ClientTwo {
                pair: payload.pair,
            },
            2 => Self::ClientThree {
                pair: payload.pair,
            },
            _ => return Err(InvalidInstruction.into())
        })
    }
    /*
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let (tag, rest) = input.split_first().ok_or(InvalidInstruction)?;

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
            _ => return Err(InvalidInstruction.into()),
        })
    }

    fn unpack_pair(input: &[u8]) -> Result<u64, ProgramError> {
        let pair = input
            .get(..8)
            .and_then(|slice| slice.try_into().ok())
            .map(u64::from_le_bytes)
            .ok_or(InvalidInstruction)?;
        Ok(pair)
    }
    */
}
