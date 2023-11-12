import { StyleSheet, Text, View } from "react-native";
import { useState } from "react";

export default function ColoredView({
  children,
  width,
  height,
  borderRadius,
  padding,
  margin,
}) {
  //
  const [randomHex, setRandomHex] = useState(
    `${Math.floor(Math.random() * 900000) + 100000}`
  );

  //
  return <View style={{ backgroundColor: `#${randomHex}` }}>{children}</View>;
}

const styles = StyleSheet.create({});
