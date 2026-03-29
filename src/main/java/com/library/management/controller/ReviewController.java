package com.library.management.controller;

import com.library.management.entity.Review;
import com.library.management.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;

    @GetMapping("/book/{bookId}")
    public List<Review> getBookReviews(@PathVariable String bookId) {
        return reviewService.getReviewsByBook(bookId);
    }

    @PostMapping
    public Review addReview(@RequestBody Review review) {
        return reviewService.addReview(review);
    }
}
