package com.library.management.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Document(collection = "payments")
public class Payment {
    @Id
    private String id;

    @DBRef
    private Member member;

    private Double amount;
    private LocalDateTime paymentDate;
    private String paymentMethod; // e.g., "CREDIT_CARD", "PAYPAL"
    private PaymentStatus status;
    
    private String description;
    private String transactionId;
    private String referenceNumber;
    
    // Gateway specific fields
    private String paymentIntentId;
    private String clientSecret;
    private LocalDateTime lastUpdate;

    public enum PaymentStatus {
        PENDING,
        PROCESSING,
        COMPLETED,
        FAILED,
        CANCELLED
    }
}
