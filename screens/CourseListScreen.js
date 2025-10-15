import { StyleSheet, Text, View } from 'react-native';

const CourseList = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Course List Screen</Text>
    </View>
  );
}

export default CourseList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',   
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});