package com.library.management.service;

import com.library.management.entity.Donation;
import com.library.management.repository.DonationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DonationService {

    private final DonationRepository donationRepository;
    private final EmailService emailService;

    public List<Donation> getAllDonations() {
        return donationRepository.findAll();
    }

    public Donation recordDonation(Donation donation) {
        if (donation.getDonationDate() == null) {
            donation.setDonationDate(LocalDateTime.now());
        }
        
        Donation savedDonation = donationRepository.save(donation);
        
        // Send thank you email if donor email is provided
        if (savedDonation.getDonorEmail() != null && !savedDonation.getDonorEmail().isEmpty()) {
            String subject = "Thank You for Your Donation to Antigravity Library!";
            String body = String.format(
                "Dear %s,\n\n" +
                "Thank you so much for your generous donation of $%.2f to the Antigravity Library.\n" +
                "Your support helps us maintain our collection and provide better services to our community.\n\n" +
                "Your message: \"%s\"\n\n" +
                "With gratitude,\n" +
                "The Library Management Team",
                savedDonation.getDonorName() != null ? savedDonation.getDonorName() : "Anonymous",
                savedDonation.getAmount(),
                savedDonation.getMessage() != null ? savedDonation.getMessage() : "No message provided"
            );
            emailService.sendEmail(savedDonation.getDonorEmail(), subject, body);
        }
        
        return savedDonation;
    }
}
