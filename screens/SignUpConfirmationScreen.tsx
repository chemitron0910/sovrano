import { RouteProp, useRoute } from '@react-navigation/native';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type RouteParams = {
  SignUpConfirmation: {
    username: string;
    email: string;
    userId: string;
  };
};

export default function SignUpConfirmationScreen() {

    const windowDimensions = useWindowDimensions();
    const windowWidth = windowDimensions.width;
    const windowHeight = windowDimensions.height;

    const route = useRoute<RouteProp<RouteParams, 'SignUpConfirmation'>>(); //SignUpConfirmation from RouteParams
    const { username, email, userId } = route.params;

    return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <View style={{
            width: windowWidth > 500 ? "70%" : "90%", 
            height: windowHeight > 600 ? "60%" : "90%",
            flexDirection: 'column', 
            gap: 10
            } }>
            <Text style={styles.title}>Gracias por registrarte 🎉</Text>
            <Text style={styles.title}>Por favor usa el enlace enviado a tu correo electronico para verificacion de tu cuenta</Text>
            <Text style={styles.label}>Nombre: <Text style={styles.value}>{username}</Text></Text>
            <Text style={styles.label}>Correo electronico: <Text style={styles.value}>{email}</Text></Text>
            <Text style={styles.label}>Usuario ID: <Text style={styles.value}>{userId}</Text></Text>
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
});
