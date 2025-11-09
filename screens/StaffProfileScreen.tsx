import GradientBackground from '@/Components/GradientBackground';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import Button_style2 from '../Components/Button_style2';
import { RootStackParamList } from '../src/types';

export default function StaffProfileScreen(){
  type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
  const navigation = useNavigation<NavigationProp>();
    
return (
  <GradientBackground>
      <View style={styles.container}>

        <Button_style2 title="Manejo de horario" onPress={() => navigation.navigate('Calendario-Empleado')} />
        <Button_style2 title="Mi informacion" onPress={() => navigation.navigate('Mi informacion')} />

      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20, 
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});