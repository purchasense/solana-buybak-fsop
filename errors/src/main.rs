use std::fs::File;
use std::fs;
use std::io::{self, Read, ErrorKind};

fn last_char_of_first_line(text: &str) -> Option<char> {
    text.lines().next()?.chars().last()
}

fn read_username_from_file_fs(file: &str) -> Result<String, io::Error> {
    fs::read_to_string(file)
}

fn read_username_from_file_shortcut(file: &str) -> Result<String, io::Error> {
    let mut user_file = File::open(file)?;
    let mut username = String::new();
    user_file.read_to_string(&mut username)?;
    Ok(username)
}

fn read_username_from_file(file: &str) -> Result<String, io::Error> {
    let user_file_result = File::open(file);

    let mut user_file = match user_file_result {
        Ok(file) => file,
        Err(e) => return Err(e),
    };

    let mut username = String::new();

    match user_file.read_to_string(&mut username) {
        Ok(_) => Ok(username),
        Err(e) => Err(e),
    }
}

fn get_or_create_file(filename: &str) -> File {
    let greeting_file = File::open(filename).unwrap_or_else(|error| {
        if error.kind() == ErrorKind::NotFound {
            File::create(filename).unwrap_or_else(|error| {
                panic!("Problem creating the file {filename}: {:?}", error);
            })
        } else {
            panic!("Problem opening the file {filename}: {:?}", error);
        }
    });
    greeting_file
}

fn main() {
    let greeting_file_result = File::open("hello.txt");

    let greeting_file = match greeting_file_result {
        Ok(file) => file,
		Err(error) => match error.kind() {
            ErrorKind::NotFound => match File::create("hello.txt") {
                Ok(fc) => fc,
                Err(e) => panic!("Problem creating the file: {:?}", e),
            },
            other_error => {
                panic!("Problem opening the file: {:?}", other_error);
            }
        },
    };

    let file = get_or_create_file("sameer.txt");
    println!("{:?}", file);

    // If the Result value is the Ok variant, unwrap will return the value inside the Ok. 
    // If the Result is the Err variant, unwrap will call the panic! macro for us

    // let greeting_file = File::open("second.txt").unwrap();

    // let greeting_file = File::open("third.txt")
    //     .expect("hello.txt should be included in this project");

    println!("Calling read_username_from_file()");
    let file = read_username_from_file("kulkarni.txt");
    println!("{:?}", file);

    let file = read_username_from_file_shortcut("kulkarni.txt");
    println!("{:?}", file);

    let file = read_username_from_file_fs("kulkarni.txt");
    println!("{:?}", file);

    let opt = last_char_of_first_line("Sameer Kulkarni");
    println!("{:?}", opt);

    if opt.is_some() {
        println!("{}", opt.unwrap());
    }
}

