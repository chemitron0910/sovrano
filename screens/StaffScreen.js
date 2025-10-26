import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Button_style2 from "../Components/Button_style2";
import { auth } from '../Services/firebaseConfig';

export default function StaffScreen({navigation}) {

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
          <Button_style2 title="Assignar responsabilidad" onPress={()=>navigation.navigate("Assignar responsabilidad")}
            gradientColors={['#00c6ff', '#0072ff']}
            textColor="#fff"
          ></Button_style2>

          <Button_style2 title="Calendario de agendas" onPress={()=>navigation.navigate("Calendario de agendas")}
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
  welcomeText: {
  fontSize: 22,
  fontWeight: '600',
  textAlign: 'center',
  marginBottom: 20,
  color: '#333',
}
});