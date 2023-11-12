import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import userAvatar from "../../assets/man.png";

export default function ChatItem({ navigation, friend }) {
  return (
    <TouchableOpacity>
      <View>
        {friend.avatar !== undefined ? (
          <Image
            source={{ uri: friend.avatar }}
            className="h-12 w-12 rounded-full"
          />
        ) : (
          <Image source={userAvatar} className="h-12 w-12 rounded-full" />
        )}
        <View>
          <Text>{friend.name}</Text>
          <Text>{friend.message[0]?.message}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
