#[macro_export]
macro_rules! sam {
    ( $( $x:expr ),* ) => {
        {
            let mut temp_vec = Vec::new();
            $(
                temp_vec.push($x);
            )*
            temp_vec
        }
    };
}

pub trait HelloMacro {
    fn hello_macro();
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sam() {
        let s = sam![1, 2, 3, 4];
    }

}
