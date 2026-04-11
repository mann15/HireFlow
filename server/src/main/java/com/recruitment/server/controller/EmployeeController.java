package com.recruitment.server.controller;

import com.recruitment.server.model.Employee;
import com.recruitment.server.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.ExampleObject;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR')")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(required = true, content = @Content(mediaType = "application/json", schema = @Schema(implementation = Map.class), examples = @ExampleObject(name = "CreateEmployee", value = "{\"candidateId\":1,\"positionId\":1,\"offerId\":1,\"designation\":\"Software Engineer\",\"department\":\"Engineering\",\"joiningDate\":\"2026-03-01\"}")))
    public ResponseEntity<?> createEmployee(@RequestBody Map<String, Object> employeeData) {
        try {
            Long candidateId = Long.valueOf(employeeData.get("candidateId").toString());
            Long positionId = Long.valueOf(employeeData.get("positionId").toString());
            Long offerId = employeeData.get("offerId") != null
                    ? Long.valueOf(employeeData.get("offerId").toString())
                    : null;
            String designation = employeeData.get("designation").toString();
            String department = employeeData.get("department").toString();
            LocalDate joiningDate = LocalDate.parse(employeeData.get("joiningDate").toString());

            Employee employee = employeeService.createEmployeeFromCandidate(
                    candidateId, positionId, offerId, designation, department, joiningDate);

            return ResponseEntity.ok(employee);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR','RECRUITER','VIEWER')")
    public ResponseEntity<?> getAllEmployees(@RequestParam(required = false) String status,
            @RequestParam(required = false) String department) {
        try {
            List<Employee> employees;

            if (status != null) {
                employees = employeeService.getActiveEmployees();
            } else if (department != null) {
                employees = employeeService.getEmployeesByDepartment(department);
            } else {
                employees = employeeService.getAllEmployees();
            }

            return ResponseEntity.ok(employees);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR','RECRUITER','VIEWER')")
    public ResponseEntity<?> getEmployeeById(@PathVariable Long employeeId) {
        try {
            Employee employee = employeeService.getEmployeeById(employeeId);
            return ResponseEntity.ok(employee);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/code/{employeeCode}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR','RECRUITER','VIEWER')")
    public ResponseEntity<?> getEmployeeByCode(@PathVariable String employeeCode) {
        try {
            Employee employee = employeeService.getEmployeeByCode(employeeCode);
            return ResponseEntity.ok(employee);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/candidate/{candidateId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR','RECRUITER','VIEWER')")
    public ResponseEntity<?> getEmployeeByCandidate(@PathVariable Long candidateId) {
        try {
            Employee employee = employeeService.getEmployeeByCandidate(candidateId);
            return ResponseEntity.ok(employee);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR')")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(required = true, content = @Content(mediaType = "application/json", schema = @Schema(implementation = Employee.class), examples = @ExampleObject(name = "UpdateEmployee", value = "{\"employeeCode\":\"EMP-0001\",\"designation\":\"Senior Software Engineer\",\"department\":\"Engineering\",\"salary\":95000,\"status\":\"ACTIVE\",\"notes\":\"Promoted\",\"relievingDate\":\"2026-12-31\"}")))
    public ResponseEntity<?> updateEmployee(@PathVariable Long employeeId,
            @RequestBody Employee employeeData) {
        try {
            Employee employee = employeeService.updateEmployee(employeeId, employeeData);
            return ResponseEntity.ok(employee);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{employeeId}/relieve")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR')")
    public ResponseEntity<?> relieveEmployee(@PathVariable Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate relievingDate,
            @RequestParam(required = false) String notes) {
        try {
            Employee employee = employeeService.relieveEmployee(employeeId, relievingDate, notes);
            return ResponseEntity.ok(employee);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
