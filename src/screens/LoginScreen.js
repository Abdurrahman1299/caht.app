import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import bgPic from "../../assets/background_signin.jpg";
import { useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/config";
import { Entypo } from "@expo/vector-icons";
import { registerIndieID, unregisterIndieDevice } from "native-notify";

export default function LoginScreen({ navigation }) {
  //
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passShown, setPassShown] = useState(false);
  //
  const onHandleLogin = () => {
    if (email !== "" && password !== "") {
      signInWithEmailAndPassword(auth, email, password)
        .then(() =>
          registerIndieID(`${email}`, 14606, "4d6cCy1svYxF5ZyIxaNzfS")
        )
        .catch((e) => {
          if (e.code === "auth/invalid-login-credentials") {
            Alert.alert("error", "incorrect email or password");
          } else if (e.code === "auth/invalid-email") {
            Alert.alert("error", "invalid email account");
          } else {
            console.log(e.code);
          }
        });
    }
  };
  //
  return (
    <KeyboardAwareScrollView className="bg-black">
      <View>
        <Image source={bgPic} className="object-cover h-80 w-full" />
      </View>
      <View className="bg-white h-screen rounded-t-3xl ">
        <Text className="text-[#d60e45] text-2xl font-semibold text-center py-3 mt-3">
          Sign In
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
        </View>
        <TouchableOpacity
          onPress={onHandleLogin}
          className="bg-[#fac25a] py-2 rounded-md mx-10 mt-16 mb-3"
        >
          <Text className="text-center text-lg text-white font-semibold">
            Login
          </Text>
        </TouchableOpacity>
        <View className="flex-row space-x-2 justify-center">
          <Text>Don't have an account ?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text className="text-[#4b73ec] font-medium">Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
