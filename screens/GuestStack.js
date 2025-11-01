import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BookingConfirmationScreen from "../screens/BookingConfirmationScreen";
import GuestScreen from "../screens/GuestScreen";
import ServicesScreen from "../screens/ServicesScreen";
import SignUpConfirmationScreen from "../screens/SignUpConfirmationScreen";
import GuestBookingScreen from "./GuestBookingScreen";
import SignUpScreen from './SignUpScreen';

const Stack = createNativeStackNavigator();

export default function GuestStack() {
  return (
    <Stack.Navigator screenOptions={{
        headerTitleAlign: 'center'}}>
        <Stack.Screen name="Inicio-Invitado" component={GuestScreen} options={{headerBackVisible: false }}/>
        <Stack.Screen name="Nuestros servicios" component={ServicesScreen} options={{headerBackVisible: true }}/>
        <Stack.Screen name="Agenda tu cita" component={GuestBookingScreen} options={{headerBackVisible: true }}/>
        <Stack.Screen name="Registrarse" component={SignUpScreen} options={{headerBackVisible: false }}/>
        <Stack.Screen name="Registro exitoso" component={SignUpConfirmationScreen} options={{headerBackVisible: false }}/>
        <Stack.Screen name="Cita confirmada" component={BookingConfirmationScreen} options={{headerBackVisible: false }}/>
    </Stack.Navigator>
  );
};
