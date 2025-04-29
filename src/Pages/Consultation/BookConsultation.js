import React, { useEffect, useState } from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { useLocation } from 'react-router-dom';
import { fetchAllData, fetchData, fetchUpdateData } from '../../helpers/externapi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faCheck, faTicket, faRupeeSign } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import { Snackbar, Alert } from '@mui/material'; // Import Snackbar and Alert



const BookConsultation = () => {

    const getCurrentDateTime = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    const [activeTab, setActiveTab] = useState('consultation');
    const [mobileNumber, setMobileNumber] = useState("");
    const [isVerified, setIsVerified] = useState(false);
    const [input, setInput] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        FullName: '', MobileNumber: '', Cardnumber: '', Gender: '', DateofBirth: '', Age: '', Address: '',
        DateAndTime: '', DoctorName: '', ServiceTypeId: '', Appointment: 'Free Consultation',
        HospitalId: '', HospitalName: '', customerId: '', dependentCustomerId: '', employeeId: '',
        discountInPercentage: '', consultationFee: '', status: ""
    });
    const [formErrors, setFormErrors] = useState({
        DateAndTime: '', HospitalId: '', ServiceTypeId: '', Appointment: '',
        NumberOfCoupons: '', CouponCode: '', status: ""
    });
    const [couponsFormData, setCouponsFormData] = useState({
        FullName: '',
        NumberOfCoupons: '',
        HospitalId: ''
    });

    const [couponsFormErrors, setCouponsFormErrors] = useState({});
    const [eligibilityMessage, setEligibilityMessage] = useState();
    const [formSuccessMessage, setFormSuccessMessage] = useState();
    const [memberDetails, setMemberDetails] = useState();
    const [dependents, setDependents] = useState();
    const [verifiedMessage, setVerifiedMessage] = useState();
    const [serviceTypes, setServiceTypes] = useState([]);
    const [formLoading, setFormLoading] = useState(false);
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hospitalInput, setHospitalInput] = useState('');
    const [hospitalSuggestions, setHospitalSuggestions] = useState([]);
    const [hospitalSearchLoading, setHospitalSearchLoading] = useState(false);
    const [hospitalSearchError, setHospitalSearchError] = useState('');
    const location = useLocation();
    const { memberId: initialMemberId } = location.state || '';
    const [memberId, setMemberId] = useState(initialMemberId);
    const UserId = localStorage.getItem("UserId");
    const [allStatusData, setAllStatusData] = useState({ rawData: [], statesArray: [] });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [couponInput, setCouponInput] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [selectedCouponName, setSelectedCouponName] = useState('');
    const [couponsInput, setCouponsInput] = useState('');
    const [selectedHospitalServices, setSelectedHospitalServices] = useState([]);
    const [couponsSuggestions, setCouponsSuggestions] = useState([]);
    const [couponsError, setCouponsError] = useState('');
    const [loading, setLoading] = useState(false);
    const [initiatedStatusId, setInitiatedStatusId] = useState(null);
    const [bookedStatusId, setBookedStatusId] = useState(null);
    const [hospitalServices, setHospitalServices] = useState([]);
    const [hospitalId, setHospitalId] = useState(null);

    const [selectedHospital, setSelectedHospital] = useState(null);
    const [hospitalName, setHospitalName] = useState('');
    const [servicesLoading, setServicesLoading] = useState(false);
    const [couponCount, setCouponCount] = useState(0);
    const [amount, setAmount] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [member, setMember] = useState("");
    const [fullName, setFullName] = useState('');
    const [gender, setGender] = useState('');
    const [age, setAge] = useState('');
    const [memberLoading, setMemberLoading] = useState(false);
    const [cardNumber, setCardNumber] = useState(null);
    const [memberCoupons, setMemberCoupons] = useState({});
    const [dependentCoupons, setDependentCoupons] = useState({});
    const [selectedHospitalService, setSelectedHospitalService] = useState(null);
    const [hospitalService, setHospitalService] = useState([]);
    const [bookingConsultationId, setBookingConsultationId] = useState(null);
    const [showAppointmentForm, setShowAppointmentForm] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [reason, setReason] = useState('');
    const [appointmentDate, setAppointmentDate] = useState(getCurrentDateTime);
    const [serviceError, setServiceError] = useState('');
    const [appointmentDateError, setAppointmentDateError] = useState('');
    const [selectedService, setSelectedService] = useState(null);
    const [services, setServices] = useState([]);
    const [isBooking, setIsBooking] = useState(false);



    useEffect(() => {
        if (memberId) {
            setIsVerified(true);
        }
    }, [memberId]);

    const buttonStyle = (tab) => ({
        width: "100%",
        background: activeTab === tab
            ? "linear-gradient(135deg, #8a4fff, #5f27cd)"
            : "linear-gradient(135deg, #f3e5f5, #e1bee7)",
        color: activeTab === tab ? "#ffffff" : "#6a1b9a",
        border: "1px solid #aac9f0",
        padding: "12px 20px",
        borderRadius: "10px 10px 0 0",
        outline: "none",
        cursor: "pointer",
        fontWeight: "bold",
        transition: "background 0.4s ease-in-out, box-shadow 0.3s ease",
        boxShadow: activeTab === tab
            ? "0 4px 10px rgba(0, 198, 255, 0.3)"
            : "none",
        backgroundSize: "200% 200%",
        animation: activeTab === tab ? "gradientAnimation 3s ease infinite" : "none",
    });

    useEffect(() => {
        const getStatus = async () => {
            setLoading(true);
            try {
                const statusData = await fetchAllData("lambdaAPI/Status/all", { skip: 0, take: 0 });
                let extractedStatusData = [];
                if (statusData) {
                    if (Array.isArray(statusData)) {
                        extractedStatusData = statusData;
                    } else if (typeof statusData === 'object' && statusData.data && Array.isArray(statusData.data)) {
                        extractedStatusData = statusData.data;
                    } else if (typeof statusData === 'object') {
                        extractedStatusData = Object.values(statusData);
                    }
                }

                setAllStatusData(extractedStatusData);
                const initiated = extractedStatusData.find(item => item.Value === "Initiated")?.StatusId;
                const booked = extractedStatusData.find(item => item.Value === "Booked")?.StatusId;
                setInitiatedStatusId(initiated);
                setBookedStatusId(booked);

                if (initiated) {
                    setFormData(prevVal => ({
                        ...prevVal,
                        status: initiated
                    }));
                }
            } catch (error) {
                console.error("Error fetching statuses:", error);
                setAllStatusData([]);
            } finally {
                setLoading(false);
            }
        };

        getStatus();
    }, []);


    const fetchProfileUrl = async () => {
        try {
            //setLoading(true);
            const getConfigValues = await fetchData('ConfigValues/all', { skip: 0, take: 0 });

            const profileUrl = getConfigValues && getConfigValues.find(value => value.ConfigKey === 'couponAmount');
            setAmount(profileUrl.ConfigValue);
        } catch (e) {
            console.error("Error fetching config Values ConfigValues/all", e);
        } finally {
            // setLoading(false);
        }
    };


    const handleHospitalConsultation = async (service, dependent) => {
        const status = await fetchAllData(`lambdaAPI/Status/all`);
        const initiatedStatus = status.find(item => item.Value === "Initiated");

        const response = await fetchData('lambdaAPI/BookingConsultation/bookAppointment/add', {
            name: dependent.name || fullName,
            gender: dependent.gender || gender,
            age: dependent.age || age,
            customerId: memberId,
            dependentCustomerId: dependent.customerId || null,
            address: member.AddressLine1,
            dateofBirth: dependent.dateofBirth || member.DateofBirth,
            mobileNumber: dependent.mobileNumber || member.MobileNumber,
            cardNumber,
            employeeId: UserId,
            hospitalName,
            hospitalId: formData.HospitalId,
            status: initiatedStatus.StatusId,
            hospitalPoliciesId: selectedHospitalService
        });

        const bookingId = response.data?.bookingConsultationId || response.data[0]?.BookingConsultationId;
        if (bookingId) {
            setBookingConsultationId(bookingId);
            setShowModal(false);
            setShowAppointmentForm(true);  // 👈 this shows the appointment form below
        } else {
            console.error("Booking creation failed:", response);
            setSnackbar({
                open: true,
                message: 'Failed to initiate consultation. Try again.',
                severity: 'error',
            });
        }
    };


    useEffect(() => {
        fetchProfileUrl();
    }, []);


    const validateFields = () => {
        let isValid = true;

        if (!appointmentDate) {
            setAppointmentDateError('Select Appointment Date');
            isValid = false;
        } else {
            setAppointmentDateError('');
        }

        if (selectedHospitalService === 1 && !selectedService) {
            setServiceError('Please select a Service');
            isValid = false;
        } else {
            setServiceError('');
        }


        return isValid;
    };

    useEffect(() => {
        const fetchMemberDetails = async () => {
            const responseMemberDetails = await fetchAllData(`lambdaAPI/OHOCards/GetMemberDetailsId/${memberId}`);
            setMemberDetails(responseMemberDetails);

            responseMemberDetails && responseMemberDetails.length > 0 && (
                setFormData((preVal) => ({
                    ...preVal, FullName: responseMemberDetails[0].FullName, MobileNumber: responseMemberDetails[0].MobileNumber, Cardnumber: responseMemberDetails[0].OHOCardNumber,
                    Gender: responseMemberDetails[0].Gender, DateofBirth: formatDate(responseMemberDetails[0].DateofBirth), Age: calculateAge(responseMemberDetails[0].DateofBirth),
                    Address: responseMemberDetails[0].AddressLine1
                }))
            )
        };

        const fetchDependents = async () => {

            try {
                const responseDependents = await fetchAllData(`lambdaAPI/Customer/GetDependentsByCustomerId/${memberId}`);
                setDependents(responseDependents);
            } catch (error) {
                console.error('Error fetching dependents:', error);

            }
        };


        const fetchServiceTypes = async () => {
            const getServiceTypes = await fetchData("HospitalServices/all", { skip: 0, take: 0 });

            const dataServices = getServiceTypes.map((item) => ({
                label: item.ServiceName,
                value: item.HospitalServicesId,
            }));
            setServices(dataServices);
            //setServices(getServiceTypes);
        };

        if (memberId) {
            fetchMemberDetails();
            fetchDependents();
        }

        fetchServiceTypes();
    }, [memberId]);



    useEffect(() => {
        if (showModal) {
            const fetchMemberData = async () => {
                try {
                    // Fetch main member data
                    setMemberLoading(true);
                    const memberData = await fetchAllData(`lambdaAPI/Customer/GetById/${memberId}`);
                    if (memberData && memberData.length > 0) {
                        setMember(memberData[0]);
                        const { Name, Gender, Age } = memberData[0];
                        setFullName(Name);
                        setGender(Gender);
                        setAge(Age);
                    }

                    // Fetch dependents data
                    const memberDependents = await fetchAllData(
                        `lambdaAPI/Customer/GetDependentsByCustomerId/${memberId}`
                    );
                    if (memberDependents && memberDependents.length > 0) {
                        setDependents(memberDependents);
                    }

                    const cardData = await fetchAllData(`lambdaAPI/OHOCards/GetMemberCardByMemberId/${memberId}`);
                    if (cardData && cardData.status) {
                        setCardNumber(cardData.returnData[0].OHOCardnumber);
                    }

                    // Fetch coupon availability for main member
                    const memberCouponResponse = await fetchData("lambdaAPI/BookingConsultation/checkIndividualCoupons", {
                        CustomerId: memberId,
                        DependentCustomerId: null,
                        hospitalId: formData.HospitalId,
                    });

                    setMemberCoupons((prev) => ({
                        ...prev,
                        [memberId]: memberCouponResponse.availableCoupons, // Store available coupons
                    }));

                    // Fetch coupon availability for each dependent
                    for (const dependent of memberDependents || []) {
                        const dependentCouponResponse = await fetchData("lambdaAPI/BookingConsultation/checkIndividualCoupons", {
                            CustomerId: memberId,
                            DependentCustomerId: dependent.customerId,
                            hospitalId: formData.HospitalId,
                        });

                        setDependentCoupons((prev) => ({
                            ...prev,
                            [dependent.customerId]: dependentCouponResponse.availableCoupons, // Store available coupons
                        }));
                    }

                } catch (error) {
                    console.error("Error fetching data:", error);
                } finally {
                    setMemberLoading(false);
                }
            };

            fetchMemberData();
        }
    }, [showModal, memberId]);

    const handleInputChange = async (event) => {
        const value = event.target.value;
        setInput(value);

        // Always call the API, even for an empty input
        setSearchLoading(true);
        setError('');

        try {
            const filter = value
                ? [{ key: "HospitalName", value: value, operator: "LIKE" }]
                : [{ key: "", value: "", operator: "" }];

            const hospitalNameSuggestions = await fetchData(
                "Hospital/GetHospitalListByKeyValuePair",
                { filter }
            );

            if (hospitalNameSuggestions.length > 0) {
                setSuggestions(hospitalNameSuggestions);
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
    };


    const handleHospitalConsultationLab = (service) => {
        setSelectedHospitalService(service); // This will be used to check policyId
        setShowModal(true);
    };



    const handleCouponsInputChange = async (event) => {
        const value = event.target.value;
        setCouponsInput(value);
        setSearchLoading(true);
        setError('');

        try {
            const filter = value
                ? [{ key: "HospitalName", value: value, operator: "LIKE" }]
                : [{ key: "", value: "", operator: "" }];


            const hospitalNameSuggestions = await fetchData(
                "Hospital/GetHospitalListByKeyValuePair",
                { filter }
            );


            if (hospitalNameSuggestions.length > 0) {
                setSuggestions(hospitalNameSuggestions);
            } else {
                setError('No suggestions found.');
                setSuggestions([]);
            }
        } catch (error) {
            console.error("Suggestion Fetch Error:", error); // Error logging
            setError('Failed to fetch suggestions.');
            setSuggestions([]);
        } finally {
            setSearchLoading(false);
        }
    };

    const clearSearch = () => {
        setInput('');
        setSuggestions([]);
    };

    const clearCouponsSearch = () => {
        setCouponsInput('');
        setCouponsSuggestions([]);
        setCouponsError('');
    };

    const handleVerifyInputChange = (e) => {
        const value = e.target.value;

        if (/^\d*$/.test(value)) {
            setMobileNumber(value);
        }
    };

    const handleVerifyInputChangecoupons = (e) => {
        const value = e.target.value;

        if (/^\d*$/.test(value)) {
            setMobileNumber(value);
        }
    };

    const formatCardNumber = (number) => {
        return number.replace(/\s+/g, '').replace(/(.{4})(?=.{4})/g, '$1 ');
    };

    const handleVerify = async (e) => {
        e.preventDefault();

        if (!initiatedStatusId) {
            console.error("Initiated status ID not available");
            setVerifiedMessage("System error: Status data not loaded. Please refresh and try again.");
            return;
        }

        const isCardNumber = mobileNumber.length === 12;
        const formattedCardNumber = isCardNumber ? formatCardNumber(mobileNumber) : mobileNumber;

        const payload = {
            mobileNumber: isCardNumber ? "" : mobileNumber,
            cardNumber: isCardNumber ? formattedCardNumber : "",
            status: initiatedStatusId
        };



        try {
            setVerifyLoading(true);
            const response = await fetchData(`lambdaAPI/OHOCards/GetMemberDetailsByCardNumberuorMobileNo`, payload);


            if (response && response.status === true) {
                // Store the member ID from the verification response
                setMemberId(response.memberId);
                setVerifiedMessage(response.message);
                setIsVerified(true);

                // Update form data with the correct status and member ID
                const updatedFormData = {
                    ...formData,
                    status: initiatedStatusId,
                    memberId: response.memberId
                };

                // Update state
                setFormData(updatedFormData);



                // Set a flag in sessionStorage or localStorage if you need to persist this between page reloads
                sessionStorage.setItem('consultationStatus', initiatedStatusId);
                sessionStorage.setItem('consultationMemberId', response.memberId);

            } else {
                console.warn("Verification failed:", response ? response.message : "No response");
                setVerifiedMessage(response ? response.message : "Verification failed.");
            }
        } catch (error) {
            console.error("Error during verification:", error);
            alert("An error occurred while verifying. Please try again.");
        } finally {
            setVerifyLoading(false);
        }
    };


    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     if (isSubmitting) return;

    //     if (!bookedStatusId) {
    //         console.error("Booked status ID not available");
    //         setEligibilityMessage("System error: Status data not loaded. Please refresh and try again.");
    //         return;
    //     }

    //     const noError = checkErrors();
    //     if (!noError) {
    //         setEligibilityMessage('Please correct the form errors.');
    //         setFormSuccessMessage('');
    //         setIsSubmitting(false);
    //         return;
    //     }

    //     const selectedService = hospitalServices.find(
    //         (service) => service.value === formData.HospitalPoliciesId
    //     );

    //     const isConsultationService = selectedService?.label?.toLowerCase().includes("consultation");
    //     const userIdentifier = formData.MobileNumber || formData.Cardnumber;

    //     if (isConsultationService && hasUsedFreeConsultation(userIdentifier)) {
    //         setEligibilityMessage("You have already used your free consultation with this mobile number or card.");
    //         setFormSuccessMessage('');
    //         setIsSubmitting(false);
    //         return;
    //     }

    //     const safeFormData = {
    //         FullName: formData.FullName || '',
    //         MobileNumber: formData.MobileNumber || '',
    //         Cardnumber: formData.Cardnumber || '',
    //         Gender: formData.Gender || '',
    //         DateofBirth: formData.DateofBirth || '',
    //         Age: formData.Age || null,
    //         DateAndTime: formData.DateAndTime || '',
    //         Address: formData.Address || '',
    //         HospitalId: formData.HospitalId || '',
    //         HospitalName: formData.HospitalName || '',
    //         ServiceTypeId: formData.ServiceTypeId || '',
    //         consultationFee: formData.consultationFee || null,
    //         discountInPercentage: formData.discountInPercentage || null,
    //         DoctorName: formData.DoctorName || '',
    //         Appointment: formData.Appointment || '',
    //         customerId: formData.customerId || null,
    //         dependentCustomerId: formData.dependentCustomerId || null,
    //         status: formData.status || '',
    //         HospitalPoliciesId: formData.HospitalPoliciesId,
    //     };

    //     const payload = createPayload(safeFormData, bookedStatusId, UserId, allStatusData);

    //     console.log("Submission Payload:", payload);

    //     setFormLoading(true);
    //     setIsSubmitting(true);

    //     try {
    //         const responseEligible = await fetchData(`lambdaAPI/BookingConsultation/bookAppointment/add`, payload);
    //         console.log("Submission API Response:", responseEligible);

    //         if (responseEligible && responseEligible.status) {
    //             setFormSuccessMessage('Booking successful!');
    //             if (isConsultationService) {
    //                 markFreeConsultationUsed(userIdentifier);
    //             }
    //         } else {
    //             console.warn('API Call Failed:', responseEligible ? responseEligible.message : "No response");
    //             setEligibilityMessage(responseEligible ? responseEligible.message : 'Booking failed. Please try again.');
    //         }
    //     } catch (error) {
    //         console.error('Comprehensive Booking Error:', {
    //             message: error.message,
    //             response: error.response,
    //             fullError: JSON.stringify(error, null, 2),
    //             payload: JSON.stringify(payload, null, 2)
    //         });

    //         setEligibilityMessage(
    //             error.response?.data?.message ||
    //             error.message ||
    //             'An unexpected error occurred. Please try again.'
    //         );
    //     } finally {
    //         setFormLoading(false);
    //         setIsSubmitting(false);
    //     }
    // };

    const hasUsedFreeConsultation = (userIdentifier) => {
        const usedConsultations = JSON.parse(localStorage.getItem("usedFreeConsultations") || "{}");
        return usedConsultations[userIdentifier];
    };

    const markFreeConsultationUsed = (userIdentifier) => {
        if (userIdentifier) {
            const usedConsultations = JSON.parse(localStorage.getItem("usedFreeConsultations") || "{}");
            usedConsultations[userIdentifier] = true;
            localStorage.setItem("usedFreeConsultations", JSON.stringify(usedConsultations));
        }
    };

    const createPayload = (safeFormData, bookedStatusId, UserId, allStatusData) => {
        return {
            name: safeFormData.FullName,
            mobileNumber: safeFormData.MobileNumber,
            cardNumber: safeFormData.Cardnumber,
            gender: safeFormData.Gender,
            dateofBirth: safeFormData.DateofBirth
                ? formateDatabaseDatetime(safeFormData.DateofBirth)
                : null,
            age: safeFormData.Age,
            appointmentDate: safeFormData.DateAndTime,
            address: safeFormData.Address,
            hospitalId: safeFormData.HospitalId,
            hospitalName: safeFormData.HospitalName,
            serviceTypeId: safeFormData.ServiceTypeId,
            consultationFee: safeFormData.consultationFee,
            discountInPercentage: safeFormData.discountInPercentage,
            doctorName: safeFormData.DoctorName,
            appointment: safeFormData.Appointment,
            employeeId: UserId || null,
            customerId: safeFormData.customerId,
            dependentCustomerId: safeFormData.dependentCustomerId,
            status: bookedStatusId,
            HospitalPoliciesId: safeFormData.HospitalPoliciesId || null,
            memberType: safeFormData.dependentCustomerId ? 'DEPENDENT' : 'PRIMARY',
            diagnosticInfo: {
                formDataKeys: Object.keys(safeFormData),
                primaryCustomerId: safeFormData.customerId,
                dependentCustomerId: safeFormData.dependentCustomerId,
                verificationStatus: safeFormData.status,
                submissionStatus: bookedStatusId,
                statusLabel: allStatusData.find(s => s.StatusId === bookedStatusId)?.Value || "Booked",
                payloadSnapshot: JSON.stringify(safeFormData, null, 2),
                originalFormData: JSON.stringify(formData, null, 2)
            }
        };
    };


    const handleHospitalServicesChange = (selected) => {
        setSelectedHospitalServices(selected);
        setFormData(prev => ({
            ...prev,
            HospitalPoliciesId: selected.map(item => item.value)
        }));
    };


    const fetchHospitalServices = async (hospitalId) => {

        setServicesLoading(true);
        try {
            const servicesResponse = await fetchAllData(`HospitalPoliciesProvision/GetByHospitalId/${hospitalId}`);

            if (servicesResponse) {
                setHospitalService(servicesResponse || []);
            }

            const couponResponse = await fetchData('lambdaAPI/BookingConsultation/checkAvailableCoupons', {
                cardNumber: formData.Cardnumber,
                hospitalId,
                customerId: memberId
            });

            setCouponCount(couponResponse.status ? couponResponse.availableCoupons : 0);
        } catch (err) {
            console.error('Error fetching hospital services or coupons:', err);
            setHospitalService([]);
            setCouponCount(0);
        } finally {
            setServicesLoading(false);
        }
    };


    const getHospitalServices = async (hospitalId) => {
        try {
            setLoading(true);

            const response = await fetchAllData(`HospitalPoliciesProvision/GetByHospitalId/${hospitalId}`
            );

            if (!response) {
                console.error("API returned empty response");
                setHospitalServices([]);
                return;
            }

            const hospitalServices = Array.isArray(response) ? response :
                response.data ? response.data :
                    response.items ? response.items : [];


            const activeServices = hospitalServices.filter((item) => item && item.IsActive);

            const hospitalServicesArray = activeServices.map((item) => ({
                label: item.PoliciesType,
                value: item.HospitalPoliciesId,
                isDiscountRequired: item.IsDiscountRequired
            }));

            setHospitalServices(hospitalServicesArray);
        } catch (error) {
            console.error("Error fetching hospital services:", error);
            console.error("Error details:", {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            });
            // Set empty array to prevent future errors
            setHospitalServices([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (formData.HospitalId) {
            getHospitalServices(formData.HospitalId);
        }
    }, [formData.HospitalId]);

    function calculateAge(dateOfBirth) {
        const dob = new Date(dateOfBirth);
        const today = new Date();

        let age = today.getFullYear() - dob.getFullYear();
        const monthDifference = today.getMonth() - dob.getMonth();

        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) {
            age--;
        }

        return age;
    }

    const formatDate = (dobString) => {
        const date = new Date(dobString);
        const options = { day: '2-digit', month: 'short', year: 'numeric' };

        return date.toLocaleDateString('en-US', options);
    };

    const formateDatabaseDatetime = (inp) => {
        const date = new Date(inp);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    }

    const onChangeDateTime = (e) => {
        const dateStr = e.toString();
        const date = formateDatabaseDatetime(dateStr.slice(0, 24));

        if (date.length > 0) {
            setFormErrors(preVal => ({
                ...preVal, DateAndTime: ''
            }))
        }

        setFormData(preVal => ({
            ...preVal, DateAndTime: date
        }))
    };

    const onChangeHandler = (e) => {
        const { name, value } = e.target;

        if (name === "FullName") {
            // if (!memberDetails || !dependents) {
            //     console.error("Error: memberDetails or dependents is undefined");
            //     return;
            // }

            const trimmedValue = value.trim().toLowerCase();

            const selectedMember = memberDetails.find(
                (member) => member.FullName?.trim().toLowerCase() === trimmedValue
            );
            const selectedDependent = dependents.find(
                (dep) => dep.name?.trim().toLowerCase() === trimmedValue
            );


            if (selectedMember) {

                setFormData((prevVal) => ({
                    ...prevVal,
                    FullName: selectedMember.FullName,
                    MobileNumber: selectedMember.MobileNumber || "",
                    Cardnumber: selectedMember.OHOCardNumber || "",
                    Gender: selectedMember.Gender || "",
                    DateofBirth: selectedMember.DateofBirth || "",
                    Age: selectedMember.DateofBirth ? calculateAge(selectedMember.DateofBirth) : "",
                    Address: selectedMember.AddressLine1 || "",
                    customerId: selectedMember.CardPurchasedMemberId || "",
                    dependentCustomerId: null,
                    status: selectedMember.status || ""
                }));
            } else if (selectedDependent) {
                setFormData((prevVal) => ({
                    ...prevVal,
                    FullName: selectedDependent.name,
                    Gender: selectedDependent.gender || "",
                    DateofBirth: selectedDependent.dateofBirth || "",
                    Age: selectedDependent.dateofBirth ? calculateAge(selectedDependent.dateofBirth) : "",
                    customerId: memberId,
                    dependentCustomerId: selectedDependent.customerId || "",
                    status: selectedDependent.status || ""
                }));
            } else {
                console.warn("No match found for:", value);
                setFormData((prevVal) => ({
                    ...prevVal,
                    FullName: value,
                    customerId: "",
                    dependentCustomerId: ""
                }));
            }
        } else {
            setFormData(prevVal => ({
                ...prevVal,
                [name]: value || '',
                customerId: prevVal.customerId || memberId,
                MobileNumber: prevVal.MobileNumber || '',
                Cardnumber: prevVal.Cardnumber || ''
            }));

            if (value.trim().length > 0) {
                setFormErrors((prevVal) => ({
                    ...prevVal,
                    [name]: ""
                }));
            }
        }
    };

    const checkErrors = () => {
        if (formData.DateAndTime === '' || formData.HospitalId === '' ||
            formData.ServiceTypeId.length < 2) {

            if (formData.DateAndTime === '') {
                setFormErrors(preVal => ({
                    ...preVal, DateAndTime: 'Please select appointment date & time *'
                }))
            }
            if (formData.HospitalId === '') {
                setFormErrors(preVal => ({
                    ...preVal, HospitalId: 'Please Enter valid hospital name *'
                }))
            }
            if (formData.ServiceTypeId.length < 2) {
                setFormErrors(preVal => ({
                    ...preVal, ServiceTypeId: 'Please Enter servicetype *'
                }))
            }

        } else {
            return true;
        }
    };
    // const handleCouponsSuggestionClick = (hospital) => {
    //     setInput(hospital.HospitalName);
    //     setFormData({
    //         ...formData,
    //         HospitalId: hospital.HospitalId,
    //         HospitalName: hospital.HospitalName
    //     });
    //     setSuggestions([]);
    // };
    const handleSuggestionClick = (hospital) => {
        setInput(hospital.HospitalName);

        setFormData((prev) => ({
            ...prev,
            HospitalId: hospital.HospitalId,
            HospitalName: hospital.HospitalName
        }));

        setHospitalName(hospital.HospitalName); // sets name for UI display
        setSelectedHospital(hospital); // to store selected hospital object if needed
        setSuggestions([]);

        // Fetch hospital services
        fetchHospitalServices(hospital.HospitalId);
    };



    const initialFormState = {
        FullName: '',
        MobileNumber: '',
        Cardnumber: '',
        Gender: '',
        DateofBirth: '',
        Age: null,
        DateAndTime: '',
        Address: '',
        HospitalId: '',
        HospitalName: '',
        ServiceTypeId: '',
        consultationFee: null,
        discountInPercentage: null,
        DoctorName: '',
        Appointment: '',
        customerId: null,
        dependentCustomerId: null,
        status: "",
        HospitalPoliciesId: [],
    };

    const initialErrorState = {
        FullName: '',
        MobileNumber: '',
        Cardnumber: '',
        Gender: '',
        DateofBirth: '',
        DateAndTime: '',
        Address: '',
        HospitalId: '',
        HospitalName: '',
        ServiceTypeId: '',
        DoctorName: '',
        Appointment: '',
        HospitalPoliciesId: [],
    };

    const handleReset = (e) => {
        e.preventDefault();
        setFormData(initialFormState);
        setInput('');
        setFormErrors(initialErrorState);
        setEligibilityMessage('');
        setFormSuccessMessage('');
        setFormLoading(false);
        setIsSubmitting(false);
    };

    useEffect(() => {

        if (formSuccessMessage) {
            const resetTimer = setTimeout(() => {
                handleReset({ preventDefault: () => { } });
            }, 3000);

            return () => clearTimeout(resetTimer);
        }
    }, [formSuccessMessage]);

    const handleCancel = (e) => {
        e.preventDefault();
        setIsVerified(false);
        setVerifiedMessage('');
        setMemberId(null);
        setMobileNumber('');
    };

    // const checkErrorscoupons = () => {
    //     if (formData.DateAndTime === '' || formData.HospitalId === '' ||
    //         formData.ServiceTypeId.length < 2) {

    //         if (formData.DateAndTime === '') {
    //             setFormErrors(preVal => ({
    //                 ...preVal, DateAndTime: 'Please select appointment date & time *'
    //             }))
    //         }
    //         if (formData.HospitalId === '') {
    //             setFormErrors(preVal => ({
    //                 ...preVal, HospitalId: 'Please Enter valid hospital name *'
    //             }))
    //         }
    //         if (formData.ServiceTypeId.length < 2) {
    //             setFormErrors(preVal => ({
    //                 ...preVal, ServiceTypeId: 'Please Enter servicetype *'
    //             }))
    //         }

    //     } else {
    //         return true;
    //     }
    // };


    const handleSubmitCoupons = async (e) => {
        e.preventDefault();
       

        const errors = {};

        if (!couponsFormData.FullName) {
            errors.FullName = 'Please select a name';
            console.warn('Validation Error: Name not selected');
        }

        if (isNaN(Number(couponsFormData.NumberOfCoupons)) || Number(couponsFormData.NumberOfCoupons) <= 0) {
            setEligibilityMessage('Please enter valid coupon');
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            console.error('Form Validation Failed', errors);
            return;
        }
        setFormErrors({});
        setEligibilityMessage('');
        setFormSuccessMessage('');
        handleCouponReset();

        const payload = {
            NumberOfCoupons: parseInt(couponsFormData.NumberOfCoupons),
            ApprovedBy: UserId,
            CustomerId: memberId,
            HospitalId: formData.HospitalId || '',

        };

        try {
            setFormLoading(true);
            setIsSubmitting(true);
            const responseEligible = await fetchData('lambdaAPI/RequestedCoupons/add', payload);

         

            const isSuccess =
                responseEligible?.success === true ||
                responseEligible?.status === true ||
                responseEligible?.statusCode === 200 ||
                (responseEligible &&
                    responseEligible.requestedCouponsId &&
                    responseEligible.customerId);

            const resetForm = () => {
                setFormData(prev => ({
                    ...prev,
                    FullName: '',
                    NumberOfCoupons: '',
                }));
                setHospitalInput('');
                setHospitalSuggestions([]);
                setCouponsFormData(prev => ({
                    ...prev,
                    FullName: '',
                    HospitalId: '',
                    HospitalName: '',
                }));
                setFormSuccessMessage('');
                setIsSubmitting(false);
            };

            if (isSuccess) {
                const successMessage =
                    `Successfully requested ${responseEligible.numberOfCoupons} coupons. 
                    Coupon Request ID: ${responseEligible.requestedCouponsId}`;

                setFormSuccessMessage(successMessage);

                setTimeout(() => {
                    resetForm();
                }, 3000);
            } else {
                console.warn('Coupon Request API Call Did Not Meet Success Criteria');

                const errorMessage =
                    responseEligible?.message ||
                    responseEligible?.errorMessage ||
                    responseEligible?.error ||
                    'Failed to request coupons';

                console.error('Detailed Error Response:', {
                    errorMessage,
                    fullResponse: responseEligible
                });

                setEligibilityMessage(errorMessage);
                setIsSubmitting(false);

                resetForm();
            }
        } catch (error) {
            console.error('Comprehensive Error submitting coupons:', {
                message: error.message,
                stack: error.stack,
                fullError: JSON.stringify(error, null, 2)
            });

            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                'An unexpected error occurred while submitting coupons';

            setEligibilityMessage(errorMessage);
            setIsSubmitting(false);
        } finally {
            setFormLoading(false);
        }
    };

    const handleHospitalInputChange = async (event, isConsultation = true) => {
        const value = event.target.value;
        setHospitalInput(value);
        setHospitalSearchLoading(true);
        setHospitalSearchError('');

        try {
            const filter = value
                ? [{ key: "HospitalName", value: value, operator: "LIKE" }]
                : [{ key: "", value: "", operator: "" }];

            const hospitalNameSuggestions = await fetchData(
                "Hospital/GetHospitalListByKeyValuePair",
                { filter }
            );

            if (hospitalNameSuggestions.length > 0) {
                setHospitalSuggestions(hospitalNameSuggestions);
            } else {
                setHospitalSearchError('No suggestions found.');
                setHospitalSuggestions([]);
            }
        } catch (error) {
            setHospitalSearchError('Failed to fetch suggestions.');
            setHospitalSuggestions([]);
        } finally {
            setHospitalSearchLoading(false);
        }
    };

    const handleHospitalSuggestionClick = (hospital, isConsultation = true) => {
        setHospitalInput(hospital.HospitalName);

        if (isConsultation) {
            setFormData(prev => ({
                ...prev,
                HospitalId: hospital.HospitalId,
                HospitalName: hospital.HospitalName
            }));
        } else {
            setCouponsFormData(prev => ({
                ...prev,
                HospitalId: hospital.HospitalId,
                HospitalName: hospital.HospitalName
            }));
        }

        setHospitalSuggestions([]);
    };

    const clearHospitalSearch = () => {
        setHospitalInput('');
        setHospitalSuggestions([]);
        setHospitalSearchError('');
    };

    const handleCouponReset = () => {
        setCouponInput('');
        setCouponCode('');
        setSelectedCouponName('');

        setCouponsFormData(prev => ({
            ...prev,
            FullName: '',
            NumberOfCoupons: '',
        }));

        setFormErrors({});
        setEligibilityMessage('');
        setFormSuccessMessage('');
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };


    const handleBookAppointment = async () => {
        if (!validateFields()) {
            return;
        }

        setIsBooking(true);


        const status = await fetchAllData(`lambdaAPI/Status/all`);
        const initiatedStatus = status.find(item => item.Value === "Booked");

        try {

            const updateData = [

                {
                    "TableName": "BookingConsultation",
                    "ColumnName": "ServiceTypeId",
                    "ColumnValue": selectedService?.value,
                    "TableId": bookingConsultationId,
                },
                {
                    "TableName": "BookingConsultation",
                    "ColumnName": "AppointmentDate",
                    "ColumnValue": appointmentDate,
                    "TableId": bookingConsultationId,
                },
                {
                    "TableName": "BookingConsultation",
                    "ColumnName": "Status",
                    "ColumnValue": initiatedStatus.StatusId,
                    "TableId": bookingConsultationId,
                },
                {
                    "TableName": "BookingConsultation",
                    "ColumnName": "Reason",
                    "ColumnValue": reason,
                    "TableId": bookingConsultationId,
                }


            ]

            const updateResponse = await fetchUpdateData("lambdaAPI/BookingConsultation/Update", updateData);

            // const response = await fetchData('BookingConsultation/bookAppointment/add', {
            //     name: fullName,
            //     gender,
            //     age,
            //     customerId: memberId,
            //     doctorName,
            //     dependentCustomerId: memberDependentId,
            //     hospitalName: hospitalName,
            //     hospitalId: hospitalId,
            //     address,
            //     dateofBirth,
            //     mobileNumber,
            //     appointmentDate,
            //     cardNumber,
            //     serviceTypeId: selectedService?.value,
            //     appointment: service,
            //     employeeId: UserId
            // });

            //console.log("update Reponse", updateResponse);

            setSnackbar({
                open: true,
                message: 'Appointment booked successfully!',
                severity: 'success',
            });

            // ✅ Refresh screen after short delay
            setTimeout(() => {
                window.location.reload(); // or navigate to a specific page if needed
            }, 2000);


        } catch (error) {
            setLoading(false);
            console.error("Error booking appointment:", error);


            setSnackbar({
                open: true,
                message: 'Something went wrong. Please try again later.',
                severity: 'error',
            });
        } finally {
            setIsBooking(false);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const formData = {
            hospitalId: hospitalId,
            serviceId: selectedService?.value,
            appointmentDate,
            reason,
            cardNumber,
        };
        handleBookAppointment();
    };


    const returnForm = () => (
        <div className="card p-3">
            {!showAppointmentForm && (
                <>
                    <form>
                        <div className="row">
                            {/* Hospital Search Field */}
                            <div className="col-12 col-md-6 mb-3">
                                <label htmlFor="search-input" className="form-label">
                                    Hospital Name <span className="text-danger"> *</span>
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        id="search-input"
                                        className="form-control"
                                        placeholder="Enter Hospital Name"
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
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    <i
                                                        className="fas fa-arrow-up-left"
                                                        style={{ marginRight: '8px', color: '#00796b' }}
                                                    ></i>
                                                    <span>{suggestion.HospitalName}</span>
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
                                                backgroundColor: '#fff',
                                                border: '1px solid #00796b',
                                                borderRadius: '4px',
                                                padding: '8px',
                                                zIndex: 10,
                                                width: '100%'
                                            }}
                                        >
                                            {error}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>

                    {/* Show Services after selecting hospital */}
                    {selectedHospital && (
                        <div className="container mt-4">
                            <h3 className="text-primary text-center">{hospitalName}</h3>
                            <h5 className="text-center">Available Services</h5>

                            {servicesLoading ? (
                                <div className="text-center mt-4">Loading...</div>
                            ) : hospitalService.length > 0 ? (
                                hospitalService.map((service, index) => (
                                    <div key={index} className="card my-3 shadow-sm">
                                        <div className="card-body">
                                            <h5 className="card-title">{service.PoliciesType}</h5>
                                            {service.IsActive ? (
                                                service.PoliciesType === 'Free Consultation' ? (
                                                    <>
                                                        <div className="card-text d-flex flex-column">
                                                            {couponCount > 0 && (
                                                                <div className="d-flex flex-column align-items-center text-center position-relative">
                                                                    <div className="position-relative" style={{ display: "inline-block" }}>
                                                                        <img
                                                                            src="https://storingdocuments.s3.ap-south-1.amazonaws.com/coupon.jfif"
                                                                            alt="Coupon"
                                                                            className="img-fluid"
                                                                            style={{ maxWidth: "250px", borderRadius: "8px" }}
                                                                        />
                                                                        <div
                                                                            style={{
                                                                                position: "absolute",
                                                                                top: "58%",
                                                                                left: "49%",
                                                                                transform: "translate(-50%, -10px)",
                                                                                fontSize: "12px",
                                                                                color: "#0E3984",
                                                                                fontWeight: "bold",
                                                                                textAlign: "center",
                                                                                width: "100%",
                                                                            }}
                                                                        >
                                                                            Worth of RS. {amount}/-
                                                                        </div>
                                                                        <div
                                                                            style={{
                                                                                position: "absolute",
                                                                                bottom: "13px",
                                                                                left: "33px",
                                                                                width: "85%",
                                                                                display: "flex",
                                                                                justifyContent: "center",
                                                                                alignItems: "center",
                                                                            }}
                                                                        >
                                                                            <div
                                                                                style={{
                                                                                    padding: "5px 10px",
                                                                                    borderRadius: "5px",
                                                                                    textAlign: "center",
                                                                                    width: "100%",
                                                                                    maxWidth: "200px",
                                                                                }}
                                                                            >
                                                                                <span style={{ color: "#0E3984", fontSize: "12px", fontWeight: "bold" }}>
                                                                                    Valid for only Family Members.
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <div className="mt-2">
                                                                {couponCount > 0 ? (
                                                                    <span>
                                                                        You have a maximum of <strong className="text-danger">{couponCount}</strong> coupons.
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-danger">
                                                                        Sorry, you have already used all your coupons for this hospital.
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="w-100 mt-2">
                                                                <button
                                                                    className="btn btn-warning w-100"
                                                                    onClick={() => handleHospitalConsultationLab(service.HospitalPoliciesId)}
                                                                >
                                                                    {couponCount > 0 ? "Avail One Coupon →" : "Request Coupon →"}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="card-text">
                                                            {service.DiscountPercentage > 0
                                                                ? `Enjoy a discount of ${service.DiscountPercentage}% on this service.`
                                                                : `No discounts available for this service.`}
                                                        </p>
                                                        <div className="w-100 mt-2">
                                                            <button
                                                                className="btn btn-warning w-100"
                                                                onClick={() => handleHospitalConsultationLab(service.HospitalPoliciesId)}
                                                            >
                                                                Book Now →
                                                            </button>
                                                        </div>
                                                    </>
                                                )
                                            ) : (
                                                <p className="text-muted">This service is currently unavailable.</p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted text-center">No services available for this hospital.</p>
                            )}
                        </div>
                    )}
                </>
            )}



            {showModal && selectedHospitalService && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0, 0, 0, 0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">

                            <div className="modal-header d-flex justify-content-end">
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>

                            <div className="p-3">
                                {selectedHospitalService === 1 ? (
                                    <>
                                        {/* Coupon Section */}
                                        <div className="col-md-12 mb-2">
                                            <div className="card mt-2 p-2 border shadow-sm rounded-2 bg-light" style={{ margin: "0 auto" }}>
                                                <h5 className="modal-title text-center mb-2" style={{ color: "rgb(0, 102, 204)" }}>Coupon Details</h5>
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <div className="d-flex align-items-center">
                                                        <FontAwesomeIcon icon={faTicket} className="me-2" style={{ color: "rgb(0, 102, 204)", fontSize: "1.2rem" }} />
                                                        <span>Coupon: {couponCount}</span>
                                                    </div>
                                                    <span>Coupon Value: ₹{amount}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Family Members + Dependents */}
                                        {memberLoading ? (
                                            <div className="text-center my-5">
                                                <div className="spinner-border text-primary" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <>

                                                {member && (
                                                    <div className="col-md-12 mb-3">
                                                        <div className="card border shadow-sm rounded-3">
                                                            <div className="card-body p-4 bg-light">
                                                                <div className="d-flex justify-content-between align-items-center">
                                                                    <div>
                                                                        <div className="d-flex align-items-center mb-2">
                                                                            <i className="bi bi-person-circle me-2 text-primary" style={{ fontSize: '24px' }}></i>
                                                                            <p className="fs-6 mb-0 text-dark fw-bold">{member.Name}</p>
                                                                        </div>
                                                                        <p className="text-muted mb-2 small">
                                                                            <span className="badge bg-secondary me-2">{member.Age}</span>
                                                                            {member.Relationship || "Self"}
                                                                        </p>
                                                                        <div className="d-flex align-items-center">
                                                                            <div className="d-flex align-items-center gap-2">
                                                                                <div className={`rounded-circle p-1 ${memberCoupons[memberId] > 0 ? 'bg-success' : 'bg-secondary'}`} style={{ width: '10px', height: '10px' }}></div>
                                                                                <span className="text-muted small">
                                                                                    {memberCoupons[memberId] > 0 ? 'Coupons Available' : 'No Coupons'}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {memberCoupons[memberId] > 0 ? (
                                                                        <button
                                                                            className="btn btn-success d-flex align-items-center justify-content-center"
                                                                            onClick={() => handleHospitalConsultation(selectedHospitalService.HospitalPoliciesId, member)}
                                                                        >
                                                                            <i className="bi bi-ticket-detailed me-2"></i>
                                                                            Avail Coupon
                                                                        </button>
                                                                    ) : (
                                                                        <a
                                                                            href="tel:7032107108"
                                                                            className="btn btn-warning d-flex align-items-center justify-content-center"
                                                                        >
                                                                            <i className="bi bi-telephone me-2"></i>
                                                                            Request
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Dependents */}
                                                {dependents.map((dep, index) => (
                                                    <div key={index} className="col-md-12 mb-3">
                                                        <div className="card border shadow-sm rounded-3">
                                                            <div className="card-body p-4 bg-light">
                                                                <div className="d-flex justify-content-between align-items-center">
                                                                    <div>
                                                                        <div className="d-flex align-items-center mb-2">
                                                                            <i className="bi bi-person-circle me-2 text-primary" style={{ fontSize: '24px' }}></i>
                                                                            <p className="fs-6 mb-0 text-dark fw-bold">{dep.name}</p>
                                                                        </div>
                                                                        <p className="text-muted mb-2 small">
                                                                            <span className="badge bg-secondary me-2">{dep.age}</span>
                                                                            {dep.relationship}
                                                                        </p>
                                                                        <div className="d-flex align-items-center">
                                                                            <div className="d-flex align-items-center gap-2">
                                                                                <div className={`rounded-circle p-1 ${dependentCoupons[dep.customerId] > 0 ? 'bg-success' : 'bg-secondary'}`} style={{ width: '10px', height: '10px' }}></div>
                                                                                <span className="text-muted small">
                                                                                    {dependentCoupons[dep.customerId] > 0 ? 'Coupons Available' : 'No Coupons'}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {dependentCoupons[dep.customerId] > 0 ? (
                                                                        <button
                                                                            className="btn btn-success d-flex align-items-center justify-content-center"
                                                                            onClick={() => handleHospitalConsultation(selectedHospitalService.HospitalPoliciesId, dep)}
                                                                        >
                                                                            <i className="bi bi-ticket-detailed me-2"></i>
                                                                            Avail Coupon
                                                                        </button>
                                                                    ) : (
                                                                        <a
                                                                            href="tel:7032107108"
                                                                            className="btn btn-warning d-flex align-items-center justify-content-center"
                                                                        >
                                                                            <i className="bi bi-telephone me-2"></i>
                                                                            Request
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </>
                                ) : (
                                    // For other policies — No Coupons Flow
                                    <>

                                        <h5 className='text-center'>Family Member Details</h5>
                                        {memberLoading ? (
                                            <div className="text-center my-5">
                                                <div className="spinner-border text-primary" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Self / Member */}
                                                {member && (
                                                    <div className="col-md-12 mb-3">
                                                        <div className="card border shadow-sm rounded-3">
                                                            <div className="card-body p-4 bg-light">
                                                                <div className="d-flex justify-content-between align-items-center">
                                                                    <div>
                                                                        <div className="d-flex align-items-center mb-2">
                                                                            <i className="bi bi-person-circle me-2 text-primary" style={{ fontSize: '24px' }}></i>
                                                                            <p className="fs-6 mb-0 text-dark fw-bold">{member.Name}</p>
                                                                        </div>
                                                                        <p className="text-muted mb-2 small">
                                                                            <span className="badge bg-secondary me-2">{member.Age}</span>
                                                                            {member.Relationship || "Self"}
                                                                        </p>

                                                                    </div>
                                                                    <button
                                                                        className="btn btn-primary d-flex align-items-center justify-content-center"
                                                                        onClick={() => handleHospitalConsultation(selectedHospitalService.HospitalPoliciesId, member)}
                                                                    >
                                                                        <i className="bi bi-calendar-check me-2"></i>
                                                                        Book Appointment
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Dependents */}
                                                {dependents.map((dep, index) => (
                                                    <div key={index} className="col-md-12 mb-3">
                                                        <div className="card border shadow-sm rounded-3">
                                                            <div className="card-body p-4 bg-light">
                                                                <div className="d-flex justify-content-between align-items-center">
                                                                    <div>
                                                                        <div className="d-flex align-items-center mb-2">
                                                                            <i className="bi bi-person-circle me-2 text-primary" style={{ fontSize: '24px' }}></i>
                                                                            <p className="fs-6 mb-0 text-dark fw-bold">{dep.name}</p>
                                                                        </div>
                                                                        <p className="text-muted mb-2 small">
                                                                            <span className="badge bg-secondary me-2">{dep.age}</span>
                                                                            {dep.relationship}
                                                                        </p>

                                                                    </div>
                                                                    <button
                                                                        className="btn btn-primary d-flex align-items-center justify-content-center"
                                                                        onClick={() => handleHospitalConsultation(selectedHospitalService.HospitalPoliciesId, dep)}
                                                                    >
                                                                        <i className="bi bi-calendar-check me-2"></i>
                                                                        Book Appointment
                                                                    </button>

                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {showAppointmentForm && (

                <div className="p-4">
                    <h3 className="text-primary mb-4">Book an Appointment</h3>
                    <form onSubmit={handleFormSubmit}>



                        {/* Appointment Date */}
                        <div className="mb-3">
                            <label className="form-label"><strong>Appointment Date & Time</strong></label>
                            <input
                                type="datetime-local"
                                className="form-control"
                                value={appointmentDate}
                                onChange={(e) => setAppointmentDate(e.target.value)}
                            />
                            {appointmentDateError && <small className="text-danger">{appointmentDateError}</small>}
                        </div>

                        <div className="mb-3">
                            <label className="form-label"><strong>Enter Reason</strong></label>
                            <input
                                type="text"
                                className="form-control"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Enter reason"
                            />
                        </div>


                        {/* Service Type Dropdown */}

                        {(selectedHospitalService === 1 || selectedHospitalService === 2) ?
                            <>
                                <div className="mb-3">
                                    <label className="form-label"><strong>Service Type</strong></label>
                                    <Select
                                        options={services}
                                        value={selectedService}
                                        onChange={(selectedOption) => setSelectedService(selectedOption)}
                                        placeholder="Search and select service type"
                                    />
                                    {serviceError && <small className="text-danger">{serviceError}</small>}
                                </div>



                            </>
                            : null}


                        {/* Book Appointment Button */}
                        <button type="submit" className="btn btn-primary" disabled={isBooking}>
                            {isBooking ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Booking...
                                </>
                            ) : (
                                'Book Appointment'
                            )}
                        </button>

                    </form>
                </div>
            )}

        </div>
    );



    // const returnForm = () => (
    //     <div className='card p-3'>
    //     <form>
    //         <div className="row">
    //             <div className="d-flex flex-column col-12 col-md-4 mb-3">
    //                 <label htmlFor="FullName" className="form-select-label">
    //                     Name<span className="text-danger"> *</span>
    //                 </label>
    //                 <select
    //                     name="FullName"
    //                     id="FullName"
    //                     className="form-select"
    //                     value={formData.FullName || ''}
    //                     onChange={(e) => onChangeHandler(e)}
    //                 >
    //                     <option value="">Select Name</option>
    //                     {memberDetails && memberDetails.length > 0 && (
    //                         <option value={memberDetails[0]?.FullName || ''}>
    //                             {memberDetails[0]?.FullName || 'Unnamed'}
    //                         </option>
    //                     )}

    //                     {dependents && Array.isArray(dependents) && dependents.length > 0 &&
    //                         dependents.map((dependent, index) => (
    //                             <option key={index} value={dependent.name || ''}>
    //                                 {dependent.name || 'Unnamed Dependent'}
    //                             </option>
    //                         )
    //                         )}
    //                 </select>
    //             </div>
    //             <div className="d-flex flex-column col-12 col-md-4 mb-3">
    //                 <label htmlFor="flatpickr-datetime" className="form-control-label">
    //                     Consultation Date &amp; Time<span className="text-danger"> *</span>
    //                 </label>
    //                 <Flatpickr
    //                     className="form-control"
    //                     placeholder="YYYY-MM-DD HH:MM"
    //                     id="flatpickr-datetime"
    //                     name="DateAndTime"
    //                     value={formData.DateAndTime || ''}
    //                     onChange={(e) => onChangeDateTime(e)}
    //                     options={{
    //                         enableTime: true,
    //                         dateFormat: "Y-m-d H:i",
    //                         time_24hr: false,
    //                         minDate: today
    //                     }}
    //                 />
    //                 {formErrors?.DateAndTime && (
    //                     <p className='text-danger'>{formErrors.DateAndTime}</p>
    //                 )}
    //             </div>

    //             <div className="col-8 col-md-4">
    //                 <div>
    //                     <label htmlFor="search-input" className="form-label">
    //                         Hospital Name <span className="text-danger"> *</span>
    //                     </label>
    //                     <div style={{ position: 'relative', maxWidth: '350px' }}>
    //                         <input
    //                             type="text"
    //                             id="search-input"
    //                             className="form-control"
    //                             placeholder="Enter Hospital Name"
    //                             style={{ paddingLeft: '30px' }}
    //                             maxLength="50"
    //                             value={input}
    //                             onChange={handleInputChange}
    //                         />
    //                         {input && (
    //                             <i
    //                                 className="fas fa-times-circle"
    //                                 style={{
    //                                     position: 'absolute',
    //                                     right: '10px',
    //                                     top: '50%',
    //                                     transform: 'translateY(-50%)',
    //                                     fontSize: '16px',
    //                                     color: 'red',
    //                                     cursor: 'pointer'
    //                                 }}
    //                                 onClick={clearSearch}
    //                             ></i>
    //                         )}
    //                         {searchLoading && (
    //                             <div
    //                                 style={{
    //                                     position: 'absolute',
    //                                     right: '40px',
    //                                     top: '50%',
    //                                     transform: 'translateY(-50%)'
    //                                 }}
    //                             >
    //                                 <div className="spinner-border text-primary" role="status" style={{ width: '1.5rem', height: '1.5rem' }}>
    //                                     <span className="visually-hidden">Loading...</span>
    //                                 </div>
    //                             </div>
    //                         )}
    //                         {formErrors && formErrors.HospitalId && formErrors.HospitalId.length > 0 && (
    //                             <p className='text-danger'>{formErrors.HospitalId}</p>
    //                         )}

    //                         {input && !searchLoading && suggestions.length > 0 && (
    //                             <ul
    //                                 style={{
    //                                     listStyleType: 'none',
    //                                     padding: '0',
    //                                     margin: '0',
    //                                     border: '1px solid #00796b',
    //                                     borderRadius: '4px',
    //                                     maxHeight: '200px',
    //                                     overflowY: 'auto',
    //                                     position: 'absolute',
    //                                     width: '100%',
    //                                     backgroundColor: '#fff',
    //                                     zIndex: 10,
    //                                     top: '100%',
    //                                     left: '0'
    //                                 }}
    //                             >
    //                                 {suggestions.map((suggestion, index) => (
    //                                     <li
    //                                         key={index}
    //                                         onClick={() => handleSuggestionClick(suggestion)}
    //                                         style={{
    //                                             padding: '8px',
    //                                             cursor: 'pointer',
    //                                             display: 'flex',
    //                                             alignItems: 'center',
    //                                             position: 'relative'
    //                                         }}
    //                                     >
    //                                         <i
    //                                             className="fas fa-arrow-up-left"
    //                                             style={{
    //                                                 marginRight: '8px',
    //                                                 color: '#00796b'
    //                                             }}
    //                                         ></i>
    //                                         <span style={{ flex: 1 }}>{suggestion.HospitalName}</span>
    //                                     </li>
    //                                 ))}
    //                             </ul>
    //                         )}

    //                         {input && !searchLoading && error && (
    //                             <div
    //                                 style={{
    //                                     position: 'absolute',
    //                                     top: '100%',
    //                                     left: '0',
    //                                     color: 'red',
    //                                     fontSize: '0.9rem',
    //                                     marginTop: '4px',
    //                                     backgroundColor: '#fff',
    //                                     border: '1px solid #00796b',
    //                                     borderRadius: '4px',
    //                                     padding: '8px',
    //                                     zIndex: 10,
    //                                     width: '100%'
    //                                 }}
    //                             >
    //                                 {error}
    //                             </div>
    //                         )}
    //                     </div>
    //                 </div>
    //             </div>

    //             {/* Rest of the form fields */}
    //             <div className="d-flex flex-column col-12 col-md-4 mb-3">
    //                 <label className="form-control-label">Doctor Name</label>
    //                 <input
    //                     type="text"
    //                     name="DoctorName"
    //                     className="form-control"
    //                     placeholder="Enter Doctor Name"
    //                     value={formData.DoctorName || ''}
    //                     onChange={(e) => onChangeHandler(e)}
    //                 />
    //             </div>

    //             <div className="d-flex flex-column col-12 col-md-4 mb-3">
    //                 <label className="form-control-label">
    //                     Service Type<span className="text-danger"> *</span>
    //                 </label>
    //                 <select
    //                     name="ServiceTypeId"
    //                     className="form-select"
    //                     placeholder="Ex: Orthopedic"
    //                     value={formData.ServiceTypeId || ''}
    //                     onChange={(e) => onChangeHandler(e)}
    //                 >
    //                     <option>--- SELECT ---</option>
    //                     {serviceTypes && Array.isArray(serviceTypes) && serviceTypes.length > 0 &&
    //                         serviceTypes.map(type => (
    //                             <option
    //                                 key={type.HospitalServicesId}
    //                                 value={type.HospitalServicesId}
    //                             >
    //                                 {type.ServiceName || 'Unnamed Service'}
    //                             </option>
    //                         )
    //                         )}
    //                 </select>
    //                 {formErrors?.ServiceTypeId && (
    //                     <p className='text-danger'>{formErrors.ServiceTypeId}</p>
    //                 )}
    //             </div>
    //             <div className="d-flex flex-column col-12 col-md-4 mb-3">
    //                 <label
    //                     htmlFor="select2Success"
    //                     className="form-control-label"
    //                 >
    //                     Hospital Services
    //                 </label>
    //                 <div className="select2-primary">
    //                     <select
    //                         className="form-select"
    //                         id="select2Success"
    //                         value={formData.HospitalPoliciesId || ""}
    //                         onChange={(e) => setFormData((prev) => ({
    //                             ...prev,
    //                             HospitalPoliciesId: e.target.value
    //                         }))}
    //                         disabled={!formData.HospitalId || hospitalServices.length === 0}
    //                     >
    //                         <option value="" disabled>Select a hospital service</option>
    //                         {hospitalServices.map((service) => (
    //                             <option key={service.value} value={service.value}>
    //                                 {service.label}
    //                             </option>
    //                         ))}
    //                     </select>
    //                 </div>
    //             </div>


    //         </div>
    //         <div className="text-center">
    //             <button
    //                 type="button"
    //                 className="btn btn-secondary me-1"
    //                 onClick={(e) => handleCancel(e)}
    //             >
    //                 Cancel
    //             </button>
    //             <button
    //                 type="button"
    //                 className="btn btn-danger me-1"
    //                 onClick={(e) => handleReset(e)}
    //             >
    //                 Reset
    //             </button>

    //             <button
    //                 type="submit"
    //                 className="btn btn-success"
    //                 onClick={handleSubmit}
    //                 disabled={formLoading || isSubmitting}
    //                 style={{ minWidth: '100px', minHeight: '40px' }}
    //             >
    //                 {formLoading || isSubmitting ? (
    //                     <div className="spinner-border text-white" role="status">
    //                         <span className="sr-only">Loading...</span>
    //                     </div>
    //                 ) : 'Submit'}
    //             </button>
    //         </div>
    //         {formSuccessMessage && formSuccessMessage.length > 0 && (
    //             <p className='text-success text-center'>{formSuccessMessage}</p>
    //         )}
    //         {eligibilityMessage && eligibilityMessage.length > 0 && (
    //             <p className='text-danger text-center'>{eligibilityMessage}</p>
    //         )}
    //     </form>
    // </div>
    // );

    const renderHospitalSearch = (isConsultation = true) => (
        <div>
            <label htmlFor={`hospital-search-input-${isConsultation ? 'consultation' : 'coupons'}`} className="form-label">
                Hospital Name <span className="text-danger"> *</span>
            </label>
            <div style={{ position: 'relative', maxWidth: '350px' }}>
                <input
                    type="text"
                    id={`hospital-search-input-${isConsultation ? 'consultation' : 'coupons'}`}
                    className="form-control"
                    placeholder="Enter Hospital Name"
                    style={{ paddingLeft: '30px' }}
                    maxLength="50"
                    value={hospitalInput}
                    onChange={(e) => handleHospitalInputChange(e, isConsultation)}
                />
                {hospitalInput && (
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
                        onClick={clearHospitalSearch}
                    />
                )}
                {hospitalSearchLoading && (
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

                {hospitalInput && !hospitalSearchLoading && hospitalSuggestions.length > 0 && (
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
                        {hospitalSuggestions.map((suggestion, index) => (
                            <li
                                key={index}
                                onClick={() => handleHospitalSuggestionClick(suggestion, isConsultation)}
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
                                />
                                <span style={{ flex: 1 }}>{suggestion.HospitalName}</span>
                            </li>
                        ))}
                    </ul>
                )}

                {hospitalInput && !hospitalSearchLoading && hospitalSearchError && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '100%',
                            left: '0',
                            color: 'red',
                            fontSize: '0.9rem',
                            marginTop: '4px',
                            backgroundColor: '#fff',
                            border: '1px solid #00796b',
                            borderRadius: '4px',
                            padding: '8px',
                            zIndex: 10,
                            width: '100%'
                        }}
                    >
                        {hospitalSearchError}
                    </div>
                )}
            </div>
        </div>
    );
    const renderCouponsForm = () => (
        <div className="card p-3">
            <form onSubmit={handleSubmitCoupons}>
                <div className="row mb-3">
                    <div className="d-flex flex-column col-12 col-md-4 mb-3">
                        <label htmlFor="CouponsFullName" className="form-select-label">
                            Name<span className="text-danger"> *</span>
                        </label>
                        <select
                            name="FullName"
                            id="CouponsFullName"
                            className="form-select"
                            value={couponsFormData.FullName}
                            onChange={(e) => {
                                const selectedName = e.target.value;
                                setCouponsFormData(prev => ({
                                    ...prev,
                                    FullName: selectedName
                                }));
                            }}
                        >
                            <option value="">Select Name</option>
                            {memberDetails && memberDetails.length > 0 && (
                                <option value={memberDetails[0].FullName}>{memberDetails[0].FullName}</option>
                            )}

                            {dependents && dependents.length > 0 && dependents.map((dependent, index) => (
                                <option key={index} value={dependent.name}>{dependent.name}</option>
                            ))}
                        </select>
                        {couponsFormErrors.FullName && <div className="text-danger">{couponsFormErrors.FullName}</div>}
                    </div>
                    <div className="col-8 col-md-4">
                        {renderHospitalSearch(true)}
                    </div>
                    <div className="col-12 col-md-4 mb-3">
                        <label htmlFor="numberOfCoupons" className="form-control-label">
                            Extra Coupons<span className="text-danger"> *</span>
                        </label>
                        <input
                            type="number"
                            id="numberOfCoupons"
                            className="form-control"
                            placeholder="Enter Number of Coupons"
                            value={couponsFormData.NumberOfCoupons}
                            onChange={(e) => {
                                const numericValue = e.target.value.replace(/[^\d]/g, '');
                                setCouponsFormData(prev => ({
                                    ...prev,
                                    NumberOfCoupons: numericValue
                                }));
                            }}

                            onKeyDown={(e) => {
                                // Allow: backspace, delete, tab, escape, enter
                                if ([46, 8, 9, 27, 13].includes(e.keyCode)) {
                                    return;
                                }

                                // Prevent any letter input, including 'e'
                                if (/[a-zA-Z]/.test(e.key)) {
                                    e.preventDefault();
                                }

                                // Ensure only numbers are entered
                                if (
                                    (e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) &&
                                    (e.keyCode < 96 || e.keyCode > 105)
                                ) {
                                    e.preventDefault();
                                }
                            }}
                            min="1"
                        />
                        {formErrors.NumberOfCoupons && <div className="text-danger">{formErrors.NumberOfCoupons}</div>}
                    </div>
                </div>
                {eligibilityMessage && (
                    <div className="alert alert-danger">{eligibilityMessage}</div>
                )}

                {formSuccessMessage && (
                    <div className="alert alert-success">{formSuccessMessage}</div>
                )}

                <div className="text-center">
                    <button
                        type="button"
                        className="btn btn-secondary me-1"
                        onClick={handleCancel}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="btn btn-danger me-1"
                        onClick={handleCouponReset}
                    >
                        Reset
                    </button>
                    <button
                        className="btn btn-success"
                        disabled={formLoading || isSubmitting}
                        style={{ minWidth: '100px', minHeight: '40px' }}
                        onClick={(e) => {
                            handleSubmitCoupons(e);
                        }}
                    >
                        {formLoading || isSubmitting ? (
                            <div className="spinner-border text-white" role="status">
                                <span className="sr-only">Loading...</span>
                            </div>
                        ) : 'Submit'}
                    </button>
                </div>
            </form>
        </div>
    );

    return (

        <div style={{
            width: '100%',
            maxWidth: '100%'
        }}>
            <ul style={{
                display: 'flex',
                listStyle: 'none',
                padding: 0,
                margin: 0,
                border: '1px solid #dee2e6'
            }}>
                <li style={{ width: "50%" }}>
                    <button
                        onClick={() => setActiveTab("consultation")}
                        style={buttonStyle("consultation")}
                    >
                        Book Consultation
                    </button>
                </li>
                <li style={{ width: "50%" }}>
                    <button
                        onClick={() => setActiveTab("coupons")}
                        style={buttonStyle("coupons")}
                    >
                        Extra Coupons
                    </button>
                </li>
            </ul>

            <div
                className="card shadow-lg"
                style={{
                    borderRadius: '12px',
                    border: 'none',
                    width: '100%',
                    margin: '0 auto',

                }}
            >
                {activeTab === 'consultation' ? (
                    isVerified ? (returnForm()) : (
                        <div className='card p-4' style={{

                            borderRadius: '12px',
                            width: '100%'
                        }}>
                            <div className='col-12'>
                                <label
                                    htmlFor="mobileNumber"
                                    className="form-label text-secondary"
                                    style={{
                                        fontWeight: '600',
                                        marginBottom: '10px'
                                    }}
                                >
                                    Mobile Number/OHOCard Number
                                    <span className="text-danger"> *</span>
                                </label>

                                <div className='d-flex flex-row align-items-center'>
                                    <input
                                        type="text"
                                        className="form-control me-3 mb-3"
                                        maxLength="12"
                                        id="mobileNumber"
                                        value={mobileNumber}
                                        onChange={handleVerifyInputChange}
                                        style={{
                                            minHeight: '45px',
                                            borderRadius: '8px',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                            width: 'calc(100% - 140px)' // Adjust width to fit verify button
                                        }}
                                        placeholder="Enter mobile number"
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-primary mb-3"
                                        onClick={handleVerify}
                                        disabled={mobileNumber.length < 10 || verifyLoading}
                                        style={{
                                            minWidth: '120px',
                                            minHeight: '45px',
                                            borderRadius: '8px',
                                            fontWeight: 'bold',
                                            backgroundColor: '#007bff',
                                            borderColor: '#007bff',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {verifyLoading ? (
                                            <div
                                                className="spinner-border text-white"
                                                role="status"
                                                style={{ width: '1.5rem', height: '1.5rem' }}
                                            >
                                                <span className="sr-only">Loading...</span>
                                            </div>
                                        ) : "Verify"}
                                    </button>
                                </div>

                                {verifiedMessage && verifiedMessage.length > 0 && (
                                    <p
                                        className='text-danger text-center mt-2'
                                        style={{
                                            fontWeight: '500',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        {verifiedMessage}
                                    </p>
                                )}
                            </div>
                        </div>
                    )
                ) : (
                    isVerified ? (renderCouponsForm()) : (
                        <div className='card p-4' style={{ width: '100%' }}>
                            <div className='col-12'>
                                <label htmlFor="mobileNumber" className="form-label">
                                    Mobile Number/OHOCard Number<span className="text-danger"> *</span>
                                </label>

                                <div className='d-flex flex-row align-items-center'>
                                    <input
                                        type="text"
                                        className="form-control me-3 mb-3"
                                        maxLength="12"
                                        id="mobileNumber"
                                        value={mobileNumber}
                                        onChange={handleVerifyInputChangecoupons}
                                        style={{
                                            minHeight: '40px',
                                            width: 'calc(100% - 140px)' // Adjust width to fit verify button
                                        }}
                                        placeholder="Enter mobile number"
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-primary mb-3"
                                        onClick={handleVerify}
                                        disabled={mobileNumber.length < 10 || verifyLoading}
                                        style={{
                                            minWidth: '120px',
                                            minHeight: '40px',
                                            backgroundColor: '#007bff',
                                            borderColor: '#007bff'
                                        }}
                                    >
                                        {verifyLoading ? (
                                            <div className="spinner-border text-white" role="status">
                                                <span className="sr-only">Loading...</span>
                                            </div>
                                        ) : "Verify"}
                                    </button>
                                </div>
                                {verifiedMessage && verifiedMessage.length > 0 && (
                                    <p className='text-danger text-center'>{verifiedMessage}</p>
                                )}
                            </div>
                        </div>
                    )
                )}
            </div>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }} // 👈 updated position
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

        </div>




    )

}

export default BookConsultation;