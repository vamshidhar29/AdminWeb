import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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

const EventAdd = (props) => {
    const location = useLocation();
    const profileFromLocation = location.state ? location.state.profile : null;
    const [loading, setLoading] = useState(false);
    const [events, setEvents] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formVisible, setFormVisible] = useState(false);
    const [formData, setFormData] = useState({
        EventId: "", EventName: "", EventType: "", Location: "", EventDate: "", MapView: "", AddressLine1: "", AddressLine2: "",
        Village: "", Mandal: "", City: "", StateId: "", DistrictId: "", Pincode: "", HospitalId: null, ConductedBy: "", HospitalName: null,
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
    const [rmName, setRMName] = React.useState();
    const [input, setInput] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [error, setError] = useState('');


    const navigate = useNavigate();

    let UserId = localStorage.getItem("UserId");


    useEffect(() => {

        if (profileFromLocation) {
            setIsEditMode(true);
            setFormData(profileFromLocation);
            setSelectedStateId(profileFromLocation.StateId);
        }
    }, [profileFromLocation]);



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

    const getRMName = async () => {
        const rmName = await fetchAllData("lambdaAPI/Employee/GetRMNames");
        setRMName(rmName);

        setLoading(false);
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
        getRMName();
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

    const handleHospitalChange = (selectedOption) => {
        setFormData((prevData) => ({
            ...prevData,
            HospitalId: selectedOption ? selectedOption.value : "",
            HospitalName: selectedOption ? selectedOption.label : "",
        }));
    };

    const handleBackToView = () => {
        if (profileFromLocation && profileFromLocation.EventId) {
            navigate(`/HealthCampEvents/details/${profileFromLocation.EventId}`);
        } else {
            navigate("/HealthCampEvents/List");
        }
    };

    const validateForm = () => {
        let errors = {};
        if (!formData.EventName) errors.EventName = "Please enter event name";
        if (!formData.EventType) errors.EventType = "Please enter event type";
        if (!formData.Location) errors.Location = "Please enter location";
        if (!formData.AddressLine1) errors.AddressLine1 = "Please enter Address";
        if (!formData.EventDate) errors.EventDate = "Please enter event date";
        if (!formData.Village) errors.Village = "Please enter Village Name";
        if (!formData.Mandal) errors.Mandal = "Please enter Mandal Name";
        if (!formData.City) errors.City = "Please enter City Name";
        if (!formData.StateId) errors.StateId = "Please select a state";
        if (!formData.DistrictId) errors.DistrictId = "Please select a district";
        if (!formData.Pincode) errors.Pincode = "Please enter pincode";
        if (!formData.ConductedBy) errors.ConductedBy = "Please Select employee";
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


        try {
            let response;
            if (isEditMode) {
                response = await fetchUpdateData("Event/update", {
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
                    HospitalName: formData.HospitalName,
                    ConductedBy: formData.ConductedBy
                });
                if (response) {
                    setSnackbarMessage("Event updated successfully!");
                    setTimeout(() => {
                        navigate(`/HealthCampEvents/details/${response.eventId}`);
                    }, 3000);
                }

            } else {
                response = await fetchData("Event/add", {
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
                    HospitalName: formData.HospitalName,
                    ConductedBy: formData.ConductedBy
                });
                if (response) {
                    setSnackbarMessage("Event added successfully!");
                    setTimeout(() => {
                        navigate("/HealthCampEvents/List");
                    }, 3000);
                }
            }
            setSnackbarOpen(true);

        } catch (error) {
            console.error("Error adding/updating event:", error);
        } finally {
            setLoading(false);
            setFormData({
                EventId: "", EventName: "", EventType: "", Location: "", ConductedOn: "", MapView: "", AddressLine1: "", Pincode:"", 
                AddressLine2: "", Village: "", Mandal: "", City: "", StateId: "", DistrictId: "", HospitalId: "", ConductedBy: ""
            });
            setIsEditMode(false);
            setFormErrors({});
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

    const handleReset = () => {
        setFormData({
            EventId: "", EventName: "", EventType: "", Location: "", ConductedOn: "", MapView: "", AddressLine1: "",  Pincode:"", 
            AddressLine2: "", Village: "", Mandal: "", City: "", StateId: "", DistrictId: "", HospitalId: "", ConductedBy: ""
        });
        setFormErrors({});
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

        <div>
            <form onSubmit={handleSubmit} className=" border-0  p-4 bg-light rounded mt-4">
                {/* Row 1 */}
                <div className="row mb-3">
                    <div className="col-md-4">
                        <label>Event Name:</label>
                        <input
                            type="text"
                            name="EventName"
                            value={formData.EventName}
                            onChange={onChangeHandler}
                            className={`form-control ${formErrors.EventName ? "is-invalid" : ""}`}
                        />
                        {formErrors.EventName && <div className="invalid-feedback">{formErrors.EventName}</div>}
                    </div>
                    <div className="col-md-4">
                        <label>Event Type:</label>
                        <input
                            type="text"
                            name="EventType"
                            value={formData.EventType}
                            onChange={onChangeHandler}
                            className={`form-control ${formErrors.EventType ? "is-invalid" : ""}`}
                        />
                        {formErrors.EventType && <div className="invalid-feedback">{formErrors.EventType}</div>}
                    </div>

                    <div className="col-md-4">
                        <label>Location:</label>
                        <input
                            name="Location"
                            value={formData.Location}
                            onChange={onChangeHandler}
                            className={`form-control ${formErrors.Location ? "is-invalid" : ""}`}
                            rows="3"
                        />
                        {formErrors.Location && <div className="invalid-feedback">{formErrors.Location}</div>}
                    </div>
                </div>

                

                {/* Row 3 */}
                <div className="row mb-3">

                    <div className="col-md-4">
                        <label>Event Date:</label>
                        <input
                            type="date"
                            name="EventDate"
                            value={formData.EventDate ? formData.EventDate.split("T")[0] : ""}
                            onChange={onChangeHandler}
                            className={`form-control ${formErrors.EventDate ? "is-invalid" : ""}`}
                        />
                        {formErrors.EventDate && <div className="invalid-feedback">{formErrors.EventDate}</div>}
                    </div>
                    <div className="col-md-4">
                        <label>Address Line 1:</label>
                        <input
                            type="text"
                            name="AddressLine1"
                            value={formData.AddressLine1}
                            onChange={onChangeHandler}
                            className={`form-control ${formErrors.AddressLine1 ? "is-invalid" : ""}`}
                        />
                        {formErrors.AddressLine1 && <div className="invalid-feedback">{formErrors.AddressLine1}</div>}
                    </div>
                    <div className="col-md-4">
                        <label>Address Line 2:</label>
                        <input
                            type="text"
                            name="AddressLine2"
                            value={formData.AddressLine2}
                            onChange={onChangeHandler}
                            className="form-control"
                        />
                    </div>
                </div>

                {/* Row 4 */}
                <div className="row mb-3">
                    <div className="col-md-4">
                        <label>Village:</label>
                        <input
                            type="text"
                            name="Village"
                            value={formData.Village}
                            onChange={onChangeHandler}
                            className={`form-control ${formErrors.Village ? "is-invalid" : ""}`}
                        />
                        {formErrors.Village && <div className="invalid-feedback">{formErrors.Village}</div>}
                    </div>
                    <div className="col-md-4">
                        <label>Mandal:</label>
                        <input
                            type="text"
                            name="Mandal"
                            value={formData.Mandal}
                            onChange={onChangeHandler}
                            className={`form-control ${formErrors.Village ? "is-invalid" : ""}`}
                        />
                        {formErrors.Mandal && <div className="invalid-feedback">{formErrors.Mandal}</div>}
                    </div>
                    <div className="col-md-4">
                        <label>City:</label>
                        <input
                            type="text"
                            name="City"
                            value={formData.City}
                            onChange={onChangeHandler}
                            className={`form-control ${formErrors.City ? "is-invalid" : ""}`}
                        />
                        {formErrors.City && <div className="invalid-feedback">{formErrors.City}</div>}
                    </div>
                </div>

                {/* Row 5 */}
                <div className="row mb-3">
                    <div className="col-md-4">
                        <label>Pincode:</label>
                        <input
                            type="text"
                            name="Pincode"
                            maxLength={6}
                            value={formData.Pincode}
                            onChange={onChangeHandler}
                            className={`form-control ${formErrors.Pincode ? "is-invalid" : ""}`}
                        />
                        {formErrors.Pincode && <div className="invalid-feedback">{formErrors.Pincode}</div>}
                    </div>
                    <div className="col-md-4">
                        <label>Map View Link:</label>
                        <input
                            type="text"
                            name="MapView"
                            value={formData.MapView}
                            onChange={onChangeHandler}
                            className={"form-control"}
                        />

                    </div>

                    <div className="col-md-4">
                        <label>Select RM/RE:</label>
                        <select
                            name="ConductedBy"
                            value={formData.ConductedBy}
                            onChange={onChangeHandler}
                            className={`form-select ${formErrors.ConductedBy ? "is-invalid" : ""}`}
                        >
                            <option value="">Select RM/RE</option>
                            {rmName && rmName.map((rm) => (
                                <option key={rm.UserId} value={rm.UserId}>{rm.FullName}</option>
                            ))}
                        </select>
                        {formErrors.ConductedBy && <div className="invalid-feedback">{formErrors.ConductedBy}</div>}
                    </div>
                </div>

                {/* Row 6 */}
                <div className="row mb-3">
                    <div className="col-md-4">
                        <label>State:</label>
                        <select
                            name="StateId"
                            value={formData.StateId}
                            onChange={onChangeHandler}
                            className={`form-select ${formErrors.StateId ? "is-invalid" : ""}`}
                        >
                            <option value="">Select State</option>
                            {states.map((state) => (
                                <option key={state.StateId} value={state.StateId}>{state.StateName}</option>
                            ))}
                        </select>
                        {formErrors.StateId && <div className="invalid-feedback">{formErrors.StateId}</div>}
                    </div>
                    <div className="col-md-4">
                        <label>District:</label>
                        <select
                            name="DistrictId"
                            value={formData.DistrictId}
                            onChange={onChangeHandler}
                            className={`form-select ${formErrors.DistrictId ? "is-invalid" : ""}`}
                        >
                            <option value="">Select District</option>
                            {districts.map((district) => (
                                <option key={district.DistrictId} value={district.DistrictId}>{district.DistrictName}</option>
                            ))}
                        </select>
                        {formErrors.DistrictId && <div className="invalid-feedback">{formErrors.DistrictId}</div>}
                    </div>


                    <div className="col-md-4">
                        <label>Hospital Name:</label>
                        <select
                            name="HospitalId"
                            value={formData.HospitalId}
                            onChange={onChangeHandler}
                            className="form-select"
                        >
                            <option value="">Select Hospital</option>
                            {hospitals.map((hospital) => (
                                <option key={hospital.HospitalId} value={hospital.HospitalId}>{hospital.HospitalName}</option>
                            ))}
                        </select>
                    </div>



                </div>





                <div className="row mb-3">


                </div>

                {/* Buttons */}
                <div className="row mt-4">
                    <div className="col text-center">
                        <button type="button" onClick={handleBackToView} className="btn btn-danger me-3">
                            Cancel
                        </button>
                        <button type="button" onClick={handleReset} className="btn btn-warning me-3">
                            Reset
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </div>

            </form>

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
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                >
                    <Alert onClose={handleSnackbarClose} severity="success">
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </TableContainer>
        </div>


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


export default EventAdd;
