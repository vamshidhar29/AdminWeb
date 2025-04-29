import React, { useState, useEffect } from "react";
import "cleave.js/dist/addons/cleave-phone.in";
import { useNavigate, useLocation } from "react-router-dom";
import {
  fetchAllData,
  fetchData,
  fetchUpdateData,
  uploadImage,
} from "../../helpers/externapi";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { MultiSelect } from "react-multi-select-component";

export default function Registration() {
  const location = useLocation();
  const profileFromLocation = location.state ? location.state.profile : null;
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [states, setStates] = React.useState([]);
  const [districts, setDistricts] = React.useState([]);
  const [HospitalsData, setHospitalsData] = React.useState();
  const [errors, setErrors] = useState({});
  const [isEditForm, setIsEditForm] = useState(true);
  const [memberId, setMemberId] = React.useState("");
  const [isAddForm, setIsAddForm] = React.useState(false);
  const [formError, setFormError] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedStateId, setSelectedStateId] = useState(null);
  const [selectedImage, setSelectedImage] = React.useState(null);
  const [selectedLogoImage, setSelectedLogoImage] = React.useState(null);
  const [routename, setRouteName] = React.useState();
 // const [userId, setUserId] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [base64, setBase64] = useState(null);
  const [iocBase64, setIOCBase64] = useState(null);
  const [logoBase64, setLogoBase64] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [mocUrl, setMocUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [doctorServices, setDoctorServices] = useState();
  const [hospitalServices, setHospitalServices] = useState();
  const [selectedDoctorServices, setSelectedDoctorServices] = useState([]);
  const [selectedHospitalServices, setSelectedHospitalServices] = useState([]);
  const [doctorErrors, setDoctorErrors] = useState([]);
  const [spocErrors, setSpocErrors] = useState([]);
  const [doctorData, setDoctorData] = useState([]);
  const [discounts, setDiscounts] = useState({});
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedAdditionalImages, setSelectedAdditionalImages] = useState([]);
  const [selectedIOCFile, setSelectedIOCFile] = React.useState(null);
  const [selectedMandalId, setSelectedMandalId] = useState("");
  const [isAddingVillage, setIsAddingVillage] = useState(false);
  const [newVillageName, setNewVillageName] = useState("");
  const [mandals, setMandals] = useState([]);
  const [villages, setVillages] = useState([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState(null);
  // Make sure you have this state defined at the top of your component
  const [filteredMandals, setFilteredMandals] = useState([]);
  const [filteredVillages, setFilteredVillages] = useState([]);

  const [newMandalName, setNewMandalName] = useState("");
  const [isAddingMandal, setIsAddingMandal] = useState(false);


  let UserId = localStorage.getItem("UserId");

  const initialFormData = {
    HospitalName: "",
    HospitalMobileNumber: "",
    HospitalContact: "",
    Landline: "",
    Email: "",
    AddressLine1: "",
    AddressLine2: "",
    City: "",
    DistrictId: "",
    StateId: "",
    Mandal: "",
    Pincode: "",
    Website: "",
    Longitude: "",
    Latitude: "",
    CreatedBy: "",
    UpdatedBy: "",
    Specialization: "",
    Location: "",
    Area: "",
    Spoc1Name: "",
    Spoc1Designation: "",
    Spoc1ContactNumber: "",
    Spoc1AlternateContactNumber: "",
    MOUFileName: "",
    Spoc2Name: "",
    Spoc2ContactNumber: "",
    Spoc2AlternateContactNumber: "",
    Spoc2Designation: "",
    RouteMapId: "",
    MapView: "",
    Aarogyasri: "",
    Agreement: "",
    PatientCounsellingFee: "",
    MenuCardForDiagnostics: "",
    DiscountOnDiagnostics: "",
    PartnershipCertificate: "",
    CallToFrontDesk: "",
    Image: "",
    IsFreeOPConsultation: "",
    IsAgreementReceived: "",
    RouteMaps: "",
    RouteName: "",
    CINNumber: "", // Add missing fields here
    GSTNumber: "",
    HospitalRegistrationNumber: "",
    MedicalCounsellationNumber: "",
    DistrictId: "",
  };

  const [spocFormData, setSpocFormData] = useState([
    {
      FullName: "",
      MobileNumber: "",
      DateOfBirth: "",
      Age: "",
      Email: "",
      Address: "",
      Qualification: "",
      IsPrimary: false,
      IsSecondary: false,
      hospitalContactId: "",
    },
  ]);

  const [doctorDetails, setDoctorDetails] = useState([
    {
      FullName: "",
      MobileNumber: "",
      DateofBirth: "",
      Age: "",
      Email: "",
      Address: "",
      Qualification: "",
      Services: [],
      doctorId: "",
      DoctorServicesProvisionId: "",
    },
  ]);

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    //const userIdFromStorage = parseInt(localStorage.getItem("UserId"), 10) || 0;
    //setUserId(userIdFromStorage);
    if (profileFromLocation) {
      setIsEditForm(true);
      setMemberId(profileFromLocation.HospitalId);
      setFormData(profileFromLocation);
      setSelectedStateId(profileFromLocation.StateId);

      // Set selected image from profile data if it exists
      if (profileFromLocation.MOUFileName) {
        setSelectedImage(profileFromLocation.MOUFileName);
      }

      if (profileFromLocation.IOcFile) {
        setSelectedIOCFile(profileFromLocation.IOcFile);
      }

      if (profileFromLocation.Image) {
        setSelectedLogoImage(profileFromLocation.Image);
      }
    } else {
      setIsAddForm(true);
      setFormData(initialFormData);
    }
  }, [profileFromLocation]);

  const fetchDoctorData = async () => {
    try {
      // Fetch doctor data
      const doctorResponse = await fetchAllData(
        `Doctor/GetByHospitalId/${profileFromLocation.HospitalId}`
      );

      if (doctorResponse && doctorResponse.length > 0) {
        const transformedDoctorDetails = doctorResponse.map((doctor) => {
          // Mapping the DoctorSpecialization to get only the services' names and IDs
          const doctorServices = doctor.DoctorSpecialization.map(
            (specialization) => ({
              value: specialization.HospitalServicesId,
              label: specialization.ServiceName.trim(), // Ensure no extra spaces in service names
            })
          );

          return {
            FullName: doctor.FullName,
            MobileNumber: doctor.MobileNumber,
            DateofBirth: doctor.DateofBirth
              ? doctor.DateofBirth.split("T")[0]
              : "",
            Age: doctor.Age,
            Email: doctor.Email,
            Address: doctor.Address,
            Qualification: doctor.Qualification,
            Services: doctorServices, // Extract service names for display
            doctorId: doctor.DoctorId,
            DoctorServicesProvisionId: doctorServices.map(
              (service) => service.id
            ), // HospitalServicesId to match with dropdown
          };
        });

        // Set the transformed doctor details into state
        setDoctorDetails(transformedDoctorDetails);
      }
    } catch (error) {
      console.error("Error fetching doctor data:", error);
    }
  };

  const fetchSpocData = async () => {
    try {
      const spocresponse = await fetchAllData(
        `HospitalContact/GetByHospitalId/${profileFromLocation.HospitalId}`
      );

      if (spocresponse && spocresponse.length > 0) {
        const transformedSpocDetails = spocresponse.map((spoc) => ({
          FullName: spoc.FullName,
          MobileNumber: spoc.MobileNumber,
          DateOfBirth: spoc.DateofBirth ? spoc.DateofBirth.split("T")[0] : "",
          Age: spoc.Age,
          Email: spoc.Email,
          Address: spoc.Address,
          Qualification: spoc.Qualification,
          IsPrimary: spoc.IsPrimary,
          IsSecondary: spoc.IsSecondary,
          hospitalContactId: spoc.HospitalContactId,
        }));

        setSpocFormData(transformedSpocDetails);
      }
    } catch (error) {
      console.error("Error fetching doctor data:", error);
    }
  };

  useEffect(() => {
    fetchDoctorData();
    fetchSpocData();
  }, []);

  useEffect(() => {
    const fetchHospitalPoliciesData = async () => {
      try {
        const response = await fetchAllData(
          `HospitalPoliciesProvision/GetByHospitalId/${profileFromLocation.HospitalId}`
        );

        // Map the response and set discount state
        const formattedServices = response.map((policy) => ({
          label: policy.PoliciesType,
          value: policy.HospitalPoliciesId,
          HospitalPoliciesProvisionId: policy.HospitalPoliciesProvisionId,
          DiscountPercentage: policy.DiscountPercentage || 0, // Include DiscountPercentage
        }));

        setSelectedHospitalServices(formattedServices);

        // Initialize discounts based on response
        const initialDiscounts = response.reduce((acc, policy) => {
          if (policy.DiscountPercentage) {
            acc[policy.HospitalPoliciesId] = policy.DiscountPercentage;
          }
          return acc;
        }, {});
        setDiscounts(initialDiscounts);
      } catch (error) {
        console.error("Error fetching hospital policies data:", error);
      }
    };

    fetchHospitalPoliciesData();
  }, []);

  useEffect(() => {
    const getStates = async () => {
      setLoading(true);
      const statesData = await fetchData("States/all", { skip: 0, take: 0 });
      setStates(statesData);
      setLoading(false);
    };

    const getDoctorServices = async () => {
      try {
        setLoading(true);

        // Fetch data
        const doctorServices = await fetchData("HospitalServices/all", {
          skip: 0,
          take: 0,
        });

        // Filter data to include only items where IsActive is true
        const activeServices = doctorServices.filter((item) => item.IsActive);

        // Map the filtered data to create the options array
        const doctorServicesArray = activeServices.map((item) => ({
          label: item.ServiceName,
          value: item.HospitalServicesId,
        }));

        // Update the state with filtered and formatted data
        setDoctorServices(doctorServicesArray);
      } catch (error) {
        console.error("Error fetching doctor services:", error);
      } finally {
        setLoading(false);
      }
    };

    const getHospitalServices = async () => {
      try {
        setLoading(true);

        // Fetch data
        const hospitalServices = await fetchData("HospitalPolicies/all", {
          skip: 0,
          take: 0,
        });

        // Filter data to include only items where IsActive is true
        const activeServices = hospitalServices.filter((item) => item.IsActive);

        // Map the filtered data to create the options array
        const hospitalServicesArray = activeServices.map((item) => ({
          label: item.PoliciesType,
          value: item.HospitalPoliciesId,
          isDiscountRequired: item.IsDiscountRequired, // Include this for conditional rendering
        }));

        // Update the state with filtered and formatted data
        setHospitalServices(hospitalServicesArray);
      } catch (error) {
        console.error("Error fetching hospital services:", error);
      } finally {
        setLoading(false);
      }
    };

    getStates();
    getDoctorServices();
    getHospitalServices();
  }, []);

  useEffect(() => {
    const getDistricts = async () => {
      if (selectedStateId !== null) {
        setLoading(true);
        const districtsData = await fetchAllData(
          `Districts/GetByStateId/${selectedStateId}`
        );
        setDistricts(districtsData);
        setLoading(false);
      } else {
        setDistricts([]);
      }
    };
    getDistricts();
  }, [selectedStateId]);

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

  const getMandals = async (districtId) => {
    if (!districtId) {
      console.error("District ID is undefined or null");
      setFilteredMandals([]);
      return;
    }

    try {
      setLoading(true);

      const parsedDistrictId = parseInt(districtId, 10) || districtId;

      const url = `Mandal/GetMandalsByDistrictId/${parsedDistrictId}`;

      const response = await fetchAllData(url);

      if (response && Array.isArray(response)) {
        const normalizedMandals = response.map((mandal) => ({
          mandalId: mandal.mandalId || mandal.MandalId,
          MandalName: mandal.MandalName || mandal.mandalName,
        }));


        setFilteredMandals(response);
      } else {
        setFilteredMandals([]);
        console.error("Invalid mandal data received", response);
      }
    } catch (error) {
      console.error("Error fetching mandals:", error);
      setFilteredMandals([]);
    } finally {
      setLoading(false);
    }
  };

  
  

  useEffect(() => {
    if (formData.DistrictId) {
     
      setFormData((prev) => ({
        ...prev,
        mandalId: "",
        MandalName: "",
        villageId: "",
        VillageName: "",
      }));

      getMandals(formData.DistrictId);

      setFilteredVillages([]);
    } else {
      setFilteredMandals([]);
      setFilteredVillages([]);
    }
  }, [formData.DistrictId]);

 

  useEffect(() => {
    if (formData.DistrictId) {
      setFormData((prev) => ({
        ...prev,
        mandalId: "",
        villageId: "",
      }));

      getMandals(formData.DistrictId);

      setFilteredVillages([]);
    } else {
      setFilteredMandals([]);
      setFilteredVillages([]);
    }
  }, [formData.DistrictId]);

  

  const handleAddMandal = async () => {
    if (!newMandalName.trim()) return;
    if (!formData.DistrictId) {
      return;
    }

    setLoading(true);
    try {
    
      const response = await fetchData("Mandal/add", {
        DistrictId: formData.DistrictId,
        StateId: formData.StateId,
        MandalName: newMandalName,
        CreatedBy: UserId,
      });


      if (response && (response.MandalId || response.mandalId)) {
        
        const newMandalId = response.MandalId || response.mandalId;

        const newMandal = {
          mandalId: newMandalId,
          MandalName: newMandalName
        };

        setFilteredMandals((prev) => [...prev, newMandal]);

        setFormData((prev) => ({
          ...prev,
          mandalId: newMandalId,
          villageId: "", 
        }));

        setNewMandalName("");
        setIsAddingMandal(false);

       
      } else {
        console.error("Failed to add mandal - invalid response:", response);
      }
    } catch (error) {
      console.error("Error adding mandal:", error);
    } finally {
      setLoading(false);
    }
  };

 


  useEffect(() => {
    const getRouteName = async () => {
      const routename = await fetchData("RouteMap/all", { skip: 0, take: 0 });
      setRouteName(routename);

      setLoading(false);
    };

    const getMocUrl = async () => {
      const response = await fetchData("ConfigValues/all", {
        skip: 0,
        take: 0,
      });
      const bucketUrl =
        response &&
        response.length > 0 &&
        response.find((val) => val.ConfigKey === "mouBucketURL");
      const imageUrl =
        response &&
        response.length > 0 &&
        response.find((val) => val.ConfigKey === "hospitalImagesURL");
      setMocUrl(bucketUrl.ConfigValue);
      setImageUrl(imageUrl.ConfigValue);
    };

    getRouteName();
    getMocUrl();
  }, []);

  // useEffect(() => {
  //   const hospitalImages = async () => {
  //     setLoading(true);
  //     if (!selectedImages || selectedImages.length === 0) return;

  //     const imageData = selectedImages.map(image => image.id);
  //     const response = await fetchData(
  //       "Hospital/MultipleHospitalImageUpload",
  //       { skip: 0, take: 0 }
  //     );
  //     setSelectedImages(response);
  //     setLoading(false);
  //   };
  //   hospitalImages();
  // }, []);

  const handleBackToView = () => {
    if (profileFromLocation && profileFromLocation.HospitalId) {
      navigate(`/hospitals/details/${profileFromLocation.HospitalId}`);
    } else {
      navigate("/hospitals/list");
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
    setFormError({});
  };

  const handleAddDoctor = () => {
    setDoctorDetails([
      ...doctorDetails,
      {
        DoctorId: "",
        HospitalId: "",
        FullName: "",
        MobileNumber: "",
        DateofBirth: "",
        Age: "",
        Email: "",
        Address: "",
        Qualification: "",
        CreatedBy: "",
        Services: [],
      },
    ]);
  };

  const addNewSpoc = () => {
    setSpocFormData([
      ...spocFormData,
      {
        HospitalContactId: "",
        HospitalId: "", // Update this with the appropriate value if needed
        FullName: "",
        MobileNumber: "",
        DateOfBirth: "",
        Age: "",
        Email: "",
        Address: "",
        Qualification: "",
        IsPrimary: false,
        IsSecondary: false,
        CreatedBy: "",
      },
    ]);
  };

  const removeSpoc = (index) => {
    const updatedFormData = spocFormData.filter((_, i) => i !== index);
    setSpocFormData(updatedFormData);
  };

  const handleRemoveDoctor = (index) => {
    const updatedDetails = doctorDetails.filter((_, i) => i !== index);
    setDoctorDetails(updatedDetails);
  };

  const validateForm = async () => {
    let err = {};

    if (formData.HospitalName === "") {
      err.HospitalName = "Please Enter Hospital Name";
    } else if (formData.HospitalName.length < 3) {
      err.HospitalName = "Hospital Name must be grater than 2 letters";
    }
    if (
      typeof formData.HospitalMobileNumber === "string" &&
      formData.HospitalMobileNumber.trim() === ""
    ) {
      err.HospitalMobileNumber = "Please enter a valid 10-digit mobile number";
    } else if (
      !/^[6-9]\d{9}$/.test(
        formData.HospitalMobileNumber && formData.HospitalMobileNumber.trim()
      )
    ) {
      err.HospitalMobileNumber =
        "Mobile Number must start with 6, 7, 8, or 9 and must be 10 digits";
    }

    // if (formData.Landline && formData.Landline.trim() === '') {
    //     err.Landline = 'Please enter a landline number';
    // } else if (!/^\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/.test(formData.Landline && formData.Landline.trim())) {
    //     err.Landline = 'Landline number format is invalid';
    // } else if (formData.Landline && formData.Landline.trim().replace(/[-.\s]/g, '').length > 15) {
    //     err.Landline = 'Landline number cannot exceed 15 digits';
    // }

    // if (!formData.Website || formData.Website.trim() === '') {
    //     err.Website = 'Please Enter Hospital Website';
    // }
    // if (formData.Email && formData.Email.trim() === '') {
    //     err.Email = 'Please Enter Email';
    // } else {
    //     let emailRegex = /^\w+([\.-]?\w+)*@gmail.com$/;
    //     if (!emailRegex.test(formData.Email)) {
    //         err.Email = 'Email Must be in @gmail.com Format';
    //     }
    // }
    if (formData.AddressLine1.length < 2) {
      err.AddressLine1 = "Please Enter Your Address";
    }
    if (formData.City && formData.City.trim() === "") {
      err.City = "Please Enter Your Cityname";
    }
    if (!profileFromLocation) {
      if (!formData.DistrictId || formData.DistrictId.trim() === "") {
        err.DistrictId = "Please Select Your District";
      }
    } else {
      if (!formData.DistrictId || formData.DistrictId.length === 0) {
        err.DistrictId = "Please Select Your District";
      }
    }

    if (!profileFromLocation) {
      if (!formData.StateId || formData.StateId.trim() === "") {
        err.StateId = "Please Select Your State";
      }
    } else {
      if (!formData.StateId || formData.StateId.length === 0) {
        err.StateId = "Please Select Your State";
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

    if (formData.City === "") {
      err.City = "Enter city Name";
    } else if (formData.City && formData.City.trim() !== "") {
      const isValidCity = /^[A-Za-z\s]+$/.test(formData.City);
      if (!isValidCity) {
        err.City = "City name should contain only alphabetic characters";
      }
    }

    // if (formData.Latitude && formData.Latitude.trim() === '') {
    //     err.Latitude = 'Please Enter Latitude';
    // } else {
    //     const latitude = parseFloat(formData.Latitude && formData.Latitude.trim());
    //     if (isNaN(latitude) || latitude < -90 || latitude > 90) {
    //         err.Latitude = 'Latitude must be a number between -90 and 90';
    //     }
    // }

    //Validate Longitude if provided
    // if (formData.Longitude && formData.Longitude.trim() == '') {
    //     err.Longitude = 'Please Enter Longitude';
    // } else {
    //     const longitude = parseFloat(formData.Longitude && formData.Longitude.trim());
    //     if (isNaN(longitude) || longitude < -180 || longitude > 180) {
    //         err.Longitude = 'Longitude must be a number between -180 and 180';
    //     }
    // }
    // if (formData.MapView && formData.MapView.trim() === '') {
    //     err.MapView = 'Please Enter Map View';
    // }
    // if (formData.RouteName && formData.RouteName.trim() === '') {
    //     err.RouteName = 'Please Enter  Route Name';
    // }

    // if (!selectedImage) {
    //     err.MOUFileName = 'Please upload a file only .pdf and .doc';
    // }

    // if (formData.Spoc1Name === '') {
    //     err.Spoc1Name = 'Please Enter Spoc1Name';
    // }
    // if (formData.Spoc1Designation === '') {
    //     err.Spoc1Designation = 'Please Enter Spoc1Designation';
    // }

    // if (formData.Spoc1ContactNumber && formData.Spoc1ContactNumber.trim() === '') {
    //     err.Spoc1ContactNumber = 'Please Enter SPOC 1 Contact Number';
    // } else if (!/^[6-9]\d{9}$/.test(formData.Spoc1ContactNumber && formData.Spoc1ContactNumber.trim())) {
    //     err.Spoc1ContactNumber = 'SPOC 1 Contact Number must start with 6, 7, 8, or 9 and must be 10 digits';
    // }

    // if (formData.Spoc1AlternateContactNumber.trim() !== '') {
    //     if (!/^\d{10}$/.test(formData.Spoc1AlternateContactNumber.trim())) {
    //         err.Spoc1AlternateContactNumber = 'SPOC 1 Alternate Contact Number must be 10 digits';
    //     }
    // }

    // if (formData.Spoc2ContactNumber && formData.Spoc2ContactNumber.trim() !== '') {
    //     if (!/^[6-9]\d{9}$/.test(formData.Spoc2ContactNumber.trim())) {
    //         err.Spoc2ContactNumber = 'SPOC 2 Contact Number must start with 6, 7, 8, or 9 and must be 10 digits';
    //     }
    // }

    // if (formData.Spoc2AlternateContactNumber.trim() !== '') {
    //    if (!/^\d{10}$/.test(formData.Spoc2AlternateContactNumber.trim())) {
    //        err. = 'SPOC 2 Alternate Contact Number must be 10 digits';
    //    }
    // }

    if (typeof formData.IsAgreementReceived !== "boolean") {
      err.IsAgreementReceived = "Please select if the agreement is received";
    }

    setFormError({ ...err });

    const isValid = Object.keys(err).length === 0;
    return isValid;
  };

  const validateDoctorsBeforeSubmit = () => {
    const errors = doctorDetails.map((doctor) => {
      const doctorError = {};
      if (!doctor.FullName?.trim()) {
        doctorError.FullName = "Please Enter Doctor Name";
      }
      if (!doctor.Qualification?.trim()) {
        doctorError.Qualification = "Please Enter Doctor Qualification";
      }
      if (!doctor.Services || doctor.Services.length === 0) {
        doctorError.Services = "At least one service must be selected";
      }
      return doctorError;
    });

    setDoctorErrors(errors);
    // Return true if there are no errors
    return errors.every((error) => Object.keys(error).length === 0);
  };

  const validateSpocsBeforeSubmit = () => {
    const errors = spocFormData.map((spoc) => {
      const spocError = {};
      if (!spoc.FullName?.trim()) {
        spocError.FullName = "Please Enter Spoc Name";
      }

      if (
        typeof spoc.MobileNumber === "string" &&
        spoc.MobileNumber.trim() === ""
      ) {
        spocError.MobileNumber = "Please enter a valid 10-digit mobile number";
      } else if (
        !/^[6-9]\d{9}$/.test(spoc.MobileNumber && spoc.MobileNumber.trim())
      ) {
        spocError.MobileNumber =
          "Mobile Number must start with 6, 7, 8, or 9 and must be 10 digits";
      }

      return spocError;
    });

    setSpocErrors(errors);

    // Return true if there are no errors
    return errors.every((error) => Object.keys(error).length === 0);
  };

  const onChangeHandler = (event) => {
    const { name, value, files } = event.target;
    let updatedValue = value;

    if (name === "MOUFileName") {
      updatedValue = files[0];
    } else if (name === "IsAgreementReceived") {
      updatedValue = value === "Yes";
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: updatedValue,
    }));
    setFormError((prevError) => ({
      ...prevError,
      [name]: "", 
    }));

    if (name === "StateId") {
      setSelectedStateId(value);
      setFormData((prevFormData) => ({
        ...prevFormData,
        DistrictId: "",
      }));
    }
    if (name === "DistrictId") {
      setSelectedDistrictId(value);
      setFormData((prevFormData) => ({
        ...prevFormData,
        MandalName: "",
      }));
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    // setFormData((prevState) => ({
    //   ...prevState,
    //   DistrictId: prevState.DistrictId?.trim() || "",
    // }));
    const isValid = await validateForm();

    const isDoctorsValid = validateDoctorsBeforeSubmit();

    const isSpocValid = validateSpocsBeforeSubmit();
    if (isValid) {
      try {
        const mobileNumber = formData.HospitalMobileNumber;
        const formattedNumber = mobileNumber
          ? mobileNumber.replace(/\s/g, "")
          : "";

        let HospitalData;
        setSubmitLoading(true);

        if (!formData.HospitalId) {
          HospitalData = await fetchData("Hospital/add", {
            hospitalname: formData.HospitalName,
            mobileNumber: formattedNumber,
            Landline: formData.Landline,
            email: formData.Email,
            addressLine1: formData.AddressLine1,
            addressLine2: formData.AddressLine2,
            districtId: formData.DistrictId,
            stateId: formData.StateId,
            pincode: formData.Pincode,
            city: formData.City,
            website: formData.Website,
            mandal: formData.Mandal,
            longitude: formData.Longitude,
            latitude: formData.Latitude,
            mapView: formData.MapView,
            routeMapId: formData.RouteMapId ? formData.RouteMapId : null,
            routenames: formData.RouteName,
            spoc1Name: formData.Spoc1Name,
            spoc1Designation: formData.Spoc1Designation,
            spoc1ContactNumber: formData.Spoc1ContactNumber,
            spoc1AlternateContactNumber: formData.Spoc1AlternateContactNumber,
            spoc2Name: formData.Spoc2Name,
            spoc2ContactNumber: formData.Spoc2ContactNumber,
            spoc2AlternateContactNumber: formData.Spoc2AlternateContactNumber,
            spoc2Designation: formData.Spoc2Designation,
            isAgreementReceived: formData.IsAgreementReceived,
            aarogyasri: formData.Aarogyasri,
            patientCounsellingFee: formData.PatientCounsellingFee,
            specialization: formData.Specialization,
            callToFrontDesk: formData.CallToFrontDesk,
            menuCardForDiagnostics: formData.MenuCardForDiagnostics,
            discountOnDiagnostics: formData.DiscountOnDiagnostics,
            isFreeOPConsultation: formData.IsFreeOPConsultation,
            mOUFileName: formData.MOUFileName,
            image: formData.Image,
            CINNumber: formData.CINNumber,
            GSTNumber: formData.GSTNumber,
            HospitalRegistrationNumber: formData.HospitalRegistrationNumber,
            MedicalCounsellationNumber: formData.MedicalCounsellationNumber,
            iocFile: formData.iocFile,
            CreatedBy: UserId
          });

          setHospitalsData(HospitalData);
          setSnackbarMessage("Hospital Added Succesfully");
        } else {
          // HospitalData = await fetchUpdateData("Hospital/update", {
          //   hospitalid: formData.HospitalId,
          //   hospitalname: formData.HospitalName,
          //   mobileNumber: formattedNumber,
          //   Landline: formData.Landline,
          //   email: formData.Email,
          //   addressLine1: formData.AddressLine1,
          //   addressLine2: formData.AddressLine2,
          //   districtId: formData.DistrictId,
          //   stateId: formData.StateId,
          //   pincode: formData.Pincode,
          //   city: formData.City,
          //   website: formData.Website,
          //   mandal: formData.Mandal,
          //   longitude: formData.Longitude,
          //   latitude: formData.Latitude,
          //   mapView: formData.MapView,
          //   routeMapId: formData.RouteMapId,
          //   routenames: formData.RouteName,
          //   spoc1Name: formData.Spoc1Name,
          //   spoc1Designation: formData.Spoc1Designation,
          //   spoc1ContactNumber: formData.Spoc1ContactNumber,
          //   spoc1AlternateContactNumber: formData.Spoc1AlternateContactNumber,
          //   spoc2Name: formData.Spoc2Name,
          //   spoc2ContactNumber: formData.Spoc2ContactNumber,
          //   spoc2AlternateContactNumber: formData.Spoc2AlternateContactNumber,
          //   spoc2Designation: formData.Spoc2Designation,
          //   isAgreementReceived: formData.IsAgreementReceived,
          //   aarogyasri: formData.Aarogyasri,
          //   patientCounsellingFee: formData.PatientCounsellingFee,
          //   specialization: formData.Specialization,
          //   callToFrontDesk: formData.CallToFrontDesk,
          //   menuCardForDiagnostics: formData.MenuCardForDiagnostics,
          //   discountOnDiagnostics: formData.DiscountOnDiagnostics,
          //   isFreeOPConsultation: formData.IsFreeOPConsultation,
          //   mOUFileName: formData.MOUFileName,
          //   image: formData.Image,
          //   CINNumber: formData.CINNumber,
          //   GSTNumber: formData.GSTNumber,
          //   HospitalRegistrationNumber: formData.HospitalRegistrationNumber,
          //   MedicalCounsellationNumber: formData.MedicalCounsellationNumber,
          // });


          const hospitalUpdateData = [
            {
              columnName: "HospitalName",
              columnValue: formData.HospitalName,
              tableName: "Hospital",
              tableId: formData.HospitalId,
              UpdatedBy: UserId
            },
            {
              columnName: "MobileNumber",
              columnValue: formattedNumber,
              tableName: "Hospital",
              tableId: formData.HospitalId,
              UpdatedBy: UserId
            },
            {
              columnName: "Landline",
              columnValue: formData.Landline,
              tableName: "Hospital",
              tableId: formData.HospitalId,
              UpdatedBy: UserId
            },
            {
              columnName: "Email",
              columnValue: formData.Email,
              tableName: "Hospital",
              tableId: formData.HospitalId,
              UpdatedBy: UserId
            },
            {
              columnName: "AddressLine1",
              columnValue: formData.AddressLine1,
              tableName: "Hospital",
              tableId: formData.HospitalId,
              UpdatedBy: UserId
            },
            {
              columnName: "AddressLine2",
              columnValue: formData.AddressLine2,
              tableName: "Hospital",
              tableId: formData.HospitalId,
              UpdatedBy: UserId
            },
            {
              columnName: "DistrictId",
              columnValue: formData.DistrictId,
              tableName: "Hospital",
              tableId: formData.HospitalId,
              UpdatedBy: UserId
            },
            {
              columnName: "StateId",
              columnValue: formData.StateId,
              tableName: "Hospital",
              tableId: formData.HospitalId,
              UpdatedBy: UserId
            },
            {
              columnName: "Pincode",
              columnValue: formData.Pincode,
              tableName: "Hospital",
              tableId: formData.HospitalId,
              UpdatedBy: UserId
            },
            {
              columnName: "City",
              columnValue: formData.City,
              tableName: "Hospital",
              tableId: formData.HospitalId,
              UpdatedBy: UserId
            },
            {
              columnName: "Website",
              columnValue: formData.Website,
              tableName: "Hospital",
              tableId: formData.HospitalId,
              UpdatedBy: UserId
            },
            {
              columnName: "Mandal",
              columnValue: formData.Mandal,
              tableName: "Hospital",
              tableId: formData.HospitalId,
              UpdatedBy: UserId
            },
            {
              columnName: "Longitude",
              columnValue: formData.Longitude,
              tableName: "Hospital",
              tableId: formData.HospitalId,
              UpdatedBy: UserId
            },
            {
              columnName: "Latitude",
              columnValue: formData.Latitude,
              tableName: "Hospital",
              tableId: formData.HospitalId,
              UpdatedBy: UserId
            },
            {
              columnName: "Aarogyasri",
              columnValue: formData.Aarogyasri,
              tableName: "Hospital",
              tableId: formData.HospitalId,
              UpdatedBy: UserId
            },
            {
              columnName: "IsFreeOPConsultation",
              columnValue: formData.IsFreeOPConsultation,
              tableName: "Hospital",
              tableId: formData.HospitalId,
              UpdatedBy: UserId
            },
            {
              columnName: "PatientCounsellingFee",
              columnValue: formData.PatientCounsellingFee,
              tableName: "Hospital",
              tableId: formData.HospitalId,
              UpdatedBy: UserId
            },
            {
              columnName: "DiscountOnDiagnostics",
              columnValue: formData.DiscountOnDiagnostics,
              tableName: "Hospital",
              tableId: formData.HospitalId,
              UpdatedBy: UserId
            },
            {
              columnName: "MenuCardForDiagnostics",
              columnValue: formData.MenuCardForDiagnostics,
              tableName: "Hospital",
              tableId: formData.HospitalId,
              UpdatedBy: UserId
            },
            {
              columnName: "CallToFrontDesk",
              columnValue: formData.CallToFrontDesk,
              tableName: "Hospital",
              tableId: formData.HospitalId,
              UpdatedBy: UserId
            },
            {
              columnName: "IsAgreementReceived",
              columnValue: formData.IsAgreementReceived,
              tableName: "Hospital",
              tableId: formData.HospitalId,
              UpdatedBy: UserId
            },
            {
              columnName: "CINNumber",
              columnValue: formData.CINNumber,
              tableName: "Hospital",
              tableId: formData.HospitalId,
              UpdatedBy: UserId
            },
            {
              columnName: "GSTNumber",
              columnValue: formData.GSTNumber,
              tableName: "Hospital",
              tableId: formData.HospitalId,
              UpdatedBy: UserId
            },
            {
              columnName: "HospitalRegistrationNumber",
              columnValue: formData.HospitalRegistrationNumber,
              tableName: "Hospital",
              tableId: formData.HospitalId,
              UpdatedBy: UserId
            },
            {
              columnName: "MedicalCounsellationNumber",
              columnValue: formData.MedicalCounsellationNumber,
              tableName: "Hospital",
              tableId: formData.HospitalId,
              UpdatedBy: UserId
            },
          ];
      
           HospitalData = await fetchUpdateData(
            "lambdaAPI/Update/CommonUpdate",
            hospitalUpdateData
          );

          setHospitalsData(HospitalData);
          setSnackbarMessage("Hospital updated Successfully");
        }

        const HospitalId = HospitalData.hospitalId ? HospitalData.hospitalId : profileFromLocation.HospitalId;

        if (!HospitalId) {
          throw new Error("HospitalId is undefined");
        }

        if (base64 && base64.length > 0) {
          await handleFileUpload(HospitalId);
        }

        if (logoBase64 && logoBase64.length > 0) {
          await handleLogoUpload(HospitalId);
        }

        if (selectedImages && selectedImages.length > 0) {
          await handleImageUpload(HospitalId);
        }
        if (selectedAdditionalImages && selectedAdditionalImages.length > 0) {
          await handleAdditionalImage(HospitalId);
        }

        if (iocBase64 && iocBase64.length > 0) {
          await handleIOCFileUpload(HospitalId);
        }

        // Doctor Submission
        const doctorsWithNames = doctorDetails.filter(
          (doctor) => doctor.FullName && doctor.FullName.trim() !== ""
        );

        if (doctorsWithNames.length > 0) {
          // Separate doctors for update and creation
          const updatePayload = doctorsWithNames
            .filter((doctor) => doctor.doctorId)
            .map((doctor) => ({
              FullName: doctor.FullName,
              MobileNumber: doctor.MobileNumber,
              DateofBirth: doctor.DateofBirth,
              Age: doctor.Age,
              Email: doctor.Email,
              Address: doctor.Address,
              Qualification: doctor.Qualification,
              HospitalId: HospitalId,
              DoctorId: doctor.doctorId,
              UpdatedBy: UserId,
            }));

          const createPayload = doctorsWithNames
            .filter((doctor) => !doctor.doctorId)
            .map((doctor) => ({
              FullName: doctor.FullName,
              MobileNumber: doctor.MobileNumber,
              DateofBirth: doctor.DateofBirth,
              Age: doctor.Age,
              Email: doctor.Email,
              Address: doctor.Address,
              Qualification: doctor.Qualification,
              HospitalId: HospitalId,
              CreatedBy: UserId,
            }));

          try {
            let doctorIds = [];

            if (updatePayload.length > 0) {
              const updatedDoctors = await fetchData(
                "Doctor/seedUpdate",
                updatePayload
              );
              doctorIds.push(
                ...updatedDoctors.map((doctor) => doctor.doctorId)
              );
            }

            if (createPayload.length > 0) {
              const newDoctors = await fetchData("Doctor/seed", createPayload);
              doctorIds.push(...newDoctors.map((doctor) => doctor.doctorId));
            }

            for (let i = 0; i < doctorsWithNames.length; i++) {
              const doctorId = doctorIds[i];

              let newDoctorServicesData = doctorDetails[i]?.Services.map(
                (service) => ({
                  DoctorId: doctorId,
                  CreatedBy: UserId,
                  HospitalServicesId: service.value,
                })
              );

              try {
                await fetchData(
                  "DoctorServicesProvision/seed",
                  newDoctorServicesData
                );
              } catch (error) {
                console.error("Error seeding doctor services:", error);
              }
            }
          } catch (error) {
            console.error("Error submitting doctor data:", error);
          }
        }

        const spocsWithNames = spocFormData.filter(
          (spoc) => spoc.FullName && spoc.FullName.trim() !== ""
        );

        if (spocsWithNames.length > 0) {
          const updatePayload = spocsWithNames
            .filter((spoc) => spoc.hospitalContactId)
            .map((spoc) => ({
              FullName: spoc.FullName,
              MobileNumber: spoc.MobileNumber,
              DateofBirth: spoc.DateOfBirth,
              Age: spoc.Age,
              Email: spoc.Email,
              Address: spoc.Address,
              Qualification: spoc.Qualification,
              IsPrimary: spoc.IsPrimary,
              IsSecondary: spoc.IsSecondary,
              HospitalId: HospitalId,
              hospitalContactId: spoc.hospitalContactId,
              UpdatedBy: UserId,
            }));

          const createPayload = spocsWithNames
            .filter((spoc) => !spoc.hospitalContactId)
            .map((spoc) => ({
              FullName: spoc.FullName,
              MobileNumber: spoc.MobileNumber,
              DateofBirth: spoc.DateOfBirth,
              Age: spoc.Age,
              Email: spoc.Email,
              Address: spoc.Address,
              Qualification: spoc.Qualification,
              IsPrimary: spoc.IsPrimary,
              IsSecondary: spoc.IsSecondary,
              HospitalId: HospitalId,
              CreatedBy: UserId,
            }));

          try {
            if (updatePayload.length > 0) {
              await fetchData("HospitalContact/seedUpdate", updatePayload);
            }

            if (createPayload.length > 0) {
              await fetchData("HospitalContact/seed", createPayload);
            }
          } catch (error) {
            console.error("Error during SPOC data submission:", error);
          }
        }

        let hospitalServicesDataPayload = selectedHospitalServices.map(
          (service) => ({
            HospitalId: HospitalId,
            CreatedBy: UserId,
            HospitalPoliciesId: service.value,
            DiscountPercentage: discounts[service.value],
          })
        );

        if (hospitalServicesDataPayload.length > 0) {
          await fetchData(
            "HospitalPoliciesProvision/seed",
            hospitalServicesDataPayload
          );
        }

        navigate(`/hospitals/details/${HospitalId}`);
        setSnackbarOpen(true);
      } catch (error) {
        console.error("Error during submission:", error);
        setSnackbarMessage("Submission Failed");
      } finally {
        setSubmitLoading(false);
        setIsSubmitted(true);
        setTimeout(() => {
          setIsSubmitted(false);
        }, 3000);
      }
    }
  };

  const handleFileSelection = (e) => {
    const file = e.target.files[0];
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (file) {
      if (!allowedTypes.includes(file.type)) {
        setFormError((prevError) => ({
          ...prevError,
          MOUFileName: "Invalid file type. Please upload a PDF or DOC file.",
        }));
        setSelectedImage(null);
      } else {
        setFormError((prevError) => ({
          ...prevError,
          MOUFileName: "",
        }));
        setSelectedImage(file);

        const reader = new FileReader();

        // Event listener for successful file read
        reader.onload = () => {
          if (reader.result) {
            setBase64(reader.result.toString());
          }
        };

        // Read file as Data URL (Base64)
        reader.readAsDataURL(file);
      }
    } else {
      setFormError((prevError) => ({
        ...prevError,
        MOUFileName: "Please upload a file.",
      }));
      setSelectedImage(null);
    }
  };

  const handleIOCFileSelection = (e) => {
    const file = e.target.files[0];
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (file) {
      if (!allowedTypes.includes(file.type)) {
        setFormError((prevError) => ({
          ...prevError,
          iocFile: "Invalid file type. Please upload a PDF or DOC file.",
        }));
        setSelectedIOCFile(null);
      } else {
        setFormError((prevError) => ({
          ...prevError,
          iocFile: "",
        }));
        setSelectedIOCFile(file);

        const reader = new FileReader();

        // Event listener for successful file read
        reader.onload = () => {
          if (reader.result) {
            setIOCBase64(reader.result.toString());
          }
        };

        // Read file as Data URL (Base64)
        reader.readAsDataURL(file);
      }
    } else {
      setFormError((prevError) => ({
        ...prevError,
        iocFile: "Please upload a file.",
      }));
      setSelectedIOCFile(null);
    }
  };

  const handleFileSelectionLogo = (e) => {
    const file = e.target.files[0];
    const allowedTypes = [
      "image/jpeg", // JPEG and JPG images
      "image/png", // PNG images
      "image/gif", // GIF images
      "image/webp", // WEBP images
      "image/bmp", // BMP images
      "image/tiff", // TIFF images
      "image/svg+xml", // SVG images
    ];

    const maxFileSize = 5 * 1024 * 1024; // 5MB in bytes

    if (file) {
      if (!allowedTypes.includes(file.type)) {
        setFormError((prevError) => ({
          ...prevError,
          Image: "Invalid file type. Please upload a PDF or DOC file.",
        }));
        setSelectedLogoImage(null);
      } else if (file.size > maxFileSize) {
        setFormError((prevError) => ({
          ...prevError,
          Image: "File size exceeds 5MB. Please upload a smaller file.",
        }));
        setSelectedLogoImage(null);
      } else {
        setFormError((prevError) => ({
          ...prevError,
          Image: "",
        }));
        setSelectedLogoImage(file);

        const reader = new FileReader();

        // Event listener for successful file read
        reader.onload = () => {
          if (reader.result) {
            setLogoBase64(reader.result.toString());
          }
        };

        // Read file as Data URL (Base64)
        reader.readAsDataURL(file);
      }
    } else {
      setFormError((prevError) => ({
        ...prevError,
        Image: "Please upload a file.",
      }));
      setSelectedLogoImage(null);
    }
  };

  const handleFileUpload = async (HospitalId) => {
    try {
      const formData = new FormData();
      const content = base64.split("base64,");

      formData.append("HospitalId", HospitalId);
      formData.append("MOUFileName", selectedImage);
      formData.append("FileContent", content[1]);

      const response = await uploadImage("Hospital/upload", formData);

      return response;
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  const handleIOCFileUpload = async (HospitalId) => {
    try {
      const formData = new FormData();
      const content = iocBase64.split("base64,");

      formData.append("HospitalId", HospitalId);
      formData.append("MOUFileName", selectedIOCFile);
      formData.append("FileContent", content[1]);
      formData.append("FileType", "IOCFile");

      const response = await uploadImage("Hospital/upload", formData);

      return response;
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  const handleLogoUpload = async (HospitalId) => {
    try {
      const content = logoBase64.split("base64,");
      const response = await fetchData("Hospital/imageupload", {
        hospitalId: HospitalId,
        image: content[1],
      });

      return response;
    } catch (error) {
      console.error("Error uploading logo:", error);
    }
  };
  const handleImageUpload = async (HospitalId) => {
    try {
      if (!selectedImages || selectedImages.length === 0) {
        return;
      }
      const response = await fetchData("Hospital/MultipleHospitalImageUpload", {
        hospitalId: HospitalId,
        UserId: UserId,
        images: ["imagesBase64"],
      });
      return response;
    } catch (error) {
      console.error("Error uploading images:", error);
    }
  };

  const handleAdditionalImage = async (HospitalId) => {
    try {
      if (selectedAdditionalImages.length === 0) {
        console.error("No images selected!");
        return;
      }
      const response = await fetchData(
        "Hospital/MultipleHospitalAdditionalImageUpload",
        {
          hospitalId: HospitalId,
          UserId: UserId,
          images: ["imagesBase64"],
        }
      );

      return response;
    } catch (error) {
      console.error("Error uploading images:", error);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleFileSelectionImage = (event) => {
    const files = Array.from(event.target.files);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        const base64String = reader.result;

        setSelectedImages((prevImages) => [
          ...(prevImages || []),
          { id: base64String, file },
        ]);
      };
    });
  };

  const removeImage = (id) => {
    setSelectedImages((prevImages) =>
      prevImages.filter((image) => image.id !== id)
    );
  };

  const handleFileaAddtionalImage = (event) => {
    if (!event.target.files) return;

    const files = Array.from(event.target.files);
    const newImages = files.map((file) => ({
      id: URL.createObjectURL(file),
      file: file,
    }));

    setSelectedAdditionalImages((prev) => [...prev, ...newImages]); // Append new images
  };
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Remove Image
  const removeAdditionalImage = (id) => {
    setSelectedAdditionalImages((prev) =>
      prev.filter((image) => image.id !== id)
    );
  };
  const renderFilePreview = () => {
    if (selectedImage instanceof File) {
      const fileName = selectedImage.name;

      return (
        <div>
          <a
            href={`https://mouBucketName.s3.ap-south-1.amazonaws.com/${fileName}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {fileName}
          </a>
        </div>
      );
    } else if (typeof selectedImage === "string") {
      const fileUrl = mocUrl + selectedImage;
      const fileName = selectedImage.split("/").pop();

      return (
        <div>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            {fileName}
          </a>
        </div>
      );
    }
    return null;
  };

  const renderIOCFilePreview = () => {
    if (selectedIOCFile instanceof File) {
      const fileName = selectedIOCFile.name;

      return (
        <div>
          <a
            href={`https://mouBucketName.s3.ap-south-1.amazonaws.com/${fileName}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {fileName}
          </a>
        </div>
      );
    } else if (typeof selectedIOCFile === "string") {
      const fileUrl = mocUrl + selectedIOCFile;
      const fileName = selectedIOCFile.split("/").pop();

      return (
        <div>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            {fileName}
          </a>
        </div>
      );
    }
    return null;
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

  const calculateDOBFromAge = (age) => {
    const today = new Date();
    return new Date(today.setFullYear(today.getFullYear() - age))
      .toISOString()
      .split("T")[0];
  };
  const handleInputChange = (formType, index, field, value) => {
    if (formType === "doctorDetails") {
      const updatedDoctorDetails = [...doctorDetails];

      if (field === "Age") {
        updatedDoctorDetails[index].Age = value;
        updatedDoctorDetails[index].DateofBirth = value
          ? calculateDOBFromAge(parseInt(value))
          : "";
      } else if (field === "DateofBirth") {
        updatedDoctorDetails[index].DateofBirth = value;
        updatedDoctorDetails[index].Age = value ? calculateAge(value) : "";
      } else {
        updatedDoctorDetails[index][field] = value;
      }

      setDoctorDetails(updatedDoctorDetails);
    } else if (formType === "spocFormData") {
      const updatedSpocFormData = [...spocFormData];
      if (field === "Age") {
        updatedSpocFormData[index].Age = value;
        updatedSpocFormData[index].DateOfBirth = value
          ? calculateDOBFromAge(parseInt(value))
          : "";
      } else if (field === "DateOfBirth") {
        updatedSpocFormData[index].DateOfBirth = value;
        updatedSpocFormData[index].Age = value ? calculateAge(value) : "";
      } else {
        updatedSpocFormData[index][field] = value;
      }
      setSpocFormData(updatedSpocFormData);
    }
  };

  const handleServiceChange = (index, selectedServices) => {
    const updatedDoctorDetails = [...doctorDetails];

    updatedDoctorDetails[index].Services = selectedServices.map((service) => ({
      ...service,
      DoctorServicesProvisionId: service.DoctorServicesProvisionId || null,
    }));

    setDoctorDetails(updatedDoctorDetails);
  };

  const handleDiscountChange = (id, value) => {
    setDiscounts((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const renderImagePreview = () => {
    if (selectedLogoImage instanceof File) {
      const fileName = selectedLogoImage.name;

      return (
        <div>
          <a
            href={`https://mouBucketName.s3.ap-south-1.amazonaws.com/${fileName}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {fileName}
          </a>
        </div>
      );
    } else if (typeof selectedLogoImage === "string") {
      const fileUrl = imageUrl + selectedLogoImage;
      const fileName = selectedLogoImage.split("/").pop();

      return (
        <div>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            {fileName}
          </a>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div className="App">
        <form onSubmit={onSubmitHandler}>
          {/*className="mx-2" onSubmit={onSubmitHandler} style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}*/}
          <div>
            <div>
              <div>
                
                  {/* Left Panel - Hospital Information */}
                  <div className="col-md-12 mb-2">
                    <div className="card border-0 shadow-sm h-100">
                      <div
                        className="card-header p-3 text-white"
                        style={{
                          background:
                            "linear-gradient(to right, #1976D2, #0D47A1)",
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
                            <i className="bx bx-plus-medical text-primary"></i>
                          </div>
                          <h5 className="mb-0 fw-bold text-white">
                            HOSPITAL INFORMATION
                          </h5>
                        </div>
                      </div>
                      <div className="card-body p-4">
                        <div className="row">
                          {/* Hospital Name */}
                          <div className="col-md-6 mb-4">
                            <label
                              htmlFor="HospitalName"
                              className="form-label fw-bold mb-2 text-start w-100"
                            >
                              Hospital Name{" "}
                              <span className="text-danger">*</span>
                            </label>
                            <div className="input-group">
                              <span
                                className="input-group-text"
                                style={{ backgroundColor: "#ECEFF1" }}
                              >
                                <i className="bx bx-building-house text-primary"></i>
                              </span>
                              <input
                                className="form-control py-2"
                                type="text"
                                id="HospitalName"
                                placeholder="Enter hospital name"
                                name="HospitalName"
                                maxLength={200}
                                value={formData.HospitalName}
                                onChange={onChangeHandler}
                               
                              />
                            </div>
                            <small className="text-danger d-block text-start">
                              {formError.HospitalName}
                            </small>
                          </div>

                          {/* Hospital Contact */}
                          <div className="col-md-6 mb-4">
                            <label
                              htmlFor="HospitalMobileNumber"
                              className="form-label fw-bold mb-2 text-start w-100"
                            >
                              Hospital Contact{" "}
                              <span className="text-danger">*</span>
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
                                name="HospitalMobileNumber"
                                placeholder="xxxx xxx xxxx"
                                onChange={onChangeHandler}
                                value={formData.HospitalMobileNumber}
                                maxLength={10}
                              />
                            </div>
                            <small className="text-danger d-block text-start">
                              {formError.HospitalMobileNumber}
                            </small>
                          </div>

                          {/* Hospital Landline */}
                          <div className="col-md-6 mb-4">
                            <label
                              htmlFor="HospitalLandLine"
                              className="form-label fw-bold mb-2 text-start w-100"
                            >
                              Hospital Landline
                            </label>
                            <div className="input-group">
                              <span
                                className="input-group-text"
                                style={{ backgroundColor: "#ECEFF1" }}
                              >
                                <i className="bx bxs-phone-call text-primary"></i>
                              </span>
                              <input
                                className="form-control py-2"
                                name="Landline"
                                placeholder="xxxxxxxxxx"
                                onChange={onChangeHandler}
                                value={formData.Landline}
                                maxLength={13}
                              />
                            </div>
                            <small className="text-danger d-block text-start">
                              {formError.Landline}
                            </small>
                          </div>

                          {/* Email */}
                          <div className="col-md-6 mb-4">
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
                                type="text"
                                className="form-control py-2"
                                name="Email"
                                placeholder="example@gmail.com"
                                maxLength={70}
                                onChange={onChangeHandler}
                                value={formData.Email}
                              />
                            </div>
                            <small className="text-danger d-block text-start">
                              {formError.Email}
                            </small>
                          </div>

                          {/* Hospital Website */}
                          <div className="col-md-6 mb-4">
                            <label
                              htmlFor="Website"
                              className="form-label fw-bold mb-2 text-start w-100"
                            >
                              Hospital Website
                            </label>
                            <div className="input-group">
                              <span
                                className="input-group-text"
                                style={{ backgroundColor: "#ECEFF1" }}
                              >
                                <i className="bx bx-globe text-primary"></i>
                              </span>
                              <input
                                type="text"
                                name="Website"
                                className="form-control py-2"
                                placeholder="Website"
                                value={formData.Website}
                                onChange={onChangeHandler}
                              />
                            </div>
                            <small className="text-danger d-block text-start">
                              {formError.Website}
                            </small>
                          </div>

                          {/* Specialization */}
                          <div className="col-md-6 mb-4">
                            <label
                              htmlFor="Specialization"
                              className="form-label fw-bold mb-2 text-start w-100"
                            >
                              Specialization
                            </label>
                            <div className="input-group">
                              <span
                                className="input-group-text"
                                style={{ backgroundColor: "#ECEFF1" }}
                              >
                                <i className="bx bx-health text-primary"></i>
                              </span>
                              <input
                                type="text"
                                placeholder="Specialization"
                                name="Specialization"
                                value={formData.Specialization}
                                onChange={onChangeHandler}
                                className="form-control py-2"
                              />
                            </div>
                            <small className="text-danger d-block text-start">
                              {formError.Specialization}
                            </small>
                          </div>

                          {/* Hospital Logo */}
                          <div className="col-md-6 mb-4">
                            <label className="form-label fw-bold mb-2 text-start w-100">
                              Hospital Logo
                            </label>
                            <div className="input-group">
                              <span
                                className="input-group-text"
                                style={{ backgroundColor: "#ECEFF1" }}
                              >
                                <i className="bx bx-image text-primary"></i>
                              </span>
                              <input
                                className="form-control py-2"
                                type="file"
                                name="Image"
                                onChange={(e) => handleFileSelectionLogo(e)}
                              />
                            </div>
                            {renderImagePreview()}
                            <small className="text-danger d-block text-start">
                              {formError.Image}
                            </small>
                          </div>

                          {/* Hospital Services */}
                          <div className="col-md-6 mb-4">
                            <label
                              htmlFor="select2Success"
                              className="form-label fw-bold mb-2 text-start w-100"
                            >
                              Hospital Services
                            </label>
                            <div className="select2-primary">
                              {hospitalServices && (
                                <MultiSelect
                                  options={hospitalServices}
                                  value={selectedHospitalServices}
                                  onChange={setSelectedHospitalServices}
                                />
                              )}
                            </div>
                          </div>

                          {/* Discounts for Hospital Services */}
                          {selectedHospitalServices.map((service) => {
                            const selectedService =
                              Array.isArray(hospitalServices) &&
                              hospitalServices.find(
                                (h) => h.value === service.value
                              );

                            return selectedService?.isDiscountRequired ? (
                              <div
                                key={service.value}
                                className="col-md-6 mb-4"
                              >
                                <label
                                  htmlFor={`discount-${service.value}`}
                                  className="form-label fw-bold mb-2 text-start w-100"
                                >
                                  {selectedService.label} Discount (%)
                                </label>
                                <div className="input-group">
                                  <span
                                    className="input-group-text"
                                    style={{ backgroundColor: "#ECEFF1" }}
                                  >
                                    <i className="bx bx-discount text-primary"></i>
                                  </span>
                                  <input
                                    type="number"
                                    id={`discount-${service.value}`}
                                    className="form-control py-2"
                                    min="0"
                                    max="100"
                                    placeholder="Enter %"
                                    value={discounts[service.value] || ""}
                                    onChange={(e) =>
                                      handleDiscountChange(
                                        service.value,
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            ) : null;
                          })}

                          {/* Hospital Images */}
                          <div className="col-md-6 mb-4">
                            <label className="form-label fw-bold mb-2 text-start w-100">
                              Hospital Images
                            </label>
                            <div className="input-group">
                              <span
                                className="input-group-text"
                                style={{ backgroundColor: "#ECEFF1" }}
                              >
                                <i className="bx bx-images text-primary"></i>
                              </span>
                              <input
                                className="form-control py-2"
                                type="file"
                                name="Image"
                                multiple
                                accept="image/*"
                                onChange={handleFileSelectionImage}
                              />
                            </div>
                            <div
                              className="image-preview-container mt-2"
                              style={{
                                display: "flex",
                                gap: "10px",
                                flexWrap: "wrap",
                              }}
                            >
                              {selectedImages.length > 0 &&
                                selectedImages.map((image) => (
                                  <div
                                    key={image.id}
                                    style={{
                                      position: "relative",
                                      display: "inline-block",
                                    }}
                                  >
                                    <img
                                      src={image.id}
                                      alt="Uploaded"
                                      style={{
                                        width: "100px",
                                        height: "100px",
                                        objectFit: "cover",
                                        borderRadius: "5px",
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeImage(image.id)}
                                      style={{
                                        position: "absolute",
                                        top: "-5px",
                                        right: "-5px",
                                        background: "red",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "50%",
                                        width: "20px",
                                        height: "20px",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                    >
                                      &times;
                                    </button>
                                  </div>
                                ))}
                            </div>
                          </div>

                          {/* Hospital Additional Images */}
                          <div className="col-md-6 mb-4">
                            <label className="form-label fw-bold mb-2 text-start w-100">
                              Hospital Additional Images
                            </label>
                            <div className="input-group">
                              <span
                                className="input-group-text"
                                style={{ backgroundColor: "#ECEFF1" }}
                              >
                                <i className="bx bx-image-add text-primary"></i>
                              </span>
                              <input
                                className="form-control py-2"
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileaAddtionalImage}
                              />
                            </div>
                            <div
                              className="image-preview-container mt-2"
                              style={{
                                display: "flex",
                                gap: "10px",
                                flexWrap: "wrap",
                              }}
                            >
                              {selectedAdditionalImages.length > 0 &&
                                selectedAdditionalImages.map((image) => (
                                  <div
                                    key={image.id}
                                    style={{
                                      position: "relative",
                                      display: "inline-block",
                                    }}
                                  >
                                    <img
                                      src={image.id}
                                      alt="Uploaded"
                                      style={{
                                        width: "100px",
                                        height: "100px",
                                        objectFit: "cover",
                                        borderRadius: "5px",
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeAdditionalImage(image.id)
                                      }
                                      style={{
                                        position: "absolute",
                                        top: "-5px",
                                        right: "-5px",
                                        background: "red",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "50%",
                                        width: "20px",
                                        height: "20px",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                    >
                                      &times;
                                    </button>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>


                  <div className="col-md-12 mb-3">

                    <div className="card border-0 shadow-sm">
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
                            <i className="bx bx-map text-primary"></i>
                          </div>
                          <h5 className="mb-0 fw-bold text-white">
                            ADDRESS <span className="text-danger"></span>
                          </h5>
                        </div>
                      </div>
                      <div className="card-body p-3">
                        <div className="row">

                          <div className="col-md-6 mb-3">
                            <label
                              htmlFor="AddressLine1"
                              className="form-label fw-bold mb-1 text-start w-100"
                            >
                              Address-1 <span className="text-danger">*</span>
                            </label>
                            <div className="input-group">
                              <span
                                className="input-group-text"
                                style={{ backgroundColor: "#ECEFF1" }}
                              >
                                <i className="bx bx-building text-primary"></i>
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
                            <small className="text-danger d-block text-start">
                              {formError.AddressLine1}
                            </small>
                          </div>

                          {/* Address Line 2 */}
                          <div className="col-md-6 mb-3">
                            <label
                              htmlFor="AddressLine2"
                              className="form-label fw-bold mb-1 text-start w-100"
                            >
                              Address-2
                            </label>
                            <div className="input-group">
                              <span
                                className="input-group-text"
                                style={{ backgroundColor: "#ECEFF1" }}
                              >
                                <i className="bx bx-building-house text-primary"></i>
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

                          {/* State */}
                          <div className="col-md-6 mb-3">
                            <label
                              htmlFor="StateId"
                              className="form-label fw-bold mb-1 text-start w-100"
                            >
                              State <span className="text-danger">*</span>
                            </label>
                            <div className="input-group">
                              <span
                                className="input-group-text"
                                style={{ backgroundColor: "#ECEFF1" }}
                              >
                                <i className="bx bx-map-alt text-primary"></i>
                              </span>
                              <select
                                className="form-select py-2"
                                name="StateId"
                                value={formData.StateId}
                                onChange={onChangeHandler}
                              >
                                <option value="">Select State</option>
                                {states.map((state) => (
                                  <option
                                    key={state.StateId}
                                    value={state.StateId}
                                  >
                                    {state.StateName}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <small className="text-danger d-block text-start">
                              {formError.StateId}
                            </small>
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
                                id="DistrictId"
                                name="DistrictId"
                                value={formData.DistrictId || ""}
                                onChange={(e) => {
                                  const districtId = e.target.value;
                                  

                                  setFormData({
                                    ...formData,
                                    DistrictId: districtId,
                                    MandalName: "",
                                  });
                                }}
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
                              {formError.DistrictId && (
                                <small
                                  className="non-valid d-block text-start"
                                  style={{ color: "red" }}
                                >
                                  {formError.DistrictId}
                                </small>
                              )}
                            </div>
                          </div>

                          {/* City/Town and Mandal in one row */}
                          <div className="col-md-6 mb-3">
                            <label
                              htmlFor="City"
                              className="form-label fw-bold mb-1 text-start w-100"
                            >
                              City/Town <span className="text-danger">*</span>
                            </label>
                            <div className="input-group">
                              <span
                                className="input-group-text"
                                style={{ backgroundColor: "#ECEFF1" }}
                              >
                                <i className="bx bx-city text-primary"></i>
                              </span>
                              <input
                                className="form-control py-2"
                                type="text"
                                id="City"
                                placeholder="Enter City Name"
                                name="City"
                                maxLength={75}
                                value={formData.City}
                                onChange={onChangeHandler}
                              />
                            </div>
                            <small className="text-danger d-block text-start">
                              {formError.City}
                            </small>
                          </div>

                          <div className="col-md-6 mb-3">
                            <label
                              htmlFor="mandalId"
                              className="form-label fw-bold mb-2 text-start w-100"
                            >
                              Mandal <span className="text-danger">*</span>
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
                                id="mandalId"
                                name="Mandal"
                                value={formData.Mandal || ""}
                                onChange={onChangeHandler}
                                disabled={loading || !formData.DistrictId}
                              >
                                <option value="">Select Mandal</option>
                                {filteredMandals.map((mandal) => (
                                  <option
                                    key={mandal.MandalId}
                                    value={mandal.MandalName}
                                  >
                                    {mandal.MandalName}
                                  </option>
                                ))}
                              </select>
                              {formError.mandalId && (
                                <small
                                  className="non-valid d-block text-start"
                                  style={{ color: "red" }}
                                >
                                  {formError.mandalId}
                                </small>
                              )}
                            </div>

                            {formData.DistrictId && (
                              <div className="mt-1">
                                <span
                                  className="text-primary"
                                  style={{
                                    fontSize: "0.75rem",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => setIsAddingMandal(true)}
                                >
                                  <i className="bx bx-plus"></i> Add Mandal
                                </span>
                              </div>
                            )}

                            {/* Add Mandal Input Form */}
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

                         
                          {/* <div className="col-md-6 mb-3">
                            <label
                              htmlFor="villageId"
                              className="form-label fw-bold mb-2 text-start w-100"
                            >
                              Village <span className="text-danger">*</span>
                            </label>
                            <div className="input-group">
                              <span
                                className="input-group-text"
                                style={{ backgroundColor: "#ECEFF1" }}
                              >
                                <i className="bx bx-buildings text-primary"></i>
                              </span>
                              <select
                                className="form-select py-2"
                                id="villageId"
                                name="VillageName"
                                value={formData.VillageName || ""}
                                onChange={handleVillageChange}
                                disabled={loading || !formData.MandalName}
                              >
                                <option value="">Select Village</option>
                                {filteredVillages.map((village) => (
                                  <option
                                    key={village.VillageId}
                                    value={village.VillageName}
                                  >
                                    {village.VillageName}
                                  </option>
                                ))}
                              </select>
                              {formError.villageId && (
                                <small
                                  className="non-valid d-block text-start"
                                  style={{ color: "red" }}
                                >
                                  {formError.villageId}
                                </small>
                              )}
                            </div>

                            
                            {formData.mandalId && (
                              <div className="mt-1">
                                <span
                                  className="text-primary"
                                  style={{
                                    fontSize: "0.75rem",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => setIsAddingVillage(true)}
                                >
                                  <i className="bx bx-plus"></i> Add Village
                                </span>
                              </div>
                            )}

                            
                            {isAddingVillage && (
                              <div className="mt-2 d-flex">
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  placeholder="Enter Village Name"
                                  value={newVillageName}
                                  onChange={(e) =>
                                    setNewVillageName(e.target.value)
                                  }
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
                          </div> */}

                          <div className="col-md-6 mb-3">
                            <label
                              htmlFor="Pincode"
                              className="form-label fw-bold mb-1 text-start w-100"
                            >
                              Pincode <span className="text-danger">*</span>
                            </label>
                            <div className="input-group">
                              <span
                                className="input-group-text"
                                style={{ backgroundColor: "#ECEFF1" }}
                              >
                                <i className="bx bx-code-alt text-primary"></i>
                              </span>
                              <input
                                className="form-control py-2"
                                type="text"
                                name="Pincode"
                                pattern="[0-9]{6}"
                                maxLength="6"
                                id="Pincode"
                                placeholder="eg: 123456"
                                onChange={onChangeHandler}
                                value={formData.Pincode}
                              />
                            </div>
                            <small className="text-danger">
                              {formError.Pincode}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>

                  
                  
           
                    <div className="row">
  <div className="col-md-6">
    <div className="card border-0 shadow-sm mt-3 h-90">
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
          <h5 className="mb-0 fw-bold text-white">
            LOCATION COORDINATES
          </h5>
        </div>
      </div>
      <div className="card-body p-3">
        <div className="row">
          <div className="col-md-4 mb-2">
            <label
              htmlFor="latitude"
              className="form-label fw-bold mb-1 text-start w-100"
            >
              Latitude
            </label>
            <div className="input-group">
              <span
                className="input-group-text"
                style={{ backgroundColor: "#ECEFF1" }}
              >
                <i className="bx bx-map"></i>
              </span>
              <input
                className="form-control py-2"
                type="text"
                id="latitude"
                placeholder="Latitude"
                name="Latitude"
                maxLength={50}
                value={formData.Latitude}
                onChange={onChangeHandler}
              />
            </div>
            <small className="text-danger d-block text-start">
              {formError.Latitude}
            </small>
          </div>

          <div className="col-md-4 mb-2">
            <label
              htmlFor="longitude"
              className="form-label fw-bold mb-1 text-start w-100"
            >
              Longitude
            </label>
            <div className="input-group">
              <span
                className="input-group-text"
                style={{ backgroundColor: "#ECEFF1" }}
              >
                <i className="bx bx-map-pin"></i>
              </span>
              <input
                className="form-control py-2"
                type="text"
                id="longitude"
                placeholder="Longitude"
                name="Longitude"
                maxLength={50}
                value={formData.Longitude}
                onChange={onChangeHandler}
              />
            </div>
            <small className="text-danger d-block text-start">
              {formError.Longitude}
            </small>
          </div>

          <div className="col-md-4 mb-2">
            <label
              htmlFor="mapView"
              className="form-label fw-bold mb-1 text-start w-100"
            >
              Map View
            </label>
            <div className="input-group">
              <span
                className="input-group-text"
                style={{ backgroundColor: "#ECEFF1" }}
              >
                <i className="bx bx-map-alt"></i>
              </span>
              <input
                className="form-control py-2"
                type="text"
                id="mapView"
                placeholder="MapView"
                name="MapView"
                maxLength={150}
                value={formData.MapView}
                onChange={onChangeHandler}
              />
            </div>
            <small className="text-danger d-block text-start">
              {formError.MapView}
            </small>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div className="col-md-6">
    <div className="card border-0 shadow-sm mt-3  mb-3 h-80">
      <div
        className="card-header p-2 text-white"
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
            <i className="bx bx-file text-primary"></i>
          </div>
          <h5 className="mb-0 fw-bold text-white">
            Upload MOU & IOC Files
          </h5>
        </div>
      </div>
      <div className="card-body p-3">
        <div className="row">
          {/* MOU File Input */}
          <div className="col-md-6 col-sm-12 mb-3 text-start">
            <div className="form-group">
              <label className="form-label fw-bold mb-1">
                MOU File Name
              </label>
              {renderFilePreview()}
              <input
                className="form-control py-2"
                type="file"
                name="MOUFileName"
                accept=".pdf, .doc, .docx"
                onChange={(e) => handleFileSelection(e)}
                style={{ marginTop: "10px" }}
              />
              {formError.MOUFileName && (
                <div className="text-danger d-block text-start">
                  {formError.MOUFileName}
                </div>
              )}
            </div>
          </div>

          {/* IOC File Input */}
          <div className="col-md-6 col-sm-12 mb-3 text-start">
            <div className="form-group">
              <label className="form-label fw-bold mb-1">
                IOC File Name
              </label>
              {renderIOCFilePreview()}
              <input
                className="form-control py-2"
                type="file"
                name="iocFile"
                accept=".pdf, .doc, .docx"
                onChange={(e) => handleIOCFileSelection(e)}
                style={{ marginTop: "10px" }}
              />
              {formError.iocFile && (
                <div className="text-danger d-block text-start">
                  {formError.iocFile}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

                {/* Left Panel - Doctor Details */}
                <div className="row" style={{ marginBottom: '0.25rem' }}>
                <div className="col-md-6 pb-2">
                  <div className="card border-0 shadow-sm h-95">
                    <div
                      className="card-header p-3 text-white"
                      style={{
                        background:
                          "linear-gradient(to right, #1976D2, #0D47A1)",
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
                          <i className="bx bx-user-plus text-primary"></i>
                        </div>
                        <h5 className="mb-0 fw-bold text-white">
                          DOCTOR DETAILS
                        </h5>
                      </div>
                    </div>
                    <div className="card-body p-4">
                      {doctorDetails.map((doctor, index) => (
                        <div key={index} className="row">
                          <div className="col-md-6 mb-4">
                            <label className="form-label fw-bold mb-2 text-start w-100">
                              Full Name
                            </label>
                            <div className="input-group">
                              <span
                                className="input-group-text"
                                style={{ backgroundColor: "#ECEFF1" }}
                              >
                                <i className="bx bx-user text-primary"></i>
                              </span>
                              <input
                                type="text"
                                className="form-control py-2"
                                value={doctor.FullName}
                                placeholder="Enter full name"
                                onChange={(e) =>
                                  handleInputChange(
                                    "doctorDetails",
                                    index,
                                    "FullName",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="col-md-6 mb-4">
                            <label className="form-label fw-bold mb-2 text-start w-100">
                              Mobile Number
                            </label>
                            <div className="input-group">
                              <span
                                className="input-group-text"
                                style={{ backgroundColor: "#ECEFF1" }}
                              >
                                <i className="bx bxs-phone text-primary"></i>
                              </span>
                              <input
                                type="text"
                                className="form-control py-2"
                                value={doctor.MobileNumber}
                                maxLength={10}
                                placeholder="Enter mobile number"
                                onChange={(e) =>
                                  handleInputChange(
                                    "doctorDetails",
                                    index,
                                    "MobileNumber",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="col-md-6 mb-4">
                            <label className="form-label fw-bold mb-2 text-start w-100">
                              Date of Birth
                            </label>
                            <div className="input-group">
                              <span
                                className="input-group-text"
                                style={{ backgroundColor: "#ECEFF1" }}
                              >
                                <i className="bx bx-calendar text-primary"></i>
                              </span>
                              <input
                                type="date"
                                className="form-control py-2"
                                value={doctor.DateofBirth}
                                placeholder="Select date of birth"
                                onChange={(e) =>
                                  handleInputChange(
                                    "doctorDetails",
                                    index,
                                    "DateofBirth",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="col-md-6 mb-4">
                            <label className="form-label fw-bold mb-2 text-start w-100">
                              Age
                            </label>
                            <div className="input-group">
                              <span
                                className="input-group-text"
                                style={{ backgroundColor: "#ECEFF1" }}
                              >
                                <i className="bx bx-timer text-primary"></i>
                              </span>
                              <input
                                type="text"
                                className="form-control py-2"
                                value={doctor.Age}
                                placeholder="Enter age"
                                onChange={(e) =>
                                  handleInputChange(
                                    "doctorDetails",
                                    index,
                                    "Age",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="col-md-6 mb-4">
                            <label className="form-label fw-bold mb-2 text-start w-100">
                              Qualification
                            </label>
                            <div className="input-group">
                              <span
                                className="input-group-text"
                                style={{ backgroundColor: "#ECEFF1" }}
                              >
                                <i className="bx bx-certification text-primary"></i>
                              </span>
                              <input
                                type="text"
                                className="form-control py-2"
                                value={doctor.Qualification}
                                placeholder="Enter qualification"
                                onChange={(e) =>
                                  handleInputChange(
                                    "doctorDetails",
                                    index,
                                    "Qualification",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="col-md-6 mb-4">
                            <label className="form-label fw-bold mb-2 text-start w-100">
                              Address
                            </label>
                            <div className="input-group">
                              <span
                                className="input-group-text"
                                style={{ backgroundColor: "#ECEFF1" }}
                              >
                                <i className="bx bx-map text-primary"></i>
                              </span>
                              <input
                                type="text"
                                className="form-control py-2"
                                value={doctor.Address}
                                placeholder="Enter address"
                                onChange={(e) =>
                                  handleInputChange(
                                    "doctorDetails",
                                    index,
                                    "Address",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="col-md-6 mb-4">
                            <label className="form-label fw-bold mb-2 text-start w-100">
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
                                type="email"
                                className="form-control py-2"
                                value={doctor.Email || ""}
                                placeholder="Enter Email"
                                onChange={(e) =>
                                  handleInputChange(
                                    "doctorDetails",
                                    index,
                                    "Email",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="col-md-6 mb-4">
                            <label
                              htmlFor="select2Success"
                              className="form-label fw-bold mb-2 text-start w-100"
                            >
                              Doctor Services
                            </label>
                            <div className="select2-primary">
                              {doctorServices && (
                                <MultiSelect
                                  options={doctorServices}
                                  value={doctor.Services}
                                  onChange={(selected) =>
                                    handleServiceChange(index, selected)
                                  }
                                />
                              )}
                            </div>
                          </div>

                          <div className="col-md-12 text-end mt-2 mb-4">
                            {doctorDetails.length > 1 && (
                              <button
                                className="btn btn-danger btn-sm me-2"
                                onClick={() => handleRemoveDoctor(index)}
                                disabled={doctorDetails.length === 1}
                              >
                                <i className="bx bx-trash me-1"></i>
                                Remove
                              </button>
                            )}
                            {index === doctorDetails.length - 1 && (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={handleAddDoctor}
                              >
                                <i className="bx bx-plus me-1"></i>
                                Add Doctor
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Panel - SPOCs Information */}
                <div className="col-md-6 mb-1">
                  <div className="card border-0 shadow-sm h-100">
                    <div
                      className="card-header p-3 text-white"
                      style={{
                        background:
                          "linear-gradient(to right, #1976D2, #0D47A1)",
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
                          <i className="bx bx-group text-primary"></i>
                        </div>
                        <h5 className="mb-0 fw-bold text-white">
                          SPOCs INFORMATION
                        </h5>
                      </div>
                    </div>
                    <div className="card-body p-4">
                      {spocFormData.map((spoc, index) => (
                        <div key={index} className="row mb-4">
                          <div className="col-md-6 mb-4">
                            <label
                              htmlFor={`FullName-${index}`}
                              className="form-label fw-bold mb-2 text-start w-100"
                            >
                              Full Name
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
                                id={`FullName-${index}`}
                                placeholder="Enter Full Name"
                                name="FullName"
                                maxLength={150}
                                value={spoc.FullName}
                                onChange={(e) =>
                                  handleInputChange(
                                    "spocFormData",
                                    index,
                                    "FullName",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="col-md-6 mb-4">
                            <label
                              htmlFor={`MobileNumber-${index}`}
                              className="form-label fw-bold mb-2 text-start w-100"
                            >
                              Mobile Number
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
                                type="text"
                                id={`MobileNumber-${index}`}
                                placeholder="Enter Mobile Number"
                                name="MobileNumber"
                                maxLength={10}
                                value={spoc.MobileNumber}
                                onChange={(e) =>
                                  handleInputChange(
                                    "spocFormData",
                                    index,
                                    "MobileNumber",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="col-md-6 mb-4">
                            <label
                              htmlFor={`DateOfBirth-${index}`}
                              className="form-label fw-bold mb-2 text-start w-100"
                            >
                              Date Of Birth
                            </label>
                            <div className="input-group">
                              <span
                                className="input-group-text"
                                style={{ backgroundColor: "#ECEFF1" }}
                              >
                                <i className="bx bx-calendar text-primary"></i>
                              </span>
                              <input
                                className="form-control py-2"
                                type="date"
                                id={`DateOfBirth-${index}`}
                                name="DateOfBirth"
                                value={spoc.DateOfBirth}
                                onChange={(e) =>
                                  handleInputChange(
                                    "spocFormData",
                                    index,
                                    "DateOfBirth",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="col-md-6 mb-4">
                            <label
                              htmlFor={`Age-${index}`}
                              className="form-label fw-bold mb-2 text-start w-100"
                            >
                              Age
                            </label>
                            <div className="input-group">
                              <span
                                className="input-group-text"
                                style={{ backgroundColor: "#ECEFF1" }}
                              >
                                <i className="bx bx-timer text-primary"></i>
                              </span>
                              <input
                                className="form-control py-2"
                                type="text"
                                id={`Age-${index}`}
                                name="Age"
                                value={spoc.Age}
                                onChange={(e) =>
                                  handleInputChange(
                                    "spocFormData",
                                    index,
                                    "Age",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="col-md-6 mb-4">
                            <label
                              htmlFor={`Email-${index}`}
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
                                type="email"
                                id={`Email-${index}`}
                                placeholder="Enter Email"
                                name="Email"
                                value={spoc.Email}
                                onChange={(e) =>
                                  handleInputChange(
                                    "spocFormData",
                                    index,
                                    "Email",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="col-md-6 mb-4">
                            <label
                              htmlFor={`Address-${index}`}
                              className="form-label fw-bold mb-2 text-start w-100"
                            >
                              Address
                            </label>
                            <div className="input-group">
                              <span
                                className="input-group-text"
                                style={{ backgroundColor: "#ECEFF1" }}
                              >
                                <i className="bx bx-map text-primary"></i>
                              </span>
                              <input
                                className="form-control py-2"
                                type="text"
                                id={`Address-${index}`}
                                placeholder="Enter Address"
                                name="Address"
                                value={spoc.Address}
                                onChange={(e) =>
                                  handleInputChange(
                                    "spocFormData",
                                    index,
                                    "Address",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="col-md-6 mb-4">
                            <label
                              htmlFor={`Qualification-${index}`}
                              className="form-label fw-bold mb-2 text-start w-100"
                            >
                              Qualification
                            </label>
                            <div className="input-group">
                              <span
                                className="input-group-text"
                                style={{ backgroundColor: "#ECEFF1" }}
                              >
                                <i className="bx bx-certification text-primary"></i>
                              </span>
                              <input
                                className="form-control py-2"
                                type="text"
                                id={`Qualification-${index}`}
                                placeholder="Enter Qualification"
                                name="Qualification"
                                value={spoc.Qualification}
                                onChange={(e) =>
                                  handleInputChange(
                                    "spocFormData",
                                    index,
                                    "Qualification",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="col-md-6 mb-4">
                            <div className="d-flex align-items-center mt-2">
                              <div className="me-4">
                                <label
                                  htmlFor={`IsPrimary-${index}`}
                                  className="form-label fw-bold mb-2 text-start w-100"
                                >
                                  Is Primary
                                </label>
                                <div className="form-check ms-1">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={`IsPrimary-${index}`}
                                    name="IsPrimary"
                                    checked={spoc.IsPrimary}
                                    disabled={spoc.IsSecondary} // Disable Primary if Secondary is checked
                                    onChange={(e) =>
                                      handleInputChange(
                                        "spocFormData",
                                        index,
                                        "IsPrimary",
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <label className="form-check-label" htmlFor={`IsPrimary-${index}`}>
                                    Primary
                                  </label>
                                </div>
                              </div>
                              <div>
                                <label
                                  htmlFor={`IsSecondary-${index}`}
                                  className="form-label fw-bold mb-2 text-start w-100"
                                >
                                  Is Secondary
                                </label>
                                <div className="form-check ms-1">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={`IsSecondary-${index}`}
                                    name="IsSecondary"
                                    checked={spoc.IsSecondary}
                                    disabled={spoc.IsPrimary} // Disable Secondary if Primary is checked
                                    onChange={(e) =>
                                      handleInputChange(
                                        "spocFormData",
                                        index,
                                        "IsSecondary",
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <label className="form-check-label" htmlFor={`IsSecondary-${index}`}>
                                    Secondary
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>


                          <div className="col-md-12 text-end mt-2">
                            {spocFormData.length > 1 && (
                              <button
                                className="btn btn-danger btn-sm me-2"
                                onClick={() => removeSpoc(index)}
                              >
                                <i className="bx bx-trash me-1"></i>
                                Remove
                              </button>
                            )}
                            {index === spocFormData.length - 1 && (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={addNewSpoc}
                              >
                                <i className="bx bx-plus me-1"></i>
                                Add Another SPOC
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              </div>

              {/* <div className="col-md-12 mt-3">
                                <div className="card mt-3">
                                    <div className="card-header mx-2">
                                        <h5 className="card-title">
                                            <b>SPOCs INFORMATION</b>
                                        </h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-6 mb-3" style={{ textAlign: 'left', display: 'block' }}>
                                                <label htmlFor="Spoc1Name" className="form-label">SPOC 1 Name</label>
                                                
                                                <div className="input-group">
                                                    <span className="input-group-text"><i className="bx bx-user"></i></span>
                                                    <input
                                                        className="form-control"
                                                        type="text"
                                                        id="Spoc1Name"
                                                        placeholder="Enter SPOC 1 Name"
                                                        name="Spoc1Name"
                                                        maxLength={150}
                                                        value={formData.Spoc1Name}
                                                        onChange={onChangeHandler}
                                                        style={{ borderRadius: "5px" }}
                                                    />
                                                </div>
                                                <span className='non-valid' style={{ color: 'red' }}>{formError.Spoc1Name}</span>
                                            </div>
                                            <div className="col-md-6 mb-3" style={{ textAlign: 'left', display: 'block' }}>
                                                <label htmlFor="Spoc1Designation" className="form-label">SPOC 1 Designation</label>
                                               
                                                <div className="input-group">
                                                    <span className="input-group-text"><i className="bx bx-briefcase"></i></span>
                                                    <input
                                                        className="form-control"
                                                        type="text"
                                                        id="Spoc1Designation"
                                                        placeholder="Enter SPOC 1 Designation"
                                                        name="Spoc1Designation"
                                                        maxLength={150}
                                                        value={formData.Spoc1Designation}
                                                        onChange={onChangeHandler}
                                                        style={{ borderRadius: "5px" }}
                                                    />
                                                </div>
                                                <span className='non-valid' style={{ color: 'red' }}>{formError.Spoc1Designation}</span>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6 mb-3" style={{ textAlign: 'left', display: 'block' }}>
                                                <label htmlFor="Spoc1ContactNumber" className="form-label">SPOC 1 Contact Number</label>
                                                <div className="input-group">
                                                    <span className="input-group-text"><i className="bx bxs-phone"></i></span>
                                                    <input
                                                        className="form-control"
                                                        type="text"
                                                        id="Spoc1ContactNumber"
                                                        placeholder="Enter SPOC 1 Contact Number"
                                                        name="Spoc1ContactNumber"
                                                        maxLength={10}
                                                        value={formData.Spoc1ContactNumber}
                                                        onChange={onChangeHandler}
                                                        style={{ borderRadius: "5px" }}
                                                    />
                                                </div>
                                                <span className='non-valid' style={{ color: 'red' }}>{formError.Spoc1ContactNumber}</span>
                                            </div>
                                            <div className="col-md-6 mb-3" style={{ textAlign: 'left', display: 'block' }}>
                                                <label htmlFor="Spoc1AlternateContactNumber" className="form-label">SPOC 1 Alternate Contact Number</label>
                                                <div className="input-group">
                                                    <span className="input-group-text"><i className="bx bxs-phone"></i></span>
                                                    <input
                                                        className="form-control"
                                                        type="text"
                                                        id="Spoc1AlternateContactNumber"
                                                        placeholder="Enter SPOC 1 Alternate Contact Number"
                                                        name="Spoc1AlternateContactNumber"
                                                        maxLength={10}
                                                        value={formData.Spoc1AlternateContactNumber}
                                                        onChange={onChangeHandler}
                                                        style={{ borderRadius: "5px" }}
                                                    />
                                                </div>
                                                <span className='non-valid' style={{ color: 'red' }}>{formError.Spoc1AlternateContactNumber}</span>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6 mb-3" style={{ textAlign: 'left', display: 'block' }}>
                                                <label htmlFor="Spoc2Name" className="form-label">SPOC 2 Name</label>
                                                <div className="input-group">
                                                    <span className="input-group-text"><i className="bx bx-user"></i></span>
                                                    <input
                                                        className="form-control"
                                                        type="text"
                                                        id="Spoc2Name"
                                                        placeholder="Enter SPOC 2 Name"
                                                        name="Spoc2Name"
                                                        maxLength={150}
                                                        value={formData.Spoc2Name}
                                                        onChange={onChangeHandler}
                                                        style={{ borderRadius: "5px" }}
                                                    />
                                                </div>
                                                <span className='non-valid' style={{ color: 'red' }}>{formError.Spoc2Name}</span>
                                            </div>
                                            <div className="col-md-6 mb-3" style={{ textAlign: 'left', display: 'block' }}>
                                                <label htmlFor="Spoc2Designation" className="form-label">SPOC 2 Designation</label>
                                                <div className="input-group">
                                                    <span className="input-group-text"><i className="bx bx-briefcase"></i></span>
                                                    <input
                                                        className="form-control"
                                                        type="text"
                                                        id="Spoc2Designation"
                                                        placeholder="Enter SPOC 2 Designation"
                                                        name="Spoc2Designation"
                                                        maxLength={150}
                                                        value={formData.Spoc2Designation}
                                                        onChange={onChangeHandler}
                                                        style={{ borderRadius: "5px" }}
                                                    />
                                                </div>
                                                <span className='non-valid' style={{ color: 'red' }}>{formError.Spoc2Designation}</span>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6 mb-3" style={{ textAlign: 'left', display: 'block' }}>
                                                <label htmlFor="Spoc2ContactNumber" className="form-label">SPOC 2 Contact Number</label>
                                                <div className="input-group">
                                                    <span className="input-group-text"><i className="bx bxs-phone"></i></span>
                                                    <input
                                                        className="form-control"
                                                        type="text"
                                                        id="Spoc2ContactNumber"
                                                        placeholder="Enter SPOC 2 Contact Number"
                                                        name="Spoc2ContactNumber"
                                                        maxLength={10}
                                                        value={formData.Spoc2ContactNumber}
                                                        onChange={onChangeHandler}
                                                        style={{ borderRadius: "5px" }}
                                                    />
                                                </div>
                                                <span className='non-valid' style={{ color: 'red' }}>{formError.Spoc2ContactNumber}</span>
                                            </div>
                                            <div className="col-md-6 mb-3" style={{ textAlign: 'left', display: 'block' }}>
                                                <label htmlFor="Spoc2AlternateContactNumber" className="form-label">SPOC 2 Alternate Contact Number</label>
                                                <div className="input-group">
                                                    <span className="input-group-text"><i className="bx bxs-phone"></i></span>
                                                    <input
                                                        className="form-control"
                                                        type="text"
                                                        id="Spoc2AlternateContactNumber"
                                                        placeholder="Enter SPOC 2 Alternate Contact Number"
                                                        name="Spoc2AlternateContactNumber"
                                                        maxLength={10}
                                                        value={formData.Spoc2AlternateContactNumber}
                                                        onChange={onChangeHandler}
                                                        style={{ borderRadius: "5px" }}
                                                    />
                                                </div>
                                                <span className='non-valid' style={{ color: 'red' }}>{formError.Spoc2AlternateContactNumber}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div> */}

              <div className="col-md-12 mt-0">
                <div className="card border-0 shadow-sm">
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
                        <i className="bx bx-info-circle text-primary"></i>
                      </div>
                      <h5 className="mb-0 fw-bold text-white">
                        ADDITIONAL INFORMATION
                      </h5>
                    </div>
                  </div>
                  <div className="card-body p-3">
                    <div className="row">
                     
                      <div className="col-md-12 mb-3">
                        <label
                          htmlFor="Aarogyasri"
                          className="form-label fw-bold mb-1 text-start w-100"
                        >
                          Aarogyasri
                        </label>
                        <div className="input-group">
                          <span
                            className="input-group-text"
                            style={{ backgroundColor: "#ECEFF1" }}
                          >
                            <i className="bx bx-health text-primary"></i>
                          </span>
                          <input
                            type="text"
                            id="Aarogyasri"
                            name="Aarogyasri"
                            value={formData.Aarogyasri}
                            onChange={onChangeHandler}
                            className="form-control py-2"
                            placeholder="Enter Aarogyasri information"
                          />
                        </div>
                      </div>

                     
                      <div className="col-md-6 mb-3">
                        <label
                          htmlFor="CallToFrontDesk"
                          className="form-label fw-bold mb-1 text-start w-100"
                        >
                          Call to Front Desk
                        </label>
                        <div className="input-group">
                          <span
                            className="input-group-text"
                            style={{ backgroundColor: "#ECEFF1" }}
                          >
                            <i className="bx bx-phone text-primary"></i>
                          </span>
                          <input
                            type="text"
                            id="CallToFrontDesk"
                            name="CallToFrontDesk"
                            value={formData.CallToFrontDesk}
                            onChange={onChangeHandler}
                            className="form-control py-2"
                            placeholder="Enter front desk details"
                          />
                        </div>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label
                          htmlFor="PatientCounsellingFee"
                          className="form-label fw-bold mb-1 text-start w-100"
                        >
                          Resident Counselling Fee
                        </label>
                        <div className="input-group">
                          <span
                            className="input-group-text"
                            style={{ backgroundColor: "#ECEFF1" }}
                          >
                            <i className="bx bx-money text-primary"></i>
                          </span>
                          <input
                            type="text"
                            id="PatientCounsellingFee"
                            name="PatientCounsellingFee"
                            value={formData.PatientCounsellingFee}
                            onChange={onChangeHandler}
                            className="form-control py-2"
                            placeholder="Enter counselling fee"
                          />
                        </div>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label
                          htmlFor="MenuCardForDiagnostics"
                          className="form-label fw-bold mb-1 text-start w-100"
                        >
                          Menu Card for Diagnostics
                        </label>
                        <div className="input-group">
                          <span
                            className="input-group-text"
                            style={{ backgroundColor: "#ECEFF1" }}
                          >
                            <i className="bx bx-list-ul text-primary"></i>
                          </span>
                          <input
                            type="text"
                            id="MenuCardForDiagnostics"
                            name="MenuCardForDiagnostics"
                            value={formData.MenuCardForDiagnostics}
                            onChange={onChangeHandler}
                            className="form-control py-2"
                            placeholder="Enter menu card information"
                          />
                        </div>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label
                          htmlFor="DiscountOnDiagnostics"
                          className="form-label fw-bold mb-1 text-start w-100"
                        >
                          Discount On Diagnostics
                        </label>
                        <div className="input-group">
                          <span
                            className="input-group-text"
                            style={{ backgroundColor: "#ECEFF1" }}
                          >
                            <i className="bx bx-purchase-tag text-primary"></i>
                          </span>
                          <input
                            type="text"
                            id="DiscountOnDiagnostics"
                            name="DiscountOnDiagnostics"
                            value={formData.DiscountOnDiagnostics}
                            onChange={onChangeHandler}
                            className="form-control py-2"
                            placeholder="Enter discount information"
                          />
                        </div>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label
                          htmlFor="IsFreeOPConsultation"
                          className="form-label fw-bold mb-1 text-start w-100"
                        >
                          Is Free OP Consultation
                        </label>
                        <div className="input-group">
                          <span
                            className="input-group-text"
                            style={{ backgroundColor: "#ECEFF1" }}
                          >
                            <i className="bx bx-check-circle text-primary"></i>
                          </span>
                          <input
                            type="text"
                            id="IsFreeOPConsultation"
                            name="IsFreeOPConsultation"
                            value={formData.IsFreeOPConsultation}
                            onChange={onChangeHandler}
                            className="form-control py-2"
                            placeholder="Yes/No"
                          />
                        </div>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label
                          htmlFor="CINNumber"
                          className="form-label fw-bold mb-1 text-start w-100"
                        >
                          CIN Number
                        </label>
                        <div className="input-group">
                          <span
                            className="input-group-text"
                            style={{ backgroundColor: "#ECEFF1" }}
                          >
                            <i className="bx bx-id-card text-primary"></i>
                          </span>
                          <input
                            type="text"
                            id="CINNumber"
                            name="CINNumber"
                            value={formData.CINNumber}
                            onChange={onChangeHandler}
                            className="form-control py-2"
                            placeholder="Enter CIN number"
                          />
                        </div>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label
                          htmlFor="HospitalRegistrationNumber"
                          className="form-label fw-bold mb-1 text-start w-100"
                        >
                          Hospital Registration Number
                        </label>
                        <div className="input-group">
                          <span
                            className="input-group-text"
                            style={{ backgroundColor: "#ECEFF1" }}
                          >
                            <i className="bx bx-building-house text-primary"></i>
                          </span>
                          <input
                            type="text"
                            id="HospitalRegistrationNumber"
                            name="HospitalRegistrationNumber"
                            value={formData.HospitalRegistrationNumber}
                            onChange={onChangeHandler}
                            className="form-control py-2"
                            placeholder="Enter registration number"
                          />
                        </div>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label
                          htmlFor="GSTNumber"
                          className="form-label fw-bold mb-1 text-start w-100"
                        >
                          GST Number
                        </label>
                        <div className="input-group">
                          <span
                            className="input-group-text"
                            style={{ backgroundColor: "#ECEFF1" }}
                          >
                            <i className="bx bx-receipt text-primary"></i>
                          </span>
                          <input
                            type="text"
                            id="GSTNumber"
                            name="GSTNumber"
                            value={formData.GSTNumber}
                            onChange={onChangeHandler}
                            className="form-control py-2"
                            placeholder="Enter GST number"
                          />
                        </div>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label
                          htmlFor="MedicalCounsellationNumber"
                          className="form-label fw-bold mb-1 text-start w-100"
                        >
                          Medical Counsellation Number
                        </label>
                        <div className="input-group">
                          <span
                            className="input-group-text"
                            style={{ backgroundColor: "#ECEFF1" }}
                          >
                            <i className="bx bx-plus-medical text-primary"></i>
                          </span>
                          <input
                            type="text"
                            id="MedicalCounsellationNumber"
                            name="MedicalCounsellationNumber"
                            value={formData.MedicalCounsellationNumber}
                            onChange={onChangeHandler}
                            className="form-control py-2"
                            placeholder="Enter medical counsellation number"
                          />
                        </div>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold mb-1 text-start w-100">
                          Is Agreement Received
                          <span className="text-danger ms-1">*</span>
                        </label>
                        <div className="input-group">
                          <span
                            className="input-group-text"
                            style={{ backgroundColor: "#ECEFF1" }}
                          >
                            <i className="bx bx-file text-primary"></i>
                          </span>
                          <div className="form-control py-2 d-flex align-items-center">
                            <div className="form-check form-check-inline mb-0">
                              <input
                                type="radio"
                                id="IsAgreementReceivedYes"
                                name="IsAgreementReceived"
                                value="Yes"
                                checked={formData.IsAgreementReceived === true}
                                onChange={onChangeHandler}
                                className="form-check-input"
                              />
                              <label
                                htmlFor="IsAgreementReceivedYes"
                                className="form-check-label"
                              >
                                Yes
                              </label>
                            </div>
                            <div className="form-check form-check-inline mb-0">
                              <input
                                type="radio"
                                id="IsAgreementReceivedNo"
                                name="IsAgreementReceived"
                                value="No"
                                checked={formData.IsAgreementReceived === false}
                                onChange={onChangeHandler}
                                className="form-check-input"
                              />
                              <label
                                htmlFor="IsAgreementReceivedNo"
                                className="form-check-label"
                              >
                                No
                              </label>
                            </div>
                          </div>
                        </div>
                        {formError.IsAgreementReceived && (
                          <div className="invalid-feedback d-block text-start">
                            {formError.IsAgreementReceived}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </div>
              <div className="form-group" style={{ marginTop: "20px" }}>
                <div className="d-flex justify-content-between">
                  <button
                    className="btn btn-md btn-primary"
                    type="submit"
                    style={{
                      backgroundColor: "#5cb85c",
                      borderColor: "#5cb85c",
                      color: "#fff",
                      borderRadius: "5px",
                      padding: "8px 20px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      minWidth: "100px",
                      minHeight: "40px",
                    }}
                  >
                    {submitLoading ? (
                      <div className="spinner-border text-white" role="status">
                        <span className="sr-only">Loading...</span>
                      </div>
                    ) : (
                      "Submit"
                    )}
                  </button>
                  {/* Cancel and Reset buttons on the right */}
                  <div>
                    <button
                      className="btn btn-md btn-primary"
                      type="reset"
                      onClick={handleBackToView}
                      style={{
                        marginRight: "10px",
                        borderRadius: "5px",
                        padding: "8px 20px",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>

                    <button
                      className="btn btn-md btn-danger"
                      type="reset"
                      style={{
                        borderRadius: "5px",
                        padding: "8px 20px",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                      onClick={resetForm}
                    >
                      Reset
                    </button>
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
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
