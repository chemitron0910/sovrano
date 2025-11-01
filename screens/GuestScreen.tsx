import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Platform, StatusBar, StyleSheet, View, useWindowDimensions } from "react-native";
import Button_style2 from "../Components/Button_style2";
import { logout } from '../Services/authService';
import { RootStackParamList } from '../src/types';

export default function GuestScreen() {

  type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
  const navigation = useNavigation<NavigationProp>();
  const windowDimensions = useWindowDimensions();
  const windowWidth = windowDimensions.width;
  const windowHeight = windowDimensions.height;

  return (

      <LinearGradient
        colors={['#fffbe6', '#f5e1c0']} // cream to champagne gold
        style={{ flex: 1 }}
      >

        <View style={styles.logoContainer}>
          <Image            
            source={require('../assets/images/Logo.png')}
            style={styles.logo}
            resizeMode="contain"
        />
        </View>
        <View style={styles.container}>

            <Button_style2 
                title="Nuestros servicios" 
                onPress={()=>navigation.navigate("Nuestros servicios")}>
            </Button_style2>

            <Button_style2 
                title="Agenda tu cita" 
                onPress={()=>navigation.navigate("Agenda tu cita")}>
            </Button_style2>

            <Button_style2
                title="Registrarse"
                onPress={() => navigation.navigate('Registrarse')}
            />
            <Button_style2 title="Salir" onPress={async () => {
              await logout();
              navigation.reset({
              index: 0,
              routes: [{ name: 'Inicio-Sovrano' }],
              });
              }}>
            </Button_style2>

        </View>
        </LinearGradient>
  );
}

const styles = StyleSheet.create({
  
  container: {
  flex: 1,
  backgroundColor: 'transparent',
  paddingTop: StatusBar.currentHeight || 0,
  justifyContent: 'flex-start',      // ✅ vertical centering
  alignItems: 'center',          // ✅ horizontal centering
  alignSelf: 'center',              // ✅ ensures horizontal centering
  flexDirection: 'column',
  gap: 16,                          // ✅ slightly more spacing between buttons
},
  text: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 50,
    paddingBottom: 20,
  },
  
  logo: {
    width: 100,
    height: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
