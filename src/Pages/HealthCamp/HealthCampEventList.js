import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import moment from 'moment';
import { fetchData } from "../../helpers/externapi";
import { MultiSelect } from "react-multi-select-component";
import CircularProgress from '@mui/material/CircularProgress';
import 'jspdf-autotable';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { downloadCSVData, downloadExcelData } from '../../Commoncomponents/CommonComponents';
import CommonTables from '../../Commoncomponents/CommonTables';
import Flatpickr from 'react-flatpickr';
import { constructCompleteAddress } from '../../Commoncomponents/CommonComponents';
import { formatDate } from '../../Commoncomponents/CommonComponents';
import IconButton from '@mui/material/IconButton';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';

export default function HealthCampEventList(props) {
     const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);
    const [tableloading, setTableLoading] = React.useState(false);
    const [totalCount, setTotalCount] = React.useState(0);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [perPage, setPerPage] = React.useState(10);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [events, setEvents] = useState([]);


    const tomorrow = new Date()
    const accordionRef = useRef(null);
    tomorrow.setDate(tomorrow.getDate() + 1)

    const tableHeads = ["Event Name", "Event Type", "Address", "Event Date", "Map View", "Created By"];

    const tableElements = events && events.length > 0 ?
        events.map((event) => ([
            <Link
            to={`/healthcamp/healthCampCustomerList/${event.EventId}`}
            className="text-start-important"
            style={{
                whiteSpace: 'normal',
                textAlign: 'start',
                display: 'block',
            }}
          
          >
            {event.EventName}
          </Link>,
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
            event.UserName
        ])) : [];



    useEffect(() => {
        setLoading(props.loading);
        setLoading(props.error);
    }, []);

   
    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
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

    const getEventCountData = async () => {
        setLoading(true);
        setTableLoading(true);
        try {
            const eventCountData = await fetchData(`CommonRowCount/GetTableRowCount`, { tableName: "Event" });
            const totalCount = eventCountData[0]?.CountOfRecords || 0;
            setTotalCount(totalCount);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching hospital count data:", error);
            setLoading(false);
            setTableLoading(false);
        }
    };

    const getEvent = async () => {
        try {

            setTableLoading(true);
            const skip = (currentPage - 1) * perPage;
            const take = perPage;

            setLoading(true);
            const eventData = await fetchData("Event/all", { skip, take });
            setEvents(eventData);
        } catch (error) {
            console.error("Error fetching event data:", error);
        } finally {
            setLoading(false);
            setTableLoading(false);
        }
    };


    useEffect(() => {
        getEvent();
        getEventCountData();
    }, [totalCount, currentPage, perPage]);


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
        <>
            {loading && skeletonloading()}
            {!loading && (
                <>
                    
                    {/* Main Content */}
                    <div className="row">
                            <div className="col-xl-12 col-lg-12 col-md-12 order-0 order-md-1">
                                <div className="card mt-2" style={{ opacity: loading ? 0.5 : 1 }}>
                                    
                                    {(loading || tableloading) && (
                                        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(255, 255, 255, 0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
                                            <CircularProgress />
                                        </div>
                                    )}

                                    {!loading && !tableloading && events.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '20px' }}>
                                            There are no records to display.
                                        </div>
                                    )}

                                    {!loading && !tableloading && events.length > 0 && (
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


                                    <Snackbar
                                        open={snackbarOpen}
                                        autoHideDuration={3000}
                                        onClose={handleSnackbarClose}
                                    >
                                        <Alert onClose={handleSnackbarClose} severity="success">
                                            {snackbarMessage}
                                        </Alert>
                                    </Snackbar>

                               
                            </div>
                        </div>
                    </div>
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

const styles = {
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        padding: '12px 15px',
        border: '1px solid #ddd',
        textAlign: 'left',
        backgroundColor: '#f2f2f2',
        color: '#333',
        textTransform: 'uppercase',
        fontSize: '12px',
        letterSpacing: '1px',
    },
    td: {
        padding: '12px 15px',
        border: '1px solid #ddd',
        textAlign: 'left',
        fontSize: '14px',
        whiteSpace: 'normal',
        maxWidth: '200px',
    },
    headerRow: {
        backgroundColor: '#f9f9f9',
    },
    paginationContainer: {
        display: 'flex',
        alignItems: 'center',
        marginTop: '10px',
    },
    paginationSelect: {
        padding: '5px',
        borderRadius: '5px',
        border: '1px solid',
        marginRight: '10px',
        borderColor: 'blue',
    },
};