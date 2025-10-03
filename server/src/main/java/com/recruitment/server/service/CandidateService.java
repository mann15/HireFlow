package com.recruitment.server.service;

import com.recruitment.server.model.*;
import com.recruitment.server.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CandidateService {

    private final CandidateRepository candidateRepository;
    private final CandidateCVRepository candidateCVRepository;
    private final CandidateSkillsRepository candidateSkillsRepository;
    private final SkillsRepository skillsRepository;
    private final ProficiencyLevelsRepository proficiencyLevelsRepository;
    private final JobSkillsRequiredRepository jobSkillsRequiredRepository;
    private final JobRepository jobRepository;

    private static final String UPLOAD_DIR = "uploads/cvs/";

    // Create candidate profile manually
    public Candidate createCandidate(Candidate candidate) {
        candidate.setCreatedAt(LocalDateTime.now());
        candidate.setUpdatedAt(LocalDateTime.now());
        return candidateRepository.save(candidate);
    }

    // Upload CV for candidate
    public CandidateCV uploadCV(Long candidateId, Long positionId, MultipartFile file) throws IOException {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));

        JobPosition position = jobRepository.findById(positionId)
                .orElseThrow(() -> new RuntimeException("Position not found"));

        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String uniqueFilename = candidateId + "_" + positionId + "_" + System.currentTimeMillis() + fileExtension;

        // Save file
        Path filePath = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), filePath);

        // Create CV record
        CandidateCV candidateCV = CandidateCV.builder()
                .candidate(candidate)
                .positionId(position)
                .cvFilePath(filePath.toString())
                .build();

        return candidateCVRepository.save(candidateCV);
    }

    // Bulk upload candidates from Excel
    public List<Candidate> bulkUploadCandidates(List<Map<String, Object>> candidateData) {
        List<Candidate> candidates = new ArrayList<>();

        for (Map<String, Object> data : candidateData) {
            try {
                Candidate candidate = Candidate.builder()
                        .email((String) data.get("email"))
                        .firstName((String) data.get("firstName"))
                        .lastName((String) data.get("lastName"))
                        .phone((String) data.get("phone"))
                        .currentLocation((String) data.get("currentLocation"))
                        .preferredLocation((String) data.get("preferredLocation"))
                        .totalExperience(new BigDecimal(data.get("totalExperience").toString()))
                        .currentSalary(
                                data.get("currentSalary") != null ? new BigDecimal(data.get("currentSalary").toString())
                                        : null)
                        .expectedSalary(data.get("expectedSalary") != null
                                ? new BigDecimal(data.get("expectedSalary").toString())
                                : null)
                        .noticePeriod(
                                data.get("noticePeriod") != null ? Integer.parseInt(data.get("noticePeriod").toString())
                                        : null)
                        .source(Candidate.Source.valueOf((String) data.get("source")))
                        .sourceDetails((String) data.get("sourceDetails"))
                        .linkedinUrl((String) data.get("linkedinUrl"))
                        .githubUrl((String) data.get("githubUrl"))
                        .portfolioUrl((String) data.get("portfolioUrl"))
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();

                candidates.add(candidateRepository.save(candidate));
            } catch (Exception e) {
                // Log error and continue with next candidate
                System.err.println("Error processing candidate: " + e.getMessage());
            }
        }

        return candidates;
    }

    // Add skills to candidate
    public CandidateSkills addCandidateSkill(Long candidateId, Long skillId, Long proficiencyLevelId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));

        Skills skill = skillsRepository.findById(skillId)
                .orElseThrow(() -> new RuntimeException("Skill not found"));

        ProficiencyLevels proficiencyLevel = proficiencyLevelsRepository.findById(proficiencyLevelId)
                .orElseThrow(() -> new RuntimeException("Proficiency level not found"));

        CandidateSkills candidateSkill = CandidateSkills.builder()
                .candidate(candidate)
                .skill(skill)
                .proficiencyLevel(proficiencyLevel)
                .build();

        return candidateSkillsRepository.save(candidateSkill);
    }

    // Get all candidates
    public List<Candidate> getAllCandidates() {
        return candidateRepository.findByIsActiveTrue();
    }

    // Get candidate by ID
    public Optional<Candidate> getCandidateById(Long candidateId) {
        return candidateRepository.findById(candidateId);
    }

    // Search candidates by criteria
    public List<Candidate> searchCandidates(String name, String location, BigDecimal minExp,
            BigDecimal maxExp, BigDecimal maxSalary, List<String> skills) {
        List<Candidate> candidates = candidateRepository.findByIsActiveTrue();

        if (name != null && !name.isEmpty()) {
            candidates = candidates.stream()
                    .filter(c -> c.getFirstName().toLowerCase().contains(name.toLowerCase()) ||
                            c.getLastName().toLowerCase().contains(name.toLowerCase()))
                    .collect(Collectors.toList());
        }

        if (location != null && !location.isEmpty()) {
            candidates = candidates.stream()
                    .filter(c -> (c.getCurrentLocation() != null &&
                            c.getCurrentLocation().toLowerCase().contains(location.toLowerCase())) ||
                            (c.getPreferredLocation() != null &&
                                    c.getPreferredLocation().toLowerCase().contains(location.toLowerCase())))
                    .collect(Collectors.toList());
        }

        if (minExp != null) {
            candidates = candidates.stream()
                    .filter(c -> c.getTotalExperience().compareTo(minExp) >= 0)
                    .collect(Collectors.toList());
        }

        if (maxExp != null) {
            candidates = candidates.stream()
                    .filter(c -> c.getTotalExperience().compareTo(maxExp) <= 0)
                    .collect(Collectors.toList());
        }

        if (maxSalary != null) {
            candidates = candidates.stream()
                    .filter(c -> c.getExpectedSalary() != null &&
                            c.getExpectedSalary().compareTo(maxSalary) <= 0)
                    .collect(Collectors.toList());
        }

        return candidates;
    }

    // Find candidates matching job requirements
    public List<Candidate> findCandidatesForPosition(Long positionId) {
        JobPosition position = jobRepository.findById(positionId)
                .orElseThrow(() -> new RuntimeException("Position not found"));

        // Get required skills for the position
        List<JobSkillsRequired> requiredSkills = jobSkillsRequiredRepository.findByPosition(position);
        List<String> skillNames = requiredSkills.stream()
                .map(jsr -> jsr.getSkill().getSkillName())
                .collect(Collectors.toList());

        // Find candidates with matching skills
        List<Candidate> candidates = candidateRepository.findBySkillsIn(skillNames);

        // Filter by experience range
        if (position.getExperienceRequiredMin() != null || position.getExperienceRequiredMax() != null) {
            BigDecimal minExp = position.getExperienceRequiredMin() != null
                    ? BigDecimal.valueOf(position.getExperienceRequiredMin())
                    : BigDecimal.ZERO;
            BigDecimal maxExp = position.getExperienceRequiredMax() != null
                    ? BigDecimal.valueOf(position.getExperienceRequiredMax())
                    : BigDecimal.valueOf(100);

            candidates = candidates.stream()
                    .filter(c -> c.getTotalExperience().compareTo(minExp) >= 0 &&
                            c.getTotalExperience().compareTo(maxExp) <= 0)
                    .collect(Collectors.toList());
        }

        // Filter by salary range
        if (position.getSalaryMax() != null) {
            candidates = candidates.stream()
                    .filter(c -> c.getExpectedSalary() != null &&
                            c.getExpectedSalary().compareTo(position.getSalaryMax()) <= 0)
                    .collect(Collectors.toList());
        }

        return candidates;
    }

    // Update candidate profile
    public Candidate updateCandidate(Long candidateId, Candidate updatedCandidate) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));

        candidate.setFirstName(updatedCandidate.getFirstName());
        candidate.setLastName(updatedCandidate.getLastName());
        candidate.setPhone(updatedCandidate.getPhone());
        candidate.setAlternatePhone(updatedCandidate.getAlternatePhone());
        candidate.setCurrentLocation(updatedCandidate.getCurrentLocation());
        candidate.setPreferredLocation(updatedCandidate.getPreferredLocation());
        candidate.setTotalExperience(updatedCandidate.getTotalExperience());
        candidate.setCurrentSalary(updatedCandidate.getCurrentSalary());
        candidate.setExpectedSalary(updatedCandidate.getExpectedSalary());
        candidate.setNoticePeriod(updatedCandidate.getNoticePeriod());
        candidate.setSource(updatedCandidate.getSource());
        candidate.setSourceDetails(updatedCandidate.getSourceDetails());
        candidate.setLinkedinUrl(updatedCandidate.getLinkedinUrl());
        candidate.setGithubUrl(updatedCandidate.getGithubUrl());
        candidate.setPortfolioUrl(updatedCandidate.getPortfolioUrl());
        candidate.setUpdatedAt(LocalDateTime.now());

        return candidateRepository.save(candidate);
    }

    // Deactivate candidate
    public void deactivateCandidate(Long candidateId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));

        candidate.setIsActive(false);
        candidate.setUpdatedAt(LocalDateTime.now());
        candidateRepository.save(candidate);
    }

    // Get candidate's CVs
    public List<CandidateCV> getCandidateCVs(Long candidateId) {
        return candidateCVRepository.findByCandidateId(candidateId);
    }

    // Get candidate's skills
    public List<CandidateSkills> getCandidateSkills(Long candidateId) {
        return candidateSkillsRepository.findByCandidate_CandidateId(candidateId);
    }
}
