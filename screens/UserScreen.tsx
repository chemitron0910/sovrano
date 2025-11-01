import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Button_style2 from "../Components/Button_style2";
import { logout } from '../Services/authService';
import { auth } from '../Services/firebaseConfig';
import { RootStackParamList } from '../src/types';

export default function UserScreen() {

  type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
  const navigation = useNavigation<NavigationProp>();
  const windowDimensions = useWindowDimensions();
  const windowWidth = windowDimensions.width;
  const windowHeight = windowDimensions.height;
  const username = auth.currentUser?.displayName;
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Buenos días' : 'Buenas tardes';

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <View style={{
            width: windowWidth > 500 ? "70%" : "90%", 
            height: windowHeight > 600 ? "60%" : "90%",
            flexDirection: 'column', 
            gap: 10
            } }>
          <Text style={styles.welcomeText}>
            {`${greeting}, ${username || 'invitado'} 👋 ¡Nos alegra verte en Sovrano!`}
          </Text>
          <Button_style2 title="Ir a servicios" onPress={()=>navigation.navigate("Nuestros servicios.")}
          ></Button_style2>

          <Button_style2 title="Agenda tu cita" onPress={()=>navigation.navigate("Agenda tu cita.")}>
          </Button_style2>

          <Button_style2 title="Historia de citas" onPress={()=>navigation.navigate(".Historia de citas.")}>
          </Button_style2>

          <Button_style2 title="Salir" onPress={async () => {
            await logout();
            navigation.reset({
            index: 0,
            routes: [{ name: 'Inicio-Sovrano' }],
            });
            }}>
          </Button_style2>
        </View>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  welcomeText: {
  fontSize: 22,
  fontWeight: '600',
  textAlign: 'center',
  marginBottom: 20,
  color: '#333',
}
});