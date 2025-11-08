import GradientBackground from '@/Components/GradientBackground';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Button_style2 from "../Components/Button_style2";
import Logo from '../Components/Logo';
import { logout } from '../Services/authService';
import { auth } from '../Services/firebaseConfig';
import { RootStackParamList } from '../src/types';

export default function AdminScreen() {

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
    <GradientBackground>
    <Logo/>
      <View style={styles.container}>
        <View style={{
            flexDirection: 'column', 
            gap: 10
            } }>
          <Text style={styles.welcomeText}>
            {`${greeting}, ${username || 'invitado'} 👋`}
          </Text>
          <Text style={styles.welcomeText}>
            {`¡Nos alegra verte en Sovrano!`}
          </Text>

          <Button_style2 title="Assignar responsabilidad" onPress={()=>navigation.navigate("Assignar responsabilidad")}
          ></Button_style2>

          <Button_style2 title="Manejar servicios" onPress={()=>navigation.navigate("Manejar servicios")}
          ></Button_style2>

          <Button_style2 title="Calendario de citas" onPress={()=>navigation.navigate("Calendario de citas")}>
          </Button_style2>

          <Button_style2 title="Historia de citas" onPress={()=>navigation.navigate("Historia de citas")}>
          </Button_style2>

          <Button_style2 title="Inicio empleado" onPress={()=>navigation.navigate("Inicio-Empleado")}>
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
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  welcomeText: {
    fontFamily: 'Playfair-Bold', // ✅ Your custom font
    fontSize: 18,
    color: '#3e3e3e', // Optional: match Sovrano’s palette
    textAlign: 'center',
    marginBottom: 16,
  },
});