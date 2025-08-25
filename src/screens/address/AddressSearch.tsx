import React, { use, useState } from 'react';
import {
    View,
    TextInput,
    FlatList,
    TouchableOpacity,
    Text,
    StyleSheet,
} from 'react-native';
import { v4 as uuidv4 } from 'uuid';

const GOOGLE_API_KEY = 'AIzaSyALC5b7touq90VVqX9U96jVMPHjJ5_We8s';

export interface ParsedAddress {
    lat: number;
    lng: number;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    formattedAddress: string;
}

interface AddressSearchProps {
    onSelect: (data: ParsedAddress) => void; // 👈 callback to parent
    countryCode?: string; // optional, default: "in"
    inputStyle?: any; // optional, for custom styles

    placeholder?: string; // optional, for custom placeholder text
    placeholderTextColor?: string; // optional, for custom placeholder text
    value?: string; // optional, for controlled input
}

const parsePlaceDetails = (result: any): ParsedAddress => {
    const { lat, lng } = result.geometry.location;
    let city = '';
    let state = '';
    let country = '';
    let postalCode = '';

    result.address_components.forEach((comp: any) => {
        if (comp.types.includes('locality')) city = comp.long_name;
        if (comp.types.includes('administrative_area_level_1')) state = comp.long_name;
        if (comp.types.includes('country')) country = comp.long_name;
        if (comp.types.includes('postal_code')) postalCode = comp.long_name;
    });

    if (!city) {
        const level2 = result.address_components.find((c: any) =>
            c.types.includes('administrative_area_level_2')
        );
        if (level2) city = level2.long_name;
    }

    return { lat, lng, city, state, country, postalCode, formattedAddress: result.formatted_address };
};

const AddressSearch: React.FC<AddressSearchProps> = ({ onSelect, countryCode = '', inputStyle, placeholder, placeholderTextColor, value }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [sessionToken, setSessionToken] = useState(uuidv4());
    const [showSuggestions, setShowSuggestions] = useState(false);

    useState(() => {
        console.log('AddressSearch mounted with initial value:', value);
        
        if (value) {
            setQuery(value);
        }
    }, [value]);

    // 🔎 Fetch autocomplete suggestions
    const fetchPlaces = async (text: string) => {
        setQuery(text);

        if (text.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        try {
            let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&key=${GOOGLE_API_KEY}&sessiontoken=${sessionToken}&language=en`;
            // only add country restriction if provided
            if (countryCode) {
                url += `&components=country:${countryCode}`;
            }

            const response = await fetch(url);

            const data = await response.json();

            if (data.status === 'OK') {
                setSuggestions(data.predictions);
                setShowSuggestions(true);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        } catch (err) {
            console.error('AutoComplete Error:', err);
        }
    };

    // 📍 Fetch full place details
    const fetchPlaceDetails = async (placeId: string) => {
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_API_KEY}&language=en&sessiontoken=${sessionToken}`
            );
            const data = await response.json();

            if (data.status === 'OK') {
                const parsed = parsePlaceDetails(data.result);

                // ✅ return parsed JSON to parent
                onSelect(parsed);

                setQuery(parsed.formattedAddress);
                setShowSuggestions(false);
            }
            setSessionToken(uuidv4());
        } catch (err) {
            console.error('Place Details Error:', err);
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={[styles.input, inputStyle]}
                value={query}
                placeholder={placeholder}
                placeholderTextColor={placeholderTextColor || '#999'}
                onChangeText={fetchPlaces}
            />

            {showSuggestions && (
                <View style={{ position: 'absolute', top: 50, left: 0, right: 0, zIndex: 1000, backgroundColor: 'white', elevation: 5, marginHorizontal: 5 }}>
                    <FlatList
                        data={suggestions}
                        keyExtractor={(item) => item.place_id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.suggestion}
                                onPress={() => fetchPlaceDetails(item.place_id)}
                            >
                                <Text>{item.description}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}
        </View>
    );
};

export default AddressSearch;

const styles = StyleSheet.create({
    container: { width: '100%' },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
    },
    suggestion: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
});
