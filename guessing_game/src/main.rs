use std::io;
use std::cmp::Ordering;
use rand::Rng;

fn main() {
    println!("Guess the number!");

    let secret_number = rand::thread_rng().gen_range(1..=100);

    println!("The secret number is {secret_number}");


    loop {

        let mut guess = String::new();

        io::stdin()
            .read_line(&mut guess)
            .expect("Failed to read line");

        let guess: u32 = match guess.trim().parse() {
            Ok(num) => num,
            Err(_) => continue,
        };

        println!("You guessed: {guess}");

        match guess.cmp(&secret_number) {
            Ordering::Less => println!("Too small {guess} < {secret_number}"),
            Ordering::Greater => println!("Too big {guess} > {secret_number}"),
            Ordering::Equal =>  {
                println!("You Win {guess} = {secret_number}");
                break;
            }
        }
    }

    let apples = 5;
    let bananas = 5;
    println!("a = {apples}, b = {bananas} and sum = {}", (apples + bananas));
}
