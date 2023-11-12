import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth, db, userRef } from "../../firebase/config";
import { AuthenticatedUserContext } from "../../context/AuthenticationContext";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { ref, getStorage, uploadBytes, getDownloadURL } from "firebase/storage";
import Loading from "../components/Loading";

export default function ProfileScreen({ navigation }) {
  //
  const storage = getStorage();
  const { user, setUser, userAvatarUrl, setUserAvatarUrl } = useContext(
    AuthenticatedUserContext
  );
  //
  const queryResult = query(userRef, where("email", "==", user.email));
  const [username, setUsername] = useState("");
  const [useremail, setUseremail] = useState("");
  const [userImageUrl, setUserImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  //
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [5, 5],
      quality: 1,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (image) => {
    try {
      setIsLoading(true);
      const response = await fetch(image);
      const blob = await response.blob();
      const filename = image.substring(image.lastIndexOf("/"));
      const imageRef = ref(storage, `ProfilePictures/${filename}`);
      uploadBytes(imageRef, blob).then(async () => {
        const downloadUrl = await getDownloadURL(imageRef);
        const querySnapshot = await getDocs(queryResult);
        querySnapshot.forEach(async (document) => {
          await updateDoc(doc(db, "users", document.id), {
            profilePic: downloadUrl,
          }).then(() => {
            setUserImageUrl(downloadUrl);
            setUserAvatarUrl(downloadUrl);
            setIsLoading(false);
          });
        });
      });
    } catch (error) {
      Alert.alert(error.message);
      setIsLoading(false);
    }
  };

  const DocFinder = async (queryResult) => {
    const querySnapshot = await getDocs(queryResult);

    querySnapshot.forEach((doc) => {
      if (username === "") {
        const { username, email } = doc.data();
        setUsername(username);
        setUseremail(email);
      }
    });
  };

  useEffect(() => {
    if (!user) return;
    DocFinder(queryResult);
  }, []);

  //
  function handleSignout() {
    signOut(auth)
      .then(() => {
        setUser(null);
        navigation.navigate("Login");
      })
      .catch((e) => console.log(e.message));
  }
  //
  return (
    <View className=" items-center justify-center ">
      <View className="justify-center items-center my-5">
        <Text className="text-2x1 font-medium tracking-widest">
          Welcome, <Text className="text-[#d60045]">{username}</Text>
        </Text>
      </View>
      <TouchableOpacity
        onPress={pickImage}
        className="rounded-md bg-gray-400 items-center w-40 justify-center mx-10 mb-10"
      >
        {!userAvatarUrl ? (
          <Ionicons name="camera" size={50} color="white" />
        ) : isLoading ? (
          <Loading />
        ) : (
          <Image
            source={{ uri: userAvatarUrl }}
            className="h-40 w-40 rounded-md"
          />
        )}
      </TouchableOpacity>

      <View>
        <Text className="tracking-widest bg-gray-200 rounded-1g w-80 text-base py-2 px-1 mx-3 my-1">
          {username}
        </Text>
        <Text className="my-1 tracking-widest bg-gray-200 rounded-1g w-80 text-base py-2 px-1 mx-3">
          {useremail}
        </Text>
      </View>
      <View>
        <TouchableOpacity
          onPress={handleSignout}
          className=" bg-[#fac25a] py-2 px-10 rounded-md mx-20 mt-10 mb-3"
        >
          <Text className="text-center text-white font-semibold text-lg">
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
