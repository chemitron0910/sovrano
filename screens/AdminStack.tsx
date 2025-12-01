import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from "../screens/LoginScreen";
import { RootStackParamList } from '../src/types';
import AdminBookingHistory from "./AdminBookingHistory";
import AdminBookingScreen from "./AdminBookingScreen";
import AdminServicesScreen from "./AdminServicesScreen";
import AdminStaffManageScreen from "./AdminStaffManageScreen";
import AdminStaffScreen from "./AdminStaffScreen";
import AdminTabNav from "./AdminTabNav";
import RoleAssignmentScreen from "./RoleAssignmentScreen";
import StaffBookingHistory from "./StaffBookingHistory";
import StaffBookingScreen from "./StaffBookingScreen";
import StaffCalendarScreen from "./StaffCalendarScreen";
import StaffInfoScreen from "./StaffInfoScreen";
import StaffScreen from "./StaffScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTitleAlign: "center" }}>
      <Stack.Screen
        name="Menu-Admin"
        component={AdminTabNav}
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
        name="Assignar responsabilidad"
        component={RoleAssignmentScreen}
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
        name="Manejar servicios"
        component={AdminServicesScreen}
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
        name="Calendario de citas"
        component={AdminBookingScreen}
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
        name="Historia de citas"
        component={AdminBookingHistory}
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
        name="Inicio-Empleado"
        component={StaffScreen}
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
        name="Calendario de citas."
        component={StaffBookingScreen}
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
        name="Historia de citas."
        component={StaffBookingHistory}
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
        name="Calendario-Empleado"
        component={StaffCalendarScreen}
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
        name="Mi informacion"
        component={StaffInfoScreen}
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
        name="Mis empleados"
        component={AdminStaffScreen}
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
        name="Manejar empleados"
        component={AdminStaffManageScreen}
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
      <Stack.Screen name="Inicio-Sovrano" component={LoginScreen} />
    </Stack.Navigator>
  );
}
