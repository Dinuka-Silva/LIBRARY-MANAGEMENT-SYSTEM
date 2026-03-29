package com.library.management.service;

import com.library.management.entity.Book;
import com.library.management.entity.Member;
import com.library.management.entity.Reservation;
import com.library.management.repository.BookRepository;
import com.library.management.repository.MemberRepository;
import com.library.management.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;

    public Reservation reserveBook(String bookId, String memberId) {
        Book book = bookRepository.findById(bookId).orElseThrow(() -> new RuntimeException("Book not found"));
        Member member = memberRepository.findById(memberId).orElseThrow(() -> new RuntimeException("Member not found"));

        if (book.getAvailableCopies() > 0) {
            throw new RuntimeException("Book is currently available for borrowing. No need for reservation.");
        }

        Reservation reservation = new Reservation();
        reservation.setBook(book);
        reservation.setMember(member);
        reservation.setStatus(Reservation.ReservationStatus.PENDING);

        return reservationRepository.save(reservation);
    }

    public List<Reservation> getReservationsByBook(String bookId) {
        return reservationRepository.findByBookIdAndStatus(bookId, Reservation.ReservationStatus.PENDING);
    }

    public List<Reservation> getMemberReservations(String memberId) {
        return reservationRepository.findByMemberId(memberId);
    }

    public void cancelReservation(String reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        reservation.setStatus(Reservation.ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);
    }
}
