import Ionicons from "@expo/vector-icons/Ionicons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from 'react';
import { Platform, StyleSheet } from "react-native";
import AboutScreen from "../screens/AboutScreen";
import HomeStack from "../screens/HomeStack";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export default function Index() {
  return (
        <Tab.Navigator
          screenOptions={{ 
          tabBarActiveTintColor: '#e91e63',
          }}>
          <Tab.Screen name="Inicio" 
            component={HomeStack}
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