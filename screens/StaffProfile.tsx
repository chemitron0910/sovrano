import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import Button_style2 from '../Components/Button_style2';
import { auth, db } from '../Services/firebaseConfig';

const availableTimes = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

export default function StaffProfile() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isDayOff, setIsDayOff] = useState(false);
  const [loading, setLoading] = useState(false);
  const uid = auth.currentUser?.uid;

  const isoDate = format(selectedDate, 'yyyy-MM-dd');

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
      await setDoc(ref, {
        timeSlots: selectedSlots,
        isDayOff,
      });
      Alert.alert('Guardado', `Disponibilidad actualizada para ${isoDate}`);
    } catch (error) {
      console.error('Error saving availability:', error);
      Alert.alert('Error', 'No se pudo guardar la disponibilidad.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvailability();
  }, [selectedDate]);

  const toggleSlot = (time: string) => {
    setSelectedSlots(prev =>
      prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
        <Text style={styles.dateText}>Seleccionar fecha: {isoDate}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={(_, date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>¿Día libre?</Text>
        <Switch value={isDayOff} onValueChange={setIsDayOff} />
      </View>

      {!isDayOff && (
        <>
          <Button_style2 title="Editar horarios" onPress={() => setModalVisible(true)} />
          <Text style={styles.selectedText}>Horarios seleccionados: {selectedSlots.join(', ') || 'Ninguno'}</Text>
        </>
      )}

      <Button_style2 title="Guardar disponibilidad" onPress={saveAvailability} />

      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.overlayText}>Cargando...</Text>
        </View>
      )}

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
                    selectedSlots.includes(item) && styles.slotSelected,
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  dateButton: { padding: 12, backgroundColor: '#eee', borderRadius: 8 },
  dateText: { fontSize: 16 },
  switchRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
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
});
