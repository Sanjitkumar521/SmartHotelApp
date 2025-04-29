import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import axios from 'axios';

const UpdateMenu = () => {
  const [menuId, setMenuId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isFetched, setIsFetched] = useState(false); // Track if menu is fetched

  // Fetch menu item details
  const fetchMenuItem = async () => {
    let errors = [];

    if (!menuId || menuId.trim().length === 0) {
      errors.push('Menu ID: Please fill the field.');
    } else {
      const menuIdValue = parseInt(menuId);
      const menuIdPattern = /^\d+$/;
      if (!menuIdPattern.test(menuId.trim())) {
        errors.push('Menu ID: Must be a valid number.');
      } else if (isNaN(menuIdValue) || menuIdValue <= 0) {
        errors.push('Menu ID: Must be a positive number greater than 0.');
      }
    }

    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
      return;
    }

    try {
      setIsFetching(true);
      const response = await axios.get(`http://192.168.18.50:8082/get_menu/${menuId}`);
      if (response.status === 200) {
        const { name, description, price, category, image_url } = response.data;
        setName(name || '');
        setDescription(description || '');
        setPrice(price ? price.toString() : '');
        setCategory(category || '');
        setImageUrl(image_url || '');
        setIsFetched(true); // Mark as fetched
      } else {
        Alert.alert('Error', 'Menu item not found');
        resetForm();
      }
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert('Error', 'Failed to fetch menu item');
      resetForm();
    } finally {
      setIsFetching(false);
    }
  };

  // Handle menuId change attempt
  const handleMenuIdChange = (text) => {
    if (isFetched) {
      Alert.alert('Cannot Edit Menu ID', 'You cannot update the Menu ID. Please fetch a new Menu ID to start over.');
      return;
    }
    setMenuId(text);
  };

  // Reset form fields
  const resetForm = () => {
    setMenuId('');
    setName('');
    setDescription('');
    setPrice('');
    setCategory('');
    setImageUrl('');
    setIsFetched(false); // Reset fetched state
  };

  // Validation function for update form
  const validateForm = () => {
    let errors = [];

    // Validate Menu ID
    if (!menuId || menuId.trim().length === 0) {
      errors.push('Menu ID: Please fill the field.');
    } else {
      const menuIdValue = parseInt(menuId);
      const menuIdPattern = /^\d+$/;
      if (!menuIdPattern.test(menuId.trim())) {
        errors.push('Menu ID: Must be a valid number.');
      } else if (isNaN(menuIdValue) || menuIdValue <= 0) {
        errors.push('Menu ID: Must be a positive number greater than 0.');
      }
    }

    // Validate Menu Name
    const namePattern = /^[A-Za-z\s]+$/;
    if (!name || name.trim().length === 0) {
      errors.push('Menu Name: Please fill the field.');
    } else if (name.trim().length < 3) {
      errors.push('Menu Name: Must be at least 3 characters long.');
    } else if (!namePattern.test(name.trim())) {
      errors.push('Menu Name: Must contain only letters and spaces (no numbers or special characters).');
    }

    // Validate Description
    const descriptionPattern = /^[A-Za-z\s,.!]+$/;
    if (!description || description.trim().length === 0) {
      errors.push('Description: Please fill the field.');
    } else if (description.trim().length < 10) {
      errors.push('Description: Must be at least 10 characters long.');
    } else if (!descriptionPattern.test(description.trim())) {
      errors.push('Description: Must contain only letters, spaces, and basic punctuation (e.g., commas, periods).');
    }

    // Validate Price
    if (!price || price.trim().length === 0) {
      errors.push('Price: Please fill the field.');
    } else {
      const priceValue = parseFloat(price);
      const pricePattern = /^\d+(\.\d{1,2})?$/;
      if (!pricePattern.test(price.trim())) {
        errors.push('Price: Must be a valid number (e.g., 10 or 10.99).');
      } else if (isNaN(priceValue) || priceValue <= 0) {
        errors.push('Price: Must be a positive number greater than 0.');
      }
    }

    // Validate Category
    const categoryPattern = /^[A-Za-z\s]+$/;
    if (!category || category.trim().length === 0) {
      errors.push('Category: Please fill the field.');
    } else if (category.trim().length < 3) {
      errors.push('Category: Must be at least 3 characters long.');
    } else if (!categoryPattern.test(category.trim())) {
      errors.push('Category: Must contain only letters and spaces (no numbers or special characters).');
    }

    // Validate Image URL
    const urlPattern = /^(https?:\/\/[^\s$.?#].[^\s]*)$/;
    if (!imageUrl || imageUrl.trim().length === 0) {
      errors.push('Image URL: Please fill the field.');
    } else if (!urlPattern.test(imageUrl.trim())) {
      errors.push('Image URL: Must be a valid URL (e.g., https://example.com/image.jpg).');
    }

    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
      return false;
    }

    return true;
  };

  // Handle form submission to update the menu item
  const handleUpdateMenu = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.put(`http://192.168.18.50:8082/update_menu/${menuId}`, {
        name,
        description,
        price: parseFloat(price),
        category,
        image_url: imageUrl,
      });

      if (response.status === 200) {
        Alert.alert('Success', 'Menu updated successfully');
        resetForm(); // Reset form after successful update
      }
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Failed to update menu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            <Text style={styles.title}>Update Menu</Text>

            {/* Menu ID */}
            <Text style={styles.label}>Menu Id</Text>
            <View style={styles.menuIdContainer}>
              <TextInput
                style={[styles.input, styles.menuIdInput, isFetched && styles.disabledInput]}
                placeholder="Enter Menu Id"
                value={menuId}
                onChangeText={handleMenuIdChange}
                keyboardType="numeric"
                editable={!isFetched} // Disable input after fetch
              />
              <TouchableOpacity
                style={[styles.fetchButton, isFetching && styles.disabledButton]}
                onPress={fetchMenuItem}
                disabled={isFetching}
              >
                <Text style={styles.buttonText}>
                  {isFetching ? 'Fetching...' : 'Fetch'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Menu Name */}
            <Text style={styles.label}>Menu Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter menu name"
              value={name}
              onChangeText={setName}
            />

            {/* Description */}
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter description"
              value={description}
              onChangeText={setDescription}
              multiline
            />

            {/* Price */}
            <Text style={styles.label}>Price in $</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter price"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />

            {/* Category */}
            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter category"
              value={category}
              onChangeText={setCategory}
            />

            {/* Image URL */}
            <Text style={styles.label}>Image URL</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter image URL"
              value={imageUrl}
              onChangeText={setImageUrl}
            />

            {/* Update Menu Button */}
            <TouchableOpacity
              style={[styles.updateButton, isLoading && styles.disabledButton]}
              onPress={handleUpdateMenu}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Updating...' : 'Update Menu'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5E050',
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  formContainer: {
    justifyContent: 'center',
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
  menuIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  menuIdInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: 10,
  },
  fetchButton: {
    backgroundColor: '#87CEEB',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  updateButton: {
    backgroundColor: '#FF5733',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#FF9999',
  },
  disabledInput: {
    backgroundColor: '#f0f0f0', // Gray background for disabled input
    color: '#666', // Gray text for disabled input
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UpdateMenu;