package com.recruitment.server.service;

import com.recruitment.server.model.*;
import com.recruitment.server.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final CandidateRepository candidateRepository;
    private final JobRepository jobRepository;
    private final JobOffersRepository jobOffersRepository;
    private final JobApplicationRepository jobApplicationRepository;

    public Employee createEmployeeFromCandidate(Long candidateId, Long positionId, 
            Long offerId, String designation, String department, LocalDate joiningDate) {
        
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));

        JobPosition position = jobRepository.findById(positionId)
                .orElseThrow(() -> new RuntimeException("Position not found"));

        // Check if candidate already exists as employee
        if (employeeRepository.findByCandidateCandidateId(candidateId).isPresent()) {
            throw new RuntimeException("Candidate is already an employee");
        }

        JobOffers offer = null;
        if (offerId != null) {
            offer = jobOffersRepository.findById(offerId)
                    .orElseThrow(() -> new RuntimeException("Job offer not found"));
        }

        // Generate employee code
        String employeeCode = generateEmployeeCode();

        Employee employee = Employee.builder()
                .candidate(candidate)
                .position(position)
                .jobOffer(offer)
                .employeeCode(employeeCode)
                .designation(designation)
                .department(department)
                .salary(offer != null ? offer.getSalaryOffered() : null)
                .joiningDate(joiningDate)
                .status(Employee.EmploymentStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Employee savedEmployee = employeeRepository.save(employee);

        // Update candidate status
        candidate.setIsActive(false);
        candidateRepository.save(candidate);

        // Update application status to SELECTED and mark as joined
        List<JobApplication> applications = jobApplicationRepository
                .findByCandidateAndPosition(candidate, position);
        
        if (!applications.isEmpty()) {
            JobApplication application = applications.get(0);
            application.setStatus(JobApplication.Status.SELECTED);
            application.setCurrentStage("JOINED");
            application.setStatusUpdatedAt(LocalDateTime.now());
            jobApplicationRepository.save(application);
        }

        return savedEmployee;
    }

    private String generateEmployeeCode() {
        // Generate unique employee code
        // Format: EMP + Year + Sequential number
        String year = String.valueOf(LocalDate.now().getYear());
        long count = employeeRepository.count() + 1;
        return "EMP" + year + String.format("%05d", count);
    }

    public Employee updateEmployee(Long employeeId, Employee updatedEmployee) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        employee.setDesignation(updatedEmployee.getDesignation());
        employee.setDepartment(updatedEmployee.getDepartment());
        employee.setSalary(updatedEmployee.getSalary());
        employee.setStatus(updatedEmployee.getStatus());
        employee.setNotes(updatedEmployee.getNotes());
        employee.setUpdatedAt(LocalDateTime.now());

        return employeeRepository.save(employee);
    }

    public Employee relieveEmployee(Long employeeId, LocalDate relievingDate, String notes) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        employee.setStatus(Employee.EmploymentStatus.RESIGNED);
        employee.setRelievingDate(relievingDate);
        employee.setNotes(notes);
        employee.setUpdatedAt(LocalDateTime.now());

        return employeeRepository.save(employee);
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public List<Employee> getActiveEmployees() {
        return employeeRepository.findByStatus(Employee.EmploymentStatus.ACTIVE);
    }

    public List<Employee> getEmployeesByDepartment(String department) {
        return employeeRepository.findByDepartment(department);
    }

    public Employee getEmployeeById(Long employeeId) {
        return employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
    }

    public Employee getEmployeeByCode(String employeeCode) {
        return employeeRepository.findByEmployeeCode(employeeCode)
                .orElseThrow(() -> new RuntimeException("Employee not found with code: " + employeeCode));
    }

    public Employee getEmployeeByCandidate(Long candidateId) {
        return employeeRepository.findByCandidateCandidateId(candidateId)
                .orElseThrow(() -> new RuntimeException("No employee record found for this candidate"));
    }
}
