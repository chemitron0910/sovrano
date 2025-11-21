import GradientBackground from '@/Components/GradientBackground';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar, StyleSheet, View, useWindowDimensions } from "react-native";
import Button_style2 from "../Components/Button_style2";
import Logo from '../Components/Logo';
import { logout } from '../Services/authService';
import { RootStackParamList } from '../src/types';

export default function GuestScreen() {

  type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
  const navigation = useNavigation<NavigationProp>();
  const windowDimensions = useWindowDimensions();
  const windowWidth = windowDimensions.width;
  const windowHeight = windowDimensions.height;

  return (
    <GradientBackground>
      <View style={styles.container}>
        <Logo/>

        <Button_style2 
          title="Nuestros servicios" 
          onPress={() => navigation.navigate("Nuestros servicios", { role: "guest" })}
        />

        {/* 👇 Pass role explicitly when navigating */}
        <Button_style2 
          title="Agenda tu cita" 
          onPress={() => navigation.navigate("Agenda tu cita", { role: "guest" })}
        />

        <Button_style2
          title="Registrarse"
          onPress={() => navigation.navigate('Registrarse')}
        />

        <Button_style2 
          title="Salir" 
          onPress={async () => {
            await logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Inicio-Sovrano' }],
            });
          }}
        />
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: StatusBar.currentHeight || 50,
    justifyContent: 'flex-start',
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'column',
    gap: 16,
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
});
