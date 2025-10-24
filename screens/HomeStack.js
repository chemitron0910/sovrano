import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from "react-native";
import BookingScreen from "../screens/BookingScreen";
import GuestStack from "../screens/GuestStack";
import HomeScreen from '../screens/HomeScreen';
import ServicesScreen from "../screens/ServicesScreen";
import UserStack from "../screens/UserStack";

const Stack = createNativeStackNavigator();

export default function HomeStack() {

  return (
    
    <Stack.Navigator screenOptions={{
    headerTitleAlign: 'center',
    headerBackVisible: false ,}}>
      <Stack.Screen name="Inicio" component={HomeScreen}/>
      <Stack.Screen name="Nuestros servicios" component={ServicesScreen}/>
      <Stack.Screen name="Invitado" component={GuestStack} options={{headerBackVisible: false }}/>
      <Stack.Screen name="Usuario registrado" component={UserStack} options={{headerBackVisible: false }}/>      
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