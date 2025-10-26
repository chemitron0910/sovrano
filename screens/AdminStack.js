import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminBookingsScreen from './AdminBookingScreen';
import AdminScreen from './AdminScreen';
import RoleAssignmentScreen from "./RoleAssignmentScreen";

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{
    headerTitleAlign: 'center'}}>
      <Stack.Screen name="Inicio administrador" component={AdminScreen} options={{headerBackVisible: true }}/>
      <Stack.Screen name="Assignar responsabilidad" component={RoleAssignmentScreen} options={{headerBackVisible: false }}/>
      <Stack.Screen name="Calendario de agendas" component={AdminBookingsScreen} options={{headerBackVisible: true }}/>
    </Stack.Navigator>
  );
};