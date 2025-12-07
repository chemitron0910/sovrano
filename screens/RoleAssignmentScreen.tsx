import GradientBackground from '@/Components/GradientBackground';
import BodyBoldText from '@/Components/typography/BodyBoldText';
import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import Button_style2 from "../Components/Button_style2";
import { ROLES } from '../constants/roles';
import { auth } from '../Services/firebaseConfig';
import { fetchAllUsers, updateUserRoleByUsername } from '../Services/userService';
import { User } from '../src/types';
import { logError } from "../utils/logger";

export default function RoleAssignmentScreen() {
  const [username, setUsername] = useState('');
  const [selectedRole, setSelectedRole] = useState(ROLES.ADMIN);
  const [users, setUsers] = useState<User[]>([]);

  // 📥 Load all users on mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const userList = await fetchAllUsers();
        setUsers(userList);
      } catch (err) {
        logError('Error loading users:', err);
      }
    };
    loadUsers();
  }, []);

  const handleUpdate = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'No authenticated user found.');
        return;
      }

      if (!username) {
        Alert.alert('Error', 'Please select a username.');
        return;
      }

      const token = await currentUser.getIdTokenResult();
      const uid = await updateUserRoleByUsername(username, selectedRole);
      await auth.currentUser?.getIdToken(true); // 🔄 Refresh token
      Alert.alert('Success', `Role updated to "${selectedRole}" for ${username}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      Alert.alert('Error', message);
    }
  };

  return (
    <GradientBackground>
    <View style={styles.container}>
      <View style={styles.pickerWrapper}>
      <BodyBoldText style={styles.label}>Nombre de usuario</BodyBoldText>
      
      <Picker
  selectedValue={username}
  onValueChange={(value) => setUsername(value)}
  style={[styles.picker, { width: '100%' }]} // ✅ Full width
  itemStyle={Platform.OS === 'ios' ? styles.pickerItem : undefined}
>
  <Picker.Item label="Selecciona un usuario..." value="" />
  {users
    .filter((user) => {
      if (!user.lastLogin) return false; // skip if no lastLogin
      const lastLoginDate = new Date(user.lastLogin);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      return lastLoginDate >= oneYearAgo;
    })
    .slice() // copy array to avoid mutating state
    .sort((a, b) => a.username.localeCompare(b.username)) // ✅ Alphabetical order
    .map((user) => (
      <Picker.Item
        key={user.email}
        label={`${user.username} (${user.role})`} // show username + role
        value={user.username}
      />
    ))}
</Picker>

      </View>

      <View style={styles.pickerWrapper}>
      <BodyBoldText style={styles.label}>Selecciona la responsabilidad</BodyBoldText>
      
      <Picker
        selectedValue={selectedRole}
        onValueChange={(itemValue) => setSelectedRole(itemValue)}
        style={[styles.picker, { width: '100%' }]}
        itemStyle={Platform.OS === 'ios' ? styles.pickerItem : undefined}
      >
        {Object.values(ROLES).map((role) => (
          <Picker.Item key={role} label={role} value={role} />
        ))}
      </Picker>
      </View>

      <Button_style2
        title="Update Role"
        onPress={handleUpdate}
      />
    </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
  flex: 1,
  alignItems: 'center',     // horizontal centering
  paddingHorizontal: 20,
},

  label: {
    marginTop: 10,
    marginBottom: 5,
    fontWeight: 'bold',
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
  pickerWrapper: {
  width: '100%',
  alignItems: 'center',
  marginBottom: 20,
},

  pickerItem: {
      fontSize: 16,
      color: 'black',
    },
  pickerLabel: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '600',
  },
});
