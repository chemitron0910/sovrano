import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AboutScreen() {

  const windowDimensions = useWindowDimensions();
  const windowWidth = windowDimensions.width;
  const windowHeight = windowDimensions.height;
  
  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <View style={{width: windowWidth > 500 ? "70%" : "90%", height: windowHeight > 600 ? "60%" : "90%"}}>
          <Text style={{fontSize: windowWidth > 500 ? 50 : 24}}>Acerca de Sovrano</Text>
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