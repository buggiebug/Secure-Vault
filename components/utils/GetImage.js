import { Image } from 'expo-image';

const GetImage = (name, style) => {
    const imageName = String(name).split(" ").join("").toLowerCase();
    const imageNames = [
        "male", "female", "othergender", "cash", "upi", "amazonpay", "googlepay", "mobikwik", "paypal",
        "paytm", "phonepe", "imps", "slice"];

    let imageSource;
    switch (imageName) {
        case imageNames[0]:
            imageSource = require('@/assets/images/avatar/male.png');
            break;
        case imageNames[1]:
            imageSource = require('@/assets/images/avatar/female.png');
            break;
        case imageNames[2]:
            imageSource = require('@/assets/images/avatar/othergender.png');
            break;

        // Bank Logos................................. 
        case imageNames[3]:
            imageSource = require('@/assets/images/banks/cash.webp');
            break;
        case imageNames[4]:
            imageSource = require('@/assets/images/banks/upi.webp');
            break;
        case imageNames[5]:
            imageSource = require('@/assets/images/banks/amazonpay.webp');
            break;
        case imageNames[6]:
            imageSource = require('@/assets/images/banks/gpay.webp');
            break;
        case imageNames[7]:
            imageSource = require('@/assets/images/banks/mobiKwik.webp');
            break;
        case imageNames[8]:
            imageSource = require('@/assets/images/banks/paypal.webp');
            break;
        case imageNames[9]:
            imageSource = require('@/assets/images/banks/paytm.webp');
            break;
        case imageNames[10]:
            imageSource = require('@/assets/images/banks/phonepay.webp');
            break;
        case imageNames[11]:
            imageSource = require('@/assets/images/banks/imps.webp');
            break;
        case imageNames[12]:
            imageSource = require('@/assets/images/banks/slice.webp');
            break;
        default:
            imageSource = require('@/assets/images/banks/cash.webp');
            break;
    }

    if (!imageSource) {
        console.error(`Image with name "${imageName}" not found.`);
        return null;
    }
    return <Image source={imageSource} style={style} />;
};

export default GetImage;