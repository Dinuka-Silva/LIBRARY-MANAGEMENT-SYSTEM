package com.library.management.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "books")
public class Book {
    @Id
    private String id;

    private String title;
    private String subtitle;
    private List<String> authors;
    private String primaryAuthor;
    private String isbn;
    private String isbn13;
    
    // Enhanced publisher info
    private String publisher;
    private LocalDate publishedDate;
    private String edition;
    private String language;
    private Integer pageCount;
    
    // Physical details
    private String format; // HARDCOVER, PAPERBACK, EBOOK, AUDIOBOOK
    private String dimensions; // e.g., "6 x 9 inches"
    private String weight; // e.g., "1.2 lbs"
    
    // Enhanced description fields
    private String description;
    private String shortDescription;
    private List<String> tags;
    private List<String> genres;
    
    // Inventory management
    private Integer totalCopies;
    private Integer availableCopies;
    private Integer reservedCopies;
    private String location; // Shelf location in library
    
    // Media
    private String coverImageUrl;
    private List<String> additionalImages;
    private String pdfUrl;
    private String previewUrl;
    
    // Categorization
    @DBRef
    private Category category;
    private String subcategory;
    private Integer readingAge;
    private String readingLevel; // e.g., "Beginner", "Intermediate", "Advanced"
    
    // Ratings & Reviews
    @Builder.Default
    private Double averageRating = 0.0;
    @Builder.Default
    private Integer totalReviews = 0;
    @Builder.Default
    private Integer totalRatings = 0;
    @Builder.Default
    private Integer fiveStarCount = 0;
    @Builder.Default
    private Integer fourStarCount = 0;
    @Builder.Default
    private Integer threeStarCount = 0;
    @Builder.Default
    private Integer twoStarCount = 0;
    @Builder.Default
    private Integer oneStarCount = 0;
    
    // Engagement metrics
    @Builder.Default
    private Integer totalBorrows = 0;
    @Builder.Default
    private Integer totalViews = 0;
    @Builder.Default
    private Integer wishlistCount = 0;
    @Builder.Default
    private Boolean isPopular = false;
    @Builder.Default
    private Boolean isNewArrival = false;
    @Builder.Default
    private Boolean isFeatured = false;
    
    // Availability & Status
    @Builder.Default
    private BookStatus status = BookStatus.AVAILABLE;
    private LocalDate availableFrom;
    private LocalDate availableUntil;
    
    // Metadata
    private String addedBy;
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    // Pricing for purchases
    private Double purchasePrice;
    private Double rentalPrice;
    @Builder.Default
    private String currency = "USD";
    
    // Series information
    private String seriesName;
    private Integer seriesNumber;
    
    // External IDs
    private String googleBooksId;
    private String openLibraryId;
    private String goodreadsId;
    
    public enum BookStatus {
        AVAILABLE,
        CHECKED_OUT,
        RESERVED,
        DISCONTINUED,
        RESERVED_ONLY,
        COMING_SOON,
        LOST,
        DAMAGED
    }
    
    public enum BookFormat {
        HARDCOVER,
        PAPERBACK,
        EBOOK,
        AUDIOBOOK,
        MAGAZINE,
        JOURNAL
    }
}
