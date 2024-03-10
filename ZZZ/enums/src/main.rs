use std::fmt;

#[derive(strum_macros::Display)]
enum Suit {
    Heart,
    Diamond,
    Spade,
    Club,
}

#[derive(Debug)]
enum IpAddrKind {
    IakV4,
    IakV6,
}

impl fmt::Display for IpAddrKind {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
       write!(f, "{:?}", self)
    }
}

#[derive(strum_macros::Display)]
enum IpAddr {
    V4(String),
    V6(String),
}

// #[derive(strum_macros::Display)]

#[derive(Debug)]
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}

impl Message {
    fn call(&self) {
        println!( "Message::call() {:?}", self);
    }
}


enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter(UsState),
}

#[derive(Debug)] // so we can inspect the state in a minute
enum UsState {
    Alabama,
    Alaska,
    Illinois,
    Michigan,
    Wisconsin,
    Minnesota,
    Iowa,
    Indiana,
    Kentucky,
    Missouri,
    // --snip--
}

fn value_in_cents(coin: Coin) -> u8 {
    match coin {
        Coin::Penny => {
            println!("Lucky penny!");
            1
        }
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter(state) => {
            println!("State quarter from {:?}!", state);
            25
        }
    }
}

fn roll_the_dice(dice_roll: u32) -> &'static str {

    match dice_roll {
        3 => add_fancy_hat(),
        7 => remove_fancy_hat(),
        _ => reroll(),
    }

}
    fn add_fancy_hat() -> &'static str { "Wear Hat!" }
    fn remove_fancy_hat() -> &'static str { "Remove Hat!" }
    fn reroll() -> &'static str { "Roll Again!" }

fn main() {
    println!("Enums");

    let four = IpAddrKind::IakV4;
    let six = IpAddrKind::IakV6;

    println!( "{} {}", four, six);

    let s: Suit = Suit::Heart;
    println!("{}", s); // Prints "Heart"

    let home = IpAddr::V4(String::from("127.0.0.1"));
    let loopback = IpAddr::V6(String::from("::1"));

    println!( "{}, {}", home, loopback);


    let q = Message::Quit;
    let m = Message::Move { x: 32, y: 23 };
    let w = Message::Write(String::from("hello"));
    let c = Message::ChangeColor(0xff, 0xff, 0xff);

    q.call();
    m.call();
    w.call();
    c.call();

    // let some_number = Some(5);
    // let some_char = Some('e');

    // println!( "{:?}, {:?}, ", some_number, some_char);

    let coin = Coin::Quarter(UsState::Illinois);
    println!( "{}", value_in_cents(coin));

    println!("{}", roll_the_dice(1));
    println!("{}", roll_the_dice(2));
    println!("{}", roll_the_dice(3));
    println!("{}", roll_the_dice(4));
    println!("{}", roll_the_dice(5));
    println!("{}", roll_the_dice(6));
    println!("{}", roll_the_dice(7));
    println!("{}", roll_the_dice(8));
    println!("{}", roll_the_dice(9));
    println!("{}", roll_the_dice(10));
}
