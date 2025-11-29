import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../src/types';

import BookingConfirmationScreen from "../screens/BookingConfirmationScreen";
import ServicesScreen from "../screens/ServicesScreen";
import UserBookingHistory from "../screens/UserBookingHistory";
import UserTabNav from "../screens/UserTabNav";
import BookingScreen from "./BookingScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function UserStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: "center",
        headerBackVisible: false,
      }}
    >
      <Stack.Screen
        name="Menu-Usuario"
        component={UserTabNav}
        options={{
          headerBackVisible: true,
          headerTitleStyle: {
            fontFamily: "Playfair-Bold",
            fontSize: 22,
            fontWeight: "400",
            color: "#3e3e3e",
          },
        }}
      />
      <Stack.Screen
        name="Nuestros servicios"
        component={ServicesScreen}
        initialParams={{ role: "usuario" }} // ✅ ensures role is always defined
        options={{
          headerBackVisible: true,
          headerTitleStyle: {
            fontFamily: "Playfair-Bold",
            fontSize: 22,
            fontWeight: "400",
            color: "#3e3e3e",
          },
        }}
      />
      <Stack.Screen
        name="Agenda tu cita"
        component={BookingScreen}
        options={{
          headerBackVisible: true,
          headerTitleStyle: {
            fontFamily: "Playfair-Bold",
            fontSize: 22,
            fontWeight: "400",
            color: "#3e3e3e",
          },
        }}
      />
      <Stack.Screen
        name="Historial de citas"
        component={UserBookingHistory}
        options={{
          headerBackVisible: true,
          headerTitleStyle: {
            fontFamily: "Playfair-Bold",
            fontSize: 22,
            fontWeight: "400",
            color: "#3e3e3e",
          },
        }}
      />
      <Stack.Screen
        name="Cita confirmada"
        component={BookingConfirmationScreen}
        options={{ headerBackVisible: false }}
      />
    </Stack.Navigator>
  );
}
