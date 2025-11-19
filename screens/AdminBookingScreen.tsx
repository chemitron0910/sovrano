import GradientBackground from '@/Components/GradientBackground';
import BodyBoldText from '@/Components/typography/BodyBoldText';
import BodyText from '@/Components/typography/BodyText';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Booking, fetchAllBookings } from '../Services/bookingService';

// Normalize any date string into YYYY-MM-DD
function normalizeDateString(dateStr: string): string {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateWithWeekday(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function AdminBookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedStylist, setSelectedStylist] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        const data = await fetchAllBookings();
        setBookings(data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };
    loadBookings();
  }, []);

  const today = normalizeDateString(new Date().toISOString());

  // Group bookings by normalized date
  const groupedByDate: Record<string, Booking[]> = {};
  bookings.forEach(b => {
    const dateKey = normalizeDateString(b.date);
    if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
    groupedByDate[dateKey].push(b);
  });

  const sortedDates = Object.keys(groupedByDate).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  if (loading) {
    return (
      <GradientBackground>
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#00796b" />
          <Text style={styles.loadingText}>Cargando reservas...</Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <ScrollView>
      <View style={styles.container}>
        <BodyBoldText style={styles.title}>Reservas</BodyBoldText>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <View style={styles.pickerWrapper}>
            <BodyBoldText style={styles.pickerLabel}>Estilista:</BodyBoldText>
            <LinearGradient colors={['#E9E4D4', '#E0CFA2']}>
              <Picker
                selectedValue={selectedStylist}
                onValueChange={(value) => setSelectedStylist(value)}
                mode={Platform.OS === 'android' ? 'dropdown' : undefined}
                style={styles.picker}
                itemStyle={Platform.OS === 'ios' ? styles.pickerItem : undefined}
              >
                <Picker.Item label="Todos" value={null} />
                {Array.from(new Set(bookings.map(b => b.stylistName))).map(name => (
                  <Picker.Item key={name} label={name} value={name} />
                ))}
              </Picker>
            </LinearGradient>
          </View>

          <View style={styles.pickerWrapper}>
            <BodyBoldText style={styles.pickerLabel}>Fecha:</BodyBoldText>
            <Picker
              selectedValue={selectedDate}
              onValueChange={(value) => setSelectedDate(value)}
              mode={Platform.OS === 'android' ? 'dropdown' : undefined}
              style={styles.picker}
              itemStyle={Platform.OS === 'ios' ? styles.pickerItem : undefined}
            >
              <Picker.Item label="Todas" value={null} />
              {Array.from(
                new Set(
                  bookings
                    .filter(b => {
                      const bookingDate = normalizeDateString(b.date);
                      return (
                        bookingDate >= today &&
                        (!selectedStylist || b.stylistName === selectedStylist)
                      );
                    })
                    .map(b => normalizeDateString(b.date))
                )
              )
                .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
                .map(date => {
                  const [year, month, day] = date.split('-');
                  const localDate = new Date(Number(year), Number(month) - 1, Number(day));
                  const formatted = localDate.toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  });
                  return <Picker.Item key={date} label={formatted} value={date} />;
                })}
            </Picker>
          </View>
        </View>

        {/* Grouped bookings */}
        {sortedDates.map(date => {
          let bookingsForDay = groupedByDate[date];

          // Apply filters
          bookingsForDay = bookingsForDay.filter(b => {
            const bookingDay = normalizeDateString(b.date);
            const matchesDate = selectedDate ? bookingDay === selectedDate : true;
            const matchesStylist = selectedStylist ? b.stylistName === selectedStylist : true;
            const isFuture = bookingDay >= today;
            return matchesDate && matchesStylist && isFuture;
          });

          // Sort by time
          bookingsForDay.sort((a, b) => {
            const [ay, am, ad] = normalizeDateString(a.date).split('-').map(Number);
            const [ah, amin] = a.time.split(':').map(Number);
            const aDate = new Date(ay, am - 1, ad, ah, amin);

            const [by, bm, bd] = normalizeDateString(b.date).split('-').map(Number);
            const [bh, bmin] = b.time.split(':').map(Number);
            const bDate = new Date(by, bm - 1, bd, bh, bmin);

            return aDate.getTime() - bDate.getTime();
          });

          if (bookingsForDay.length === 0) return null;

          return (
            <View key={date} style={{ marginBottom: 16 }}>
              <BodyText style={{ fontWeight: 'bold' }}>
                {formatDateWithWeekday(date)}
              </BodyText>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {bookingsForDay.map((b, idx) => {
                    const [year, month, day] = normalizeDateString(b.date).split('-').map(Number);
                    const [hour, minute] = b.time.split(':').map(Number);
                    const localDateObj = new Date(year, month - 1, day, hour, minute);

                    const time = localDateObj.toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.gridItem,
                          { backgroundColor: '#f0f0f0', borderColor: '#ccc', borderWidth: 1 },
                        ]}
                      >
                        <Text style={{ fontWeight: 'bold' }}>{time}</Text>
                        <Text>Cliente: {b.guestName}</Text>
                        <Text>Servicio: {b.service}</Text>
                        <Text>Duración: {b.duration}h</Text>
                        <Text>Estilista: {b.stylistName}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          );
        })}
      </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontWeight: 'bold', fontSize: 20, marginBottom: 16, textAlign: 'center' },
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
      justifyContent: 'center',
    },
  }),
  borderRadius: 6,
  borderWidth: 1,
  borderColor: '#00796b',
},
  pickerItem: {
    fontSize: 16,
    color: 'black',
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: 'black',
    fontSize: 16,
  },
  gridItem: {
    padding: 10,
    borderRadius: 6,
    minWidth: 140,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginRight: 8, // spacing between slots
  },
});
