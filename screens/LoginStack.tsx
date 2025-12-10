import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminStack from "../screens/AdminStack";
import GuestStack from "../screens/GuestStack";
import LoginScreen from "../screens/LoginScreen";
import PoliciesScreen from "../screens/PoliciesScreen";
import ResendEmailScreen from "../screens/ResendEmailScreen";
import StaffStack from "../screens/StaffStack";
import UserStack from "../screens/UserStack";
import { RootStackParamList } from '../src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function LoginStack() {
  return (
    <Stack.Navigator screenOptions={{
      headerTitleAlign: 'center'}}>
      <Stack.Screen name="Inicio-Sovrano" component={LoginScreen} options={{ title: '', headerBackVisible: false, }}/>
      <Stack.Screen name="Usuario" component={UserStack} options={{headerBackVisible: false }}/>
      <Stack.Screen
        name="Empleado"
        component={StaffStack}
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
      <Stack.Screen name="Administrador" component={AdminStack} options={{headerBackVisible: false }}/>
      <Stack.Screen name="Inicio-Invitado" component={GuestStack} options={{headerBackVisible: false, title: '' }}/>
      <Stack.Screen name="Re-enviar correo electronico" component={ResendEmailScreen}/>
      <Stack.Screen name="Nuestras politicas" component={PoliciesScreen}/>
    </Stack.Navigator>
  );
};