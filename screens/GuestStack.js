import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BookingConfirmationScreen from "../screens/BookingConfirmationScreen";
import BookingScreen from "../screens/BookingScreen";
import GuestScreen from "../screens/GuestScreen";
import ServicesScreen from "../screens/ServicesScreen";
import SignUpConfirmationScreen from "../screens/SignUpConfirmationScreen";
import SignUpScreen from "../screens/SignUpScreen";

const Stack = createNativeStackNavigator();

export default function GuestStack() {
  return (
    <Stack.Navigator screenOptions={{
    headerTitleAlign: 'center'}}>
      <Stack.Screen name="Menu" component={GuestScreen} options={{headerBackVisible: false }}/>
      <Stack.Screen name="Nuestros servicios" component={ServicesScreen} options={{headerBackVisible: true }}/>
      <Stack.Screen name="Agenda tu cita" component={BookingScreen} options={{headerBackVisible: true }}/>
      <Stack.Screen name="Registrate" component={SignUpScreen} options={{headerBackVisible: true }}/>
      <Stack.Screen name="Cita confirmada" component={BookingConfirmationScreen} options={{headerBackVisible: false }}/>
      <Stack.Screen name="Registro exitoso" component={SignUpConfirmationScreen} options={{headerBackVisible: false }}/>
    </Stack.Navigator>
  );
};