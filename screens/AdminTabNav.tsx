import Ionicons from "@expo/vector-icons/Ionicons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Platform, StyleSheet } from "react-native";
import AboutScreen from "../screens/AboutScreen";
import { RootStackParamList } from "../src/types";
import AdminScreen from "./AdminScreen";
import ProfileScreen from "./StaffProfileScreen";

const Tab = createBottomTabNavigator<RootStackParamList>();

export default function AdminTabNav() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#e91e63",
      }}
    >
      <Tab.Screen
        name="Inicio-Admin"
        component={AdminScreen}
        options={{ headerShown: false }}
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
        options={{ headerShown: false }}
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
