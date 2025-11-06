import GradientBackground from '@/Components/GradientBackground';
import BodyBoldText from '@/Components/typography/BodyBoldText';
import BodyText from '@/Components/typography/BodyText';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { FlatList, Platform, StyleSheet, View } from 'react-native';
import { Booking, fetchAllBookings } from '../Services/bookingService';
import { RootStackParamList } from '../src/types';

function getLocalDateString(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-CA'); // 'YYYY-MM-DD' in local time
}

export default function AdminBookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedStylist, setSelectedStylist] = useState<string | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const stylistOptions = Array.from(new Set(bookings.map(b => b.stylistName)));
  
  const today = getLocalDateString(new Date().toISOString());

  const filteredBookings = bookings.filter(b => {
    const bookingDay = getLocalDateString(b.date);
    const matchesDate = selectedDate ? bookingDay === selectedDate : true;
    const matchesStylist = selectedStylist ? b.stylistName === selectedStylist : true;
    const isFuture = bookingDay >= today;
    return matchesDate && matchesStylist && isFuture;
  });

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const data = await fetchAllBookings();
        setBookings(data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
      }
    };
    loadBookings();
  }, []);

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
          <BodyBoldText>Date/Time: </BodyBoldText>
          <BodyText>{formattedDate} / {formattedTime}</BodyText>
        </View>
        <View style={styles.inlineText}>
          <BodyBoldText>Estilista: </BodyBoldText>
          <BodyText>{item.stylistName}</BodyText>
        </View>
      </View>
    );
  };

  return (
  <GradientBackground>
  <View style={styles.container}>
    <BodyBoldText style={styles.title}>Reservas</BodyBoldText>

    <View style={styles.filtersContainer}>
      <View style={styles.pickerWrapper}>
        <BodyBoldText style={styles.pickerLabel}>Estilista:</BodyBoldText>
        <LinearGradient colors={['#E9E4D4', '#E0CFA2']}>
        <Picker
          selectedValue={selectedStylist}
          onValueChange={(value) => setSelectedStylist(value)}
          mode={Platform.OS === 'android' ? 'dropdown' : undefined}
          style={[styles.picker]}
          itemStyle={Platform.OS === 'ios' ? styles.pickerItem : undefined}
        >
          <Picker.Item label="Todos" value={null} />
          {stylistOptions.map(name => (
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
        const bookingDate = getLocalDateString(b.date);
        return (
          bookingDate >= today &&
          (!selectedStylist || b.stylistName === selectedStylist)
        );
      })
      .map(b => getLocalDateString(b.date))
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

    <FlatList
      data={filteredBookings}
      keyExtractor={(item) => item.id}
      renderItem={renderBookingItem}
      contentContainerStyle={styles.listContent}
    />
  </View>
  </GradientBackground>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

  bookingItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  listContent: {
    paddingBottom: 40,
  },
  inlineText: {
    flexDirection: 'row',
    alignItems: 'center', // optional: aligns text vertically
    marginLeft: 10,
  },
});
