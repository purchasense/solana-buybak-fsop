use std::fmt;
use std::fmt::Display;

pub trait Summary {
    fn summarize(&self) -> String {
        format!("summarize() not impl!")
    }
}

pub fn notify<T: Summary>(item: &T) {
    println!("Breaking news! {}", item.summarize());
}

pub struct NewsArticle {
    pub headline: String,
    pub location: String,
    pub author: String,
    pub content: String,
}

impl Summary for NewsArticle {
    fn summarize(&self) -> String {
        format!("{}, by {} ({})", self.headline, self.author, self.location)
    }
}

pub struct Tweet {
    pub username: String,
    pub content: String,
    pub reply: bool,
    pub retweet: bool,
}

impl Summary for Tweet {
    fn summarize(&self) -> String {
        format!("{}: {}", self.username, self.content)
    }
}


pub struct Analytics {
    pub stock:      String,
    pub symbol:     String,
    pub breaking:   String,
    pub exchange:   String,
    pub category:   String,
    pub price:      f64,
    pub quantity:   u32,
}

            /**************
             * secret  1234******
             *
            .field(
                "secret",
                &self
                    .secret
                    .chars()
                    .enumerate()
                    .map(|(i, c)| if i < 4 { c } else { '*' })
                    .collect::<String>(),
            )
            */

impl fmt::Debug for Analytics {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        f.debug_struct("Analytics")
            .field("stock", &self.stock)
            .field("symbol", &self.symbol)
            .field("exchange", &self.exchange)
            .field("category", &self.category)
            .field("price", &self.price)
            .field("quantity", &self.quantity)
            .finish()
    }
}

impl Summary for Analytics {}


pub struct Pair<T> {
    pub x: T,
    pub y: T,
}

impl<T> Pair<T> {
    pub fn new(x: T, y: T) -> Self {
        Self { x, y }
    }
}

impl<T: Display + PartialOrd> Pair<T> {
    pub fn cmp_display(&self) {
        if self.x >= self.y {
            println!("The largest member is x = {}", self.x);
        } else {
            println!("The largest member is y = {}", self.y);
        }
    }
}

pub fn add(left: usize, right: usize) -> usize {
    left + right
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let result = add(2, 2);
        assert_eq!(result, 4);
    }
}
