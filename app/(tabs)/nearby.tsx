import { StyleSheet, Text, View } from 'react-native';



export default function NearbyScreen() {
  return (
    <View style={styles.container}>
        <Text style={styles.title}>Nearby Stops</Text>
        <Text>Bus stops near your location</Text> 
    </View>
  );
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title:{
        fontSize: 20,
        fontWeight: 'bold'
    },
});
