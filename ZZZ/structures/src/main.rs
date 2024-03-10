struct User {
    active: bool,
    username: String,
    email: String,
    sign_in_count: u64,
}

struct UserNameRef<'a> {
    active: bool,
    username: &'a str,
    email: &'a str,
    sign_in_count: u64,
}


struct Color(i32, i32, i32);
struct Point(i32, i32, i32);

fn build_user(email: String, username: String) -> User {
    User {
        active: true,
        username,
        email,
        sign_in_count: 1,
    }
}

fn main() {
    println!("Structures!");

       let user1 = User {
        active: true,
        username: String::from("someusername123"),
        email: String::from("someone@example.com"),
        sign_in_count: 1,
    };

    println!("{}", format!("{} {} {} {}", user1.active, user1.username, user1.email, user1.sign_in_count));

    let user2 = build_user(String::from("sameer@buybak.xyz"), String::from("sameer"));

    println!("{} {} {} {}", user2.active, user2.username, user2.email, user2.sign_in_count);

    let user3 = User {
        email: String::from("another@example.com"),
        ..user2
    };

    println!("{} {} {} {}", user3.active, user3.username, user3.email, user3.sign_in_count);

    let _black = Color(0, 0, 0);
    let _origin = Point(0, 0, 0);

    let user4 = UserNameRef {
        active: true,
        username: "someusername123",
        email: "someone@example.com",
        sign_in_count: 1,
    };

    println!("{} {} {} {}", user4.active, user4.username, user4.email, user4.sign_in_count);
}
