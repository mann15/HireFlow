package com.recruitment.server.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDTO {
    private Long employeeId;
    private Long candidateId;
    private String candidateName;
    private Long positionId;
    private String positionTitle;
    private String employeeCode;
    private String designation;
    private String department;
    private BigDecimal salary;
    private LocalDate joiningDate;
    private String status;
    private LocalDate relievingDate;
    private String notes;
    private String email;
    private String phone;
}
