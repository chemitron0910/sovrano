import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, StatusBar, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Button_style2 from '../Components/Button_style2';
import Logo from '../Components/Logo';

type RouteParams = {
  SignUpConfirmation: {
    username: string;
    email: string;
    userId: string;
  };
  Inicio: undefined;
  'Inicio-Invitado': undefined;
};

type SignUpConfirmationScreenNavigationProp = NativeStackNavigationProp<
  RouteParams,
  'SignUpConfirmation'
>;

type SignUpConfirmationScreenRouteProp = RouteProp<
  RouteParams,
  'SignUpConfirmation'
>;

type Props = {
  navigation: SignUpConfirmationScreenNavigationProp;
  route: SignUpConfirmationScreenRouteProp;
};

export default function SignUpConfirmationScreen({ navigation, route }: Props) {

    const windowDimensions = useWindowDimensions();
    const windowWidth = windowDimensions.width;
    const windowHeight = windowDimensions.height;

    const { username, email, userId } = route.params;

    return (
      <View style={styles.container}>
      
      <LinearGradient
          colors={['#fffbe6', '#f5e1c0']} // cream to champagne gold
          style={[{ flex: 1, padding:10}]}>
            <View style={{ paddingHorizontal: 24 }}>
            <Logo/>
            <Text style={styles.title}>Gracias por registrarte 🎉</Text>
            <Text style={styles.title}>Por favor usa el enlace enviado a tu correo electronico para verificacion de tu cuenta</Text>
            <Text style={styles.title}>Mira tu folder de correo no deseado si no lo encuentras</Text>
            <Text style={styles.label}>Nombre: <Text style={styles.value}>{username}</Text></Text>
            <Text style={styles.label}>Correo electronico: <Text style={styles.value}>{email}</Text></Text>
            <Text style={styles.label}>Usuario ID: <Text style={styles.value}>{userId}</Text></Text>

            <View style={{ padding: 24 }}>
            <Button_style2
              title="Vuelve al inicio"
              onPress={()=>navigation.navigate("Inicio-Invitado")}/>
            </View>
            </View>
      </LinearGradient>
    </View>
  );

}

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: "white",
     },
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'red',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
    },
    label: {
        fontSize: 18,
        marginBottom: 12,
    },
    value: {
        fontWeight: '600',
    },
    button: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 30,
    marginTop: 30,
    alignItems: 'center',
  },
    buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
    logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
});
