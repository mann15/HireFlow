package com.recruitment.server.repository;

import com.recruitment.server.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmployeeCode(String employeeCode);
    
    Optional<Employee> findByCandidateCandidateId(Long candidateId);
    
    List<Employee> findByStatus(Employee.EmploymentStatus status);
    
    List<Employee> findByDepartment(String department);
    
    List<Employee> findByPositionPositionId(Long positionId);
}
