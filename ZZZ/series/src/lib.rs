#[derive(PartialEq, Debug)]
struct Shoe {
    size: u32,
    style: String,
}

fn shoes_in_size(shoes: Vec<Shoe>, shoe_size: u32) -> Vec<Shoe> {
    shoes.into_iter().filter(|s| s.size == shoe_size).collect()
}


#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn iterator_1() {
        let v1 = vec![1, 2, 3];

        let v1_iter = v1.iter();

        let total: i32 = v1_iter.sum();

        assert_eq!(total, 6);
    }

    #[test]
    fn iterator_2() {
        let v1: Vec<i32> = vec![1, 2, 3];
        let v2: Vec<_> = v1.iter().map(|x| x + 1).collect();

        assert_eq!(v2, vec![2, 3, 4]);
        println!("{:?}", v2);

        let mut sv1: Vec<String> = vec!["Sameer".to_string(), "Kulkarni".to_string(), "Naperville".to_string()];
        println!("{:?}", sv1);

        let sv2: Vec<_> = sv1.iter_mut().map(|x| x.push_str("1")).collect();
        println!("{:?}", sv2);
    }

    #[test]
    fn filters_by_size() {
        let shoes = vec![
            Shoe {
                size: 10,
                style: String::from("sneaker"),
            },
            Shoe {
                size: 13,
                style: String::from("sandal"),
            },
            Shoe {
                size: 10,
                style: String::from("boot"),
            },
        ];

        let in_my_size = shoes_in_size(shoes, 10);
        println!( "in_my_size {:?}", in_my_size);

        assert_eq!(
            in_my_size,
            vec![
                Shoe {
                    size: 10,
                    style: String::from("sneaker")
                },
                Shoe {
                    size: 10,
                    style: String::from("boot")
                },
            ]
        );
    }

    #[test]
    fn benchmark() {
        /*
        let buffer: &mut [i32];
        let coefficients: [i64; 12];
        let qlp_shift: i16;

        for i in 12..buffer.len() {
            let prediction = coefficients.iter()
                                 .zip(&buffer[i - 12..i])
                                 .map(|(&c, &s)| c * s as i64)
                                 .sum::<i64>() >> qlp_shift;
            let delta = buffer[i];
            buffer[i] = prediction as i32 + delta;
            println!("{:?}", buffer);
            println!("{:?}", coefficients);
        }
        */
    }
}
