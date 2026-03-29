package com.library.management.controller;

import com.library.management.entity.Book;
import com.library.management.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BookController {

    private final BookService bookService;

    // Basic CRUD
    @GetMapping
    public List<Book> getAllBooks() {
        return bookService.getAllBooks();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable String id) {
        return bookService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Book createBook(@RequestBody Book book) {
        return bookService.saveBook(book);
    }

    @PutMapping("/{id}")
    public Book updateBook(@PathVariable String id, @RequestBody Book updatedBook) {
        Book existing = bookService.getBookById(id);
        
        // Update all fields from the incoming book
        if (updatedBook.getTitle() != null) existing.setTitle(updatedBook.getTitle());
        if (updatedBook.getSubtitle() != null) existing.setSubtitle(updatedBook.getSubtitle());
        if (updatedBook.getAuthors() != null) existing.setAuthors(updatedBook.getAuthors());
        if (updatedBook.getPrimaryAuthor() != null) existing.setPrimaryAuthor(updatedBook.getPrimaryAuthor());
        if (updatedBook.getIsbn() != null) existing.setIsbn(updatedBook.getIsbn());
        if (updatedBook.getIsbn13() != null) existing.setIsbn13(updatedBook.getIsbn13());
        if (updatedBook.getPublisher() != null) existing.setPublisher(updatedBook.getPublisher());
        if (updatedBook.getPublishedDate() != null) existing.setPublishedDate(updatedBook.getPublishedDate());
        if (updatedBook.getEdition() != null) existing.setEdition(updatedBook.getEdition());
        if (updatedBook.getLanguage() != null) existing.setLanguage(updatedBook.getLanguage());
        if (updatedBook.getPageCount() != null) existing.setPageCount(updatedBook.getPageCount());
        if (updatedBook.getFormat() != null) existing.setFormat(updatedBook.getFormat());
        if (updatedBook.getDimensions() != null) existing.setDimensions(updatedBook.getDimensions());
        if (updatedBook.getWeight() != null) existing.setWeight(updatedBook.getWeight());
        if (updatedBook.getDescription() != null) existing.setDescription(updatedBook.getDescription());
        if (updatedBook.getShortDescription() != null) existing.setShortDescription(updatedBook.getShortDescription());
        if (updatedBook.getTags() != null) existing.setTags(updatedBook.getTags());
        if (updatedBook.getGenres() != null) existing.setGenres(updatedBook.getGenres());
        if (updatedBook.getTotalCopies() != null) existing.setTotalCopies(updatedBook.getTotalCopies());
        if (updatedBook.getCoverImageUrl() != null) existing.setCoverImageUrl(updatedBook.getCoverImageUrl());
        if (updatedBook.getAdditionalImages() != null) existing.setAdditionalImages(updatedBook.getAdditionalImages());
        if (updatedBook.getPdfUrl() != null) existing.setPdfUrl(updatedBook.getPdfUrl());
        if (updatedBook.getPreviewUrl() != null) existing.setPreviewUrl(updatedBook.getPreviewUrl());
        if (updatedBook.getCategory() != null) existing.setCategory(updatedBook.getCategory());
        if (updatedBook.getSubcategory() != null) existing.setSubcategory(updatedBook.getSubcategory());
        if (updatedBook.getReadingAge() != null) existing.setReadingAge(updatedBook.getReadingAge());
        if (updatedBook.getReadingLevel() != null) existing.setReadingLevel(updatedBook.getReadingLevel());
        if (updatedBook.getStatus() != null) existing.setStatus(updatedBook.getStatus());
        if (updatedBook.getLocation() != null) existing.setLocation(updatedBook.getLocation());
        if (updatedBook.getSeriesName() != null) existing.setSeriesName(updatedBook.getSeriesName());
        if (updatedBook.getSeriesNumber() != null) existing.setSeriesNumber(updatedBook.getSeriesNumber());
        if (updatedBook.getPurchasePrice() != null) existing.setPurchasePrice(updatedBook.getPurchasePrice());
        if (updatedBook.getRentalPrice() != null) existing.setRentalPrice(updatedBook.getRentalPrice());
        if (updatedBook.getIsFeatured() != null) existing.setIsFeatured(updatedBook.getIsFeatured());
        if (updatedBook.getIsPopular() != null) existing.setIsPopular(updatedBook.getIsPopular());
        if (updatedBook.getIsNewArrival() != null) existing.setIsNewArrival(updatedBook.getIsNewArrival());
        
        if (updatedBook.getAvailableCopies() != null) {
            existing.setAvailableCopies(updatedBook.getAvailableCopies());
        }
        return bookService.saveBook(existing);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable String id) {
        bookService.deleteBook(id);
        return ResponseEntity.noContent().build();
    }

    // Advanced Search
    @GetMapping("/search")
    public List<Book> searchBooks(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) String isbn) {
        return bookService.searchBooks(title, author, isbn);
    }

    @GetMapping("/search/genre")
    public List<Book> searchByGenre(@RequestParam String genre) {
        return bookService.searchByGenre(genre);
    }

    @GetMapping("/search/tag")
    public List<Book> searchByTag(@RequestParam String tag) {
        return bookService.searchByTag(tag);
    }

    @GetMapping("/search/publisher")
    public List<Book> searchByPublisher(@RequestParam String publisher) {
        return bookService.searchByPublisher(publisher);
    }

    @GetMapping("/search/language")
    public List<Book> searchByLanguage(@RequestParam String language) {
        return bookService.searchByLanguage(language);
    }

    @GetMapping("/search/format")
    public List<Book> searchByFormat(@RequestParam String format) {
        return bookService.searchByFormat(format);
    }

    // Featured & Popular Books
    @GetMapping("/featured")
    public List<Book> getFeaturedBooks() {
        return bookService.getFeaturedBooks();
    }

    @GetMapping("/popular")
    public List<Book> getPopularBooks() {
        return bookService.getPopularBooks();
    }

    @GetMapping("/new-arrivals")
    public List<Book> getNewArrivals() {
        return bookService.getNewArrivals();
    }

    @GetMapping("/top-rated")
    public List<Book> getTopRatedBooks(@RequestParam(defaultValue = "4.0") Double minRating) {
        return bookService.getTopRatedBooks(minRating);
    }

    @GetMapping("/most-borrowed")
    public List<Book> getMostBorrowedBooks(@RequestParam(defaultValue = "10") Integer minBorrows) {
        return bookService.getMostBorrowedBooks(minBorrows);
    }

    // Series Management
    @GetMapping("/series/{seriesName}")
    public List<Book> getBooksInSeries(@PathVariable String seriesName) {
        return bookService.getBooksInSeries(seriesName);
    }

    // Book Availability
    @GetMapping("/{id}/availability")
    public ResponseEntity<Map<String, Object>> checkAvailability(@PathVariable String id) {
        boolean available = bookService.isBookAvailable(id);
        Book book = bookService.getBookById(id);
        
        Map<String, Object> response = new HashMap<>();
        response.put("available", available);
        response.put("availableCopies", book.getAvailableCopies());
        response.put("totalCopies", book.getTotalCopies());
        response.put("status", book.getStatus());
        
        return ResponseEntity.ok(response);
    }

    // Book Actions
    @PostMapping("/{id}/view")
    public Book incrementViews(@PathVariable String id) {
        return bookService.incrementViews(id);
    }

    @PostMapping("/{id}/borrow")
    public Book incrementBorrows(@PathVariable String id) {
        return bookService.incrementBorrows(id);
    }

    @PostMapping("/{id}/return")
    public Book returnBook(@PathVariable String id) {
        return bookService.returnBook(id);
    }

    // Book Statistics
    @GetMapping("/{id}/stats")
    public ResponseEntity<Map<String, Object>> getBookStats(@PathVariable String id) {
        Book book = bookService.getBookById(id);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalViews", book.getTotalViews());
        stats.put("totalBorrows", book.getTotalBorrows());
        stats.put("averageRating", book.getAverageRating());
        stats.put("totalReviews", book.getTotalReviews());
        stats.put("totalRatings", book.getTotalRatings());
        stats.put("wishlistCount", book.getWishlistCount());
        stats.put("fiveStarCount", book.getFiveStarCount());
        stats.put("fourStarCount", book.getFourStarCount());
        stats.put("threeStarCount", book.getThreeStarCount());
        stats.put("twoStarCount", book.getTwoStarCount());
        stats.put("oneStarCount", book.getOneStarCount());
        
        return ResponseEntity.ok(stats);
    }
}
