package com.recruitment.server.controller;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.recruitment.server.dto.report.CustomReportRequest;
import com.recruitment.server.dto.report.CustomReportResponse;
import com.recruitment.server.dto.report.ReportSummaryResponse;
import com.recruitment.server.service.ReportService;

import lombok.RequiredArgsConstructor;

import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.ExampleObject;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR')")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/summary")
    public ResponseEntity<ReportSummaryResponse> getSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reportService.getSummary(startDate, endDate));
    }

    @PostMapping("/custom")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(required = true, content = @Content(mediaType = "application/json", schema = @Schema(implementation = CustomReportRequest.class), examples = @ExampleObject(name = "CustomReport", value = "{\"startDate\":\"2026-01-01\",\"endDate\":\"2026-02-01\",\"positionIds\":[1,2],\"statuses\":[\"APPLIED\",\"SCREENING\"],\"skills\":[\"Java\",\"React\"],\"colleges\":[\"IIT\"],\"minExperience\":2,\"maxExperience\":6}")))
    public ResponseEntity<CustomReportResponse> runCustomReport(@RequestBody CustomReportRequest request) {
        return ResponseEntity.ok(reportService.getCustomReport(request));
    }
}
