import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { API_ENDPOINTS, buildApiUrl } from '@/constants/api';

interface Category {
  id: string;
  name: string;
  [key: string]: any;
}

interface Document {
  id: string;
  title: string;
  path: string;
  [key: string]: any;
}

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Document[]>([]);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  // Load categories and all documents on mount
  useEffect(() => {
    loadCategories();
    loadAllDocuments();
  }, []);

  const loadCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const url = buildApiUrl(API_ENDPOINTS.CATEGORIES);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to load categories: ${response.statusText}`);
      }
      
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load categories. Please try again later.');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const loadAllDocuments = async () => {
    setIsSearching(true);
    try {
      const url = buildApiUrl(API_ENDPOINTS.DOCUMENTS);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to load documents: ${response.statusText}`);
      }
      
      const data = await response.json();
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading documents:', error);
      Alert.alert('Error', 'Failed to load documents. Please try again later.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // If query is empty, load all documents
      loadAllDocuments();
      return;
    }

    setIsSearching(true);
    try {
      const url = buildApiUrl(`${API_ENDPOINTS.DOCUMENTS_SEARCH}?q=${encodeURIComponent(searchQuery)}`);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error searching documents:', error);
      Alert.alert('Error', 'Failed to search documents. Please try again later.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDocumentPress = async (document: Document) => {
    if (!document.path) {
      Alert.alert('Error', 'Document path not available');
      return;
    }

    setIsLoadingImage(true);
    setIsImageModalVisible(true);
    
    try {
      // Build the image URL: /uploads/{filename}
      const imageUrl = buildApiUrl(`/uploads/${document.path}`);
      setSelectedImageUrl(imageUrl);
    } catch (error) {
      console.error('Error loading image:', error);
      Alert.alert('Error', 'Failed to load image. Please try again later.');
      setIsImageModalVisible(false);
    } finally {
      setIsLoadingImage(false);
    }
  };

  const closeImageModal = () => {
    setIsImageModalVisible(false);
    setSelectedImageUrl(null);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsDropdownOpen(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.searchSection}>
          <Text style={styles.label}>Search Documents</Text>
          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="Enter search query..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity
              style={[styles.searchButton, isSearching && styles.searchButtonDisabled]}
              onPress={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.searchButtonText}>Search</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.categorySection}>
          <Text style={styles.label}>Category</Text>
          <TouchableOpacity style={styles.dropdown} onPress={toggleDropdown}>
            <Text style={[styles.dropdownText, !selectedCategory && styles.dropdownPlaceholder]}>
              {selectedCategory ? selectedCategory.name : 'Select a category'}
            </Text>
            <Text style={styles.dropdownArrow}>{isDropdownOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {isDropdownOpen && (
            <View style={styles.dropdownMenu}>
              {isLoadingCategories ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#0a7ea4" />
                  <Text style={styles.loadingText}>Loading categories...</Text>
                </View>
              ) : categories.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No categories available</Text>
                </View>
              ) : (
                <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.dropdownItem,
                        selectedCategory?.id === category.id && styles.dropdownItemSelected,
                      ]}
                      onPress={() => selectCategory(category)}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          selectedCategory?.id === category.id && styles.dropdownItemTextSelected,
                        ]}
                      >
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          )}
        </View>

        {searchResults.length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>
              {searchQuery.trim() ? `Search Results (${searchResults.length})` : `All Documents (${searchResults.length})`}
            </Text>
            {searchResults.map((doc) => (
              <TouchableOpacity
                key={doc.id}
                style={styles.resultItem}
                onPress={() => handleDocumentPress(doc)}
                activeOpacity={0.7}
              >
                <Text style={styles.resultTitle}>{doc.title || 'Untitled Document'}</Text>
                {doc.description && (
                  <Text style={styles.resultDescription}>{doc.description}</Text>
                )}
                {doc.path && (
                  <Text style={styles.resultPath}>Path: {doc.path}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {!isSearching && searchResults.length === 0 && searchQuery.trim() === '' && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No documents found</Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={isImageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageModal}
      >
        <View style={styles.imageModalOverlay}>
          <TouchableOpacity
            style={styles.imageModalCloseButton}
            onPress={closeImageModal}
          >
            <Text style={styles.imageModalCloseText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.imageModalContent}>
            {isLoadingImage ? (
              <View style={styles.imageLoadingContainer}>
                <ActivityIndicator size="large" color="#0a7ea4" />
                <Text style={styles.imageLoadingText}>Loading image...</Text>
              </View>
            ) : selectedImageUrl ? (
              <Image
                source={{ uri: selectedImageUrl }}
                style={styles.imageView}
                contentFit="contain"
                transition={200}
              />
            ) : (
              <View style={styles.imageErrorContainer}>
                <Text style={styles.imageErrorText}>Failed to load image</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  searchSection: {
    marginBottom: 24,
  },
  categorySection: {
    marginBottom: 24,
    zIndex: 1000,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#11181C',
  },
  searchBar: {
    flexDirection: 'row',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  searchButton: {
    height: 48,
    paddingHorizontal: 20,
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    color: '#11181C',
  },
  dropdownPlaceholder: {
    color: '#999',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownList: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemSelected: {
    backgroundColor: '#e6f7ff',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#11181C',
  },
  dropdownItemTextSelected: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  resultsSection: {
    marginTop: 8,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#11181C',
  },
  resultItem: {
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  resultPath: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalCloseText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  imageModalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageView: {
    width: '100%',
    height: '100%',
  },
  imageLoadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  imageLoadingText: {
    color: '#fff',
    fontSize: 16,
  },
  imageErrorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  imageErrorText: {
    color: '#fff',
    fontSize: 16,
  },
});

