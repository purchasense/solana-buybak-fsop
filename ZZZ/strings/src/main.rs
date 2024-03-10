 use std::collections::HashMap;


fn main() {
    println!("Strings");

    let mut s1 = String::new();
    let s2 = "initial contents".to_string();

    let hello1 = String::from("السلام عليكم");
    let hello2 = String::from("Dobrý den");
    let hello3 = String::from("Hello");
    let hello4 = String::from("שָׁלוֹם");
    let hello5 = String::from("नमस्ते");
    let hello6 = String::from("こんにちは");
    let hello7 = String::from("안녕하세요");
    let hello8 = String::from("你好");
    let hello9 = String::from("Olá");
    let hello10 = String::from("Здравствуйте");
    let hello11 = String::from("Hola");

    s1.push_str("bar");
    let s3 = s1 + &s2; // note s1 has been moved here and can no longer be used
    println!("{s3}");
    let s4 = hello1 + &hello2;
    println!("{s4}");


    // fn add(self, s: &str) -> String {

    let hello = "Здравствуйте";
    let numbers = "1234567890";
    let alfa = "abcdefghijklmnopqrstuvwxyz";

    for c in hello.chars() {
        println!("{c}");
    }
    println!("------------------------");
    for b in hello.bytes() {
        println!("{b}");
    }
    println!("------------------------");
    for b in s4.bytes() {
        println!("{b}");
    }
    println!("------------------------");
    for b in numbers.bytes() {
        println!("{b}");
    }
    println!("------------------------");
    for b in alfa.bytes() {
        println!("{b}");
    }

    let mut scores = HashMap::new();
    scores.insert(String::from("Blue"), 10);

    scores.entry(String::from("Yellow")).or_insert(50);
    scores.entry(String::from("Blue")).or_insert(50);

    println!("{:?}", scores);

    let field_name = String::from("Favorite color");
    let field_value = String::from("Blue");

    let mut map = HashMap::new();
    map.insert(field_name, field_value);
    println!("{:?}", map);

    let text = "hello world wonderful world";

    let mut map = HashMap::new();

    for word in text.split_whitespace() {
        let count = map.entry(word).or_insert(0);
        *count += 1;
    }

    println!("{:?}", map);
}
