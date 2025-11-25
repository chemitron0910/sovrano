import Ionicons from "@expo/vector-icons/Ionicons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Platform, StyleSheet } from "react-native";
import AboutScreen from "../screens/AboutScreen";
import { RootStackParamList } from "../src/types";
import ProfileScreen from "./StaffProfileScreen";
import UserScreen from "./UserScreen";

const Tab = createBottomTabNavigator<RootStackParamList>();

export default function UserTabNav() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#e91e63",
      }}
    >
      <Tab.Screen
        name="Inicio-Usuario"
        component={UserScreen}
        options={{
          tabBarLabel: "Inicio-Usuario",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={20} color={color} />
          ),
          headerShown: false,
         }}
      />
      <Tab.Screen
        name="Perfil-Empleado"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Mi perfil",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={20} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Acerca de Sovrano"
        component={AboutScreen}
        options={{ 
          tabBarLabel: "Acerca de",
          tabBarIcon: ({ color }) => (
            <Ionicons name="information-circle" size={20} color={color} />
          ),
          headerShown: false, }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: Platform.OS === "android" ? 25 : 0,
  },
});
