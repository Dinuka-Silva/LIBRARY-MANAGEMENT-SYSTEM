package com.library.management.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

@Data
@Document(collection = "membership_plans")
public class MembershipPlan {
    @Id
    private String id;

    private String name;

    private Integer durationMonths;
    private Double price;
    private Integer maxBooksAllowed;
}
