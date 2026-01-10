import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function CurrentLocationSummary() {
    const [locationName, setLocationName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [permissionDenied, setPermissionDenied] = useState(false);

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted'){
                setPermissionDenied(true);
                setLoading(false);
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const address = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            if (address.length > 0){
                const place =
                    address[0].district ||
                    address[0].subregion ||
                    address[0].city ||
                    address[0].region ||
                    'your area';
                setLocationName(place);
            }
            setLoading(false);
        })();
    }, []);
    if (loading){
        return(
            <View style={styles.container}>
                <ActivityIndicator size="small" />
                <Text style={styles.text}>Getting your location...</Text>
            </View>
        );
    }
    if (permissionDenied) {
        return (
            <View style={styles.container}>
                <Ionicons name="location-outline" size={18} color="gray" />
                <Text style={styles.text}>Location Disabled</Text>
            </View>
        );
    } 

        return (
            <View style={styles.container}>
                <Ionicons name="location" size={18} color="#E11D48" />
                <Text style={styles.text}>Near {locationName}</Text>
            </View>
        );
    }
    const styles = StyleSheet.create({
        container:{
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 8,
        },
        text: {
            marginLeft: 6,
            fontSize: 14,
            color: '#444',
        },
    });   
    
