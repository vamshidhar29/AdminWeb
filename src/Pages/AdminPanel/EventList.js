import React, { useEffect, useState } from "react";
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import CommonTables from '../../Commoncomponents/CommonTables';
import { formatDate } from '../../Commoncomponents/CommonComponents';
import TableContainer from '@mui/material/TableContainer';
import ConfirmationDialogDelete from "../../Components/ConfirmationDialogDelete";
import Paper from '@mui/material/Paper';
import { fetchData, fetchUpdateData, fetchDeleteData, fetchAllData } from "../../helpers/externapi";
import Layout from "../../Layout/Layout";

const customStyles = {
    container: {
        padding: '20px',
        backgroundColor: '#f0f0f0',
        borderRadius: '8px',
        margin: '20px'
    },
    header: {
        marginBottom: '10px',
        color: '#333',
    },
    addButton: {
        marginBottom: '20px',
        backgroundColor: '#4caf50',
    },
    tableContainer: {
        overflowX: 'auto',
        marginBottom: '20px',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        border: '1px solid #ddd',
        padding: '8px',
        backgroundColor: '#f2f2f2',
        color: '#333',
    },
    customheight: {
        height: '15px',
        padding: '10px'
    },
    td: {
        border: '1px solid #ddd',
        padding: '8px',
        color: '#333',
    },
    tdCenter: {
        border: '1px solid #ddd',
        padding: '8px',
        textAlign: 'center',
        color: '#333',
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
    },
    header: {
        marginBottom: '10px',
        color: '#333',
    },
    addButton: {
        marginBottom: '20px',
        backgroundColor: '#4caf50',
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
    }
};

const EventList = (props) => {
    const [loading, setLoading] = useState(false);
    const [events, setEvents] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formVisible, setFormVisible] = useState(false);
    const [formData, setFormData] = useState({
        EventId: "", EventName: "", EventType: "", Location: "", EventDate: "", MapView: "", AddressLine1: "", AddressLine2: "",
        Village: "", Mandal: "", City: "", StateId: "", DistrictId: "", Pincode: "", HospitalId: "",
    });
    const [formErrors, setFormErrors] = useState({});
    const [states, setStates] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const [districts, setDistricts] = useState([]);
    // const [routeMaps, setRouteMaps] = useState([]);
    const [selectedStateId, setSelectedStateId] = useState(null);
    const [selectedHospitalId, setSelectedHospitalId] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [totalCount, setTotalCount] = React.useState(0);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [perPage, setPerPage] = React.useState(10);
    const [isDistrictDisabled, setIsDistrictDisabled] = useState(true);
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [confirmationData, setConfirmationData] = useState({});

    let UserId = localStorage.getItem("UserId");

    const tableHeads = ["Event Name", "Event Type", "Address", "Event Date", "Map View", "Created By", "Actions"];

    const tableElements = events && events.length > 0 ?
        events.map((event) => ([
            <div className="text-start-important"
                style={{
                    whiteSpace: 'normal',
                    textAlign: 'start',
                    display: 'block',
                }}> {event.EventName}
            </div>,
            event.EventType,
            event.AddressLine1,
            formatDate(event.EventDate),
            event.MapView && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <a href={event.MapView} target="_blank" rel="noopener noreferrer">Open Link</a>
                    <IconButton onClick={() => handleCopyLink(event.MapView)} size="small">
                        <ContentCopyIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleShareLink(event.MapView)} size="small">
                        <ShareIcon fontSize="small" />
                    </IconButton>
                </div>
            ),
            event.UserName,


            <div style={{ display: "flex", flexDirection: "row" }}>
                <button

                    className="btn btn-sm btn-success"

                    onClick={() => handleEdit(event)}
                    style={{ marginRight: '2px' }}
                >
                    Edit
                </button>
                <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(event.EventId)}
                >
                    Delete
                </button>
            </div>


        ])) : [];

    const getEvent = async () => {
        try {
            const skip = (currentPage - 1) * perPage;
            const take = perPage;

            setLoading(true);
            const eventData = await fetchData("Event/all", { skip, take });
            setEvents(eventData);
        } catch (error) {
            console.error("Error fetching event data:", error);
        } finally {
            setLoading(false);
        }
    };

    // const getRouteMaps = async () => {
    //     try {
    //         setLoading(true);
    //         const routeMapData = await fetchData("RouteMap/all", { "skip": 0, "take": 0 });
    //         setRouteMaps(routeMapData);
    //     } catch (error) {
    //         console.error("Error fetching route map data:", error);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const getStates = async () => {
        try {
            setLoading(true);
            const statesData = await fetchData("States/all", { "skip": 0, "take": 0 });
            setStates(statesData);
        } catch (error) {
            console.error("Error fetching states data:", error);
        } finally {
            setLoading(false);
        }
    };

    const getHospitals = async () => {
        try {
            setLoading(true);
            const hospitralsData = await fetchData("Hospital/all", { "skip": 0, "take": 0 });
            setHospitals(hospitralsData);
        } catch (error) {
            console.error("Error fetching Hospital data:", error);
        } finally {
            setLoading(false);
        }
    };

    const getDistricts = async (stateId) => {
        try {
            setLoading(true);
            const districtsData = await fetchAllData(`Districts/GetByStateId/${stateId}`);
            setDistricts(districtsData);
        } catch (error) {
            console.error("Error fetching Districts data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // getRouteMaps();
        getStates();
        getHospitals();
    }, []);

    useEffect(() => {
        if (selectedStateId) {
            getDistricts(selectedStateId);
            setIsDistrictDisabled(false);
        } else {
            setIsDistrictDisabled(true);
        }
    }, [selectedStateId], [selectedHospitalId]);

    useEffect(() => {
        getEvent();
        getEventCountData();
    }, [totalCount, currentPage, perPage]);

    const handleCopyLink = (link) => {
        navigator.clipboard.writeText(link)
            .then(() => {
                setSnackbarMessage("Link copied to clipboard!");
                setSnackbarOpen(true);
            })
            .catch((error) => {
                console.error("Error copying link:", error);
            });
    };

    const handleShareLink = (link) => {
        const shareData = {
            title: 'Route Map',
            text: 'Check out this route map:',
            url: link
        };

        if (navigator.share) {
            navigator.share(shareData)
                .then(() => {
                    setSnackbarMessage("Link shared successfully!");
                    setSnackbarOpen(true);
                })
                .catch((error) => {
                    console.error("Error sharing link:", error);
                });
        } else {
            const whatsappURL = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareData.text)} ${encodeURIComponent(shareData.url)}`;
            const mailtoURL = `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(shareData.text)} ${encodeURIComponent(shareData.url)}`;

            window.open(whatsappURL, '_blank');
            window.open(mailtoURL, '_blank');
        }
    };

    const onChangeHandler = (e) => {
        const { name, value } = e.target;
        let updatedFormData = { ...formData, [name]: value };
        setFormData(updatedFormData);

        if (name === 'StateId') {
            setSelectedStateId(value);
            setIsDistrictDisabled(!value);
            updatedFormData.DistrictId = '';
        }
    };

    const handleEdit = (event) => {
        setIsEditMode(true);
        setFormVisible(true);
        setFormData({
            EventId: event.EventId,
            EventName: event.EventName,
            EventType: event.EventType,
            Location: event.Location,
            EventDate: event.EventDate || "",
            MapView: event.MapView,
            AddressLine1: event.AddressLine1 || "",
            AddressLine2: event.AddressLine2 || "",
            Village: event.Village || "",
            Mandal: event.Mandal || "",
            City: event.City || "",
            StateId: event.StateId || "",
            DistrictId: event.DistrictId || "",
            Pincode: event.Pincode || "",
            HospitalId: event.HospitalId || ""
        });
    };

    const handleAddNewEvent = () => {
        setIsEditMode(false);
        setFormVisible(true);
        setFormData({
            EventId: "", EventName: "", EventType: "", Location: "", EventDate: "", MapView: "", AddressLine1: "",
            AddressLine2: "", Village: "", Mandal: "", City: "", StateId: "", DistrictId: "", Pincode: "", HospitalId: ""
        });
    };

    const validateForm = () => {
        let errors = {};
        if (!formData.EventName) errors.EventName = "Please enter event name";
        if (!formData.EventType) errors.EventType = "Please enter event type";
        if (!formData.Location) errors.Location = "Please enter location";
        if (!formData.AddressLine1) errors.AddressLine1 = "Please enter Address";
        if (!formData.EventDate) errors.EventDate = "Please enter event date";
        if (!formData.MapView) errors.MapView = "Please enter Map View Link";
        if (!formData.Village) errors.Village = "Please enter Village Name";
        if (!formData.Mandal) errors.Mandal = "Please enter Mandal Name";
        if (!formData.City) errors.City = "Please enter City Name";
        if (!formData.StateId) errors.StateId = "Please select a state";
        if (!formData.DistrictId) errors.DistrictId = "Please select a district";
        if (!formData.Pincode) errors.Pincode = "Please enter pincode";
        if (!formData.HospitalId) errors.HospitalId = "Please select a Hospital"
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setLoading(true);

        let hospitalName = "";
        if (formData.HospitalId) {
            const selectedHospital = hospitals.find(
                (hospital) => hospital.HospitalId === formData.HospitalId
            );
            hospitalName = selectedHospital ? selectedHospital.HospitalName : "";
        }


        try {
            if (isEditMode) {
                await fetchUpdateData("Event/update", {
                    eventId: formData.EventId,
                    eventName: formData.EventName,
                    eventType: formData.EventType,
                    location: formData.Location,
                    eventDate: formData.EventDate,
                    mapView: formData.MapView,
                    AddressLine1: formData.AddressLine1,
                    AddressLine2: formData.AddressLine2,
                    Village: formData.Village,
                    Mandal: formData.Mandal,
                    City: formData.City,
                    StateId: formData.StateId,
                    DistrictId: formData.DistrictId,

                    Pincode: formData.Pincode,
                    initiatedBy: UserId,
                    HospitalId: formData.HospitalId,
                    HospitalName: hospitalName
                });
                setSnackbarMessage("Event updated successfully!");

            } else {
                await fetchData("Event/add", {
                    eventName: formData.EventName,
                    eventType: formData.EventType,
                    location: formData.Location,
                    eventDate: formData.EventDate,
                    mapView: formData.MapView,
                    AddressLine1: formData.AddressLine1,
                    AddressLine2: formData.AddressLine2,
                    Village: formData.Village,
                    Mandal: formData.Mandal,
                    City: formData.City,
                    StateId: formData.StateId,
                    DistrictId: formData.DistrictId,

                    Pincode: formData.Pincode,
                    initiatedBy: UserId,
                    HospitalId: formData.HospitalId,
                    HospitalName: hospitalName
                });
                setSnackbarMessage("Event added successfully!");

            }
            setSnackbarOpen(true);
            await getEvent();
        } catch (error) {
            console.error("Error adding/updating event:", error);
        } finally {
            setLoading(false);
            setFormData({
                EventId: "", EventName: "", EventType: "", Location: "", ConductedOn: "", MapView: "", AddressLine1: "",
                AddressLine2: "", Village: "", Mandal: "", City: "", StateId: "", DistrictId: "", HospitalId: ""
            });
            setIsEditMode(false);
            setFormVisible(false);

        }
    };


    const handleDelete = (eventId) => {
        setConfirmationData({
            title: 'Delete Event',
            message: 'Are you sure you want to delete this Event?',
            onConfirm: () => confirmhandleDelete(eventId),
        });
        setConfirmationOpen(true);
    };
    const confirmhandleDelete = async (eventId) => {
        setConfirmationOpen(false);
        try {
            setLoading(true);
            await fetchDeleteData(`Event/delete/${eventId}`);
            await getEvent();
            setSnackbarMessage('Event deleted Successfully');
            setSnackbarOpen(true);
        } catch (error) {
            console.error("Error deleting event:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormVisible(false);
    };



    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const getEventCountData = async () => {
        setLoading(true);
        try {
            const eventCountData = await fetchData(`CommonRowCount/GetTableRowCount`, { tableName: "Event" });
            const totalCount = eventCountData[0]?.CountOfRecords || 0;
            setTotalCount(totalCount);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching hospital count data:", error);
            setLoading(false);
        }
    };

    const handlePageChange = (event, page) => {
        setCurrentPage(page);
    };

    const handlePerPageChange = (event) => {
        setPerPage(parseInt(event.target.value, 10));
        setCurrentPage(1);
    };

    const skeletonloading = () => (
        <>
            <style>{shimmerStyle}</style>
            <div className="shimmer-container shimmer">
                <h6 className="shimmer-text "></h6>
            </div>
            <table className="shimmer-container shimmer">
                <tbody>
                    {Array.from({ length: 6 }).map((_, rowIndex) => (
                        <tr key={rowIndex} className="shimmer-row">
                            {Array.from({ length: 6 }).map((_, colIndex) => (
                                <td key={colIndex} className="shimmer-cell">
                                    <h6 className="shimmer-text2 " ></h6>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

        </>
    )

    return (
        <Layout>
            {loading && skeletonloading()}
            {!loading && (
                <>
                    <h2 style={customStyles.header}>Event List</h2>
                    <button
                        className="btn btn-sm btn-primary"
                        onClick={handleAddNewEvent}
                        style={{ marginBottom: '6px' }}
                    >
                        Add Event
                    </button>
                    <div className="card">
                        {loading ? (
                            <div style={customStyles.loadingContainer}>
                                <CircularProgress />
                            </div>
                        ) : (
                            <CommonTables
                                tableHeads={tableHeads}
                                tableData={tableElements}
                                perPage={perPage}
                                currentPage={currentPage}
                                perPageChange={handlePerPageChange}
                                pageChange={handlePageChange}
                                totalCount={totalCount}
                            />
                        )}
                    </div>

                    <TableContainer component={Paper}>
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
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        >
                            <Alert onClose={handleSnackbarClose} severity="success">
                                {snackbarMessage}
                            </Alert>
                        </Snackbar>
                    </TableContainer>

                    <Dialog open={formVisible} onClose={handleClose} aria-labelledby="form-dialog-title">
                        <DialogTitle id="form-dialog-title">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="h6">{isEditMode ? "Update Event" : "Add Event"}</Typography>
                                <IconButton onClick={handleClose} style={{ color: 'red' }}>
                                    ✖
                                </IconButton>
                            </div>
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                {isEditMode ? "Update the details of the event." : "Fill in the details of the new event."}
                            </DialogContentText>
                            <form noValidate autoComplete="off" onSubmit={handleSubmit}>
                                <TextField
                                    name="EventName"
                                    label="Event Name"
                                    value={formData.EventName}
                                    onChange={onChangeHandler}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    margin="normal"
                                    error={!!formErrors.EventName}
                                    helperText={formErrors.EventName}
                                />
                                <TextField
                                    name="EventType"
                                    label="Event Type"
                                    value={formData.EventType}
                                    onChange={onChangeHandler}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    margin="normal"
                                    error={!!formErrors.EventType}
                                    helperText={formErrors.EventType}
                                />
                                <textarea
                                    name="Location"
                                    placeholder="Location"
                                    value={formData.Location}
                                    onChange={onChangeHandler}
                                    rows="4"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        margin: '10px 0',
                                        borderRadius: '4px',
                                        border: formErrors.Location ? '1px solid red' : '1px solid #ccc' // Adjust border based on error
                                    }}
                                />
                                {formErrors.Location && (
                                    <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{formErrors.Location}</p>
                                )}

                                <TextField
                                    name="AddressLine1"
                                    label="Address Line 1"
                                    value={formData.AddressLine1}
                                    onChange={onChangeHandler}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    margin="normal"
                                    error={!!formErrors.AddressLine1}
                                    helperText={formErrors.AddressLine1}
                                />
                                <TextField
                                    name="AddressLine2"
                                    label="Address Line 2"
                                    value={formData.AddressLine2}
                                    onChange={onChangeHandler}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    margin="normal"
                                />
                                <input
                                    type="date"
                                    label="Event Date"
                                    name="EventDate"
                                    value={formData.EventDate ? formData.EventDate.split("T")[0] : ""}
                                    onChange={onChangeHandler}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        margin: '10px 0',
                                        borderRadius: '4px',
                                        border: formErrors.EventDate ? '1px solid red' : '1px solid #ccc'
                                    }}
                                />
                                {formErrors.EventDate && (
                                    <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{formErrors.EventDate}</p>
                                )}

                                <TextField
                                    name="MapView"
                                    label="Map View Link"
                                    value={formData.MapView}
                                    onChange={onChangeHandler}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    margin="normal"
                                    error={!!formErrors.MapView}
                                    helperText={formErrors.MapView}
                                />
                                <TextField
                                    name="Village"
                                    label="Village"
                                    value={formData.Village}
                                    onChange={onChangeHandler}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    margin="normal"
                                    error={!!formErrors.Village}
                                    helperText={formErrors.Village}
                                />
                                <TextField
                                    name="Mandal"
                                    label="Mandal"
                                    value={formData.Mandal}
                                    onChange={onChangeHandler}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    margin="normal"
                                    error={!!formErrors.Mandal}
                                    helperText={formErrors.Mandal}
                                />
                                <TextField
                                    name="City"
                                    label="City"
                                    value={formData.City}
                                    onChange={onChangeHandler}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    margin="normal"
                                    error={!!formErrors.City}
                                    helperText={formErrors.City}
                                />
                                <TextField
                                    margin="dense"
                                    name="Pincode"
                                    label="Pincode"
                                    type="text"
                                    fullWidth
                                    value={formData.Pincode}
                                    onChange={onChangeHandler}
                                    error={!!formErrors.Pincode}
                                    helperText={formErrors.Pincode}
                                />
                                <TextField
                                    select
                                    name="StateId"

                                    value={formData.StateId}
                                    onChange={(e) => {
                                        setFormData({ ...formData, StateId: e.target.value });
                                        setSelectedStateId(e.target.value);
                                    }}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    margin="normal"
                                    error={!!formErrors.StateId}
                                    helperText={formErrors.StateId}
                                    SelectProps={{ native: true }}
                                >
                                    <option value="">Select State</option>
                                    {states.map((state) => (
                                        <option key={state.StateId} value={state.StateId}>{state.StateName}</option>
                                    ))}
                                </TextField>
                                <TextField
                                    select
                                    name="DistrictId"

                                    value={formData.DistrictId}
                                    onChange={onChangeHandler}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    margin="normal"
                                    error={!!formErrors.DistrictId}
                                    helperText={formErrors.DistrictId}
                                    disabled={isDistrictDisabled}
                                    SelectProps={{ native: true }}
                                >
                                    <option value="">Select District</option>
                                    {districts.map((district) => (
                                        <option key={district.DistrictId} value={district.DistrictId}>{district.DistrictName}</option>
                                    ))}
                                </TextField>
                                <TextField
                                    select
                                    name="HospitalId"

                                    value={formData.HospitalId}
                                    onChange={(e) => {
                                        setFormData({ ...formData, HospitalId: e.target.value });
                                        setSelectedHospitalId(e.target.value);
                                    }}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    margin="normal"
                                    error={!!formErrors.HospitalId}
                                    helperText={formErrors.HospitalId}
                                    SelectProps={{ native: true }}
                                >
                                    <option value="">Select Hospital</option>
                                    {hospitals.map((Hospital) => (
                                        <option key={Hospital.HospitalId} value={Hospital.HospitalId}>{Hospital.HospitalName}</option>
                                    ))}
                                </TextField>
                                <DialogActions>
                                    <Button onClick={handleClose} color="primary">
                                        Cancel
                                    </Button>
                                    <Button type="submit" color="primary" variant="contained" disabled={loading}>
                                        {isEditMode ? "Update" : "Add"}
                                    </Button>
                                </DialogActions>
                            </form>
                        </DialogContent>
                    </Dialog>
                </>
            )}
        </Layout>
    );
};

const shimmerStyle = `
     @keyframes shimmer {
    0% {
      background-position: -468px 0;
    }
    100% {
      background-position: 468px 0;
    }
  }

  .shimmer {
    animation-duration: 1.0s;
    animation-fill-mode: forwards;
    animation-iteration-count: infinite;
    animation-name: shimmer;
    animation-timing-function: linear;
    background:	#F7F7F7;
    background: linear-gradient(to right, #f0f0f0 8%, #fafafa 18%, #f0f0f0 33%);
    background-size: 1000px 104px;
    position: relative;
    overflow: hidden;
  }

  .shimmer-container {
    background-color: 	#F7F7F7;
    border-radius: 4px;
    height: 50px;
    width: 100%;
    margin: 15px;
  }

  .shimmer-text2 {
    background-color: #C8C8C8;
    border-radius: 4px;
    height: 15px;
    width: 55%;
    margin: 15px 0 0 15px;
     position:relative;
     left:10%;
     bottom:10%;
  }
  .shimmer-text {
    background-color: #C8C8C8;
    border-radius: 4px;
    height: 15px;
    width: 15%;
    margin: 15px 0 0 15px;
     
  }
 .shimmer-row {
    display: flex;
  }

  .shimmer-cell {
    flex: 1;
    padding: 10px;
    height: 50px;
    background-color: #F7F7F7;
    border-radius: 4px;
    margin: 5px;
  }
  
  `;


export default EventList;
