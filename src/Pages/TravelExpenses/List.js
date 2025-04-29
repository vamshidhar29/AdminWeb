import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Flatpickr from 'react-flatpickr';
import { fetchData } from '../../helpers/externapi';

const List = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [activities, setActivities] = useState([]);
    const userId = localStorage.getItem('UserId');
    const navigate = useNavigate();
    const flatpickrRef = useRef(null);

    useEffect(() => {
        fetchActivities();
        applyCustomHighlight();
    }, [selectedDate]);


    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const fetchActivities = async () => {
        try {
            if (!selectedDate) return;
            const formattedDate = formatDate(selectedDate);
            const response = await fetchData('TravelActivities/GetTravelDetails', {
                userId: userId,
                activitiesDate: formattedDate,
            });
            setActivities(response);
        } catch (error) {
            console.error('Error fetching activities:', error);
        }
    };

    const handleDateChange = (selectedDates) => {
        if (selectedDates.length > 0) {
            const date = selectedDates[0];
            if (selectedDate && selectedDate.toDateString() === date.toDateString()) {
                setSelectedDate(null);
            } else {
                setSelectedDate(date);
            }
        } else {
            setSelectedDate(null);
        }
    };

    const handleActivityClick = (activity) => {
        navigate('/Others/travelexpenses/new', { state: { activity } });
    };

    const renderAddActivityButton = () => {
        if (selectedDate) {
            return (
                <div style={styles.addActivityButton}>
                    <button onClick={handleAddActivity} style={styles.addButton}>
                        Add Activity
                    </button>
                </div>
            );
        }
        return null;
    };

    const handleAddActivity = () => {
        navigate('/Others/travelexpenses/new');
    };

    const formatActivityDate = (date) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(date).toLocaleDateString(undefined, options);
    };

    const renderActivityDetails = () => {
        const formattedDate = selectedDate ? formatActivityDate(selectedDate) : '';

        return (
            <div style={styles.activityDetails}>
                <h2 style={styles.activityDetailsHeading}>Activity on {formattedDate}</h2>
                <div style={styles.divider}></div>
                {activities && activities.length > 0 ? (
                    activities.map((activity, index) => (
                        <div className="col-md-6 col-xl-12" key={index} onClick={() => handleActivityClick(activity)}>
                            <div className="card shadow-sm mb-3" style={styles.card}>
                                <div className="card-body">
                                    <h5 className="card-title" style={styles.cardTitle}>Activity Details</h5>
                                    <div style={styles.divider}></div>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <p className="card-text" style={styles.cardText}>
                                                <span style={styles.activityLabel}>FullName:</span> {activity.FullName}
                                            </p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="card-text" style={styles.cardText}>
                                                <span style={styles.activityLabel}>MobileNumber:</span> {activity.MobileNumber}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <p className="card-text" style={styles.cardText}>
                                                <span style={styles.activityLabel}>NoOfCards:</span> {activity.NoofCardsIssued}
                                            </p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="card-text" style={styles.cardText}>
                                                <span style={styles.activityLabel}>Remarks:</span> {activity.Remarks}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={styles.noActivityMessage}>
                        <p>No Activity on This Date</p>
                    </div>
                )}
            </div>
        );
    };

    const applyCustomHighlight = () => {
        if (flatpickrRef.current) {
            const calendar = flatpickrRef.current.flatpickr;
            if (calendar) {
                const today = new Date().toISOString().split('T')[0];
                const selectedDateStr = selectedDate ? selectedDate.toISOString().split('T')[0] : null;

                calendar.calendarContainer.querySelectorAll('.flatpickr-day').forEach(day => {
                    const dateStr = day.getAttribute('aria-label');

                    // Remove all custom styles
                    day.classList.remove('today-highlight', 'selected');

                    // Apply today's date style
                    if (dateStr === today) {
                        day.classList.add('today-highlight');
                    }

                    // Apply selected date style
                    if (dateStr === selectedDateStr) {
                        day.classList.add('selected');
                    }
                });
            }
        }
    };

    return (
        <div className="container-xxl flex-grow-1 container-p-y">
            <div className="card app-calendar-wrapper" style={styles.cardWrapper}>
                <div className="card-body pb-0">
                    <div className="row g-0">
                        <div className="col-md-6">
                            <Flatpickr
                                ref={flatpickrRef}
                                options={{
                                    inline: true,
                                    dateFormat: 'Y-m-d',
                                    defaultDate: selectedDate,
                                    onChange: handleDateChange,
                                    clickOpens: false, // Prevent input from opening the calendar
                                }}
                                style={{ display: 'none' }} // Hide the input box
                            />
                            {renderAddActivityButton()}
                        </div>
                        <div className="col-md-6">
                            {renderActivityDetails()}
                        </div>
                    </div>
                </div>
            </div>
            <style jsx>{`
                .flatpickr-day.today-highlight {
                    background-color: ${styles.todayHighlight.backgroundColor} !important;
                    color: ${styles.todayHighlight.color} !important;
                    border-radius: ${styles.todayHighlight.borderRadius} !important;
                    font-size: ${styles.todayHighlight.fontSize} !important;
                }
                .flatpickr-day.selected {
                    background-color: ${styles.selected.backgroundColor} !important;
                    color: ${styles.selected.color} !important;
                    border-radius: ${styles.selected.borderRadius} !important;
                    font-size: ${styles.selected.fontSize} !important;
                }
                .flatpickr-calendar {
                    display: inline-block !important; /* Ensure calendar is visible */
                }
            `}</style>
        </div>
    );
};

const styles = {
    cardWrapper: {
        width: '100%',
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '20px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    card: {
        backgroundColor: 'white',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
        padding: '15px',
    },
    cardTitle: {
        fontSize: '1.1em',
        fontWeight: 'bold',
        marginBottom: '10px',
        color: '#343a40',
    },
    cardText: {
        marginBottom: '8px',
        color: '#495057',
    },
    todayHighlight: {
        backgroundColor: 'rgb(0, 149, 182)',
        color: '#fff',
        borderRadius: '10%',
        fontSize: '0.8em',
    },
    selected: {
        backgroundColor: 'rgb(0, 149, 182)',
        color: '#fff',
        borderRadius: '10%',
        fontSize: '0.8em',
    },
    addActivityButton: {
        marginTop: '10px',
        marginLeft: "60px"
    },
    addButton: {
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        cursor: 'pointer',
        borderRadius: '5px',
        fontSize: '1em',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        transition: 'background-color 0.3s ease',
    },
    activityDetails: {
        marginTop: '20px',
        textAlign: 'center',
        marginBottom: '20px',
    },
    activityLabel: {
        fontSize: '14px',
        color: 'gray',
        marginBottom: '5px',
        position: 'relative',
    },
    noActivityMessage: {
        textAlign: 'center',
        marginTop: '20px',
        fontStyle: 'italic',
        color: '#888',
    },
    activityDetailsHeading: {
        marginTop: '20px',
        marginBottom: '10px',
        textAlign: 'center',
        fontSize: '1.2em',
        color: '#333',
    },
    divider: {
        borderTop: '1px solid #ddd',
        margin: '15px 0',
    },
};

export default List;
