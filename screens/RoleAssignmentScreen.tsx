import { checkUsername } from '@/hooks/usernameValidation';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { Alert, Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { ROLES } from '../constants/roles';
import { auth } from '../Services/firebaseConfig';
import { fetchAllUsers, updateUserRoleByUsername } from '../Services/userService';
import { User } from '../src/types';

export default function RoleAssignmentScreen() {
  const [username, setUsername] = useState('');
  const [selectedRole, setSelectedRole] = useState(ROLES.ADMIN);
  const [isValidUsername, setIsValidUsername] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  // 🔍 Validate username whenever it changes
  useEffect(() => {
    const validate = async () => {
      if (!username) {
        setIsValidUsername(false);
        return;
      }
      setCheckingUsername(true);
      const valid = await checkUsername(username);
      setIsValidUsername(valid);
      setCheckingUsername(false);
    };
    validate();
  }, [username]);

  // 📥 Load all users on mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const userList = await fetchAllUsers();
        setUsers(userList);
      } catch (err) {
        console.error('Error loading users:', err);
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

      if (!isValidUsername) {
        Alert.alert('Error', 'Username is invalid or not unique.');
        return;
      }

      const token = await currentUser.getIdTokenResult();
      console.log('Current role:', token.claims.role);
      const uid = await updateUserRoleByUsername(username, selectedRole);
      await auth.currentUser?.getIdToken(true); // 🔄 Refresh token
      Alert.alert('Success', `Role updated to "${selectedRole}" for ${username}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      Alert.alert('Error', message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Assign Role</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Select Role</Text>
      <Picker
        selectedValue={selectedRole}
        onValueChange={(itemValue) => setSelectedRole(itemValue)}
        style={styles.picker}
      >
        {Object.values(ROLES).map((role) => (
          <Picker.Item key={role} label={role} value={role} />
        ))}
      </Picker>

      <Button title="Update Role" onPress={handleUpdate} 
      disabled={!username || !isValidUsername || checkingUsername} />

      <Text style={styles.label}>User List</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.email}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Text style={styles.userText}>
              {item.username} ({item.role})
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    marginTop: 10,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
  picker: {
    marginVertical: 10,
  },
  userItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userText: {
    fontSize: 16,
  },
});
