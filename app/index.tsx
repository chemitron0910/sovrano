import * as Font from 'expo-font';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import LoginStack from '../screens/LoginStack';

export default function Index() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
  async function loadFonts() {
    try {
      await Font.loadAsync({
        'Playfair-Regular': require('../assets/fonts/PlayfairDisplay-Regular.ttf'),
        'Playfair-Bold': require('../assets/fonts/PlayfairDisplay-Bold.ttf'),
        'Playfair-Italic': require('../assets/fonts/PlayfairDisplay-Italic.ttf'),
      });
      setFontsLoaded(true);
    } catch (error) {
    }
  }

  loadFonts();
  }, []);


  if (!fontsLoaded) {
  return (
    <View style={styles.activityContainer}>
      <ActivityIndicator size="large" />
      <Text style={styles.loadingText}>Cargando tipografía elegante…</Text>
    </View>
  );
  }

  return (
     <LoginStack />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'green',
    paddingTop: Platform.OS === 'android' ? 25 : 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContainer: {
    flex: 1,
    backgroundColor: 'blue',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: 'black',
  },
});
