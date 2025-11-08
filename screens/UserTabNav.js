import Ionicons from "@expo/vector-icons/Ionicons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Platform, StyleSheet } from "react-native";
import AboutScreen from "../screens/AboutScreen";
import ProfileScreen from "./StaffProfileScreen";
import UserScreen from "./UserScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export default function UserTabNav() {
  return (
        <Tab.Navigator
          screenOptions={{ 
          tabBarActiveTintColor: '#e91e63',
          }}>
          <Tab.Screen name="Inicio" 
            component={UserScreen}
            options={{headerShown:false}} />
          <Tab.Screen name="Perfil" component={ProfileScreen} 
              options={{
              tabBarLabel: "Mi perfil",
              tabBarIcon: ({ color }) => (
                <Ionicons name="person" size={20} color={color} />
              ),
              tabBarBadge:3,
              headerShown:false
          }}/>
          <Tab.Screen name="Acerca de Sovrano" 
            component={AboutScreen}
            options={{headerShown:false}} />
        </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
});