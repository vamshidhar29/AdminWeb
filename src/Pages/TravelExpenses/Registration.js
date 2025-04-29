import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchData, fetchUpdateData } from '../../helpers/externapi';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

export default function Registration() {
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const navigate = useNavigate();

    const currentDate = new Date();

    let userId = localStorage.getItem('UserId');
    const [travelsActivitiesId, setTravelsActivitiesId] = useState(null);
    const [village, setVillage] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [mandal, setMandal] = useState('');
    const [profile, setProfile] = useState('');
    const [pincode, setPincode] = useState('');
    const [fullName, setFullName] = useState('');
    const [dayActivities, setDayActivities] = useState('');
    const [address, setAddress] = useState('');
    const [startingPoint, setStartingPoint] = useState('');
    const [endingPoint, setEndingPoint] = useState('');
    const [kiloMeters, setKiloMeters] = useState('');
    const [amountSpent, setAmountSpent] = useState('');
    const [productivity, setProductivity] = useState('');
    const [noofCardsIssued, setNoofCardsIssued] = useState('');
    const [wheelerType, setWheelerType] = useState('');
    const [remarks, setRemarks] = useState('');
    const [activitiesDate, setActivitiesDate] = useState('');
    const [routeOptions, setRouteOptions] = useState([]);
    const [formError, setFormError] = useState({});
    const [selectedRouteMap, setSelectedRouteMap] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    useEffect(() => {
        if (location.state && location.state.activity) {
            const activity = location.state.activity;
            setTravelsActivitiesId(activity.TravelActivitiesId);
            setVillage(activity.Village);
            setMobileNumber(activity.MobileNumber);
            setMandal(activity.Mandal);
            setProfile(activity.Profile);
            setPincode(activity.Pincode);
            setFullName(activity.FullName);
            setDayActivities(activity.DayActivities);
            setAddress(activity.Address);
            setStartingPoint(activity.StartingPoint);
            setEndingPoint(activity.EndingPoint);
            setKiloMeters(activity.Kilometers);
            setAmountSpent(activity.AmountSpent);
            setProductivity(activity.Productivity);
            setNoofCardsIssued(activity.NoofCardsIssued);
            setWheelerType(activity.WheelerType);
            setRemarks(activity.Remarks);
            setActivitiesDate(activity.ActivitiesDate);
            setSelectedRouteMap({ label: activity.RouteMapName, value: activity.RouteMapId });
        }
    }, [location.state]);

    useEffect(() => {
        const getRouteMap = async () => {
            setLoading(true);
            try {
                const usersData = await fetchData("RouteMap/all", { skip: 0, take: 0 });
                const routeMaps = usersData.map(route => ({ label: route.RouteName, value: route.RouteMapId }));
                setRouteOptions(routeMaps);
            } catch (error) {
                console.error('Error fetching route maps:', error);
            } finally {
                setLoading(false);
            }
        };

        getRouteMap();
    }, []);

    const handleRouteMapChange = (selectedRouteOption) => {
        setSelectedRouteMap(selectedRouteOption);
    };

    const handleCancel = () => {
        navigate('/travelexpenses/list');
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const isValid = validateForm();
        if (isValid) {
            setLoading(true);
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;

            const data = {
                travelActivitiesId: travelsActivitiesId,
                activitiesDate: formattedDate,
                userId,
                village,
                mobileNumber,
                mandal,
                pincode: parseInt(pincode),
                productivity,
                noofCardsIssued: parseInt(noofCardsIssued),
                profile,
                address,
                startingPoint,
                endingPoint,
                kilometers: kiloMeters,
                amountSpent,
                dayActivities,
                remarks,
                routeMapId: selectedRouteMap ? selectedRouteMap.value : null,
                fullName,
                wheelerType,
            };

            const updatedata = {
                travelActivitiesId: travelsActivitiesId,
                activitiesDate,
                userId,
                village,
                mobileNumber,
                mandal,
                pincode: parseInt(pincode),
                productivity,
                noofCardsIssued: parseInt(noofCardsIssued),
                profile,
                address,
                startingPoint,
                endingPoint,
                kilometers: kiloMeters,
                amountSpent,
                dayActivities,
                remarks,
                routeMapId: selectedRouteMap ? selectedRouteMap.value : null,
                fullName,
                wheelerType,
            };

            try {
                let response;
                if (location.state && location.state.activity) {
                    response = await fetchUpdateData(`TravelActivities/update`, updatedata);
                    setSnackbarMessage("Travel Activity Update Successfully");
                } else {
                    response = await fetchData('TravelActivities/add', data);
                    setSnackbarMessage("Travel Activity Added Successfully");

                }

                setIsSubmitted(true);

                setTimeout(() => {
                    setIsSubmitted(false);
                    navigate("/travelexpenses/list");
                }, 3000);

                setSnackbarOpen(true);

            } catch (error) {
                console.error('Error submitting activity:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    const validateForm = () => {
        let err = {};

        if (!fullName || fullName.trim() === '') {
            err.fullName = "Please enter a Full Name";
        }

        if (!mobileNumber || !/^\d{10}$/.test(mobileNumber)) {
            err.mobileNumber = "Please enter a valid 10-digit Mobile Number";
        }

        if (typeof mobileNumber === 'string' && mobileNumber.trim() === '') {
            err.mobileNumber = 'Please enter a valid 10-digit mobile number';
        } else if (!/^[6-9]\d{9}$/.test(mobileNumber.trim())) {
            err.mobileNumber = 'Mobile Number must start with 6, 7, 8, or 9 and must be 10 digits';
        }

        if (!selectedRouteMap || !selectedRouteMap.value) {
            err.routeMap = "Please select a Route Map";
        }

        if (!profile || profile.trim() === '') {
            err.profile = "Please enter a Profile";
        }

        if (!pincode || !/^\d{6}$/.test(pincode)) {
            err.pincode = "Please enter a valid 6-digit Pincode";
        }

        if (!startingPoint || startingPoint.trim() === '') {
            err.startingPoint = "Please enter a Starting Point";
        }

        if (!endingPoint || endingPoint.trim() === '') {
            err.endingPoint = "Please enter a Ending Point";
        }

        if (!wheelerType || wheelerType.trim() === '') {
            err.wheelerType = "Please select Wheeler Type";
        }


        if (location.state && location.state.activity) {
            if (!dayActivities || dayActivities.trim() === '') {
                err.dayActivities = "Please enter Day Activities";
            }
        }
        setFormError(err);
        return Object.keys(err).length === 0;
    };

    return (
        <div style={styles.cardContainer}>
            <div className="card">
                <div className="card-header" style={{ backgroundColor: 'white' }}>
                    <h2 style={styles.activity}>Activity</h2>
                </div>
                <div className="card-body" style={styles.container}>
                    <form onSubmit={handleSubmit}>

                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Full Name  <span className="required" style={{ color: "red" }}> *</span></label>

                                <input
                                    style={styles.input}
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Enter Distributor Name"
                                    maxLength={20}
                                    readOnly={location.state && location.state.activity ? true : false}
                                />
                                {formError.fullName && (
                                    <div className="text-danger mt-1">{formError.fullName}</div>
                                )}
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    Mobile Number <span className="required" style={{ color: "red" }}> *</span>
                                </label>

                                <input
                                    style={styles.input}
                                    type="tel" 
                                    value={mobileNumber}
                                    onChange={(e) => {
                                        const inputValue = e.target.value;
                                        
                                        if (/^\d{0,10}$/.test(inputValue)) {
                                            setMobileNumber(inputValue);
                                        }
                                    }}
                                    placeholder="Enter Mobile Number"
                                    maxLength={10} 
                                    pattern="\d{10}" 
                                    readOnly={location.state && location.state.activity ? true : false}
                                />
                                {formError.mobileNumber && (
                                    <div className="text-danger mt-1">{formError.mobileNumber}</div>
                                )}
                            </div>

                        </div>

                        <div style={styles.formRow}>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Route Map Name  <span className="required" style={{ color: "red" }}> *</span></label>

                                <select
                                    id="rm-input"
                                    className="form-select"
                                    onChange={(e) => handleRouteMapChange({ label: e.target.options[e.target.selectedIndex].text, value: e.target.value })}
                                    value={selectedRouteMap ? selectedRouteMap.value : ''}
                                    readOnly={location.state && location.state.activity ? true : false}
                                >
                                    <option value="">Select... </option>
                                    {routeOptions.map((option, index) => (
                                        <option key={index} value={option.value}>{option.label}</option>
                                    ))}

                                </select>
                                {formError.routeMap && (
                                    <div className="text-danger mt-1">{formError.routeMap}</div>
                                )}
                            </div>


                            <div style={styles.formGroup}>
                                <label style={styles.label}>Profile  <span className="required" style={{ color: "red" }}> *</span></label>

                                <input
                                    style={styles.input}
                                    type="text"
                                    value={profile}
                                    onChange={(e) => setProfile(e.target.value)}
                                    placeholder="Enter Profile"
                                    readOnly={location.state && location.state.activity ? true : false}
                                    maxLength={20}
                                />
                                {formError.profile && (
                                    <div className="text-danger mt-1">{formError.profile}</div>
                                )}
                            </div>
                        </div>

                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Address</label>
                                <input
                                    style={styles.input}
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Enter Address"
                                    maxLength={100}
                                    readOnly={location.state && location.state.activity ? true : false}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Village</label>
                                <input
                                    style={styles.input}
                                    type="text"
                                    value={village}
                                    onChange={(e) => setVillage(e.target.value)}
                                    placeholder="Enter Village"
                                    maxLength={50}
                                    readOnly={location.state && location.state.activity ? true : false}
                                />
                            </div>
                        </div>

                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Mandal:</label>
                                <input
                                    style={styles.input}
                                    type="text"
                                    value={mandal}
                                    onChange={(e) => setMandal(e.target.value)}
                                    placeholder="Enter Mandal"
                                    maxLength={50}
                                    readOnly={location.state && location.state.activity ? true : false}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Pincode  <span className="required" style={{ color: "red" }}> *</span></label>

                                <input
                                    style={styles.input}
                                    type="text"
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value)}
                                    placeholder="Enter Pincode"
                                    readOnly={location.state && location.state.activity ? true : false}
                                    maxLength={6}
                                />
                                {formError.pincode && (
                                    <div className="text-danger mt-1">{formError.pincode}</div>
                                )}
                            </div>
                        </div>

                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Starting Point  <span className="required" style={{ color: "red" }}> *</span></label>

                                <input
                                    style={styles.input}
                                    type="text"
                                    value={startingPoint}
                                    onChange={(e) => setStartingPoint(e.target.value)}
                                    placeholder="Enter Starting Point"
                                    maxLength={50}
                                />
                                {formError.startingPoint && (
                                    <div className="text-danger mt-1">{formError.startingPoint}</div>
                                )}
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Ending Point <span className="required" style={{ color: "red" }}> *</span></label>

                                <input
                                    style={styles.input}
                                    type="text"
                                    value={endingPoint}
                                    onChange={(e) => setEndingPoint(e.target.value)}
                                    placeholder="Enter Ending Point"
                                    maxLength={50}
                                />
                                {formError.endingPoint && (
                                    <div className="text-danger mt-1">{formError.endingPoint}</div>
                                )}
                            </div>
                        </div>

                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Kilo Meters</label>
                                <input
                                    style={styles.input}
                                    type="text"
                                    value={kiloMeters}
                                    onChange={(e) => setKiloMeters(e.target.value)}
                                    placeholder="Enter Kilo Meters"
                                    maxLength={10}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Wheeler Type <span className="required" style={{ color: "red" }}> *</span></label>

                                <div style={styles.checkboxContainer}>
                                    <label style={styles.radioLabel}>
                                        <input
                                            type="radio"
                                            value="2 Wheeler"
                                            checked={wheelerType === '2 Wheeler'}
                                            onChange={() => setWheelerType('2 Wheeler')}
                                            style={styles.radioButton}
                                        />
                                        2 Wheeler
                                    </label>
                                    <label style={styles.radioLabel}>
                                        <input
                                            type="radio"
                                            value="4 Wheeler"
                                            checked={wheelerType === '4 Wheeler'}
                                            onChange={() => setWheelerType('4 Wheeler')}
                                            style={styles.radioButton}
                                        />
                                        4 Wheeler
                                    </label>
                                    {formError.wheelerType && (
                                        <div className="text-danger mt-1">{formError.wheelerType}</div>
                                    )}
                                </div>
                            </div>

                        </div>

                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Amount Spent:</label>
                                <input
                                    style={styles.input}
                                    type="text"
                                    value={amountSpent}
                                    onChange={(e) => setAmountSpent(e.target.value)}
                                    placeholder="Enter Value"
                                    maxLength={20}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>No of Cards Issued:</label>
                                <input
                                    style={styles.input}
                                    type="text"
                                    value={noofCardsIssued}
                                    onChange={(e) => setNoofCardsIssued(e.target.value)}
                                    placeholder="Enter No of Cards Issued"
                                    maxLength={10}
                                />
                            </div>
                        </div>

                        <div style={styles.formRow}>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Day Activities:</label>
                                <textarea
                                    style={styles.textarea}
                                    value={dayActivities}
                                    onChange={(e) => setDayActivities(e.target.value)}
                                    placeholder="Enter Day Activities"
                                    maxLength={500}
                                />

                                {location.state && formError.dayActivities && (
                                    <div className="text-danger mt-1">{formError.dayActivities}</div>
                                )}
                            </div>


                            <div style={styles.formGroup}>
                                <label style={styles.label}>Remarks:</label>
                                <textarea
                                    style={styles.textarea}
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder="Enter Remarks"
                                    maxLength={500}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Productivity:</label>
                                <textarea
                                    style={styles.textarea}
                                    value={productivity}
                                    onChange={(e) => setProductivity(e.target.value)}
                                    placeholder="Enter Productivity"
                                    maxLength={20}
                                />
                            </div>
                        </div>

                        <button type="submit" style={styles.button}>
                            {loading ? 'Submitting...' : 'Submit'}
                        </button>
                        <button type="button" style={styles.cancelButton} onClick={handleCancel}>
                            Cancel
                        </button>



                    </form>


                </div>
                
            </div>

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

        </div>

    );
}

const styles = {
    cardContainer: {
        minHeight: '100vh',
        backgroundColor: '#f0f0f0',
    },
    container: {
        width: '100%',
        padding: 20,
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        backgroundColor: 'white',
        borderRadius: 8,
    },
    formRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    formGroup: {
        flex: 1,
        marginRight: 10,
    },
    label: {
        marginBottom: 5,
        display: 'block',
        fontWeight: 'bold',
    },
    input: {
        width: '100%',
        padding: '10px 15px',
        fontSize: 16,
        borderRadius: 4,
        border: '1px solid #ccc',
        boxSizing: 'border-box',
    },
    textarea: {
        width: '100%',
        padding: '10px 15px',
        fontSize: 16,
        borderRadius: 4,
        border: '1px solid #ccc',
        minHeight: 100,
        resize: 'vertical',
        boxSizing: 'border-box',
    },
    button: {
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        padding: '12px 20px',
        fontSize: 16,
        borderRadius: 4,
        cursor: 'pointer',
        marginTop: 5,
    },
    cancelButton: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '12px 20px',
        fontSize: 16,
        borderRadius: 4,
        cursor: 'pointer',
        marginTop: 5,
        marginLeft: '20px'
    },
    checkboxContainer: {
        marginBottom: 10,
    },
    checkboxLabel: {
        marginRight: 15,
        fontSize: 14,
    },
    activity: {
        marginBottom: 5,
        fontWeight: 'bold',
        color: 'black',
    },
    radioLabel: {
        marginRight: 15,
        fontSize: 16,
        display: 'inline-flex',
        alignItems: 'center',
    },
    radioButton: {
        marginRight: 5,
        width: 20,
        height: 20,
        cursor: 'pointer',
    },

};
