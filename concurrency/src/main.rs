use std::thread;
use std::sync::mpsc;
use std::fmt;
use std::time::Duration;

fn main() {

    let (tx, rx) = mpsc::channel();

    let tx1 = tx.clone();

    let handle = thread::spawn( move || {
        let vals = vec![
            String::from("hi"),
            String::from("from"),
            String::from("the"),
            String::from("thread"),
        ];

        for val in vals {
            tx1.send(val).unwrap();
            thread::sleep(Duration::from_secs(1));
        }
    });

    thread::spawn(move || {
        let vals = vec![
            String::from("more"),
            String::from("messages"),
            String::from("for"),
            String::from("you"),
        ];

        for val in vals {
            tx.send(val).unwrap();
            thread::sleep(Duration::from_secs(1));
        }
    });

    for received in rx {
        println!("Got: {}", received);
    }

    /*
    loop {
        match rx.try_recv() {
            Ok(msg) => {println!("loop: {msg} from rx.");},

            // For both errors (Disconnected and Empty), the correct action
            // is to process the items.  If the error was Disconnected, on
            // the next iteration rx.recv().await will be None and we'll
            // break from the outer loop anyway.
            Err(_) => {
                println!("break!");
                break
            },
        }
    }
    */
    let output = handle.join();
}
