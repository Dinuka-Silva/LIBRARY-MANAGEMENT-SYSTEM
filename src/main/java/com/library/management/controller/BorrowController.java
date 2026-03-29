package com.library.management.controller;

import com.library.management.entity.BorrowRecord;
import com.library.management.service.BorrowService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/borrow")
@RequiredArgsConstructor
public class BorrowController {

    private final BorrowService borrowService;

    @GetMapping
    public List<BorrowRecord> getAllRecords() {
        return borrowService.getAllBorrowRecords();
    }

    @PostMapping("/{bookId}/{memberId}")
    public BorrowRecord borrowBook(@PathVariable String bookId, @PathVariable String memberId) {
        return borrowService.borrowBook(bookId, memberId);
    }

    @PostMapping("/return/{recordId}")
    public BorrowRecord returnBook(@PathVariable String recordId) {
        return borrowService.returnBook(recordId);
    }

    @GetMapping("/member/{memberId}")
    public List<BorrowRecord> getBorrowsByMember(@PathVariable String memberId) {
        return borrowService.getBorrowsByMember(memberId);
    }

    @PostMapping("/renew/{recordId}")
    public BorrowRecord renewBook(@PathVariable String recordId) {
        return borrowService.renewBook(recordId);
    }

    @PostMapping("/update-overdue")
    public void updateOverdue() {
        borrowService.updateOverdueRecords();
    }
}
