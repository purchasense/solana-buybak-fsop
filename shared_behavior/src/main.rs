use bbk::{Tweet, Analytics, notify};
use std::fmt;
use std::fmt::*;

fn main() {
    let tweet = Tweet {
        username: String::from("horse_ebooks"),
        content: String::from(
            "of course, as you probably already know, people",
        ),
        reply: false,
        retweet: false,
    };

    let analytics = Analytics {
        stock:      String::from("Nvidia"),
        symbol:     String::from("NVDA"),
        breaking:   String::from("Nvidia continues to power the AI boom!"),
        exchange:   String::from("Nasdaq"),
        category:   String::from("Bluechip"),
        price:      799.98,
        quantity:   7,
    };

    // println!("1 new analytics: {}", analytics.summarize());
    // println!("1 new tweet: {}", tweet.summarize());

    notify(&tweet);
    notify(&analytics);

    let pair: bbk::Pair::<u32> = bbk::Pair::new(23u32, 24u32);
    pair.cmp_display();
    println!("{:?}", analytics);
}
