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
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import CommonTables from "../../Commoncomponents/CommonTables";
import TableContainer from '@mui/material/TableContainer';
import ConfirmationDialogDelete from "../../Components/ConfirmationDialogDelete";
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';


import { fetchData, fetchUpdateData, fetchDeleteData } from "../../helpers/externapi";
import Layout from "../../Layout/Layout";

export default function RouteMap(props) {
    const [loading, setLoading] = useState(false);
    const [routeMapList, setRouteMapList] = useState([]);
    const [rmName, setRmName] = useState([]);
    const [telecallerName, setTelecallerName] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formVisible, setFormVisible] = useState(false);
    const [selectedRouteMap, setSelectedRouteMap] = useState(null);
    const [formData, setFormData] = useState({ RouteMapId: "", RouteName: "", RouteMaps: "", RMName: "", TelecallerName: "", routeMapAssigningId: "", telecallerId: "", rmId: "" });
    const [routeMapDialogOpen, setRouteMapDialogOpen] = useState(false);
    const [formErrors, setFormErrors] = useState({
        RouteName: '',
        RouteMaps: '',
        RMName: '',
        TelecallerName: ''
    });
    const [totalCount, setTotalCount] = React.useState(0);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [perPage, setPerPage] = React.useState(10);
    let UserId = localStorage.getItem('UserId');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [confirmationData, setConfirmationData] = useState({});


    const tableHeads = ["Route Name", "Route Map", "RM Name", "Tele Caller", "Actions"];

    const tableElements = routeMapList.length > 0 ?
        routeMapList.map(RouteData => ([
            <div className="text-start-important"
                style={{
                    whiteSpace: 'normal',
                    textAlign: 'start',
                    display: 'block',
                }}>
                {RouteData.RouteName}
            </div>,
            RouteData.RouteMaps && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <a href={RouteData.RouteMaps} target="_blank" rel="noopener noreferrer">Open Link</a>
                    <IconButton onClick={() => handleCopyLink(RouteData.RouteMaps)} size="small">
                        <ContentCopyIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleShareLink(RouteData.RouteMaps)} size="small">
                        <ShareIcon fontSize="small" />
                    </IconButton>
                </div>
            ),
            RouteData.RMName,
            RouteData.TelecallerName,
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <button
                    className="btn btn-sm btn-primary"
                    size="small"
                    style={customStyles.editButton}
                    onClick={() => handleEdit(RouteData)}
                >
                    Edit
                </button>
                <button
                    className="btn btn-sm btn-danger"
                    size="small"
                    sx={{ backgroundColor: 'red', color: 'white', '&:hover': { backgroundColor: 'darkred' } }}
                    onClick={() => handleDelete(RouteData.RouteMapId, RouteData.RouteMapAssigningId)}
                >
                    Delete
                </button>
            </div>
        ])) : [];

    const getRouteMap = async () => {
        try {
            const skip = (currentPage - 1) * perPage;
            const take = perPage;

            setLoading(true);

          
            const routeMapData = await fetchData("RouteMap/all", { skip, take });
            setRouteMapList(routeMapData);
           
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoading(false);
        }
    };


    const getUserRoleCountData = async () => {
        setLoading(true);
        try {
            const userRoleCountData = await fetchData(`CommonRowCount/GetTableRowCount`, { tableName: "RouteMap" });
            const totalCount = userRoleCountData[0]?.CountOfRecords || 0;
            setTotalCount(totalCount);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching hospital count data:", error);
            setLoading(false);
        }
    };
    const getUsers = async () => {
        try {
            setLoading(true);
            const usersData = await fetchData("Users/all", { "skip": 0, "take": 0 });
            const rmNameFilter = usersData.filter((data) => data.UserRoleId === 10);
            const telecallerNameFilter = usersData.filter((data) => data.UserRoleId === 109);
            setRmName(rmNameFilter);
            setTelecallerName(telecallerNameFilter);
        } catch (error) {
            console.error("Error fetching user roles data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getUserRoleCountData();
        getUsers();
    }, []);

    useEffect(() => {
        getRouteMap();
    }, [ currentPage, perPage]);

    const onChangeHandler = async (e) => {
        const { name, value } = e.target;

        setFormErrors({ ...formErrors, [name]: '' });

        if (name === "RMName") {
            const usersData = await fetchData("Users/all", { "skip": 0, "take": 0 });
            const rmIdFilter = usersData.filter((data) => data.UserRoleId === 10 && data.UserName === value);
            const getRmId = rmIdFilter[0].UserId
            setFormData({ ...formData, [name]: value, rmId: getRmId });
        } else if (name === "TelecallerName") {
            const usersData = await fetchData("Users/all", { "skip": 0, "take": 0 });
            const telecallerIdFilter = usersData.filter((data) => data.UserRoleId === 109 && data.UserName === value);
            const getTelecallerId = telecallerIdFilter[0].UserId
            setFormData({ ...formData, [name]: value, telecallerId: getTelecallerId });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleEdit = (RouteData) => {
        setIsEditMode(true);
        setFormVisible(true);
        setFormData({ RouteMapId: RouteData.RouteMapId, RouteName: RouteData.RouteName, RouteMaps: RouteData.RouteMaps, RMName: RouteData.RMName, TelecallerName: RouteData.TelecallerName, routeMapAssigningId: RouteData.RouteMapAssigningId, telecallerId: "", rmId: "" });
    };

    const handleAddNewRouteMap = () => {
        setIsEditMode(false);
        setFormVisible(true);
        setFormData({ RouteMapId: "", RouteName: "", RouteMaps: "", RMName: "", TelecallerName: "", routeMapAssigningId: "", telecallerId: "", rmId: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let valid = true;
        const newFormErrors = {
            RouteName: '',
            RouteMaps: '',
            RMName: '',
            TelecallerName: ''
        };

        // Validate form data
        if (!formData.RouteName) {
            newFormErrors.RouteName = 'Route Name is required';
            valid = false;
        }

        if (!formData.RouteMaps) {
            newFormErrors.RouteMaps = 'Route Map Link is required';
            valid = false;
        }

        if (!formData.RMName) {
            newFormErrors.RMName = 'RM Name is required';
            valid = false;
        }

        if (!formData.TelecallerName) {
            newFormErrors.TelecallerName = 'Telecaller Name is required';
            valid = false;
        }

        if (!valid) {
            setFormErrors(newFormErrors);
            return;
        }

        setLoading(true);
        try {
            let response;
            if (isEditMode) {
               
                response = await fetchUpdateData("RouteMap/update", {
                    RouteMapId: formData.RouteMapId,
                    RouteName: formData.RouteName,
                    RouteMaps: formData.RouteMaps,
                    RMName: formData.RMName,
                    userId: UserId,
                    TelecallerName: formData.TelecallerName
                });

                const routeMapIdFetch = await fetchData("RouteMap/all", { "skip": 0, "take": 0 });
                const routeMapIdFilter = routeMapIdFetch.filter((data) => data.RouteName === formData.RouteName);
                const getTelecallerId = routeMapIdFilter[0].RouteMapId;

                if (formData.routeMapAssigningId) {
                    response = await fetchUpdateData("RouteMapAssigning/update", {
                        routeMapAssigningId: formData.routeMapAssigningId,
                        rmId: formData.rmId,
                        telecallerId: formData.telecallerId,
                        routeMapId: getTelecallerId,
                    });

                   
                    await getRouteMap();
                    setSnackbarMessage("Route Map Updated Successfully!")
                    setSnackbarOpen(true);

                   
                } else {
                    console.error('routeMapAssigningId is undefined. Cannot update RouteMapAssigning.');
                }

            } else {
               
                response = await fetchData("RouteMap/add", {
                    RouteName: formData.RouteName,
                    RouteMaps: formData.RouteMaps,
                    RMName: formData.RMName,
                    userId: UserId,
                    TelecallerName: formData.TelecallerName
                });

                const routeMapIdFetch = await fetchData("RouteMap/all", { "skip": 0, "take": 0 });
                const routeMapIdFilter = routeMapIdFetch.filter((data) => data.RouteName === formData.RouteName);
                const getTelecallerId = routeMapIdFilter[0].RouteMapId;

                response = await fetchData("RouteMapAssigning/add", {
                    rmId: formData.rmId,
                    telecallerId: formData.telecallerId,
                    routeMapId: getTelecallerId,
                });

                await getRouteMap();
                setSnackbarMessage("Route Map added Successfully!")
                setSnackbarOpen(true);
            }
            
            
        } catch (error) {
            console.error("Error adding/updating Map:", error);
            if (error.response) {
                console.error("Response error:", error.response);
            }
            if (error.request) {
                console.error("Request error:", error.request);
            }
            console.error("Full error object:", error);
        } finally {
            setLoading(false);
            setFormData({ RouteMapId: "", RouteName: "", RouteMaps: "", RMName: "", TelecallerName: "", routeMapAssigningId: "", telecallerId: "", rmId: "" });
            setIsEditMode(false);
            setFormVisible(false);
        }
    };

    const handleDelete = (RouteMapId, RouteMapAssigningId) => {
        setConfirmationData({
            title: 'Delete Route Map',
            message: 'Are you sure you want to delete this RouteMap?',
            onConfirm: () => confirmhandleDelete(RouteMapId, RouteMapAssigningId),
        });
        setConfirmationOpen(true);
    };


    const confirmhandleDelete = async (RouteMapId ,RouteMapAssigningId ) => {
        try {
            setLoading(true);
            setConfirmationOpen(false);
            
            let response = await fetchDeleteData(`RouteMapAssigning/delete/${RouteMapAssigningId}`);
            
            if (response) { 
                response = await fetchDeleteData(`RouteMap/delete/${RouteMapId}`);
            } else {
                console.error("Failed to delete RouteMapAssigning. Aborting RouteMap deletion.");
            }

            setSnackbarMessage('RouteMap deleted Successfully');
            setSnackbarOpen(true);
            await getRouteMap();
        } catch (error) {
            console.error("Error deleting event:", error);
        } finally {
            setLoading(false);
        }
    };


    const handleClose = () => {
        setFormVisible(false);
    };

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

    

    useEffect(() => {
        if (selectedRouteMap && routeMapDialogOpen) {
            const mapOptions = {
                center: { lat: selectedRouteMap.latitude, lng: selectedRouteMap.longitude },
                zoom: 10,
            };

            const map = new window.google.maps.Map(document.getElementById('routeMapDialogMap'), mapOptions);
            new window.google.maps.Marker({
                position: { lat: selectedRouteMap.latitude, lng: selectedRouteMap.longitude },
                map,
                title: selectedRouteMap.RouteName,
            });
        }
    }, [selectedRouteMap, routeMapDialogOpen]);

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
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
                    <div style={customStyles.container}>
                        <h2 style={customStyles.header}>Route Maps List</h2>

                        <button
                            className="btn btn-primary"
                            onClick={handleAddNewRouteMap}
                            style={customStyles.addButton}
                        >
                            Add Route Map
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
                                    <Typography variant="h6">{isEditMode ? "Update Route Map" : "Add Route Map"}</Typography>
                                    <IconButton onClick={handleClose} style={{ color: 'red' }}>
                                        ✖
                                    </IconButton>
                                </div>
                            </DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    {isEditMode ? "Update the details of the route map." : "Fill in the details of the new route map."}
                                </DialogContentText>
                                <form noValidate autoComplete="off" onSubmit={handleSubmit}>
                                    <TextField
                                        name="RouteName"
                                        label="Route Name"
                                        value={formData.RouteName}
                                        onChange={onChangeHandler}
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        margin="normal"
                                        error={!!formErrors.RouteName}
                                        helperText={formErrors.RouteName}
                                    />
                                    <TextField
                                        name="RouteMaps"
                                        label="Insert Link Here"
                                        value={formData.RouteMaps}
                                        onChange={onChangeHandler}
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        margin="normal"
                                        error={!!formErrors.RouteMaps}
                                        helperText={formErrors.RouteMaps}
                                    />
                                    <div className="form-group">
                                        <label htmlFor="RM" className="form-label">RM Name</label>

                                        <select
                                            id="select2Success"
                                            name="RMName"
                                            className="form-select"
                                            value={formData.RMName}
                                            onChange={onChangeHandler}
                                            error={!!formErrors.RMName}
                                        >
                                            <option value="">--Select RM Name--</option>
                                            {rmName && rmName.map((option, index) => (
                                                <option key={'event' + index} value={option.RMName}>
                                                    {option.UserName}
                                                </option>
                                            ))}
                                        </select>
                                        {formErrors.RMName && (
                                            <small className="text-danger">{formErrors.RMName}</small>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="TelecallerName" className="form-label">Tele Caller Name</label>

                                        <select
                                            id="select2Success"
                                            name="TelecallerName"
                                            className="form-select"
                                            value={formData.TelecallerName}
                                            onChange={onChangeHandler}
                                            error={!!formErrors.TelecallerName}
                                        >
                                            <option value="">--Select Tele Caller Name--</option>
                                            {telecallerName && telecallerName.map((option, index) => (
                                                <option key={'event' + index} value={option.TelecallerName}>
                                                    {option.UserName}
                                                </option>
                                            ))}
                                        </select>
                                        {formErrors.TelecallerName && (
                                            <small className="text-danger">{formErrors.TelecallerName}</small>
                                        )}
                                    </div>
                                    <DialogActions>
                                        <Button onClick={handleClose} color="primary">
                                            Cancel
                                        </Button>
                                        <Button variant="contained" color="primary" type="submit">
                                            {isEditMode ? "Update Route Map" : "Add Route Map"}
                                        </Button>
                                    </DialogActions>
                                </form>
                            </DialogContent>
                        </Dialog>

                       
                    </div>
                </>
            )}
        </Layout>
    );
}

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

const customStyles = {
    container: {
        padding: '20px',
    },
    header: {
        marginBottom: '20px',
        textAlign: 'center',
    },
    addButton: {
        marginBottom: '20px',
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
    },
    tableContainer: {
        overflowX: 'auto',
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        padding: '10px',
        borderBottom: '2px solid #ddd',
        textAlign: 'left',
    },
    td: {
        padding: '10px',
        borderBottom: '1px solid #ddd',
    },
    tdCenter: {
        padding: '10px',
        borderBottom: '1px solid #ddd',
        textAlign: 'center',
    },
    editButton: {
        marginRight: '10px',
    },
    copyLinkLabel: {
        marginLeft: '5px',
        fontSize: '14px',
        cursor: 'pointer',
        color: '#007bff',
    },
};