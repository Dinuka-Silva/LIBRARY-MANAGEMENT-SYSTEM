package com.library.management.service;

import com.library.management.entity.Member;
import com.library.management.entity.Payment;
import com.library.management.repository.MemberRepository;
import com.library.management.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {
    
    private final PaymentRepository paymentRepository;
    private final MemberRepository memberRepository;

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Payment createPaymentIntent(String memberId, Double amount, String method, String description) {
        Member member = null;
        if (memberId != null) {
            member = memberRepository.findById(memberId).orElse(null);
        }

        Payment payment = new Payment();
        payment.setMember(member);
        payment.setAmount(amount);
        payment.setPaymentMethod(method);
        payment.setDescription(description);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setStatus(Payment.PaymentStatus.PENDING);
        
        // Simulate generating gateway identifiers
        String intentId = "pi_" + java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        String secret = "secret_" + java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 24);
        
        payment.setPaymentIntentId(intentId);
        payment.setClientSecret(secret);
        payment.setReferenceNumber("REF-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        
        return paymentRepository.save(payment);
    }

    public Payment confirmPayment(String paymentIntentId) {
        Payment payment = paymentRepository.findAll().stream()
                .filter(p -> paymentIntentId.equals(p.getPaymentIntentId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Payment Intent not found"));

        // Simulate external gateway processing success
        payment.setStatus(Payment.PaymentStatus.COMPLETED);
        payment.setTransactionId("TRX-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 1000));
        payment.setLastUpdate(LocalDateTime.now());
        
        return paymentRepository.save(payment);
    }

    public Payment processPayment(String memberId, Double amount, String method, String description) {
        Payment intent = createPaymentIntent(memberId, amount, method, description);
        return confirmPayment(intent.getPaymentIntentId());
    }
}
