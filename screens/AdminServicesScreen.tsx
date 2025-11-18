import GradientBackground from '@/Components/GradientBackground';
import BodyBoldText from '@/Components/typography/BodyBoldText';
import BodyText from '@/Components/typography/BodyText';
import { Picker } from '@react-native-picker/picker';
import { doc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Button_style2 from "../Components/Button_style2";
import { db } from '../Services/firebaseConfig';
import {
  addService,
  deleteService,
  fetchServices,
  Service,
} from '../src/serviceApi';

export default function AdminServiceScreen() {
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState<Omit<Service, 'id'>>({
    name: '',
    duration: '',
    description: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadServices = async () => {
    const data = await fetchServices();
    const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
    setServices(sortedData);
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleSubmit = async () => {
    if (!form.name || !form.duration) {
      Alert.alert('Error', 'Nombre y duración son obligatorios.');
      return;
    }

    try {
      if (editingId) {
        const ref = doc(db, 'services', editingId);
        await updateDoc(ref, form);
        setEditingId(null);
      } else {
        await addService(form);
      }
      setForm({ name: '', duration: '', description: '' });
      loadServices();
    } catch (err) {
      console.error('Error saving service:', err);
    }
  };

  const handleEdit = (service: Service) => {
    setForm({
      name: service.name,
      duration: service.duration,
      description: service.description || '',
    });
    setEditingId(service.id || null);
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Eliminar servicio', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await deleteService(id);
          loadServices();
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Service }) => {

    return (
    <View style={styles.serviceItem}>
      <View style={{ flex: 1 }}>
        <BodyBoldText style={styles.serviceName}>{item.name}</BodyBoldText>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <BodyText style={styles.serviceTime}>
            {item.duration} {Number(item.duration) === 1 ? 'hora' : 'horas'}
          </BodyText>
        </View>

        {item.description ? <BodyText>{item.description}</BodyText> : null}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleEdit(item)}>
          <BodyText style={styles.edit}>Editar</BodyText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id!)}>
          <BodyText style={styles.delete}>Eliminar</BodyText>
        </TouchableOpacity>
      </View>
    </View>
  );
  };

  return (
    <GradientBackground>
    <View style={styles.container}>
      <BodyBoldText style={styles.title}>
        {editingId ? 'Editar Servicio' : 'Agregar Servicio'}
      </BodyBoldText>

      {editingId && (
  <>
    <BodyBoldText>ID del servicio</BodyBoldText>
    <TextInput
      style={[styles.input, { backgroundColor: '#e0e0e0' }]}
      value={editingId}
      editable={false}
      selectTextOnFocus={false}
    />
  </>
)}

      <BodyBoldText>Nombre del servicio</BodyBoldText>
        <TextInput style={[styles.input, { backgroundColor: '#f0f0f0' }]}
        placeholder='Nombre del servicio' placeholderTextColor="#888" 
        value={form.name} onChangeText={(text) => setForm({ ...form, name: text })}/>

      <BodyBoldText>Duración</BodyBoldText>
<View style={[styles.input, { backgroundColor: '#f0f0f0' }]}>
  <Picker
    selectedValue={form.duration}
    onValueChange={(value) => setForm({ ...form, duration: value })}
    mode={Platform.OS === 'android' ? 'dropdown' : undefined}
    style={styles.picker}
    itemStyle={Platform.OS === 'ios' ? styles.pickerItem : undefined}
  >
    <Picker.Item label="Selecciona duración" value="" />
    {[1,2,3,4,5,6,7,8].map(num => (
      <Picker.Item key={num} label={`${num}`} value={String(num)} />
    ))}
  </Picker>
  <Text style={{ marginLeft: 8 }}>horas</Text>
</View>


      <BodyBoldText>Descripción</BodyBoldText>
        <TextInput style={[styles.input, { backgroundColor: '#f0f0f0' }]}
        placeholder='Descripción' placeholderTextColor="#888" 
        value={form.description} onChangeText={(text) => setForm({ ...form, description: text })}/>

      <Button_style2
        title={editingId ? 'Actualizar' : 'Agregar'}
        onPress={handleSubmit}
      />

      <BodyBoldText style={styles.subtitle}>Servicios existentes</BodyBoldText>
      <FlatList
        data={services}
        keyExtractor={(item) => item.id!}
        renderItem={renderItem}
      />
    </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#0072ff',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  serviceName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  serviceTime: {
    color: '#555',
  },
  actions: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  edit: {
    color: '#0072ff',
    marginBottom: 4,
  },
  delete: {
    color: 'red',
  },
pickerItem: {
    fontSize: 16,
    color: 'black',
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
});
