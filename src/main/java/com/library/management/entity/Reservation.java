package com.library.management.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@Document(collection = "reservations")
@NoArgsConstructor
@AllArgsConstructor
public class Reservation {
    @Id
    private String id;

    @DBRef
    private Book book;

    @DBRef
    private Member member;

    private LocalDateTime reservationDate = LocalDateTime.now();
    private ReservationStatus status = ReservationStatus.PENDING;

    public enum ReservationStatus {
        PENDING,
        COMPLETED,
        CANCELLED,
        EXPIRED
    }
}
