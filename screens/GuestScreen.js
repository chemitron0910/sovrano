import { StyleSheet, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Button_style2 from "../Components/Button_style2";

export default function GuestScreen({navigation}) {

  const windowDimensions = useWindowDimensions();
  const windowWidth = windowDimensions.width;
  const windowHeight = windowDimensions.height;

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <View style={{
            width: windowWidth > 500 ? "70%" : "90%", 
            height: windowHeight > 600 ? "60%" : "90%",
            flexDirection: 'column', 
            gap: 10
            } }>
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
