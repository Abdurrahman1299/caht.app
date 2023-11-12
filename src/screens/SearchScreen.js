import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import userAvatar from "../../assets/man.png";
import { getDocs, query, where } from "firebase/firestore";
import { userRef } from "../../firebase/config";
///////////////////////////

export default function SearchScreen({ navigation }) {
  //
  const [searchFriend, setSearchFriend] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [found, setFound] = useState("");
  const [searchFriendsName, setSearchFriendsName] = useState([]);
  //

  useEffect(() => {
    const handleSearch = async () => {
      if (searchFriend === "") return;
      setSearchFriendsName([]);
      setIsLoading(true);

      const queryResult = query(
        userRef,
        where("username", ">=", searchFriend.trim()),
        where("username", "<=", searchFriend.trim() + "\uf8ff")
      );
      const querySnapshot = await getDocs(queryResult);
      if (!querySnapshot.empty) {
        let friends = [];
        querySnapshot.forEach((document) => {
          const { profilePic, username, email } = document.data();
          friends.push({ profilePic, username, email });
        });
        setSearchFriendsName(friends);
        setFound(true);
      } else {
        setFound(false);
      }
      setIsLoading(false);
    };
    // handleSearch();
    handleSearch();
  }, [searchFriend]);

  function renderItem(item) {
    return (
      <TouchableOpacity
        onPress={() => {
          navigation.navigate("Chat", {
            friendAvatar: item.profilePic,
            friendName: item.username,
            friendEmail: item.email,
          });
        }}
      >
        <View>
          <Image
            source={!!item.profilePic ? { uri: item.profilePic } : userAvatar}
            className="h-12 w-12 rounded-full"
          />
          <Text>{item.username}</Text>
        </View>
      </TouchableOpacity>
    );
  }
  //
  return (
    <View className="bg-gray-200 flex-1">
      <View className="flex-row items-center content-center my-3 mx-3 mb-10">
        <TextInput
          className="tracking-widest bg-gray-100 rounded-1g text-base py-2 px-1 mx-2 w-[85%]"
          placeholder="Search"
          autoCapitalize="none"
          keyboardType="default"
          autoFocus={true}
          value={searchFriend}
          onChangeText={(text) => {
            setSearchFriend(text);
          }}
        />
      </View>
      {/* {isLoading && null}s */}
      {found ? (
        <View>
          <FlatList
            data={searchFriendsName}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.username}
            renderItem={({ item }) => renderItem(item)}
          />
        </View>
      ) : (
        <View></View>
      )}
    </View>
  );
}
