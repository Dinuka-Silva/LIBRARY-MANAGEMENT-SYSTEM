package com.library.management.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Document(collection = "donations")
public class Donation {
    @Id
    private String id;

    private String donorName;
    private String donorEmail;

    private Double amount;
    private LocalDateTime donationDate;

    private String message;
}
