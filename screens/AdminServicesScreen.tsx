import { doc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
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
    setServices(data);
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

  const renderItem = ({ item }: { item: Service }) => (
    <View style={styles.serviceItem}>
      <View style={{ flex: 1 }}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <Text style={styles.serviceMeta}>
          {item.duration}
        </Text>
        {item.description ? <Text>{item.description}</Text> : null}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleEdit(item)}>
          <Text style={styles.edit}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id!)}>
          <Text style={styles.delete}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {editingId ? 'Editar Servicio' : 'Agregar Servicio'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre del servicio"
        value={form.name}
        onChangeText={(text) => setForm({ ...form, name: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Duración"
        value={form.duration}
        onChangeText={(text) => setForm({ ...form, duration: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Descripción"
        value={form.description}
        onChangeText={(text) => setForm({ ...form, description: text })}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>
          {editingId ? 'Actualizar' : 'Agregar'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>Servicios existentes</Text>
      <FlatList
        data={services}
        keyExtractor={(item) => item.id!}
        renderItem={renderItem}
      />
    </View>
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
  serviceMeta: {
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
});
