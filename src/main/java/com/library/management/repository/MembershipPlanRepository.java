package com.library.management.repository;

import com.library.management.entity.MembershipPlan;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MembershipPlanRepository extends MongoRepository<MembershipPlan, String> {
}
