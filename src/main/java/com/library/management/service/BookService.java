package com.library.management.service;

import com.library.management.entity.Book;
import com.library.management.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BookService {
    
    private final BookRepository bookRepository;

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public Book saveBook(Book book) {
        if (book.getAvailableCopies() == null) {
            book.setAvailableCopies(book.getTotalCopies());
        }
        if (book.getReservedCopies() == null) {
            book.setReservedCopies(0);
        }
        book.setUpdatedAt(LocalDateTime.now());
        return bookRepository.save(book);
    }

    public void deleteBook(String id) {
        bookRepository.deleteById(id);
    }

    public Book getBookById(String id) {
        return bookRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));
    }

    public Optional<Book> findById(String id) {
        return bookRepository.findById(id);
    }

    public List<Book> searchBooks(String title, String author, String isbn) {
        if (title != null && !title.isEmpty()) {
            return bookRepository.findByTitleContainingIgnoreCase(title);
        }
        if (author != null && !author.isEmpty()) {
            return bookRepository.findByPrimaryAuthorContainingIgnoreCase(author);
        }
        if (isbn != null && !isbn.isEmpty()) {
            return bookRepository.findByIsbn(isbn);
        }
        return bookRepository.findAll();
    }

    // Advanced search methods
    public List<Book> searchByGenre(String genre) {
        return bookRepository.findByGenresContaining(genre);
    }

    public List<Book> searchByTag(String tag) {
        return bookRepository.findByTagsContaining(tag);
    }

    public List<Book> searchByPublisher(String publisher) {
        return bookRepository.findByPublisherContainingIgnoreCase(publisher);
    }

    public List<Book> searchByLanguage(String language) {
        return bookRepository.findByLanguage(language);
    }

    public List<Book> searchByFormat(String format) {
        return bookRepository.findByFormat(format);
    }

    public List<Book> findByStatus(Book.BookStatus status) {
        return bookRepository.findByStatus(status);
    }

    // Featured and popular books
    public List<Book> getFeaturedBooks() {
        return bookRepository.findByIsFeaturedTrue();
    }

    public List<Book> getPopularBooks() {
        return bookRepository.findByIsPopularTrue();
    }

    public List<Book> getNewArrivals() {
        return bookRepository.findByIsNewArrivalTrue();
    }

    public List<Book> getTopRatedBooks(Double minRating) {
        return bookRepository.findByAverageRatingGreaterThanEqual(minRating);
    }

    public List<Book> getMostBorrowedBooks(Integer minBorrows) {
        return bookRepository.findByTotalBorrowsGreaterThan(minBorrows);
    }

    // Book availability management
    public Book updateAvailability(String bookId, Integer availableCopies) {
        Book book = getBookById(bookId);
        book.setAvailableCopies(availableCopies);
        book.setUpdatedAt(LocalDateTime.now());
        return bookRepository.save(book);
    }

    public Book incrementViews(String bookId) {
        Book book = getBookById(bookId);
        book.setTotalViews(book.getTotalViews() + 1);
        return bookRepository.save(book);
    }

    public Book incrementBorrows(String bookId) {
        Book book = getBookById(bookId);
        book.setTotalBorrows(book.getTotalBorrows() + 1);
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        if (book.getAvailableCopies() <= 0) {
            book.setStatus(Book.BookStatus.CHECKED_OUT);
        }
        book.setUpdatedAt(LocalDateTime.now());
        return bookRepository.save(book);
    }

    public Book returnBook(String bookId) {
        Book book = getBookById(bookId);
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        if (book.getAvailableCopies() > 0) {
            book.setStatus(Book.BookStatus.AVAILABLE);
        }
        book.setUpdatedAt(LocalDateTime.now());
        return bookRepository.save(book);
    }

    // Rating management
    public Book updateRating(String bookId, Double newAverageRating, Integer totalReviews) {
        Book book = getBookById(bookId);
        book.setAverageRating(newAverageRating);
        book.setTotalReviews(totalReviews);
        book.setUpdatedAt(LocalDateTime.now());
        return bookRepository.save(book);
    }

    // Series management
    public List<Book> getBooksInSeries(String seriesName) {
        return bookRepository.findBySeriesNameContainingIgnoreCase(seriesName);
    }

    // Check availability
    public boolean isBookAvailable(String bookId) {
        Book book = getBookById(bookId);
        return book.getAvailableCopies() > 0 && 
               (book.getStatus() == Book.BookStatus.AVAILABLE || 
                book.getStatus() == Book.BookStatus.RESERVED_ONLY);
    }
}
