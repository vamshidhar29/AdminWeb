import React, { useEffect, useState } from "react";
import { fetchData } from "../../helpers/externapi";
import { Link, useNavigate } from "react-router-dom";
import moment from 'moment';
import Tooltip from '@mui/material/Tooltip';
import { downloadCSVData, downloadExcelData } from '../../Commoncomponents/CommonComponents';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CommonTables from '../../Commoncomponents/CommonTables'
import { TableSkeletonLoading } from "../../Commoncomponents/SkeletonLoading";

const DescriptionCell = ({ description }) => {
    const [isExpanded, setIsExpanded] = useState(false);


    const toggleExpansion = () => {
        setIsExpanded(!isExpanded);
    };

    if (!description) {
        return <span style={{ color: "#fcaeac" }}>No description available</span>;
    }

    const truncatedDescription = description.length > 30 ? `${description.slice(0, 30)}` : description;

    return (
        <div>
            <span
                onClick={toggleExpansion}
                style={{ cursor: 'pointer' }}
            >
                {isExpanded ? description : truncatedDescription}
                {description.length > 30 && !isExpanded && (
                    <Tooltip title={description} arrow>
                        <span style={{ cursor: 'pointer' }}>...</span>
                    </Tooltip>
                )}
            </span>
        </div>
    );
};

export default function List(props) {
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [error, setError] = useState('');
    const [tableloading, setTableLoading] = useState(false);
    const [leadsData, setLeadsData] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [filterCriteria, setFilterCriteria] = useState([]);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [selectedLeadNames, setSelectedLeadNames] = useState([]);
    const [selectedNumbers, setSelectedNumbers] = useState([]);
    const [selectedNames, setSelectedNames] = useState([]);
    const [isDisableApply, setIsDisableApply] = useState(true);
    const [input, setInput] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    const navigate = useNavigate();

    const tableHeads = ["LEAD NAME", "MOBILE NUMBER", "	DATE OF BIRTH", "GENERATED ON", "PRICE", "PRODUCT NAME", "DESCRIPTION", "DISTRIBUTOR NAME", "SERVICE TYPE"];

    const tableElements = leadsData && leadsData.length > 0 ?
        leadsData.map(data => ([
            <Link
                to={data.MemberId ? `/customers/details/${data.MemberId}` : `/leads/details/${data.LeadGenerationId}`}
                className="text-start-important"
                style={{
                    whiteSpace: 'normal',
                    textAlign: 'start',
                    display: 'block',
                }}
            >
                {data.LeadName}
            </Link>,
            data.MobileNumber ? (
                <a
                    href={"tel:" + data.MobileNumber}
                >
                    <i className="bx bx-phone-call" style={styles.phoneIcon}></i>
                    {data.MobileNumber}
                </a>
            ) : <span className='text-danger'>Mobile Number dosen't exist</span>,
            moment(data.DateofBirth).format('YYYY-MMM-DD'),
            moment(data.GeneratedOn).format('YYYY-MMM-DD'),
            data.Price,
            data.ProductName,
            <DescriptionCell description={data.Description} />,
            data.Name,
            data.ServiceName
        ])) : [];

    useEffect(() => {
        setLoading(props.loading);
        setLoading(props.error);
    }, [props.loading, props.error]);

    useEffect(() => {
        if (selectedLeadNames.length === 0 && selectedNumbers.length === 0 && selectedNames.length === 0) {
            setIsDisableApply(true);
        } else {
            setIsDisableApply(false);
        }
    }, [selectedLeadNames, selectedNumbers, selectedNames])

    const getLeadCountData = async () => {
        setLoading(true);
        const leadCountData = await fetchData(`CommonRowCount/GetTableRowCount`, { tableName: "LeadGeneration" });
        const totalCount = leadCountData[0]?.CountOfRecords || 0;
        setTotalCount(totalCount);
        setLoading(false);
    };

    useEffect(() => {
        getLeadCountData();
    }, []);

    const handleLeadNameSelect = (event) => {
        const selectedLeadName = event.target.value;
        if (selectedLeadName === '') {
            setSelectedLeadNames([]);
        } else {
            setSelectedLeadNames([...selectedLeadNames, selectedLeadName]);
        }
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleMobileSelect = (event) => {
        const selectedNumber = event.target.value;
        if (selectedNumber === '') {
            setSelectedNumbers([]);
        } else {
            setSelectedNumbers([...selectedNumbers, selectedNumber]);
        }
    };

    const handleNameSelect = (event) => {
        const selectedName = event.target.value;
        if (selectedName === '') {
            setSelectedNames([]);
        } else {
            setSelectedNames([...selectedNames, selectedName]);
        }
    };

    const getLeadData = async () => {
        setLoading(true);
        try {
            const skip = (currentPage - 1) * perPage;
            const take = perPage;
            let dataToDisplay = [];

            if (filterCriteria.length > 0) {
                const filterData = await fetchData("Lead/GetMultipleLeadDataByFilter", {
                    skip: 0,
                    take: -1,
                    filter: filterCriteria
                });
                setTotalCount(filterData.length);
                const startIndex = (currentPage - 1) * perPage;
                const paginatedFilterData = filterData.slice(startIndex, startIndex + perPage);
                dataToDisplay = paginatedFilterData.map(lead => ({
                    ...lead,
                    MobileNumber: lead.MobileNumber,
                    DistrictName: lead.DistrictName,
                    StateName: lead.StateName
                }));
            } else {
                const leadData = await fetchData("Lead/all", { skip, take });
                dataToDisplay = leadData.map(lead => ({
                    ...lead,
                    MobileNumber: lead.MobileNumber
                }));
            }
            setLeadsData(dataToDisplay);

        } catch (error) {
            console.error("Error fetching lead data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getLeadData();
    }, [currentPage, perPage, filterCriteria]);

    const handleInputChange = async (event) => {
        const value = event.target.value;
        setInput(value);

        if (value.length >= 2) {
            const filterCriteria = [];

            if (/^\d+$/.test(value)) {
                filterCriteria.push({
                    key: "MobileNumber",
                    value: value,
                    operator: "LIKE"
                });
            } else {
                filterCriteria.push({
                    key: "LeadName",
                    value: value,
                    operator: "LIKE"
                });
            }

            setSearchLoading(true);
            setError('');

            try {
                const suggestionData = await fetchData("Lead/GetMultipleLeadDataByFilter", {
                    skip: 0,
                    take: perPage,
                    filter: filterCriteria
                });
                if (suggestionData.length > 0) {
                    setSuggestions(suggestionData);
                } else {
                    setError('No suggestions found.');
                    setSuggestions([]);
                }

            } catch (error) {
                setError('Failed to fetch suggestions.');
                setSuggestions([]);
            } finally {
                setSearchLoading(false);
            }
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        navigate(`/leads/details/${suggestion.LeadGenerationId}`);
    };

    const clearSearch = () => {
        setInput('');
        setSuggestions([]);
    };

    const applyFilter = async () => {
        setLoading(true);
        const mobileNumber = document.getElementById("mobileNumber-input").value.trim();
        const leadName = document.getElementById("leadName-input").value.trim();

        const filterCriteria = [];

        if (mobileNumber !== "") {
            filterCriteria.push({
                key: "MobileNumber",
                value: mobileNumber,
                operator: "LIKE"
            });
        }
        if (leadName !== "") {
            filterCriteria.push({
                key: "LeadName",
                value: leadName,
                operator: "LIKE"
            });
        }

        const inputFilter = {
            skip: 0,
            take: perPage,
            filter: filterCriteria
        };

        try {
            const leadCountData = await fetchData(`CommonRowCount/GetTableRowCount`, { tableName: "LeadGeneration", filter: filterCriteria });
            const totalCount = leadCountData[0]?.CountOfRecords || 0;
            setTotalCount(totalCount);
            const filterData = await fetchData("Lead/GetMultipleLeadDataByFilter", inputFilter);
            if (Array.isArray(filterData)) {
                const newPerPage = perPage === 10 ? 10 : Math.min(perPage, totalCount);
                inputFilter.take = newPerPage;
                const slicedData = filterData.slice(0, newPerPage).map(lead => ({
                    ...lead,
                    MobileNumber: lead.MobileNumber
                }));
                setCurrentPage(1);
                setLeadsData(slicedData);
                setPerPage(newPerPage);
                setFilterCriteria(filterCriteria);
            } else {
                console.error("Filtered data is not an array. Response:", filterData);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error applying filter:", error);
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setSelectedNumbers([])
        setSelectedLeadNames([])
        document.getElementById("mobileNumber-input").value = "";
        document.getElementById("leadName-input").value = "";
        setIsDisableApply(true);

        getLeadCountData();
        setFilterCriteria([]);
        getLeadData();
    };

    const handlePageChange = (event, page) => {
        setCurrentPage(page);
    };

    const handlePerPageChange = (event) => {
        setPerPage(parseInt(event.target.value, 10));
        setCurrentPage(1);
    };

    const handleExcelDownload = async () => {
        setLoading(true)
        await downloadExcelData('leadslist', totalCount, perPage, fetchData, filterCriteria, setLoading);
    };

    const handleCSVDownload = async () => {
        setLoading(true)
        await downloadCSVData('leadslist', totalCount, perPage, fetchData, filterCriteria, setLoading);
    };

    const filterUI = () => (
        <div className="card p-1 my-1 sticky-top" style={{zIndex: 1}}>

            <div className="select2-primary mx-2 mb-2" style={{ display: 'flex', flexWrap: 'wrap' }}>
                {(selectedLeadNames.length > 0 || selectedNames.length > 0 || selectedNumbers.length > 0) && (
                    <>
                        {selectedLeadNames.length > 0 && (
                            <div style={{ marginRight: '10px', marginBottom: '0px', display: 'flex', alignItems: 'center' }}>
                                <strong style={{ marginRight: '5px' }}>Lead Name : </strong>
                                <span className="selected-option-button">
                                    {selectedLeadNames[selectedLeadNames.length - 1]}
                                </span>
                            </div>
                        )}


                        {selectedNames.length > 0 && (
                            <div style={{ marginRight: '10px', marginBottom: '0px', display: 'flex', alignItems: 'center' }}>
                                <strong style={{ marginRight: '5px' }}>Distributor Name: </strong>
                                <span className="selected-option-button">
                                    {selectedNames[selectedNames.length - 1]}
                                </span>
                            </div>
                        )}
                        {selectedNumbers.length > 0 && (
                            <div style={{ marginRight: '10px', marginBottom: '0px', display: 'flex', alignItems: 'center' }}>
                                <strong style={{ marginRight: '5px' }}>Mobile Number: </strong>
                                <span className="selected-option-button">
                                    {selectedNumbers[selectedNumbers.length - 1]}
                                </span>
                            </div>
                        )}

                    </>
                )}
            </div>

            <div className="row align-items-center">
                <div className="col-4 col-md-4">
                    <ul className="nav nav-md nav-pills">
                        <li className="nav-item">
                            <Link className={"nav-link "} to="/leads/Patientreferral">
                                <i className="bx bx-user me-1"></i>&nbsp;Patient Referral
                            </Link>
                        </li>
                    </ul>
                </div>

                <div className="col-8 col-md-4">
                    <div>
                        <label htmlFor="search-input" className="form-label">Lead Name or Mobile Number</label>
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
                                            <span style={{ flex: 1 }}>{suggestion.LeadName}-{suggestion.MobileNumber}</span>
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
                </div>

                <div className="col-12 col-md-4 mt-2 mt-md-0 d-flex flex-row-reverse content-between align-items-center gap-2">
                    <button className="btn btn-secondary create-new btn btn-sm btn-primary" onClick={handleExcelDownload}>
                        <span><i className="bx bx-export me-sm-1"></i>
                            <span className="d-none d-sm-inline-block"> Excel</span>
                        </span>
                    </button>

                    <button className="btn btn-secondary create-new btn btn-sm btn-success" onClick={handleCSVDownload}>
                        <span><i className="bx bx-export me-sm-1"></i>
                            <span className="d-none d-sm-inline-block"> CSV</span>
                        </span>
                    </button>

                    <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#filterModal"
                    >
                        <i className="fas fa-filter" style={{ marginRight: '5px' }}></i>
                        <span className="d-none d-sm-inline-block"> Filters</span>
                    </button>
                </div>

            </div>
        </div>
    );

    return (
        <>
            {loading && <TableSkeletonLoading />}
            {!loading && (
                <>
                    {filterUI()}
                    
                    <div
                        className="modal fade"
                        id="filterModal"
                        tabIndex="-1"
                        aria-labelledby="filterModalLabel"
                        aria-hidden="true"
                        style={{ marginTop: '120px' }}
                    >
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="filterModalLabel">Filters</h5>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="form-group col-md-4">
                                            <label htmlFor="leadName-input" className="form-label">Lead Name</label>
                                            <div className="select2-primary">
                                                <input type="text" id="leadName-input" className="form-control" maxLength={30} onChange={handleLeadNameSelect} />
                                            </div>
                                        </div>
                                        <div className="form-group col-md-4">
                                            <label htmlFor="mobileNumber-input" className="form-label">Mobile Number</label>
                                            <div className="select2-primary">
                                                <input type="tel" id="mobileNumber-input" className="form-control" maxLength={10}
                                                    onInput={(e) => {
                                                        e.target.value = e.target.value.replace(/\D/g, '');
                                                    }}
                                                    onChange={handleMobileSelect} />
                                            </div>
                                        </div>
                                        {/*<div className="form-group col-md-4">*/}
                                        {/*    <label htmlFor="name-input" className="form-label">Distributor Name</label>*/}
                                        {/*    <div className="select2-primary">*/}
                                        {/*        <input type="text" id="name-input" className="form-control" maxLength={30} onChange={handleNameSelect} />*/}
                                        {/*    </div>*/}
                                        {/*</div>*/}
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="reset"
                                        className="btn btn-secondary"
                                        data-bs-dismiss="modal"
                                        onClick={clearFilters}
                                    >
                                        Clear
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        data-bs-dismiss="modal"
                                        onClick={applyFilter}
                                        disabled={isDisableApply}
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row mt-2">
                        <div className="col-xl-12 col-lg-12 col-md-12 order-0 order-md-1">
                            <div className="card mb-4" style={{ opacity: loading ? 0.5 : 1 }}>
                                <div>

                                    {!loading && leadsData.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '20px' }}>
                                            <h5 className="text-danger">There are no records to display.</h5>
                                        </div>
                                    )}

                                    {!loading && leadsData.length > 0 && (
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
                    </div>
                </>
            )}
        </>
    );
};

const styles = {
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