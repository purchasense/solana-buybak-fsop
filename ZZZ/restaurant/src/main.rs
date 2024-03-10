use std::collections::HashMap;
use bbk::customer;

fn main() {
    let mut map = HashMap::new();
    map.insert(1, 2);
    customer::eat_at_restaurant();
    bbk::eat_at_restaurant();
}

