import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchData, fetchAllData } from "../../helpers/externapi";
import { MultiSelect } from "react-multi-select-component";
import CircularProgress from '@mui/material/CircularProgress';
import 'jspdf-autotable';
import IconButton from '@mui/material/IconButton';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { downloadCSVData, downloadExcelData, constructCompleteAddress, formatDate } from '../../Commoncomponents/CommonComponents';
import CommonTables from '../../Commoncomponents/CommonTables';
import moment from 'moment';
import Modal from 'react-modal';
import { TableSkeletonLoading } from "../../Commoncomponents/SkeletonLoading";
import zIndex from "@mui/material/styles/zIndex";

export default function List(props) {
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [error, setError] = useState('');
    const [tableloading, setTableLoading] = useState(false);
    const [membersData, setMembersData] = useState([]);
    const [selectedStates, setSelectedStates] = useState([]);
    const [statesMultiSelect, setStatesMultiSelect] = useState();
    const [selectedDistricts, setSelectedDistricts] = useState([]);
    const [districtsMultiSelect, setDistricsMultiSelect] = useState();
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [filterCriteria, setFilterCriteria] = useState([]);
    const [selectedNames, setSelectedNames] = useState([]);
    const [selectedSearch, setSelectedSearch] = useState([]);
    const [selectedNumbers, setSelectedNumbers] = useState([]);
    const [selectedMandals, setSelectedMandals] = useState([]);
    const [selectedVillages, setSelectedVillages] = useState([]);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [rmOptions, setRmOptions] = useState([]);
    const [routeOptions, setRouteOptions] = useState([]);
    const [selectedRegionalManager, setSelectedRegionalManager] = useState('');
    const [selectedRouteMap, setSelectedRouteMap] = useState('');
    const [callResponseOptions, setCallResponseOptions] = useState([]);
    const [selectedResponse, setSelectedResponse] = useState([]);
    const [livelongStatusFilter, setLivelongStatusFilter] = useState([]);
    const [paStatusFilter, setPaStatusFilter] = useState([]);
    const [input, setInput] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const tomorrow = new Date()
    const navigate = useNavigate();
    const [callLogMemberId, setCallLogMemberId] = useState();
    const [callHistory, setCallHistory] = useState();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [callResponseFilter, setCallResponseFilter] = useState([]);
    const initialFormData = {
        callHistoryId: "", callLog: "", CardNumber: "", CollectedDate: "", callResponsesId: "", RMName: "", DateToBeVisited: "", RequestCallBack: ""
    }
    const [formData, setFormData] = useState(initialFormData);
    const [formError, setFormError] = useState({});
    const [isFormVisable, setIsFormVisible] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);
    const [isDisableApply, setIsDisableApply] = useState(true);
    const [serviceStatus, setServiceStatus] = useState([]);
    const [memberTypes, setMemberTypes] = useState([])
    const [memberTypeId, setMemberTypeId] = useState();
    const [selectedView, setSelectedView] = useState();
    const [mocLoading, setMocLoading] = useState(false);
    const [mocError, setMocError] = useState('');
    const [mocSuccess, setMocSuccess] = useState('');
    const [mocUrl, setMocUrl] = useState();
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [customerCount, setCustomerCount] = useState();
    const [distributorCount, setDistributorCount] = useState();
    const [advisorCount, setAdvisorCount] = useState();
    const [isCustomers, setIsCustomers] = useState(false);
    const [isActiveCustomers, setIsActiveCustomers] = useState(true);
    const [isAssignedHovered, setIsAssignedHovered] = useState(false);
    const [isUnAssignedHovered, setIsUnAssignedHovered] = useState(false);

    let UserId = localStorage.getItem("UserId");

    const thresholdDays = 5;
    const tableHeads = ["FULL NAME", "CALL HISTORY", "Card Number", "Product Name", "Call Response", "Sale Done By", "REGISTERED DATE", "HHT STATUS"];

    const responseLabels = {
        "Welcome Call": "bg-label-success",
        "Interested": "bg-label-info",
        "Busy Call back": "bg-label-warning",
        "Pipeline": "bg-label-secondary",
        "Not Interested": "bg-label-danger",
        "Not Available": "bg-label-dark",
        "Requested CallBack": "bg-label-primary"
    };

    const handleMocView = (data) => {
        setSelectedView(data);
        setMocError('');
        setMocSuccess('');
    };

    const tableElements = membersData && membersData.length > 0 ?
        membersData.map((data) => ([
            <Link
                to={
                    `/customers/details/${data.CustomerId}`
                }
                className="text-start-important"
                style={{
                    whiteSpace: 'normal',
                    textAlign: 'start',
                    display: 'block',
                }}
            >
                {data.Name}
            </Link>,
            //      <a 
            //      href={`#services-${data.CustomerId}`}
            //      onClick={(e) => {
            //        e.preventDefault();
            //        const servicesUrl = `/customers/details/${data.CustomerId}#services`;
            //        window.open(servicesUrl, '_blank');
            //      }}
            //      className="text-start-important"
            //      style={{
            //        whiteSpace: 'normal',
            //        textAlign: 'start',
            //        display: 'block',
            //      }}
            //    >
            //      {data.Name}
            //    </a>
            <>
                <button
                    style={{ border: '0px', backgroundColor: 'white' }}
                    type="button"
                    onClick={() => handleCallLog(data.CustomerId)}
                >
                    <Link>Call log Data</Link>
                </button>
            </>,
            <div className="text-center">
                {data?.CardNumber ? (
                    <p>{data.CardNumber}</p>
                ) : (
                    <p style={{ color: 'red' }}>No card exists</p>
                )}
            </div>,

            <div className="text-center">
                {data?.ProductName ? (
                    <p>{data.ProductName}</p>
                ) : (
                    <p style={{ color: 'red' }}>No Product Purchase</p>
                )}
            </div>,
            <div>
                <span className={`badge ${responseLabels[data.ResponseName]}`}>{data.ResponseName}</span>
                <p>{data.CallLog}</p>
            </div>,
            <div className="text-center">
                {data?.SaleDoneBy ? (
                    <p>{data.SaleDoneBy}</p>
                ) : (
                    <p style={{ color: 'red' }}>Not exists</p>
                )}
            </div>,
            <p className="text-center">
                {data.RegisterOn ? formatDate(data.RegisterOn).slice(0, 11) : ""}
            </p>,
            // <button
            //     className="btn btn-sm btn-primary"
            //     data-bs-toggle="modal"
            //     data-bs-target="#exLargeModal"
            //     onClick={() => handleMocView(data)}
            // >
            //     View
            // </button>
            <>

                {data.HHTStatus === "Completed" ? (
                    <span className="text-success fw-bold">Completed</span>
                ) : data.HHTStatus === "Initiated" ? (
                    <span className="text-warning fw-bold">Initiated</span>
                ) : (
                    <button className="btn btn-primary btn-sm" onClick={() => handleGeneratePolicy(data)}>
                        Generate Policy
                    </button>
                )}

            </>
            ,
        ])) : [];

    const handleCallLog = (memberId) => {
        setCallLogMemberId(memberId);
        setIsModalOpen(true);
    };


    const handleGeneratePolicy = async (order) => {
        try {
            const response = await fetchData("lambdaAPI/HHL/HHLPolicyCreation", {
                ProductsId: order.ProductsId,
                MemberId: order.CustomerId,
                CustomerOrderId: order.CustomerOrderId,
                MemberProductId: order.MemberProductId,
                UserId: UserId
            });

            if (response.status === "true") {
                setSnackbarMessage(response.message);
            } else {
                setSnackbarMessage(response.message);
            }
            setSnackbarOpen(true);
        } catch (error) {
            console.error("Error generating policy:", error);
            alert("An error occurred while generating the policy.");
        }
    };

    useEffect(() => {
        setLoading(true);
        const fetchServiceStatus = async () => {
            const response = await fetchData("ServiceStatus/all", { "skip": 0, "take": 0 })
            setServiceStatus(response);
            setLoading(false);
        };

        fetchServiceStatus();
    }, []);

    useEffect(() => {
        setLoading(true);
        const fetchCallResponseOptions = async () => {
            try {
                const getResponseTypes = await fetchData('CallResponseType/all', { skip: 0, take: 0 });

                let CallResponseTypeId = getResponseTypes.filter(types => types.ResponseName === "Member");

                const response = await fetchAllData(`CallResponse/GetCallResponsesByResponseType/${CallResponseTypeId[0].CallResponseTypeId}`);
                setCallResponseOptions(response);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching call responses:", error);
                setLoading(false);
            }
        };

        fetchCallResponseOptions();
    }, []);

    const fetchCallHistoryData = async () => {
        setLoading(true);
        try {
            const response = await fetchAllData(`lambdaAPI/CallHistory/GetAllCallHistoryByCustomerId/${callLogMemberId}`);
            setCallHistory(response);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        callLogMemberId && (
            fetchCallHistoryData()
        )
    }, [callLogMemberId]);

    tomorrow.setDate(tomorrow.getDate() + 1)

    const onChangeHandler = (event) => {
        const { name, value, type, checked } = event.target;
        let updatedFormData = { ...formData, [name]: type === 'checkbox' ? (checked ? value : '') : value };
        let error = '';

        if (name === 'DateToBeVisited' && value.length === 10) {
            const defaultTime = "T00:00:00";
            updatedFormData = { ...updatedFormData, DateToBeVisited: `${value}${defaultTime}` };
        }

        setFormData(updatedFormData);
        setFormError({ ...formError, [name]: error });
        //if (name === 'StateId') {
        //    setSelectedStateId(value);
        //    updatedFormData.DistrictId = '';
        //}
    };

    useEffect(() => {
        const isFormValid = formData.callResponsesId.length > 0;
        setIsFormValid(isFormValid);
    }, [formData]);

    const handleResetForm = () => {
        setFormData(initialFormData);
        setFormError({});
    };

    const handleBackToView = () => {
        setIsFormVisible(false);
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            let CallHistoryData;
            const requestData = {
                callLog: formData.callLog,
                CustomerId: callLogMemberId,
                UserId: UserId,
                callResponsesId: formData.callResponsesId,
                DateToBeVisited: formData.DateToBeVisited === "" ? null : formData.DateToBeVisited,
                RequestCallBack: formData.RequestCallBack === "" ? null : formData.RequestCallBack,
            };

            // if (formData.DateToBeVisited) {
            //     requestData.DateToBeVisited = new Date(formData.DateToBeVisited).toISOString();
            // }

            // if (formData.RequestCallBack) {
            //     requestData.RequestCallBack = new Date(formData.RequestCallBack).toISOString();
            // }

            CallHistoryData = await fetchData('lambdaAPI/CallHistory/add', requestData);

            if (CallHistoryData.status === true) {

                setSnackbarMessage("New call log added successfully!");

                setCallHistory(CallHistoryData);
                setSnackbarOpen(true);
            } else {
                setSnackbarMessage(`${CallHistoryData.data}`);
                setSnackbarOpen(true);
            }

            await fetchCallHistoryData();
        } catch (error) {
            console.error("Error adding call log:", error);
        } finally {
            setLoading(false);
            setIsFormVisible(false);
            setFormData(initialFormData);
        }
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleMandalSelect = (event) => {
        const selectedMandal = event.target.value;
        if (selectedMandal === '') {
            setSelectedMandals([]);
        } else {
            setSelectedMandals([...selectedMandals, selectedMandal]);
        }
    };

    const handleVillageSelect = (event) => {
        const selectedVillage = event.target.value;
        if (selectedVillage === '') {
            setSelectedVillages([])
        } else {
            setSelectedVillages([...selectedVillages, selectedVillage]);
        }
    };

    useEffect(() => {
        setLoading(props.loading);
        setLoading(props.error);
    }, []);

    const getDistributorCountData = async () => {
        setLoading(true);
        try {
            const distributorCountData = await fetchData(`CommonRowCount/GetTableRowCount`, { tableName: "Customer" });
            const totalCount = distributorCountData[0]?.CountOfRecords || 0;
            setTotalCount(totalCount);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching distributor count data:", error);
            setLoading(false);
        }
    };

    const getDistributorData = async () => {
        setLoading(true);
        try {
            const skip = (currentPage - 1) * perPage;
            const take = perPage;

            let distributorData;
            if (filterCriteria.length > 0) {
                distributorData = await fetchData("lambdaAPI/Customer/GetMultipleDataByFilter", {
                    skip,
                    take,
                    filter: filterCriteria
                });

            } else {
                distributorData = await fetchData("lambdaAPI/Customer/all", { skip, take });
            }

            const dataToDisplay = distributorData.map(distributor => {
                return {
                    ...distributor,
                    completeAddress: constructCompleteAddress(distributor),
                    MobileNumber: distributor.MobileNumber,
                    RMName: distributor.RMName,
                    RouteMaps: distributor.RouteMaps,
                    TelecallerName: distributor.TelecallerName
                };
            })
            setMembersData(dataToDisplay);
            setIsDataLoaded(true);

        } catch (error) {
            console.error("Error fetching distributor data:", error);
        } finally {
            // setTableLoading(false);
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        const getMemberTypes = async () => {
            const fetchMemberTypes = await fetchData('MemberTypes/all', { skip: 0, take: 0 });
            const memberTypes = fetchMemberTypes.map((item) => ({
                label: item.Type,
                value: item.MemberTypeId
            }));


            setMemberTypes(memberTypes);
            setLoading(false);
        };

        //getMemberTypes();
        getDistributorCountData();
    }, []);

    const getMemberTypeIdByName = (name) => {
        const memberType = memberTypes.find((type) => type.label.toLowerCase() === name.toLowerCase());
        return memberType ? memberType.value : null;
    };

    useEffect(() => {
        getDistributorData();
    }, [currentPage, perPage]);

    const handleExcelDownload = async () => {
        setLoading(true);
        await downloadExcelData('doctorslist', totalCount, perPage, currentPage, fetchData, filterCriteria, setLoading);
    };

    const handleCSVDownload = async () => {
        setLoading(true)
        await downloadCSVData('doctorslist', totalCount, perPage, currentPage, fetchData, filterCriteria, setLoading);
    };

    useEffect(() => {
        const getStates = async () => {
            setLoading(true);
            const statesData = await fetchData("States/all", { "skip": 0, "take": 0 });
            if (statesData && statesData.length > 0) {
                const statesArray = statesData.map(item => ({ label: item.StateName, value: item.StateId }));
                setStatesMultiSelect(statesArray);
                setLoading(false);
            }
        }

        const getDistricts = async (event) => {
            setLoading(true);
            const districtsData = await fetchData("Districts/all", { "skip": 0, "take": 0 });
            if (districtsData && districtsData.length > 0) {
                const districtsArray = districtsData.map(item => ({ label: item.DistrictName, value: item.DistrictId }));
                setDistricsMultiSelect(districtsArray);
                setLoading(false);
            }
        }

        const fetchMocUrl = async () => {
            const response = await fetchData('ConfigValues/all', { skip: 0, take: 0 });
            if (response && response.length > 0) {
                const bucketUrl = response && response.length > 0 && response.find(val => val.ConfigKey === "policiesDownloadURL");
                setMocUrl(bucketUrl.ConfigValue);
            }
        };

        const fetchCounts = async () => {
            const countResponse = await fetchAllData('Member/GetCardPurchasedCount');
            setAdvisorCount(countResponse[0].AdvisorCount);
            setCustomerCount(countResponse[0].CustomerCount);
            setDistributorCount(countResponse[0].DistributorCount);
        };

        getStates();
        getDistricts();
        fetchMocUrl();
        //fetchCounts();
    }, [])

    useEffect(() => {
        const getRegionalManagers = async () => {
            setLoading(true);
            try {
                const usersData = await fetchAllData(`lambdaAPI/Employee/GetRMNames`);
                const regionalManagers = usersData && usersData
                    .map(user => ({ label: user.UserName, value: user.UserName }));

                setRmOptions(regionalManagers);
            } catch (error) {
                console.error('Error fetching regional managers:', error);
            } finally {
                setLoading(false);
            }
        };

        getRegionalManagers();
    }, []);

    // useEffect(() => {
    //     const getRouteMap = async () => {
    //         setLoading(true);
    //         try {
    //             const usersData = await fetchData("RouteMap/all", { skip: 0, take: 0 });
    //             const routeMaps = usersData
    //                 .map(route => ({ label: route.RouteName, value: route.RouteName }));

    //             setRouteOptions(routeMaps);
    //         } catch (error) {
    //             console.error('Error fetching relationship managers:', error);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //     getRouteMap();
    // }, []);

    useEffect(() => {
        const fetchCallResponseOptionsFilter = async () => {
            setLoading(true);
            try {
                const response = await fetchData("CallResponse/all", { "skip": 0, "take": 0 });
                const options = response.map(item => ({ label: item.ResponseName, value: item.CallResponsesId }));
                setCallResponseFilter(options);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching call responses:", error);
                setLoading(false);
            }
        };

        fetchCallResponseOptionsFilter();
    }, []);

    useEffect(() => {
        if (selectedStates.length === 0 && selectedDistricts.length === 0 &&
            selectedResponse.length === 0 && selectedMandals.length === 0 && selectedNames.length === 0 && selectedNumbers.length === 0 &&
            selectedRegionalManager.length === 0 && selectedRouteMap.length === 0 && selectedVillages.length === 0 && livelongStatusFilter.length === 0
            && paStatusFilter.length === 0) {
            setIsDisableApply(true);
        } else {
            setIsDisableApply(false);
        }

    }, [selectedStates, selectedDistricts, selectedResponse, selectedMandals, livelongStatusFilter, paStatusFilter,
        selectedNames, selectedNumbers, selectedRegionalManager, selectedRouteMap, selectedVillages]);

    const handleRegionalManagerChange = (selectedOption) => {
        setSelectedRegionalManager(selectedOption);
    };

    const handleRouteMapChange = (value) => {
        setSelectedRouteMap(value);
    };

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
                    key: "Name",
                    value: value,
                    operator: "LIKE"
                });
            }

            setSearchLoading(true);
            setError('');

            try {

                const suggestionData = await fetchData("lambdaAPI/Customer/GetCustomerMultipleDataByNameAndMobileNum", {
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
        let path;

        if (suggestion) {
            path = `/customers/details/${suggestion.MemberId}`;
        } else {
            path = `/distributor/details/${suggestion.MemberId}`;
        }

        navigate(path);
    };

    const clearSearch = () => {
        setInput('');
        setSuggestions([]);
        setSelectedSearch([]);
    };

    const handleLivelongStatusChange = (value) => {
        setLivelongStatusFilter(value);
    };

    const handlePaStatusChange = (value) => {
        setPaStatusFilter(value);
    };

    const applyFilter = async (memberTypeId) => {
        setLoading(true);
        //const mobileNo = document.getElementById("mobile-input").value;
        const selectedStateIds = selectedStates.map(state => state.value);
        const selectedDistrictIds = selectedDistricts.map(district => district.value);
        const selectedRegionalManagerIds = selectedRegionalManager;
        const selectedRouteMapIds = selectedRouteMap;
        const village = document.getElementById("village-input").value;
        const mandal = document.getElementById("mandal-input").value;
        //  const name = document.getElementById("name-input").value;
        const selectedResponseId = selectedResponse.join(",");
        const selectedMemberTypeId = memberTypeId;

        const filterCriteria = [];

        if (selectedStateIds.length > 0) {
            filterCriteria.push({
                key: "StateId",
                value: selectedStateIds.join(","),
                operator: "IN"
            });
        }

        if (selectedDistrictIds.length > 0) {
            filterCriteria.push({
                key: "DistrictId",
                value: selectedDistrictIds.join(","),
                operator: "IN"
            });
        }
        if (selectedRegionalManagerIds.length > 0) {
            filterCriteria.push({
                key: "RMName",
                value: selectedRegionalManagerIds,
                operator: "LIKE"
            });
        }
        if (selectedRouteMapIds.length > 0) {
            filterCriteria.push({
                key: "RouteName",
                value: selectedRouteMapIds,
                operator: "LIKE"
            });
        }
        if (mandal.trim() !== "") {
            filterCriteria.push({
                key: "Mandal",
                value: mandal,
                operator: "LIKE"
            });
        }
        if (village.trim() !== "") {
            filterCriteria.push({
                key: "Village",
                value: village,
                operator: "LIKE"
            });
        }
        if (selectedMemberTypeId.length > 0) {
            filterCriteria.push({
                key: "MemberTypeId",
                value: selectedMemberTypeId,
                operator: "IN"
            })
        }
        if (selectedResponseId.length > 0) {
            filterCriteria.push({ key: "CallResponsesId", value: selectedResponseId, operator: "IN" });
        }
        if (livelongStatusFilter && livelongStatusFilter.length > 0) {
            if (livelongStatusFilter === 1) {
                filterCriteria.push({ key: "ServiceProviderStatusId", value: "null", operator: 'IS', "groupOperator": "OR" });
                filterCriteria.push({ key: "ServiceProviderStatusId", value: "1", operator: 'IN' });
            } else {
                filterCriteria.push({ key: "ServiceProviderStatusId", value: livelongStatusFilter, operator: 'LIKE' });
            }
        }
        if (paStatusFilter && paStatusFilter.length > 0) {
            if (paStatusFilter === 1) {
                filterCriteria.push({ key: "PersonalAccidentStatusId", value: "null", operator: 'IS', "groupOperator": "OR" });
                filterCriteria.push({ key: "PersonalAccidentStatusId", value: "1", operator: 'IN' });
            } else {
                filterCriteria.push({ key: "PersonalAccidentStatusId", value: livelongStatusFilter, operator: 'LIKE' });
            }
        }

        try {
            const distributorCountData = await fetchData(`lambdaAPI/Customer/FetchCustomerListFilterCount`, { filter: filterCriteria });

            const totalCount = distributorCountData[0]?.customerListCount || 0;
            setTotalCount(totalCount);
            const filterData = await fetchData("lambdaAPI/Customer/GetMultipleDataByFilter", {
                skip: 0,
                take: perPage,
                filter: filterCriteria
            });

            setPerPage(perPage);
            setCurrentPage(1);
            setMembersData(filterData.map(member => ({
                ...member,
                MobileNumber: member.MobileNumber
            })));
            setFilterCriteria(filterCriteria);

        } catch (error) {
            console.error("Error applying filter:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCallResponseChange = (event) => {
        const value = parseInt(event.target.value);

        if (selectedResponse.includes(value)) {
            const removeResponse = selectedResponse.filter(val => val !== value);
            setSelectedResponse(removeResponse);
        } else {
            setSelectedResponse([...selectedResponse, value]);
        }
    };

    const clearFilters = async () => {
        setSelectedStates([]);
        setSelectedDistricts([]);
        //setSelectedNames([]);
        //setSelectedNumbers([]);
        setSelectedMandals([]);
        setSelectedVillages([]);
        setSelectedRegionalManager([]);
        setSelectedRouteMap([]);
        setSelectedResponse([]);
        setIsDisableApply(true);
        setLivelongStatusFilter('');
        setPaStatusFilter('');

        document.getElementById("village-input").value = "";
        document.getElementById("mandal-input").value = "";
        // document.getElementById("mobile-input").value = "";
        //document.getElementById("name-input").value = "";

        setFilterCriteria([]);
        getDistributorCountData();
        getDistributorData();
    };

    const handlePageChange = (event, page) => {
        setCurrentPage(page);
    };

    const handlePerPageChange = (event) => {
        setPerPage(parseInt(event.target.value, 10));
        setCurrentPage(1);
    };

    const downloadMOC = async () => {
        const endUrl = selectedView.MembershipCertificate;

        if (mocUrl && mocUrl.length > 0) {
            const link = document.createElement('a');
            link.href = `${mocUrl + endUrl}`;
            link.download = endUrl;
            link.target = '_blank';
            link.click();

            setMocError('');
        } else {
            setMocError('Something went wrong. Please Contact Technical Team');
        }

    };

    const generateMOC = async () => {
        setMocLoading(true);

        const response = await fetchData('PaymentDetails/policygeneration', {
            "productsId": selectedView.ProductId,
            "MemberId": selectedView.MemberId,
            "MemberProductId": selectedView.MemberProductId
        });

        setMocLoading(false);

        if (!response || response === undefined) {
            setMocError('Something went wrong, Please Contact Technical Team');
            setMocSuccess('');
        } else if (response.status) {
            setMocSuccess('MOC generated successfully')

            const link = document.createElement('a');
            link.href = `${mocUrl + response.data}`;
            link.download = response.data;
            link.target = '_blank';
            link.click();

            setMocError('');
        }
    };

    const fetchUnassignedCardCustomers = async (id) => {
        setLoading(true);
        try {
            const unassignedCount = await fetchAllData('Member/FetchUnAssginedCardCustomerListCount');

            const response = await fetchData('Member/FetchUnAssginedCardCustomerList', {
                skip: 0,
                take: perPage,
                membertypeid: id
            });

            setTotalCount(unassignedCount[0].customerListCount);
            setMembersData(response);
        } catch (error) {
            console.error("Error fetching unassigned card customers:", error);
        } finally {
            setLoading(false);
        }
    };

    const showCallLog = () => {
        return (
            callHistory && callHistory.length > 0 ? (
                <div className="row">
                    <div className="card col-12 col-md-6 card-action mb-4">
                        <div className="card-header align-items-center">
                            <h5 className="card-action-title mb-0">
                                <i className="bx bx-list-ul me-2"></i>Call History
                            </h5>
                        </div>
                        <div className="card-body">
                            <ul className="timeline ms-2">
                                {callHistory.map((call, index) => (
                                    <li key={index} className="timeline-item timeline-item-transparent">
                                        <span className="timeline-point-wrapper">
                                            <span className="timeline-point timeline-point-success"></span>
                                        </span>
                                        <div className="timeline-event">
                                            <div className="timeline-header mb-1">
                                                <h6 className="mb-0">
                                                    {call.UserName}
                                                    <span className="badge bg-label-primary mb-2">
                                                        {call.CallResponseName}
                                                    </span>
                                                </h6>
                                                <small className="text-muted">
                                                    {moment(call.CollectedDate).local().diff(moment(), 'days') <= thresholdDays
                                                        ? <strong>{moment(call.CollectedDate).local().fromNow()}</strong>
                                                        : <strong>{moment(call.CollectedDate).local().format('DD-MMM-YYYY h:mm A')}</strong>}
                                                </small>
                                            </div>

                                            <div className="timeline-header mb-1 mt-1">
                                                <h6 className="mb-0">Remarks :</h6>
                                            </div>
                                            <p className="mb-0">{call.CallLog}</p>

                                            {call.DateToBeVisited !== '0001-01-01T00:00:00' && (
                                                <>
                                                    <div className="timeline-header mb-1 mt-1">
                                                        <h6 className="mb-0">Requested RM to visit on :</h6>
                                                    </div>
                                                    <p className="mb-0">{moment(call.DateToBeVisited).local().format('DD-MMM-YYYY h:mm A')}</p>
                                                </>
                                            )}

                                            {call.RequestCallBack !== '0001-01-01T00:00:00' && (
                                                <>
                                                    <div className="timeline-header mb-1 mt-1">
                                                        <h6 className="mb-0">Requested Callback on :</h6>
                                                    </div>
                                                    <p className="mb-0">{moment(call.RequestCallBack).local().format('DD-MMM-YYYY h:mm A')}</p>
                                                </>
                                            )}

                                        </div>
                                    </li>
                                ))}
                                <li className="timeline-end-indicator">
                                    <i className="bx bx-check-circle"></i>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="col-12 col-md-6">
                        <button
                            className="btn btn-primary btn-md mb-4"
                            onClick={() => setIsFormVisible(true)}
                        >
                            Add New Call Log
                        </button>
                        {isFormVisable && addCallLogForm()}
                    </div>
                </div>
            ) : (
                <div className="row">
                    <div className="text-danger fw-semibold col-12 col-md-5 mb-4 mx-2">
                        No Call History records
                    </div>

                    <div className="col-12 col-md-6">
                        <button
                            className="btn btn-primary btn-md mb-4"
                            onClick={() => setIsFormVisible(true)}
                        >
                            Add New Call Log
                        </button>
                        {isFormVisable && addCallLogForm()}
                    </div>
                </div>
            ))
    };

    const addCallLogForm = () => {
        return (
            <form onSubmit={onSubmitHandler} className="p-4 border rounded shadow-sm bg-white mb-4">
                <div className="mb-4">
                    <h5 className="mb-3" style={{ fontWeight: 'bold' }}>Call Response <span className="required" style={{ color: "red" }}> *</span></h5>
                    <div className="d-flex flex-wrap">
                        {callResponseOptions.map((option) => (
                            <div className="form-check me-4 mb-2 col-5" key={option.CallResponsesId}>
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    id={`callResponse_${option.CallResponsesId}`}
                                    name="callResponsesId"
                                    value={option.CallResponsesId}
                                    checked={formData.callResponsesId.includes(option.CallResponsesId)}
                                    onChange={onChangeHandler}
                                />
                                <label className="form-check-label" htmlFor={`callResponse_${option.CallResponsesId}`}>
                                    {option.ResponseName}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="row">
                    <div className="col-12 col-sm-6">
                        <div className="mb-3">
                            <label htmlFor="DateToBeVisited" className="form-label">Date To Be Visited</label>
                            <input
                                type="datetime-local"
                                className="form-control"
                                id="DateToBeVisited"
                                name="DateToBeVisited"
                                value={formData.DateToBeVisited}
                                onChange={onChangeHandler}
                            />

                        </div>
                    </div>

                    <div className="col-12 col-sm-6">
                        <div className="mb-3">
                            <label htmlFor="flatpickr-multi" className="form-label">Request Call Back</label>
                            <input
                                type="datetime-local"
                                className="form-control"
                                id="RequestCallBack"
                                name="RequestCallBack"
                                value={formData.RequestCallBack}
                                onChange={onChangeHandler}
                            />

                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-12">
                        <div className="mb-3">
                            <label htmlFor="remarks" className="form-label">Remarks</label>
                            <textarea
                                className="form-control"
                                id="remarks"
                                name="callLog"
                                placeholder="Enter Remarks"
                                onChange={onChangeHandler}
                                value={formData.callLog}
                                rows="4"
                            />

                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12 d-flex justify-content-start">
                        <button type="submit" className="btn btn-primary" disabled={!isFormValid} >Submit</button>

                        <button className="btn btn-secondary ms-2" type="button" onClick={handleResetForm}>
                            Reset
                        </button>
                        <button className="btn btn-danger ms-2" type="button" onClick={handleBackToView}>
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        );
    };

    const filterUI = () => (
        <div className="card p-1 my-1 sticky-top" style={{ zIndex: 1 }}>

            <div className="select2-primary mx-1 mb-2" style={{ display: 'flex', flexWrap: 'wrap' }}>
                {(selectedNames.length > 0 || selectedNumbers.length > 0 || selectedStates.length > 0 || selectedDistricts.length > 0 || selectedMandals.length > 0 || selectedVillages.length > 0 || selectedRegionalManager.length > 0 || selectedRouteMap.length > 0 || selectedResponse.length > 0 || livelongStatusFilter.length > 0 || paStatusFilter.length > 0) && (
                    <>
                        <strong style={{ marginRight: '5px' }}>Filter Criteria - </strong>

                        {selectedNames.length > 0 && (
                            <div style={{ marginRight: '10px', marginBottom: '0px', display: 'flex', alignItems: 'center' }}>
                                <strong style={{ marginRight: '5px' }}>Name : </strong>
                                <span className="selected-option-button">
                                    {selectedNames[selectedNames.length - 1]}
                                </span>
                            </div>
                        )}
                        {selectedNumbers.length > 0 && (
                            <div style={{ marginRight: '10px', marginBottom: '0px', display: 'flex', alignItems: 'center' }}>
                                <strong style={{ marginRight: '5px' }}> Mobile Number: </strong>
                                <span className="selected-option-button">
                                    {selectedNumbers[selectedNumbers.length - 1]}
                                </span>
                            </div>
                        )}
                        {selectedStates.length > 0 && (
                            <div style={{ marginRight: '10px', marginBottom: '0px', display: 'flex', alignItems: 'center' }}>
                                <strong style={{ marginRight: '5px' }}>State : </strong>
                                {selectedStates.map((state, index) => (
                                    <span key={state.value} className="selected-option-button">
                                        {state.label}
                                        {index !== selectedStates.length - 1 && ', '}
                                    </span>
                                ))}
                            </div>
                        )}
                        {selectedDistricts.length > 0 && (
                            <div style={{ marginRight: '10px', marginBottom: '0px', display: 'flex', alignItems: 'center' }}>
                                <strong style={{ marginRight: '5px' }}>District : </strong>
                                {selectedDistricts.map((district, index) => (
                                    <span key={district.value} className="selected-option-button">
                                        {district.label}
                                        {index !== selectedDistricts.length - 1 && ', '}
                                    </span>
                                ))}
                            </div>
                        )}
                        {selectedMandals.length > 0 && (
                            <div style={{ marginRight: '10px', marginBottom: '0px', display: 'flex', alignItems: 'center' }}>
                                <strong style={{ marginRight: '5px' }}>Mandal : </strong>
                                <span className="selected-option-button">
                                    {selectedMandals[selectedMandals.length - 1]}
                                </span>
                            </div>
                        )}
                        {selectedVillages.length > 0 && (
                            <div style={{ marginRight: '10px', marginBottom: '0px', display: 'flex', alignItems: 'center' }}>
                                <strong style={{ marginRight: '5px' }}>Village : </strong>
                                <span className="selected-option-button">
                                    {selectedVillages[selectedVillages.length - 1]}
                                </span>
                            </div>
                        )}
                        {selectedRegionalManager.length > 0 && (
                            <div style={{ marginRight: '10px', marginBottom: '0px', display: 'flex', alignItems: 'center' }}>
                                <strong style={{ marginRight: '5px' }}>Relationship Manager:</strong>
                                <span className="selected-option-button">{selectedRegionalManager}</span>
                            </div>
                        )}
                        {selectedRouteMap.length > 0 && (
                            <div style={{ marginRight: '10px', marginBottom: '0px', display: 'flex', alignItems: 'center' }}>
                                <strong style={{ marginRight: '5px' }}>Route Map:</strong>
                                <span className="selected-option-button">{selectedRouteMap}</span>
                            </div>
                        )}
                        {selectedResponse.length > 0 && (
                            <div style={{ marginRight: '10px', marginBottom: '0px', display: 'flex', alignItems: 'center' }}>
                                <strong style={{ marginRight: '5px' }}>Call Response :</strong>
                                <span className="selected-option-button">{selectedCallResponseLabels}</span>
                            </div>
                        )}
                        {livelongStatusFilter.length > 0 && (
                            <div style={{ marginRight: '10px', marginBottom: '0px', display: 'flex', alignItems: 'center' }}>
                                <strong style={{ marginRight: '5px' }}>Service Provider Status :</strong>
                                <span className="selected-option-button">{SelectedLiveLongStatusLabel}</span>
                            </div>
                        )}
                        {paStatusFilter.length > 0 && (
                            <div style={{ marginRight: '10px', marginBottom: '0px', display: 'flex', alignItems: 'center' }}>
                                <strong style={{ marginRight: '5px' }}>PA Status :</strong>
                                <span className="selected-option-button">{SelectedPAStatusLabel}</span>
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="row gy-2 align-items-center">

                <div className="col-4 col-md-4">
                    <ul className="nav nav-md nav-pills">
                        <li className="nav-item">
                            <Link
                                className={`nav-link`}
                                to={`/customers/new`}
                            >
                                <i className="tf-icons navbar-icon bx bx-plus-circle"></i>&nbsp;Add New
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* <div className="col-12 col-md-4">
                    <div className="d-flex flex-row">
                        <button
                            className="btn btn-primary p-0 me-1 px-1"
                            style={{ fontSize: '15px' }}
                            onClick={() => {
                                const id = getMemberTypeIdByName("Advisor");
                                if (id !== null) {
                                    setIsCustomers(false);
                                    setMemberTypeId(id);
                                    applyFilter(String(id));
                                }
                            }}
                        >
                            Advisors ({advisorCount})
                        </button>
                        <button
                            className="btn btn-success p-0 me-1 px-1"
                            style={{ fontSize: '15px' }}
                            onClick={() => {
                                const id = getMemberTypeIdByName("Distributor");
                                if (id !== null) {
                                    setIsCustomers(false);
                                    setMemberTypeId(id);
                                    applyFilter(String(id));
                                }
                            }}
                        >
                            Distributors ({distributorCount})
                        </button>

                        <button
                            className="btn btn-info p-0 me-1 px-1"
                            style={{ fontSize: '15px' }}
                            //onClick={() => setShowCardButtons(true)} // Show card buttons on 
                            onClick={() => {
                                const id = getMemberTypeIdByName("Customer");
                                if (id !== null) {
                                    setIsCustomers(true);
                                    setIsActiveCustomers(true);
                                    setMemberTypeId(id);
                                    applyFilter(String(id));
                                }
                            }}
                        >
                            Customers ({customerCount})
                        </button>

                    </div>
                </div> */}

                <div className="col-12 col-md-4">
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

    const selectedCallResponseLabels = Array.isArray(selectedResponse)
        ? selectedResponse
            .map(response => callResponseFilter.find(option => option.value === parseInt(response))?.label)
            .filter(label => label)
            .join(', ')
        : callResponseFilter.find(option => option.value === parseInt(selectedResponse))?.label || "No Call Response selected";
    const SelectedLiveLongStatusLabel = serviceStatus.find(response => response.ServiceStatusId === parseInt(livelongStatusFilter))?.StatusName || "No LiveLong Response selected";
    const SelectedPAStatusLabel = serviceStatus.find(response => response.ServiceStatusId === parseInt(paStatusFilter))?.StatusName || "No LiveLong Response selected";

    return (
        <>
            {loading ? <TableSkeletonLoading /> : !isDataLoaded ? <TableSkeletonLoading /> : (
                <>
                    {filterUI()}

                    <div className="accordion" id="accordionExample">

                        <div className="modal fade" id="filterModal" tabIndex="-1" aria-labelledby="filterModalLabel" aria-hidden="true">
                            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title" id="filterModalLabel">Filters</h5>
                                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                    </div>
                                    <div className="modal-body">
                                        <div className="accordion-body">
                                            <div className="row mb-2">
                                                <div className="col-lg-8 order-1 order-md-0">
                                                    {/*<label htmlFor="name-input" className="form-label">Name</label>*/}
                                                    {/*<input type="text" id="name-input" className="form-control" maxLength="50" onChange={handleNameSelect} />*/}

                                                    {/*<label htmlFor="mobile-input" className="form-label">Mobile Number</label>*/}
                                                    {/*<input type="number" id="mobile-input" className="form-control" maxLength={10} onChange={handleMobileSelect} />*/}

                                                    {/* <label htmlFor="route-map-input" className="form-label">Route Map Name</label>
                                                    <select
                                                        id="route-map-input"
                                                        className="form-select"
                                                        onChange={(e) => handleRouteMapChange(e.target.value)}
                                                        value={selectedRouteMap || ''}
                                                    >
                                                        <option value="">Select...</option>
                                                        {routeOptions.map((option, index) => (
                                                            <option key={index} value={option.value}>{option.label}</option>
                                                        ))}
                                                    </select> */}

                                                    <label htmlFor="select2Success" className="form-label">States</label>
                                                    <div className="select2-primary">
                                                        {statesMultiSelect && (
                                                            <MultiSelect
                                                                options={statesMultiSelect}
                                                                value={selectedStates}
                                                                onChange={setSelectedStates}
                                                            />
                                                        )}
                                                    </div>

                                                    <label htmlFor="select2Success" className="form-label">Districts</label>
                                                    <div className="select2-primary">
                                                        {districtsMultiSelect && (
                                                            <MultiSelect
                                                                options={districtsMultiSelect}
                                                                value={selectedDistricts}
                                                                onChange={setSelectedDistricts}
                                                            />
                                                        )}
                                                    </div>

                                                    <label htmlFor="rm-input" className="form-label">Relationship Manager</label>
                                                    <select
                                                        id="rm-input"
                                                        className="form-select"
                                                        onChange={(e) => handleRegionalManagerChange(e.target.value)}
                                                        value={selectedRegionalManager || ''}
                                                    >
                                                        <option value="">Select... </option>
                                                        {rmOptions.map((option, index) => (
                                                            <option key={index} value={option.value}>{option.label}</option>
                                                        ))}
                                                    </select>

                                                    <label htmlFor="mandal-input" className="form-label">Mandal</label>
                                                    <input type="text" id="mandal-input" value={selectedMandals[selectedMandals.length - 1]} className="form-control" maxLength="50" onChange={handleMandalSelect} />

                                                    <label htmlFor="village-input" className="form-label">Village</label>
                                                    <input type="text" id="village-input" value={selectedVillages[selectedVillages.length - 1]} className="form-control" maxLength="50" onChange={handleVillageSelect} />
                                                </div>

                                                {/* <div className="col-lg-4 order-0 order-md-1">
                                                    <label htmlFor="call-response-input" className="form-label">Call Response</label>
                                                    <div id="call-response-input" className="form-check">
                                                        {callResponseFilter.map((option) => (
                                                            <div key={option.value} className="form-check form-check-inline">
                                                                <input
                                                                    type="checkbox"
                                                                    id={`call-response-${option.value}`}
                                                                    value={option.value}
                                                                    checked={selectedResponse.includes(parseInt(option.value))}
                                                                    onChange={handleCallResponseChange}
                                                                    className="form-check-input"
                                                                />
                                                                <label htmlFor={`call-response-${option.value}`} className="form-check-label">
                                                                    {option.label}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <label htmlFor="livelong-status" className="form-label">Service Provider Status</label> 
                                                    <select
                                                        id="livelong-status"
                                                        className="form-select"
                                                        onChange={(e) => handleLivelongStatusChange(e.target.value)}
                                                        value={livelongStatusFilter}
                                                    >
                                                        <option value="">Select...</option>
                                                        {serviceStatus && serviceStatus.map(item => (
                                                            <option key={item.ServiceStatusId} value={item.ServiceStatusId}>{item.StatusName}</option>
                                                        ))}
                                                    </select>

                                                    <label htmlFor="pa-status" className="form-label">PA Status</label>
                                                    <select
                                                        id="pa-status"
                                                        className="form-select"
                                                        onChange={(e) => handlePaStatusChange(e.target.value)}
                                                        value={paStatusFilter}
                                                    >
                                                        <option value="">Select...</option>
                                                        {serviceStatus && serviceStatus.map(item => (
                                                            <option key={item.ServiceStatusId} value={item.ServiceStatusId}>{item.StatusName}</option>
                                                        ))}
                                                    </select> 

                                                </div> */}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer mt-3">
                                        <button type="reset" className="btn btn-secondary" data-bs-dismiss="modal" onClick={clearFilters}>Clear</button>
                                        <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={applyFilter} disabled={isDisableApply}>Apply</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-xl-12 col-lg-12 col-md-12 order-0 order-md-1">
                                <div className="card mt-2" style={{ opacity: loading ? 0.5 : 1 }}>
                                    <div >
                                        {/*{(loading || tableloading) && (
                                        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(255, 255, 255, 0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
                                            <CircularProgress />
                                        </div>
                                    )}*/}

                                        {!loading && !tableloading && membersData && membersData.length === 0 && (
                                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                                <h5 className="text-danger">There are no records to display.</h5>
                                            </div>
                                        )}

                                        {isCustomers && (
                                            <div className="d-flex flex-row align-items-center mb-2">
                                                <button className={`btn btn-sm me-2 nav-link ${isActiveCustomers && 'text-white p-1'}`}
                                                    style={{ backgroundColor: isActiveCustomers ? (isAssignedHovered ? '#a30280' : '#f71ec8') : isAssignedHovered && '#e0dee0' }}
                                                    onMouseEnter={() => setIsAssignedHovered(true)}
                                                    onMouseLeave={() => setIsAssignedHovered(false)}
                                                    onClick={() => {
                                                        const id = getMemberTypeIdByName("Customer");
                                                        if (id !== null) {
                                                            setIsCustomers(true);
                                                            setIsActiveCustomers(true);
                                                            setMemberTypeId(id);
                                                            applyFilter(String(id));
                                                            setIsAssignedHovered(false);
                                                        }
                                                    }}
                                                >Assigned Cards</button>
                                                <button className={`btn btn-sm nav-link ${!isActiveCustomers && 'text-white p-1'}`}
                                                    style={{ backgroundColor: !isActiveCustomers ? (isUnAssignedHovered ? '#a30280' : '#f71ec8') : isUnAssignedHovered && '#e0dee0' }}
                                                    onMouseEnter={() => setIsUnAssignedHovered(true)}
                                                    onMouseLeave={() => setIsUnAssignedHovered(false)}
                                                    onClick={() => {
                                                        const id = getMemberTypeIdByName("Customer");
                                                        if (id !== null) {
                                                            setIsCustomers(true);
                                                            setIsActiveCustomers(false);
                                                            setMemberTypeId(id);
                                                            fetchUnassignedCardCustomers(id);
                                                            setIsUnAssignedHovered(false);
                                                        }
                                                    }}
                                                >Un-Assigned Cards</button>
                                            </div>
                                        )}

                                        {!loading && !tableloading && membersData.length > 0 && (
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
                                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                        >
                                            <Alert onClose={handleSnackbarClose} severity="success">
                                                {snackbarMessage}
                                            </Alert>
                                        </Snackbar>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Modal
                            isOpen={isModalOpen}
                            onRequestClose={() => {
                                setIsModalOpen(false);
                                setCallLogMemberId();
                                setIsFormVisible(false);
                                setFormData(initialFormData);
                                setFormError({});
                            }}
                            ariaHideApp={false}
                            style={{
                                overlay: {
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                },
                                content: {
                                    position: 'relative',
                                    width: '70%',
                                    maxHeight: '90vh',
                                    margin: 'auto',
                                    borderRadius: '8px',
                                    padding: '20px',
                                    overflow: 'auto',
                                    left: window.innerWidth > 1100 ? 120 : 0,
                                    right: window.innerWidth > 1100 ? 100 : 0,
                                    top: 70
                                },
                            }}
                        >
                            <>
                                <div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>
                                    <button
                                        style={{ border: '0px', backgroundColor: "transparent" }}
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setCallLogMemberId();
                                            setIsFormVisible(false);
                                            setFormData(initialFormData);
                                            setFormError({});
                                        }}
                                    >
                                        <i style={{ height: "30px", width: "30px" }} className="fa-regular fa-circle-xmark"></i>
                                    </button>
                                </div>

                                <div>
                                    {showCallLog()}
                                </div>
                            </>
                        </Modal>
                    </div>

                    <div
                        className="modal fade"
                        id="exLargeModal"
                        tabIndex="-1"
                        aria-hidden="true"
                        aria-labelledby="exampleModalLabel4"
                    >
                        <div className="modal-dialog modal-lg modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h4 className="modal-title" id="exampleModalLabel4">
                                        Membership Certificate
                                    </h4>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        data-bs-dismiss="modal"
                                        aria-label="Close"
                                    ></button>
                                </div>
                                {selectedView && (
                                    <div className="modal-body">
                                        <>
                                            <div className="row">
                                                <div className="col-12">
                                                    <div className=" mb-4">
                                                        <div className="user-profile-header d-flex flex-column flex-sm-row text-sm-start text-center">

                                                            <div className="flex-grow-1">
                                                                {selectedView && selectedView.ProductsId !== 0 ? (
                                                                    selectedView.MembershipCertificate && selectedView.MembershipCertificate.length > 0 ? (
                                                                        <div className="user-profile-info">
                                                                            <p>Membership certificate alredy exists for member</p>
                                                                            <p>You can download certificate or ReGenerate it</p>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="user-profile-info">
                                                                            <p>Member has purchased products</p>
                                                                            <p>Please Generate Membership certificate here</p>
                                                                        </div>
                                                                    )
                                                                ) : (
                                                                    <div className="user-profile-info">
                                                                        <p>No products purchased yet.</p>
                                                                        <p>Kindly, purchase products to generate Membership certificate</p>
                                                                    </div>
                                                                )}

                                                                {selectedView && selectedView.ProductsId !== 0 && (
                                                                    selectedView.MembershipCertificate && selectedView.MembershipCertificate.length > 0 ? (
                                                                        <div className="d-flex flex-row justify-content-end gap-2">
                                                                            <button className="btn btn-secondary" onClick={downloadMOC}>
                                                                                Download MOC
                                                                            </button>
                                                                            <button
                                                                                className='btn btn-primary'
                                                                                onClick={generateMOC}
                                                                                style={{ minWidth: '150px', minHeight: '40px' }}
                                                                                disabled={mocLoading}
                                                                            >
                                                                                {mocLoading ? (
                                                                                    <div class="spinner-border text-white" role="status">
                                                                                        <span class="sr-only">Loading...</span>
                                                                                    </div>
                                                                                ) : 'ReGenerate MOC'}
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="d-flex flex-row justify-content-end gap-2">
                                                                            <button
                                                                                className='btn btn-primary'
                                                                                onClick={generateMOC}
                                                                                style={{ minWidth: '150px', minHeight: '40px' }}
                                                                                disabled={mocLoading}
                                                                            >
                                                                                {mocLoading ? (
                                                                                    <div class="spinner-border text-white" role="status">
                                                                                        <span class="sr-only">Loading...</span>
                                                                                    </div>
                                                                                ) : 'Generate MOC'}
                                                                            </button>
                                                                        </div>
                                                                    )
                                                                )}

                                                                {mocError && mocError.length > 0 && (
                                                                    <p className="text-danger text-end mt-3 mb-0">{mocError}</p>
                                                                )}

                                                                {mocSuccess && mocSuccess.length > 0 && (
                                                                    <p className="text-success text-end mt-3 mb-0">{mocSuccess}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </>
            )}
        </>
    );
};
