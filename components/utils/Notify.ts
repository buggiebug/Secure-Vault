import { ToastAndroid } from "react-native";

enum ToastDuration {
    SHORT,
    LONG,
}
export default function Notify(message: string, duration: ToastDuration) {
    if (duration == ToastDuration.LONG) {
        return ToastAndroid.show(message, ToastAndroid.LONG);
    } else {
        return ToastAndroid.show(message, ToastAndroid.SHORT);
    }
}


