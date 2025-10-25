import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RoleAssignmentScreen from "./RoleAssignmentScreen";

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{
    headerTitleAlign: 'center'}}>
      <Stack.Screen name="Assignar responsabilidad" component={RoleAssignmentScreen} options={{headerBackVisible: false }}/>
    </Stack.Navigator>
  );
};