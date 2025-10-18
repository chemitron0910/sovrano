import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from "react-native";
import BookingScreen from "../screens/BookingScreen";
import HomeScreen from '../screens/HomeScreen';
import ServicesScreen from "../screens/ServicesScreen";
import SignUpScreen from "../screens/SignUpScreen";

const Stack = createNativeStackNavigator();

export default function GuestStack() {
  return (
    <Stack.Navigator screenOptions={{
    headerTitleAlign: 'center',
    headerBackVisible: false ,}}>
      <Stack.Screen name="Menu" component={HomeScreen}/>
      <Stack.Screen name="Nuestros servicios" component={ServicesScreen}/>
      <Stack.Screen name="Agenda tu cita" component={BookingScreen}/>
      <Stack.Screen name="Registrate" component={SignUpScreen}/>
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