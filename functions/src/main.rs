fn main() {
    println!("Hello, world!");

    another_function();
    second(5);
    print_labeled_measurement(5, 'h');

    let x = five();
    println!( "fn(x) {x}");

    let yplus = plus_one(-32);
    println!( "yplus {yplus}");


    let number = 3;

    if number < 5 {
        println!("condition was true");
    } else {
        println!("condition was false");
    }

    check_number(6);

    let condition = true;
    let number = if condition { 5 } else { 6 };

    println!("The value of number is: {number}");

    let mut counter = 0;

    let result = loop {
        counter += 1;

        if counter == 10 {
            break counter * 2;
        }
    };

    println!( "loop {result}");

    let mut count = 0;

    'counting_up: loop {
        println!( "count {count}");

        let mut remaining = 10;

        loop {
            println!("rem {remaining}");
            if remaining == 9 {
                break;
            }
            if count == 2 {
                break 'counting_up;
            }
            remaining -= 1;
        };
        count += 1;
    };
    println!( "End count = {count}");

    let a = [10, 20, 30, 40, 50];
    let mut index = 0;

    while index < 5 {
        println!("the value is: {}", a[index]);

        index += 1;
    }

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

    for element in months {
        println!(" {element}");
    }

    for number in (1..4).rev() {
        println!("{number}!");
    }
}

fn another_function() {
    println!("Another function.");
}

fn second(x: i32) {
    println!("The value of x is: {x}");
}

fn print_labeled_measurement(value: i32, unit_label: char) {
    println!("The measurement is: {value}{unit_label}");

    let x: u32 = { let y: u32 = 6; y};
    println!( "x {x} ");
}

fn five() -> i32 {
    5
}

fn plus_one(value: i32) -> i32 {
    value + 1
}

fn check_number(number: i32) {
   if number % 4 == 0 {
        println!("number is divisible by 4");
    } else if number % 3 == 0 {
        println!("number is divisible by 3");
    } else if number % 2 == 0 {
        println!("number is divisible by 2");
    } else {
        println!("number is not divisible by 4, 3, or 2");
    }
}
