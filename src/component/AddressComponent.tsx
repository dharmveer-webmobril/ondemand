import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Formik } from 'formik';
import * as Yup from 'yup';

const GOOGLE_API_KEY = 'AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao'; // Replace with your key

const AddressSchema = Yup.object().shape({
  address: Yup.string().required('Address is required'),
  city: Yup.string().required('City is required'),
  state: Yup.string().required('State is required'),
  zip: Yup.string().required('Zip code is required'),
  latitude: Yup.string().required('Latitude is required'),
  longitude: Yup.string().required('Longitude is required'),
});

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const AddressModal = ({ visible, onClose, onSubmit }: Props) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.header}>Enter Address</Text>
          <Formik
            initialValues={{
              address: '',
              address1: '',
              city: '',
              state: '',
              zip: '',
              latitude: '',
              longitude: '',
            }}
            validationSchema={AddressSchema}
            onSubmit={(values) => onSubmit(values)}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              setFieldValue,
            }) => (
              <ScrollView>
                {/* Google Places Autocomplete */}
                <GooglePlacesAutocomplete
                  placeholder="Search Address"
                  fetchDetails
                  onPress={(data, details = null) => {
                    const addressComponents = details?.address_components || [];
                    const getComp = (types: string[]) =>
                      addressComponents.find((c) =>
                        types.every((t) => c.types.includes(t as any))
                      )?.long_name || '';

                    const location = details?.geometry?.location;

                    setFieldValue('address', data.description);
                    setFieldValue('city', getComp(['locality']));
                    setFieldValue('state', getComp(['administrative_area_level_1']));
                    setFieldValue('zip', getComp(['postal_code']));
                    setFieldValue('latitude', location?.lat?.toString() || '');
                    setFieldValue('longitude', location?.lng?.toString() || '');
                  }}
                  query={{
                    key: GOOGLE_API_KEY,
                    language: 'en',
                  }}
                  styles={{
                    textInput: styles.input,
                    listView: { backgroundColor: '#fff' },
                  }}
                />

                {errors.address && touched.address && (
                  <Text style={styles.error}>{errors.address}</Text>
                )}

                {/* Optional Address Line 1 */}
                <TextInput
                  placeholder="Address Line 1 (optional)"
                  value={values.address1}
                  onChangeText={handleChange('address1')}
                  onBlur={handleBlur('address1')}
                  style={styles.input}
                />

                {/* City */}
                <TextInput
                  placeholder="City"
                  value={values.city}
                  onChangeText={handleChange('city')}
                  onBlur={handleBlur('city')}
                  style={styles.input}
                />
                {errors.city && touched.city && (
                  <Text style={styles.error}>{errors.city}</Text>
                )}

                {/* State */}
                <TextInput
                  placeholder="State"
                  value={values.state}
                  onChangeText={handleChange('state')}
                  onBlur={handleBlur('state')}
                  style={styles.input}
                />
                {errors.state && touched.state && (
                  <Text style={styles.error}>{errors.state}</Text>
                )}

                {/* Zip */}
                <TextInput
                  placeholder="Zip Code"
                  value={values.zip}
                  onChangeText={handleChange('zip')}
                  onBlur={handleBlur('zip')}
                  keyboardType="number-pad"
                  style={styles.input}
                />
                {errors.zip && touched.zip && (
                  <Text style={styles.error}>{errors.zip}</Text>
                )}

                {/* Manual Lat / Lng */}
                <TextInput
                  placeholder="Latitude"
                  value={values.latitude}
                  onChangeText={handleChange('latitude')}
                  onBlur={handleBlur('latitude')}
                  style={styles.input}
                />
                {errors.latitude && touched.latitude && (
                  <Text style={styles.error}>{errors.latitude}</Text>
                )}

                <TextInput
                  placeholder="Longitude"
                  value={values.longitude}
                  onChangeText={handleChange('longitude')}
                  onBlur={handleBlur('longitude')}
                  style={styles.input}
                />
                {errors.longitude && touched.longitude && (
                  <Text style={styles.error}>{errors.longitude}</Text>
                )}

                {/* Submit Button */}
                <TouchableOpacity onPress={() => handleSubmit()} style={styles.button}>
                  <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onClose} style={styles.cancel}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </Formik>
        </View>
      </View>
    </Modal>
  );
};

export default AddressModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'center',
  },
  container: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginVertical: 5,
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 5,
    marginLeft: 5,
  },
  button: {
    backgroundColor: '#00796B',
    padding: 12,
    borderRadius: 6,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
  cancel: {
    marginTop: 10,
    padding: 10,
  },
  cancelText: {
    textAlign: 'center',
    color: '#555',
  },
});




{/* <AddressModal
  visible={modalVisible}
  onClose={() => setModalVisible(false)}
  onSubmit={(data) => {
    console.log('Address submitted:', data);
    setModalVisible(false);
  }}
/> */}
