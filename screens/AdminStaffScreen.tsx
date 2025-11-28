import GradientBackground from '@/Components/GradientBackground';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet,
  View
} from 'react-native';
import Button_style2 from "../Components/Button_style2";
import { RootStackParamList } from '../src/types';

export default function AdminStaffScreen(){

  type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
  const navigation = useNavigation<NavigationProp>(); 
  return (
    
    <GradientBackground>
        

        <KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={{ flex: 1 }}
  keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0} // adjust as needed
>
    <ScrollView 
      style={{ flex: 1 }}
      contentContainerStyle={styles.scrollContent}>

        <View style={styles.container}>
                <View style={{
                  flexDirection: 'column',
                  gap: 10,
                  marginTop: 20,
                }}>
        
    <Button_style2 title="Calendario de citas" onPress={() => navigation.navigate("Calendario de citas")} />
    <Button_style2 title="Historia de citas" onPress={() => navigation.navigate("Historia de citas")} />

</View>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({  
  container: {
    alignItems: "center",
  },
  welcomeText: {
    fontFamily: 'Playfair-Bold',
    fontSize: 18,
    color: '#3e3e3e',
    textAlign: 'center',
    marginBottom: 16,
  },
  scrollContent: {
  justifyContent: 'flex-start',
  paddingBottom: 40,
  alignItems: 'center',
  },
});