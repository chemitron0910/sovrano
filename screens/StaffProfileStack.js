import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StaffCalendarScreen from './StaffCalendarScreen';
import StaffProfileScreen from './StaffProfileScreen';

const Stack = createNativeStackNavigator();

export default function StaffProfileStack() {
  return (
    <Stack.Navigator screenOptions={{
    headerTitleAlign: 'center'}}>
      <Stack.Screen
        name="Perfil-Empleado"
        component={StaffProfileScreen}
        options={{
        headerBackVisible: false,
        headerTitleStyle: {
        fontFamily: 'Playfair-Bold', // ✅ Your custom font
        fontSize: 22,
        fontWeight: '400',
        headerStyle: {
        backgroundColor: '#E9E4D4', // ✅ sets the header background
      },
        },
        }}
      />
      <Stack.Screen
        name="Calendario-Empleado"
        component={StaffCalendarScreen}
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
    </Stack.Navigator>
  );
};