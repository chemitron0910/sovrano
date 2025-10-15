import { Button, StyleSheet, Text, View } from "react-native";

export default function HomeScreen({navigation, route}) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home Screen</Text>
      {route.params?.result && <Text style={styles.text}>Result: {route.params.result}</Text>}
      <Button title="Go to About" onPress={() => navigation.navigate('About')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
});