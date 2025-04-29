import React, { useState } from "react";
import TableContainer from "@mui/material/TableContainer";
import ConfirmationDialogDelete from "../../Components/ConfirmationDialogDelete";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import moment from "moment";

export default function EventPersonalDetails(props) {
  const profile = props.data;
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationData, setConfirmationData] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = (eventId) => {
    setConfirmationData({
      title: "Delete Event",
      message: "Are you sure you want to delete this event?",
      onConfirm: () => confirmhandleDelete(eventId),
    });
    setConfirmationOpen(true);
  };

  const confirmhandleDelete = async (eventId) => {
    setConfirmationOpen(false);
    try {
      setLoading(true);
      setSnackbarMessage("Event deleted successfully.");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error deleting event:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-sm border-0 p-4">
       
        <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
          <h3 className="text-primary fw-bold">{profile.EventName}</h3>
          <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(profile.EventId)}>
            <i className="bi bi-trash3-fill me-1"></i> Delete
          </button>
        </div>

       
        <div className="row g-4">
        
          {profile.EventType && (
            <div className="col-md-6">
              <div className="d-flex align-items-center bg-light p-3 rounded">
                <i className="bi bi-briefcase-fill me-3 text-primary fs-5"></i>
                <div>
                  <span className="text-muted">Event Type</span>
                  <h6 className="m-0 fw-semibold">{profile.EventType}</h6>
                </div>
              </div>
            </div>
          )}

         
          {profile.EventDate && (
            <div className="col-md-6">
              <div className="d-flex align-items-center bg-light p-3 rounded">
                <i className="bi bi-calendar2-event me-3 text-primary fs-5"></i>
                <div>
                  <span className="text-muted">Event Date</span>
                  <h6 className="m-0 fw-semibold">{moment(profile.EventDate).format("DD-MMM-YYYY")}</h6>
                </div>
              </div>
            </div>
          )}


          {profile.Location && (
            <div className="col-md-6">
              <div className="d-flex align-items-center bg-light p-3 rounded">
                <i className="bi bi-house-fill me-3 text-primary fs-5"></i>
                <div>
                  <span className="text-muted">Location</span>
                  <h6 className="m-0 fw-semibold">{profile.Location}</h6>
                </div>
              </div>
            </div>
          )}

          {(profile.AddressLine1 || profile.AddressLine2 || profile.City || profile.Pincode) && (
            <div className="col-md-6">
              <div className="d-flex align-items-center bg-light p-3 rounded">
                <i className="bi bi-geo-alt-fill me-3 text-primary fs-5"></i>
                <div>
                  <span className="text-muted">Address</span>
                  <h6 className="m-0 fw-semibold">
                    {[profile.AddressLine1, profile.AddressLine2, profile.City, profile.Mandal, profile.Village, profile.DistrictName, profile.StateName, profile.Pincode]
                      .filter(Boolean)
                      .join(", ")}
                  </h6>
                </div>
              </div>
            </div>
          )}

        </div>




      </div>



      <TableContainer component={Paper} className="mt-4">
        <ConfirmationDialogDelete
          open={confirmationOpen}
          title={confirmationData.title}
          message={confirmationData.message}
          onConfirm={confirmationData.onConfirm}
          onCancel={() => setConfirmationOpen(false)}
        />
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert onClose={handleSnackbarClose} severity="success">
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </TableContainer>
    </div>

  );
}
