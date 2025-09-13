import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight } from "expo-symbols";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

export function IconSymbol({
  icon = "material",
  name,
  size = 24,
  color,
  style,
}: {
  icon?: "material" | "ant";
  name: any;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  if (icon === "material") {
    return (
      <MaterialIcons
        color={color}
        size={size}
        name={name || "help-outline"} // fallback only
        style={style}
      />
    );
  }

  if (icon === "ant") {
    return (
      <AntDesign
        color={color}
        size={size}
        name={name || "questioncircleo"} // fallback only
        style={style}
      />
    );
  }

  return null;
}
