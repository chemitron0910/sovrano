import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BookingConfirmationScreen from "../screens/BookingConfirmationScreen";
import GuestScreen from "../screens/GuestScreen";
import SignUpConfirmationScreen from "../screens/SignUpConfirmationScreen";
import GuestBookingScreen from "./GuestBookingScreen";
import ServicesScreen from "./ServicesScreen.tsx";
import SignUpScreen from './SignUpScreen';

const Stack = createNativeStackNavigator();

export default function GuestStack() {
  return (
    <Stack.Navigator screenOptions={{headerTitleAlign: 'center'}}>
      <Stack.Screen
        name="Inicio-Invitado"
        component={GuestScreen}
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
      <Stack.Screen name="Nuestros servicios" component={ServicesScreen} options={{headerBackVisible: true }}/>
      <Stack.Screen
        name="Agenda tu cita"
        component={GuestBookingScreen}
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
        name="Registrarse"
        component={SignUpScreen}
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
        name="Registro exitoso"
        component={SignUpConfirmationScreen}
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
        name="Cita confirmada"
        component={BookingConfirmationScreen}
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
    </Stack.Navigator>
  );
};
