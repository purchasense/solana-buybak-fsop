
fn main() {

    println!("{}", format!("{argument}", argument = "test"));   // => "test"
    println!("{}", format!("{name} {}", 1, name = 2));          // => "2 1"
    println!("{}", format!("{a} {c} {b}", a="a", b='b', c=3));  // => "a 3 b"

    let argument = 2 + 2;
    println!("{}", format!("{argument}"));   // => "4"
    println!("{}", make_string(927, "label")); // => "label 927"

    // All of these print "Hello x    !"
    println!("Hello {:5}!", "x");
    println!("Hello {:1$}!", "x", 5);
    println!("Hello {1:0$}!", 5, "x");
    println!("Hello {:width$}!", "x", width = 5);
    let width = 5;
    println!("Hello {:width$}!", "x");

    assert_eq!(format!("Hello {:<5}!", "x"),  "Hello x    !");
    assert_eq!(format!("Hello {:-<5}!", "x"), "Hello x----!");
    assert_eq!(format!("Hello {:^5}!", "x"),  "Hello   x  !");
    assert_eq!(format!("Hello {:>5}!", "x"),  "Hello     x!");
}

fn make_string(a: u32, b: &str) -> String {
    format!("{b} {a}")
}
