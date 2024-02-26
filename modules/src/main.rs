/*
use crate::garden::vegetables::Asparagus;
use crate::garden::fruits::Apples;
use crate::garden::fruits::Oranges;
use crate::garden::fruits::Bananas;
*/

use crate::garden::*;

pub mod garden;

fn main() {
    let plant = vegetables::Asparagus {};
    let f1 = fruits::Apples {};
    let f2 = fruits::Oranges {};
    let f3 = fruits::Bananas {};
    println!("I'm growing {:?}!", plant);
    println!("Also {:?}  {:?}  {:?}", f1, f2, f3); 
}
