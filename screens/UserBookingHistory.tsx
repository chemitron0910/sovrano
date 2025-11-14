import GradientBackground from '@/Components/GradientBackground';
import BodyBoldText from '@/Components/typography/BodyBoldText';
import BodyText from '@/Components/typography/BodyText';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import Button_style2 from '../Components/Button_style2';
import { Booking, fetchAllBookings } from '../Services/bookingService';
import { auth, db } from '../Services/firebaseConfig';

export default function UserBookingHistory() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const data = await fetchAllBookings();
        const filtered = data.filter(b => b.userId === userId);
        const sorted = filtered.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setBookings(sorted);
      } catch (err) {
        console.error('Error fetching booking history:', err);
      }
    };

    if (userId) loadBookings();
  }, [userId]);

  const cancelBooking = async (booking: Booking) => {
    try {
      const bookingDate = new Date(booking.date);
      const isoDate = bookingDate.toISOString().split('T')[0];
      const selectedTime = booking.time;

      // 1️⃣ Update booking status instead of deleting
      await updateDoc(doc(db, 'bookings', booking.id), {
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
      });

      // 2️⃣ Update stylist availability
      const availabilityRef = doc(db, 'users', booking.stylistId, 'availability', isoDate);
      const availabilitySnap = await getDoc(availabilityRef);

      if (availabilitySnap.exists()) {
        const availabilityData = availabilitySnap.data();
        const updatedSlots = (availabilityData.timeSlots || []).map((slot: any) =>
          slot.time === selectedTime ? { ...slot, booked: false } : slot
        );
        await updateDoc(availabilityRef, { timeSlots: updatedSlots });
      }

      // 3️⃣ Send notification to stylist
      const stylistRef = doc(db, 'users', booking.stylistId);
      const stylistSnap = await getDoc(stylistRef);
      if (stylistSnap.exists()) {
        const stylistData = stylistSnap.data();
        if (stylistData.expoPushToken) {
          await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: stylistData.expoPushToken,
              sound: 'default',
              title: 'Cita cancelada',
              body: `${auth.currentUser?.displayName || 'Un cliente'} canceló la cita del ${isoDate} a las ${selectedTime}`,
            }),
          });
        }
      }

      Alert.alert('Cancelación exitosa', 'Tu cita ha sido cancelada.');
      setBookings(prev =>
        prev.map(b => (b.id === booking.id ? { ...b, status: 'cancelled' } : b))
      );
    } catch (error) {
      console.error('Error cancelando cita:', error);
      Alert.alert('Error', 'No se pudo cancelar la cita.');
    }
  };

  const renderBookingItem = ({ item }: { item: Booking }) => {
    const dateObj = new Date(item.date);
    const formattedDate = dateObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const formattedTime = dateObj.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const isFuture = dateObj.getTime() > Date.now();

    return (
      <View style={styles.bookingItem}>
        <View style={styles.inlineText}>
          <BodyBoldText>Servicio: </BodyBoldText>
          <BodyText>{item.service}</BodyText>
        </View>
        <View style={styles.inlineText}>
          <BodyBoldText>Estilista: </BodyBoldText>
          <BodyText>{item.stylistName}</BodyText>
        </View>
        <View style={styles.inlineText}>
          <BodyBoldText>Fecha/Hora: </BodyBoldText>
          <BodyText>{formattedDate} / {formattedTime}</BodyText>
        </View>
        <View style={styles.inlineText}>
          <BodyBoldText>Estado: </BodyBoldText>
          <BodyText>{item.status || 'active'}</BodyText>
        </View>
        {isFuture && item.status !== 'cancelled' && (
          <Button_style2
        title="Cancelar cita"
            onPress={() =>
              Alert.alert(
                'Confirmar cancelación',
                '¿Seguro que deseas cancelar esta cita?',
                [
                  { text: 'No', style: 'cancel' },
                  { text: 'Sí', onPress: () => cancelBooking(item) },
                ]
              )
            }
          />
        )}
      </View>
    );
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBookingItem}
          ListEmptyComponent={<Text style={styles.empty}>No hay reservas.</Text>}
        />
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  bookingItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  empty: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
  },
  inlineText: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 24,
  },
});
