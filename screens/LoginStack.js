import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminStack from "../screens/AdminStack";
import LoginScreen from "../screens/LoginScreen";
import ResendEmailScreen from "../screens/ResendEmailScreen";
import StaffStack from "../screens/StaffStack";
import UserStack from "../screens/UserStack";
import SignUpConfirmationScreen from './SignUpConfirmationScreen';
import SignUpScreen from './SignUpScreen';

const Stack = createNativeStackNavigator();

export default function LoginStack() {
  return (
    <Stack.Navigator screenOptions={{
    headerTitleAlign: 'center'}}>
      <Stack.Screen name="Inicio" component={LoginScreen}/>
      <Stack.Screen name="Registrarse" component={SignUpScreen} options={{headerBackVisible: false }}/>
      <Stack.Screen name="Registro exitoso" component={SignUpConfirmationScreen} options={{headerBackVisible: false }}/>
      <Stack.Screen name="Usuario" component={UserStack} options={{headerBackVisible: false }}/>
      <Stack.Screen name="Empleado" component={StaffStack} options={{headerBackVisible: false }}/>
      <Stack.Screen name="Administrador" component={AdminStack} options={{headerBackVisible: false }}/>
      <Stack.Screen name="Re-enviar correo electronico" component={ResendEmailScreen}/>
    </Stack.Navigator>
  );
};