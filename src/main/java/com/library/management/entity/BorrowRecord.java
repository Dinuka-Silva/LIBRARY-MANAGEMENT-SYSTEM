package com.library.management.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.LocalDate;

@Data
@Document(collection = "borrow_records")
public class BorrowRecord {
    @Id
    private String id;

    @DBRef
    private Book book;

    @DBRef
    private Member member;

    private LocalDate borrowDate;
    private LocalDate dueDate;
    private LocalDate returnDate;
    private BorrowStatus status;

    private Double fineAmount = 0.0;

    public enum BorrowStatus {
        BORROWED,
        RETURNED,
        OVERDUE
    }
}
