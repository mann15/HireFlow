package com.recruitment.server.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/interviews")
public class InterviewController {

    @PostMapping("/define-rounds")
    public ResponseEntity<?> defineInterviewRounds(@RequestBody Map<String, Object> roundsData) {
        // Logic to define interview rounds
        return ResponseEntity.ok("Interview rounds defined successfully");
    }

    @PostMapping("/schedule")
    public ResponseEntity<?> scheduleInterview(@RequestBody Map<String, Object> scheduleData) {
        // Logic to schedule interviews
        return ResponseEntity.ok("Interview scheduled successfully");
    }

    @PostMapping("/simulate-online")
    public ResponseEntity<?> simulateOnlineInterview(@RequestParam Long candidateId) {
        Random random = new Random();
        int marks = random.nextInt(101); // Random marks between 0 and 100
        return ResponseEntity.ok(Map.of("candidateId", candidateId, "marks", marks));
    }

    @PostMapping("/bulk-schedule")
    public ResponseEntity<?> scheduleBulkInterviews(@RequestBody Map<String, Object> bulkData) {
        // Logic to schedule bulk interviews
        return ResponseEntity.ok("Bulk interviews scheduled successfully");
    }
}