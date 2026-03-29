package com.library.management.controller;

import com.library.management.entity.Donation;
import com.library.management.service.DonationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/donations")
@RequiredArgsConstructor
public class DonationController {

    private final DonationService donationService;

    @GetMapping
    public List<Donation> getAllDonations() {
        return donationService.getAllDonations();
    }

    @PostMapping
    public Donation recordDonation(@RequestBody Donation donation) {
        return donationService.recordDonation(donation);
    }
}
