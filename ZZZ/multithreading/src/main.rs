use std::thread;

#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {

    let mut list = [
        Rectangle { width: 10, height: 1 },
        Rectangle { width: 3, height: 5 },
        Rectangle { width: 7, height: 12 },
    ];
    println!("{:?} Before defining closure: {:?}", thread::current().id(), list);

    let output = thread::spawn(move || {
            println!("{:?}From thread: {:?}", thread::current().id(), list);
            let mut num_sort_operations = 0;
            list.sort_by_key(|r| {
                num_sort_operations += 1;
                r.width
            });
            println!("{:?} {:#?}, sorted in {num_sort_operations} operations", thread::current().id(), list);
            list
        })
        .join()
        .unwrap();

    println!("{:?} {:?}", thread::current().id(), output);
    
}
