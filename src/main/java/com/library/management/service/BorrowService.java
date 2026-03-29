package com.library.management.service;

import com.library.management.entity.Book;
import com.library.management.entity.BorrowRecord;
import com.library.management.entity.Member;
import com.library.management.repository.BookRepository;
import com.library.management.repository.BorrowRecordRepository;
import com.library.management.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BorrowService {
    
    private final BorrowRecordRepository borrowRecordRepository;
    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;
    private final EmailService emailService;

    public List<BorrowRecord> getAllBorrowRecords() {
        return borrowRecordRepository.findAll();
    }

    public List<BorrowRecord> getBorrowsByMember(String memberId) {
        return borrowRecordRepository.findByMemberId(memberId);
    }

    public BorrowRecord borrowBook(String bookId, String memberId) {
        Book book = bookRepository.findById(bookId).orElseThrow(() -> new RuntimeException("Book not found"));
        Member member = memberRepository.findById(memberId).orElseThrow(() -> new RuntimeException("Member not found"));

        // Check borrow limits
        long activeBorrows = borrowRecordRepository.findAll().stream()
                .filter(r -> r.getMember() != null && r.getMember().getId().equals(memberId) && 
                            (r.getStatus() == BorrowRecord.BorrowStatus.BORROWED || 
                             r.getStatus() == BorrowRecord.BorrowStatus.OVERDUE))
                .count();

        if (member.getMembershipPlan() != null && activeBorrows >= member.getMembershipPlan().getMaxBooksAllowed()) {
            throw new RuntimeException("Borrowing limit reached for your membership plan: " + member.getMembershipPlan().getMaxBooksAllowed());
        }

        if (book.getAvailableCopies() <= 0) {
            throw new RuntimeException("Book is not available for borrowing");
        }

        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        BorrowRecord record = new BorrowRecord();
        record.setBook(book);
        record.setMember(member);
        record.setBorrowDate(LocalDate.now());
        record.setDueDate(LocalDate.now().plusDays(14)); // default 14 days
        record.setStatus(BorrowRecord.BorrowStatus.BORROWED);
        record.setFineAmount(0.0);

        BorrowRecord savedRecord = borrowRecordRepository.save(record);

        // Send confirmation email
        String memberEmail = member.getEmail();
        if (memberEmail != null && !memberEmail.isEmpty()) {
            String subject = "Book Borrowed: " + book.getTitle();
            String body = "Dear " + member.getName() + ",\n\n" +
                    "You have successfully borrowed '" + book.getTitle() + "'.\n" +
                    "Borrow Date: " + record.getBorrowDate() + "\n" +
                    "Due Date: " + record.getDueDate() + "\n\n" +
                    "Please return or renew it by the due date to avoid fines.\n\n" +
                    "Antigravity Library Team";
            emailService.sendEmail(memberEmail, subject, body);
        }

        return savedRecord;
    }

    public void updateOverdueRecords() {
        List<BorrowRecord> activeBorrows = borrowRecordRepository.findAll().stream()
                .filter(r -> r.getStatus() != BorrowRecord.BorrowStatus.RETURNED)
                .toList();

        LocalDate today = LocalDate.now();
        for (BorrowRecord record : activeBorrows) {
            if (record.getMember() == null) continue;
            if (today.isAfter(record.getDueDate())) {
                record.setStatus(BorrowRecord.BorrowStatus.OVERDUE);
                long daysOverdue = ChronoUnit.DAYS.between(record.getDueDate(), today);
                record.setFineAmount(daysOverdue * 1.0); // $1 per day fine
                borrowRecordRepository.save(record);

                // Send email notification
                String memberEmail = record.getMember().getEmail();
                if (memberEmail != null && !memberEmail.isEmpty()) {
                    String subject = "Overdue Book Reminder: " + record.getBook().getTitle();
                    String body = "Dear " + record.getMember().getName() + ",\n\n" +
                            "This is a reminder that the book '" + record.getBook().getTitle() + "' was due on " + record.getDueDate() + ".\n" +
                            "It is currently " + daysOverdue + " days overdue. A fine of $" + record.getFineAmount() + " has been applied.\n\n" +
                            "Please return it as soon as possible.\n\n" +
                            "Antigravity Library Team";
                    emailService.sendEmail(memberEmail, subject, body);
                }
            }
        }
    }

    public BorrowRecord returnBook(String recordId) {
        BorrowRecord record = borrowRecordRepository.findById(recordId).orElseThrow(() -> new RuntimeException("Record not found"));
        
        if (record.getStatus() == BorrowRecord.BorrowStatus.RETURNED) {
            throw new RuntimeException("Book already returned");
        }

        record.setStatus(BorrowRecord.BorrowStatus.RETURNED);
        record.setReturnDate(LocalDate.now());
        
        Book book = record.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);

        return borrowRecordRepository.save(record);
    }

    public BorrowRecord renewBook(String recordId) {
        BorrowRecord record = borrowRecordRepository.findById(recordId).orElseThrow(() -> new RuntimeException("Record not found"));
        
        if (record.getStatus() == BorrowRecord.BorrowStatus.RETURNED) {
            throw new RuntimeException("Cannot renew a returned book");
        }
        
        if (record.getStatus() == BorrowRecord.BorrowStatus.OVERDUE) {
            throw new RuntimeException("Cannot renew an overdue book. Please return it and pay fines first.");
        }

        // Extend due date by 7 days
        record.setDueDate(record.getDueDate().plusDays(7));
        BorrowRecord savedRecord = borrowRecordRepository.save(record);

        // Send renewal email
        String memberEmail = record.getMember().getEmail();
        if (memberEmail != null && !memberEmail.isEmpty()) {
            String subject = "Book Renewed: " + record.getBook().getTitle();
            String body = "Dear " + record.getMember().getName() + ",\n\n" +
                    "Your loan for '" + record.getBook().getTitle() + "' has been extended.\n" +
                    "New Due Date: " + record.getDueDate() + "\n\n" +
                    "Thank you for using the Antigravity Library!\n\n" +
                    "Antigravity Library Team";
            emailService.sendEmail(memberEmail, subject, body);
        }

        return savedRecord;
    }
}
