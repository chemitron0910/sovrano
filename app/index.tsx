import * as Font from 'expo-font';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import LoginStack from '../screens/LoginStack';

export default function Index() {

  Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
  const subscription = Notifications.addNotificationReceivedListener(notification => {
  });

  return () => subscription.remove();
}, []);

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

  useEffect(() => {
  const subscription = Notifications.addNotificationReceivedListener(notification => {
    // Optionally show an alert or update UI
  });

  return () => subscription.remove();
}, []);

useEffect(() => {
  Notifications.getExpoPushTokenAsync().then(token => {
  });
}, []);

useEffect(() => {
  const subscription = Notifications.addNotificationReceivedListener(notification => {
  });

  return () => subscription.remove();
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
