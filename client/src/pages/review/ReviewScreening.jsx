import React, { useState, useEffect } from "react";
import {
  assignReviewer,
  addComment,
  shortlistCandidate,
  getNotifications,
} from "../../services/reviewService";

const ReviewScreening = ({ positionId }) => {
  const [reviewerId, setReviewerId] = useState("");
  const [comment, setComment] = useState("");
  const [candidateId, setCandidateId] = useState("");
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, [positionId]);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications(positionId);
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const handleAssignReviewer = async () => {
    try {
      await assignReviewer(positionId, reviewerId);
      alert("Reviewer assigned successfully");
    } catch (error) {
      console.error("Failed to assign reviewer", error);
    }
  };

  const handleAddComment = async () => {
    try {
      await addComment(positionId, { userId: 1, comment }); // Replace userId with actual user ID
      alert("Comment added successfully");
    } catch (error) {
      console.error("Failed to add comment", error);
    }
  };

  const handleShortlistCandidate = async () => {
    try {
      await shortlistCandidate(positionId, candidateId);
      alert("Candidate shortlisted successfully");
    } catch (error) {
      console.error("Failed to shortlist candidate", error);
    }
  };

  return (
    <div className="review-screening">
      <h1>Review Screening</h1>

      <div>
        <h2>Assign Reviewer</h2>
        <input
          type="text"
          placeholder="Reviewer ID"
          value={reviewerId}
          onChange={(e) => setReviewerId(e.target.value)}
        />
        <button onClick={handleAssignReviewer}>Assign</button>
      </div>

      <div>
        <h2>Add Comment</h2>
        <textarea
          placeholder="Add your comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        ></textarea>
        <button onClick={handleAddComment}>Add Comment</button>
      </div>

      <div>
        <h2>Shortlist Candidate</h2>
        <input
          type="text"
          placeholder="Candidate ID"
          value={candidateId}
          onChange={(e) => setCandidateId(e.target.value)}
        />
        <button onClick={handleShortlistCandidate}>Shortlist</button>
      </div>

      <div>
        <h2>Notifications</h2>
        <ul>
          {notifications.map((notification, index) => (
            <li key={index}>{notification.message}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ReviewScreening;
