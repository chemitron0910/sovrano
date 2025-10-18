import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function Button_style1({ title, onPress }) {
  return (
    <TouchableOpacity style={[styles.button]} onPress={onPress} activeOpacity={0.8}>
      <Text style={[styles.text]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#6A1B9A', // Royal purple
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    alignSelf: 'flex-start',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
