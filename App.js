import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthenticatedUserProvider, {
  AuthenticatedUserContext,
} from "./context/AuthenticationContext";
import HomeScreen from "./src/screens/HomeScreen";
import { useContext, useEffect, useState } from "react";
import { auth } from "./firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import Loading from "./src/components/Loading";
import ProfileScreen from "./src/screens/ProfileScreen";
import SearchScreen from "./src/screens/SearchScreen";
import ChatScreen from "./src/screens/ChatScreen";

export default function App() {
  //
  const Stack = createNativeStackNavigator();
  //

  function RootNavigator() {
    const { user, setUser } = useContext(AuthenticatedUserContext);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setUser(user);
        }
        setIsLoading(false);
      });
    }, []);

    function inLoadMode() {
      if (user === null) {
        if (isLoading) {
          return <Loading />;
        } else {
          return <AuthStack />;
        }
      } else {
        return <MainStack />;
      }
    }

    return <NavigationContainer>{inLoadMode()}</NavigationContainer>;
  }

  function AuthStack() {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    );
  }

  function MainStack() {
    return (
      <Stack.Navigator>
        <Stack.Screen name="LetsChat" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    );
  }
  return (
    <AuthenticatedUserProvider>
      <RootNavigator />
    </AuthenticatedUserProvider>
  );
}
