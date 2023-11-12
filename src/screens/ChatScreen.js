import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
} from "react-native";
import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import userAvatar from "../../assets/man.png";
import { AuthenticatedUserContext } from "../../context/AuthenticationContext";
import {
  Timestamp,
  addDoc,
  collection,
  getDocs,
  query,
  updateDoc,
  where,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { chatRef, db } from "../../firebase/config";
import MessageItem from "../components/MessageItem";
import axios from "axios";

export default function ChatScreen({ navigation, route }) {
  //
  const { user } = useContext(AuthenticatedUserContext);
  const { friendName, friendAvatar, friendEmail } = route.params;
  const [message, setMessage] = useState("");
  const [appearentMsg, setAppearentMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const [isListReady, setIsListReady] = useState(false);
  const sender = user.email.split("@")[0];
  const flatListRef = useRef(null);
  const queryResult = query(
    chatRef,
    where("chatters", "==", `${sender} xx ${friendName}`)
  );
  const queryResult2 = query(
    chatRef,
    where("chatters", "==", `${friendName} xx ${sender}`)
  );
  //

  // console.log(chatRef);

  //
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View
          className="Flex-row space-x-2 items-center"
          style={{ flexDirection: "row" }}
        >
          {friendAvatar !== undefined ? (
            <Image
              source={{ uri: friendAvatar }}
              className="h-11 w-11 rounded-full mr-2"
            />
          ) : (
            <Image
              source={userAvatar}
              className="h-11 w-11 rounded-full mr-2"
            />
          )}
          <Text className="text-red">{friendName}</Text>
        </View>
      ),
    });
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      const querySnapshot = await getDocs(queryResult);
      const querySnapshot2 = await getDocs(queryResult2);

      if (!querySnapshot.empty || !querySnapshot2.empty) {
        let allMessages = querySnapshot.docs
          .map((doc) => doc.data().conversation)
          .concat(querySnapshot2.docs.map((doc) => doc.data().conversation));

        allMessages = allMessages.sort(
          (a, b) => a.timestamp?.seconds - b.timestamp?.seconds
        );

        setMessages(allMessages);
      }
    };
    const unsub1 = onSnapshot(queryResult, (snapshot) => {
      const allMessages = snapshot.docs.map(
        (document) => document.data().conversation
      );

      setMessage(allMessages);
    });
    const unsub2 = onSnapshot(queryResult2, (snapshot) => {
      const allMessages = snapshot.docs.map(
        (document) => document.data().conversation
      );

      setMessage(allMessages);
    });

    fetchMessages();
    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  const handleSubmit = async () => {
    if (message.trim() === "") return;
    setAppearentMsg("");

    const querySnapshot = await getDocs(queryResult);
    const querySnapshot2 = await getDocs(queryResult2);

    if (!querySnapshot.empty || !querySnapshot2.empty) {
      //
      querySnapshot.forEach((document) => {
        updateDoc(doc(db, "chats", document.id), {
          conversation: [
            ...document.data().conversation,
            {
              message: message,
              timestamp: Timestamp.now(),
              sender: sender,
            },
          ],
        }).catch((e) => console.log(e));
      });

      querySnapshot2.forEach((document) => {
        updateDoc(doc(db, "chats", document.id), {
          conversation: [
            ...document.data().conversation,
            {
              message: message,
              timestamp: Timestamp.now(),
              sender: sender,
            },
          ],
        }).catch((e) => console.log(e));
      });
    } else {
      await addDoc(collection(db, "chats"), {
        chatters: `${sender} xx ${friendName}`,
        conversation: [
          {
            message: message,
            timestamp: Timestamp.now(),
            sender: sender,
          },
        ],
      });
    }

    async function RetryRequest(maxRetries = 3) {
      let retries = 0;
      try {
        const response = await axios.post(
          `https://app.nativenotify.com/api/indie/notification`,
          {
            subID: `${friendEmail}`,
            appId: 14606,
            appToken: "4d6cCy1svYxF5ZyIxaNzfS",
            title: "notification title",
            message: "notification message",
          }
        );

        return response;
      } catch (error) {
        console.log(error, "request faild");
        retries++;
      }
    }
    RetryRequest();
    setMessage("");
  };

  useEffect(() => {
    setIsListReady(true);
  }, [messages.length]);

  //
  return (
    <View>
      <View className="h-[90%]">
        {messages[0] !== undefined && (
          <FlatList
            initialNumToRender={10}
            ref={flatListRef}
            onContentSizeChange={() => {
              if (isListReady) {
                flatListRef?.current?.scrollToEnd({ animated: true });
              }
            }}
            data={messages[0]}
            keyExtractor={(item) => item.timestamp}
            renderItem={({ item }) => (
              <MessageItem item={item} sender={sender} />
            )}
          />
        )}
      </View>
      <View className="h-[10%] flex-row items-center mx-3 space-x-3 -mb-3">
        <TextInput
          className="bg-white rounded-xl p-2 flex-1 Otext-gray-700 h-12"
          placeholder="type your message here ..."
          multiline={true}
          value={appearentMsg}
          onChangeText={(t) => {
            setMessage(t);
            setAppearentMsg(t);
          }}
        />
        <TouchableOpacity onPress={handleSubmit}>
          <MaterialCommunityIcons name="send-circle" size={55} color="orange" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
