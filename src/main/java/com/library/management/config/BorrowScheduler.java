package com.library.management.config;

import com.library.management.service.BorrowService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class BorrowScheduler {

    private final BorrowService borrowService;

    // Run every day at midnight
    @Scheduled(cron = "0 0 0 * * ?")
    public void processOverdueFines() {
        log.info("Starting scheduled overdue fines processing...");
        try {
            borrowService.updateOverdueRecords();
            log.info("Finished overdue fines processing successfully.");
        } catch (Exception e) {
            log.error("Error during overdue fines processing: {}", e.getMessage());
        }
    }
}
