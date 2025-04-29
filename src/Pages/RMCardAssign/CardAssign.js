import React, { useEffect, useState } from "react";
import Cleave from 'cleave.js/react';
import { fetchAllData, fetchData } from "../../helpers/externapi";
import { useParams } from "react-router-dom";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { Card } from "@mui/material";

export default function CardAssign() {
    const [loading, setLoading] = React.useState(true);
    const [cardsNumber, setCardsNumber] = useState('2804 00');
    const [ohoCardNumber, setOhoCardNumber] = useState('2804 00');
    const [lastOhoCardNumber, setLastOhoCardNumber] = useState('2804 00');
    const [numberOfCards, setNumberOfCards] = useState(null);
    const [numberofCardstoAssign, setnumberofCardstoAssign] = useState()
    const [ohoLastCardNumber, setOhoLastCardNumber] = useState('');
    const [cardsNumberError, setCardsNumberError] = useState('');
    const [lastCardNumberError, setLastCardNumberError] = useState('');
    const [numberOfCardstoAssignError, setNumberOfCardstoAssignError] = useState('');
    let UserId = localStorage.getItem("UserId");
    const id = useParams();
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [rmOptions, setRmOptions] = useState([]);
    const [selectedRegionalManager, setSelectedRegionalManager] = useState('');
    const [selectedRegionalManagerError, setSelectedRegionalManagerError] = useState('');
    const [tabs, setTabs] = useState('selectedCards');
    const [selectedCards, setSelectedCards] = useState([]);
    const [assignError, setAssignError] = useState('');
    const [assignLoading, setAssignLoading] = useState(false);
    const [assignSuccess, setAssignSuccess] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [snackbarStyle, setSnackbarStyle] = useState({});
    const [snackbarProperties, setSnackbarProperties] = useState({
        open: false,
        message: '',
        severity: 'success', // or 'error'
    });

    const Alert = React.forwardRef(function Alert(props, ref) {
        return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
    });

    const handleChange = (e) => {
        let inputValue = e.target.value;

        if (inputValue.length < 7) {
            setCardsNumber('2804 00')
        } else {
            setCardsNumber(e.target.value);
        }
    };
    const handleClose = () => {
        setSnackbarProperties(prev => ({
            ...prev,
            open: false
        }));
    };


    const handleOhoCardChange = (e) => {
        let inputValue = e.target.value;

        if (inputValue.length < 7) {
            setOhoCardNumber('2804 00')
        } else {
            setOhoCardNumber(e.target.value);

            if (tabs === 'rangeOfCards' && e.target.value.length === 14) {
                setSelectedCards([e.target.value]);
            }
        }
    };

    const handleLastOhoCardChange = (e) => {
        let inputValue = e.target.value;

        if (inputValue.length < 7) {
            setLastOhoCardNumber('2804 00')
        } else {
            setLastOhoCardNumber(e.target.value);

            if (tabs === 'rangeOfCards' && e.target.value.length === 14) {
                setSelectedCards([e.target.value]);
            }
        }
    };


    useEffect(() => {
        const start = parseInt(ohoCardNumber.replace(/\s/g, ""), 10);
        const end = parseInt(lastOhoCardNumber.replace(/\s/g, ""), 10);

        if (!isNaN(start) && !isNaN(end)) {
            if (end >= start) {
                setnumberofCardstoAssign(end - start + 1);
            } else {
                setnumberofCardstoAssign(0);
            }
        } else {
            setnumberofCardstoAssign(0);
        }
    }, [ohoCardNumber, lastOhoCardNumber]);

    useEffect(() => {
        const getUsers = async () => {
            try {
                setLoading(true);
                const usersData = await fetchAllData(`lambdaAPI/Employee/GetRMNames`);

                const routeMaps = usersData && usersData.map(route => ({ label: route.UserName, value: route.UserId }));

                setRmOptions(routeMaps);

            } catch (error) {
                console.error("Error fetching user roles data:", error);
            } finally {
                setLoading(false);
            }
        };

        getUsers();
    }, []);

    const handleAssignCardChange = (e) => {
        const value = e.target.value;

        if (value === '' || (!isNaN(value) && Number(value) >= 0)) {
            setnumberofCardstoAssign(value === '' ? null : parseInt(value, 10));
        }
    };

    const handleAdd = async () => {
        // First, check if card number is valid
        if (cardsNumber.length < 14) {
            setCardsNumberError('Card number must be 12 digits long.');
            return; // Exit early if validation fails
        }

        setCardsNumberError(""); // Clear previous error

        try {
            // Make the API call
            const response = await fetchData('lambdaAPI/OHOCards/updateMissingCardsInactive', {
                cardNumber: cardsNumber
            });

            // Close existing snackbar first and wait
            setSnackbarOpen(false);
            await new Promise(resolve => setTimeout(resolve, 500));

            if (!response || response.status === false) {
                // Handle error case
                const errorMessage = (response && response.message) || 'Failed to deactivate card';

                // Create a complete snackbar config object
                const snackbarConfig = {
                    open: true,
                    message: errorMessage,
                    severity: 'error',
                    // If you have a way to set these properties all at once, use it:
                    // color: 'error',
                    // variant: 'filled',
                    // anchorOrigin: { vertical: 'bottom', horizontal: 'center' }
                };

                // Apply all properties at once or as close together as possible
                setSnackbarProperties(snackbarConfig); // Assuming you have this function

                // If you don't have a setSnackbarProperties function:
                // setSnackbarMessage(errorMessage);
                // setSnackbarSeverity('error');
                // setSnackbarOpen(true);
            } else {
                // Success case
                const snackbarConfig = {
                    open: true,
                    message: 'Deactivated card successfully!',
                    severity: 'success'
                };

                setSnackbarProperties(snackbarConfig); // Assuming you have this function

                // If you don't have a setSnackbarProperties function:
                // setSnackbarMessage('Deactivated card successfully!');
                // setSnackbarSeverity('success');
                // setSnackbarOpen(true);
            }

        } catch (error) {
            console.error('Error:', error);

            setSnackbarOpen(false);
            await new Promise(resolve => setTimeout(resolve, 500));

            const snackbarConfig = {
                open: true,
                message: 'Failed to deactivate card. Please try again.',
                severity: 'error'
            };

            setSnackbarProperties(snackbarConfig); // Assuming you have this function

            // If you don't have a setSnackbarProperties function:
            // setSnackbarMessage('Failed to deactivate card. Please try again.');
            // setSnackbarSeverity('error');
            // setSnackbarOpen(true);
        }
    };

    const handleAssignCard = async () => {
        if (tabs === 'selectedCards') {
            if (selectedCards.length < 1) {
                setCardsNumberError('Add atleast one card number');
            } else if (selectedRegionalManager === '') {
                setSelectedRegionalManagerError('Select a RM Name');
            } else {
                setCardsNumberError("");
                setSelectedRegionalManagerError('');

                try {
                    setAssignLoading(true);

                    const CardAssignresponse = await fetchData('lambdaAPI/OHOCards/AssignCardsToRMs', {
                        ohocardnumber: selectedCards,
                        noofassigns: 0,
                        rmid: selectedRegionalManager,
                        userId: UserId,
                    });

                    if (!CardAssignresponse || CardAssignresponse === undefined) {
                        setAssignError('Something went wrong. Please Contact Technical Team');
                    } else {
                        if (!CardAssignresponse.status) {
                            setAssignError(CardAssignresponse.message);
                        } else {
                            setSnackbarMessage(CardAssignresponse.message);
                            setSnackbarOpen(true);
                            setAssignError('');
                            setSelectedCards([]);
                            setOhoCardNumber('2804 00');
                            setnumberofCardstoAssign();
                            setSelectedRegionalManager('');
                        }
                    }

                    setAssignLoading(false);

                } catch (error) {
                    console.error('Error:', error);
                    setSnackbarMessage('Failed to Assign cards. Please try again.');
                    setSnackbarOpen(true);
                    setAssignLoading(false);
                }
            }
        } else {
            if (ohoCardNumber.length < 14) {
                setCardsNumberError('Card number must be 12 digits long.');
            }
            else if (lastOhoCardNumber.length < 14) {
                setLastCardNumberError('Card number must be 12 digits long.');
            } else if (numberofCardstoAssign === null || numberofCardstoAssign <= 0) {
                setNumberOfCardstoAssignError('Value must grater than 0');
            } else if (selectedRegionalManager === '') {
                setSelectedRegionalManagerError('Select a RM Name');
            } else {
                setCardsNumberError("");
                setLastCardNumberError("");
                setNumberOfCardstoAssignError('');
                setSelectedRegionalManagerError('');

                try {
                    setAssignLoading(true);

                    const CardAssignresponse = await fetchData('lambdaAPI/OHOCards/AssignCardsToRMs', {
                        ohocardnumber: [ohoCardNumber],
                        noofassigns: numberofCardstoAssign,
                        rmid: selectedRegionalManager,
                        userId: UserId,
                    });

                    if (!CardAssignresponse || CardAssignresponse === undefined) {
                        setAssignError('Something went wrong. Please Contact Technical Team');
                    } else {
                        if (!CardAssignresponse.status) {
                            setAssignError(CardAssignresponse.message);
                        } else {
                            setSnackbarMessage(CardAssignresponse.message);
                            setSnackbarOpen(true);
                            setAssignError('');
                            if (CardAssignresponse.assignedCardNumbers.length === 1) {
                                setAssignSuccess(`${CardAssignresponse.cardsAssigned} card assigned ${CardAssignresponse.assignedCardNumbers[0]}`)
                            } else if (CardAssignresponse.assignedCardNumbers.length > 1) {
                                setAssignSuccess(`${CardAssignresponse.cardsAssigned} cards assigned from ${CardAssignresponse.assignedCardNumbers[0]} to ${CardAssignresponse.assignedCardNumbers[1]}`)
                            }

                            setTimeout(() => {
                                setSelectedCards([]);
                                setOhoCardNumber('2804 00');
                                setLastOhoCardNumber('2804 00');
                                setAssignSuccess("");
                                setnumberofCardstoAssign();
                                setSelectedRegionalManager('');
                            }, 5000);
                        }
                    }

                    setAssignLoading(false);

                } catch (error) {
                    console.error('Error:', error);
                    setSnackbarMessage('Failed to Assign cards. Please try again.');
                    setSnackbarOpen(true);
                    setAssignLoading(false);
                }
            }
        }

    };

    const handleSelectedCards = () => {
        setSelectedCards(preVal => ([
            ...preVal, ohoCardNumber
        ]));

        setOhoCardNumber('2804 00');
    };

    const removeSelectedCards = (card) => {
        setSelectedCards(preVal => (
            preVal.filter((item) => item !== card)
        ))
    };

    const handleRegionalManagerChange = (selectedResponse) => {
        setSelectedRegionalManager(selectedResponse);
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const CardcustomStyles = {
        header: {
            marginBottom: '10px',
            color: '#333',
        },
    };
    const showSuccessMessage = (message) => {
        setSnackbarSeverity('success');
        setSnackbarMessage(message);
        setSnackbarOpen(true);
    };

    const showErrorMessage = (message) => {
        setSnackbarSeverity('error');
        setSnackbarMessage(message);
        setSnackbarOpen(true);
    };
    return (
        <>
            <div className="bg-white" style={{ padding: '20px', borderRadius: '5px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
                <h2 style={CardcustomStyles.header}>Missing OHO Cards</h2>
                <div style={{ display: 'flex', alignItems: 'center' }}>

                    <div style={{ marginRight: '15px', height: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <label className="form-label" style={{ marginBottom: '5px', display: 'block', fontWeight: '500' }}>Enter card number to deavtivate</label>
                        <Cleave
                            type="tel"
                            placeholder="Enter From Oho Card series number"
                            maxLength={14}
                            onChange={handleChange}
                            value={cardsNumber}
                            options={{
                                blocks: [4, 4, 4],
                                delimiter: ' ',
                                numericOnly: true
                            }}
                            style={{ padding: '8px', borderRadius: '3px', border: '1px solid #ccc' }}
                        />
                        {cardsNumberError && (
                            <div style={{ color: 'red', fontWeight: 'bold' }}>
                                {cardsNumberError}
                            </div>
                        )}



                    </div>

                    <button
                        onClick={handleAdd}
                        style={{ padding: '10px 16px', cursor: 'pointer' }}
                        className="btn btn-primary"
                    >
                        Deactivate
                    </button>
                </div>
            </div>

            <div className="bg-white" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px', borderRadius: '10px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', width: '100%', marginTop: '20px' }}>
                <h2 style={{ ...CardcustomStyles.header, marginBottom: '10px' }}>OHO Cards Assigning To RM</h2>

                <ul className="nav nav-md nav-pills">
                    <li className="nav-item">
                        <a
                            className={`nav-link ${tabs === "selectedCards" ? "active" : ""}`}
                            onClick={(e) => setTabs('selectedCards')}
                        >
                            Selected Cards
                        </a>
                    </li>
                    <li className="nav-item">
                        <a
                            className={`nav-link ${tabs === "rangeOfCards" ? "active" : ""}`}
                            onClick={(e) => setTabs('rangeOfCards')}
                        >
                            Range of Cards
                        </a>
                    </li>
                </ul>

                {tabs === 'selectedCards' ? (
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 250px', minWidth: '250px' }}>
                            <label htmlFor="first-oho-card" className="form-label" style={{ marginBottom: '5px', display: 'block', fontWeight: '500' }}>First OHO Card Series Number</label>

                            <Cleave
                                type="tel"
                                placeholder="Enter From Oho Card series number"
                                maxLength={14}
                                onChange={handleOhoCardChange}
                                value={ohoCardNumber}
                                options={{
                                    blocks: [4, 4, 4],
                                    delimiter: ' ',
                                    numericOnly: true
                                }}
                                style={{ padding: '10px', borderRadius: '3px', border: '1px solid #ccc', width: '100%' }}
                            />
                            {cardsNumberError && (
                                <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                    {cardsNumberError}
                                </div>
                            )}
                        </div>

                        <button
                            className="btn btn-primary align-self-end"
                            disabled={ohoCardNumber.length < 14}
                            onClick={handleSelectedCards}
                        >
                            Add
                        </button>

                        <div style={{ flex: '1 1 250px', minWidth: '250px' }}>
                            <label htmlFor="rm-input" className="form-label" style={{ marginBottom: '5px', display: 'block', fontWeight: '500' }}>Relationship Manager</label>
                            <select
                                id="rm-input"
                                className="form-select"
                                onChange={(e) => handleRegionalManagerChange(e.target.value)}
                                value={selectedRegionalManager || ''}
                                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' }}
                            >
                                <option value="">Select... </option>
                                {rmOptions && rmOptions.map((option, index) => (
                                    <option key={index} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                            {selectedRegionalManagerError && (
                                <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                    {selectedRegionalManagerError}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 250px', minWidth: '250px' }}>
                            <label htmlFor="first-oho-card" className="form-label" style={{ marginBottom: '5px', display: 'block', fontWeight: '500' }}>First OHO Card Series Number</label>

                            <Cleave
                                type="tel"
                                placeholder="Enter From Oho Card series number"
                                maxLength={14}
                                onChange={handleOhoCardChange}
                                value={ohoCardNumber}
                                options={{
                                    blocks: [4, 4, 4],
                                    delimiter: ' ',
                                    numericOnly: true
                                }}
                                style={{ padding: '10px', borderRadius: '3px', border: '1px solid #ccc', width: '100%' }}
                            />
                            {cardsNumberError && (
                                <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                    {cardsNumberError}
                                </div>
                            )}

                        </div>

                        <div style={{ flex: '1 1 250px', minWidth: '250px' }}>
                            <label htmlFor="first-oho-card" className="form-label" style={{ marginBottom: '5px', display: 'block', fontWeight: '500' }}>Last OHO Card Series Number</label>

                            <Cleave
                                type="tel"
                                placeholder="Enter From Oho Card series number"
                                maxLength={14}
                                onChange={handleLastOhoCardChange}
                                value={lastOhoCardNumber}
                                options={{
                                    blocks: [4, 4, 4],
                                    delimiter: ' ',
                                    numericOnly: true
                                }}
                                style={{ padding: '10px', borderRadius: '3px', border: '1px solid #ccc', width: '100%' }}
                                disabled={ohoCardNumber.length !== 14}
                            />
                            {lastCardNumberError && (
                                <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                    {lastCardNumberError}
                                </div>
                            )}

                        </div>


                        {/* Display Total Cards */}
                        {ohoCardNumber.length === 14 &&
                            lastOhoCardNumber.length === 14 &&
                            parseInt(lastOhoCardNumber.replace(/\s/g, "")) >=
                            parseInt(ohoCardNumber.replace(/\s/g, "")) && (
                                <div style={{ fontSize: "16px", color: "green", marginBottom: "10px", marginTop: '15px' }}>
                                    Total Cards: {numberofCardstoAssign}
                                </div>
                            )}

                        {/* <div style={{ flex: '1 1 250px', minWidth: '250px' }}>
                            <label htmlFor="last-oho-card" className="form-label" style={{ marginBottom: '5px', display: 'block', fontWeight: '500' }}>Last OHO Card Series Number</label>
                            <Cleave
                                type="tel" placeholder="Last OHO Card Series Number"
                                maxLength={15}
                                value={ohoLastCardNumber}
                                options={{ blocks: [4], delimiter: ' ', creditCard: true }}
                                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' }}
                            />

                        </div> */}

                        <div style={{ flex: '1 1 250px', minWidth: '250px' }}>
                            <label htmlFor="rm-input" className="form-label" style={{ marginBottom: '5px', display: 'block', fontWeight: '500' }}>Relationship Manager</label>
                            <select
                                id="rm-input"
                                className="form-select"
                                onChange={(e) => handleRegionalManagerChange(e.target.value)}
                                value={selectedRegionalManager || ''}
                                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' }}
                            >
                                <option value="">Select... </option>
                                {rmOptions && rmOptions.map((option, index) => (
                                    <option key={index} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                            {selectedRegionalManagerError && (
                                <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                    {selectedRegionalManagerError}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {tabs === 'selectedCards' && (
                    <ul className="d-flex flex-row list-unstyled fs-5">
                        {selectedCards && selectedCards.length > 0 && selectedCards.map(card => (
                            <li key={card} className="me-3 badge bg-label-secondary">
                                {card}
                                <i className="bi bi-x ms-2"
                                    onClick={() => removeSelectedCards(card)}
                                    style={{ cursor: 'pointer' }}
                                ></i>
                            </li>
                        ))}
                    </ul>
                )}

                {assignError && assignError.length > 0 && (
                    <p className="text-danger text-end m-0 p-0">{assignError}</p>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={handleAssignCard}
                        style={{ padding: '12px 30px', minWidth: '150px', minHeight: '50px' }}
                        className="btn btn-primary"
                        disabled={assignLoading}
                    >
                        {assignLoading ? (
                            <div class="spinner-border text-white" role="status">
                                <span class="sr-only">Loading...</span>
                            </div>
                        ) : "Assign Card"}
                    </button>
                </div>

                {assignSuccess && assignSuccess.length > 0 && (
                    <span className="text-success text-end">{assignSuccess}</span>
                )}
            </div >
            <Snackbar
  open={snackbarProperties.open}
  autoHideDuration={3000}
  onClose={handleClose}
  anchorOrigin={{ vertical: 'top', horizontal: 'right' }} // <-- Top Right
>
  <Alert
    onClose={handleClose}
    severity={snackbarProperties.severity}
    sx={{ width: '100%' }}
  >
    {snackbarProperties.message}
  </Alert>
</Snackbar>


            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                {snackbarMessage && snackbarMessage !== undefined && snackbarMessage.includes('exists') ? (
                    <Alert onClose={handleSnackbarClose} severity={'error'}>
                        {snackbarMessage}
                    </Alert>
                ) : (
                    <Alert onClose={handleSnackbarClose} severity={'success'}>
                        {snackbarMessage}
                    </Alert>
                )}
            </Snackbar>
        </>
    );
}