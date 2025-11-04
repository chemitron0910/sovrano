import GradientBackground from '@/Components/GradientBackground';
import BodyBoldText from '@/Components/typography/BodyBoldText';
import BodyText from '@/Components/typography/BodyText';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { FlatList, Platform, StyleSheet, View } from 'react-native';
import { Booking, fetchAllBookings } from '../Services/bookingService';
import { auth } from '../Services/firebaseConfig';

export default function StaffBookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const stylistId = auth.currentUser?.uid;

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const data = await fetchAllBookings();
        const now = new Date();
        const filtered = data.filter(b =>
          b.stylistId === stylistId &&
          new Date(b.date) > now
        );
        setBookings(filtered);
      } catch (err) {
        console.error('Error fetching bookings:', err);
      }
    };
    if (stylistId) loadBookings();
  }, [stylistId]);

  const filteredBookings = bookings.filter(b => {
    return selectedDate ? b.date === selectedDate : true;
  });

  const uniqueDates = Array.from(
    new Set(bookings.map(b => b.date))
  ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

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

    return (
      <View style={styles.bookingItem}>
        <View style={styles.inlineText}>
          <BodyBoldText>Servicio: </BodyBoldText>
          <BodyText>{item.service}</BodyText>
        </View>
        <View style={styles.inlineText}>
          <BodyBoldText>Cliente: </BodyBoldText>
          <BodyText>{item.guestName}</BodyText>
        </View>
        <View style={styles.inlineText}>
          <BodyBoldText>Fecha/Hora: </BodyBoldText>
          <BodyText>{formattedDate} / {formattedTime}</BodyText>
        </View>
      </View>
    );
  };

  return (
    <GradientBackground>
    <View style={styles.container}>
      <BodyBoldText style={styles.title}>Mis Reservas</BodyBoldText>

      <View style={styles.filtersContainer}>
      <View style={styles.pickerWrapper}>
        <BodyBoldText style={styles.pickerLabel}>Filtrar por fecha:</BodyBoldText>
        <LinearGradient colors={['#E9E4D4', '#E0CFA2']}>
        <Picker
          selectedValue={selectedDate}
          onValueChange={(value) => setSelectedDate(value)}
          mode={Platform.OS === 'android' ? 'dropdown' : undefined}
          style={[styles.picker, { backgroundColor: '#E9E4D4' }]}
          itemStyle={Platform.OS === 'ios' ? styles.pickerItem : undefined}
        >
          <Picker.Item label="Todas" value={null} />
          {uniqueDates.map(date => {
            const formatted = new Date(date).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            });
            return (
              <Picker.Item key={date} label={formatted} value={date} />
            );
          })}
        </Picker>
        </LinearGradient>
      </View>
      </View>

      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBookingItem}
      />
    </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  filtersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
  },
  pickerWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  pickerLabel: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '600',
  },
  picker: {
  ...Platform.select({
    ios: {
      height: 150, // enough for scroll wheel
      justifyContent: 'center',
    },
    android: {
      height: 50,
      color: '#004d40',
      justifyContent: 'center',
    },
  }),
  backgroundColor: '#e0f7fa',
  borderRadius: 6,
  borderWidth: 1,
  borderColor: '#00796b',
},

  pickerItem: {
    fontSize: 16,
    color: 'black',
  },

  bookingItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  bookingText: {
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 40,
  },
  inlineText: {
    flexDirection: 'row',
    alignItems: 'center', // optional: aligns text vertically
    marginLeft: 24,
  },
});
