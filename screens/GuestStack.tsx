import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BookingConfirmationScreen from "../screens/BookingConfirmationScreen";
import GuestScreen from "../screens/GuestScreen";
import SignUpConfirmationScreen from "../screens/SignUpConfirmationScreen";
import { RootStackParamList } from '../src/types';
import BookingScreen from "./BookingScreen";
import GuestStaffInfoScreen from './GuestStaffInfoScreen';
import ServicesScreen from "./ServicesScreen";
import SignUpScreen from "./SignUpScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function GuestStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTitleAlign: "center" }}>
      <Stack.Screen
        name="Menu-Invitado"
        component={GuestScreen}
        options={{
          headerBackVisible: false,
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
        initialParams={{ role: "guest" }} // ✅ ensures role is always defined
        options={{ headerBackVisible: true }}
      />
      <Stack.Screen
        name="Nuestros artistas"
        component={GuestStaffInfoScreen}
        initialParams={{ role: "guest", staffId: "" }} // ✅ include staffId
        options={{ headerBackVisible: true }}
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
        name="Registrarse"
        component={SignUpScreen}
        options={{
          headerBackVisible: false,
          headerTitleStyle: {
            fontFamily: "Playfair-Bold",
            fontSize: 22,
            fontWeight: "400",
            color: "#3e3e3e",
          },
        }}
      />
      <Stack.Screen
        name="Registro exitoso"
        component={SignUpConfirmationScreen}
        options={{
          headerBackVisible: false,
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
        options={{
          headerBackVisible: false,
          headerTitleStyle: {
            fontFamily: "Playfair-Bold",
            fontSize: 22,
            fontWeight: "400",
            color: "#3e3e3e",
          },
        }}
      />
    </Stack.Navigator>
  );
}
