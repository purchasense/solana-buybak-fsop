fn main() {
    let s = String::from( "1234567, 1234!");
    let len = first_word(&s);
    println!( "{}, {}", s, len);

    let slice = &s[0..len];
    let world = &s[len..];

    println!( "slice {} world {}", slice, world);
    let substr = first_word_str(&s);
    println!( "substr {} ", substr);

    let a = [1, 2, 3, 4, 5];

    let slice = &a[1..3];

    assert_eq!(slice, &[2, 3]);
}

fn first_word_str( s: &String) -> &str {
    let bytes = s.as_bytes();

    for(i, &item) in bytes.iter().enumerate() {
        println!( "i {}, item {}, s {}", i, item, s);
        if item == b' ' {
            return &s[0..i];
        }
    }

    println!( "sameer {} ", s);
    &s[..]
}

fn first_word( s: &String) -> usize {
    let bytes = s.as_bytes();

    for(i, &item) in bytes.iter().enumerate() {
        println!( "i {}, item {}, s {}", i, item, s);
        if item == b' ' {
            return i;
        }
    }

    println!( "sameer {} ", s);
    s.len()
}
