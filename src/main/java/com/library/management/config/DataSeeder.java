package com.library.management.config;

import com.library.management.entity.*;
import com.library.management.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final MemberRepository memberRepository;
    private final BookRepository bookRepository;
    private final MembershipPlanRepository membershipPlanRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Seed default admin user
        if (userRepository.findByEmail("admin@library.com").isEmpty()) {
            userRepository.save(User.builder()
                    .firstName("Library")
                    .lastName("Admin")
                    .email("admin@library.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .build());
        }

        // Seed default member user
        if (userRepository.findByEmail("user@library.com").isEmpty()) {
            userRepository.save(User.builder()
                    .firstName("Library")
                    .lastName("Member")
                    .email("user@library.com")
                    .password(passwordEncoder.encode("user123"))
                    .role(Role.USER)
                    .build());
        }

        // Seed another sample user
        if (userRepository.findByEmail("sample@user.com").isEmpty()) {
            userRepository.save(User.builder()
                    .firstName("Sample")
                    .lastName("User")
                    .email("sample@user.com")
                    .password(passwordEncoder.encode("sample123"))
                    .role(Role.USER)
                    .build());
        }

        // Create Member entities for these users if they don't exist
        userRepository.findAll().forEach(user -> {
            if (memberRepository.findByEmail(user.getEmail()).isEmpty()) {
                Member member = new Member();
                member.setName(user.getFirstName() + " " + user.getLastName());
                member.setEmail(user.getEmail());
                memberRepository.save(member);
            }
        });

        // Seed categories
        Category fiction = null;
        Category scifi = null;
        Category classic = null;
        
        if (categoryRepository.count() == 0) {
            fiction = categoryRepository.save(new Category(null, "Fiction", "General fiction books"));
            scifi = categoryRepository.save(new Category(null, "Sci-Fi", "Science fiction and fantasy"));
            classic = categoryRepository.save(new Category(null, "Classic", "Timeless literature"));
            categoryRepository.save(new Category(null, "Non-Fiction", "Real-world facts and information"));
            categoryRepository.save(new Category(null, "Biography", "Life stories of famous people"));
        } else {
            fiction = categoryRepository.findByName("Fiction").orElse(null);
            scifi = categoryRepository.findByName("Sci-Fi").orElse(null);
            classic = categoryRepository.findByName("Classic").orElse(null);
        }

        // Seed membership plans
        if (membershipPlanRepository.count() == 0) {
            membershipPlanRepository.save(buildPlan("Basic", 1, 0.0, 2));
            membershipPlanRepository.save(buildPlan("Standard", 6, 29.99, 5));
            membershipPlanRepository.save(buildPlan("Premium", 12, 49.99, 10));
        }

        // Seed sample books with enhanced details
        if (bookRepository.count() == 0) {
            bookRepository.save(buildEnhancedBook("The Great Gatsby", "F. Scott Fitzgerald", "978-0-7432-7356-5", 5, "https://images.unsplash.com/photo-1543004218-283020696700?q=80&w=200&auto=format&fit=crop", classic, 
                "The story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.", "Fiction", 4.2));
            bookRepository.save(buildEnhancedBook("To Kill a Mockingbird", "Harper Lee", "978-0-06-112008-4", 4, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=200&auto=format&fit=crop", classic,
                "A gripping tale of racial injustice and childhood innocence in the American South.", "Classic", 4.8));
            bookRepository.save(buildEnhancedBook("1984", "George Orwell", "978-0-452-28423-4", 6, "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=200&auto=format&fit=crop", scifi,
                "A dystopian masterpiece that explores the dangers of totalitarianism.", "Science Fiction", 4.6));
            bookRepository.save(buildEnhancedBook("Pride and Prejudice", "Jane Austen", "978-0-14-143951-8", 3, "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=200&auto=format&fit=crop", classic,
                "A romantic novel that critiques the British landed gentry at the end of the 18th century.", "Romance", 4.5));
            bookRepository.save(buildEnhancedBook("The Catcher in the Rye", "J.D. Salinger", "978-0-316-76948-0", 4, "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=200&auto=format&fit=crop", fiction,
                "A controversial novel about teenage angst and alienation.", "Coming of Age", 4.0));
            bookRepository.save(buildEnhancedBook("Brave New World", "Aldous Huxley", "978-0-06-085052-4", 5, "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=200&auto=format&fit=crop", scifi,
                "A futuristic society where citizens are genetically bred and conditioned.", "Dystopian", 4.3));
            bookRepository.save(buildEnhancedBook("The Hobbit", "J.R.R. Tolkien", "978-0-547-92822-7", 7, "https://images.unsplash.com/photo-1621351123081-08f979fe63f8?q=80&w=200&auto=format&fit=crop", fiction,
                "A fantasy adventure following Bilbo Baggins on an unexpected journey.", "Fantasy", 4.7));
        }
    }

    private MembershipPlan buildPlan(String name, int months, double price, int maxBooks) {
        MembershipPlan plan = new MembershipPlan();
        plan.setName(name);
        plan.setDurationMonths(months);
        plan.setPrice(price);
        plan.setMaxBooksAllowed(maxBooks);
        return plan;
    }

    private Book buildEnhancedBook(String title, String primaryAuthor, String isbn, int copies, String imageUrl, Category category, String description, String genre, double rating) {
        Book book = new Book();
        book.setTitle(title);
        book.setPrimaryAuthor(primaryAuthor);
        book.setAuthors(java.util.Arrays.asList(primaryAuthor));
        book.setIsbn(isbn);
        book.setTotalCopies(copies);
        book.setAvailableCopies(copies);
        book.setReservedCopies(0);
        book.setCoverImageUrl(imageUrl);
        book.setCategory(category);
        book.setDescription(description);
        book.setShortDescription(description.substring(0, Math.min(100, description.length())) + "...");
        book.setGenres(java.util.Arrays.asList(genre));
        book.setTags(java.util.Arrays.asList("classic", "recommended"));
        book.setAverageRating(rating);
        book.setTotalReviews((int)(rating * 10));
        book.setFormat("PAPERBACK");
        book.setLanguage("English");
        book.setPageCount(300 + (int)(Math.random() * 200));
        book.setPublisher("Classic Publishers");
        book.setStatus(Book.BookStatus.AVAILABLE);
        book.setLocation("Shelf " + (char)('A' + (int)(Math.random() * 4)) + "-" + (int)(Math.random() * 20));
        book.setIsPopular(rating >= 4.5);
        book.setIsFeatured(rating >= 4.7);
        book.setIsNewArrival(false);
        book.setTotalBorrows((int)(Math.random() * 100));
        book.setTotalViews((int)(Math.random() * 500));
        book.setWishlistCount((int)(Math.random() * 50));
        book.setPurchasePrice(9.99 + Math.random() * 20);
        book.setRentalPrice(2.99);
        return book;
    }
}
