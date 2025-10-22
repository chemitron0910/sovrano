import { RouteProp, useRoute } from '@react-navigation/native';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type RouteParams = {
  BookingConfirmation: {
    service: string;
    date: string;
    time: string;
    guestName: string;
    bookingId: string;
  };
};

export default function BookingConfirmationScreen() {

    const windowDimensions = useWindowDimensions();
    const windowWidth = windowDimensions.width;
    const windowHeight = windowDimensions.height;

    const route = useRoute<RouteProp<RouteParams, 'BookingConfirmation'>>();
    const { service, date, time, guestName, bookingId } = route.params;

    return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <View style={{
            width: windowWidth > 500 ? "70%" : "90%", 
            height: windowHeight > 600 ? "60%" : "90%",
            flexDirection: 'column', 
            gap: 10
            } }>
            <Text style={styles.title}>Gracias por agendar tu cita 🎉</Text>
            <Text style={styles.label}>Nombre: <Text style={styles.value}>{guestName}</Text></Text>
            <Text style={styles.label}>Servicio: <Text style={styles.value}>{service}</Text></Text>
            <Text style={styles.label}>Fecha: <Text style={styles.value}>{date}</Text></Text>
            <Text style={styles.label}>Hora: <Text style={styles.value}>{time}</Text></Text>
            <Text style={styles.label}>Cita ID: <Text style={styles.value}>{bookingId}</Text></Text>
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
