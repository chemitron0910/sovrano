import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { ROLES } from '../constants/roles';
import { auth } from '../Services/firebaseConfig';
import { updateUserRoleByUsername } from '../Services/userService';

export default function RoleAssignmentScreen() {
  const [username, setUsername] = useState('');
  const [selectedRole, setSelectedRole] = useState(ROLES.ADMIN);

  const handleUpdate = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
      Alert.alert('Error', 'No authenticated user found.');
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

      <Button title="Update Role" onPress={handleUpdate} disabled={!username} />
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
});
