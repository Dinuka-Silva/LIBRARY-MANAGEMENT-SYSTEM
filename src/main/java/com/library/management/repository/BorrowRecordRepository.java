package com.library.management.repository;

import com.library.management.entity.BorrowRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BorrowRecordRepository extends MongoRepository<BorrowRecord, String> {
    List<BorrowRecord> findByMemberId(String memberId);
    List<BorrowRecord> findByBookId(String bookId);
    List<BorrowRecord> findByStatus(BorrowRecord.BorrowStatus status);
}
