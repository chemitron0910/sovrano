import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StaffBookingHistory from './StaffBookingHistory';
import StaffBookingScreen from './StaffBookingScreen';
import StaffTabNav from './StaffTabNav';

const Stack = createNativeStackNavigator();

export default function StaffStack() {
  return (
    <Stack.Navigator screenOptions={{
    headerTitleAlign: 'center'}}>
      <Stack.Screen name="Inicio" component={StaffTabNav} options={{headerBackVisible: true }}/>
      <Stack.Screen name="Calendario de citas" component={StaffBookingScreen} options={{headerBackVisible: true }}/>
      <Stack.Screen name="Historia de citas" component={StaffBookingHistory} options={{headerBackVisible: true }}/>
    </Stack.Navigator>
  );
};