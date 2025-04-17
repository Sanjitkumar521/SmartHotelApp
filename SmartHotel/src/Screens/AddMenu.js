import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

const AddMenu = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const API_URL = 'http://192.168.18.50:8082/add_menu';

  const handleAddMenu = async () => {
    // Create FormData object
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('category', category);
    formData.append('imageUrl', imageUrl);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        headers: {},
      });

      if (response.ok) {
        const result = await response.json();
        Alert.alert('message', 'Menu added successfully!');
        console.log('API Response:', result);
        // Optionally reset form fields
        setName('');
        setDescription('');
        setPrice('');
        setCategory('');
        setImageUrl('');
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to add menu.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Add Menu</Text>
        <Text style={styles.label}>Menu Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter menu name"
          value={name}
          onChangeText={setName}
        />
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter description"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <Text style={styles.label}>Price in $</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter price"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />
        <Text style={styles.label}>Category</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter category"
          value={category}
          onChangeText={setCategory}
        />
        <Text style={styles.label}>Image URL</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter image URL"
          value={imageUrl}
          onChangeText={setImageUrl}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddMenu}>
          <Text style={styles.buttonText}>Add Menu</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5E050',
    padding: 20,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    marginTop: -50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  addButton: {
    backgroundColor: '#FF5733',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddMenu; // Ensure this export is present