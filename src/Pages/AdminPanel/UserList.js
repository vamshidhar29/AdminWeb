import React, { useEffect, useState } from "react";
import {
  fetchData,
  fetchUpdateData,
  fetchDeleteData,
  uploadImage,
  fetchAllData
} from "../../helpers/externapi";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import CommonTables from "../../Commoncomponents/CommonTables";
import TableContainer from "@mui/material/TableContainer";
import ConfirmationDialogDelete from "../../Components/ConfirmationDialogDelete";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { MultiSelect } from "react-multi-select-component";
import Layout from "../../Layout/Layout";
import Flatpickr from 'react-flatpickr';
import {
  TextField,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { Link, useNavigate, useParams } from "react-router-dom";


export default function UserAndRoleList() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [userRoleDropdown, setUserRoleDropdown] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [formType, setFormType] = useState("user");
  const [formData, setFormData] = useState({
    EmployeeId: "",
    Name: "",
    EmployeeCode: "",
    MobileNumber: "",
    EmailId: "",
    UserImage: "",
    UserRoleId: "",
    RoleType: "",
    FullName: "",
    PinNo: "",
    PassWord: "",
    RouteMapId: [],
    ReportingId: "",
    // Additional fields
    Designation: "",
    Gender: "",
    DateofBirth: "",
    Age: "",
    AddressLine1: "",
    AddressLine2: "",
    Village: "",
    Mandal: "",
    City: "",
    Pincode: "",
    StateId: "",
    DistrictId: "",
    AadhaarNumber: "",
    WhatsAppMobileNumber: "",
  });

  const [errors, setErrors] = useState({});
  const [totalCountUserList, setTotalCountUserList] = useState(0);
  const [currentPageUserList, setCurrentPageUserList] = useState(1);
  const [perPageUserList, setPerPageUserList] = useState(10);
  const [totalCountUserRole, setTotalCountUserRole] = useState(0);
  const [currentPageUserRole, setCurrentPageUserRole] = useState(1);
  const [perPageUserRole, setPerPageUserRole] = useState(10);
  const [selectedImage, setSelectedImage] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationData, setConfirmationData] = useState({});
  const [routename, setRouteName] = useState([]);
  const [routeMapMultiSelect, setRouteMapMultiSelect] = useState();
  const [selectedRouteMaps, setSelectedRouteMaps] = useState([]);
  const [userFormError, setUserFormError] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [isSnackbarSuccess, setIsSnakbarSuccess] = useState(true);
  const [activeSection, setActiveSection] = useState("users");
  const [selectedUserRole, setSelectedUserRole] = useState("");
  const [employeeIdInput, setEmployeeIdInput] = useState("");
  const [userNameInput, setUserNameInput] = useState("");
  const [userFilterCriteria, setUserFilterCriteria] = useState([]);
  const [isDisableApply, setIsDisableApply] = useState(true);
  const [userRoleId, setUserRoleId] = useState(null);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedStateId, setSelectedStateId] = useState(null);
  const [editableFields, setEditableFields] = useState([]);


  let UserId = localStorage.getItem("UserId");


  const tableHeadsUserLists = [
    "Employee Code",
    "Full Name",
    "User Name",
    "Mobile Number",
    "Email Id",
    "User Role",
    "Reporting Name",

  ];
  // const tableHeadsUserRoles = ["Role Type", "Actions"];



  const navigate = useNavigate();



  const tableElementsUserlists =
    users.length > 0
      ? users.map((user) => [
        user.EmployeeCode,
        <Link
          to={`/adminpanel/userdetails/${user.EmployeeId}`}
          state={{ user }}
          className="text-start-important"
          style={{
            whiteSpace: 'normal',
            textAlign: 'start',
            display: 'block',
          }}
        >
          {user.FullName}
        </Link>,

        user.Name,
        user.MobileNumber,
        user.EmailId,
        user.Designation,
        user.ReportingId,
        // <>
        //   <button
        //     className="btn btn-sm btn-primary m-2"
        //     onClick={() => handleEdit(user, "user")}
        //   >
        //     Edit
        //   </button>
        //   <button
        //     className="btn btn-sm btn-danger"
        //     onClick={() => handleDelete(user.UserId, "user")}
        //   >
        //     Delete
        //   </button>
        // </>,
      ])
      : [];


  // const tableElementsUserRoles =
  //   userRoles.length > 0
  //     ? userRoles.map((userRole) => [
  //       userRole.RoleType,
  //       <div style={{ display: "flex", alignItems: "center" }}>
  //         <Button
  //           variant="contained"
  //           color="primary"
  //           size="small"
  //           style={{ marginRight: "10px" }}
  //           onClick={() => handleEdit(userRole, "role")}
  //         >
  //           Edit
  //         </Button>
  //         <Button
  //           variant="contained"
  //           size="small"
  //           sx={{
  //             backgroundColor: "red",
  //             color: "white",
  //             "&:hover": { backgroundColor: "darkred" },
  //           }}
  //           onClick={() => handleDelete(userRole.UserRoleId, "role")}
  //         >
  //           Delete
  //         </Button>
  //       </div>,
  //     ])
  //     : [];

  const getUserRoleDropdown = async () => {
    try {
      setLoading(true);
      const userRolesData = await fetchData("UserRoles/all", {
        skip: 0,
        take: 0,
      });
      setUserRoleDropdown(userRolesData);
    } catch (error) {
      console.error("Error fetching user roles data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStates = async () => {
    try {
      let statesData;
      setLoading(true);
      statesData = await fetchData("States/all", { skip: 0, take: 0 });
      setStates(statesData);
    } catch (error) {
      console.error("Error fetching states data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    const getDistricts = async () => {
      try {
        if (selectedStateId !== null) {
          let districtsData;
          setLoading(true);
          districtsData = await fetchAllData(`Districts/GetByStateId/${selectedStateId}`);
          setDistricts(districtsData);
        }
      } catch (error) {
        console.error("Error fetching district data:", error);
      } finally {
        setLoading(false);
      }
    };
    getDistricts();
  }, [selectedStateId]);

  useEffect(() => {
    getUserRoleDropdown();
    getStates();
    getRouteName();
  }, []);

  const getRouteName = async () => {
    setLoading(true);
    const routename = await fetchData("RouteMap/all", { skip: 0, take: 0 });
    const routeArray = routename.map((item) => ({
      label: item.RouteName,
      value: item.RouteMapId,
    }));
    setRouteMapMultiSelect(routeArray);
    setLoading(false);
  };

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

  const getUserRoles = async () => {
    try {
      const skip = (currentPageUserRole - 1) * perPageUserRole;
      const take = perPageUserRole;

      setLoading(true);
      const userRolesData = await fetchData("UserRoles/all", { skip, take });
      setUserRoles(userRolesData);

    } catch (error) {
      console.error("Error fetching user roles data:", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const fetchUserRole = async () => {
      const userRoles = await fetchData("UserRoles/all", { skip: 0, take: 0 });

      const filteredTypeId = userRoles.find(item => item.RoleType === "Advisor")?.UserRoleId;

      setUserRoleId(filteredTypeId); // Set to null if not found
    };

    fetchUserRole();
  }, []);


  useEffect(() => {
    getUsers();
    getUserRoles();
  }, [
    currentPageUserList,
    perPageUserList,
    currentPageUserRole,
    perPageUserRole,
    userFilterCriteria,
  ]);

  useEffect(() => {
    getUserRoleCountData();
  }, []);

  useEffect(() => {
    getUserListCountData();
  }, [userRoleId]);

  const handleMultiSelectChange = (selectedOptions) => {
    const selectedValues = selectedOptions
      ? selectedOptions.map((option) => option.value)
      : [];
    onChangeHandler({ target: { name: "RouteMapId", value: selectedValues } });
  };

  const routeOptions = routename
    ? routename.map((option) => ({
      value: option.RouteMapId,
      label: option.RouteName,
    }))
    : [];

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => {
      const updatedData = {
        ...prevFormData,
        [name]: value,
      };

      if (name === 'StateId') {
        setSelectedStateId(value);
        updatedData.DistrictId = '';
      }

      if (name === "Age" && value) {
        // Calculate DateofBirth from Age.
        // Here, we assume the birth date is the current date's month and day.
        const today = new Date();
        const birthYear = today.getFullYear() - parseInt(value, 10);
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        updatedData["DateofBirth"] = `${birthYear}-${month}-${day}`;
      } else if (name === "DateofBirth" && value) {
        // Calculate Age from DateofBirth.
        const dob = new Date(value);
        const today = new Date();
        let computedAge = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          computedAge--;
        }
        updatedData["Age"] = computedAge;
      }

      return updatedData;
    });
  };


  // const handleEdit = (item, type) => {
  //   setIsEditMode(true);
  //   setFormVisible(true);
  //   setFormType(type);
  //   setErrors({});
  //   setSelectedImage(null);

  //   if (type === "user") {
  //     const routeMapIds = item.AssignedRouteMaps
  //       ? item.AssignedRouteMaps.split(",").map((id) => parseInt(id.trim(), 10))
  //       : [];

  //     const assignedRoutes = routeMapIds
  //       .map((routeId, index) => {
  //         const route = routeMapMultiSelect.find(
  //           (option) => option.value === routeId
  //         );
  //         return route ? { label: route.label, value: route.value } : null;
  //       })
  //       .filter((route) => route !== null);

  //     setFormData({
  //       EmployeeId: item.EmployeeId,
  //       FullName: item.FullName,
  //       Name: item.Name,
  //       EmployeeCode: item.EmployeeCode,
  //       MobileNumber: item.MobileNumber,
  //       EmailId: item.EmailId,
  //       UserImage: item.UserImage,
  //       UserRoleId: item.UserRoleId,
  //       RoleType: "",
  //       RouteMapId: routeMapIds,
  //       ReportingId: item.ReportingTo,
  //       Gender: item.Gender,
  //       Designation: item.Designation,
  //       StateId: item.StateId,
  //       DistrictId: item.DistrictId,
  //       AddressLine1: item.AddressLine1,
  //       AddressLine2: item.AddressLine2,
  //       City: item.City,
  //       Village: item.Village,
  //       Mandal: item.Mandal,
  //       Pincode: item.Pincode,
  //       AadhaarNumber: item.AadhaarNumber,
  //       WhatsAppMobileNumber: item.WhatsAppMobileNumber,
  //       Age: item.Age,
  //       DateofBirth: item.DateofBirth
  //     });
  //     setSelectedRouteMaps(
  //       assignedRoutes.map((route) => ({
  //         label: route.label,
  //         value: route.value,
  //       }))


  //     );
  //     setSelectedStateId(item.StateId);
  //   } else {
  //     setFormData({
  //       UserId: "",
  //       FullName: "",
  //       UserName: "",
  //       EmployeeId: "",
  //       MobileNumber: "",
  //       EmailId: "",
  //       UserImage: "",
  //       UserRoleId: item.UserRoleId,
  //       RoleType: item.RoleType,
  //       RouteMapId: [],
  //     });
  //     setSelectedRouteMaps([]);
  //   }
  // };

  const handleAddNew = (type) => {
    setIsEditMode(false);
    setFormVisible(true);
    setFormType(type);
    setFormData({
      UserId: "",
      FullName: "",
      Name: "",
      EmployeeCode: "",
      MobileNumber: "",
      EmailId: "",
      UserImage: "",
      UserRoleId: "",
      RoleType: "",
      RouteMapId: [],
      UserRouteMapsId: "",
    });
    setSelectedRouteMaps([]);
    setErrors({});
    setSelectedImage(null);
  };

  const validateForm = () => {
    let errors = {};
    if (formType === "user") {
      if (!formData.Name) errors.UserName = "Please Enter User Name ";
      if (!formData.FullName) errors.FullName = "Please Enter Full Name ";
      if (!formData.EmployeeCode) errors.EmployeeId = "Please Enter Employee Code";

      if (formData.MobileNumber) {
        if (
          typeof formData.MobileNumber === "string" &&
          formData.MobileNumber.length > 0 &&
          formData.MobileNumber.trim() === ""
        ) {
          errors.MobileNumber = "Please enter a valid 10-digit mobile number";
        } else if (!/^[6-9]\d{9}$/.test(formData.MobileNumber.trim())) {
          errors.MobileNumber =
            "Mobile Number must start with 6, 7, 8, or 9 and must be 10 digits";
        }
      } else {
        errors.MobileNumber = "Please Enter valid mobile number";
      }

      if (!formData.UserRoleId) errors.UserRoleId = "Please Select User Role";

      if (!formData.ReportingId)
        errors.ReportingId = "Please Select Reporting Name";
    } else {
      if (!formData.RoleType) errors.RoleType = "Please Enter Role Type";
    }
    return errors;
  };

  const handleFileSelection = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleFileUpload = async (UserId) => {
    try {
      const response = await uploadImage("lambdaAPI/Employee/imageupload", { UserId, UserImage: selectedImage });
      return response;
    } catch (error) {
      console.error("Error uploading files:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length !== 0) {
      setErrors(errors);
      return;
    }

    setLoading(true);
    try {
      let UserId;
      let userData;
      if (formType === "user") {
        if (isEditMode && editableFields.length > 0) {
          const payload = editableFields.map(field => ({
            columnName: field,
            columnValue: formData[field],
            tableName: "Employee",
            tableId: formData.EmployeeId,
          }));

          const updateResponse = await fetchUpdateData("lambdaAPI/Update/CommonUpdate", payload);

          setSnackbarMessage("Fields updated successfully!");
          setSnackbarOpen(true);
          // Reset editableFields so all fields become read-only again.
          setEditableFields([]);
          setIsEditMode(false);
          setFormVisible(false);
        }
        else {
          // Add payload for a new user
          userData = await fetchData("lambdaAPI/Employee/add", {
            Name: formData.Name,
            fullName: formData.FullName,
            employeeCode: formData.EmployeeCode,
            mobileNumber: formData.MobileNumber,
            emailId: formData.EmailId,
            userImage: formData.UserImage,
            userRoleId: formData.UserRoleId,
            reportingTo: formData.ReportingId,
            designation: formData.Designation,
            gender: formData.Gender,
            dateOfBirth: formData.DateofBirth,
            age: formData.Age,
            addressLine1: formData.AddressLine1,
            addressLine2: formData.AddressLine2,
            village: formData.Village,
            mandal: formData.Mandal,
            city: formData.City,
            pincode: formData.Pincode,
            stateId: formData.StateId,
            districtId: formData.DistrictId,
            aadhaarNumber: formData.AadhaarNumber,
            whatsAppMobileNumber: formData.WhatsAppMobileNumber,
            joinedBy: null,
          });
        }

        UserId = userData.data.employeeId;

        if (UserId) {
          let routeMapData = selectedRouteMaps.map((routemap) => ({
            userId: UserId,
            routeMapId: routemap.value,
          }));

          if (routeMapData.length === 0) {
            routeMapData = [
              {
                userId: UserId,
                routeMapId: 0,
              },
            ];
          }

          if (!Array.isArray(routeMapData)) {
            console.error("userRoleIds is not an array:", routeMapData);
            return;
          }
          const seedData = await fetchData("UserRouteMap/seed", routeMapData);
          setSnackbarOpen(true);
          setSnackbarMessage(isEditMode ? "User updated Successfully!" : "User added Successfully!");
          setSnackbarOpen(true);

          if (selectedImage) {
            await handleFileUpload(UserId);
          }
          setTimeout(() => {
            setFormVisible(false);
            setFormData({
              UserId: "",
              Name: "",
              EmployeeId: "",
              EmployeeCode: "",
              MobileNumber: "",
              EmailId: "",
              UserImage: "",
              UserRoleId: "",
              RoleType: "",
              FullName: "",
              PinNo: "",
              PassWord: "",
              RouteMapId: [],
              ReportingId: "",
              Designation: "",
              Gender: "",
              DateofBirth: "",
              Age: "",
              AddressLine1: "",
              AddressLine2: "",
              Village: "",
              Mandal: "",
              City: "",
              Pincode: "",
              StateId: "",
              DistrictId: "",
              AadhaarNumber: "",
              WhatsAppMobileNumber: "",
              JoinedBy: "",
            });
            setIsEditMode(false);
            setUserFormError("");
            window.location.reload();
          }, 1000);

          getUsers();
          getUserListCountData();
        } else if (UserId === undefined || !userData.status) {
          setLoading(false);
          if (userData && userData.data) {
            setUserFormError(userData.data);
          } else {
            setUserFormError(
              "Something went wrong. Please Contact Technical Team"
            );
          }
          throw new Error("UserId is undefined");
        }
      } else {
        if (isEditMode) {
          await fetchUpdateData("UserRoles/update", {
            userRoleId: formData.UserRoleId,
            roleType: formData.RoleType,
          });
          setSnackbarMessage("User Roles updated Successfully!");
        } else {
          await fetchData("UserRoles/add", {
            roleType: formData.RoleType,
          });
          setSnackbarMessage("User Roles Added Successfully!");
        }

        setSnackbarOpen(true);
        await getUserRoles();

        setFormData({
          UserId: "",
          Name: "",
          EmployeeId: "",
          MobileNumber: "",
          EmailId: "",
          UserImage: "",
          UserRoleId: "",
          RoleType: "",
          FullName: "",
          PinNo: "",
          PassWord: "",
          RouteMapId: [],
          ReportingId: "",
        });
        setIsEditMode(false);
        setFormVisible(false);
      }
    } catch (error) {
      console.error("Error adding/updating:", error);
    } finally {
      setLoading(false);
    }
  };


  // const handleDelete = (id, type) => {
  //   setConfirmationData({
  //     title: "Delete User Or User Role",
  //     message: "Are you sure you want to delete this User Or User Role?",
  //     onConfirm: () => confirmhandleDelete(id, type),
  //   });
  //   setConfirmationOpen(true);
  // };

  const confirmhandleDelete = async (id, type) => {
    try {
      setLoading(true);
      setConfirmationOpen(false);
      if (type === "user") {
        const userDelete = await fetchDeleteData(`lambdaAPI/Employee/delete/${id}`);

        if (userDelete) {
          setSnackbarMessage("User deleted Successfully");
          setSnackbarOpen(true);
          setIsSnakbarSuccess(true);
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          setSnackbarMessage(
            "Something went wrong, Please Contact Technical Team"
          );
          setSnackbarOpen(true);
          setIsSnakbarSuccess(false);
          await getUsers();
        }
      } else {
        await fetchDeleteData(`UserRoles/delete/${id}`);

        setSnackbarMessage("User Role deleted Successfully");
        setSnackbarOpen(true);
        setIsSnakbarSuccess(true);
        await getUserRoleCountData();
        await getUserRoles();
      }
    } catch (error) {
      console.error("Error deleting:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormVisible(false);
  };

  const getUserListCountData = async () => {
    setLoading(true);
    try {
      const eventCountData = await fetchData(
        `CommonRowCount/GetTableRowCount`,
        {
          tableName: "Employee", "filter": [
            {
              key: "UserRoleId",
              value: String(userRoleId),
              operator: "NOT IN"
            }
          ]
        }
      );
      const totalCount = eventCountData[0]?.CountOfRecords || 0;
      setTotalCountUserList(totalCount);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching hospital count data:", error);
      setLoading(false);
    }
  };

  const handlePageChangeUserList = (event, page) => {
    setCurrentPageUserList(page);
  };

  const handlePerPageChangeUserList = (event) => {
    setPerPageUserList(parseInt(event.target.value, 10));
    setCurrentPageUserList(1);
  };

  const getUserRoleCountData = async () => {
    setLoading(true);
    try {
      const userRoleCountData = await fetchData(
        `CommonRowCount/GetTableRowCount`,
        { tableName: "UserRole" }
      );
      const totalCount = userRoleCountData[0]?.CountOfRecords || 0;
      setTotalCountUserRole(totalCount);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching hospital count data:", error);
      setLoading(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const handlePageChangeUserRole = (event, page) => {
    setCurrentPageUserRole(page);
  };

  const handlePerPageChangeUserRole = (event) => {
    setPerPageUserRole(parseInt(event.target.value, 10));
    setCurrentPageUserRole(1);
  };

  useEffect(() => {
    if (
      selectedUserRole === "" &&
      employeeIdInput === "" &&
      userNameInput === ""
    ) {
      setIsDisableApply(true);
    } else {
      setIsDisableApply(false);
    }
  }, [selectedUserRole, employeeIdInput, userNameInput]);

  const handleApplyFilter = async () => {
    const filterCriteria = [];

    // Add state filter if selected

    filterCriteria.push({
      key: "UserRoleId",
      value: String(userRoleId),
      operator: "NOT IN"
    });

    if (selectedUserRole) {
      filterCriteria.push({
        key: "UserRoleId",
        value: selectedUserRole,
        operator: "IN",
      });
    }

    // Add district filter if input is provided
    if (employeeIdInput) {
      filterCriteria.push({
        key: "EmployeeCode",
        value: employeeIdInput,
        operator: "LIKE",
      });
    }

    if (userNameInput) {
      filterCriteria.push({
        key: "Name",
        value: userNameInput,
        operator: 'LIKE'
      });
    }



    setLoading(true);
    try {
      const distributorCountData = await fetchData(`CommonRowCount/GetTableRowCount`, { tableName: "Employee", filter: filterCriteria });
      const totalCount = distributorCountData[0]?.CountOfRecords || 0;
      setTotalCountUserList(totalCount);
      const suggestionData = await fetchData("lambdaAPI/Employee/GetMultipleDataByFilter", {
        skip: 0,
        take: perPageUserList,
        filter: filterCriteria
      });
      setUserFilterCriteria(filterCriteria);
      setUsers(suggestionData);
    } catch (error) {
      console.error('Error fetching district data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilter = async () => {
    setSelectedUserRole("");
    setEmployeeIdInput("");
    setUserNameInput("");
    setUserFilterCriteria([]);
    await getUsers();
    await getUserListCountData();
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
                  <h6 className="shimmer-text2 "></h6>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );

  return (
    <Layout>
      {loading && skeletonloading()}
      {!loading && (
        <>
          <Box style={customStyles.buttonGroup}>
            <Button
              variant="contained"
              style={
                activeSection === "users"
                  ? customStyles.activeButton
                  : customStyles.inactiveButton
              }
              onClick={() => setActiveSection("users")}
            >
              Users
            </Button>
            <Button
              variant="contained"
              style={
                activeSection === "userRoles"
                  ? customStyles.activeButton
                  : customStyles.inactiveButton
              }
              onClick={() => setActiveSection("userRoles")}
            >
              User Roles
            </Button>
          </Box>

          {activeSection === "users" && (
            <div>
              <h2 style={customStyles.header}>Users List</h2>

              <div className="row align-items-end">
                <div className="col-md-3 mb-2">
                  <label htmlFor="state-select" className="form-label">
                    State Name
                  </label>
                  <select
                    id="state-select"
                    className="form-select"
                    value={selectedUserRole}
                    onChange={(e) => setSelectedUserRole(e.target.value)}
                  >
                    <option value="">Select a UserRole</option>
                    {userRoleDropdown.map((state) => (
                      <option key={state.UserRoleId} value={state.UserRoleId}>
                        {state.RoleType}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-3 mb-2">
                  <label htmlFor="district-input" className="form-label">
                    Employee Code
                  </label>
                  <input
                    type="text"
                    id="district-input"
                    className="form-control"
                    maxLength="50"
                    value={employeeIdInput}
                    onChange={(e) => setEmployeeIdInput(e.target.value)}
                  />
                </div>

                <div className="col-md-3 mb-2">
                  <label htmlFor="district-input" className="form-label">
                    User Name
                  </label>
                  <input
                    type="text"
                    id="district-input"
                    className="form-control"
                    maxLength="50"
                    value={userNameInput}
                    onChange={(e) => setUserNameInput(e.target.value)}
                  />
                </div>

                <div className="col-md-2 mb-2 d-flex">
                  <button
                    className="btn btn-primary me-2"
                    onClick={handleApplyFilter}
                    disabled={isDisableApply}
                  >
                    Apply
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={handleClearFilter}
                  >
                    Clear
                  </button>
                </div>
              </div>

              <Button
                variant="contained"
                color="primary"
                onClick={() => handleAddNew("user")}
                sx={{ mb: 1 }}
              >
                Add User
              </Button>

              <div className="card">
                {loading ? (
                  <div style={customStyles.loadingContainer}>
                    <CircularProgress />
                  </div>
                ) : (
                  <CommonTables
                    tableHeads={tableHeadsUserLists}
                    tableData={tableElementsUserlists}
                    perPage={perPageUserList}
                    currentPage={currentPageUserList}
                    perPageChange={handlePerPageChangeUserList}
                    pageChange={handlePageChangeUserList}
                    totalCount={totalCountUserList}
                  />
                )}
              </div>
            </div>
          )}

          {activeSection === "userRoles" && (
            <div>
              <h2 style={customStyles.header}>User Roles List</h2>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleAddNew("role")}
              >
                Add User Role
              </Button>

              <div className="card">
                {loading ? (
                  <div style={customStyles.loadingContainer}>
                    <CircularProgress />
                  </div>
                ) : (
                  <CommonTables
                    // tableHeads={tableHeadsUserRoles}
                    // tableData={tableElementsUserRoles}
                    perPage={perPageUserRole}
                    currentPage={currentPageUserRole}
                    perPageChange={handlePerPageChangeUserRole}
                    pageChange={handlePageChangeUserRole}
                    totalCount={totalCountUserRole}
                  />
                )}
              </div>
            </div>
          )}

          <TableContainer component={Paper}>
            <ConfirmationDialogDelete
              open={confirmationOpen}
              title={confirmationData.title}
              message={confirmationData.message}
              onConfirm={confirmationData.onConfirm}
              onCancel={() => setConfirmationOpen(false)}
            />
            <Snackbar
              open={snackbarOpen}
              autoHideDuration={6000}
              onClose={handleSnackbarClose}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <Alert
                onClose={handleSnackbarClose}
                severity={isSnackbarSuccess ? "success" : "error"}
              >
                {snackbarMessage}
              </Alert>
            </Snackbar>
          </TableContainer>

          <Dialog open={formVisible} onClose={handleClose}>
            <DialogTitle>
              {isEditMode ? "Edit" : "Add New"}{" "}
              {formType === "user" ? "User" : "User Role"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                {formType === "user"
                  ? "Please enter user details."
                  : "Please enter user role details."}

                {userFormError && userFormError.length > 0 && (
                  <p className="text-danger text-right">{userFormError}</p>
                )}
              </DialogContentText>
              <Box
                component="form"
                noValidate
                onSubmit={handleSubmit}
                sx={{ mt: 3 }}
              >

                {formType === "user" ? (
                  <>
                    {/* Full Name Field */}
                    <TextField
                      margin="normal"
                      fullWidth
                      id="FullName"
                      label={
                        <span>
                          Full Name<span style={{ color: "red" }}> *</span>
                        </span>
                      }
                      name="FullName"
                      value={formData.FullName}
                      onChange={onChangeHandler}
                      error={!!errors.FullName}
                      helperText={errors.FullName}
                      disabled={isEditMode ? !editableFields.includes("FullName") : false}
                      InputProps={{
                        ...(isEditMode && {
                          endAdornment: (
                            <InputAdornment position="end">
                              {!editableFields.includes("FullName") ? (
                                <IconButton onClick={() => setEditableFields([...editableFields, "FullName"])}>
                                  <EditIcon />
                                </IconButton>
                              ) : (
                                <IconButton onClick={() =>
                                  setEditableFields(editableFields.filter(field => field !== "FullName"))
                                }>
                                  <CheckIcon />
                                </IconButton>
                              )}
                            </InputAdornment>
                          ),
                        }),
                      }}
                    />

                    {/* User Name Field */}
                    <TextField
                      margin="normal"
                      fullWidth
                      id="UserName"
                      label={
                        <span>
                          User Name<span style={{ color: "red" }}> *</span>
                        </span>
                      }
                      name="Name"
                      value={formData.Name}
                      onChange={onChangeHandler}
                      error={!!errors.UserName}
                      helperText={errors.UserName}
                      disabled={isEditMode ? !editableFields.includes("Name") : false}
                      InputProps={{
                        ...(isEditMode && {
                          endAdornment: (
                            <InputAdornment position="end">
                              {!editableFields.includes("Name") ? (
                                <IconButton onClick={() => setEditableFields([...editableFields, "Name"])}>
                                  <EditIcon />
                                </IconButton>
                              ) : (
                                <IconButton onClick={() =>
                                  setEditableFields(editableFields.filter(field => field !== "Name"))
                                }>
                                  <CheckIcon />
                                </IconButton>
                              )}
                            </InputAdornment>
                          ),
                        }),
                      }}
                    />

                    {/* Employee Code Field */}
                    <TextField
                      margin="normal"
                      fullWidth
                      id="EmployeeCode"
                      label={
                        <span>
                          Employee Code<span style={{ color: "red" }}> *</span>
                        </span>
                      }
                      name="EmployeeCode"
                      value={formData.EmployeeCode}
                      onChange={onChangeHandler}
                      error={!!errors.EmployeeId}
                      helperText={errors.EmployeeId}
                      disabled={isEditMode ? !editableFields.includes("EmployeeCode") : false}
                      InputProps={{
                        ...(isEditMode && {
                          endAdornment: (
                            <InputAdornment position="end">
                              {!editableFields.includes("EmployeeCode") ? (
                                <IconButton onClick={() => setEditableFields([...editableFields, "EmployeeCode"])}>
                                  <EditIcon />
                                </IconButton>
                              ) : (
                                <IconButton onClick={() =>
                                  setEditableFields(editableFields.filter(field => field !== "EmployeeCode"))
                                }>
                                  <CheckIcon />
                                </IconButton>
                              )}
                            </InputAdornment>
                          ),
                        }),
                      }}
                    />

                    {/* Mobile Number Field */}
                    <TextField
                      margin="normal"
                      fullWidth
                      id="MobileNumber"
                      label={
                        <span>
                          Mobile Number<span style={{ color: "red" }}> *</span>
                        </span>
                      }
                      name="MobileNumber"
                      value={formData.MobileNumber}
                      onChange={onChangeHandler}
                      error={!!errors.MobileNumber}
                      helperText={errors.MobileNumber}
                      inputProps={{ maxLength: 10 }}
                      disabled={isEditMode ? !editableFields.includes("MobileNumber") : false}
                      InputProps={{
                        ...(isEditMode && {
                          endAdornment: (
                            <InputAdornment position="end">
                              {!editableFields.includes("MobileNumber") ? (
                                <IconButton onClick={() => setEditableFields([...editableFields, "MobileNumber"])}>
                                  <EditIcon />
                                </IconButton>
                              ) : (
                                <IconButton onClick={() =>
                                  setEditableFields(editableFields.filter(field => field !== "MobileNumber"))
                                }>
                                  <CheckIcon />
                                </IconButton>
                              )}
                            </InputAdornment>
                          ),
                        }),
                      }}
                    />

                    {/* Email Id Field */}
                    <TextField
                      margin="normal"
                      fullWidth
                      id="EmailId"
                      label={
                        <span>
                          Email Id<span style={{ color: "red" }}> *</span>
                        </span>
                      }
                      name="EmailId"
                      value={formData.EmailId}
                      onChange={onChangeHandler}
                      error={!!errors.EmailId}
                      helperText={errors.EmailId}
                      disabled={isEditMode ? !editableFields.includes("EmailId") : false}
                      InputProps={{
                        ...(isEditMode && {
                          endAdornment: (
                            <InputAdornment position="end">
                              {!editableFields.includes("EmailId") ? (
                                <IconButton onClick={() => setEditableFields([...editableFields, "EmailId"])}>
                                  <EditIcon />
                                </IconButton>
                              ) : (
                                <IconButton onClick={() =>
                                  setEditableFields(editableFields.filter(field => field !== "EmailId"))
                                }>
                                  <CheckIcon />
                                </IconButton>
                              )}
                            </InputAdornment>
                          ),
                        }),
                      }}
                    />

                    {/* User Image */}
                    <div className="col-md-14">
                      <div className="mb-3">
                        <label htmlFor="Image" className="form-label">
                          User Image
                        </label>
                        <div className="col-12 fw-normal" style={{ marginBottom: "10px" }}>
                          {selectedImage && (
                            <a
                              href={URL.createObjectURL(selectedImage)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <img
                                className="selected-image img-thumbnail me-3"
                                src={URL.createObjectURL(selectedImage)}
                                alt="Selected"
                                style={{
                                  width: "150px",
                                  height: "100px",
                                  objectFit: "cover",
                                }}
                              />
                            </a>
                          )}
                          <input
                            className="form-control"
                            type="file"
                            name="UserImage"
                            onChange={(e) => handleFileSelection(e)}
                            style={{ marginTop: "10px" }}
                          />
                        </div>
                      </div>
                    </div>


                    <div style={{ position: "relative" }}>
                      <FormControl fullWidth margin="normal" error={!!errors.UserRoleId}>
                        <InputLabel id="UserRoleId-label">
                          User Role<span style={{ color: "red" }}> *</span>
                        </InputLabel>
                        <Select
                          labelId="UserRoleId-label"
                          id="UserRoleId"
                          name="UserRoleId"
                          value={formData.UserRoleId}
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
                        {errors.UserRoleId && (
                          <Typography color="error">{errors.UserRoleId}</Typography>
                        )}
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
                    </div>




                    <div style={{ position: "relative" }}>
                      <FormControl fullWidth margin="normal" error={!!errors.ReportingId}>
                        <InputLabel id="ReportingId-label">
                          Reporting to<span style={{ color: "red" }}> *</span>
                        </InputLabel>
                        <Select
                          labelId="ReportingId-label"
                          id="ReportingId"
                          name="ReportingId"
                          value={formData.ReportingId}
                          onChange={onChangeHandler}
                          label="Reporting to"
                          disabled={isEditMode ? !editableFields.includes("ReportingId") : false}
                        >
                          {allUsers.map((user) => (
                            <MenuItem key={user.EmployeeId} value={user.EmployeeId}>
                              {user.Name}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.ReportingId && (
                          <Typography color="error">{errors.ReportingId}</Typography>
                        )}
                      </FormControl>
                      {isEditMode && (
                        <IconButton
                          onClick={() => {
                            if (editableFields.includes("ReportingId")) {
                              setEditableFields(editableFields.filter((f) => f !== "ReportingId"));
                            } else {
                              setEditableFields([...editableFields, "ReportingId"]);
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
                          {editableFields.includes("ReportingId") ? <CheckIcon /> : <EditIcon />}
                        </IconButton>
                      )}
                    </div>



                    <label htmlFor="select2Success" className="form-label">
                      Route Map
                    </label>
                    <div style={{ position: "relative" }}>
                      {routeMapMultiSelect && (
                        <div>
                          <MultiSelect
                            options={routeMapMultiSelect}
                            value={selectedRouteMaps}
                            onChange={setSelectedRouteMaps}
                            disabled={isEditMode ? !editableFields.includes("RouteMap") : false}
                            style={{ width: "100%" }}
                          />
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
                                right: "30px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                backgroundColor: "white",
                              }}
                              size="small"
                            >
                              {editableFields.includes("RouteMap") ? <CheckIcon /> : <EditIcon />}
                            </IconButton>
                          )}
                        </div>
                      )}
                    </div>




                    <TextField
                      margin="normal"
                      fullWidth
                      id="Designation"
                      label="Designation"
                      name="Designation"
                      value={formData.Designation || ""}
                      onChange={onChangeHandler}
                      error={!!errors.Designation}
                      helperText={errors.Designation}
                      disabled={isEditMode ? !editableFields.includes("Designation") : false}
                      InputProps={{
                        ...(isEditMode && {
                          endAdornment: (
                            <InputAdornment position="end">
                              {!editableFields.includes("Designation") ? (
                                <IconButton onClick={() => setEditableFields([...editableFields, "Designation"])}>
                                  <EditIcon />
                                </IconButton>
                              ) : (
                                <IconButton onClick={() => setEditableFields(editableFields.filter(field => field !== "Designation"))}>
                                  <CheckIcon />
                                </IconButton>
                              )}
                            </InputAdornment>
                          ),
                        }),
                      }}
                    />


                    <FormControl
                      fullWidth
                      margin="normal"
                      error={!!errors.Gender}
                      style={{ position: "relative" }}
                    >
                      <InputLabel id="Gender-label">Gender</InputLabel>
                      <Select
                        labelId="Gender-label"
                        id="Gender"
                        name="Gender"
                        value={formData.Gender || ""}
                        onChange={onChangeHandler}
                        label="Gender"
                        disabled={isEditMode ? !editableFields.includes("Gender") : false}
                      >
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                      </Select>
                      {errors.Gender && (
                        <Typography color="error">{errors.Gender}</Typography>
                      )}
                      {isEditMode && (
                        <IconButton
                          onClick={() => {
                            if (editableFields.includes("Gender")) {
                              setEditableFields(editableFields.filter(f => f !== "Gender"));
                            } else {
                              setEditableFields([...editableFields, "Gender"]);
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
                          {editableFields.includes("Gender") ? <CheckIcon /> : <EditIcon />}
                        </IconButton>
                      )}
                    </FormControl>

                    <div className="col-md-12">
                      <div className="form-group text-start d-flex flex-column justify-content-start">
                        <label htmlFor="DateofBirth" className="form-label">
                          Date of Birth <span className="required" style={{ color: "red" }}> *</span>
                        </label>
                        <Flatpickr
                          className="form-control w-100"
                          id="DateofBirth"
                          name="DateofBirth"
                          value={formData.DateofBirth}
                          onChange={([date]) =>
                            onChangeHandler({
                              target: {
                                name: "DateofBirth",
                                value: date.toLocaleDateString("en-CA"),
                              },
                            })
                          }
                          options={{ dateFormat: "Y-m-d", static: true }}
                          disabled={isEditMode ? !editableFields.includes("DateofBirth") : false}
                        />
                        <div className="position-relative w-100">
                          {isEditMode && (
                            <div
                              className="position-absolute"
                              style={{ bottom: "7%", right: "10px", transform: "translateY(-50%)" }}
                            >
                              <IconButton
                                onClick={() => {
                                  if (editableFields.includes("DateofBirth") || editableFields.includes("Age")) {
                                    setEditableFields(
                                      editableFields.filter((f) => f !== "DateofBirth" && f !== "Age")
                                    );
                                  } else {
                                    setEditableFields([...editableFields, "DateofBirth", "Age"]);
                                  }
                                }}
                                style={{
                                  backgroundColor: "transparent",
                                  border: "none",
                                  padding: 0,
                                }}
                                size="small"
                              >
                                {editableFields.includes("DateofBirth") || editableFields.includes("Age") ? (
                                  <CheckIcon />
                                ) : (
                                  <EditIcon />
                                )}
                              </IconButton>
                            </div>
                          )}

                        </div>
                        <span className="non-valid" style={{ color: "red" }}>
                          {errors.DateofBirth}
                        </span>
                      </div>
                    </div>


                    <TextField
                      margin="normal"
                      fullWidth
                      id="Age"
                      label="Age"
                      name="Age"
                      type="number"
                      value={formData.Age || ""}
                      onChange={onChangeHandler}
                      error={!!errors.Age}
                      helperText={errors.Age}
                      disabled={isEditMode ? !editableFields.includes("Age") : false}
                      InputProps={{
                        ...(isEditMode && {
                          endAdornment: (
                            <InputAdornment position="end">
                              {!editableFields.includes("Age") ? (
                                <IconButton
                                  onClick={() => {
                                    // Toggle both Age and DateofBirth fields together.
                                    if (editableFields.includes("Age") || editableFields.includes("DateofBirth")) {
                                      setEditableFields(editableFields.filter(
                                        (f) => f !== "Age" && f !== "DateofBirth"
                                      ));
                                    } else {
                                      setEditableFields([...editableFields, "Age", "DateofBirth"]);
                                    }
                                  }}
                                >
                                  <EditIcon />
                                </IconButton>
                              ) : (
                                <IconButton
                                  onClick={() => {
                                    setEditableFields(editableFields.filter(
                                      (f) => f !== "Age" && f !== "DateofBirth"
                                    ));
                                  }}
                                >
                                  <CheckIcon />
                                </IconButton>
                              )}
                            </InputAdornment>
                          ),
                        }),
                      }}
                    />


                    <TextField
                      margin="normal"
                      fullWidth
                      id="AddressLine1"
                      label="Address Line 1"
                      name="AddressLine1"
                      value={formData.AddressLine1 || ""}
                      onChange={onChangeHandler}
                      error={!!errors.AddressLine1}
                      helperText={errors.AddressLine1}
                      disabled={isEditMode ? !editableFields.includes("AddressLine1") : false}
                      InputProps={{
                        ...(isEditMode && {
                          endAdornment: (
                            <InputAdornment position="end">
                              {!editableFields.includes("AddressLine1") ? (
                                <IconButton onClick={() => setEditableFields([...editableFields, "AddressLine1"])}>
                                  <EditIcon />
                                </IconButton>
                              ) : (
                                <IconButton onClick={() => setEditableFields(editableFields.filter(f => f !== "AddressLine1"))}>
                                  <CheckIcon />
                                </IconButton>
                              )}
                            </InputAdornment>
                          ),
                        }),
                      }}
                    />

                    <TextField
                      margin="normal"
                      fullWidth
                      id="AddressLine2"
                      label="Address Line 2"
                      name="AddressLine2"
                      value={formData.AddressLine2 || ""}
                      onChange={onChangeHandler}
                      error={!!errors.AddressLine2}
                      helperText={errors.AddressLine2}
                      disabled={isEditMode ? !editableFields.includes("AddressLine2") : false}
                      InputProps={{
                        ...(isEditMode && {
                          endAdornment: (
                            <InputAdornment position="end">
                              {!editableFields.includes("AddressLine2") ? (
                                <IconButton onClick={() => setEditableFields([...editableFields, "AddressLine2"])}>
                                  <EditIcon />
                                </IconButton>
                              ) : (
                                <IconButton onClick={() => setEditableFields(editableFields.filter(f => f !== "AddressLine2"))}>
                                  <CheckIcon />
                                </IconButton>
                              )}
                            </InputAdornment>
                          ),
                        }),
                      }}
                    />


                    <TextField
                      margin="normal"
                      fullWidth
                      id="Village"
                      label="Village"
                      name="Village"
                      value={formData.Village || ""}
                      onChange={onChangeHandler}
                      error={!!errors.Village}
                      helperText={errors.Village}
                      disabled={isEditMode ? !editableFields.includes("Village") : false}
                      InputProps={{
                        ...(isEditMode && {
                          endAdornment: (
                            <InputAdornment position="end">
                              {!editableFields.includes("Village") ? (
                                <IconButton onClick={() => setEditableFields([...editableFields, "Village"])}>
                                  <EditIcon />
                                </IconButton>
                              ) : (
                                <IconButton onClick={() => setEditableFields(editableFields.filter(f => f !== "Village"))}>
                                  <CheckIcon />
                                </IconButton>
                              )}
                            </InputAdornment>
                          ),
                        }),
                      }}
                    />


                    <TextField
                      margin="normal"
                      fullWidth
                      id="Mandal"
                      label="Mandal"
                      name="Mandal"
                      value={formData.Mandal || ""}
                      onChange={onChangeHandler}
                      error={!!errors.Mandal}
                      helperText={errors.Mandal}
                      disabled={isEditMode ? !editableFields.includes("Mandal") : false}
                      InputProps={{
                        ...(isEditMode && {
                          endAdornment: (
                            <InputAdornment position="end">
                              {!editableFields.includes("Mandal") ? (
                                <IconButton onClick={() => setEditableFields([...editableFields, "Mandal"])}>
                                  <EditIcon />
                                </IconButton>
                              ) : (
                                <IconButton onClick={() => setEditableFields(editableFields.filter(f => f !== "Mandal"))}>
                                  <CheckIcon />
                                </IconButton>
                              )}
                            </InputAdornment>
                          ),
                        }),
                      }}
                    />


                    {/* City Field */}
                    <TextField
                      margin="normal"
                      fullWidth
                      id="City"
                      label="City"
                      name="City"
                      value={formData.City || ""}
                      onChange={onChangeHandler}
                      error={!!errors.City}
                      helperText={errors.City}
                      disabled={isEditMode ? !editableFields.includes("City") : false}
                      InputProps={{
                        ...(isEditMode && {
                          endAdornment: (
                            <InputAdornment position="end">
                              {!editableFields.includes("City") ? (
                                <IconButton onClick={() => setEditableFields([...editableFields, "City"])}>
                                  <EditIcon />
                                </IconButton>
                              ) : (
                                <IconButton onClick={() => setEditableFields(editableFields.filter(f => f !== "City"))}>
                                  <CheckIcon />
                                </IconButton>
                              )}
                            </InputAdornment>
                          ),
                        }),
                      }}
                    />

                    {/* Pincode Field */}
                    <TextField
                      margin="normal"
                      fullWidth
                      id="Pincode"
                      label="Pincode"
                      name="Pincode"
                      value={formData.Pincode || ""}
                      onChange={onChangeHandler}
                      error={!!errors.Pincode}
                      helperText={errors.Pincode}
                      disabled={isEditMode ? !editableFields.includes("Pincode") : false}
                      inputProps={{
                        inputMode: "numeric",
                        pattern: "[0-9]*",
                        maxLength: 6,
                      }}
                      InputProps={{
                        ...(isEditMode && {
                          endAdornment: (
                            <InputAdornment position="end">
                              {!editableFields.includes("Pincode") ? (
                                <IconButton onClick={() => setEditableFields([...editableFields, "Pincode"])}>
                                  <EditIcon />
                                </IconButton>
                              ) : (
                                <IconButton onClick={() => setEditableFields(editableFields.filter(f => f !== "Pincode"))}>
                                  <CheckIcon />
                                </IconButton>
                              )}
                            </InputAdornment>
                          ),
                        }),
                      }}
                    />

                    {/* State Field */}
                    <div style={{ position: "relative" }}>
                      <FormControl fullWidth margin="normal" error={!!errors.StateId}>
                        <InputLabel id="state-label">State</InputLabel>
                        <Select
                          labelId="state-label"
                          id="StateId"
                          name="StateId"
                          value={formData.StateId || ""}
                          onChange={onChangeHandler}
                          label="State"
                          disabled={isEditMode ? !editableFields.includes("StateId") : false}
                        >
                          {states.map((state) => (
                            <MenuItem key={state.StateId} value={state.StateId}>
                              {state.StateName}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.StateId && (
                          <Typography color="error">{errors.StateId}</Typography>
                        )}
                      </FormControl>
                      {isEditMode && (
                        <IconButton
                          onClick={() =>
                            editableFields.includes("StateId")
                              ? setEditableFields(editableFields.filter(f => f !== "StateId"))
                              : setEditableFields([...editableFields, "StateId"])
                          }
                          style={{
                            position: "absolute",
                            right: "8px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            backgroundColor: "white",
                          }}
                          size="small"
                        >
                          {editableFields.includes("StateId") ? <CheckIcon /> : <EditIcon />}
                        </IconButton>
                      )}
                    </div>

                    {/* District Field */}
                    <div style={{ position: "relative" }}>
                      <FormControl fullWidth margin="normal" error={!!errors.DistrictId}>
                        <InputLabel id="district-label">District</InputLabel>
                        <Select
                          labelId="district-label"
                          id="DistrictId"
                          name="DistrictId"
                          value={formData.DistrictId || ""}
                          onChange={onChangeHandler}
                          label="District"
                          disabled={isEditMode ? !editableFields.includes("DistrictId") : false}
                        >
                          {districts.map((district) => (
                            <MenuItem key={district.DistrictId} value={district.DistrictId}>
                              {district.DistrictName}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.DistrictId && (
                          <Typography color="error">{errors.DistrictId}</Typography>
                        )}
                      </FormControl>
                      {isEditMode && (
                        <IconButton
                          onClick={() =>
                            editableFields.includes("DistrictId")
                              ? setEditableFields(editableFields.filter(f => f !== "DistrictId"))
                              : setEditableFields([...editableFields, "DistrictId"])
                          }
                          style={{
                            position: "absolute",
                            right: "8px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            backgroundColor: "white",
                          }}
                          size="small"
                        >
                          {editableFields.includes("DistrictId") ? <CheckIcon /> : <EditIcon />}
                        </IconButton>
                      )}
                    </div>

                    {/* Aadhaar Number Field */}
                    <TextField
                      margin="normal"
                      fullWidth
                      id="AadhaarNumber"
                      label="Aadhaar Number"
                      name="AadhaarNumber"
                      value={formData.AadhaarNumber || ""}
                      onChange={onChangeHandler}
                      error={!!errors.AadhaarNumber}
                      helperText={errors.AadhaarNumber}
                      disabled={isEditMode ? !editableFields.includes("AadhaarNumber") : false}
                      InputProps={{
                        ...(isEditMode && {
                          endAdornment: (
                            <InputAdornment position="end">
                              {!editableFields.includes("AadhaarNumber") ? (
                                <IconButton onClick={() => setEditableFields([...editableFields, "AadhaarNumber"])}>
                                  <EditIcon />
                                </IconButton>
                              ) : (
                                <IconButton onClick={() => setEditableFields(editableFields.filter(f => f !== "AadhaarNumber"))}>
                                  <CheckIcon />
                                </IconButton>
                              )}
                            </InputAdornment>
                          ),
                        }),
                      }}
                    />

                    {/* WhatsApp Mobile Number Field */}
                    <TextField
                      margin="normal"
                      fullWidth
                      id="WhatsAppMobileNumber"
                      label="WhatsApp Mobile Number"
                      name="WhatsAppMobileNumber"
                      value={formData.WhatsAppMobileNumber || ""}
                      onChange={onChangeHandler}
                      error={!!errors.WhatsAppMobileNumber}
                      helperText={errors.WhatsAppMobileNumber}
                      inputProps={{ maxLength: 10 }}
                      disabled={isEditMode ? !editableFields.includes("WhatsAppMobileNumber") : false}
                      InputProps={{
                        ...(isEditMode && {
                          endAdornment: (
                            <InputAdornment position="end">
                              {!editableFields.includes("WhatsAppMobileNumber") ? (
                                <IconButton onClick={() => setEditableFields([...editableFields, "WhatsAppMobileNumber"])}>
                                  <EditIcon />
                                </IconButton>
                              ) : (
                                <IconButton onClick={() => setEditableFields(editableFields.filter(f => f !== "WhatsAppMobileNumber"))}>
                                  <CheckIcon />
                                </IconButton>
                              )}
                            </InputAdornment>
                          ),
                        }),
                      }}
                    />

                  </>
                )

                  : (
                    <>
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="RoleType"
                        label="Role Type"
                        name="RoleType"
                        value={formData.RoleType}
                        onChange={onChangeHandler}
                        error={!!errors.RoleType}
                        helperText={errors.RoleType}
                      />
                    </>
                  )}
                <DialogActions>
                  <Button onClick={handleClose} color="primary">
                    Cancel
                  </Button>
                  <Button type="submit" color="primary">
                    {isEditMode ? "Update" : "Add"}
                  </Button>
                </DialogActions>
              </Box>
            </DialogContent>
          </Dialog>
        </>
      )}
    </Layout>
  );
}

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

const customStyles = {
  container: {
    padding: "20px",
    backgroundColor: "#f0f0f0",
    borderRadius: "8px",
    marginTop: "25px",
  },
  header: {
    marginBottom: "10px",
    color: "#333",
  },
  addButton: {
    marginBottom: "20px",
    backgroundColor: "#4caf50",
  },
  tableContainer: {
    overflowX: "auto",
    marginBottom: "20px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    border: "1px solid #ddd",
    padding: "8px",
    backgroundColor: "#f2f2f2",
    color: "#333",
  },
  td: {
    border: "1px solid #ddd",
    padding: "8px",
    color: "#333",
  },
  tdCenter: {
    border: "1px solid #ddd",
    padding: "8px",
    textAlign: "center",
    color: "#333",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
  buttonGroup: {
    display: "flex",
    marginBottom: "20px",
    gap: "10px",
    marginTop: "25px",
  },

  activeButton: { backgroundColor: "#1976d2", color: "#fff" },
  inactiveButton: { backgroundColor: "#e0e0e0", color: "#000" },
};
