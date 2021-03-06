#[cfg(test)]
mod tests {
    use curv::arithmetic::Converter;
    use curv::BigInt;
    use curv::elliptic::curves::traits::ECPoint;
    use crate::{call_hd_key, GE};

    #[test]
    fn test_pubkey() {
        let original_x = BigInt::from_hex(
            "d6f3c325eb3fda7061983141278484c0dd452a6702fd537b89c09ddf2b6f3238").unwrap();
        let original_y = BigInt::from_hex(
            "4e12adae75c29b29cc094fd3d94aa401ea646104f0d1ae3c59f710ec92640e21").unwrap();
        let original_public_key: GE = GE::from_coor(&original_x, &original_y);

        let path = "1/2/3";
        let expected_pubkey_x = "e891363052c09185814e92ce7a1a1946631dc53d058a01176fcf27a66b5674c2";
        let expected_pubkey_y = "cfbe0a84b7f7c49b5bb2a48999a761fc6c5dd6526aa79a58d4029865ef7d4a17";
        let (_f_l_new, public_key_child, ) = call_hd_key(path, original_public_key);

        assert_eq!(public_key_child.x_coor().unwrap().to_hex(), expected_pubkey_x);
        assert_eq!(public_key_child.y_coor().unwrap().to_hex(), expected_pubkey_y);
    }

}