use solana_program::program_error::ProgramError;
use std::convert::TryInto;

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


impl ClientPairInstruction {
    /// Unpacks a byte buffer into a [ClientPairInstruction](enum.ClientPairInstruction.html).
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
}
