
pub trait Draw {
    fn draw(&self);
}

/*
pub struct Screen<T: Draw> {
    pub components: Vec<Box<dyn Draw>>,
}

impl<T> Screen<T>
where
    T: Draw
{
    pub fn run(&self) {
        for component in self.components.iter() {
            component.draw();
        }
    }
}
*/

#[derive(Debug)]
pub struct Button {
    pub width: u32,
    pub height: u32,
    pub label: String,
}

impl Draw for Button {
    fn draw(&self) {
        println!("Draw() {:?}", &self);
    }
}

#[derive(Debug)]
pub struct SelectBox {
    pub width: u32,
    pub height: u32,
    pub options: Vec<String>,
}

impl Draw for SelectBox {
    fn draw(&self) {
        println!("Draw() {:?}", &self);
    }
}

#[derive(Debug)]
pub struct AveragedCollection {
    list: Vec<i32>,
    average: f64,
}

impl AveragedCollection {
    pub fn add(&mut self, value: i32) {
        self.list.push(value);
        self.update_average();
    }

    pub fn remove(&mut self) -> Option<i32> {
        let result = self.list.pop();
        match result {
            Some(value) => {
                self.update_average();
                Some(value)
            }
            None => None,
        }
    }

    pub fn average(&self) -> f64 {
        self.average
    }

    fn update_average(&mut self) {
        let total: i32 = self.list.iter().sum();
        self.average = total as f64 / self.list.len() as f64;
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

    #[test]
    fn avg_collect() {

        let mut ac = AveragedCollection { list: vec![0i32], average: 0.0}; 
        ac.add( 1);
        ac.add( 2);
        ac.add( 3);
        ac.add( 4);
        ac.add( 5);
        println!("{:?}", ac);

        assert_eq!(ac.average, 2.5);
    }

    #[test]
    fn screen_run() {
        let screens: Vec<Box<dyn Draw>> = vec![
                Box::new(SelectBox {
                    width: 75,
                    height: 10,
                    options: vec![
                        String::from("Yes"),
                        String::from("Maybe"),
                        String::from("No"),
                    ],
                }),
                Box::new(Button {
                    width: 50,
                    height: 10,
                    label: String::from("OK"),
                }),
            ];

        for item in screens.iter() {
            item.draw();
        }
    }
}
