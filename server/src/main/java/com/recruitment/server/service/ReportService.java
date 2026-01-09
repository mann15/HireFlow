package com.recruitment.server.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import com.recruitment.server.dto.report.CandidateProcessSummaryDTO;
import com.recruitment.server.dto.report.CollegeReportDTO;
import com.recruitment.server.dto.report.CustomReportRequest;
import com.recruitment.server.dto.report.CustomReportResponse;
import com.recruitment.server.dto.report.CustomReportRowDTO;
import com.recruitment.server.dto.report.DailySummaryDTO;
import com.recruitment.server.dto.report.ExperienceBucketDTO;
import com.recruitment.server.dto.report.InterviewerSummaryDTO;
import com.recruitment.server.dto.report.PositionReportDTO;
import com.recruitment.server.dto.report.ReportSummaryResponse;
import com.recruitment.server.dto.report.TechnologyProfileDTO;
import com.recruitment.server.model.Candidate;
import com.recruitment.server.model.CandidateInterview;
import com.recruitment.server.model.CandidateSkills;
import com.recruitment.server.model.InterviewFeedback;
import com.recruitment.server.model.InterviewPanel;
import com.recruitment.server.model.JobApplication;
import com.recruitment.server.model.JobPosition;
import com.recruitment.server.model.User;
import com.recruitment.server.repository.CandidateInterviewRepository;
import com.recruitment.server.repository.CandidateSkillsRepository;
import com.recruitment.server.repository.InterviewFeedbackRepository;
import com.recruitment.server.repository.InterviewPanelRepository;
import com.recruitment.server.repository.JobApplicationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final JobApplicationRepository jobApplicationRepository;
    private final CandidateInterviewRepository candidateInterviewRepository;
    private final InterviewPanelRepository interviewPanelRepository;
    private final InterviewFeedbackRepository interviewFeedbackRepository;
    private final CandidateSkillsRepository candidateSkillsRepository;

    public ReportSummaryResponse getSummary(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime end = endDate != null ? endDate.atTime(LocalTime.MAX) : null;

        List<JobApplication> applications = jobApplicationRepository.findAllForReporting(start, end);
        Map<Long, Candidate> candidateById = applications.stream()
                .map(JobApplication::getCandidate)
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(Candidate::getCandidateId, c -> c, (a, b) -> a));

        Map<Long, List<CandidateSkills>> skillsByCandidate = loadSkills(candidateById.keySet());

        List<PositionReportDTO> positionReports = buildPositionReports(applications);
        CandidateProcessSummaryDTO processSummary = buildProcessSummary(applications);
        List<CollegeReportDTO> collegeReports = buildCollegeReports(applications);
        List<DailySummaryDTO> dailySummaries = buildDailySummaries(applications);
        List<TechnologyProfileDTO> technologyProfiles = buildTechnologyProfiles(skillsByCandidate);
        List<ExperienceBucketDTO> experienceBuckets = buildExperienceBuckets(candidateById.values());
        List<InterviewerSummaryDTO> interviewerSummaries = buildInterviewerSummary(start, end);

        return new ReportSummaryResponse(positionReports, collegeReports, processSummary, interviewerSummaries,
                dailySummaries, technologyProfiles, experienceBuckets);
    }

    public CustomReportResponse getCustomReport(CustomReportRequest request) {
        LocalDateTime start = request.getStartDate() != null ? request.getStartDate().atStartOfDay() : null;
        LocalDateTime end = request.getEndDate() != null ? request.getEndDate().atTime(LocalTime.MAX) : null;

        List<JobApplication> applications = jobApplicationRepository.findAllForReporting(start, end);

        // Preload skills for skill filtering and optional enrichment
        Map<Long, List<CandidateSkills>> skillsByCandidate = loadSkills(applications.stream()
                .map(JobApplication::getCandidate)
                .filter(Objects::nonNull)
                .map(Candidate::getCandidateId)
                .collect(Collectors.toSet()));

        List<JobApplication> filtered = applications.stream()
                .filter(app -> filterByPositions(app, request.getPositionIds()))
                .filter(app -> filterByStatuses(app, request.getStatuses()))
                .filter(app -> filterByColleges(app, request.getColleges()))
                .filter(app -> filterByExperience(app, request.getMinExperience(), request.getMaxExperience()))
                .filter(app -> filterBySkills(app, skillsByCandidate, request.getSkills()))
                .toList();

        List<CustomReportRowDTO> rows = filtered.stream()
                .map(app -> new CustomReportRowDTO(
                        app.getApplicationId(),
                        fullName(app.getCandidate()),
                        app.getCandidate() != null ? app.getCandidate().getEmail() : null,
                        app.getPosition() != null ? app.getPosition().getJobTitle() : null,
                        app.getStatus(),
                        app.getAppliedAt(),
                        app.getCandidate() != null ? app.getCandidate().getTotalExperience() : null,
                        app.getCandidate() != null ? app.getCandidate().getCollegeName() : null))
                .toList();

        CandidateProcessSummaryDTO summary = buildProcessSummary(filtered);
        return new CustomReportResponse(rows, summary);
    }

    private Map<Long, List<CandidateSkills>> loadSkills(Collection<Long> candidateIds) {
        if (CollectionUtils.isEmpty(candidateIds)) {
            return Map.of();
        }
        List<CandidateSkills> allSkills = candidateSkillsRepository.findByCandidate_CandidateIdIn(
                new ArrayList<>(candidateIds));
        return allSkills.stream().collect(Collectors.groupingBy(cs -> cs.getCandidate().getCandidateId()));
    }

    private List<PositionReportDTO> buildPositionReports(List<JobApplication> applications) {
        Map<Long, PositionAccumulator> accumulatorMap = new HashMap<>();

        applications.forEach(app -> {
            JobPosition position = app.getPosition();
            if (position == null) {
                return;
            }
            PositionAccumulator acc = accumulatorMap.computeIfAbsent(position.getPositionId(),
                    id -> new PositionAccumulator(position.getPositionId(), position.getJobTitle(),
                            position.getDepartment()));
            acc.bump(app.getStatus());
        });

        return accumulatorMap.values().stream()
                .sorted(Comparator.comparing(PositionAccumulator::positionId))
                .map(PositionAccumulator::toDto)
                .toList();
    }

    private CandidateProcessSummaryDTO buildProcessSummary(Collection<JobApplication> applications) {
        StatusAccumulator acc = new StatusAccumulator();
        applications.forEach(app -> acc.bump(app.getStatus()));
        return acc.toSummary();
    }

    private List<CollegeReportDTO> buildCollegeReports(List<JobApplication> applications) {
        Map<String, CollegeAccumulator> accMap = new HashMap<>();
        applications.forEach(app -> {
            Candidate candidate = app.getCandidate();
            if (candidate == null) {
                return;
            }
            String college = candidate.getCollegeName();
            if (college == null || college.isBlank()) {
                college = "Unknown";
            }
            CollegeAccumulator acc = accMap.computeIfAbsent(college, c -> new CollegeAccumulator(c));
            acc.bumpCandidate(candidate.getCandidateId());
            acc.bumpApplications();
        });
        return accMap.values().stream()
                .sorted(Comparator.comparing(CollegeAccumulator::collegeName))
                .map(CollegeAccumulator::toDto)
                .toList();
    }

    private List<DailySummaryDTO> buildDailySummaries(List<JobApplication> applications) {
        Map<LocalDate, StatusAccumulator> acc = new HashMap<>();
        applications.forEach(app -> {
            LocalDate date = app.getAppliedAt() != null ? app.getAppliedAt().toLocalDate() : null;
            if (date == null) {
                return;
            }
            StatusAccumulator dayAcc = acc.computeIfAbsent(date, d -> new StatusAccumulator());
            dayAcc.bump(app.getStatus());
        });
        return acc.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> e.getValue().toDaily(e.getKey()))
                .toList();
    }

    private List<TechnologyProfileDTO> buildTechnologyProfiles(Map<Long, List<CandidateSkills>> skillsByCandidate) {
        Map<String, TechAccumulator> acc = new HashMap<>();
        skillsByCandidate.values().forEach(list -> list.forEach(cs -> {
            String skillName = cs.getSkill() != null ? cs.getSkill().getSkillName() : null;
            if (skillName == null) {
                return;
            }
            TechAccumulator tech = acc.computeIfAbsent(skillName, TechAccumulator::new);
            tech.bumpCandidate(cs.getCandidate().getCandidateId(), cs.getYearsOfExperience(), cs.getVerified());
        }));

        return acc.values().stream()
                .sorted(Comparator.comparing(TechAccumulator::skillName))
                .map(TechAccumulator::toDto)
                .toList();
    }

    private List<ExperienceBucketDTO> buildExperienceBuckets(Collection<Candidate> candidates) {
        long zeroToTwo = 0, threeToFive = 0, sixToTen = 0, overTen = 0;
        for (Candidate candidate : candidates) {
            BigDecimal exp = candidate.getTotalExperience();
            BigDecimal safeExp = exp != null ? exp : BigDecimal.ZERO;
            if (safeExp.compareTo(BigDecimal.valueOf(2)) <= 0) {
                zeroToTwo++;
            } else if (safeExp.compareTo(BigDecimal.valueOf(5)) <= 0) {
                threeToFive++;
            } else if (safeExp.compareTo(BigDecimal.valueOf(10)) <= 0) {
                sixToTen++;
            } else {
                overTen++;
            }
        }
        return List.of(
                new ExperienceBucketDTO("0-2 years", zeroToTwo),
                new ExperienceBucketDTO("3-5 years", threeToFive),
                new ExperienceBucketDTO("6-10 years", sixToTen),
                new ExperienceBucketDTO("10+ years", overTen));
    }

    private List<InterviewerSummaryDTO> buildInterviewerSummary(LocalDateTime start, LocalDateTime end) {
        List<CandidateInterview> interviews = candidateInterviewRepository.findWithinDateRange(start, end);
        Map<Long, InterviewerAccumulator> acc = new HashMap<>();

        // Prefetch feedback for rating averages
        List<InterviewFeedback> feedbacks = interviewFeedbackRepository.findAll();
        Map<String, List<InterviewFeedback>> feedbackByInterviewPanelist = feedbacks.stream()
                .collect(Collectors
                        .groupingBy(f -> f.getInterview().getInterviewId() + "-" + f.getPanelist().getUserId()));

        for (CandidateInterview interview : interviews) {
            List<InterviewPanel> panels = interviewPanelRepository.findByInterview(interview);
            for (InterviewPanel panel : panels) {
                User panelist = panel.getPanelist();
                if (panelist == null) {
                    continue;
                }
                InterviewerAccumulator ia = acc.computeIfAbsent(panelist.getUserId(),
                        id -> new InterviewerAccumulator(panelist.getUserId(), fullName(panelist)));
                ia.bumpAssigned();
                ia.bumpStatus(interview.getStatus());

                List<InterviewFeedback> relevant = feedbackByInterviewPanelist
                        .getOrDefault(interview.getInterviewId() + "-" + panelist.getUserId(), List.of());
                relevant.forEach(ia::addRating);
            }
        }

        return acc.values().stream()
                .sorted(Comparator.comparing(InterviewerAccumulator::name))
                .map(InterviewerAccumulator::toDto)
                .toList();
    }

    private boolean filterByPositions(JobApplication app, List<Long> positionIds) {
        if (CollectionUtils.isEmpty(positionIds)) {
            return true;
        }
        return app.getPosition() != null && positionIds.contains(app.getPosition().getPositionId());
    }

    private boolean filterByStatuses(JobApplication app, List<JobApplication.Status> statuses) {
        if (CollectionUtils.isEmpty(statuses)) {
            return true;
        }
        return statuses.contains(app.getStatus());
    }

    private boolean filterByColleges(JobApplication app, List<String> colleges) {
        if (CollectionUtils.isEmpty(colleges)) {
            return true;
        }
        String college = app.getCandidate() != null ? app.getCandidate().getCollegeName() : null;
        return college != null && colleges.contains(college);
    }

    private boolean filterByExperience(JobApplication app, BigDecimal minExp, BigDecimal maxExp) {
        if (minExp == null && maxExp == null) {
            return true;
        }
        BigDecimal exp = app.getCandidate() != null ? app.getCandidate().getTotalExperience() : null;
        BigDecimal safeExp = exp != null ? exp : BigDecimal.ZERO;
        boolean aboveMin = minExp == null || safeExp.compareTo(minExp) >= 0;
        boolean belowMax = maxExp == null || safeExp.compareTo(maxExp) <= 0;
        return aboveMin && belowMax;
    }

    private boolean filterBySkills(JobApplication app, Map<Long, List<CandidateSkills>> skillsByCandidate,
            List<String> skills) {
        if (CollectionUtils.isEmpty(skills)) {
            return true;
        }
        Candidate candidate = app.getCandidate();
        if (candidate == null) {
            return false;
        }
        List<CandidateSkills> candidateSkills = skillsByCandidate.getOrDefault(candidate.getCandidateId(), List.of());
        Set<String> skillNames = candidateSkills.stream()
                .map(cs -> cs.getSkill() != null ? cs.getSkill().getSkillName() : null)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        return !CollectionUtils.isEmpty(skillNames) && skillNames.stream().anyMatch(skills::contains);
    }

    private String fullName(Candidate candidate) {
        if (candidate == null) {
            return null;
        }
        return candidate.getFirstName() + " " + candidate.getLastName();
    }

    private String fullName(User user) {
        if (user == null) {
            return null;
        }
        return user.getFirstName() + " " + user.getLastName();
    }

    private static class PositionAccumulator {
        private final Long positionId;
        private final String jobTitle;
        private final String department;
        private final StatusAccumulator statusAccumulator = new StatusAccumulator();

        PositionAccumulator(Long positionId, String jobTitle, String department) {
            this.positionId = positionId;
            this.jobTitle = jobTitle;
            this.department = department;
        }

        void bump(JobApplication.Status status) {
            statusAccumulator.bump(status);
        }

        PositionReportDTO toDto() {
            return new PositionReportDTO(positionId, jobTitle, department, statusAccumulator.total,
                    statusAccumulator.applied, statusAccumulator.screening, statusAccumulator.interview,
                    statusAccumulator.selected, statusAccumulator.rejected, statusAccumulator.onHold,
                    statusAccumulator.withdrawn);
        }

        Long positionId() {
            return positionId;
        }
    }

    private static class StatusAccumulator {
        long total;
        long applied;
        long screening;
        long interview;
        long selected;
        long rejected;
        long onHold;
        long withdrawn;

        void bump(JobApplication.Status status) {
            total++;
            if (status == null) {
                return;
            }
            switch (status) {
                case APPLIED -> applied++;
                case SCREENING -> screening++;
                case INTERVIEW -> interview++;
                case SELECTED -> selected++;
                case REJECTED -> rejected++;
                case ON_HOLD -> onHold++;
                case WITHDRAWN -> withdrawn++;
                default -> {
                }
            }
        }

        CandidateProcessSummaryDTO toSummary() {
            return new CandidateProcessSummaryDTO(total, applied, screening, interview, selected, rejected, onHold,
                    withdrawn);
        }

        DailySummaryDTO toDaily(LocalDate date) {
            return new DailySummaryDTO(date, total, applied, screening, interview, selected, rejected);
        }
    }

    private static class CollegeAccumulator {
        private final String collegeName;
        private final Set<Long> uniqueCandidates = new java.util.HashSet<>();
        private long applications;

        CollegeAccumulator(String collegeName) {
            this.collegeName = collegeName;
        }

        void bumpCandidate(Long candidateId) {
            if (candidateId != null) {
                uniqueCandidates.add(candidateId);
            }
        }

        void bumpApplications() {
            applications++;
        }

        CollegeReportDTO toDto() {
            return new CollegeReportDTO(collegeName, uniqueCandidates.size(), applications);
        }

        String collegeName() {
            return collegeName;
        }
    }

    private static class TechAccumulator {
        private final String skillName;
        private final Set<Long> uniqueCandidates = new java.util.HashSet<>();
        private BigDecimal totalExperience = BigDecimal.ZERO;
        private long experienceSamples;
        private long verifiedCount;

        TechAccumulator(String skillName) {
            this.skillName = skillName;
        }

        void bumpCandidate(Long candidateId, BigDecimal years, Boolean verified) {
            if (candidateId != null) {
                uniqueCandidates.add(candidateId);
            }
            if (years != null) {
                totalExperience = totalExperience.add(years);
                experienceSamples++;
            }
            if (Boolean.TRUE.equals(verified)) {
                verifiedCount++;
            }
        }

        TechnologyProfileDTO toDto() {
            BigDecimal avg = experienceSamples == 0 ? BigDecimal.ZERO
                    : totalExperience.divide(BigDecimal.valueOf(experienceSamples), 2, RoundingMode.HALF_UP);
            return new TechnologyProfileDTO(skillName, uniqueCandidates.size(), avg, verifiedCount);
        }

        String skillName() {
            return skillName;
        }
    }

    private static class InterviewerAccumulator {
        private final Long userId;
        private final String name;
        private long assigned;
        private long completed;
        private long noShow;
        private BigDecimal totalRating = BigDecimal.ZERO;
        private long ratingSamples;

        InterviewerAccumulator(Long userId, String name) {
            this.userId = userId;
            this.name = name;
        }

        void bumpAssigned() {
            assigned++;
        }

        void bumpStatus(CandidateInterview.InterviewStatus status) {
            if (status == CandidateInterview.InterviewStatus.COMPLETED) {
                completed++;
            }
            if (status == CandidateInterview.InterviewStatus.NO_SHOW) {
                noShow++;
            }
        }

        void addRating(InterviewFeedback feedback) {
            if (feedback.getOverall_rating() != null) {
                totalRating = totalRating.add(feedback.getOverall_rating());
                ratingSamples++;
            }
        }

        InterviewerSummaryDTO toDto() {
            BigDecimal avg = ratingSamples == 0 ? BigDecimal.ZERO
                    : totalRating.divide(BigDecimal.valueOf(ratingSamples), 2, RoundingMode.HALF_UP);
            return new InterviewerSummaryDTO(userId, name, assigned, completed, noShow, avg);
        }

        String name() {
            return name;
        }
    }
}
