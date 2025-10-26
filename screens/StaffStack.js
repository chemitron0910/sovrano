import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminBookingsScreen from './AdminBookingScreen';
import StaffScreen from './StaffScreen';

const Stack = createNativeStackNavigator();

export default function StaffStack() {
  return (
    <Stack.Navigator screenOptions={{
    headerTitleAlign: 'center'}}>
      <Stack.Screen name="Inicio" component={StaffScreen} options={{headerBackVisible: true }}/>
      <Stack.Screen name="Calendario de agendas" component={AdminBookingsScreen} options={{headerBackVisible: true }}/>
    </Stack.Navigator>
  );
};