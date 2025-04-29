import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { formatDate1 } from '../../Commoncomponents/CommonComponents';
import TableContainer from '@mui/material/TableContainer';
import ConfirmationDialogDelete from "../../Components/ConfirmationDialogDelete";
import Paper from '@mui/material/Paper';
import { fetchData, fetchUpdateData, fetchDeleteData, fetchAllData } from "../../helpers/externapi";
import Layout from "../../Layout/Layout";
import { constructCompleteAddress } from '../../Commoncomponents/CommonComponents';

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

const List = (props) => {
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

    const tableHeads = ["Event Name", "Event Type", "Address", "Event Date", "Conducted By", "Created By"];

    const tableElements = events && events.length > 0 ?
        events.map((event) => ([
            <Link
                to={`/HealthCampEvents/details/${event.EventId}`}
                className="text-start-important"
                style={{
                    whiteSpace: "normal",
                    textAlign: "start",
                    display: "block",
                }}
            >
                {event.EventName}
            </Link>,
            event.EventType,
            event.completeAddress,
            formatDate1(event.EventDate),
            event.ConductedBy,
            event.UserName

        ])) : [];

    const getEvent = async () => {
        try {
            const skip = (currentPage - 1) * perPage;
            const take = perPage;

            setLoading(true);
            const eventData = await fetchData("Event/all", { skip, take });

            const dataToDisplay = eventData.map(event => ({
                ...event,
                completeAddress: constructCompleteAddress(event)
            }));
            setEvents(dataToDisplay);
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

    const filterUI = () => (
        <div className="card p-1 my-1 sticky-top" style={{ zIndex: 1 }}>



            <div className="row align-items-center">
                <div className="col-4 col-md-4">
                    <ul className="nav nav-md nav-pills">
                        <li className="nav-item">
                            <Link
                                className={`nav-link`}
                                to={`/HealthCampEvents/new`}
                            >
                                <i className="tf-icons navbar-icon bx bx-plus-circle"></i>&nbsp;Add New
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* <div className="col-8 col-md-4">
                        <div>
                            <label htmlFor="search-input" className="form-label">Name or Mobile Number</label>
                            <div style={{ position: 'relative', maxWidth: '350px' }}>
                                <input
                                    type="text"
                                    id="search-input"
                                    className="form-control"
                                    style={{ paddingLeft: '30px' }}
                                    maxLength="50"
                                    value={input}
                                    onChange={handleInputChange}
                                />
                                {input && (
                                    <i
                                        className="fas fa-times-circle"
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            fontSize: '16px',
                                            color: 'red',
                                            cursor: 'pointer'
                                        }}
                                        onClick={clearSearch}
                                    ></i>
                                )}
                                {searchLoading && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            right: '40px',
                                            top: '50%',
                                            transform: 'translateY(-50%)'
                                        }}
                                    >
                                        <div className="spinner-border text-primary" role="status" style={{ width: '1.5rem', height: '1.5rem' }}>
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                )}
    
    
                                {input && !searchLoading && suggestions.length > 0 && (
                                    <ul
                                        style={{
                                            listStyleType: 'none',
                                            padding: '0',
                                            margin: '0',
                                            border: '1px solid #00796b',
                                            borderRadius: '4px',
                                            maxHeight: '200px',
                                            overflowY: 'auto',
                                            position: 'absolute',
                                            width: '100%',
                                            backgroundColor: '#fff',
                                            zIndex: 10,
                                            top: '100%',
                                            left: '0'
                                        }}
                                    >
                                        {suggestions.map((suggestion, index) => (
                                            <li
                                                key={index}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                style={{
                                                    padding: '8px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    position: 'relative'
                                                }}
                                            >
                                                <i
                                                    className="fas fa-arrow-up-left"
                                                    style={{
                                                        marginRight: '8px',
                                                        color: '#00796b'
                                                    }}
                                                ></i>
                                                <span style={{ flex: 1 }}>{suggestion.Concatenated}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
    
    
                                {input && !searchLoading && error && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: '0',
                                            color: 'red',
                                            fontSize: '0.9rem',
                                            marginTop: '4px',
                                            backgroundColor: '#fff', // Matches suggestion background
                                            border: '1px solid #00796b', // Matches suggestion border
                                            borderRadius: '4px', // Matches suggestion border-radius
                                            padding: '8px', // Adds spacing similar to suggestions
                                            zIndex: 10, // Ensures it appears above other elements
                                            width: '100%' // Ensures it aligns with the input width
                                        }}
                                    >
                                        {error}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div> */}



            </div>
        </div>
    );

    return (
        <>
            {loading && skeletonloading()}
            {!loading && (

                <>

                    {filterUI()}


                    <div className="card mt-2">
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


                </>
            )}
        </>
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


export default List;
