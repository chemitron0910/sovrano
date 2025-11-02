import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Button_style2 from "../Components/Button_style2";
import Logo from '../Components/Logo';
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
    
      <LinearGradient
          colors={['#fffbe6', '#f5e1c0']} // cream to champagne gold
          style={{ flex: 1 }}
        >
            <Logo/>
            <View style={styles.container}>
          <Text style={styles.welcomeText}>
            {`${greeting}, ${username || 'invitado'} 👋 ¡Nos alegra verte en Sovrano!`}
          </Text>
          <View style={{ padding: 10 }}>
          <Button_style2 title="Ir a servicios" onPress={()=>navigation.navigate("Nuestros servicios.")}
          ></Button_style2>
          </View>

          <View style={{ padding: 10 }}>
          <Button_style2 title="Agenda tu cita" onPress={()=>navigation.navigate("Agenda tu cita.")}>
          </Button_style2>
          </View>

          <View style={{ padding: 10 }}>
          <Button_style2 title="Historia de citas" onPress={()=>navigation.navigate(".Historia de citas.")}>
          </Button_style2>
          </View>

          <View style={{ padding: 10 }}>
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
      </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: 'transparent',
      alignContent: 'center', 
      padding:10,
      paddingTop: StatusBar.currentHeight || 50,
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