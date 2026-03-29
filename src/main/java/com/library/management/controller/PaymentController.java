package com.library.management.controller;

import com.library.management.entity.Payment;
import com.library.management.service.PaymentService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping
    public List<Payment> getAllPayments() {
        return paymentService.getAllPayments();
    }

    @PostMapping
    public Payment processPayment(@RequestBody PaymentRequest request) {
        return paymentService.processPayment(
                request.getMemberId(),
                request.getAmount(),
                request.getPaymentMethod(),
                request.getDescription()
        );
    }

    @PostMapping("/create-intent")
    public Payment createIntent(@RequestBody PaymentRequest request) {
        return paymentService.createPaymentIntent(
                request.getMemberId(),
                request.getAmount(),
                request.getPaymentMethod(),
                request.getDescription()
        );
    }

    @PostMapping("/confirm")
    public Payment confirmPayment(@RequestParam String intentId) {
        return paymentService.confirmPayment(intentId);
    }

    @Data
    public static class PaymentRequest {
        private String memberId; // Can be null for anonymous donations
        private Double amount;
        private String paymentMethod;
        private String description;
    }
}
