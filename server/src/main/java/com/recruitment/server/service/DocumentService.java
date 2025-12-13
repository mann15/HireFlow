package com.recruitment.server.service;

import com.recruitment.server.model.*;
import com.recruitment.server.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DocumentService {

    private final CandidateDocumentsRepository candidateDocumentsRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final DocumentTypesRepository documentTypesRepository;
    private final UserRepository userRepository;
    private final CVProcessingService cvProcessingService;
    private final NotificationService notificationService;

    public CandidateDocuments uploadDocument(Long applicationId, Long documentTypeId,
            MultipartFile file, User uploadedBy) throws Exception {
        
        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        DocumentTypes documentType = documentTypesRepository.findById(documentTypeId)
                .orElseThrow(() -> new RuntimeException("Document type not found"));

        // Upload document using CVProcessingService (reuse cloud upload logic)
        CVProcessingService.CVUploadResult uploadResult = 
            cvProcessingService.processAndUpload(file, null, null);

        CandidateDocuments document = CandidateDocuments.builder()
                .jobApplication(application)
                .documentType(documentType)
                .documentUrl(uploadResult.getCloudUrl() != null ? 
                           uploadResult.getCloudUrl() : "uploaded_local")
                .status(CandidateDocuments.Status.PENDING)
                .uploadedBy(uploadedBy)
                .uploadedAt(LocalDateTime.now())
                .build();

        return candidateDocumentsRepository.save(document);
    }

    public CandidateDocuments verifyDocument(Long documentId, User verifiedBy, 
            CandidateDocuments.Status status, String remarks) {
        
        CandidateDocuments document = candidateDocumentsRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        document.setStatus(status);
        document.setVerifiedBy(verifiedBy);
        document.setRemarks(remarks);

        CandidateDocuments updated = candidateDocumentsRepository.save(document);

        // Notify candidate about document verification status
        JobApplication application = document.getJobApplication();
        String message = "Document " + document.getDocumentType().getName() + 
                        " has been " + status.toString().toLowerCase();
        
        // Note: This assumes candidate has a user account, adjust as needed
        // For now, we'll skip notification if candidate doesn't have a user account

        return updated;
    }

    public List<CandidateDocuments> getDocumentsByApplication(Long applicationId) {
        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        return candidateDocumentsRepository.findByJobApplication(application);
    }

    public List<CandidateDocuments> getDocumentsByStatus(CandidateDocuments.Status status) {
        return candidateDocumentsRepository.findByStatus(status);
    }

    public List<CandidateDocuments> getPendingDocuments() {
        return candidateDocumentsRepository.findByStatus(CandidateDocuments.Status.PENDING);
    }

    public void deleteDocument(Long documentId) {
        candidateDocumentsRepository.deleteById(documentId);
    }

    public List<DocumentTypes> getAllDocumentTypes() {
        return documentTypesRepository.findAll();
    }

    public DocumentTypes createDocumentType(DocumentTypes documentType) {
        return documentTypesRepository.save(documentType);
    }
}
