import GradientBackground from '@/Components/GradientBackground';
import BodyText from '@/Components/typography/BodyText';
import SubTitleText from '@/Components/typography/SubTitleText';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert,
  FlatList, Modal,
  Platform,
  ScrollView, StyleSheet, Switch, Text,
  TouchableOpacity, View
} from 'react-native';
import Button_style2 from '../Components/Button_style2';
import { auth, db } from '../Services/firebaseConfig';
import type { RootStackParamList } from '../src/types';

export default function StaffCalendarScreen() {
    const availableTimes = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [bookedModalVisible, setBookedModalVisible] = useState(false);
    const [bookedSlot, setBookedSlot] = useState<TimeSlot | null>(null);
    const [bookedDateIso, setBookedDateIso] = useState<string | null>(null);
    const [isDayOff, setIsDayOff] = useState(false);
    const [loading, setLoading] = useState(false);
    const [bulkModalVisible, setBulkModalVisible] = useState(false);
    const [bulkIsDayOff, setBulkIsDayOff] = useState(false);
    const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
    const [bulkSlots, setBulkSlots] = useState<TimeSlot[]>([]);
    const [weekDates, setWeekDates] = useState<Date[]>([]);
    type TimeSlot = {
  time: string;
  booked: boolean;
  bookingId?: string | null; // allow null explicitly
};

    type Availability = {
      isDayOff: boolean;
      timeSlots: TimeSlot[];
    };
    type AvailabilityDay = {
      timeSlots: TimeSlot[];
      isDayOff: boolean;
    };
    const [weeklyAvailability, setWeeklyAvailability] = useState<Record<string, AvailabilityDay>>({});
    const [weekStartDate, setWeekStartDate] = useState(new Date());
    const [showWeekPicker, setShowWeekPicker] = useState(false);
    const uid = auth.currentUser?.uid;
    const isoDate = format(selectedDate, 'yyyy-MM-dd');
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const loadAvailability = async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const ref = doc(db, 'users', uid, 'availability', isoDate);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setSelectedSlots(data.timeSlots || []);
        setIsDayOff(data.isDayOff || false);
      } else {
        setSelectedSlots([]);
        setIsDayOff(false);
      }
    } catch (error) {
      console.error('Error loading availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveAvailability = async () => {
  if (!uid) return;
  setLoading(true);
  try {
    const ref = doc(db, 'users', uid, 'availability', isoDate);

    const newData: Availability = {
      timeSlots: selectedSlots, // ✅ already normalized
      isDayOff,
    };

    await setDoc(ref, newData);

    // Update weeklyAvailability state so UI refreshes
    setWeeklyAvailability(prev => ({
      ...prev,
      [isoDate]: newData,
    }));

    Alert.alert('Guardado', `Disponibilidad actualizada para ${isoDate}`);
  } catch (error) {
    console.error('Error saving availability:', error);
    Alert.alert('Error', 'No se pudo guardar la disponibilidad.');
  } finally {
    setLoading(false);
  }
};

  const applyBulkAvailability = async () => {
  if (!uid) return;

  setLoading(true);
  try {
    const start = new Date(weekStartDate);
    const newAvailability: Record<string, AvailabilityDay> = {};

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const iso = format(date, "yyyy-MM-dd");

      const ref = doc(db, "users", uid, "availability", iso);
      const snap = await getDoc(ref);

      let existingSlots: TimeSlot[] = [];
      if (snap.exists()) {
        existingSlots = snap.data().timeSlots || [];
      }

      // ✅ Build a map of existing slots keyed by time
      const existingMap: Record<string, TimeSlot> = {};
      existingSlots.forEach((s) => {
        existingMap[s.time] = {
          time: s.time,
          booked: s.booked ?? false,
          bookingId: s.bookingId ?? null,
        };
      });

      // ✅ Only keep slots selected in modal
      const selectedSlots = bulkSlots.map((slot) => ({
        time: slot.time,
        booked: false,          // availability means open
        bookingId: null,
      }));

      // ✅ Merge: preserve booked slots, overwrite availability with modal selections
      const mergedMap: Record<string, TimeSlot> = {};

      // keep booked slots from existing data
      Object.values(existingMap).forEach((s) => {
        if (s.booked) {
          mergedMap[s.time] = s; // preserve booked slot
        }
      });

      // add modal-selected slots
      selectedSlots.forEach((s) => {
        // if slot already booked, keep it booked
        if (mergedMap[s.time]?.booked) {
          return;
        }
        mergedMap[s.time] = s;
      });

      // sort chronologically
      const mergedSlots = Object.values(mergedMap).sort((a, b) => {
        const [ah, am] = a.time.split(":").map(Number);
        const [bh, bm] = b.time.split(":").map(Number);
        return ah === bh ? am - bm : ah - bh;
      });

      const data: AvailabilityDay = {
        timeSlots: mergedSlots,
        isDayOff: mergedSlots.length === 0,
      };

      newAvailability[iso] = data;
      console.log("📝 Prepared data for", iso, data);

      await setDoc(ref, data, { merge: true });
      console.log(`✅ Successfully wrote availability for ${iso}`);
    }

    setWeeklyAvailability((prev) => ({
      ...prev,
      ...newAvailability,
    }));

    const selectedIso = format(selectedDate, "yyyy-MM-dd");
    if (newAvailability[selectedIso]) {
      setSelectedSlots(newAvailability[selectedIso].timeSlots);
      setIsDayOff(newAvailability[selectedIso].isDayOff);
    }

    Alert.alert("Éxito", "Disponibilidad semanal actualizada.");
    setBulkModalVisible(false);
  } catch (error) {
    console.error("❌ Error applying bulk availability:", error);
    Alert.alert("Error", "No se pudo aplicar la disponibilidad.");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  const iso = format(selectedDate, 'yyyy-MM-dd');
  const weeklyData = weeklyAvailability[iso];

  if (weeklyData) {
    setIsDayOff(weeklyData.isDayOff ?? false);
    setSelectedSlots(weeklyData.timeSlots ?? []);
  } else {
    setIsDayOff(false);
    setSelectedSlots([]);
  }
}, [selectedDate, weeklyAvailability]);

  useEffect(() => {
    loadAvailability();
  }, [weekStartDate]);

  const toggleSlot = (time: string) => {
  setSelectedSlots(prev => {
    const exists = prev.find(slot => slot.time === time);
    if (exists) {
      // remove slot
      return prev.filter(slot => slot.time !== time);
    } else {
      // add slot with booked default
      return [...prev, { time, booked: false }];
    }
  });
};

useEffect(() => {
  const fetchWeek = async () => {
    if (!uid || weekDates.length === 0) return;
    setLoading(true);

    try {
      const fetches = weekDates.map(async date => {
        const iso = format(date, 'yyyy-MM-dd');
        const ref = doc(db, 'users', uid, 'availability', iso);
        const snap = await getDoc(ref);
        return {
          iso,
          data: snap.exists()
            ? {
                timeSlots: snap.data().timeSlots || [],
                isDayOff: snap.data().isDayOff || false,
              }
            : { timeSlots: [], isDayOff: false },
        };
      });

      const resultsArray = await Promise.all(fetches);

      // Build object keyed by iso date
      const results: typeof weeklyAvailability = {};
      resultsArray.forEach(({ iso, data }) => {
        results[iso] = data;
      });

      setWeeklyAvailability(results);
    } catch (error) {
      console.error('Error loading weekly availability:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchWeek();
}, [weekDates, uid]);

  useEffect(() => {
  const start = new Date(weekStartDate);
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
  setWeekDates(week);
}, [weekStartDate]);

  return (
    <GradientBackground>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        {loading && (
  <View style={styles.savingOverlay}>
    <View style={styles.savingBox}>
      <ActivityIndicator size="large" color="#fff" />
      <Text style={styles.savingText}>Guardando disponibilidad...</Text>
    </View>
  </View>
)}

    {/* SINGLE DAY / TIME EDITION */}
    <View style={{ marginTop: 24, alignItems:'center' }}>
  <SubTitleText>Disponibilidad diaria:</SubTitleText>
  <TouchableOpacity
    onPress={() => setShowDatePicker(true)}
    style={[styles.dateButton, { backgroundColor: '#d8d2c4' }]}
  >
    <BodyText>Seleccionar fecha (día único): {isoDate}</BodyText>
  </TouchableOpacity>
</View>

{showDatePicker && (
  <DateTimePicker
    value={selectedDate}
    mode="date"
    display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
    onChange={(_, date) => {
      setShowDatePicker(false);
      if (date) {
        setSelectedDate(date); // ✅ This must update the state
      }
    }}
    textColor="black"
  />
)}

<View style={styles.switchRow}>
  <BodyText>¿Día libre (día único)?</BodyText>
  <Switch value={isDayOff} onValueChange={setIsDayOff} />
</View>

{!isDayOff && (
  <Button_style2 title="Editar horarios" onPress={() => setModalVisible(true)} />
)}

{!isDayOff && selectedSlots.length > 0 && (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 16 }}>
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {selectedSlots
        .sort((a, b) => a.time.localeCompare(b.time))
        .map((slot, index) => (
          <View
            key={index}
            style={[
              styles.gridItem,
              {
                backgroundColor: slot.booked ? '#ddd' : '#f0f0f0',
                borderColor: slot.booked ? '#aaa' : '#ccc',
                borderWidth: 1,
                opacity: slot.booked ? 0.6 : 1,
              },
            ]}
          >
            <Text style={{ color: slot.booked ? '#888' : 'black' }}>
              {slot.booked ? '🔒' : '✅'} {slot.time}
            </Text>
          </View>
        ))}
    </View>
  </ScrollView>
)}

{!isDayOff && selectedSlots.length === 0 && (
  <View style={{ marginVertical: 16 }}>
    <BodyText>Horarios seleccionados: Ninguno</BodyText>
  </View>
)}

<Button_style2 title="Guardar disponibilidad" onPress={saveAvailability} />

{/* Daily Slot Modal */}
<Modal visible={modalVisible} animationType="slide" transparent>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Selecciona horarios</Text>
      <FlatList
        data={availableTimes}
        keyExtractor={item => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.slotButton,
              selectedSlots.some(slot => slot.time === item) && styles.slotSelected,
            ]}
            onPress={() => toggleSlot(item)}
          >
            <Text style={styles.slotText}>{item}</Text>
          </TouchableOpacity>
        )}
      />
      <Button_style2 title="Cerrar" onPress={() => setModalVisible(false)} />
    </View>
  </View>
</Modal>

<Modal
  visible={bookedModalVisible}
  animationType="slide"
  transparent
  onRequestClose={() => setBookedModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Detalles de la cita</Text>

      {bookedSlot && (
        <>
          <Text>Fecha: {bookedDateIso}</Text>
          <Text>Hora: {bookedSlot.time}</Text>
          <Text>Estado: Reservado</Text>
          {bookedSlot.bookingId && <Text>ID: {bookedSlot.bookingId}</Text>}
        </>
      )}

      <Button_style2 title="Cerrar" onPress={() => setBookedModalVisible(false)} />
    </View>
  </View>
</Modal>

{/* WEEKLY EDITION */}
<View style={{ marginTop: 24, width: '100%' }}>
  {/* Centered Subtitle */}
  <View style={{ alignItems: 'center', marginBottom: 12 }}>
    <SubTitleText>Disponibilidad semanal:</SubTitleText>
  </View>

  {/* Left-aligned date selector */}
  <View style={{ marginLeft: 26, alignItems: 'flex-start' }}>
    <TouchableOpacity
      onPress={() => setShowWeekPicker(true)}
      style={[styles.dateButton, { backgroundColor: '#d8d2c4' }]}
    >
      <BodyText>Seleccionar inicio de semana: {format(weekStartDate, 'yyyy-MM-dd')}</BodyText>
    </TouchableOpacity>
  </View>
</View>

{showWeekPicker && (
  <DateTimePicker
    value={weekStartDate}
    mode="date"
    display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
    onChange={(_, date) => {
      setShowWeekPicker(false);
      if (date) setWeekStartDate(date);
    }}
    textColor="black"
  />
)}

{weekDates.map(date => {
  const iso = format(date, 'yyyy-MM-dd');
  const dayLabel = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);

  const data = weeklyAvailability[iso];
  const slots = data?.timeSlots || [];
  const isOff = data?.isDayOff;

  return (
    <View key={iso} style={styles.weekDayBlock}>
      <Text style={styles.weekDay}>
        {dayLabel} {isOff ? '— Día libre' : ''}
      </Text>

      {!isOff && slots.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {slots
  .sort((a, b) => {
    const [ah, am] = a.time.replace(/['"]+/g, '').trim().split(':').map(Number);
    const [bh, bm] = b.time.replace(/['"]+/g, '').trim().split(':').map(Number);
    return ah === bh ? am - bm : ah - bh;
  })
  .map((slot, index) => {
    const slotContent = (
      <View
        key={index}
        style={[
          styles.gridItem,
          {
            backgroundColor: slot.booked ? '#ddd' : '#f0f0f0',
            borderColor: slot.booked ? '#aaa' : '#ccc',
            borderWidth: 1,
            opacity: slot.booked ? 0.6 : 1,
          },
        ]}
      >
        <Text style={{ color: slot.booked ? '#888' : 'black' }}>
          {slot.booked ? '🔒' : '✅'} {slot.time}
        </Text>
      </View>
    );

    // If booked, wrap in TouchableOpacity to show booked details modal
if (slot.booked) {
  return (
    <TouchableOpacity
      key={index}
      onPress={() => {
        setBookedSlot(slot);
        setBookedDateIso(iso);
        setBookedModalVisible(true);
      }}
    >
      {slotContent}
    </TouchableOpacity>
  );
}

    return slotContent;
  })}

          </View>
        </ScrollView>
      )}

      {!isOff && slots.length === 0 && (
        <Text style={styles.weekSlots}>Sin horarios</Text>
      )}
    </View>
  );
})}

<View style={styles.marginTop}>
<Button_style2 title="Editar semana completa" onPress={() => setBulkModalVisible(true)} />
</View>
{/* Weekly Bulk Modal */}
<Modal visible={bulkModalVisible} animationType="slide" transparent>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Editar semana completa</Text>
      <View style={styles.switchRow}>
        <BodyText>¿Día libre (toda la semana)?</BodyText>
        <Switch value={bulkIsDayOff} onValueChange={setBulkIsDayOff} />
      </View>
      {!bulkIsDayOff && (
        <FlatList
          data={availableTimes}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.slotButton,
                bulkSlots.some(slot => slot.time === item)
               && styles.slotSelected,
              ]}
             onPress={() =>
  setBulkSlots(prev =>
    prev.some(slot => slot.time === item)
      // If already selected, remove it from availability
      ? prev.filter(slot => slot.time !== item)
      // If not selected, add it as available
      : [...prev, { time: item, booked: false, bookingId: null }]
  )
}
            >
              <Text style={styles.slotText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      )}
        <Button_style2 title="Aplicar a la semana" onPress={applyBulkAvailability} />
        <View style={{ marginTop: 12 }}>
            <Button_style2 title="Cancelar" onPress={() => setBulkModalVisible(false)} />
        </View>
    </View>
  </View>
</Modal>

    </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  dateButton: { padding: 12, backgroundColor: '#eee', borderRadius: 8 },
  dateText: { fontSize: 16 },
  switchRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12, // ✅ adds space between text and switch
},
  switchLabel: { fontSize: 16, marginRight: 10 },
  selectedText: { marginTop: 10, fontSize: 16 },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  slotButton: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#eee',
    borderRadius: 6,
  },
  slotSelected: { backgroundColor: '#cce5ff' },
  slotText: { fontSize: 16 },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  overlayText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
  },
  weekHeader: {
  fontSize: 18,
  fontWeight: 'bold',
  marginTop: 20,
  marginBottom: 10,
},
weekDayBlock: {
  marginTop: 10,
  alignItems: 'flex-start', // ✅ aligns text to the left
  width: '100%',            // ✅ ensures full-width layout
  marginLeft: 26, // ✅ adds left spacing per day block
},
weekDay: {
  fontSize: 16,
  fontWeight: '600',
},
weekSlots: {
  fontSize: 14,
  color: '#555',
  marginLeft: 10,
},
scrollContent: {
  justifyContent: 'flex-start',
  paddingBottom: 40,
  alignItems: 'center',
},
savingOverlay: {
  position: 'absolute',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.6)',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 999,
},
savingBox: {
  backgroundColor: '#333',
  padding: 20,
  borderRadius: 10,
  alignItems: 'center',
},
savingText: {
  marginTop: 10,
  color: '#fff',
  fontSize: 16,
  fontWeight: '500',
},
marginTop:{
  marginTop: 10,
},
gridItem: {
  paddingVertical: 10,
  paddingHorizontal: 14,
  borderRadius: 6,
  minWidth: 80,
  alignItems: 'center',
  justifyContent: 'center',
},
});
