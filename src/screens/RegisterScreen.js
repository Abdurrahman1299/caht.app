import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import bgPic from "../../assets/background_signup.jpg";
import { useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase/config";
import { Entypo } from "@expo/vector-icons";
import { addDoc, collection } from "firebase/firestore";

export default function RegisterScreen({ navigation }) {
  //
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passShown, setPassShown] = useState(false);
  const [confPassShown, setConfPassShown] = useState(false);

  //
  const onHandleRegister = () => {
    if (email !== "" && password !== "" && confirmPassword !== "") {
      if (password !== confirmPassword) {
        Alert.alert("Password does not match");
      } else {
        createUserWithEmailAndPassword(auth, email, password)
          .then(async (result) => {
            console.log(`${result.operationType} succeess`);
            await addDoc(collection(db, "users"), {
              userId: result.user.uid,
              email: result.user.email,
              username: result.user.email.split("@")[0],
            });
          })
          .catch((e) => {
            if (e.code === "auth/invalid-email") {
              Alert.alert("Wrong", "Invalid Email Account");
            } else if (e.code === "auth/weak-password") {
              Alert.alert("weak password");
            } else if (e.code === "auth/email-already-in-use") {
              Alert.alert("this email already exists!");
            } else {
              console.error(e.code);
            }
          });
      }
    }
  };
  //
  return (
    <KeyboardAwareScrollView className="bg-black">
      <View>
        <Image source={bgPic} className="object-cover h-80 w-full" />
      </View>
      <View className="bg-white h-screen rounded-t-3xl">
        <Text className="text-[#d60e45] text-2xl font-semibold text-center py-3 mt-3">
          Sign Up
        </Text>
        <View>
          <TextInput
            className="tracking-widest bg-gray-100 rounded-lg w-100 text-base py-2 px-1 mx-3 mb-5"
            placeholder="Enter Email"
            keyboardType="email-address"
            textContentType="emailAddress"
            value={email}
            onChangeText={(text) => setEmail(text)}
            autoCapitalize="none"
          />
          <View>
            <TextInput
              className="tracking-widest bg-gray-100 rounded-lg w-100 text-base py-2 px-1 mx-3 mb-5"
              placeholder="Enter Password"
              secureTextEntry={!passShown}
              autoCorrect={false}
              autoCapitalize="none"
              textContentType="password"
              value={password}
              onChangeText={(text) => setPassword(text)}
            />
            <Entypo
              name="eye"
              size={24}
              color={passShown ? "#e49c00" : "black"}
              style={{ position: "absolute", right: 20, top: 10 }}
              onPress={() => setPassShown(!passShown)}
            />
          </View>
          <View>
            <TextInput
              className="tracking-widest bg-gray-100 rounded-lg w-100 text-base py-2 px-1 mx-3 mb-5"
              placeholder="Confirm Password"
              secureTextEntry={!confPassShown}
              autoCorrect={false}
              autoCapitalize="none"
              textContentType="password"
              value={confirmPassword}
              onChangeText={(text) => setConfirmPassword(text)}
            />
            <Entypo
              name="eye"
              size={24}
              color={confPassShown ? "#e49c00" : "black"}
              style={{ position: "absolute", right: 20, top: 10 }}
              onPress={() => setConfPassShown(!confPassShown)}
            />
          </View>
        </View>
        <TouchableOpacity
          onPress={onHandleRegister}
          className="bg-[#fac25a] py-2 rounded-md mx-10 mt-16 mb-3"
        >
          <Text className="text-center text-lg text-white font-semibold">
            Register
          </Text>
        </TouchableOpacity>
        <View className="flex-row space-x-2 justify-center">
          <Text>Already have an account ?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text className="text-[#4b73ec] font-medium">Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
