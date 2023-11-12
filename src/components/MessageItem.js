import { View, Text } from "react-native";
import React from "react";

export default function MessageItem({ item, sender }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: item.sender === sender ? "flex-end" : "flex-start",
        padding: 10,
      }}
    >
      <View
        style={{
          backgroundColor: item.sender === sender ? "#dcf8c6" : "#ffffff",
          padding: 10,
          borderRadius: 10,
          maxWidth: "80%",
          marginRight: 10,
          marginLeft: 10,
        }}
      >
        <Text>{item.sender}</Text>
        <Text>{item.message}</Text>
      </View>
    </View>
  );
}
