import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BookingConfirmationScreen from "../screens/BookingConfirmationScreen";
import LoginScreen from "../screens/LoginScreen";
import ServicesScreen from "../screens/ServicesScreen";
import UserBookingHistory from '../screens/UserBookingHistory';
import UserTabNav from '../screens/UserTabNav';
import UserBookingScreen from "./UserBookingScreen";

const Stack = createNativeStackNavigator();

export default function UserStack() {
  return (
    <Stack.Navigator screenOptions={{
    headerTitleAlign: 'center',
    headerBackVisible: false ,}}>
      <Stack.Screen name="Inicio" component={UserTabNav}/>
      <Stack.Screen name="Credenciales" component={LoginScreen}/>
      <Stack.Screen name="Nuestros servicios" component={ServicesScreen}/>
      <Stack.Screen name="Agenda tu cita" component={UserBookingScreen} options={{headerBackVisible: true }}/>
      <Stack.Screen name="Historia de citas" component={UserBookingHistory} options={{headerBackVisible: true }}/>
      <Stack.Screen name="Cita confirmada" component={BookingConfirmationScreen} options={{headerBackVisible: false }}/>
    </Stack.Navigator>
  );
};