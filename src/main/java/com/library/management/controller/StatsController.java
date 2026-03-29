package com.library.management.controller;

import com.library.management.entity.Book;
import com.library.management.entity.BorrowRecord;
import com.library.management.entity.Donation;
import com.library.management.entity.Payment;
import com.library.management.repository.BookRepository;
import com.library.management.repository.BorrowRecordRepository;
import com.library.management.repository.DonationRepository;
import com.library.management.repository.MemberRepository;
import com.library.management.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final DonationRepository donationRepository;
    private final PaymentRepository paymentRepository;

    @GetMapping
    public Map<String, Object> getStats() {
        long totalBooks = bookRepository.count();
        long totalMembers = memberRepository.count();

        List<BorrowRecord> allBorrows = borrowRecordRepository.findAll();
        List<Donation> allDonations = donationRepository.findAll();
        List<Payment> allPayments = paymentRepository.findAll();
        List<Book> allBooks = bookRepository.findAll();

        long activeBorrows = allBorrows.stream()
                .filter(r -> r.getStatus() == BorrowRecord.BorrowStatus.BORROWED)
                .count();

        double totalDonations = allDonations.stream()
                .mapToDouble(d -> d.getAmount())
                .sum();

        double totalRevenue = allPayments.stream()
                .mapToDouble(p -> p.getAmount())
                .sum();

        long borrowedToday = allBorrows.stream()
                .filter(r -> r.getBorrowDate().equals(LocalDate.now()))
                .count();

        // 1. Popular Books (Top 5)
        List<Map<String, Object>> popularBooks = allBorrows.stream()
                .collect(Collectors.groupingBy(r -> r.getBook().getTitle(), Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("title", e.getKey());
                    map.put("count", e.getValue());
                    return map;
                })
                .collect(Collectors.toList());

        // 2. Borrows Per Month (Last 6 Months)
        List<Map<String, Object>> borrowsPerMonth = allBorrows.stream()
                .filter(r -> r.getBorrowDate().isAfter(LocalDate.now().minusMonths(6)))
                .collect(Collectors.groupingBy(r -> r.getBorrowDate().getMonth().toString(), Collectors.counting()))
                .entrySet().stream()
                .map(e -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("month", e.getKey().substring(0, 3));
                    map.put("count", e.getValue());
                    return map;
                })
                .collect(Collectors.toList());

        // 3. Category Distribution
        List<Map<String, Object>> categoryDistribution = allBooks.stream()
                .filter(b -> b.getCategory() != null)
                .collect(Collectors.groupingBy(b -> b.getCategory().getName(), Collectors.counting()))
                .entrySet().stream()
                .map(e -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("name", e.getKey());
                    map.put("count", e.getValue());
                    return map;
                })
                .collect(Collectors.toList());

        // 4. Member Activity (Top 5)
        List<Map<String, Object>> memberActivity = allBorrows.stream()
                .collect(Collectors.groupingBy(r -> r.getMember() != null ? r.getMember().getName() : "Unknown", Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("name", e.getKey());
                    map.put("count", e.getValue());
                    return map;
                })
                .collect(Collectors.toList());

        // 5. Monthly Financials (Donations + Payments)
        Map<String, Double> monthlyDonations = allDonations.stream()
                .collect(Collectors.groupingBy(d -> d.getDonationDate().getMonth().toString(), Collectors.summingDouble(Donation::getAmount)));
        Map<String, Double> monthlyPayments = allPayments.stream()
                .collect(Collectors.groupingBy(p -> p.getPaymentDate().getMonth().toString(), Collectors.summingDouble(Payment::getAmount)));

        java.util.Set<String> allMonths = new java.util.HashSet<>(monthlyDonations.keySet());
        allMonths.addAll(monthlyPayments.keySet());

        List<Map<String, Object>> financialHistory = allMonths.stream()
                .map(month -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("month", month.substring(0, 3));
                    map.put("donations", monthlyDonations.getOrDefault(month, 0.0));
                    map.put("payments", monthlyPayments.getOrDefault(month, 0.0));
                    return map;
                })
                .collect(Collectors.toList());

        // 6. Recent Books (Top 5 easiest proxy via latest added, assume sorting by ID desc or just limit since no date added property exists implicitly)
        List<Map<String, Object>> recentBooks = allBooks.stream()
                .sorted((b1, b2) -> b2.getId().compareTo(b1.getId())) // Assume higher ID is newer
                .limit(5)
                .map(b -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("title", b.getTitle());
                    map.put("author", b.getPrimaryAuthor());
                    map.put("category", b.getCategory() != null ? b.getCategory().getName() : "Unknown");
                    return map;
                })
                .collect(Collectors.toList());

        // 7. Revenue Type Breakdown
        List<Map<String, Object>> revenueBreakdown = List.of(
                Map.of("name", "Donations", "total", totalDonations, "color", "#F59E0B"),
                Map.of("name", "Payments", "total", totalRevenue, "color", "#14B8A6")
        );

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalBooks", totalBooks);
        stats.put("totalMembers", totalMembers);
        stats.put("activeBorrows", activeBorrows);
        stats.put("totalDonations", totalDonations);
        stats.put("totalRevenue", totalRevenue);
        stats.put("borrowedToday", borrowedToday);
        stats.put("popularBooks", popularBooks);
        stats.put("borrowsPerMonth", borrowsPerMonth);
        stats.put("categoryDistribution", categoryDistribution);
        stats.put("memberActivity", memberActivity);
        stats.put("financialHistory", financialHistory);
        stats.put("recentBooks", recentBooks);
        stats.put("revenueBreakdown", revenueBreakdown);
        return stats;
    }
}
