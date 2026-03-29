package com.library.management.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.LocalDate;

@Data
@Document(collection = "members")
public class Member {
    @Id
    private String id;

    private String name;
    private String email;
    private String phone;
    
    @DBRef
    private MembershipPlan membershipPlan;
    
    private LocalDate membershipExpiryDate;
}
