import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Platform, 
  Modal, ActivityIndicator, Image, Animated, RefreshControl 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../ThemeContext';
import { fetchBooks, createBook, deleteBook, updateBook, fetchCategories, searchBooks, fetchReviews, addReview, reserveBook, uploadFile, getFileUrl, borrowBook } from '../api';
import * as DocumentPicker from 'expo-document-picker';

export default function BooksScreen({ userRole, token, memberId }) {
  const { theme, isDarkMode } = useTheme();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  // New Book State with enhanced fields
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newIsbn, setNewIsbn] = useState('');
  const [newStock, setNewStock] = useState('1');
  const [newCoverUrl, setNewCoverUrl] = useState('');
  const [newCategory, setNewCategory] = useState(null);
  const [newPdfUrl, setNewPdfUrl] = useState('');
  const [newPublisher, setNewPublisher] = useState('');
  const [newPageCount, setNewPageCount] = useState('');
  const [newLanguage, setNewLanguage] = useState('English');
  const [newDescription, setNewDescription] = useState('');
  const [newGenres, setNewGenres] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [isAvailableOnly, setIsAvailableOnly] = useState(false);
  const [reservations, setReservations] = useState([]);
  
  // Toast notification state
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 3000);
  };

  const loadBooksData = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);
      const [booksData, categoriesData] = await Promise.all([
        fetchBooks(token),
        fetchCategories(token)
      ]);
      setBooks(booksData || []);
      setCategories(categoriesData || []);
    } catch (e) {
      setError(e.message);
      showToast('Failed to load books', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  const onRefresh = () => {
    setRefreshing(true);
    loadBooksData(true);
  };

  useEffect(() => { loadBooksData(); }, [loadBooksData]);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery) params.title = searchQuery;
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (isAvailableOnly) params.available = true;
      
      const data = await searchBooks(params, token);
      setBooks(data || []);
    } catch (e) {
      alert('Search failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery || selectedCategory !== 'All' || isAvailableOnly) {
        handleSearch();
      } else {
        loadBooksData();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, isAvailableOnly]);

  const handleAddOrUpdateBook = async () => {
    if (!newTitle || !newAuthor) {
      showToast('Please provide at least Title and Author!', 'warning');
      return;
    }
    try {
      setSaving(true);
      const bookData = {
        title: newTitle,
        primaryAuthor: newAuthor,
        author: newAuthor,
        isbn: newIsbn || 'N/A',
        totalCopies: parseInt(newStock) || 1,
        availableCopies: editingBook ? editingBook.availableCopies : (parseInt(newStock) || 1),
        coverImageUrl: newCoverUrl || '',
        category: newCategory,
        pdfUrl: newPdfUrl || '',
        publisher: newPublisher,
        pageCount: parseInt(newPageCount) || 0,
        language: newLanguage,
        description: newDescription,
        genres: newGenres,
      };

      if (editingBook) {
        await updateBook(editingBook.id, bookData, token);
        showToast('Book updated successfully!', 'success');
      } else {
        await createBook(bookData, token);
        showToast('Book added successfully!', 'success');
      }
      
      setShowAddModal(false);
      resetForm();
      loadBooksData();
    } catch (e) {
      showToast(editingBook ? 'Failed to update book' : 'Failed to add book', 'error');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setEditingBook(null);
    setNewTitle(''); 
    setNewAuthor(''); 
    setNewIsbn(''); 
    setNewStock('1'); 
    setNewCoverUrl(''); 
    setNewCategory(null); 
    setNewPdfUrl('');
    setNewPublisher('');
    setNewPageCount('');
    setNewLanguage('English');
    setNewDescription('');
    setNewGenres([]);
  };

  const handleDeleteBook = async (id, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteBook(id, token);
      showToast('Book deleted successfully!', 'success');
      loadBooksData();
    } catch (e) {
      showToast('Failed to delete book', 'error');
    }
  };

  const handleBorrow = async (book) => {
    if (!book || !memberId) {
      showToast('Login required to borrow books', 'warning');
      return;
    }
    if (book.availableCopies === 0) {
      showToast('Book is currently out of stock', 'warning');
      return;
    }
    try {
      setSaving(true);
      await borrowBook(book.id, memberId, token);
      showToast('Book borrowed successfully!', 'success');
      loadBooksData();
      if (showDetailsModal) setShowDetailsModal(false);
    } catch (e) {
      showToast(e.message || 'Failed to borrow book', 'error');
    } finally {
      setSaving(false);
    }
  };

  const openDetails = async (book) => {
    setSelectedBook(book);
    setShowDetailsModal(true);
    try {
      const [reviewsData, reservationsData] = await Promise.all([
        fetchReviews(book.id, token),
        userRole === 'admin' ? fetchBookReservations(book.id, token) : Promise.resolve([])
      ]);
      setReviews(reviewsData || []);
      setReservations(reservationsData || []);
    } catch (e) {
      console.warn('Details fetch failed');
    }
  };

  const handleReserve = async () => {
    if (!selectedBook || !memberId) {
      showToast('Login required to reserve books', 'warning');
      return;
    }
    try {
      setSaving(true);
      await reserveBook(selectedBook.id, memberId, token);
      showToast('Book reserved successfully!', 'success');
      setShowDetailsModal(false);
      loadBooksData();
    } catch (e) {
      showToast('Reservation failed: ' + e.message, 'error');
    } finally {
      setSaving(false);
    }
  };
   const handleReserveFromList = async (book) => {
    if (!book || !memberId) {
      showToast('Login required to reserve books', 'warning');
      return;
    }
    try {
      setSaving(true);
      await reserveBook(book.id, memberId, token);
      showToast('Book reserved successfully!', 'success');
      loadBooksData();
    } catch (e) {
      showToast('Reservation failed: ' + e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

   const openEditModal = (book) => {
    setEditingBook(book);
    setNewTitle(book.title);
    setNewAuthor(book.primaryAuthor || book.author);
    setNewIsbn(book.isbn);
    setNewStock(String(book.totalCopies));
    setNewCoverUrl(book.coverImageUrl || '');
    setNewCategory(book.category);
    setNewPdfUrl(book.pdfUrl || '');
    setNewPublisher(book.publisher || '');
    setNewPageCount(book.pageCount?.toString() || '');
    setNewLanguage(book.language || 'English');
    setNewDescription(book.description || '');
    setNewGenres(book.genres || []);
    setShowAddModal(true);
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>{t('fetchingStats')}</Text>
      </View>
    );
  }

  if (error && !loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <MaterialIcons name="error-outline" size={48} color="#EF4444" />
        <Text style={[styles.errorText, { color: theme.textSecondary }]}>{error}</Text>
        <TouchableOpacity style={[styles.retryBtn, { backgroundColor: theme.primary }]} onPress={loadBooksData}>
          <Text style={styles.retryText}>{t('refresh')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Toast Notification */}
      {toast.visible && (
        <View style={[styles.toastContainer, { backgroundColor: toast.type === 'error' ? '#EF4444' : toast.type === 'warning' ? '#F59E0B' : '#10B981' }]}>
          <MaterialIcons 
            name={toast.type === 'error' ? 'error' : toast.type === 'warning' ? 'warning' : 'check-circle'} 
            size={20} 
            color="#fff" 
          />
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{t('books')}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={[styles.refreshBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} 
            onPress={loadBooksData}
          >
            <MaterialIcons name="refresh" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
          {userRole === 'admin' && (
            <TouchableOpacity style={styles.addButton} onPress={() => { setEditingBook(null); setNewTitle(''); setNewAuthor(''); setNewIsbn(''); setNewStock('1'); setNewCoverUrl(''); setNewCategory(null); setShowAddModal(true); }}>
              <MaterialIcons name="add" size={20} color="#fff" />
              <Text style={styles.addText}>{t('add')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.filterBar}>
        <View style={[styles.searchContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <MaterialIcons name="search" size={24} color={theme.textMuted} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder={t('search') + "..."}
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={[styles.filterBtn, showFilters && styles.filterBtnActive]} onPress={() => setShowFilters(!showFilters)}>
          <MaterialIcons name="tune" size={20} color={showFilters ? "#fff" : "#94A3B8"} />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.advancedFilters}>
          <Text style={styles.filterLabel}>Category:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {['All', ...categories.map(c => c.name)].map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipActiveText]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.checkboxRow} onPress={() => setIsAvailableOnly(!isAvailableOnly)}>
            <View style={[styles.checkbox, isAvailableOnly && styles.checkboxChecked]}>
              {isAvailableOnly && <MaterialIcons name="check" size={14} color="#fff" />}
            </View>
            <Text style={styles.checkboxLabel}>Show Available Only</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView 
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" colors={["#4F46E5"]} />
        }
      >
        {books.length === 0 && !loading ? (
          <View style={styles.centered}>
            <MaterialIcons name="library-books" size={64} color="#334155" />
            <Text style={styles.emptyText}>No books found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        ) : books.map((book) => (
          <TouchableOpacity key={book.id} style={styles.bookCard} onPress={() => openDetails(book)}>
            <View style={styles.bookIcon}>
              {book.coverImageUrl ? (
                <Image source={{ uri: book.coverImageUrl }} style={styles.bookImage} />
              ) : (
                <MaterialIcons name="menu-book" size={32} color="#4F46E5" />
              )}
            </View>

            <View style={styles.bookInfo}>
              <View>
                <View style={styles.bookHeaderRow}>
                  <Text style={styles.bookTitle}>{book.title}</Text>
                  {book.category && (
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{book.category.name}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.bookAuthor}>by {book.primaryAuthor || book.author}</Text>
                
                {/* Genres */}
                {book.genres && book.genres.length > 0 && (
                  <View style={styles.genresRow}>
                    {book.genres.slice(0, 3).map((genre, idx) => (
                      <View key={idx} style={styles.genreTag}>
                        <Text style={styles.genreTagText}>{genre}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Publisher & Page Count */}
                <View style={styles.metaRow}>
                  {book.publisher && (
                    <Text style={styles.metaText}>{book.publisher}</Text>
                  )}
                  {book.pageCount && (
                    <Text style={styles.metaText}>• {book.pageCount} pages</Text>
                  )}
                  {book.language && (
                    <Text style={styles.metaText}>• {book.language}</Text>
                  )}
                </View>

                {book.averageRating > 0 && (
                  <View style={styles.ratingRow}>
                    <MaterialIcons name="star" size={14} color="#F59E0B" />
                    <Text style={styles.ratingText}>{book.averageRating.toFixed(1)} ({book.totalReviews})</Text>
                  </View>
                )}
              </View>

              <View style={styles.bookFooter}>
                <View style={[styles.stockBadge, book.availableCopies === 0 && styles.stockBadgeOut]}>
                  <Text style={[styles.stockText, book.availableCopies === 0 && styles.stockTextOut]}>
                    {book.availableCopies > 0 ? `${book.availableCopies}/${book.totalCopies} ${t('available')}` : t('outOfStock')}
                  </Text>
                </View>

                {userRole === 'admin' ? (
                  <View style={styles.adminActions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={(e) => { e.stopPropagation(); openEditModal(book); }}
                    >
                      <MaterialIcons name="edit" size={18} color="#94A3B8" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={(e) => { e.stopPropagation(); handleDeleteBook(book.id, book.title); }}
                    >
                      <MaterialIcons name="delete-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.userActions}>
                    {book.availableCopies > 0 ? (
                      <TouchableOpacity 
                        style={styles.quickBorrowBtn}
                        onPress={(e) => { e.stopPropagation(); handleBorrow(book); }}
                      >
                        <MaterialIcons name="add-shopping-cart" size={20} color="#4F46E5" />
                        <Text style={styles.quickBorrowText}>{t('borrowNow')}</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity 
                        style={[styles.quickBorrowBtn, { borderColor: theme.warning }]}
                        onPress={(e) => { e.stopPropagation(); handleReserveFromList(book); }}
                      >
                        <MaterialIcons name="bookmark-add" size={20} color={theme.warning} />
                        <Text style={[styles.quickBorrowText, { color: theme.warning }]}>{t('reserve')}</Text>
                      </TouchableOpacity>
                    )}
                    <MaterialIcons name="chevron-right" size={24} color="#334155" />
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Add New Book Modal */}
      {showAddModal && (
        <Modal transparent animationType="fade" visible={showAddModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingBook ? 'Edit Book' : 'Add New Book'}</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <MaterialIcons name="close" size={24} color="#F8FAFC" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.formInner}>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>{t('name')}</Text>
                    <TextInput style={styles.input} placeholder="Book Title" placeholderTextColor="#64748B" value={newTitle} onChangeText={setNewTitle} />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>{t('author')}</Text>
                    <TextInput style={styles.input} placeholder="Author Name" placeholderTextColor="#64748B" value={newAuthor} onChangeText={setNewAuthor} />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput 
                      style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
                      placeholder="Book description..." 
                      placeholderTextColor="#64748B" 
                      value={newDescription} 
                      onChangeText={setNewDescription}
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>ISBN (Optional)</Text>
                    <TextInput style={styles.input} placeholder="ISBN-13" placeholderTextColor="#64748B" value={newIsbn} onChangeText={setNewIsbn} />
                  </View>
                  <View style={styles.formRow}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.label}>{t('stock')}</Text>
                      <TextInput style={styles.input} keyboardType="numeric" value={newStock} onChangeText={setNewStock} />
                    </View>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.label}>{t('pages')}</Text>
                      <TextInput style={styles.input} keyboardType="numeric" placeholder="Page count" placeholderTextColor="#64748B" value={newPageCount} onChangeText={setNewPageCount} />
                    </View>
                  </View>
                  <View style={styles.formRow}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                       <Text style={styles.label}>{t('publisher')}</Text>
                      <TextInput style={styles.input} placeholder="Publisher name" placeholderTextColor="#64748B" value={newPublisher} onChangeText={setNewPublisher} />
                    </View>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                       <Text style={styles.label}>{t('language')}</Text>
                      <TextInput style={styles.input} placeholder="e.g., English" placeholderTextColor="#64748B" value={newLanguage} onChangeText={setNewLanguage} />
                    </View>
                  </View>
                  <View style={styles.formGroup}>
                     <Text style={styles.label}>{t('category')}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.formCategoryScroll}>
                      {categories.map(cat => (
                        <TouchableOpacity
                          key={cat.id}
                          style={[styles.smallChip, newCategory?.id === cat.id && styles.smallChipActive]}
                          onPress={() => setNewCategory(cat)}
                        >
                          <Text style={[styles.smallChipText, newCategory?.id === cat.id && styles.smallChipActiveText]}>{cat.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                  <View style={styles.formGroup}>
                     <Text style={styles.label}>{t('genres')}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.formCategoryScroll}>
                      {['Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Fantasy', 'Biography', 'History', 'Science', 'Technology'].map(genre => (
                        <TouchableOpacity
                          key={genre}
                          style={[styles.smallChip, newGenres.includes(genre) && styles.smallChipActive]}
                          onPress={() => {
                            if (newGenres.includes(genre)) {
                              setNewGenres(newGenres.filter(g => g !== genre));
                            } else {
                              setNewGenres([...newGenres, genre]);
                            }
                          }}
                        >
                          <Text style={[styles.smallChipText, newGenres.includes(genre) && styles.smallChipActiveText]}>{genre}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                  <View style={styles.formGroup}>
                     <Text style={styles.label}>{t('coverImageUrl')}</Text>
                    <TextInput style={styles.input} placeholder="https://example.com/image.jpg" placeholderTextColor="#64748B" value={newCoverUrl} onChangeText={setNewCoverUrl} />
                  </View>

                  <View style={styles.formGroup}>
                     <Text style={styles.label}>{t('digitalVersion')}</Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <TextInput 
                        style={[styles.input, { flex: 1 }]} 
                        placeholder="PDF URL or Path" 
                        placeholderTextColor="#64748B" 
                        value={newPdfUrl} 
                        editable={false} 
                      />
                      <TouchableOpacity 
                        style={styles.uploadBtn} 
                        onPress={async () => {
                          const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
                          if (!result.canceled) {
                            try {
                              setSaving(true);
                              const file = Platform.OS === 'web' ? result.assets[0].file : { uri: result.assets[0].uri, name: result.assets[0].name, type: 'application/pdf' };
                              const path = await uploadFile(file, token);
                              setNewPdfUrl(path);
                              showToast('PDF uploaded successfully!', 'success');
                            } catch (e) {
                              showToast('Upload failed: ' + e.message, 'error');
                            } finally {
                              setSaving(false);
                            }
                          }
                        }}
                      >
                        <MaterialIcons name="upload-file" size={20} color="#fff" />
                         <Text style={styles.uploadBtnText}>{t('upload')}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </ScrollView>

              <TouchableOpacity style={[styles.submitButton, saving && { opacity: 0.6 }]} onPress={handleAddOrUpdateBook} disabled={saving}>
                 {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>{editingBook ? t('updateBook') : t('saveBook')}</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
      {/* Book Details Modal */}
      {showDetailsModal && selectedBook && (
        <Modal transparent animationType="slide" visible={showDetailsModal}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, styles.detailsContent]}>
              <View style={styles.detailsHeader}>
                <TouchableOpacity style={styles.backBtn} onPress={() => setShowDetailsModal(false)}>
                  <MaterialIcons name="arrow-back" size={24} color="#F8FAFC" />
                </TouchableOpacity>
                 <Text style={styles.detailsTitle}>{t('bookDetails')}</Text>
                <View style={{ width: 40 }} />
              </View>

              <ScrollView style={styles.detailsScroll}>
                <View style={styles.detailsHero}>
                  <View style={styles.detailsCoverWrap}>
                    {selectedBook.coverImageUrl ? (
                      <Image source={{ uri: selectedBook.coverImageUrl }} style={styles.detailsCover} />
                    ) : (
                      <MaterialIcons name="menu-book" size={64} color="#4F46E5" />
                    )}
                  </View>
                  <Text style={styles.heroTitle}>{selectedBook.title}</Text>
                  <Text style={styles.heroAuthor}>{t('by')} {selectedBook.primaryAuthor || selectedBook.author}</Text>
                  
                  <View style={styles.heroBadges}>
                    {selectedBook.category && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{selectedBook.category.name}</Text>
                      </View>
                    )}
                    <View style={[styles.badge, { backgroundColor: 'rgba(16,185,129,0.1)' }]}>
                       <Text style={[styles.badgeText, { color: '#10B981' }]}>{t('isbn')}: {selectedBook.isbn}</Text>
                    </View>
                  </View>
                </View>

                {selectedBook.pdfUrl && (
                  <View style={styles.detailsSection}>
                     <Text style={styles.sectionTitle}>{t('digitalCopy')}</Text>
                    <TouchableOpacity 
                      style={styles.readButton} 
                      onPress={() => window.open(getFileUrl(selectedBook.pdfUrl), '_blank')}
                    >
                      <MaterialIcons name="picture-as-pdf" size={24} color="#fff" />
                       <Text style={styles.readText}>{t('readOnline')}</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.detailsSection}>
                   <Text style={styles.sectionTitle}>{t('availability')}</Text>
                  <View style={styles.availabilityBox}>
                    <View style={styles.availRow}>
                       <Text style={styles.availLabel}>{t('totalCopies')}:</Text>
                      <Text style={styles.availValue}>{selectedBook.totalCopies}</Text>
                    </View>
                    <View style={styles.availRow}>
                       <Text style={styles.availLabel}>{t('inStock')}:</Text>
                      <Text style={[styles.availValue, { color: selectedBook.availableCopies > 0 ? '#10B981' : '#EF4444' }]}>
                        {selectedBook.availableCopies}
                      </Text>
                    </View>
                    {selectedBook.availableCopies > 0 && userRole === 'user' && (
                      <TouchableOpacity style={styles.mainBorrowButton} onPress={() => handleBorrow(selectedBook)}>
                        <MaterialIcons name="add-shopping-cart" size={20} color="#fff" />
                        <Text style={styles.mainBorrowText}>{t('borrowNow')}</Text>
                      </TouchableOpacity>
                    )}
                    {selectedBook.availableCopies === 0 && (
                      <TouchableOpacity style={styles.reserveButton} onPress={handleReserve}>
                        <MaterialIcons name="event-seat" size={20} color="#fff" />
                        <Text style={styles.reserveText}>{t('reserve')}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <View style={styles.detailsSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Reviews & Ratings</Text>
                    {selectedBook.averageRating > 0 && (
                      <View style={styles.ratingBadge}>
                        <MaterialIcons name="star" size={16} color="#F59E0B" />
                        <Text style={styles.ratingBadgeText}>{selectedBook.averageRating.toFixed(1)}</Text>
                      </View>
                    )}
                  </View>
                  
                  {reviews.length === 0 ? (
                    <Text style={styles.noReviews}>No reviews yet. Be the first!</Text>
                  ) : reviews.map(review => (
                    <View key={review.id} style={styles.reviewCard}>
                      <View style={styles.reviewHeader}>
                        <Text style={styles.reviewerName}>{review.user?.firstName || 'Anonymous'}</Text>
                        <View style={styles.stars}>
                          {[1,2,3,4,5].map(s => (
                            <MaterialIcons key={s} name="star" size={12} color={s <= review.rating ? "#F59E0B" : "#334155"} />
                          ))}
                        </View>
                      </View>
                      <Text style={styles.reviewText}>{review.comment}</Text>
                    </View>
                  ))}
                </View>

                {userRole === 'admin' && (
                  <View style={styles.detailsSection}>
                    <Text style={styles.sectionTitle}>Reservation Queue ({reservations.length})</Text>
                    {reservations.length === 0 ? (
                      <Text style={styles.noReviews}>No active reservations</Text>
                    ) : (
                      <View style={styles.queueContainer}>
                        {reservations.map((res, idx) => (
                          <View key={res.id} style={styles.queueItem}>
                            <View style={styles.queueNumber}>
                              <Text style={styles.queueNumberText}>{idx + 1}</Text>
                            </View>
                            <View style={styles.queueInfo}>
                              <Text style={styles.queueMemberName}>{res.member?.firstName} {res.member?.lastName}</Text>
                              <Text style={styles.queueDate}>{new Date(res.reservationDate).toLocaleDateString()}</Text>
                            </View>
                            <View style={styles.queueStatus}>
                              <Text style={styles.queueStatusText}>{res.status}</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 16 },
  loadingText: { color: '#94A3B8', fontSize: 16 },
  errorText: { color: '#EF4444', fontSize: 16, textAlign: 'center' },
  emptyText: { color: '#64748B', fontSize: 16 },
  retryBtn: { backgroundColor: '#4F46E5', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: '700' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#F8FAFC' },
  refreshBtn: { padding: 8, backgroundColor: '#1E293B', borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
  addButton: { backgroundColor: '#4F46E5', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, gap: 8 },
  addText: { color: '#fff', fontWeight: '600' },
  uploadBtn: { backgroundColor: '#818CF8', paddingHorizontal: 16, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 6 },
  uploadBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  readButton: { backgroundColor: '#EF4444', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, gap: 12, marginTop: 8 },
  readText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  filterBar: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: '#334155' },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 14, color: '#F8FAFC', fontSize: 16, ...Platform.select({ web: { outlineStyle: 'none' } }) },
  filterBtn: { backgroundColor: '#1E293B', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#334155', justifyContent: 'center' },
  filterBtnActive: { backgroundColor: '#4F46E5', borderColor: '#818CF8' },
  advancedFilters: { backgroundColor: '#1E293B', borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#334155' },
  filterLabel: { color: '#94A3B8', fontSize: 12, textTransform: 'uppercase', fontWeight: '700', marginBottom: 12, letterSpacing: 0.5 },
  categoryScroll: { marginBottom: 16 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#0F172A', marginRight: 8, borderWidth: 1, borderColor: '#334155' },
  categoryChipActive: { backgroundColor: '#4F46E5', borderColor: '#818CF8' },
  categoryChipText: { color: '#94A3B8', fontWeight: '600', fontSize: 13 },
  categoryChipActiveText: { color: '#fff' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#334155', alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: '#10B981', borderColor: '#10B981' },
  checkboxLabel: { color: '#F8FAFC', fontSize: 14, fontWeight: '500' },
  listContainer: { paddingBottom: 40, gap: 16 },
  bookCard: { flexDirection: 'row', backgroundColor: '#1E293B', borderRadius: 16, borderWidth: 1, borderColor: '#334155', overflow: 'hidden', padding: 16, gap: 16 },
  bookIcon: { width: 80, height: 110, borderRadius: 10, backgroundColor: 'rgba(79,70,229,0.05)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(79,70,229,0.1)', overflow: 'hidden' },
  bookImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  bookInfo: { flex: 1, justifyContent: 'space-between' },
  bookHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  bookTitle: { fontSize: 18, fontWeight: '700', color: '#F8FAFC', flex: 1 },
  categoryBadge: { backgroundColor: 'rgba(129,140,248,0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  categoryBadgeText: { color: '#818CF8', fontSize: 11, fontWeight: '700' },
  bookAuthor: { fontSize: 14, color: '#94A3B8', marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { color: '#F59E0B', fontSize: 12, fontWeight: '700' },
  bookFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  stockBadge: { backgroundColor: 'rgba(16,185,129,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  stockBadgeOut: { backgroundColor: 'rgba(239,68,68,0.1)' },
  stockText: { color: '#10B981', fontWeight: '700', fontSize: 12 },
  stockTextOut: { color: '#EF4444' },
  adminActions: { flexDirection: 'row', gap: 8 },
  editButton: { backgroundColor: 'rgba(148,163,184,0.05)', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(148,163,184,0.1)' },
  deleteButton: { backgroundColor: 'rgba(239,68,68,0.05)', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(239,68,68,0.1)' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end', alignItems: 'center' },
  modalContent: { backgroundColor: '#1E293B', borderTopLeftRadius: 24, borderTopRightRadius: 24, width: '100%', maxWidth: 600, maxHeight: '90%', borderWidth: 1, borderColor: '#334155' },
  formScroll: { paddingHorizontal: 24 },
  formInner: { paddingBottom: 24 },
  detailsContent: { height: '90%', padding: 0 },
  detailsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#334155' },
  detailsTitle: { fontSize: 18, fontWeight: '800', color: '#F8FAFC' },
  backBtn: { padding: 8, backgroundColor: '#334155', borderRadius: 12 },
  detailsScroll: { flex: 1 },
  detailsHero: { alignItems: 'center', padding: 32, backgroundColor: '#0F172A' },
  detailsCoverWrap: { width: 140, height: 200, borderRadius: 16, backgroundColor: '#1E293B', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, marginBottom: 24, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  detailsCover: { width: '100%', height: '100%' },
  heroTitle: { fontSize: 24, fontWeight: '900', color: '#F8FAFC', textAlign: 'center', marginBottom: 8 },
  heroAuthor: { fontSize: 16, color: '#94A3B8', marginBottom: 16 },
  heroBadges: { flexDirection: 'row', gap: 10 },
  badge: { backgroundColor: 'rgba(79,70,229,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeText: { color: '#818CF8', fontSize: 12, fontWeight: '700' },
  detailsSection: { padding: 24, borderBottomWidth: 1, borderBottomColor: '#334155' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#F8FAFC', marginBottom: 16 },
  availabilityBox: { backgroundColor: '#0F172A', borderRadius: 16, padding: 20, gap: 12 },
  availRow: { flexDirection: 'row', justifyContent: 'space-between' },
  availLabel: { color: '#94A3B8', fontSize: 14 },
  availValue: { color: '#F8FAFC', fontWeight: '800', fontSize: 16 },
  reserveButton: { backgroundColor: '#4F46E5', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, gap: 10, marginTop: 8 },
  reserveText: { color: '#fff', fontWeight: '700' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245,158,11,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
  ratingBadgeText: { color: '#F59E0B', fontWeight: '800', fontSize: 14 },
  noReviews: { color: '#64748B', fontStyle: 'italic', textAlign: 'center', paddingVertical: 20 },
  reviewCard: { backgroundColor: '#1E293B', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  reviewerName: { color: '#F8FAFC', fontWeight: '700', fontSize: 14 },
  stars: { flexDirection: 'row' },
  reviewText: { color: '#94A3B8', fontSize: 14, lineHeight: 20 },
  // Toast Styles
  toastContainer: { position: 'absolute', top: 60, left: 20, right: 20, flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, zIndex: 9999, gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 10 },
  toastText: { color: '#fff', fontWeight: '600', fontSize: 14, flex: 1 },
  
  // Enhanced Book Card Styles
  genresRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  genreTag: { backgroundColor: 'rgba(79,70,229,0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  genreTagText: { color: '#818CF8', fontSize: 10, fontWeight: '600' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  metaText: { color: '#64748B', fontSize: 11 },
  emptySubtext: { color: '#475569', fontSize: 14, marginTop: 8 },
  formRow: { flexDirection: 'row', gap: 12 },
  label: { color: '#E2E8F0', marginBottom: 8, fontSize: 14, fontWeight: '500' },
  input: { backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155', borderRadius: 10, padding: 16, color: '#F8FAFC', fontSize: 16, ...Platform.select({ web: { outlineStyle: 'none' } }) },
  formCategoryScroll: { marginTop: 4 },
  smallChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#0F172A', marginRight: 8, borderWidth: 1, borderColor: '#334155' },
  smallChipActive: { backgroundColor: '#4F46E5', borderColor: '#818CF8' },
  smallChipText: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  smallChipActiveText: { color: '#fff' },
  submitButton: { backgroundColor: '#4F46E5', padding: 16, borderRadius: 10, alignItems: 'center', marginHorizontal: 24, marginBottom: 24, marginTop: 10 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingHorizontal: 24, paddingTop: 24 },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#F8FAFC' },
  queueContainer: { gap: 12 },
  queueItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
  queueNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#4F46E5', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  queueNumberText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  queueInfo: { flex: 1 },
  queueMemberName: { color: '#F8FAFC', fontWeight: '700', fontSize: 14 },
  queueDate: { color: '#64748B', fontSize: 12 },
  queueStatus: { backgroundColor: 'rgba(245,158,11,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  queueStatusText: { color: '#F59E0B', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  userActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  quickBorrowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(79,70,229,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  quickBorrowText: { color: '#818CF8', fontWeight: '700', fontSize: 13 },
  mainBorrowButton: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    marginTop: 15,
    gap: 10,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  mainBorrowText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
