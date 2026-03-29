package com.library.management.repository;

import com.library.management.entity.Reservation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservationRepository extends MongoRepository<Reservation, String> {
    List<Reservation> findByBookIdAndStatus(String bookId, Reservation.ReservationStatus status);
    List<Reservation> findByMemberId(String memberId);
}
