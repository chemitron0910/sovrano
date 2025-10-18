import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfileScreen = () => {

  const windowDimensions = useWindowDimensions();
  const windowWidth = windowDimensions.width;
  const windowHeight = windowDimensions.height;
  
  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <View style={{width: windowWidth > 500 ? "70%" : "90%", height: windowHeight > 600 ? "60%" : "90%"}}>
          <Text style={styles.text}>Ventana del perfil</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default ProfileScreen;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',   
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});