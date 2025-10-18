import React, { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Button_style2 from "../Components/Button_style2";
import { signInAsGuest } from '../Services/authService';

export default function HomeScreen({navigation}) {

  const windowDimensions = useWindowDimensions();
  const windowWidth = windowDimensions.width;
  const windowHeight = windowDimensions.height;

  useEffect(() => {
  signInAsGuest(); // Automatically sign in when guest starts booking
  }, []);

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <View style={{
            width: windowWidth > 500 ? "70%" : "90%", 
            height: windowHeight > 600 ? "60%" : "90%",
            flexDirection: 'column', 
            gap: 10
            } }>
          <Button_style2 title="Ir a servicios" onPress={()=>navigation.navigate("Nuestros servicios")}
            gradientColors={['#00c6ff', '#0072ff']}
            textColor="#fff"
          ></Button_style2>

          <Button_style2 title="Ingresa como invitado" onPress={()=>navigation.navigate("Invitado")}
            gradientColors={['#00c6ff', '#0072ff']}
            textColor="#fff">
          </Button_style2>

          <Button_style2 title="Ingresa como usuario" onPress={()=>navigation.navigate("Usuario registrado")}
            gradientColors={['#00c6ff', '#0072ff']}
            textColor="#fff">
          </Button_style2>

          <Button_style2 title="Agenda tu cita" onPress={()=>navigation.navigate("Agenda tu cita")}
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