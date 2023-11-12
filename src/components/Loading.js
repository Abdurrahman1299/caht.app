import { StyleSheet, View } from "react-native";
import { BarIndicator } from "react-native-indicators";
//
export default function Loading() {
  return (
    <View style={styles.container}>
      <BarIndicator color="black" size={30} count={5} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
