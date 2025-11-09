import Ionicons from "@expo/vector-icons/Ionicons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Platform, StyleSheet } from "react-native";
import StaffProfileStack from './StaffProfileStack';
import StaffScreen from "./StaffScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export default function StaffTabNav() {
  return (
        <Tab.Navigator
          screenOptions={{ 
          tabBarActiveTintColor: '#e91e63',
          }}>
          <Tab.Screen name="Inicio" 
            component={StaffScreen}
            options={{headerShown:false}} />
          <Tab.Screen name="Perfil" component={StaffProfileStack} 
              options={{
              tabBarLabel: "Mi perfil",
              tabBarIcon: ({ color }) => (
                <Ionicons name="person" size={20} color={color} />
              ),
              headerShown:false
          }}/>
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