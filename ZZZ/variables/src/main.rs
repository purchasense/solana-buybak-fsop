const THREE_HOURS_IN_SECONDS: u32 = 60 * 60 * 3;

fn main() {
    {
        let mut x = 5;
        println!("x = {x}");
        x = 6;
        println!("x = {x}");
    }

    let x = 5;
    let x = x + 1;

    {
        let x = x * 2;
        println!( "The value of x in the inner loop is {x}");
    }
    println!( "The value of x is {x}");

    let spaces = "         ";
    let len: u32 = spaces.len().try_into().unwrap();

    println!( "spaces_len {len}");

    let x = 2.0;

    let y: f32 = 3.0;

    let sum = 5 + 10;

    let diff = 95.5 - 4.3;

    let quotient = 56.7 / 32.2;
    let truncated = -5 / 3;
    let remainder = 53 % 5;
    let dtrunc: i32 = -5 / 3;

    println!( " q {quotient} t {truncated} r {remainder} dt {dtrunc}");

    let tup: (i32, f64, u8, char, bool) = (500, 6.4, 1, 's', false);
    // TODO std::fmt println!( " tup {tup}");
    // TODO WRONG println!(" t1 {tup.1} t2 {tup.2} t3 {tup.3} t4 {tup.4} t5 {tup.5}");
    let (a,b,c,d,e) = tup;

    println!( "a {a} b {b} c {c} d {d} e {e}");

    let months = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec"
    ];

    let array: [i32; 5] = [1, 2, -3, -4, 5];

    let jan = months[0];
    println!( "month-0 {jan}");
    // TODO std::fmt println!( "array {array}");


}
