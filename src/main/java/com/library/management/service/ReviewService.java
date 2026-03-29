package com.library.management.service;

import com.library.management.entity.Book;
import com.library.management.entity.Review;
import com.library.management.repository.BookRepository;
import com.library.management.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final BookRepository bookRepository;

    public Review addReview(Review review) {
        Review saved = reviewRepository.save(review);
        updateBookRating(review.getBook().getId());
        return saved;
    }

    public List<Review> getReviewsByBook(String bookId) {
        return reviewRepository.findByBookId(bookId);
    }

    private void updateBookRating(String bookId) {
        List<Review> reviews = reviewRepository.findByBookId(bookId);
        Book book = bookRepository.findById(bookId).orElseThrow();
        
        double avg = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
        
        book.setAverageRating(avg);
        book.setTotalReviews(reviews.size());
        bookRepository.save(book);
    }
}
