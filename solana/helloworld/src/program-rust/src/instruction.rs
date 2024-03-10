use solana_program::{
    borsh::try_from_slice_unchecked,
    program_error::ProgramError,
    msg,
};
use std::convert::TryInto;
use borsh::{BorshSerialize, BorshDeserialize};

#[derive(BorshDeserialize, BorshSerialize, Debug, PartialEq)]
pub enum ClientPairInstruction {
    ClientOne( u32, u32, String, String),
    ClientTwo( u32, u32, String, String),
    ClientThree( u32, u32, String, String),
    InitializeAccount( u32, u32, String, String),
    FindRetailer( u32, u32, String, String),
    InitUserPortfolio( String, String, String, String, String),
    UpdateUserPortfolio( String, u32, String),
}

impl ClientPairInstruction {
    /// Unpacks a byte buffer into a [ClientPairInstruction](enum.ClientPairInstruction.html).

    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {

        let payload = try_from_slice_unchecked::<ClientPairInstruction>(input).unwrap();

        // Match the variant to determine which data struct is expected by
        // the function and return the TestStruct or an error
        match payload {
            ClientPairInstruction::ClientOne(_, _, _, _) => Ok(payload),
            ClientPairInstruction::ClientTwo(_, _, _, _) => Ok(payload),
            ClientPairInstruction::ClientThree(_, _, _, _) => Ok(payload),
            ClientPairInstruction::InitializeAccount(_, _, _, _) => Ok(payload),
            ClientPairInstruction::FindRetailer(_, _, _, _) => Ok(payload),
            ClientPairInstruction::InitUserPortfolio(_, _, _, _, _) => Ok(payload),
            ClientPairInstruction::UpdateUserPortfolio(_, _, _) => Ok(payload),
        }
    }
}



#[derive(Debug, BorshSerialize, BorshDeserialize, Default, PartialEq)]
pub struct UserProfile {
   pub username: String,
   pub fullname: String,
   pub email: String,
   pub phone: String,
   pub address: String,
}


#[derive(Debug, BorshSerialize, BorshDeserialize, Default, PartialEq)]
pub struct UserPortfolio {
   pub username: String,
   pub fsop: u32,
   pub stock: String,
}


#[derive(Debug, BorshSerialize, BorshDeserialize, Default, PartialEq)]
pub struct BuybakPortfolio {
   pub price: u32,
   pub quantity: u32,
   pub retailer: String,
   pub stock: String,
}

/// The result type that encompasses the `AccountStoreError`
pub type AccountStoreResult<T> = Result<T, AccountStoreError>;

#[derive(Debug)]
pub enum AccountStoreError {
    /// The buffer cannot acommodate the size of the `MARKER` which is `8 bytes`
    BufferTooSmallForMarker = 0,
    /// The buffer cannot acommodate the size of the data and the  `MARKER`
    BufferTooSmallForData = 1,
    /// The deserialized bytes do not contain a `MARKER`
    CorruptedMarker = 2,
    /// The data provided does not contain enough data length as specified by the `MARKER`
    CorruptedStorage = 3,
    /// The error provided is invalid
    InvalidError = 4,
}

pub const MARKER_SIZE: usize = 8;

#[derive(Debug)]
pub struct AccountStore<T> {
  pub data: T,
}

impl<T> AccountStore<T>
where
  T: BorshDeserialize + BorshSerialize + Default + Sized,
{
    pub fn size_of() -> usize {
        core::mem::size_of::<T>() + MARKER_SIZE
    }

    // -- Code snippet --
    pub fn pack(&self, buffer: &mut [u8]) -> AccountStoreResult<usize> {
        // Get the length of the PDA account storage size
        let buffer_length = buffer.len();
        msg!("pack::bl {} ", buffer.len());

        // Check if the size of the `MARKER` is less than the size  of the `buffer_length`
        /*
        if buffer_length < MARKER_SIZE {
            // If the size is smaller, return an error indicating this to the user
            return Err(AccountStoreError::BufferTooSmallForMarker);
        }
        */
        // Serialize the user data using `borsh`
        let data = self.data.try_to_vec().unwrap(); //HANDLE THIS BORSH ERROR AS YOU WISH
                                                    // Get the data length
        let data_length = data.len();
        let pdl = &data_length;
        msg!("pack::pdl {}", pdl);

        // Check if the sum of the size of the `data_length` and the `MARKER_SIZE` is
        // greater than the `buffer_length`
        if buffer_length < data_length + MARKER_SIZE {
            return Err(AccountStoreError::BufferTooSmallForData);
        }

        // Copy the `data_length` to the buffer as the `MARKER`
        buffer[0..=7].copy_from_slice(&data_length.to_le_bytes());

        // Copy the data into the buffer.
        // If the data is smaller than the buffer then the space filled with
        // zeroes is left intact
        buffer[8..=data_length + 7].copy_from_slice(&data);

        Ok(data_length + 8usize)
    }

  // -- Code snippet --


    pub fn unpack(buffer: &[u8]) -> AccountStoreResult<AccountStore<T>> {
        // Get the length of the PDA account storage
        let buffer_length = buffer.len();

        msg!("unpack::bl {} ", buffer.len());

        // Check if the size of the `MARKER` is less than the size  of the `buffer_length`
        /*
        if buffer_length < MARKER_SIZE {
            return Err(AccountStoreError::BufferTooSmallForMarker);
        }
        */

        // Convert the `MARKER` bytes to and array of `[u8; 8] `
        // since `usize::from_le_bytes` only accepts `[u8; 8]`
        let marker: [u8; 8] = match buffer[0..MARKER_SIZE].try_into() {
            Ok(value) => value,
            Err(_) => return Err(AccountStoreError::CorruptedMarker),
        };
        // Get the last index of the valid data
        let byte_length = usize::from_le_bytes(marker);

        // Check if the last index of the valid buffer is greater than the PDA storage size
        if byte_length > buffer_length {
            return Err(AccountStoreError::CorruptedStorage);
        }

        // Collect the valid data by skipping the `MARKER_SIZE` of `8 bytes`
        // and iterating the rest of the bytes until the index marked by the `byte_length`
        let data = buffer
            .iter()
            .skip(8)
            .take(byte_length)
            .map(|byte| *byte)
            .collect::<Vec<u8>>();

        if byte_length != 0 {
            let data = T::try_from_slice(&data).unwrap(); // Handle error as you see fit
            Ok(AccountStore { data })
        } else {
            // If the `byte_length` is zero it means that no previous
            // data had been written to the PDA account previously
            // so return the `Default` representation of the data structure represented
            // by the generic `T`
            Ok(AccountStore { data: T::default() })
        }
    }

    // -- snippet --
    pub fn add_data(&mut self, data: T) -> &mut Self {
        self.data = data;

        self
    }
}


