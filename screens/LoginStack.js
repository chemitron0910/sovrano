import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminStack from "../screens/AdminStack";
import GuestStack from "../screens/GuestStack";
import LoginScreen from "../screens/LoginScreen";
import ResendEmailScreen from "../screens/ResendEmailScreen";
import StaffStack from "../screens/StaffStack";
import UserStack from "../screens/UserStack";

const Stack = createNativeStackNavigator();

export default function LoginStack() {
  return (
    <Stack.Navigator screenOptions={{
    headerTitleAlign: 'center'}}>
      <Stack.Screen name="Inicio" component={LoginScreen}/>
      <Stack.Screen name="Usuario" component={UserStack} options={{headerBackVisible: false }}/>
      <Stack.Screen name="Empleado" component={StaffStack} options={{headerBackVisible: false }}/>
      <Stack.Screen name="Administrador" component={AdminStack} options={{headerBackVisible: false }}/>
      <Stack.Screen name="Invitado" component={GuestStack} options={{headerBackVisible: false }}/>
      <Stack.Screen name="Re-enviar correo electronico" component={ResendEmailScreen}/>
    </Stack.Navigator>
  );
};