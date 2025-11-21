import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../src/types';

import StaffCalendarScreen from './StaffCalendarScreen';
import StaffInfoScreen from './StaffInfoScreen';
import StaffProfileScreen from './StaffProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function StaffProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTitleAlign: 'center' }}>
      <Stack.Screen
        name="Perfil-Empleado"
        component={StaffProfileScreen}
        options={{
          headerBackVisible: false,
          headerTitleStyle: {
            fontFamily: 'Playfair-Bold',
            fontSize: 22,
            fontWeight: '400',
          },
          headerStyle: {
            backgroundColor: '#E9E4D4',
          },
        }}
      />
      <Stack.Screen
        name="Calendario-Empleado"
        component={StaffCalendarScreen}
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
        name="Mi informacion"
        component={StaffInfoScreen}
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
