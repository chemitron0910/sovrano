import Ionicons from "@expo/vector-icons/Ionicons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import CourseListScreen from "../screens/CourseListScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
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
  );
}