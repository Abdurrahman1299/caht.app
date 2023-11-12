import {
  View,
  Image,
  TouchableOpacity,
  Text,
  Button,
  FlatList,
} from "react-native";
import React, { useContext, useEffect, useLayoutEffect, useState } from "react";
import avatar from "../../assets/man.png";
import { Entypo } from "@expo/vector-icons";
import { AuthenticatedUserContext } from "../../context/AuthenticationContext";
import { getDocs, onSnapshot, query, where } from "firebase/firestore";
import { chatRef, userRef } from "../../firebase/config";
import { combinedData, sortLastMessage } from "../utils";
import ChatItem from "../components/ChatItem";
import { ScrollView } from "react-native";

export default function HomeScreen({ navigation }) {
  //
  const { user, setUser, userAvatarUrl, setUserAvatarUrl } = useContext(
    AuthenticatedUserContext
  );
  const username = user.email.split("@")[0];
  const [friends, setFriends] = useState([]);
  const [friendAvatar, setFriendAvatar] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastMessage, setLastMessage] = useState(false);

  //
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <Image
            source={userAvatarUrl ? { uri: userAvatarUrl } : avatar}
            className="w-10 h-10 rounded-full"
          />
        </TouchableOpacity>
      ),
    });
  }, [userAvatarUrl]);

  useEffect(() => {
    if (!user) return;
    const queryResult = query(userRef, where("email", "==", user.email));

    const DocFinder = async (queryResult) => {
      const querySnapshot = await getDocs(queryResult);
      querySnapshot.forEach((doc) => {
        const { profilePic } = doc.data();
        setUserAvatarUrl(profilePic);
      });
    };
    // from queryResult we get querySnapshot, from snapshot docs we get our doc which has a data() method that gives us the data in the database.
    DocFinder(queryResult);
  }, []);

  useEffect(() => {
    if (!user) return;

    const FetchLoggedUserChats = async () => {
      setIsLoading(true);
      const queryResult = query(
        chatRef,
        where("chatters", ">=", `${username}`),
        where("chatters", "<=", `${username}` + "\uf8ff")
      );
      const queryResult2 = query(
        chatRef,
        where("chatters", "<=", ` xx ${username}`)
      );

      let friendsArray = [];
      const unsubscribe = onSnapshot(queryResult, (querySnapshot) => {
        setIsLoading(false);
        querySnapshot.forEach((document) => {
          if (document.data().chatters.includes(username)) {
            const chats = document.data().chatters;
            const friends = chats
              .replace(username, "")
              .replace("xx", "")
              .replace("  ", "");

            friendsArray.push(friends);
            friendsArray = [...new Set(friendsArray)];
            setFriends(friendsArray);
          }
        });
      });
      const unsubscribe2 = onSnapshot(queryResult2, (querySnapshot) => {
        setIsLoading(false);
        querySnapshot.forEach((document) => {
          if (document.data().chatters.includes(username)) {
            const chats = document.data().chatters;
            const friends = chats
              .replace(username, "")
              .replace("xx", "")
              .replace("  ", "");

            friendsArray.push(friends);
            friendsArray = [...new Set(friendsArray)];
            setFriends(friendsArray);
          }
        });
      });

      return () => {
        unsubscribe();
        unsubscribe2();
      };
    };
    FetchLoggedUserChats();
  }, []);

  useEffect(() => {
    if (!user) return;

    let avatarsArray = [];
    let latestMessage = [];

    const unsubscribe = friends.map((friend) => {
      const queryResult = query(userRef, where("username", "==", friend));
      const unsubFriend = onSnapshot(queryResult, (querySnapshot) => {
        querySnapshot.forEach((document) => {
          const { profilePic, email } = document.data();
          avatarsArray.push({ name: friend, avatar: profilePic, email: email });
          setFriendAvatar([...avatarsArray]);
        });
      });

      const queryResult2 = query(
        chatRef,
        where("chatters", "==", `${username} xx ${friend}`)
      );
      const queryResult3 = query(
        chatRef,
        where("chatters", "==", `${friend} xx ${username}`)
      );

      const unsubChat = onSnapshot(queryResult2, (querySnapshot) => {
        querySnapshot.forEach((document) => {
          const conversation = document.data().conversation;

          let lastMessage = [];

          if (conversation && conversation.length > 0) {
            lastMessage = [conversation[conversation.length - 1]];
            // console.log(lastMessage);
            latestMessage.push({
              chatters: document.data().chatters,
              message: lastMessage,
            });
            setLastMessage([...latestMessage]);
            // console.log(lastMessage);
          }
        });
      });

      const unsubChat2 = onSnapshot(queryResult3, (querySnapshot) => {
        querySnapshot.forEach((document) => {
          const conversation = document.data().conversation;
          let lastMessage = [];

          if (conversation && conversation.length > 0) {
            lastMessage = [conversation[conversation.length - 1]];
            latestMessage.push({
              chatters: document.data().chatters,
              message: lastMessage,
            });
            setLastMessage([...latestMessage]);
            // console.log(lastMessage);
          }
        });
      });

      return () => {
        unsubFriend();
        unsubChat();
        unsubChat2();
      };
    });
    return () => unsubscribe.forEach((unsub) => unsub());
  }, [friends]);

  //
  return (
    <>
      <ScrollView>
        {React.Children.toArray(
          friendAvatar.map((item) => (
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() =>
                navigation.navigate("Chat", {
                  friendAvatar: item.avatar,
                  friendName: item.name,
                  friendEmail: item.email,
                })
              }
            >
              <Image
                source={{ uri: item.avatar }}
                className="w-16 h-16 rounded-full"
              />
              <Text>{item.name}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <View className="flex-1">
        <View className=" flex-row-reverse absolute bottom-14 right-5">
          <TouchableOpacity
            onPress={() => navigation.navigate("Search")}
            className="bg-orange-500 h-16 w-16 rounded-full text-center items-center justify-center"
          >
            <Entypo name="chat" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
