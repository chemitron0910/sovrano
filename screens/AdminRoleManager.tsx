import { getFunctions, httpsCallable } from 'firebase/functions';
import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminRoleManager() {

  const windowDimensions = useWindowDimensions();
  const windowWidth = windowDimensions.width;
  const windowHeight = windowDimensions.height;

  const [targetUid, setTargetUid] = useState('');
  const [role, setRole] = useState('');

  type RoleResponse = {
  message: string;
  };

const assignRole = async () => {
  if (!targetUid || !role) {
    Alert.alert('Missing Info', 'Please enter both UID and role.');
    return;
  }

  try {
    const functions = getFunctions();
    const setUserRole = httpsCallable(functions, 'setUserRole');
    const result = await setUserRole({ uid: targetUid, role });

    const data = result.data as RoleResponse;
    Alert.alert('Success', data.message);

    setTargetUid('');
    setRole('');
  } catch (error: any) {
    console.error('Role assignment failed:', error);
    Alert.alert('Error', error.message || 'Failed to assign role.');
  }
};

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Promote User</Text>

      <TextInput
        style={styles.input}
        placeholder="User UID"
        value={targetUid}
        onChangeText={setTargetUid}
      />

      <TextInput
        style={styles.input}
        placeholder="Role (e.g. admin, staff)"
        value={role}
        onChangeText={setRole}
      />

      <Button title="Assign Role" onPress={assignRole} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
});