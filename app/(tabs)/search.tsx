import { StyleSheet, Text, TextInput, View } from 'react-native';



export default function SearchScreen() {
  return (
    <View style={styles.container}>
        <Text style={styles.title}>Search</Text>
        <TextInput placeholder='Postcode, Stop or Route' style={styles.input} />
    </View>
    );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16},
  title: {fontSize: 20, fontWeight: 'bold'},
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
});
