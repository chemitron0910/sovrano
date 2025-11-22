import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../src/types';
import StaffBookingHistory from './StaffBookingHistory';
import StaffBookingScreen from './StaffBookingScreen';
import StaffTabNav from './StaffTabNav';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function StaffStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTitleAlign: 'center' }}>
      <Stack.Screen
        name="Inicio-Empleado"
        component={StaffTabNav}
        options={{
          headerBackVisible: false,
          headerTitleStyle: {
            fontFamily: 'Playfair-Bold',
            fontSize: 22,
            fontWeight: '400',
            color: '#3e3e3e',
          },
        }}
      />
      <Stack.Screen
        name="Calendario de citas."
        component={StaffBookingScreen}
        options={{
          headerBackVisible: true,
          headerTitleStyle: {
            fontFamily: 'Playfair-Bold',
            fontSize: 22,
            fontWeight: '400',
            color: '#3e3e3e',
          },
        }}
      />
      <Stack.Screen
        name="Historia de citas."
        component={StaffBookingHistory}
        options={{
          headerBackVisible: true,
          headerTitleStyle: {
            fontFamily: 'Playfair-Bold',
            fontSize: 22,
            fontWeight: '400',
            color: '#3e3e3e',
          },
        }}
      />
    </Stack.Navigator>
  );
}
