import { Platform, StyleSheet, View } from 'react-native';
import LoginStack from '../screens/LoginStack';

export default function Index() { 
  return ( 
  
  <View style={styles.container}> 
  <LoginStack /> 
  </View> ); } 
  
  const styles = StyleSheet.create({ 
    container: 
    { flex: 1, backgroundColor: 'white', paddingTop: Platform.OS === 'android' ? 25 : 0, }, 
  });
