
fn main() {
    println!("Hello Memory!");

    let s = String::from("Sameer");
    let _s2 = s.clone();

    println!( "{}", s);

    takes_ownership(s);
    let x = 5;
    let y = x;
    makes_copy(y);

    let s1 = gives_ownership();

    let s2 = String::from("belgaum");

    let s3 = takes_and_gives_back(s2);

    println!("{}, {}", s1, s3);

    let (s4, len4) = calculate_length(s1);

    let (s5, len5) = calculate_length(s3);

    println!( "({}, {}), ({}, {})", s4, len4, s5, len5);

    let len6 = calculate_ref_len(&s4);
    let len7 = calculate_ref_len(&s5);

    println!( "({}, {}), ({}, {})", s4, len6, s5, len7);

    let mut s = String::from("Naperville,");
    let prefix = String::from("Illinois");

    append_str(&mut s, prefix);

    println!( "{}", s);


    let mut s = String::from("hello");

    let r1 = &s; // no problem
    let r2 = &s; // no problem
    println!("r1 {} and r2 {}", r1, r2);
    // variables r1 and r2 will not be used after this point

    let r3 = &mut s; // no problem
    println!("r3 {}", r3);

    let _ref_to_something = no_dangle();

}

fn no_dangle() -> String {
    let s = String::from("dangle");

    s
}

fn append_str(s: &mut String, prefix: String) {
    s.push_str(&prefix);
}

fn calculate_ref_len(s: &String) -> usize {
    s.len()
}

fn calculate_length(s: String) -> (String, usize) {
    let len = s.len();

    (s, len)
}

fn gives_ownership() -> String {

    let s = String::from("hello");
    s
}

fn takes_and_gives_back(a_string: String) -> String { // some_string comes into scope
    a_string
}

fn takes_ownership(some_string: String) { // some_string comes into scope
    println!("{}", some_string);
} // Here, some_string goes out of scope and `drop` is called. The backing
  // memory is freed.

fn makes_copy(some_integer: i32) { // some_integer comes into scope
    println!("{}", some_integer);
} // Here, some_integer goes out of scope. Nothing special happens.
