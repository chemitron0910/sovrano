import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Platform, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type RouteParams = {
  SignUpConfirmation: {
    username: string;
    email: string;
    userId: string;
  };
  Inicio: undefined;
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
    <SafeAreaView style={styles.safeContainer}
    edges={Platform.OS === 'ios' ? ['left', 'right', 'bottom'] : undefined}>
      <View style={styles.container}>
        <View style={{
            width: windowWidth > 500 ? "70%" : "90%",
            flexDirection: 'column', 
            gap: 10
            } }>
            <Text style={styles.title}>Gracias por registrarte 🎉</Text>
            <Text style={styles.title}>Por favor usa el enlace enviado a tu correo electronico para verificacion de tu cuenta</Text>
            <Text style={styles.title}>Mira tu folder de correo no deseado si no lo encuentras</Text>
            <Text style={styles.label}>Nombre: <Text style={styles.value}>{username}</Text></Text>
            <Text style={styles.label}>Correo electronico: <Text style={styles.value}>{email}</Text></Text>
            <Text style={styles.label}>Usuario ID: <Text style={styles.value}>{userId}</Text></Text>

            <TouchableOpacity onPress={()=>navigation.navigate("Inicio")} style={styles.button}>
              <Text style={styles.buttonText}>Vuelve al inicio</Text>
            </TouchableOpacity>
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
        padding: 24,
        justifyContent: 'center',
        backgroundColor: '#fff',
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
});
