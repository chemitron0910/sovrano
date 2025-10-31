import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from "../screens/LoginScreen";
import AdminBookingHistory from './AdminBookingHistory';
import AdminBookingScreen from './AdminBookingScreen';
import AdminServicesScreen from "./AdminServicesScreen";
import AdminTabNav from './AdminTabNav';
import RoleAssignmentScreen from "./RoleAssignmentScreen";

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{
    headerTitleAlign: 'center'}}>
      <Stack.Screen name="Inicio-Admin" component={AdminTabNav} options={{headerBackVisible: false }}/>
      <Stack.Screen name="Assignar responsabilidad" component={RoleAssignmentScreen} options={{headerBackVisible: false }}/>
      <Stack.Screen name="Manejar servicios" component={AdminServicesScreen} options={{headerBackVisible: true }}/>
      <Stack.Screen name="Calendario de citas" component={AdminBookingScreen} options={{headerBackVisible: true }}/>
      <Stack.Screen name="Historia de citas" component={AdminBookingHistory} options={{headerBackVisible: true }}/>
      <Stack.Screen name="Inicio-Sovrano" component={LoginScreen}/>
    </Stack.Navigator>
  );
};