package com.library.management.repository;

import com.library.management.entity.Book;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends MongoRepository<Book, String> {
    List<Book> findByTitleContainingIgnoreCase(String title);
    List<Book> findByPrimaryAuthorContainingIgnoreCase(String author);
    List<Book> findByAuthorsContainingIgnoreCase(String author);
    List<Book> findByIsbn(String isbn);
    List<Book> findByIsbn13(String isbn13);
    List<Book> findByPublisherContainingIgnoreCase(String publisher);
    List<Book> findByLanguage(String language);
    List<Book> findByFormat(String format);
    List<Book> findByTagsContaining(String tag);
    List<Book> findByGenresContaining(String genre);
    List<Book> findByStatus(Book.BookStatus status);
    List<Book> findByIsFeaturedTrue();
    List<Book> findByIsPopularTrue();
    List<Book> findByIsNewArrivalTrue();
    List<Book> findByAverageRatingGreaterThanEqual(Double rating);
    List<Book> findByTotalBorrowsGreaterThan(Integer count);
    Optional<Book> findByGoogleBooksId(String googleBooksId);
    List<Book> findBySeriesNameContainingIgnoreCase(String seriesName);
}
