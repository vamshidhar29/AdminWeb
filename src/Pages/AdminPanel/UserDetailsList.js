import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "../../Layout/Layout";
import { Button, TextField, MenuItem, Grid, Box, Typography, Snackbar, IconButton, Alert, CircularProgress, FormControl, InputLabel, Select, } from "@mui/material";
import {
    fetchData,
    fetchUpdateData,
    fetchDeleteData,
    fetchAllData,
} from "../../helpers/externapi";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import Flatpickr from 'react-flatpickr';


export default function UserDetails() {
    const UserId = localStorage.getItem("UserId");
    const [editableFields, setEditableFields] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [formType, setFormType] = useState("user");
    const [formVisible, setFormVisible] = useState(false);
    const [errors, setErrors] = useState({});
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [confirmationData, setConfirmationData] = useState({});
    const [isSnackbarSuccess, setIsSnackbarSuccess] = useState(true);
    const [selectedRouteMaps, setSelectedRouteMaps] = useState([]);
    const [userFormError, setUserFormError] = useState("");
    const [stateDropdown, setStateDropdown] = useState([]);
    const [districtDropdown, setDistrictDropdown] = useState([]);
    const [mandals, setMandals] = useState([]);
    const [villages, setVillages] = useState([]);
    const [selectedDistrictId, setSelectedDistrictId] = useState(null);
    const [selectedStateId, setSelectedStateId] = useState(null);
    const { Id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [isEditing, setIsEditing] = useState(false);
    const [userRoleDropdown, setUserRoleDropdown] = useState([]);
    const [routeMapMultiSelect, setRouteMapMultiSelect] = useState();
    const [originalData, setOriginalData] = useState({});
    const [allUsers, setAllUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [userFilterCriteria, setUserFilterCriteria] = useState([]);
    const [currentPageUserList, setCurrentPageUserList] = useState(1);
    const [perPageUserList, setPerPageUserList] = useState(10);
    const [formErrors, setFormErrors] = useState({});
    const [snackbarType, setSnackbarType] = useState("success");
    const [imageUrl, setImageUrl] = useState("");
    const [logoBase64, setLogoBase64] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({
        EmployeeId: "",
        Name: "",
        UserName: "",
        EmployeeCode: "",
        MobileNumber: "",
        EmailId: "",
        UserRoleId: "",
        RoleType: "",
        FullName: "",
        PassWord: "",
        // RouteMapId: [],
        ReportingTo: "",
        Designation: "",
        Gender: "",
        DateofBirth: "",
        Age: "",
        AddressLine1: "",
        AddressLine2: "",
        Village: "",
        VillageId: "",
        Mandal: "",
        City: "",
        Pincode: "",
        StateId: "",
        DistrictId: "",
        AadhaarNumber: "",
        WhatsAppMobileNumber: "",
        UserRoleId: ""
    });
    useEffect(() => {
        if (user) {

            setFormData({
                EmployeeId: user.EmployeeId || "",
                Name: user.Name || "",
                UserName: user.UserName || "",
                EmployeeCode: user.EmployeeCode || "",
                MobileNumber: user.MobileNumber || "",
                EmailId: user.EmailId || "",
                UserRoleId: user.UserRoleId || "",
                FullName: user.FullName || "",
                Pincode: user.Pincode || "",
                PassWord: user.PassWord || "",
                // RouteMapId: user.RouteMapId || "",
                ReportingTo: user.ReportingTo || "",
                Designation: user.Designation || "",
                Gender: user.Gender || "",
                DateofBirth: user.DateofBirth || "",
                Age: user.Age || "",
                AddressLine1: user.AddressLine1 || "",
                AddressLine2: user.AddressLine2 || "",
                Village: user.Village || "",
                VillageId: user.VillageId || "",
                Mandal: user.Mandal || "",
                MandalId: user.MandalId || "",
                City: user.City || "",
                Pincode: user.Pincode || "",
                StateId: user.StateId || "",
                DistrictId: user.DistrictId || "",
                AadhaarNumber: user.AadhaarNumber || "",
                WhatsAppMobileNumber: user.WhatsAppMobileNumber || "",
            });
        } else {
            navigate(`/adminpanel/userdetails/${Id}`);
        }
    }, [user, navigate]);
    useEffect(() => {
        if (user && Object.keys(user).length > 0) {

            const updatedFormData = {
                EmployeeId: user.EmployeeId || "",
                Name: user.Name || "",
                UserName: user.UserName || "",
                EmployeeCode: user.EmployeeCode || "",
                MobileNumber: user.MobileNumber || "",
                EmailId: user.EmailId || "",
                UserRoleId: user.UserRoleId || "",
                FullName: user.FullName || "",
                PassWord: user.PassWord || "",
                // RouteMapId: user.RouteMapId || [],
                ReportingTo: user.ReportingTo || "",
                Designation: user.Designation || "",
                Gender: user.Gender || "",
                DateofBirth: user.DateofBirth || "",
                Age: user.Age || "",
                AddressLine1: user.AddressLine1 || "",
                AddressLine2: user.AddressLine2 || "",
                Village: user.Village || "",
                VillageId: user.VillageId || "",
                Mandal: user.Mandal || "",
                MandalId: user.MandalId || "",
                City: user.City || "",
                Pincode: user.Pincode || "",
                StateId: user.StateId || "",
                DistrictId: user.DistrictId || "",
                AadhaarNumber: user.AadhaarNumber || "",
                WhatsAppMobileNumber: user.WhatsAppMobileNumber || user.MobileNumber || "",
            };

            setFormData(updatedFormData);
            if (user.StateId) {
                // Load districts based on state
                getDistricts(user.StateId);
            }
            if (user.DistrictId) {
                getMandals(user.DistrictId);
            }
            setOriginalData(updatedFormData);
        } else if (Id) {
            navigate(`/adminpanel/userdetails/${Id}`);
        }
    }, [user, navigate, Id]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prevFormData) => {
            let updatedData = {
                ...prevFormData,
                [name]: value,
            };

            let error = "";

            if (name === "StateId") {
                setSelectedStateId(value);
                updatedData.DistrictId = "";
            }

            if (name === "Age") {
                const ageValue = value.trim();
                const ageNumber = Number(ageValue);  // Using Number() instead of parseInt()

                if (name === "Age") {
                    const ageValue = value.trim();
                    const ageNumber = Number(ageValue);

                    // Validate if it's a whole number and within range
                    if (!isNaN(ageNumber) && Number.isInteger(ageNumber) && ageNumber >= 18 && ageNumber <= 70) {
                        const today = new Date();
                        const birthYear = today.getFullYear() - ageNumber;
                        const dob = `${birthYear}-01-01`;

                        updatedData = { ...updatedData, DateofBirth: dob };
                        // Clear error when valid
                        setFormErrors(prev => ({ ...prev, Age: "" }));
                    } else {
                        error = "User must be between 18 to 70 years only";
                        updatedData = { ...updatedData, DateofBirth: "" };
                        // Set error in state
                        setFormErrors(prev => ({ ...prev, Age: error }));
                    }
                }
            }
            if (name === "DateofBirth") {
                const age = calculateAge(value);
                if (age >= 18 && age <= 70) {
                    updatedData = { ...updatedData, Age: age.toString() };
                } else {
                    error = "User must be between 18 to 70 years only";
                    updatedData = { ...updatedData, Age: "" };
                }
            }

            return updatedData;
        });
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData(prev => ({
                ...prev,
                UserImage: file
            }));
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData(user || {});
    };
    useEffect(() => {
        if (user) {
            setOriginalData(user);
        }
    }, [user]);
    const getUsers = async () => {
        try {
            const skip = (currentPageUserList - 1) * perPageUserList;
            const take = perPageUserList;

            let usersData;

            setLoading(true);
            if (userFilterCriteria.length > 0) {
                usersData = await fetchData("lambdaAPI/Employee/GetMultipleDataByFilter", {
                    skip,
                    take,
                    filter: userFilterCriteria,
                });
            } else {
                usersData = await fetchData("lambdaAPI/Employee/GetEmployees", { skip, take });
            }

            const allUsers = await fetchData("lambdaAPI/Employee/GetEmployees", { skip: 0, take: 0 });


            setUsers(usersData);
            setAllUsers(allUsers);
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getUsers();

    }, [
        currentPageUserList,
        perPageUserList,
        userFilterCriteria,
    ]);

    const EditUser = async () => {
        try {
            setLoading(true);
            const changedFields = {};
            let hasChanges = false;
            let imageUploadSuccess = true;

            // Process regular fields
            Object.keys(formData).forEach(key => {
                if (key !== 'UserImage' &&
                    formData[key] !== originalData[key] &&
                    formData[key] !== undefined &&
                    formData[key] !== "") {
                    changedFields[key] = formData[key];
                    hasChanges = true;
                }
            });

            // Check if image needs to be uploaded
            if (formData.UserImage && typeof formData.UserImage !== 'string') {
                try {
                    await handleFileUpload(formData.UserImage);
                    // Image is handled separately, but we'll still count it as a change
                    hasChanges = true;
                } catch (error) {
                    console.error('Error uploading image:', error);
                    imageUploadSuccess = false;
                }
            }

            if (!hasChanges) {
                setLoading(false);
                setSnackbarType("warning");
                setSnackbarMessage("No changes detected");
                setSnackbarOpen(true);
                return false;
            }

            if (!imageUploadSuccess) {
                setSnackbarType("error");
                setSnackbarMessage("Image upload failed, but other changes will be processed");
                setSnackbarOpen(true);
            }

            // If there are text field changes, process them
            if (Object.keys(changedFields).length > 0) {
                const fieldNameMapping = {
                    "UserName": "Name",
                    "ReportingId": "ReportingTo",
                };

                const updatePayload = Object.keys(changedFields).map(field => {
                    const columnName = fieldNameMapping[field] || field;

                    return {
                        columnName: columnName,
                        columnValue: changedFields[field],
                        tableName: "Employee",
                        tableId: Id,
                        UpdatedBy: UserId
                    };
                });

                const updateResponse = await fetchUpdateData("lambdaAPI/Update/CommonUpdate", updatePayload);

                // Log the full response for debugging


                // The check might need to be different based on your API's response format
                if (!updateResponse || updateResponse.error) {
                    setSnackbarType("error");
                    setSnackbarMessage("Failed to update text fields: " + (updateResponse?.message || "Unknown error"));
                    setSnackbarOpen(true);
                    return false;
                }

                setOriginalData(prev => ({ ...prev, ...changedFields }));
            }

            setSnackbarType("success");
            setSnackbarMessage("User information updated successfully!");
            setSnackbarOpen(true);
            return true;

        } catch (error) {
            setSnackbarType("error");
            setSnackbarMessage("Update failed. Please try again.");
            setSnackbarOpen(true);
            return false;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const getStateDropdown = async () => {
            try {
                const statesData = await fetchData("States/all", { UserId });
                setStateDropdown(statesData);
            } catch (error) {
                console.error("Error fetching states:", error);
            } finally {
                setLoading(false);
            }
        };

        if (UserId) getStateDropdown();
    }, [UserId]);

    const getDistricts = async (stateId) => {
        try {
            const districtsData = await fetchAllData(
                `Districts/GetByStateId/${stateId}`
            );
            setDistrictDropdown(districtsData);
        } catch (error) {
            console.error("Error fetching districts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedStateId) getDistricts(selectedStateId);
    }, [selectedStateId]);

    const getMandals = async (districtId) => {
        try {
            setLoading(true);
            const mandalsData = await fetchAllData(
                `Mandal/GetMandalsByDistrictId/${districtId}`
            );
            setMandals(mandalsData);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching mandals:", error);
            setLoading(false);
        }
    };
    useEffect(() => {
        if (formData.DistrictId) {
            getMandals(formData.DistrictId);
        }
    }, [formData.DistrictId]);

    useEffect(() => {
        const getVillages = async () => {
            if (formData.Mandal) {
                setLoading(true);
                try {
                    const villagesData = await fetchAllData(
                        `Village/GetVillagesByMandalId/${formData.Mandal}`
                    );
                    setVillages(villagesData || []);
                } catch (error) {
                    console.error("Error fetching villages:", error);
                    setVillages([]);
                } finally {
                    setLoading(false);
                }
            }
        };
        getVillages();
    }, [formData.Mandal]);

    useEffect(() => {
        const getMocUrl = async () => {
            const response = await fetchData('ConfigValues/all', { skip: 0, take: 0 });
            const imageUrl = response && response.length > 0 && response.find(val => val.ConfigKey === "userImagesBucketlink");
            setImageUrl(imageUrl.ConfigValue);
        };
        getMocUrl();
    }, []);


    const getUserRoleDropdown = async () => {

        try {
            setLoading(true);
            const response = await fetchData("UserRoles/all", { skip: 0, take: 0 });
            if (Array.isArray(response)) {
                setUserRoleDropdown(response);
            } else {
                setUserRoleDropdown([]);
            }
        } catch (error) {
            setUserRoleDropdown([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getUserRoleDropdown();
        // getRouteName();
    }, []);

    // const getRouteName = async () => {
    //     setLoading(true);
    //     const routename = await fetchData("RouteMap/all", { skip: 0, take: 0 });
    //     const routeArray = routename.map((item) => ({
    //         label: item.RouteName,
    //         value: item.RouteMapId,
    //     }));
    //     setRouteMapMultiSelect(routeArray);
    //     setLoading(false);
    // };

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

    const onChangeHandler = (event) => {
        const { name, value } = event.target;

        setFormData((prevFormData) => {
            let updatedData = {
                ...prevFormData,
                [name]: value,
            };

            let error = "";

            if (name === "StateId") {
                setSelectedStateId(value);
                updatedData.DistrictId = "";
            }

            if (name === "Age" && value) {
                const today = new Date();
                const birthYear = today.getFullYear() - parseInt(value, 10);
                const month = String(today.getMonth() + 1).padStart(2, "0");
                const day = String(today.getDate()).padStart(2, "0");
                updatedData["DateofBirth"] = `${birthYear}-${month}-${day}`;
            } else if (name === "DateofBirth" && value) {
                const dob = new Date(value);
                const today = new Date();
                let computedAge = today.getFullYear() - dob.getFullYear();
                const m = today.getMonth() - dob.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                    computedAge--;
                }
            }

            return updatedData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm(formData);
        if (Object.keys(validationErrors).length !== 0) {
            setErrors(validationErrors);
            setSnackbarMessage("Please fix all form errors before submitting.");
            setSnackbarOpen(true);
            return;
        }
        setLoading(true);
        try {
            if (formType === "user" && isEditMode && editableFields.length > 0) {
                const payload = editableFields.map(field => ({
                    columnName: field === "Name" ? "Name" : field,
                    columnValue: formData[field],
                    tableName: "Employee",
                    tableId: formData.EmployeeId,
                }));

                const updateResponse = await fetchUpdateData("lambdaAPI/Update/CommonUpdate", payload);
                if (updateResponse && updateResponse.status) {
                    const refreshData = await fetchUserData();

                    setSnackbarMessage("User updated successfully!");
                    setSnackbarOpen(true);
                    setEditableFields([]);
                    setIsEditMode(false);
                    setFormVisible(false);

                } else {
                    console.error("Update failed:", updateResponse);
                    setSnackbarMessage("Update failed: " + (updateResponse?.data || "Unknown error"));
                    setSnackbarOpen(true);
                }
            }
            else if (formType === "user" && !isEditMode) {
                const newUserData = await fetchData("lambdaAPI/Employee/add", user);
                if (newUserData && newUserData.status && newUserData.data && newUserData.data.employeeId) {
                    const UserId = newUserData.data.employeeId;
                    let routeMapData = selectedRouteMaps.map(routemap => ({
                        userId: UserId,
                        routeMapId: routemap.value,
                    }));

                    if (routeMapData.length === 0) {
                        routeMapData = [{ userId: UserId, routeMapId: 0 }];
                    }

                    const routeMapResponse = await fetchData("UserRouteMap/seed", routeMapData);
                    if (selectedImage) {
                        const imageResponse = await handleFileUpload(UserId);
                    }
                    const refreshData = await fetchUserData();
                    setSnackbarMessage("User added successfully!");
                    setSnackbarOpen(true);
                    resetForm();
                } else {
                    const errorMsg = newUserData && newUserData.data ? newUserData.data : "Failed to create user";
                    console.error("User creation failed:", errorMsg);
                    setUserFormError(errorMsg);
                    setSnackbarMessage("Error: " + errorMsg);
                    setSnackbarOpen(true);
                }
            }
            else if (formType === "userRoles") {

                let response;
                if (isEditMode) {
                    const roleData = {
                        userRoleId: formData.UserRoleId,
                        roleType: formData.RoleType,
                    };

                    response = await fetchUpdateData("UserRoles/update", roleData);

                    setSnackbarMessage("User Roles updated Successfully!");
                } else {
                    const roleData = {
                        roleType: formData.RoleType,
                    };
                    response = await fetchData("UserRoles/add", roleData);
                    setSnackbarMessage("User Roles Added Successfully!");
                }

                if (response && response.status) {
                    const refreshData = await fetchUserData();
                    setSnackbarOpen(true);
                    resetForm();
                } else {
                    console.error("User role operation failed:", response);
                    setSnackbarMessage("Error: " + (response?.data || "Operation failed"));
                    setSnackbarOpen(true);
                }
            }
        } catch (error) {
            console.error("Error in form submission:", error);
            setSnackbarMessage("An error occurred. Please try again.");
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };
    const validateForm = (data) => {
        const errors = {};
        if (formType === "user") {
            if (!data.Name || data.Name.trim() === "") {
                errors.Name = "name is required";
            }

            if (!data.UserRoleId) {
                errors.UserRoleId = "User role is required";
            }

            if (!data.MobileNumber) {
                errors.MobileNumber = "Mobile number is required";
            } else if (!/^\d{10}$/.test(data.MobileNumber)) {
                errors.MobileNumber = "Mobile number must be 10 digits";
            }

            if (data.EmailId && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.EmailId)) {
                errors.EmailId = "Invalid email format";
            }
        } else if (formType === "userRoles") {
            if (!data.RoleType || data.RoleType.trim() === "") {
                errors.RoleType = "Role type is required";
            }
        }

        return errors;
    };

    const resetForm = () => {
        setFormData({
            UserId: "",
            EmployeeId: "",
            EmployeeCode: "",
            MobileNumber: "",
            EmailId: "",
            UserRoleId: "",
            UserName: "",
            FullName: "",
            Pincode: "",
            PassWord: "",
            // RouteMapId: [],
            ReportingTo: "",
            Designation: "",
            Gender: "",
            DateofBirth: "",
            Age: "",
            AddressLine1: "",
            AddressLine2: "",
            Village: "",
            VillageId: "",
            Mandal: "",
            MandalId: "",
            City: "",
            Pincode: "",
            StateName: "",
            StateId: "",
            DistrictName: "",
            DistrictId: "",
            AadhaarNumber: "",
            WhatsAppMobileNumber: "",
            JoinedBy: "",
            Name: "",
        });
        setSelectedRouteMaps([]);
        setSelectedImage(null);
        setIsEditMode(false);
        setFormVisible(false);
        setUserFormError("");
        setErrors({});
    };
    const fetchUserData = async () => {
        setLoading(true);
        try {
            if (!Id) {
                console.error("Invalid ID provided:", Id);
                setUser(null);
                setLoading(false);
                return;
            }
            const response = await fetchAllData(`lambdaAPI/Employee/GetById/${Id}`);

            if (response) {
                setUser(response[0]);
                setUser(response[0]);
            }
        } catch (error) {
            console.error("Error in fetchUserData:", error);

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const handleEdit = () => {
        setIsEditing(true);
    };
    const showNotification = (msg, type = "info") => {

    };
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    };
    // Correct parameter order: file first, userId second
    // const handleImageChange = (e) => {
    //     e.preventDefault(); // Prevent any default behavior
    //     const file = e.target.files[0];
    //     if (file) {
    //         handleFileUpload(file);
    //     }
    // };

    const handleRemoveImage = () => {
        setUser({ ...user, UserImage: null });
        const fileInput = document.getElementById("UserImage");
        if (fileInput) fileInput.value = "";
    };

    const handleFileUpload = async (file) => {
        try {
            setIsUploading(true);
            const fileToBase64 = (file) => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = (error) => reject(error);
                    reader.readAsDataURL(file);
                });
            };

            const base64 = await fileToBase64(file);
            const content = base64.split('base64,');

            if (content.length < 2) {
                throw new Error('Invalid base64 format');
            }

            const response = await fetchData('lambdaAPI/Employee/imageupload', {
                userId: Id,
                userImage: content[1],
            });

            if (response && response.userImage) {
                setUser(prevUser => ({
                    ...prevUser,
                    userImage: response.userImage
                }));
                await fetchUserData();
                if (typeof showNotification === 'function') {
                    showNotification("Image uploaded successfully", "success");
                }
            } else {
                console.error('API response did not contain userImage:', response);
                throw new Error(response?.message || 'Image upload failed');
            }
        } catch (error) {
            console.error('Error uploading files:', error);
            // Show error notification if you have a notification system
            if (typeof showNotification === 'function') {
                showNotification(error.message || "Error uploading image", "error");
            }
        } finally {
            setIsUploading(false);
        }
    };



    const handleDelete = (id, type) => {
        setConfirmationData({
            title: "Delete User Or User Role",
            message: "Are you sure you want to delete this User Or User Role?",
            onConfirm: () => confirmhandleDelete(id, type),
        });
        setConfirmationOpen(true);
    };

    const confirmhandleDelete = async (id, type) => {
        try {
            setLoading(true);
            setConfirmationOpen(false);
            if (type === "user") {
                const userDelete = await fetchDeleteData(`lambdaAPI/Employee/delete/${id}`);

                if (userDelete) {
                    setSnackbarMessage("User deleted Successfully");
                    setSnackbarOpen(true);
                    setIsSnackbarSuccess(true);
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } else {
                    setSnackbarMessage("Something went wrong, Please Contact Technical Team");
                    setSnackbarOpen(true);
                    setIsSnackbarSuccess(false);
                    await fetchUserData();
                }
            } else {
                await fetchDeleteData(`UserRoles/delete/${id}`);

                setSnackbarMessage("User Role deleted Successfully");
                setSnackbarOpen(true);
                setIsSnackbarSuccess(true);
            }
        } catch (error) {
            console.error("Error deleting:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div style={{ display: "inline-block" }}>
                <button
                    className="btn flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                    style={{
                        background: "white",
                        color: "black",
                        transition: "transform 0.2s",
                        border: "none",
                        margin: "10px",
                        cursor: "pointer"
                    }}
                    onClick={() => navigate('/adminpanel/user')} // Navigate on click
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                >
                    <i className="bi bi-arrow-left text-black"></i>

                    <span>Back</span>
                </button>
            </div>
            <div className="container d-flex justify-content-center align-items-center py-5" style={{ minHeight: "80vh" }}>
                {loading && !isEditing ? (
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3 text-muted fw-light">Fetching user details...</p>
                    </div>
                ) : !isEditing ? (
                    user ? (
                        <div className="card border-0 shadow-2xl rounded-5 overflow-hidden w-100"
                            style={{
                                background: "linear-gradient(to right, #f5f7fa, #f5f7fa)",
                                boxShadow: "0 15px 35px rgba(50,50,93,.1), 0 5px 15px rgba(0,0,0,.07)"
                            }}>
                            {/* Header Banner with Gradient */}
                            <div className="bg-primary bg-gradient text-white p-4 position-relative"
                                style={{
                                    background: "linear-gradient(45deg, #5e72e4, #825ee4)",
                                    height: "80px"
                                }}>
                                <div className="position-absolute top-100 start-50 translate-middle">
                                    {user.UserImage ? (
                                        <img
                                            src={`${imageUrl}${user.UserImage}`}
                                            className="rounded-circle border border-4 border-white"
                                            style={{
                                                width: "120px",
                                                height: "120px",
                                                objectFit: "cover",
                                                boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
                                            }}
                                            alt={`${user.FullName || 'User'}'s profile picture`}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = user.Gender === "Female"
                                                    ? "../../assets/img/womenlogo.jpg"
                                                    : "../../assets/img/menlogo.jpg";
                                            }}
                                        />
                                    ) : (
                                        <div className="rounded-circle bg-light d-flex align-items-center justify-content-center border border-4 border-white shadow"
                                            style={{ width: "120px", height: "120px" }}>
                                            <span className="display-6 text-primary">
                                                {user?.UserName ? user.UserName.charAt(0).toUpperCase() : "?"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="card-body pt-5 mt-5">
                                <div className="text-center mb-4">
                                    <h2 className="fw-bold text-dark mb-1" style={{ fontSize: "1.8rem" }}>{user.FullName || "Not Available"}</h2>
                                    <p className="text-muted mb-0">
                                        <span className="badge text-white rounded-pill px-3 py-2"
                                            style={{
                                                background: "linear-gradient(45deg, #5e72e4, #825ee4)",
                                                fontSize: "0.8rem"
                                            }}>
                                            {user.Designation || "Not Available"}
                                        </span>
                                    </p>
                                </div>

                                <div className="row g-4 p-3">
                                    <div className="col-md-6">
                                        {/* Details Left Column - Enhanced with soft backgrounds */}
                                        <div className="d-flex align-items-center mb-3 p-2 rounded" style={{ background: "rgba(94, 114, 228, 0.05)" }}>
                                            <div className="bg-primary-subtle rounded-circle p-2 me-3">
                                                <i className="bi bi-person-badge text-primary"></i>
                                            </div>
                                            <div>
                                                <p className="text-muted small mb-0">Employee Code</p>
                                                <p className="fw-medium mb-0">{user.EmployeeCode}</p>
                                            </div>
                                        </div>

                                        <div
                                            className="d-flex align-items-center mb-3 p-2 rounded"
                                            style={{ background: "rgba(94, 114, 228, 0.05)" }}
                                        >
                                            <div className="bg-primary-subtle rounded-circle p-2 me-3">
                                                {user.Gender === "Male" ? (
                                                    <i className="bi bi-gender-male text-primary"></i>
                                                ) : user.Gender === "Female" ? (
                                                    <i className="bi bi-gender-female text-primary"></i>
                                                ) : (
                                                    <i className="bi bi-gender-ambiguous text-primary"></i>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-muted small mb-0">Gender</p>
                                                <p className="fw-medium mb-0">{user.Gender}</p>
                                            </div>
                                        </div>


                                        <div className="d-flex align-items-center p-2 rounded" style={{ background: "rgba(94, 114, 228, 0.05)" }}>
                                            <div className="bg-primary-subtle rounded-circle p-2 me-3">
                                                <i className="bi bi-telephone text-primary"></i>
                                            </div>
                                            <div>
                                                <p className="text-muted small mb-0">Mobile</p>
                                                <p className="fw-medium mb-0">{user.MobileNumber}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        {/* Details Right Column - Enhanced with soft backgrounds */}
                                        <div className="d-flex align-items-center mb-3 p-2 rounded" style={{ background: "rgba(94, 114, 228, 0.05)" }}>
                                            <div className="bg-primary-subtle rounded-circle p-2 me-3">
                                                <i className="bi bi-envelope text-primary"></i>
                                            </div>
                                            <div>
                                                <p className="text-muted small mb-0">Email</p>
                                                <p className="fw-medium mb-0">{user.EmailId}</p>
                                            </div>
                                        </div>

                                        <div className="d-flex align-items-center mb-3 p-2 rounded" style={{ background: "rgba(94, 114, 228, 0.05)" }}>
                                            <div className="bg-primary-subtle rounded-circle p-2 me-3">
                                                <i className="bi bi-person-badge text-primary"></i>
                                            </div>
                                            <div>
                                                <p className="text-muted small mb-0">User Role</p>
                                                <p className="fw-medium mb-0">{user.UserRoleName}</p>
                                            </div>
                                        </div>

                                        <div className="d-flex align-items-center p-2 rounded" style={{ background: "rgba(94, 114, 228, 0.05)" }}>
                                            <div className="bg-primary-subtle rounded-circle p-2 me-3">
                                                <i className="bi bi-person-check text-primary"></i>
                                            </div>
                                            <div>
                                                <p className="text-muted small mb-0">Reporting Manager</p>
                                                <p className="fw-medium mb-0">{user.ReportingName}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Action Buttons */}
                            <div className="card-footer bg-transparent border-0 d-flex justify-content-between gap-3 p-4">
                                <button
                                    className="btn flex-grow-1 py-2 d-flex align-items-center justify-content-center gap-2"
                                    style={{
                                        background: "linear-gradient(45deg, #5e72e4, #825ee4)",
                                        color: "white",
                                        transition: "transform 0.2s"
                                    }}
                                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                                    onClick={handleEdit}
                                >
                                    <i className="bi bi-pencil-square"></i>
                                    <span>Edit Profile</span>
                                </button>
                                <button
                                    className="btn flex-grow-1 py-2 d-flex align-items-center justify-content-center gap-2"
                                    style={{
                                        background: "linear-gradient(45deg, #f5365c, #f56036)",
                                        color: "white",
                                        transition: "transform 0.2s"
                                    }}
                                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                                    onClick={() => handleDelete(user.EmployeeId, "user")}
                                >
                                    <i className="bi bi-trash"></i>
                                    <span>Delete</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center p-5">
                            <div className="display-6 text-danger mb-3">
                                <i className="bi bi-exclamation-triangle"></i>
                            </div>
                            <h4 className="fw-semibold text-danger">User not found</h4>
                            <p className="text-muted">The requested user information is not available.</p>
                            <button
                                className="btn btn-primary mt-3"
                                onClick={() => navigate("/adminpanel/user")}
                            >
                                Return to User List
                            </button>
                        </div>
                    )
                ) : (
                    <div className="container">
                        <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ maxWidth: "100%", margin: "0 auto", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)" }}>
                            <div className="bg-primary bg-gradient text-white p-4">
                                <h4 className="fw-bold mb-1">Edit User Profile</h4>
                            </div>
                            <div className="card-body p-4">
                                {loading ? (
                                    <div className="text-center p-5">
                                        <CircularProgress />
                                    </div>
                                ) : (
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        EditUser();
                                        return false;
                                    }}>
                                        <Grid container spacing={3}>
                                            {/* Basic Information */}
                                            <Grid item xs={12}>
                                                <Typography variant="h6" className="fw-bold text-primary mb-3">
                                                    Basic Information
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Name"
                                                    name="UserName"
                                                    value={formData.UserName || ''}
                                                    onChange={handleChange}
                                                    variant="outlined"
                                                    required
                                                />
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Employee Code"
                                                    name="EmployeeCode"
                                                    value={formData.EmployeeCode || ''}
                                                    onChange={handleChange}
                                                    variant="outlined"
                                                    required
                                                />
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Full Name"
                                                    name="FullName"
                                                    value={formData.FullName || ''}
                                                    onChange={handleChange}
                                                    variant="outlined"
                                                />
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Designation"
                                                    name="Designation"
                                                    value={formData.Designation || ''}
                                                    onChange={handleChange}
                                                    variant="outlined"
                                                />
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    select
                                                    label="Gender"
                                                    name="Gender"
                                                    value={formData.Gender || ''}
                                                    onChange={handleChange}
                                                    variant="outlined"
                                                >
                                                    <MenuItem value="Male">Male</MenuItem>
                                                    <MenuItem value="Female">Female</MenuItem>
                                                    <MenuItem value="Other">Other</MenuItem>
                                                </TextField>
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <Flatpickr
                                                    type="text"
                                                    className="form-control py-2"
                                                    id="DateofBirth"
                                                    name="DateofBirth"
                                                    placeholder="Enter Date of Birth"
                                                    value={formData.DateofBirth}
                                                    onChange={([date]) =>
                                                        handleChange({
                                                            target: {
                                                                name: "DateofBirth",
                                                                value: date.toLocaleDateString("en-CA"),
                                                            },
                                                        })
                                                    } options={{
                                                        dateFormat: "Y-m-d",
                                                        maxDate: "today"
                                                    }}
                                                />
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Age"
                                                    name="Age"
                                                    type="number"
                                                    value={formData.Age || ''}
                                                    onChange={handleChange}
                                                    variant="outlined"
                                                    error={!!formErrors.Age}
                                                    helperText={formErrors.Age}
                                                />
                                            </Grid>

                                            {/* Contact Information */}
                                            <Grid item xs={12} className="mt-3">
                                                <Typography variant="h6" className="fw-bold text-primary mb-3">
                                                    Contact Information
                                                </Typography>
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Mobile Number"
                                                    name="MobileNumber"
                                                    value={formData.MobileNumber || ''}
                                                    onChange={handleChange}
                                                    variant="outlined"
                                                    required
                                                />
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="WhatsApp Number"
                                                    name="WhatsAppMobileNumber"
                                                    value={formData.WhatsAppMobileNumber || ''}
                                                    onChange={handleChange}
                                                    variant="outlined"
                                                />
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Email"
                                                    name="EmailId"
                                                    value={formData.EmailId || ''}
                                                    onChange={handleChange}
                                                    variant="outlined"
                                                    required
                                                    type="email"
                                                />
                                            </Grid>

                                            {/* <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Aadhaar Number"
                                                    name="AadhaarNumber"
                                                    value={formData.AadhaarNumber || ''}
                                                    onChange={handleChange}
                                                    variant="outlined"
                                                />
                                            </Grid> */}

                                            {/* Address Information */}
                                            <Grid item xs={12} className="mt-3">
                                                <Typography variant="h6" className="fw-bold text-primary mb-3">
                                                    Address Information
                                                </Typography>
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Address Line 1"
                                                    name="AddressLine1"
                                                    value={formData.AddressLine1 || ''}
                                                    onChange={handleChange}
                                                    variant="outlined"
                                                />
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Address Line 2"
                                                    name="AddressLine2"
                                                    value={formData.AddressLine2 || ''}
                                                    onChange={handleChange}
                                                    variant="outlined"
                                                />
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <FormControl fullWidth variant="outlined">
                                                    <InputLabel>State</InputLabel>
                                                    <Select
                                                        value={formData.StateId}
                                                        onChange={(e) => {
                                                            setFormData({ ...formData, StateId: e.target.value });
                                                            setSelectedStateId(e.target.value);
                                                        }}
                                                        label="State"
                                                    >
                                                        <MenuItem value="">
                                                            <em>Select State</em>
                                                        </MenuItem>
                                                        {stateDropdown.map((state) => (
                                                            <MenuItem key={state.StateId} value={state.StateId}>
                                                                {state.StateName}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <FormControl fullWidth variant="outlined" disabled={loading || !formData.StateId}>
                                                    <InputLabel>District</InputLabel>
                                                    <Select
                                                        value={formData.DistrictId}
                                                        onChange={(e) => {
                                                            setFormData({ ...formData, DistrictId: e.target.value });
                                                            setSelectedDistrictId(e.target.value);
                                                            setMandals([]);
                                                            setVillages([]);
                                                        }}
                                                        label="District"
                                                    >
                                                        <MenuItem value="">
                                                            <em>Select District</em>
                                                        </MenuItem>
                                                        {districtDropdown.map((district) => (
                                                            <MenuItem key={district.DistrictId} value={district.DistrictId}>
                                                                {district.DistrictName}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <FormControl fullWidth variant="outlined" disabled={loading || !formData.DistrictId}>
                                                    <InputLabel>Mandal</InputLabel>
                                                    <Select
                                                        value={formData.Mandal || ""}
                                                        onChange={(e) => setFormData({ ...formData, Mandal: e.target.value })}
                                                        label="Mandal"
                                                    >
                                                        <MenuItem value="">
                                                            <em>Select Mandal</em>
                                                        </MenuItem>
                                                        {mandals.map((mandal) => (
                                                            <MenuItem key={mandal.MandalId} value={mandal.MandalId}>
                                                                {mandal.MandalName}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <FormControl fullWidth variant="outlined" disabled={loading || !formData.Mandal}>
                                                    <InputLabel>Village</InputLabel>
                                                    <Select
                                                        value={formData.Village || ""}
                                                        onChange={(e) => {
                                                            setFormData((prevData) => ({
                                                                ...prevData,
                                                                Village: e.target.value,
                                                            }));
                                                        }}
                                                        label="Village"
                                                    >
                                                        {loading ? (
                                                            <MenuItem disabled>
                                                                <CircularProgress size={24} />
                                                            </MenuItem>
                                                        ) : (
                                                            villages.map((village) => (
                                                                <MenuItem key={village.VillageId} value={village.VillageId}>
                                                                    {village.VillageName}
                                                                </MenuItem>
                                                            ))
                                                        )}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            {loading && (
                                                <Grid item xs={12} container justifyContent="center">
                                                    <CircularProgress />
                                                </Grid>
                                            )}
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="City"
                                                    name="City"
                                                    value={formData.City || ''}
                                                    onChange={handleChange}
                                                    variant="outlined"
                                                />
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Pincode"
                                                    name="Pincode"
                                                    value={formData.Pincode || ''}
                                                    onChange={handleChange}
                                                    variant="outlined"
                                                />
                                            </Grid>
                                            {/* System Information */}
                                            <Grid item xs={12} className="mt-3">
                                                <Typography variant="h6" className="fw-bold text-primary mb-3">
                                                    System Information
                                                </Typography>
                                            </Grid>

                                            <Grid item xs={12} style={{ position: "relative" }}>
                                                <FormControl fullWidth variant="outlined" error={!!errors.UserRoleId}>
                                                    <InputLabel>User Role</InputLabel>
                                                    <Select
                                                        name="UserRoleId"
                                                        value={formData.UserRoleId || ""}
                                                        onChange={onChangeHandler}
                                                        label="User Role"
                                                        disabled={isEditMode ? !editableFields.includes("UserRoleId") : false}
                                                    >
                                                        {userRoleDropdown.map((role) => (
                                                            <MenuItem key={role.UserRoleId} value={role.UserRoleId}>
                                                                {role.RoleType}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                    {errors.UserRoleId && <Typography color="error">{errors.UserRoleId}</Typography>}
                                                </FormControl>
                                                {isEditMode && (
                                                    <IconButton
                                                        onClick={() => {
                                                            if (editableFields.includes("UserRoleId")) {
                                                                setEditableFields(editableFields.filter((f) => f !== "UserRoleId"));
                                                            } else {
                                                                setEditableFields([...editableFields, "UserRoleId"]);
                                                            }
                                                        }}
                                                        style={{
                                                            position: "absolute",
                                                            right: "8px",
                                                            top: "50%",
                                                            transform: "translateY(-50%)",
                                                            backgroundColor: "white",
                                                        }}
                                                        size="small"
                                                    >
                                                        {editableFields.includes("UserRoleId") ? <CheckIcon /> : <EditIcon />}
                                                    </IconButton>
                                                )}
                                            </Grid>




                                            {/* <div style={{ position: "relative", width: "100%", marginLeft: "22px", marginBottom: "20px" }}>
                                                <FormControl fullWidth margin="normal" error={!!errors.RouteMap}>
                                                    <InputLabel id="routemap-label" shrink>
                                                        Route Map
                                                    </InputLabel>
                                                    <div style={{ position: "relative", marginTop: "16px", zIndex: 1 }}>
                                                        {routeMapMultiSelect && (
                                                            <div style={{ backgroundColor: "white", borderRadius: "4px" }}>
                                                                <MultiSelect
                                                                    options={routeMapMultiSelect}
                                                                    value={selectedRouteMaps}
                                                                    onChange={setSelectedRouteMaps}
                                                                    disabled={isEditMode ? !editableFields.includes("RouteMap") : false}
                                                                    style={{ width: "100%" }}
                                                                />
                                                                {errors.RouteMap && (
                                                                    <Typography color="error">{errors.RouteMap}</Typography>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </FormControl>
                                                {isEditMode && (
                                                    <IconButton
                                                        onClick={() => {
                                                            if (editableFields.includes("RouteMap")) {
                                                                setEditableFields(editableFields.filter((f) => f !== "RouteMap"));
                                                            } else {
                                                                setEditableFields([...editableFields, "RouteMap"]);
                                                            }
                                                        }}
                                                        style={{
                                                            position: "absolute",
                                                            right: "8px",
                                                            top: "30px",
                                                            transform: "translateY(-50%)",
                                                            backgroundColor: "white",
                                                            zIndex: 2
                                                        }}
                                                        size="small"
                                                    >
                                                        {editableFields.includes("RouteMap") ? <CheckIcon /> : <EditIcon />}
                                                    </IconButton>
                                                )}
                                            </div> */}
                                            <div style={{ clear: "both", height: "10px" }}></div>

                                            <div style={{ position: "relative", width: "100%", marginLeft: "22px" }}>
                                                <FormControl fullWidth margin="normal" error={!!errors.ReportingTo}>
                                                    <InputLabel id="ReportingTo-label">
                                                        Reporting to<span style={{ color: "red" }}> *</span>
                                                    </InputLabel>
                                                    <Select
                                                        labelId="ReportingTo-label"
                                                        id="ReportingTo"
                                                        name="ReportingTo"
                                                        value={formData.ReportingTo || ""}
                                                        onChange={(e) => {
                                                            onChangeHandler(e);
                                                        }}
                                                        label="Reporting to"
                                                        disabled={isEditMode ? !editableFields.includes("ReportingTo") : false}
                                                    >
                                                        {allUsers.map((user) => (
                                                            <MenuItem key={user.EmployeeId} value={user.EmployeeId}>
                                                                {user.Name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                    {errors.ReportingTo && (
                                                        <Typography color="error">{errors.ReportingTo}</Typography>
                                                    )}
                                                </FormControl>
                                            </div>

                                            <Grid item xs={12}>
                                                <div className="mb-3">
                                                    <label htmlFor="UserImage" className="form-label">Profile Image</label>
                                                    <input
                                                        type="file"
                                                        className="form-control"
                                                        id="UserImage"
                                                        onChange={handleImageChange}
                                                        accept="image/*"
                                                    />

                                                    {user?.UserImage && (
                                                        <div className="mt-2">
                                                            <div className="d-flex align-items-center">
                                                                <p className="text-muted mb-0 me-2">Current Image:</p>
                                                                <span className="d-flex align-items-center">
                                                                    <img
                                                                        src={`${imageUrl}${user.UserImage}`}
                                                                        alt="Current profile"
                                                                        className="img-thumbnail me-2"
                                                                        style={{ height: "100px" }}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-danger"
                                                                        onClick={handleRemoveImage}
                                                                        title="Remove Image"
                                                                    >
                                                                        <i className="bi bi-x"></i>
                                                                    </button>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </Grid>



                                            <Grid item xs={12}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                                                    <Button
                                                        variant="outlined"
                                                        color="primary"
                                                        onClick={handleCancel}
                                                        sx={{ paddingX: 4 }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="contained"
                                                        color="primary"
                                                        sx={{ paddingX: 4 }}
                                                        disabled={loading}
                                                        onClick={async (e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();

                                                            const success = await EditUser();
                                                            if (success) {
                                                                navigate(`/adminpanel/userdetails/${Id}`);
                                                            }
                                                        }}
                                                    >
                                                        {loading ? <CircularProgress size={24} /> : "Save Changes"}
                                                    </Button>


                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Confirmation Dialog */}
                {confirmationOpen && (
                    <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">{confirmationData.title}</h5>
                                    <button type="button" className="btn-close" onClick={() => setConfirmationOpen(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <p>{confirmationData.message}</p>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setConfirmationOpen(false)}>Cancel</button>
                                    <button type="button" className="btn btn-danger" onClick={confirmationData.onConfirm}>Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={() => setSnackbarOpen(false)}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert
                        onClose={() => setSnackbarOpen(false)}
                        severity={snackbarType} // "success", "error", "warning", "info"
                        sx={{ width: '100%' }}
                    >
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
                {/* Snackbar for notifications */}
                {/* <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={() => setSnackbarOpen(false)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert
                        onClose={() => setSnackbarOpen(false)}
                        severity={isSnackbarSuccess ? "success" : "error"}
                        variant="filled"
                    >
                        {snackbarMessage}
                    </Alert>
                </Snackbar> */}
            </div>
        </Layout>
    );
}
