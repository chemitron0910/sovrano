import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminRoleManager from "./AdminRoleManager";

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{
    headerTitleAlign: 'center'}}>
      <Stack.Screen name="Assignar responsabilidad" component={AdminRoleManager} options={{headerBackVisible: true }}/>
    </Stack.Navigator>
  );
};