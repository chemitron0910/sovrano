import GradientBackground from '@/Components/GradientBackground';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { db } from '../Services/firebaseConfig';
import { RootStackParamList } from '../src/types';

type UserRecord = {
  id: string;
  username: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  lastLogin?: string;
  role: string;
  activo: boolean;
};

export default function AdminStaffManageScreen() {
  type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
  const navigation = useNavigation<NavigationProp>();

  const [selectedFilter, setSelectedFilter] = useState<string>('empleadoActivo');
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [editFields, setEditFields] = useState<Partial<UserRecord>>({});

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, 'users'));
        const data: UserRecord[] = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...(docSnap.data() as any),
        }));
        setUsers(data);
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => {
    switch (selectedFilter) {
      case 'empleadoActivo':
        return (u.role === 'admin' || u.role === 'empleado') && u.activo === true;
      case 'empleadoInactivo':
        return (u.role === 'admin' || u.role === 'empleado') && u.activo === false;
      case 'usuarioActivo':
        return u.role === 'usuario' && u.activo === true;
      case 'usuarioInactivo':
        return u.role === 'usuario' && u.activo === false;
      default:
        return false;
    }
  });

  const handleEdit = (user: UserRecord) => {
    setEditingUser(user);
    setEditFields(user);
  };

  const handleSave = async () => {
    if (!editingUser) return;
    try {
      const ref = doc(db, 'users', editingUser.id);
      await updateDoc(ref, {
        username: editFields.username,
        email: editFields.email,
        phoneNumber: editFields.phoneNumber,
        lastLogin: editFields.lastLogin,
        activo: editFields.activo,
      });
      // refresh local state
      setUsers(prev =>
        prev.map(u => (u.id === editingUser.id ? { ...u, ...editFields } as UserRecord : u))
      );
      setEditingUser(null);
    } catch (err) {
      console.error('Error updating user:', err);
    }
  };

  function formatDate(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  };
  // This will produce "Nov 28, 2025" → we replace comma with dash
  return d.toLocaleDateString('en-US', options).replace(/,/, '').replace(/\s/g, '-');
}

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
          
            <View style={styles.filtersContainer}>
            <View style={styles.pickerWrapper}>
            <LinearGradient colors={['#E9E4D4', '#E0CFA2']}>
            <Picker
              selectedValue={selectedFilter}
              onValueChange={(value) => setSelectedFilter(value)}
              mode={Platform.OS === 'android' ? 'dropdown' : undefined}
              style={styles.picker}
              itemStyle={Platform.OS === 'ios' ? styles.pickerItem : undefined}
            >
              <Picker.Item label="Empleado activo" value="empleadoActivo" />
              <Picker.Item label="Empleado inactivo" value="empleadoInactivo" />
              <Picker.Item label="Usuario activo" value="usuarioActivo" />
              <Picker.Item label="Usuario inactivo" value="usuarioInactivo" />
            </Picker>
            </LinearGradient>
            </View>
            </View>
            <View style={styles.container}>
            {loading ? (
              <ActivityIndicator size="large" color="#00796b" />
            ) : (
              filteredUsers.map(u => (
                <TouchableOpacity key={u.id} style={styles.card} onPress={() => handleEdit(u)}>
                  <Text style={styles.field}>Usuario: {u.username}</Text>
                  <Text style={styles.field}>Email: {u.email}</Text>
                  <Text style={styles.field}>Teléfono: {u.phoneNumber}</Text>
                  <Text style={styles.field}>Creado: {formatDate(u.createdAt)}</Text>
                  <Text style={styles.field}>Último login: {formatDate(u.lastLogin)}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>

        {/* Edit Modal */}
        <Modal visible={!!editingUser} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Editar Usuario</Text>

              <TextInput
                style={styles.input}
                value={editFields.username}
                onChangeText={t => setEditFields({ ...editFields, username: t })}
                placeholder="Nombre"
              />
              <TextInput
                style={styles.input}
                value={editFields.email}
                onChangeText={t => setEditFields({ ...editFields, email: t })}
                placeholder="Email"
              />
              <TextInput
                style={styles.input}
                value={editFields.phoneNumber}
                onChangeText={t => setEditFields({ ...editFields, phoneNumber: t })}
                placeholder="Teléfono"
              />

              <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
                <Text>Activo:</Text>
                <Switch
                  value={editFields.activo}
                  onValueChange={v => setEditFields({ ...editFields, activo: v })}
                />
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={{ color: '#fff' }}>Guardar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setEditingUser(null)}>
                  <Text>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 20,
  },
  scrollContent: {
    justifyContent: 'flex-start',
    paddingBottom: 40,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    width: 300,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  field: {
    fontSize: 14,
    marginBottom: 4,
  },
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
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#00796b',
    padding: 10,
    borderRadius: 6,
  },
  cancelButton: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 6,
  },
  picker: {
    width: 200, // ✅ fixed width to fit labels
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
  pickerWrapper: {
    justifyContent: 'center',
    marginTop: 20,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
});
