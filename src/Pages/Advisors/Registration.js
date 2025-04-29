import React, { useEffect, useState } from "react";
import Cleave from "cleave.js/react";
import "cleave.js/dist/addons/cleave-phone.in";
import { useNavigate, useLocation } from "react-router-dom";
import {
  fetchAllData,
  fetchData,
  fetchUpdateData,
} from "../../helpers/externapi";
import Alert from "@mui/material/Alert";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import Snackbar from "@mui/material/Snackbar";

export default function Registration() {
  const location = useLocation();
  const profileFromLocation = location.state ? location.state.profile : null;
  const [loading, setLoading] = useState(true);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [events, setEvent] = useState();
  const [membertype, setMemberType] = useState();
  const [routename, setRouteName] = useState();
  const [rmName, setRMName] = useState();
  const [membersData, setMembersData] = useState();
  const [isEditForm, setIsEditForm] = useState(true);
  const [isAddForm, setIsAddForm] = useState(false);
  const [memberId, setMemberId] = useState("");
  const navigate = useNavigate();
  const [formError, setFormError] = useState({});
  const [selectedStateId, setSelectedStateId] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userId, setUserId] = useState(0);
  const [isDistrictDisabled, setIsDistrictDisabled] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [mandals, setMandals] = useState([]);
  const [villages, setVillages] = useState([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState(null);
  const [selectedMandalId, setSelectedMandalId] = useState("");
  const [isAddingVillage, setIsAddingVillage] = useState(false);
  const [newVillageName, setNewVillageName] = useState("");

  const [newMandalName, setNewMandalName] = useState("");
  const [isAddingMandal, setIsAddingMandal] = useState(false);

  const initialFormData = {
    Name: "",
    Email: "",
    MobileNumber: "",
    AlternateMobileNumber: "",
    Gender: "",
    DateofBirth: "",
    MobileOTP: "",
    EmailOTP: "",
    AddressLine1: "",
    AddressLine2: "",
    Medals: "",
    DistrictId: "",
    EventId: "",
    StateId: "",
    City: "",
    Pincode: "",
    Age: "",
    Village: "",
    Mandal: "",
    MemberTypeId: "",
    RouteMaps: "",
    TelecallerName: "",
    RouteName: "",
    RouteMapId: "",
    RMId: null,
    ReportingTo: null,
  };

  let UserId = localStorage.getItem("UserId");

  const [formData, setFormData] = React.useState(initialFormData);
  const [userRoleId, setUserRoleId] = useState("");

  useEffect(() => {
    const userIdFromStorage = parseInt(localStorage.getItem("UserId"), 10) || 0;
    setUserId(userIdFromStorage);

    if (profileFromLocation) {
      setIsEditForm(true);
      setMemberId(profileFromLocation.MemberId);
      setFormData(profileFromLocation);
      setSelectedStateId(profileFromLocation.StateId);
    } else {
      setIsAddForm(true);
      setFormData(initialFormData);
    }
  }, [profileFromLocation]);

  useEffect(() => {
    const getStates = async () => {
      setLoading(true);
      const statesData = await fetchData("States/all", { skip: 0, take: 0 });
      setStates(statesData);
      setLoading(false);
    };

    const getMemberTypes = async () => {
      const fetchMemberTypes = await fetchData("UserRoles/all", {
        skip: 0,
        take: 0,
      });
      const memberTypes = fetchMemberTypes.map((item) => ({
        label: item.RoleType,
        value: item.UserRoleId,
      }));

      const filteredTypeId = memberTypes.find(
        (item) => item.label === "Advisor"
      )?.value;
      setUserRoleId(filteredTypeId);
    };

    getStates();
    getMemberTypes();
  }, []);

  useEffect(() => {
    const getDistricts = async () => {
      if (selectedStateId !== null) {
        setLoading(true);
        const districtsData = await fetchAllData(
          `Districts/GetByStateId/${selectedStateId}`
        );
        setDistricts(
          districtsData.map((district) => ({
            ...district,
            id: district.DistrictId,
          }))
        );
        setDistricts(districtsData);
        setLoading(false);
      } else {
        setDistricts([]);
      }
    };
    getDistricts();
  }, [selectedStateId]);
  const getMandals = async () => {
    if (selectedDistrictId) {
      try {
        const mandalsData = await fetchAllData(
          `Mandal/GetMandalsByDistrictId/${selectedDistrictId}`
        );
        setMandals(mandalsData);
      } catch (error) {
        console.error("Error fetching mandals:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    getMandals();
  }, [selectedDistrictId]);

  useEffect(() => {
    if (formData.Mandal) {
      getVillages(formData.Mandal);
    }
  }, [formData.Mandal]);



  const handleMandalChange = (e) => {
    const value = e.target.value;
    if (value === "add-new") {
      setIsAddingMandal(true);
    } else {
      setFormData({ ...formData, MandalId: value });
      setIsAddingMandal(false);
    }
  };

  const handleAddMandal = async () => {
    if (!newMandalName.trim()) return;

    setLoading(true);
    try {
      const response = await fetchData("Mandal/add", {
        DistrictId: selectedDistrictId,
        StateId: formData.StateId,
        MandalName: newMandalName,
        CreatedBy: userId,
      });

      if (response) {
        setMandals([
          ...mandals,
          { MandalId: response.MandalId, MandalName: newMandalName },
        ]);
        setFormData({
          ...formData,
          Mandal: newMandalName,
          Village: "" // Reset Village when Mandal changes
        });
        setNewMandalName("");
        setIsAddingMandal(false);

        // Reset villages when Mandal changes
        getVillages(response.MandalId);

      }

    } catch (error) {
      console.error("Error adding mandal:", error);
      alert("Failed to add mandal.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddVillage = async (e) => {
    e.preventDefault();
    if (!newVillageName.trim()) return;

    const selectedMandal = mandals.find(m => m.MandalName === formData.Mandal);
    const mandalId = selectedMandal ? selectedMandal.MandalId : null;

    if (!mandalId) {
      console.error("Please select a valid Mandal first.");
      return;
    }

    const newVillage = {
      MandalId: mandalId,
      MandalName: formData.Mandal,
      DistrictId: selectedDistrictId,
      StateId: formData.StateId,
      VillageName: newVillageName,
      CreatedBy: userId,
    };

    setLoading(true);
    try {
      const response = await fetchData("Village/add", newVillage);
      console.error("Village Add Response:", response);

      if (response) {
        const villageId = response.VillageId || `temp-${Date.now()}`;

        setVillages(prev => [...prev, {
          VillageId: villageId,
          VillageName: newVillageName,
          MandalId: mandalId
        }]);

        await getVillages(mandalId);
        setFormData({ ...formData, Village: newVillageName });
        setNewVillageName("");
        setIsAddingVillage(false);
      } else {
        console.error("Failed to add village.");
      }
    } catch (error) {
      console.error("Error adding village:", error);
    } finally {
      setLoading(false);
    }
  };

  const getVillages = async (mandalId) => {
    if (!mandalId) return;

    setLoading(true);
    try {
      const response = await fetchAllData(
        `Village/GetVillagesByMandalId/${mandalId}`
      );

      setVillages(response || []);
    } catch (error) {
      console.error("Error fetching villages:", error);
      setVillages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMandals();
  }, [selectedDistrictId]);

  useEffect(() => {
    if (formData.Mandal) {
      const selectedMandal = mandals.find(
        (m) => m.MandalName === formData.Mandal
      );
      if (selectedMandal) {
        getVillages(selectedMandal.MandalId);
      } else {
        setVillages([]);
        setVillages([]);
      }
    }
  }, [formData.Mandal]);

  useEffect(() => {
    if (formData.StateId) {
      setFormData({
        ...formData,
        Mandal: "",
        Village: ""
      });
      setMandals([]);
      setVillages([]);
    }
  }, [formData.StateId]);

  useEffect(() => {
    if (selectedDistrictId) {
      setFormData({
        ...formData,
        Mandal: "",
        Village: ""
      });
      setVillages([]);
    }
  }, [selectedDistrictId]);

  useEffect(() => {
    if (formData.Mandal) {
      setFormData({
        ...formData,
        Village: ""
      });

      const selectedMandal = mandals.find(m => m.MandalName === formData.Mandal);
      if (selectedMandal) {
        getVillages(selectedMandal.MandalId);
      } else {
        setVillages([]);
      }
    }
  }, [formData.Mandal]);



  useEffect(() => {
    const getEvent = async () => {
      const eventData = await fetchData("Event/all", { skip: 0, take: 0 });
      setEvent(eventData);
      setLoading(false);
    };

    getEvent();

    const getMemberType = async () => {
      const membertype = await fetchData("MemberTypes/all", {
        skip: 0,
        take: 0,
      });
      const filteredMemberType = membertype.filter(
        (type) => type.MemberTypeId !== 0
      );
      setMemberType(filteredMemberType);
    };

    getMemberType();

    const getRouteName = async () => {
      const routename = await fetchData("RouteMap/all", { skip: 0, take: 0 });
      setRouteName(routename);

      setLoading(false);
    };

    getRouteName();

    const getRMName = async () => {
      const rmName = await fetchAllData("lambdaAPI/Employee/GetRMNames");
      setRMName(rmName);

      setLoading(false);
    };
    getRMName();
  }, []);

  const handleBackToView = () => {
    if (!profileFromLocation) {
      // If profileFromLocation is not defined, navigate to the default route
      navigate("/advisor/list");
      return; // Exit the function
    }
    if (profileFromLocation) {
      navigate(`/advisor/details/${memberId}`);
    } else {
      navigate("/advisor/list");
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setFormError({});
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const validateForm = async () => {
    let err = {};

    if (typeof formData.Name === "string" && formData.Name.trim() === "") {
      err.Name = "Please enter your Full Name";
    }
    if (typeof formData.Email === "string" && formData.Email.trim() !== "") {
      let emailRegex = /^\w+([\.-]?\w+)*@gmail.com$/;
      if (!emailRegex.test(formData.Email)) {
        err.Email = "Email must be in @gmail.com format";
      }
    }
    if (
      typeof formData.MobileNumber === "string" &&
      formData.MobileNumber.trim() === ""
    ) {
      err.MobileNumber = "Please enter a valid 10-digit mobile number";
    } else if (!/^[6-9]\d{9}$/.test(formData.MobileNumber.trim())) {
      err.MobileNumber =
        "Mobile Number must start with 6, 7, 8, or 9 and must be 10 digits";
    } else if (!profileFromLocation) {
      const isMobileNumberValid = await checkMobileNumberValidity(
        formData.MobileNumber
      );
      if (isMobileNumberValid) {
        err.MobileNumber = "Mobile number already exists";
      }
    }

    if (
      formData.AlternateMobileNumber && // Only validate if it's not empty
      (!/^[6-9]\d{9}$/.test(formData.AlternateMobileNumber.trim()) && // 10-digit format
        !/^[6-9]\d{4} \d{5}$/.test(formData.AlternateMobileNumber.trim())) // 11-digit format (5 space 5)
    ) {
      err.AlternateMobileNumber =
        "Mobile Number must start with 6, 7, 8, or 9 and must be either 10 digits or in '5 digits space 5 digits' format";
    }


    if (typeof formData.Gender === "string" && formData.Gender.trim() === "") {
      err.Gender = "Please Select your Gender";
    }
    if (
      typeof formData.DateofBirth === "string" &&
      formData.DateofBirth.trim() === "" &&
      (typeof formData.Age !== "string" || formData.Age.trim() === "")
    ) {
      err.DateofBirth = "Please select your date of birth or enter your age";
    } else if (
      typeof formData.DateofBirth === "string" &&
      formData.DateofBirth.trim() === ""
    ) {
      const age = formData.Age.trim();
      if (!/^\d+$/.test(age) || parseInt(age) < 18 || parseInt(age) > 70) {
        if (!/^\d+$/.test(age)) {
          err.DateofBirth = "Please enter valid age ";
        } else {
          err.DateofBirth = "User must be between 18 to 70 years only";
        }
      }
    } else if (typeof formData.Age === "string" && formData.Age.trim() === "") {
      const age = calculateAge(formData.DateofBirth);
      if (age < 18 || age > 70) {
        err.DateofBirth = "User must be between 18 to 70 years only";
      }
    } else if (
      typeof formData.Age === "string" &&
      !/^\d+$/.test(formData.Age.trim())
    ) {
      err.DateofBirth = "Please enter valid age";
    }

    if (
      typeof formData.AddressLine1 === "string" &&
      formData.AddressLine1.trim() === ""
    ) {
      err.AddressLine1 = "Please enter your address";
    }
    if (!profileFromLocation) {
      if (
        typeof formData.DistrictId === "string" &&
        formData.DistrictId.trim() === ""
      ) {
        err.DistrictId = "Please select your District";
      }
    } else {
      if (!formData.DistrictId) {
        err.DistrictId = "Please select your District";
      }
    }
    if (!profileFromLocation) {
      if (
        typeof formData.StateId === "string" &&
        formData.StateId.trim() === ""
      ) {
        err.StateId = "Please select your State";
      }
    } else {
      if (!formData.StateId) {
        err.StateId = "Please select your State";
      }
    }
    

    if (
      typeof formData.Pincode === "string" &&
      formData.Pincode.trim() === ""
    ) {
      err.Pincode = "Please enter a valid 6-digit pin code";
    } else if (
      typeof formData.Pincode === "string" &&
      formData.Pincode.trim().length !== 6
    ) {
      err.Pincode = "Pincode must be 6 digits";
    }
    if (!formData.Mandal ||
      (typeof formData.Mandal === "string" && formData.Mandal.trim() === "") ||
      formData.Mandal === "Select Mandal") {
      err.Mandal = "Please select your Mandal";
    }

    // Validate Village
    if (!formData.Village ||
      (typeof formData.Village === "string" && formData.Village.trim() === "") ||
      formData.Village === "Select Village") {
      err.Village = "Please select your Village";
    }

    // Update form errors
    setFormError({ ...err });

    // Check if there are any errors
    const isValid = Object.keys(err).length === 0;

    return isValid;
  };

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    let updatedFormData = { ...formData, [name]: value };
    let error = "";

    setFormData((prevData) => {
      const selectedRoute = routename.find(
        (route) => route.RouteMapId === value
      );
      return {
        ...prevData,
        [name]: value,
        RMName: selectedRoute ? selectedRoute.RMName : "",
        TelecallerName: selectedRoute ? selectedRoute.TelecallerName : "",
      };
    });

    if (name === "Gender") {
      error = "";
    }
    if (name === "Age") {
      const ageValue = value.trim();
      if (
        !isNaN(ageValue) &&
        parseInt(ageValue) >= 18 &&
        parseInt(ageValue) <= 70
      ) {
        const today = new Date();
        const year = today.getFullYear() - parseInt(ageValue, 10);
        const dob = `${year}-01-01`;
        updatedFormData = { ...updatedFormData, DateofBirth: dob };
      } else {
        error = "User must be between 18 to 70 years only";
        updatedFormData = { ...updatedFormData, DateofBirth: "" };
      }
    } else if (name === "DateofBirth") {
      const age = calculateAge(value);
      if (age >= 18 && age <= 70) {
        updatedFormData = { ...updatedFormData, Age: age.toString() };
      } else {
        error = "User must be between 18 to 70 years only";
        updatedFormData = { ...updatedFormData, Age: "" };
      }
    }

    setFormData(updatedFormData);
    setFormError({ ...formError, [name]: error });
    if (name === "StateId") {
      setIsDistrictDisabled(!value);
      setSelectedStateId(value);
      updatedFormData.DistrictId = "";
    }
    if (name === "DistrictId") {
      setSelectedDistrictId(value);
    }
  };

  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const checkMobileNumberValidity = async (mobileNumber) => {
    const response = await fetchData("lambdaAPI/Employee/mobileNoValid", {
      mobileNumber: mobileNumber,
    });
    const data = await response;
    if (data.status === false) {
      return false;
    } else {
      return true;
    }
  };
  useEffect(() => {
  }, [formData.Email]);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    const isValid = await validateForm();

    if (isValid) {
      // Prepare submit data
      const mobileNumber = formData.MobileNumber;
      const formattedNumber = mobileNumber
        ? mobileNumber.replace(/\s/g, "")
        : "";
        let dob = formData.DateofBirth;
        let age = formData.Age ? String(formData.Age).trim() : "";
  
        if (age !== "") {
          const today = new Date();
          const year = today.getFullYear() - parseInt(age, 10);
          age = ``;
        } else {
          dob = "";
        }
  
        let MemberId;

      const submitData = {
        memberId: formData.MemberId,
        userId: UserId,
        registerOn: formData.RegisterOn,
        name: formData.Name,
        fullName: formData.Name,
        mobileNumber: formattedNumber,
        alternateMobileNumber: formData.AlternateMobileNumber,
        email: formData.Email,
        gender: formData.Gender,
        dateOfBirth: formData.DateofBirth,
        addressLine1: formData.AddressLine1,
        routemaps: formData.RouteMaps,
        routenames: formData.RouteName,
        addressLine2: formData.AddressLine2,
        stateId: formData.StateId,
        districtId: formData.DistrictId,
        pinCode: formData.Pincode,
        mandal: formData.Mandal,
        village: formData.Village,
        city: formData.City,
        password: formData.Password,
        memberTypeId: formData.MemberTypeId,
        isProfileCompleted: formData.IsProfileCompleted,
        isActive: formData.IsActive,
        approvedOn: formData.ApprovedOn,
        approvedBy: formData.approvedBy,
        pinNo: formData.PinNo,
        noofTimes: formData.NoofTimes,
        attemptUpdateOn: formData.AttemptUpdateOn,
        remarks: formData.Remarks,
        isApproved: formData.IsApproved,
        status: formData.Status,
        clinicName: formData.ClinicName,
        ohocode: formData.OHOCODE,
        age: formData.Age,
        associaionId: formData.AssociaionId,
        cardType: formData.CardType,
        joinedBy:formData.RMId,
        EmployeeId: formData.RMId,
        reportingTo: formData.RMId,
        cardHolderType: "Primary",
        allocatedRM: formData.RMId,
        reportingTo: formData.ReportingTo,
        UserRoleId: userRoleId,
      };
      if (age !== "") {
        submitData.age = parseInt(age, 10);
      }

      if (formData.EventId) {
        submitData.eventId = formData.EventId;
      
      }
      if (formData.MemberTypeId) {
        submitData.memberTypeId = formData.MemberTypeId;
      }

      //if (formData.RouteMapId) {
      //    submitData.routemapid = formData.RouteMapId
      //}

      let response;
      try {
       
        if (isAddForm) {
          response = await fetchData("lambdaAPI/Employee/add", submitData);
          if (response.status === true) {
            setSnackbarMessage("Advisor Added Successfully");
            setSnackbarOpen(true);
          }
        } else {
          response = await fetchUpdateData("Member/update", submitData);
        }


        if (response.status === true) {
          const responseData = response.data;
          // Update form data with response
          setFormData(prevData => ({
            ...prevData,
            // Use Email as the field name in your form state
            Email: responseData.emailId || formData.Email || prevData.Email
          }));
          // Force update after a delay to ensure UI refresh
          setTimeout(() => {
            setFormData(prevData => ({
              ...prevData,
              Email: formData.Email ?.emailId || prevData.Email
            }));
          }, 500);

          // Set success message
          setSnackbarMessage(
            isAddForm 
              ? "Advisor Added Successfully" 
              : "Advisor Updated Successfully"
          );
          setSnackbarOpen(true);

          // Optional: Reset form or navigate
          if (isAddForm) {
            setFormData(initialFormData);
          }
        } else {
          // Handle error scenario
          setSnackbarMessage(response.message || "Something went wrong");
          setSnackbarOpen(true);
        }
      } catch (error) {
        console.error('Submission Error:', error);
        setSnackbarMessage("Error submitting form");
        setSnackbarOpen(true);
      }
    }
  };

  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.innerHTML = mediaQueryStyle;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <>
      <div className="App">
        <form onSubmit={onSubmitHandler}>
          {/* Header Section with Improved Styling */}

          <div className=" row g-4">
            {/* Left Column - Personal Info */}
            <div className="col-lg-6  personal-info-container ">
              <div className="card border-0 shadow-sm h-100">
                <div
                  className="card-header p-3 text-white"
                  style={{
                    background: "linear-gradient(to right, #1976D2, #0D47A1)",
                  }}
                >
                  <div className="d-flex align-items-center">
                    <div
                      className="rounded-circle me-3 p-2 d-flex align-items-center justify-content-center"
                      style={{
                        backgroundColor: "#ECEFF1",
                        width: "36px",
                        height: "36px",
                      }}
                    >
                      <i className="bx bx-user-circle text-primary"></i>
                    </div>
                    <h5 className="mb-0 fw-bold text-white">
                      PERSONAL INFORMATION
                    </h5>
                  </div>
                </div>
                <div className="card-body p-4">
                  {/* Full Name */}
                  <div className="mb-3">
                    <label
                      htmlFor="Name"
                      className="form-label fw-bold mb-2 text-start w-100"
                    >
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span
                        className="input-group-text"
                        style={{ backgroundColor: "#ECEFF1" }}
                      >
                        <i className="bx bx-user text-primary"></i>
                      </span>
                      <input
                        className="form-control py-2"
                        type="text"
                        id="Name"
                        placeholder="Enter your full name"
                        name="Name"
                        maxLength={100}
                        value={formData.Name}
                        onChange={onChangeHandler}
                      />
                    </div>
                    <small className="text-danger d-block text-start">{formError.Name}</small>
                  </div>

                  <div className="row mb-2">
                    {/* Mobile Number */}
                    <div className="col-md-6 mb-3">
                      <label
                        htmlFor="MobileNumber"
                        className="form-label fw-bold mb-2 text-start w-100"
                      >
                        Mobile Number <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span
                          className="input-group-text"
                          style={{ backgroundColor: "#ECEFF1" }}
                        >
                          <i className="bx bxs-phone text-primary"></i>
                        </span>
                        <input
                          className="form-control py-2"
                          name="MobileNumber"
                          placeholder="xxxx xxx xxxx"
                          onChange={onChangeHandler}
                          value={formData.MobileNumber}
                          maxLength={10}
                        />
                      </div>
                      <small className="text-danger  d-block text-start">
                        {formError.MobileNumber}
                      </small>
                    </div>

                    {/* Alternative Mobile */}
                    <div className="col-md-6 mb-2">
                      <label
                        htmlFor="AlternateMobileNumber"
                        className="form-label fw-bold mb-2 text-start w-100"
                      >
                        Alternative Mobile
                      </label>
                      <div className="input-group">
                        <span
                          className="input-group-text"
                          style={{ backgroundColor: "#ECEFF1" }}
                        >
                          <i className="bx bxs-phone-call text-primary"></i>
                        </span>
                        <Cleave
                          type="tel"
                          className="form-control py-2"
                          name="AlternateMobileNumber"
                          placeholder="xxxx xxx xxxx"
                          maxLength={15}
                          onChange={onChangeHandler}
                          value={formData.AlternateMobileNumber}
                          options={{
                            blocks: [4, 3, 3],
                            delimiter: " ",
                            phone: true,
                            phoneRegionCode: "IN",
                          }}
                        />
                      </div>
                      <small className="text-danger  d-block text-start">
                        {formError.AlternateMobileNumber}
                      </small>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="mb-2">
                    <label
                      htmlFor="Email"
                      className="form-label fw-bold mb-2 text-start w-100"
                    >
                      Email
                    </label>
                    <div className="input-group">
                      <span
                        className="input-group-text"
                        style={{ backgroundColor: "#ECEFF1" }}
                      >
                        <i className="bx bx-envelope text-primary"></i>
                      </span>
                      <input

                        className="form-control py-2"
                        name="Email"
                        placeholder="example@gmail.com"
                        onChange={onChangeHandler}
                        value={formData.Email}
                      />
                    </div>
                    <small className="text-danger">{formError.Email}</small>
                  </div>
                  <div className="row mb-3">
                    {/* Date of Birth */}
                    <div className="col-md-6 mb-2">
                      <label
                        htmlFor="DateofBirth"
                        className="form-label fw-bold mb-2 text-start w-100"
                      >
                        Date of Birth <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span
                          className="input-group-text"
                          style={{ backgroundColor: "#ECEFF1" }}
                        >
                          <i className="bx bx-calendar text-primary"></i>
                        </span>
                        <Flatpickr
          type="text"
          className="form-control py-2"
          id="DateofBirth"
          name="DateofBirth"
          placeholder="Enter Date of Birth"
          value={formData.DateofBirth}
          onChange={([date]) =>
            onChangeHandler({
              target: {
                name: "DateofBirth",
                value: date.toLocaleDateString("en-CA"),
              },
            })
          }          options={{
            dateFormat: "Y-m-d", // Customize date format as needed
            maxDate: "today" // Optional: prevent future dates
          }}
        />
                      </div>
                      <small className="text-danger d-block text-start">{formError.DateofBirth}</small>
                    </div>

                    {/* Age */}
                    <div className="col-md-6 mb-2">
                      <label
                        htmlFor="Age"
                        className="form-label fw-bold mb-2 text-start w-100"
                      >
                        Age
                      </label>
                      <div className="input-group">
                        <span
                          className="input-group-text"
                          style={{ backgroundColor: "#ECEFF1" }}
                        >
                          <i className="bx bx-time-five text-primary"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control py-2"
                          id="Age"
                          name="Age"
                          placeholder="Enter Age"
                          value={formData.Age}
                          onChange={onChangeHandler}
                        />
                      </div>
                      <small className="text-danger d-block text-start">{formError.Age}</small>
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="mb-2">
                    <label className="form-label fw-bold mb-2 d-block text-start w-100">
                      Gender <span className="text-danger">*</span>
                    </label>
                    <div className="d-flex gap-4">
                      <div className="form-check">
                        <input
                          name="Gender"
                          className="form-check-input"
                          type="radio"
                          value="Male"
                          id="customRadioTemp1"
                          checked={formData.Gender === "Male"}
                          onChange={onChangeHandler}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="customRadioTemp1"
                        >
                          <i className="bx bx-male-sign me-1 text-primary"></i>{" "}
                          Male
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          name="Gender"
                          className="form-check-input"
                          type="radio"
                          value="Female"
                          id="customRadioTemp2"
                          checked={formData.Gender === "Female"}
                          onChange={onChangeHandler}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="customRadioTemp2"
                        >
                          <i className="bx bx-female-sign me-1 text-primary"></i>{" "}
                          Female
                        </label>
                      </div>
                    </div>
                    <small className="text-danger  d-block text-start">{formError.Gender}</small>
                  </div>
                  <div className="row mb-2">
                    {/* Reporting To */}
                    <div className="col-md-6 mb-3">
                      <label
                        htmlFor="reportingTo"
                        className="form-label fw-bold mb-2 text-start w-100"
                      >
                        Reporting To
                      </label>
                      <div className="input-group">
                        <span
                          className="input-group-text"
                          style={{ backgroundColor: "#ECEFF1" }}
                        >
                          <i className="bx bx-user-voice text-primary"></i>
                        </span>
                        <select
                          id="select2Success-reporting"
                          name="ReportingTo"
                          className="form-select py-2"
                          value={formData.ReportingTo}
                          onChange={onChangeHandler}
                        >
                          <option value="">--Select Reporting Manager--</option>
                          {rmName &&
                            rmName.map((option, index) => (
                              <option
                                key={`reporting-${index}`}
                                value={option.UserId}
                              >
                                {option.UserName}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    {/* RM Name */}
                    <div className="col-md-6 mb-2">
                      <label
                        htmlFor="rmName"
                        className="form-label fw-bold mb-2 text-start w-100"
                      >
                        RM Name
                      </label>
                      <div className="input-group">
                        <span
                          className="input-group-text"
                          style={{ backgroundColor: "#ECEFF1" }}
                        >
                          <i className="bx bx-id-card text-primary"></i>
                        </span>
                        <select
                          id="select2Success"
                          name="RMId"
                          className="form-select py-2"
                          value={formData.RMId}
                          onChange={onChangeHandler}
                        >
                          <option value="">--Select RM Name--</option>
                          {rmName &&
                            rmName.map((option, index) => (
                              <option
                                key={"rmName" + index}
                                value={option.UserId}
                              >
                                {option.UserName}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Address */}
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div
                  className="card-header p-3 text-white"
                  style={{
                    background: "linear-gradient(to right, #1976D2, #0D47A1)",
                  }}
                >
                  <div className="d-flex align-items-center">
                    <div
                      className="rounded-circle me-3 p-2 d-flex align-items-center justify-content-center"
                      style={{
                        backgroundColor: "#ECEFF1",
                        width: "36px",
                        height: "36px",
                      }}
                    >
                      <i className="bx bx-map-alt text-primary"></i>
                    </div>
                    <h5 className="mb-0 fw-bold text-white">ADDRESS DETAILS</h5>
                  </div>
                </div>
                <div className="card-body p-4">
                  {/* Address Line 1 */}
                  <div className="mb-4">
                    <label
                      htmlFor="AddressLine1"
                      className="form-label fw-bold mb-2 text-start w-100"
                    >
                      Address Line 1 <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span
                        className="input-group-text"
                        style={{ backgroundColor: "#ECEFF1" }}
                      >
                        <i className="bx bx-home text-primary"></i>
                      </span>
                      <input
                        className="form-control py-2"
                        type="text"
                        id="AddressLine1"
                        placeholder="Enter Address"
                        name="AddressLine1"
                        maxLength={150}
                        value={formData.AddressLine1}
                        onChange={onChangeHandler}
                      />
                    </div>
                    <small className="text-danger  d-block text-start">
                      {formError.AddressLine1}
                    </small>
                  </div>

                  {/* Address Line 2 */}
                  <div className="mb-4">
                    <label
                      htmlFor="AddressLine2"
                      className="form-label fw-bold mb-2 text-start w-100"
                    >
                      Address Line 2
                    </label>
                    <div className="input-group">
                      <span
                        className="input-group-text"
                        style={{ backgroundColor: "#ECEFF1" }}
                      >
                        <i className="bx bx-buildings text-primary"></i>
                      </span>
                      <input
                        className="form-control py-2"
                        type="text"
                        id="AddressLine2"
                        placeholder="Enter Address"
                        name="AddressLine2"
                        maxLength={150}
                        value={formData.AddressLine2}
                        onChange={onChangeHandler}
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    {/* State */}
                    <div className="col-md-6 mb-3">
                      <label
                        htmlFor="StateId"
                        className="form-label fw-bold mb-2 text-start w-100"
                      >
                        State <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span
                          className="input-group-text"
                          style={{ backgroundColor: "#ECEFF1" }}
                        >
                          <i className="bx bx-map text-primary"></i>
                        </span>
                        <select
                          className="form-select py-2"
                          name="StateId"
                          value={formData.StateId}
                          onChange={onChangeHandler}
                        >
                          <option value="">Select State</option>
                          {states.map((state) => (
                            <option key={state.StateId} value={state.StateId}>
                              {state.StateName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <small className="text-danger  d-block text-start">{formError.StateId}</small>
                    </div>

                    {/* District */}
                    <div className="col-md-6 mb-3">
                      <label
                        htmlFor="DistrictId"
                        className="form-label fw-bold mb-2 text-start w-100"
                      >
                        District <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span
                          className="input-group-text"
                          style={{ backgroundColor: "#ECEFF1" }}
                        >
                          <i className="bx bx-map-pin text-primary"></i>
                        </span>
                        <select
                          className="form-select py-2"
                          name="DistrictId"
                          value={formData.DistrictId}
                          onChange={onChangeHandler}
                          disabled={!selectedStateId}
                        >
                          <option value="">Select District</option>
                          {districts.map((district) => (
                            <option
                              key={district.DistrictId}
                              value={district.DistrictId}
                            >
                              {district.DistrictName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <small className="text-danger  d-block text-start">{formError.DistrictId}</small>
                    </div>
                  </div>

                  <div className="row mb-3">
                    {/* City/Town */}
                    <div className="col-md-6 mb-3">
                      <label
                        htmlFor="City"
                        className="form-label fw-bold mb-2 text-start w-100"
                      >
                        City/Town
                      </label>
                      <div className="input-group">
                        <span
                          className="input-group-text"
                          style={{ backgroundColor: "#ECEFF1" }}
                        >
                          <i class="fa-solid fa-city text-primary"></i>
                        </span>
                        <input
                          className="form-control py-2"
                          type="text"
                          id="City"
                          placeholder="Enter City/Town Name"
                          name="City"
                          maxLength={50}
                          value={formData.City}
                          onChange={onChangeHandler}
                        />
                      </div>
                    </div>

                    {/* Pincode */}
                    <div className="col-md-6 mb-3">
                      <label
                        htmlFor="Pincode"
                        className="form-label fw-bold mb-2 text-start w-100"
                      >
                        Pincode <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span
                          className="input-group-text"
                          style={{ backgroundColor: "#ECEFF1" }}
                        >
                          <i className="bx bx-hash text-primary"></i>
                        </span>
                        <input
                          className="form-control py-2"
                          type="text"
                          name="Pincode"
                          pattern="[0-9]{6}"
                          maxLength="6"
                          id="Pincode"
                          placeholder="e.g., 123456"
                          onChange={onChangeHandler}
                          value={formData.Pincode}
                        />
                      </div>
                      <small className="text-danger  d-block text-start">{formError.Pincode}</small>
                    </div>
                  </div>
                  {/* Mandal Selection */}
                  <div className="row">
                    {/* Mandal Selection */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="Mandal" className="form-label fw-bold mb-2 text-start w-100">
                        Mandal <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text" style={{ backgroundColor: "#ECEFF1" }}>
                          <i className="bx bx-map text-primary"></i>
                        </span>
                        <select
                          className="form-select py-2"
                          id="Mandal"
                          name="Mandal"
                          value={formData.Mandal}
                          onChange={(e) => {
                            const selectedMandal = e.target.value;

                            // Update form data
                            setFormData({
                              ...formData,
                              Mandal: selectedMandal,
                              Village: "" // Reset Village when Mandal changes
                            });

                            // Clear Mandal error when a valid Mandal is selected
                            setFormError(prevErrors => {
                              const newErrors = { ...prevErrors };

                              // Remove Mandal error if a valid Mandal is selected
                              if (selectedMandal && selectedMandal !== "") {
                                delete newErrors.Mandal;
                              }

                              return newErrors;
                            });
                          }}
                          disabled={loading || !selectedDistrictId}
                        >
                          <option value="">Select Mandal</option>
                          {mandals.map((mandal) => (
                            <option key={mandal.MandalId} value={mandal.MandalName}>
                              {mandal.MandalName}
                            </option>
                          ))}
                        </select>

                      </div>
                      <small className="text-danger  d-block text-start">{formError.Mandal}</small>


                      {selectedDistrictId && (
                        <span
                          className="d-block mt-1 text-primary"
                          style={{ fontSize: "0.75rem", cursor: "pointer" }}
                          onClick={() => setIsAddingMandal(true)}
                        >
                          + Add Mandal
                        </span>
                      )}


                      {isAddingMandal && (
                        <div className="mt-2 d-flex">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Enter Mandal Name"
                            value={newMandalName}
                            onChange={(e) => setNewMandalName(e.target.value)}
                          />
                          <button
                            className="btn btn-primary btn-sm ms-2"
                            onClick={handleAddMandal}
                            disabled={loading}
                          >
                            Save
                          </button>
                          <button
                            className="btn btn-secondary btn-sm ms-2"
                            onClick={() => setIsAddingMandal(false)}
                            disabled={loading}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>


                    <div className="col-md-6 mb-3">
                      <label htmlFor="Village" className="form-label fw-bold mb-2 text-start w-100">
                        Village <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text" style={{ backgroundColor: "#ECEFF1" }}>
                          <i className="bx bx-home-heart text-primary"></i>
                        </span>
                        <select
                          className="form-select py-2"
                          id="Village"
                          name="Village"
                          value={formData.Village}
                          onChange={(e) => {
                            const selectedVillage = e.target.value;

                            // Update form data
                            setFormData({
                              ...formData,
                              Village: selectedVillage
                            });

                            // Clear Village error when a valid Village is selected
                            setFormError(prevErrors => {
                              const newErrors = { ...prevErrors };

                              // Remove Village error if a valid Village is selected
                              if (selectedVillage && selectedVillage !== "") {
                                delete newErrors.Village;
                              }

                              return newErrors;
                            });
                          }}
                          disabled={loading || !formData.Mandal}
                        >
                          <option value="">Select Village</option>
                          {villages.map((village) => (
                            <option key={village.VillageId} value={village.VillageName}>
                              {village.VillageName}
                            </option>
                          ))}
                        </select>

                      </div>
                      <small className="text-danger  d-block text-start">{formError.Village}</small>


                      {formData.Mandal && (
                        <span
                          className="d-block mt-1 text-primary"
                          style={{ fontSize: "0.75rem", cursor: "pointer" }}
                          onClick={() => setIsAddingVillage(true)}
                        >
                          + Add Village
                        </span>
                      )}



                      {isAddingVillage && (
                        <div className="mt-2 d-flex">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Enter Village Name"
                            value={newVillageName}
                            onChange={(e) => setNewVillageName(e.target.value)}
                          />
                          <button
                            className="btn btn-primary btn-sm ms-2"
                            onClick={handleAddVillage}
                            disabled={loading}
                          >
                            Save
                          </button>
                          <button
                            className="btn btn-secondary btn-sm ms-2"
                            onClick={() => setIsAddingVillage(false)}
                            disabled={loading}
                          >
                            Cancel
                          </button>
                        </div>
                      )}





                    </div>
                  </div>

                </div>
              </div>
            </div>


            <div className="col-12">
  <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
    {/* Reset Button (Left-aligned) */}
    <button
      className="btn btn-outline-danger px-4 py-2"
      type="reset"
      onClick={resetForm}
      style={{ whiteSpace: "nowrap" }}
    >
      Reset
    </button>

    {/* Cancel & Submit Buttons (Right-aligned) */}
    <div className="d-flex gap-3 ms-auto">
      <button
        className="btn btn-outline-secondary px-4 py-2 d-flex align-items-center"
        type="button"
        onClick={handleBackToView}
        style={{ whiteSpace: "nowrap" }}
      >
        Cancel
      </button>
      <button
        className="btn px-4 py-2 text-white"
        type="submit"
        style={{
          background: "linear-gradient(to right, #1976D2, #0D47A1)",
          whiteSpace: "nowrap",
        }}
      >
        Submit
      </button>
    </div>
  </div>
</div>
</div>

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
        </form>
      </div>
    </>
  );
}

const mediaQueryStyle = `
  @media (max-width: 767px) {
     .button-container {
    display: flex;
    flex-wrap: nowrap; /* Prevent wrapping */
    justify-content: center; /* Center all buttons */
    gap: 10px; /* Add spacing */
  }

  .button-container > div {
    display: flex;
    gap: 10px; /* Maintain spacing between buttons */
    }
  @media (max-width: 767px) {
  .personal-info-container {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 100% !important;
    flex-basis: 100% !important;
    display: block !important;
  }
     .row {
    display: block !important;
  }
}


  }
`;
