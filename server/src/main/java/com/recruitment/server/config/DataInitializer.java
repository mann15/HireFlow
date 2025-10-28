package com.recruitment.server.config;

import com.recruitment.server.model.*;
import com.recruitment.server.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Profile("!test")
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final LocationsRepository locationsRepository;
    private final SkillsRepository skillsRepository;
    private final ProficiencyLevelsRepository proficiencyLevelsRepository;
    private final JobRepository jobRepository;
    private final JobLocationRepository jobLocationRepository;
    private final JobSkillsRequiredRepository jobSkillsRequiredRepository;
    private final CandidateRepository candidateRepository;
    private final CandidateSkillsRepository candidateSkillsRepository;
    private final CandidateCVRepository candidateCVRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final InterviewRoundRepository interviewRoundRepository;
    private final CandidateInterviewRepository candidateInterviewRepository;
    private final InterviewPanelRepository interviewPanelRepository;
    private final InterviewFeedbackRepository interviewFeedbackRepository;
    private final ScreeningFeedbackRepository screeningFeedbackRepository;
    private final JobOffersRepository jobOffersRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(RoleRepository roleRepository,
            UserRepository userRepository,
            LocationsRepository locationsRepository,
            SkillsRepository skillsRepository,
            ProficiencyLevelsRepository proficiencyLevelsRepository,
            JobRepository jobRepository,
            JobLocationRepository jobLocationRepository,
            JobSkillsRequiredRepository jobSkillsRequiredRepository,
            CandidateRepository candidateRepository,
            CandidateSkillsRepository candidateSkillsRepository,
            CandidateCVRepository candidateCVRepository,
            JobApplicationRepository jobApplicationRepository,
            InterviewRoundRepository interviewRoundRepository,
            CandidateInterviewRepository candidateInterviewRepository,
            InterviewPanelRepository interviewPanelRepository,
            InterviewFeedbackRepository interviewFeedbackRepository,
            ScreeningFeedbackRepository screeningFeedbackRepository,
            JobOffersRepository jobOffersRepository,
            PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.locationsRepository = locationsRepository;
        this.skillsRepository = skillsRepository;
        this.proficiencyLevelsRepository = proficiencyLevelsRepository;
        this.jobRepository = jobRepository;
        this.jobLocationRepository = jobLocationRepository;
        this.jobSkillsRequiredRepository = jobSkillsRequiredRepository;
        this.candidateRepository = candidateRepository;
        this.candidateSkillsRepository = candidateSkillsRepository;
        this.candidateCVRepository = candidateCVRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.interviewRoundRepository = interviewRoundRepository;
        this.candidateInterviewRepository = candidateInterviewRepository;
        this.interviewPanelRepository = interviewPanelRepository;
        this.interviewFeedbackRepository = interviewFeedbackRepository;
        this.screeningFeedbackRepository = screeningFeedbackRepository;
        this.jobOffersRepository = jobOffersRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Avoid inserting duplicates if run multiple times
        if (roleRepository.count() > 0) {
            return;
        }

        // Roles
        Role adminRole = roleRepository.save(Role.builder().roleName("ADMIN").build());
        Role recruiterRole = roleRepository.save(Role.builder().roleName("RECRUITER").build());
        Role interviewerRole = roleRepository.save(Role.builder().roleName("INTERVIEWER").build());

        // Users
        userRepository.save(User.builder()
                .email("admin@example.com")
                .password(passwordEncoder.encode("1234"))
                .firstName("System")
                .lastName("Admin")
                .role(adminRole)
                .isActive(true)
                .build());

        User recruiter = userRepository.save(User.builder()
                .email("recruiter@example.com")
                .password(passwordEncoder.encode("1234"))
                .firstName("Rita")
                .lastName("Recruiter")
                .role(recruiterRole)
                .isActive(true)
                .build());

        User interviewer = userRepository.save(User.builder()
                .email("interviewer@example.com")
                .password(passwordEncoder.encode("1234"))
                .firstName("Ilan")
                .lastName("Interviewer")
                .role(interviewerRole)
                .isActive(true)
                .build());

        // Locations
        Locations mumbai = locationsRepository
                .save(Locations.builder().city("Mumbai").country("India").state("Maharashtra").build());
        locationsRepository.save(Locations.builder().city("New Delhi").country("India").state("Delhi").build());

        // Skills
        Skills javaSkill = skillsRepository.save(Skills.builder().skillName("Java").category("Backend").build());
        Skills reactSkill = skillsRepository.save(Skills.builder().skillName("React").category("Frontend").build());

        // Proficiency levels
        ProficiencyLevels junior = proficiencyLevelsRepository
                .save(ProficiencyLevels.builder().levelName("Junior").description("Basic").rank(1).build());
        ProficiencyLevels mid = proficiencyLevelsRepository
                .save(ProficiencyLevels.builder().levelName("Mid").description("Intermediate").rank(2).build());
        ProficiencyLevels senior = proficiencyLevelsRepository
                .save(ProficiencyLevels.builder().levelName("Senior").description("Expert").rank(3).build());

        // Job position
        JobPosition backendDev = jobRepository.save(JobPosition.builder()
                .jobTitle("Backend Developer")
                .jobDescription("Work on server-side Java services.")
                .department("Engineering")
                .employmentType(JobPosition.EmploymentType.FULL_TIME)
                .experienceRequiredMin(2)
                .experienceRequiredMax(6)
                .salaryMin(new BigDecimal("50000"))
                .salaryMax(new BigDecimal("120000"))
                .totalPositions(2)
                .status(JobPosition.Status.OPEN)
                .createdBy(recruiter)
                .build());

        // Job locations
        jobLocationRepository.save(JobLocation.builder().location(mumbai).position(backendDev).build());

        // Job skills required
        jobSkillsRequiredRepository.save(JobSkillsRequired.builder()
                .position(backendDev)
                .skill(javaSkill)
                .proficiencyLevel(mid)
                .isMandatory(true)
                .weightage(new BigDecimal("0.7"))
                .build());

        jobSkillsRequiredRepository.save(JobSkillsRequired.builder()
                .position(backendDev)
                .skill(reactSkill)
                .proficiencyLevel(junior)
                .isMandatory(false)
                .weightage(new BigDecimal("0.3"))
                .build());

        // Candidates
        Candidate cand1 = candidateRepository.save(Candidate.builder()
                .email("alice@example.com")
                .firstName("Alice")
                .lastName("Anderson")
                .phone("+919876543210")
                .currentLocation("Mumbai")
                .preferredLocation("Mumbai")
                .totalExperience(new BigDecimal("3"))
                .isActive(true)
                .build());

        Candidate cand2 = candidateRepository.save(Candidate.builder()
                .email("bob@example.com")
                .firstName("Bob")
                .lastName("Builder")
                .phone("+919812345678")
                .currentLocation("New Delhi")
                .preferredLocation("New Delhi")
                .totalExperience(new BigDecimal("5"))
                .isActive(true)
                .build());

        // Candidate skills
        candidateSkillsRepository.save(CandidateSkills.builder()
                .candidate(cand1)
                .skill(javaSkill)
                .proficiencyLevel(mid)
                .yearsOfExperience(new BigDecimal("2"))
                .verified(true)
                .verifiedBy(recruiter)
                .build());

        candidateSkillsRepository.save(CandidateSkills.builder()
                .candidate(cand2)
                .skill(javaSkill)
                .proficiencyLevel(senior)
                .yearsOfExperience(new BigDecimal("5"))
                .verified(true)
                .verifiedBy(interviewer)
                .build());

        // Candidate CVs
        CandidateCV cv1 = candidateCVRepository.save(CandidateCV.builder()
                .candidate(cand1)
                .positionId(backendDev)
                .cvFilePath("/tmp/alice_cv.pdf")
                .build());

        // Job applications
        JobApplication app1 = jobApplicationRepository.save(JobApplication.builder()
                .candidate(cand1)
                .position(backendDev)
                .cv(cv1)
                .status(JobApplication.Status.APPLIED)
                .appliedAt(LocalDateTime.now())
                .statusUpdatedAt(LocalDateTime.now())
                .statusUpdatedBy(recruiter)
                .build());

        // Interview rounds
        InterviewRound round1 = interviewRoundRepository.save(InterviewRound.builder()
                .position(backendDev)
                .roundName("Technical Round 1")
                .roundType(InterviewRound.RoundType.TECHNICAL)
                .roundOrder(1)
                .durationMinutes(60)
                .isActive(true)
                .build());

        // Candidate interview
        CandidateInterview interview1 = candidateInterviewRepository.save(CandidateInterview.builder()
                .application(app1)
                .round(round1)
                .interviewMode(CandidateInterview.InterviewMode.ONLINE)
                .interviewDate(LocalDateTime.now().plusDays(3))
                .status(CandidateInterview.InterviewStatus.SCHEDULED)
                .user(interviewer)
                .scheduledAt(LocalDateTime.now())
                .build());

        // Interview panel
        interviewPanelRepository.save(InterviewPanel.builder()
                .interview(interview1)
                .panelist(interviewer)
                .build());

        // Interview feedback
        interviewFeedbackRepository.save(InterviewFeedback.builder()
                .interview(interview1)
                .panelist(interviewer)
                .feedback_comments("Good knowledge of core topics")
                .overall_rating(new BigDecimal("4.0"))
                .communication_skills(new BigDecimal("4.0"))
                .technical_knowledge(new BigDecimal("4.5"))
                .cultural_fit_rating(new BigDecimal("3.5"))
                .recommendation(InterviewFeedback.Recommendation.HIRE)
                .strengths("Problem solving, Core Java")
                .areas_of_improvement("System design")
                .build());

        // Screening feedback
        screeningFeedbackRepository.save(ScreeningFeedback.builder()
                .application(app1)
                .reviewer(recruiter)
                .comments("Looks promising")
                .score(new BigDecimal("80"))
                .recommendation(ScreeningFeedback.Recommendation.SHORTLIST)
                .reviewedAt(LocalDateTime.now())
                .build());

        // Job offer
        jobOffersRepository.save(JobOffers.builder()
                .application(app1)
                .salaryOffered(new BigDecimal("85000"))
                .offeredDesignation("Software Engineer")
                .joiningDate(LocalDate.now().plusWeeks(2))
                .offerLetterUrl("/tmp/offer_alice.pdf")
                .status(JobOffers.OfferStatus.GENERATED)
                .offerValidTill(LocalDate.now().plusDays(14))
                .createdBy(recruiter)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build());
    }
}
