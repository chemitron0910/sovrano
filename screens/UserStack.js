import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BookingConfirmationScreen from "../screens/BookingConfirmationScreen";
import ServicesScreen from '../screens/ServicesScreen';
import UserBookingHistory from '../screens/UserBookingHistory';
import UserTabNav from '../screens/UserTabNav';
import UserBookingScreen from "./UserBookingScreen";

const Stack = createNativeStackNavigator();

export default function UserStack() {
  return (
    <Stack.Navigator screenOptions={{
    headerTitleAlign: 'center',
    headerBackVisible: false ,}}>
      <Stack.Screen
        name="Inicio-Usuario"
        component={UserTabNav}
        options={{
        headerBackVisible: false,
        headerTitleStyle: {
        fontFamily: 'Playfair-Bold', // ✅ Your custom font
        fontSize: 22,
        fontWeight: '400',
        color: '#3e3e3e', // Optional: match Sovrano’s palette
        },
        }}
      />
      <Stack.Screen
        name="Nuestros servicios."
        component={ServicesScreen}
        options={{
        headerBackVisible: true,
        headerTitleStyle: {
        fontFamily: 'Playfair-Bold', // ✅ Your custom font
        fontSize: 22,
        fontWeight: '400',
        color: '#3e3e3e', // Optional: match Sovrano’s palette
        },
        }}
      />
      <Stack.Screen
        name="Agenda tu cita."
        component={UserBookingScreen}
        options={{
        headerBackVisible: false,
        headerTitleStyle: {
        fontFamily: 'Playfair-Bold', // ✅ Your custom font
        fontSize: 22,
        fontWeight: '400',
        color: '#3e3e3e', // Optional: match Sovrano’s palette
        },
        }}
      />
      <Stack.Screen
        name="Historial de citas"
        component={UserBookingHistory}
        options={{
        headerBackVisible: true,
        headerTitleStyle: {
        fontFamily: 'Playfair-Bold', // ✅ Your custom font
        fontSize: 22,
        fontWeight: '400',
        color: '#3e3e3e', // Optional: match Sovrano’s palette
        },
        }}
      />
      <Stack.Screen name="Cita confirmada." component={BookingConfirmationScreen} options={{headerBackVisible: false }}/>
    </Stack.Navigator>
  );
};