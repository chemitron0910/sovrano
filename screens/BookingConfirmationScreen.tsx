import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../src/types';

type BookingConfirmationScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Cita confirmada' | 'Cita confirmada.'
>;

type BookingConfirmationScreenRouteProp = RouteProp<
  RootStackParamList,
  'Cita confirmada' | 'Cita confirmada.'
>;

type Props = {
  navigation: BookingConfirmationScreenNavigationProp;
  route: BookingConfirmationScreenRouteProp;
};

export default function BookingConfirmationScreen({ navigation, route }: Props) {

    const windowDimensions = useWindowDimensions();
    const windowWidth = windowDimensions.width;
    const windowHeight = windowDimensions.height;

    const { service, date, time, stylistName, bookingId } = route.params;

    return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <View style={{
            width: windowWidth > 500 ? "70%" : "90%",
            flexDirection: 'column', 
            gap: 10
            } }>
            <Text style={styles.title}>Gracias por agendar tu cita 🎉</Text>
            <Text style={styles.label}>Estilista: <Text style={styles.value}>{stylistName}</Text></Text>
            <Text style={styles.label}>Servicio: <Text style={styles.value}>{service}</Text></Text>
            <Text style={styles.label}>Fecha: <Text style={styles.value}>{date}</Text></Text>
            <Text style={styles.label}>Hora: <Text style={styles.value}>{time}</Text></Text>
            <Text style={styles.label}>Cita ID: <Text style={styles.value}>{bookingId}</Text></Text>

            <TouchableOpacity
  onPress={() => {
    if (route.params.role === 'Usuario') {
      navigation.navigate('Inicio-Usuario');
    } else {
      navigation.navigate('Inicio-Invitado');
    }
  }}
  style={styles.button}
>
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
