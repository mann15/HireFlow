import { useState, useEffect } from "react";
import { getOffersByApplication } from "../../services/offerService";
import {
  sendOffer,
  acceptOffer,
  rejectOffer,
  withdrawOffer,
} from "../../services/offerService";
import { format } from "date-fns";

const OffersList = ({ applicationId, isHR = false, isCandidate = false }) => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectModal, setRejectModal] = useState({
    show: false,
    offerId: null,
  });
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetchOffers();
  }, [applicationId]);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const data = await getOffersByApplication(applicationId);
      setOffers(data);
    } catch (err) {
      console.error("Failed to fetch offers:", err);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOffer = async (offerId) => {
    if (
      !window.confirm(
        "Are you sure you want to send this offer to the candidate?"
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      await sendOffer(offerId);
      alert("Offer sent to candidate successfully!");
      await fetchOffers();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to send offer");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptOffer = async (offerId) => {
    if (!window.confirm("Are you sure you want to accept this offer?")) {
      return;
    }

    setActionLoading(true);
    try {
      await acceptOffer(offerId);
      alert("Offer accepted successfully!");
      await fetchOffers();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to accept offer");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectOffer = async () => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    setActionLoading(true);
    try {
      await rejectOffer(rejectModal.offerId, rejectReason);
      alert("Offer rejected");
      setRejectModal({ show: false, offerId: null });
      setRejectReason("");
      await fetchOffers();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to reject offer");
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdrawOffer = async (offerId) => {
    if (!window.confirm("Are you sure you want to withdraw this offer?")) {
      return;
    }

    setActionLoading(true);
    try {
      await withdrawOffer(offerId);
      alert("Offer withdrawn successfully!");
      await fetchOffers();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to withdraw offer");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      GENERATED: "bg-blue-100 text-blue-800",
      SEND: "bg-purple-100 text-purple-800",
      ACCEPTED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      WITHDRAWN: "bg-gray-100 text-gray-800",
      EXPIRED: "bg-orange-100 text-orange-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return <div className="text-center py-8">Loading offers...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Offer Letters</h2>

      {offers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No offers generated yet
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {offer.offeredDesignation}
                  </h3>
                  <p className="text-sm text-gray-600">Offer ID: {offer.id}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    offer.offerStatus
                  )}`}
                >
                  {offer.offerStatus}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Annual Salary</p>
                  <p className="font-semibold text-lg">
                    ₹{offer.salaryOffered?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Joining Date</p>
                  <p className="font-semibold">
                    {offer.joiningDate
                      ? format(new Date(offer.joiningDate), "PPP")
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Generated On</p>
                  <p className="font-medium">
                    {offer.generatedDate
                      ? format(new Date(offer.generatedDate), "PPP")
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valid Till</p>
                  <p className="font-medium">
                    {offer.offerValidTill
                      ? format(new Date(offer.offerValidTill), "PPP")
                      : "N/A"}
                  </p>
                </div>
              </div>

              {offer.benefits && (
                <div className="bg-gray-50 p-3 rounded mb-4">
                  <p className="text-sm text-gray-600 mb-1">
                    Benefits & Perks:
                  </p>
                  <p className="text-sm">{offer.benefits}</p>
                </div>
              )}

              {offer.rejectionReason && (
                <div className="bg-red-50 p-3 rounded mb-4">
                  <p className="text-sm text-gray-600 mb-1">
                    Rejection Reason:
                  </p>
                  <p className="text-sm text-red-700">
                    {offer.rejectionReason}
                  </p>
                </div>
              )}

              {/* Actions for HR */}
              {isHR && (
                <div className="flex gap-2 pt-4 border-t">
                  {offer.offerStatus === "GENERATED" && (
                    <button
                      onClick={() => handleSendOffer(offer.id)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      Send to Candidate
                    </button>
                  )}
                  {["GENERATED", "SEND"].includes(offer.offerStatus) && (
                    <button
                      onClick={() => handleWithdrawOffer(offer.id)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400"
                    >
                      Withdraw Offer
                    </button>
                  )}
                </div>
              )}

              {/* Actions for Candidate */}
              {isCandidate && offer.offerStatus === "SEND" && (
                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleAcceptOffer(offer.id)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                  >
                    Accept Offer
                  </button>
                  <button
                    onClick={() =>
                      setRejectModal({ show: true, offerId: offer.id })
                    }
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
                  >
                    Reject Offer
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reject Offer Modal */}
      {rejectModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Reject Offer</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting this offer:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
              rows="4"
              placeholder="Reason for rejection..."
              required
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setRejectModal({ show: false, offerId: null });
                  setRejectReason("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectOffer}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
              >
                {actionLoading ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OffersList;
