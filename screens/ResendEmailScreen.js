import { sendEmailVerification } from 'firebase/auth';
import { Alert, StyleSheet, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Button_style2 from "../Components/Button_style2";
import { auth } from '../Services/firebaseConfig';

export default function ResendEmailScreen() {

  const windowDimensions = useWindowDimensions();
  const windowWidth = windowDimensions.width;
  const windowHeight = windowDimensions.height;

  const handleResendVerification = async () => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        Alert.alert('Correo enviado', 'Revisa tu bandeja de entrada y tu folder the spam (Correo no deseado).');
      } else {
        Alert.alert('Error', 'No hay usuario autenticado.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar el correo de verificación.');
    }
  };
  
  return (
    
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <View style={{width: windowWidth > 500 ? "70%" : "90%", height: windowHeight > 600 ? "60%" : "90%"}}>
           <Button_style2 title="Re-enviar verificacion de correo electronico" onPress={handleResendVerification}
              gradientColors={['#00c6ff', '#0072ff']}
              textColor="#fff">
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
    justifyContent: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
});