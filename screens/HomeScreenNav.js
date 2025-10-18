import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from "react-native";
import BookingScreen from "../screens/BookingScreen";
import HomeScreen from '../screens/HomeScreen';
import ServicesScreen from "../screens/ServicesScreen";

const Stack = createNativeStackNavigator();

export default function HomeScreenNav() {
  return (
    <Stack.Navigator screenOptions={{
    headerTitleAlign: 'center',}}>
      <Stack.Screen name="Menu" component={HomeScreen}/>
      <Stack.Screen name="Nuestros servicios" component={ServicesScreen}/>
      <Stack.Screen name="Agenda tu cita" component={BookingScreen}/>
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
});