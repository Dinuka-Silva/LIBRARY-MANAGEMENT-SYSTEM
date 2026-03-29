package com.library.management.controller;

import com.library.management.entity.Reservation;
import com.library.management.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping("/{bookId}/{memberId}")
    public Reservation reserveBook(@PathVariable String bookId, @PathVariable String memberId) {
        return reservationService.reserveBook(bookId, memberId);
    }

    @GetMapping("/book/{bookId}")
    public List<Reservation> getBookReservations(@PathVariable String bookId) {
        return reservationService.getReservationsByBook(bookId);
    }

    @GetMapping("/member/{memberId}")
    public List<Reservation> getMemberReservations(@PathVariable String memberId) {
        return reservationService.getMemberReservations(memberId);
    }

    @DeleteMapping("/{id}")
    public void cancelReservation(@PathVariable String id) {
        reservationService.cancelReservation(id);
    }
}
