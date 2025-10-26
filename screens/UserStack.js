import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BookingConfirmationScreen from "../screens/BookingConfirmationScreen";
import BookingScreen from "../screens/BookingScreen";
import LoginScreen from "../screens/LoginScreen";
import ServicesScreen from "../screens/ServicesScreen";
import UserScreen from '../screens/UserScreen';

const Stack = createNativeStackNavigator();

export default function UserStack() {
  return (
    <Stack.Navigator screenOptions={{
    headerTitleAlign: 'center',
    headerBackVisible: false ,}}>
      <Stack.Screen name="Inicio" component={UserScreen}/>
      <Stack.Screen name="Credenciales" component={LoginScreen}/>
      <Stack.Screen name="Nuestros servicios" component={ServicesScreen}/>
      <Stack.Screen name="Agenda tu cita" component={BookingScreen} options={{headerBackVisible: true }}/>
      <Stack.Screen name="Cita confirmada" component={BookingConfirmationScreen} options={{headerBackVisible: false }}/>
    </Stack.Navigator>
  );
};