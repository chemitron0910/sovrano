import Ionicons from "@expo/vector-icons/Ionicons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Platform, StyleSheet, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import CourseListScreen from "../screens/CourseListScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";

const Tab = createBottomTabNavigator();

export default function Index() {

  const windowDimensions = useWindowDimensions();
  const windowWidth = windowDimensions.width;
  const windowHeight = windowDimensions.height;

  return (    
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <Tab.Navigator
          screenOptions={{ 
          tabBarActiveTintColor: '#e91e63',
          }}>
          <Tab.Screen name="Profile" component={ProfileScreen} 
            options={{
            tabBarLabel: "My profile",
            tabBarIcon: ({ color }) => (
              <Ionicons name="person" size={20} color={color} />
            ),
            tabBarBadge:3,
          }}/>
          <Tab.Screen name="CourseList" component={CourseListScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </View>
    </SafeAreaView>


  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
});