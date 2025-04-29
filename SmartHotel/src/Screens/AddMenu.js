import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';

const AddMenu = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const API_URL = 'http://192.168.18.50:8082/add_menu';

  // Validation function to collect all errors
  const validateForm = () => {
    let errors = [];

    // Validate Menu Name (string only, letters and spaces, no numbers or special characters)
    const namePattern = /^[A-Za-z\s]+$/;
    if (!name || name.trim().length === 0) {
      errors.push('Menu Name: Please fill the field.');
    } else if (name.trim().length < 3) {
      errors.push('Menu Name: Must be at least 3 characters long.');
    } else if (!namePattern.test(name.trim())) {
      errors.push('Menu Name: Must contain only letters and spaces (no numbers or special characters).');
    }

    // Validate Description (string, letters, spaces, and basic punctuation allowed)
    const descriptionPattern = /^[A-Za-z\s,.!]+$/;
    if (!description || description.trim().length === 0) {
      errors.push('Description: Please fill the field.');
    } else if (description.trim().length < 10) {
      errors.push('Description: Must be at least 10 characters long.');
    } else if (!descriptionPattern.test(description.trim())) {
      errors.push('Description: Must contain only letters, spaces, and basic punctuation (e.g., commas, periods).');
    }

    // Validate Price (numeric only)
    if (!price || price.trim().length === 0) {
      errors.push('Price: Please fill the field.');
    } else {
      const priceValue = parseFloat(price);
      const pricePattern = /^\d+(\.\d{1,2})?$/; // Allows numbers and up to 2 decimal places
      if (!pricePattern.test(price.trim())) {
        errors.push('Price: Must be a valid number (e.g., 10 or 10.99).');
      } else if (isNaN(priceValue) || priceValue <= 0) {
        errors.push('Price: Must be a positive number greater than 0.');
      }
    }

    // Validate Category (string only, letters and spaces, no numbers or special characters)
    const categoryPattern = /^[A-Za-z\s]+$/;
    if (!category || category.trim().length === 0) {
      errors.push('Category: Please fill the field.');
    } else if (category.trim().length < 3) {
      errors.push('Category: Must be at least 3 characters long.');
    } else if (!categoryPattern.test(category.trim())) {
      errors.push('Category: Must contain only letters and spaces (no numbers or special characters).');
    }

    // Validate Image URL (must be a string and a valid URL)
    const urlPattern = /^(https?:\/\/[^\s$.?#].[^\s]*)$/;
    if (!imageUrl || imageUrl.trim().length === 0) {
      errors.push('Image URL: Please fill the field.');
    } else if (!urlPattern.test(imageUrl.trim())) {
      errors.push('Image URL: Must be a valid URL (e.g., https://example.com/image.jpg).');
    }

    // If there are errors, show them all in one alert
    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
      return false;
    }

    return true;
  };

  const handleAddMenu = async () => {
    // Perform validation before submitting
    if (!validateForm()) {
      return;
    }

    // Create FormData object
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('category', category);
    // Ensure imageUrl is explicitly a string and wrapped in quotes
    formData.append('imageUrl', String(imageUrl));
    console.log(imageUrl)
    // Log the FormData content for debugging
    console.log('FormData being sent:');
    for (let pair of formData._parts) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.ok) {
        const result = await response.json();
        Alert.alert('Success', 'Menu added successfully!');
        console.log('API Response:', result);
        // Reset form fields
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

export default AddMenu;