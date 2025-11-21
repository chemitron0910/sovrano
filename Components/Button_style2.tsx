import ButtonText from '@/Components/typography/ButtonText';
import { LinearGradient } from 'expo-linear-gradient';
import { ColorValue, Pressable, StyleSheet, ViewStyle } from 'react-native';

interface ButtonStyle2Props {
  title: string;
  onPress: () => void;
  gradientColors?: [ColorValue, ColorValue, ...ColorValue[]];
  textColor?: string;
  style?: ViewStyle;
}

export default function Button_style2({
  title,
  onPress,
  gradientColors = ['#c2b280', '#a68f5b'],
  textColor = '#3e3e3e',
  style = {},
}: ButtonStyle2Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.wrapper, style, pressed && styles.pressed]}>
      <LinearGradient colors={gradientColors} style={styles.gradient}>
        <ButtonText style={{ color: textColor }}>{title}</ButtonText>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
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
  pressed: {
    opacity: 0.8,
  },
});

