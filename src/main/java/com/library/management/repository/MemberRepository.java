package com.library.management.repository;

import com.library.management.entity.Member;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MemberRepository extends MongoRepository<Member, String> {
    List<Member> findByNameContainingIgnoreCase(String name);
    boolean existsByEmail(String email);
    java.util.Optional<Member> findByEmail(String email);
}
