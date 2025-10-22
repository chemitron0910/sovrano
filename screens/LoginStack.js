import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminStack from "../screens/AdminStack";
import GuestStack from "../screens/GuestStack";
import LoginScreen from "../screens/LoginScreen";
import UserStack from "../screens/UserStack";

const Stack = createNativeStackNavigator();

export default function LoginStack() {
  return (
    <Stack.Navigator screenOptions={{
    headerTitleAlign: 'center'}}>
      <Stack.Screen name="Ventana de entrada" component={LoginScreen}/>
      <Stack.Screen name="Ingresa como invitado" component={GuestStack}/>
      <Stack.Screen name="Ingresa como usuario" component={UserStack}/>
      <Stack.Screen name="Ingresa como administrador" component={AdminStack}/>
    </Stack.Navigator>
  );
};