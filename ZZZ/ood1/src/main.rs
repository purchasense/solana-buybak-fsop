
fn main() {
    
            let screens: Vec<Box<dyn ood1::Draw>> = vec![
                Box::new(ood1::SelectBox {
                    width: 75,
                    height: 10,
                    options: vec![
                        String::from("Yes"),
                        String::from("Maybe"),
                        String::from("No"),
                    ],
                }),
                Box::new(ood1::Button {
                    width: 50,
                    height: 10,
                    label: String::from("OK"),
                }),
            ];

        for item in screens.iter() {
            item.draw();
        }
}
