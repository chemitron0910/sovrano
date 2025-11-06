import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from "../screens/LoginScreen";
import AdminBookingHistory from './AdminBookingHistory';
import AdminBookingScreen from './AdminBookingScreen';
import AdminServicesScreen from "./AdminServicesScreen";
import AdminTabNav from './AdminTabNav';
import RoleAssignmentScreen from "./RoleAssignmentScreen";
import StaffBookingHistory from './StaffBookingHistory';
import StaffBookingScreen from './StaffBookingScreen';
import StaffTabNav from './StaffTabNav';

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{
    headerTitleAlign: 'center'}}>
      <Stack.Screen
        name="Inicio-Admin"
        component={AdminTabNav}
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
        name="Assignar responsabilidad"
        component={RoleAssignmentScreen}
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
        name="Manejar servicios"
        component={AdminServicesScreen}
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
        name="Calendario de citas"
        component={AdminBookingScreen}
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
        name="Historia de citas"
        component={AdminBookingHistory}
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
        name="Inicio-Empleado"
        component={StaffTabNav}
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
        name="Calendario de citas."
        component={StaffBookingScreen}
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
        name="Historia de citas."
        component={StaffBookingHistory}
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
      <Stack.Screen name="Inicio-Sovrano" component={LoginScreen}/>
    </Stack.Navigator>
  );
};