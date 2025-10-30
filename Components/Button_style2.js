import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text } from 'react-native';

export default function Button_style2({
  title,
  onPress,
  gradientColors = ['#c2b280', '#a68f5b'],
  textColor = '#3e3e3e',
  style = {},
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.wrapper, style, pressed && styles.pressed]}>
      <LinearGradient colors={gradientColors} style={styles.gradient}>
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'flex-start',
    alignSelf: 'center',
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  gradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
});

