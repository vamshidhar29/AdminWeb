import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation, useSearchParams } from "react-router-dom";
import moment from "moment";
import MuiAlert from "@mui/material/Alert";
import {
  PersonOutline,
  CallOutlined,
  Build,
  CheckCircleOutline,
  PendingOutlined,
  ErrorOutline
} from '@mui/icons-material';
import {
  fetchDeleteData,
  fetchData,
  fetchAllData,
  uploadPdf,
  fetchUpdateData,
} from "../../helpers/externapi";
import Snackbar from "@mui/material/Snackbar";
import CardEditForms from "../../Components/CardEditForms";
import SelectNominee from "../../Components/SelectNominee";
import TableContainer from "@mui/material/TableContainer";
import ConfirmationDialogDelete from "../../Components/ConfirmationDialogDelete";
import Paper from "@mui/material/Paper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faIndianRupeeSign } from "@fortawesome/free-solid-svg-icons";
import { formatDate } from "../../Commoncomponents/CommonComponents";
import { Table } from "react-bootstrap";
import UserArea from "../UsersAreaAssign/AssignArea";
import { Box, Button, } from "@mui/material";
import Feedback from "react-bootstrap/esm/Feedback";


const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});


export default function CustomerPersonalDetails(props) {
  const [profile, setProfile] = useState(props.data);
  const navigate = useNavigate();
  const [file, setFile] = useState();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [PolicyCOINumber, setPolicyCOINumber] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [callResponseOptions, setCallResponseOptions] = useState([]);
  const [activeTab, setActiveTab] = useState("callHistory");
  const [formError, setFormError] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [callHistory, setCallHistory] = useState([]);
  const [cardDetails, setCardDetails] = useState([]);
  const [loading, setLoading] = useState();
  const [products, setProducts] = useState([]);
  const [showNominee, setShowNominee] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetailsTab, setShowProductDetailsTab] = useState(false);
  const initialFormData = {
    callHistoryId: "",
    callLog: "",
    CollectedDate: "",
    callResponsesId: "",
    DateToBeVisited: "",
  };
  const [addFormData, setAddFormData] = useState({
    AddressLine1: "",
    AddressLine2: "",
    StateName: "",
    StateId: "",
    DistrictName: "",
    DistrictId: "",
    City: "",
    Pincode: "",
    Village: "",
    Mandal: "",
    UserId: "",
    UserName: "",
    RmId: "",
    Table: "",
  });
  const [formData, setFormData] = useState(initialFormData);
  const [isFormValid, setIsFormValid] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationData, setConfirmationData] = useState({});
  const [availableProducts, setAvailableProducts] = useState();
  const [memberDetails, setMemberDetails] = useState();
  const [purchaseProduct, setPurchaseProduct] = useState();
  const [utrNumber, setUtrNumber] = useState("");
  const [utrError, setUtrError] = useState(false);
  const [paymentSuccessMsg, setPaymentSeccessMsg] = useState(false);
  const [comboProductDetails, setComboProductDetails] = useState([]);
  const [familyMembersLength, setFamilyMembesLength] = useState();
  const [cardNumberEntered, setCardNumberEntered] = useState(false);
  const [cardNumber, setCardNumber] = useState("2804 00");
  const [cardNumberError, setCardNumberError] = useState(null);
  const [memberPrdAddFail, setMemberProdAddFail] = useState("");
  const [paymentFailureError, setPaymentFailureError] = useState("");
  const [updatePaymentForProductError, setUpdatePaymentForProductError] =
    useState("");
  const [cardAddError, setCardAddError] = useState("");
  const [utrSubmitLoad, setUtrSubmitLoad] = useState(false);
  const [base64, setBase64] = useState(null);
  const [paUrl, setPaUrl] = useState("");
  const [policyUploadLoad, setPolicyUploadLoad] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedpolicy] = useState();
  const [cardLoading, setCardLoading] = useState(false);
  const [callHistoryLoading, setCallHistoryLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [isBookServiceHovered, setIsBookServiceHovered] = useState(false);
  const [gmcLoading, setGmcLoading] = useState(false);
  const [selectedIndividualProduct, setSelectedIndividualPrdouct] = useState();
  const [showIndividualProducts, setShowIndividualProducts] = useState(false);
  const [cardFrontImage, setCardFrontImage] = useState(null);
  const [cardBackImage, setCardBackImage] = useState(null);
  const [districtDropdown, setDistrictDropdown] = useState([]);
  const [stateDropdown, setStateDropdown] = useState([]);
  const [rmOptions, setRmOptions] = useState([]);
  const [selectedRM, setSelectedRM] = useState(profile?.RMId || "");
  const [isEditingRM, setIsEditingRM] = useState(false);
  const isFetching = useRef(false);
  const [claimedDate, setClaimedDate] = useState([]);
  const [claimDate, setClaimDate] = useState([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState(null);
  const [selectedStateId, setSelectedStateId] = useState(null);
  const [activeSection, setActiveSection] = useState("product");
  const [activeServiceTab, setActiveServiceTab] = useState("claimServices");
  const [activeActivityTab, setActiveActivityTab] = useState("all");
  const UserId = localStorage.getItem("UserId");
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [activity, setActivity] = useState([]);
  const { Id } = useParams();
  const [customerData, setCustomerData] = useState(null);
  const location = useLocation();
  const [feedBack, setFeedBack] = useState("");
  const [imageUrl, setImageUrl] = useState('');

  const statusConfig = {
    "Confirmed": { color: "#28a745", icon: "check-circle", textColor: "#fff" },
    "Pending": { color: "#ffc107", icon: "clock", textColor: "#212529" },
    "Cancelled": { color: "#dc3545", icon: "times-circle", textColor: "#fff" },
    // Default fallback
    "default": { color: "#6c757d", icon: "info-circle", textColor: "#fff" }
  };
  const statusColors = {
    "Initiated": { text: "#3498db", bg: "#D6EAF8" },   // Blue
    "Requested": { text: "#2ecc71", bg: "#D4EFDF" },  // Green
    "Booked": { text: "#1abc9c", bg: "#D1F2EB" },     // Teal
    "Visited": { text: "#f39c12", bg: "#FDEBD0" },    // Orange
    "Customer Feedback": { text: "#e74c3c", bg: "#FADBD8" }, // Red
    "Hospital Feedback": { text: "#9b59b6", bg: "#EBDEF0" }, // Purple
    "Success": { text: "#27ae60", bg: "#D5F5E3" },   // Dark Green
    "Not Visited": { text: "#34495e", bg: "#D6DBDF" } // Dark Blue-Gray
  };
  useEffect(() => {
    // Check for hash in URL
    if (location.hash === '#services') {
      setActiveSection('services');
    }
  }, [location]);

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  useEffect(() => {
    const getPAUrl = async () => {
      const response = await fetchData("ConfigValues/all", {
        skip: 0,
        take: 0,
      });
      const bucketUrl =
        response &&
        response.length > 0 &&
        response.find((val) => val.ConfigKey === "policiesDownloadURL");
      setPaUrl(bucketUrl.ConfigValue);

      const frontimage =
        response &&
        response.length > 0 &&
        response.find((val) => val.ConfigKey === "CardFront");
      setCardFrontImage(frontimage.ConfigValue);
      setPaUrl(bucketUrl.ConfigValue);

      const backimage =
        response &&
        response.length > 0 &&
        response.find((val) => val.ConfigKey === "CardBack");
      setCardBackImage(backimage.ConfigValue);
      setPaUrl(bucketUrl.ConfigValue);

      const userImageBucket =
        response &&
        response.length > 0 &&
        response.find((val) => val.ConfigKey === "UserImagegBucketLink ");
      if (userImageBucket) {
        setImageUrl(userImageBucket.ConfigValue);
      }
    };

    getPAUrl();
  }, []);

  useEffect(() => {
    const isFormValid = formData.callResponsesId.length > 0;
    setIsFormValid(isFormValid);
  }, [formData]);

  useEffect(() => {
    const getCallResponse = async () => {
      setLoading(true);
      try {
        const getResponseTypes = await fetchData("CallResponseType/all", {
          skip: 0,
          take: 0,
        });

        let CallResponseTypeId = getResponseTypes.filter(
          (types) => types.ResponseName === "Member"
        );

        const response = await fetchAllData(
          `CallResponse/GetCallResponsesByResponseType/${CallResponseTypeId[0].CallResponseTypeId}`
        );
        setCallResponseOptions(response);
      } catch (error) {
        console.error("Error fetching call responses:", error);
      } finally {
        setLoading(false);
      }
    };

    const getAvailableProducts = async () => {
      setLoading(true);
      try {
        if (
          cardDetails &&
          products &&
          cardDetails.status &&
          products.length > 0
        ) {
          const response = await fetchAllData(
            `MembersProducts/GetProductForMember/${memberDetails[0].MemberId}`
          );
          setAvailableProducts(response);
        } else {
          const response = await fetchData("Products/all", {
            skip: 0,
            take: 0,
          });

          let getCombo = [];

          response &&
            response.length > 0 &&
            response.map((each) => {
              if (each.IsCombo) {
                getCombo = [...getCombo, each];
              }
            });

          setAvailableProducts(getCombo);
        }
      } catch (error) {
        console.error("Error fetching available products: ", error);
      }
    };

    getAvailableProducts();
    getCallResponse();
  }, [memberDetails, products]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setCardLoading(true);
        const response = await fetchAllData(
          `lambdaAPI/OHOCards/GetMemberCardByMemberId/${Id}`
        );
        setCardDetails(response);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setCardLoading(false);
      }
    };

    fetchData();
  }, [Id]);

  useEffect(() => {
    const fetchMemberData = async () => {
      setLoading(true);
      try {
        const response = await fetchAllData(`lambdaAPI/Customer/GetById/${Id}`);
        setMemberDetails(response);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    const fetchProductsData = async () => {
      setLoading(true);
      try {
        setProductsLoading(true);
        const response = await fetchAllData(`lambdaAPI/Customer/GetMemberProducts/${Id}`);

        setProducts(response[0].Products);
        setPolicies(response[0].Products[0].Policies);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchMemberData();
    fetchProductsData();
  }, [Id]);

  const claimedData = async () => {
    try {
      setLoading(true);
      const response = await fetchData("lambdaAPI/BookingConsultation/PendingAndSuccessConsultationList", {
        CustomerId: Id,
        IsCouponClaimed: true
      });
      setClaimedDate(response);
    } catch (error) {
      console.error("Error fetching claimedData data:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    claimedData();
  }, []);

  // Function to fetch all activities
  const fetchAllActivities = async () => {
    try {
      setLoading(true);
      // Only pass CustomerId without ActivityCategory
      const response = await fetchData("lambdaAPI/BookingConsultationActivity/GetBookingActivityByCustomerId", {
        CustomerId: Id
      });
      setActivity(response);
    } catch (error) {
      console.error("Error fetching all activities:", error);
      setFeedBack(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // If you need to filter activities client-side instead
  const filterActivities = (type) => {
    return activity.filter(item => item.ActivityCategory === type);
  };

  // Usage example
  useEffect(() => {
    fetchAllActivities();
  }, [Id]);

  // Later in your code, when you need specific types:
  const bookingActivities = filterActivities("Booking");
  const feedbackActivities = filterActivities("feedBack");
  const fetchActivitiesByCategory = async (category) => {
    try {
      setLoading(true);
      // Try using a different parameter format 
      const params = {
        CustomerId: Id
      };

      // Only add ActivityCategory if a category is provided
      if (category) {
        params.ActivityCategory = category;
      }

      const response = await fetchData("lambdaAPI/BookingConsultationActivity/GetBookingActivityByCustomerId", params);
      return response;
    } catch (error) {
      console.error(`Error fetching ${category || "all"} activities:`, error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Then use it like this:
  const loadAllData = async () => {
    const allActivities = await fetchActivitiesByCategory();
    setActivity(allActivities);


  };
  // Add Id to dependencies if it can change
  // useEffect(() => {
  //   const getClaimedData = async () => {
  //     console.log("Selected Activity ID:", selectedActivityId);

  //     if (selectedActivityId == null) {
  //       console.log("No Activity ID selected or it is null, resetting activity.");
  //       setActivity([]);
  //       return;
  //     }

  //     try {
  //       setLoading(true);
  //       const response = await fetchData(
  //         `lambdaAPI/BookingConsultation/GetBookingActivityByBookingId`,
  //         { BookingConsultationId: selectedActivityId } // Use selectedActivityId in the payload
  //       );

  //       console.log("API Response:", response);

  //       if (Array.isArray(response)) {
  //         setActivity(
  //           response.map((activity) => ({
  //             ...activity,
  //             id: activity.BookingId,
  //           }))
  //         );
  //       } else {
  //         console.log("Response is not an array:", response);
  //         setActivity([]);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching claimed data:", error);
  //       setActivity([]);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   getClaimedData();
  // }, [selectedActivityId]);






  // useEffect(() => {
  //   // Check for tab parameter in URL
  //   const tabParam = searchParams.get('tab');

  //   // Check for state passed from navigation
  //   const navigationState = location.state;

  //   // Prioritize URL parameter, then navigation state
  //   if (tabParam === 'services') {
  //     setActiveSection('services');
  //   } else if (navigationState?.focusOnServices) {
  //     setActiveSection('services');
  //   }
  // }, [searchParams, location.state]);
  const handleCardNumberChange = (e) => {
    let input = e.target.value.replace(/\D/g, "").substring(6);
    if (input.length > 6) {
      input = input.slice(0, 6);
    }
    const formattedCardNumber = `2804 00${input.slice(0, 2)} ${input.slice(
      2
    )}`.trim();
    setCardNumber(formattedCardNumber);
  };

  const checkCardNumberExists = async () => {
    try {
      const response = await fetchData("OHOCards/cardNumberExistorNot", {
        cardNumber,
        rmId: UserId,
        memberId: Id,
      });
      if (response.status === true) {
        setCardNumberEntered(true);
        setCardNumberError(null);
      } else {
        setCardNumberError(response.message);
      }
    } catch (error) {
      setCardNumberError(
        "An error occurred while checking the card number. Please try again."
      );
    }
  };

  const handleProductClick = async (product) => {
    // setSelectedProduct((prevProduct) =>
    //     prevProduct && prevProduct.ProductsId === product.ProductsId ? null : product
    // );

    setSelectedProduct(product);

    const details = await fetchAllData(
      `ComboProducts/FetchComboProducts/${product.ProductsId}`
    );
    setComboProductDetails(details);

    const response = await fetchAllData(
      `MemberDependent/GetDependentsByMemberProductId/${Id}/${product.ProductsId}`
    );
    setFamilyMembesLength(response.length);

    const isSameProduct =
      selectedProduct && selectedProduct.ProductsId === product.ProductsId;
    setShowNominee(true);
    // if (isSameProduct) {
    //     setIsEditing(true);
    //     setShowProductDetailsTab(true);
    //     setActiveTab('products');
    // } else {
    setShowProductDetailsTab(true);
    setActiveTab("products");
    // }
  };

  const handleSave = () => {
    if (!selectedRM) return;

    // Call API or function to update RM
    setIsEditing(false);
  };
  const EditAddress = async () => {
    try {
      setLoading(true);

      const addressUpdateData = [
        {
          columnName: "AddressLine1",
          columnValue: addFormData.AddressLine1,
          tableName: "Customer",
          tableId: Id,
          UpdatedBy: UserId
        },
        {
          columnName: "AddressLine2",
          columnValue: addFormData.AddressLine2,
          tableName: "Customer",
          tableId: Id,
          UpdatedBy: UserId
        },
        {
          columnName: "StateId",
          columnValue: addFormData.StateId,
          tableName: "Customer",
          tableId: Id,
          UpdatedBy: UserId
        },
        {
          columnName: "DistrictId",
          columnValue: addFormData.DistrictId,
          tableName: "Customer",
          tableId: Id,
          UpdatedBy: UserId
        },
        {
          columnName: "city",
          columnValue: addFormData.City,
          tableName: "Customer",
          tableId: Id,
          UpdatedBy: UserId
        },
        {
          columnName: "Pincode",
          columnValue: addFormData.Pincode,
          tableName: "Customer",
          tableId: Id,
          UpdatedBy: UserId
        },
        {
          columnName: "Village",
          columnValue: addFormData.Village,
          tableName: "Customer",
          tableId: Id,
          UpdatedBy: UserId
        },
        {
          columnName: "Mandal",
          columnValue: addFormData.Mandal,
          tableName: "Customer",
          tableId: Id,
          UpdatedBy: UserId
        },
      ];

      const EditData = await fetchUpdateData(
        "lambdaAPI/Update/CommonUpdate",
        addressUpdateData
      );

      if (EditData) {
        alert("Address updated successfully!");
        setIsEditing(false);

        setTimeout(() => {
          window.location.reload();
        }, 500);

      }

    } catch (error) {
      console.error("Error updating address:", error);
    } finally {
      setLoading(false);
      setIsEditing(false);
    }
  };

  const handleRMUpdate = async () => {
    if (isFetching.current) return;
    isFetching.current = true;

    try {
      setLoading(true);

      // Fetch all RM names to get the UserId of the selected RM
      const usersData = await fetchAllData(`lambdaAPI/Employee/GetRMNames`);
      setRmOptions(
        usersData?.map((user) => ({
          label: user.UserName,
          value: user.UserId,
        })) || []
      );

      // Find the UserId of the selected RM
      const selectedUser = usersData?.find((user) => user.UserId === selectedRM);
      const selectedUserId = selectedUser ? selectedUser.UserId : null;



      const updateData = [
        {
          columnName: "EmployeeId",
          columnValue: selectedRM,
          tableName: "Customer",
          tableId: Id,
          UpdatedBy: UserId
        },
      ];

      const response = await fetchUpdateData("lambdaAPI/Update/CommonUpdate", updateData);


      if (response) {
        alert("RM updated successfully!");
        setIsEditingRM(false);

        setTimeout(() => {
          window.location.reload();
        }, 500);

      }
    } catch (error) {
      console.error("Error updating RM:", error);

    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  useEffect(() => {
    const getStateDropdown = async () => {
      try {
        const statesData = await fetchData("States/all", { UserId });


        if (Array.isArray(statesData)) {
          setStateDropdown(statesData);
        } else {
          console.error("States data is not an array:", statesData);
          setStateDropdown([]);
        }
      } catch (error) {
        console.error("Error fetching states:", error);
      }
    };

    if (UserId) getStateDropdown();
  }, [UserId]);

  const getDistricts = async (stateId) => {
    if (!stateId) return;

    try {
      const districtsData = await fetchAllData(`Districts/GetByStateId/${stateId}`);
      setDistrictDropdown(districtsData || []);
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
  };

  const handleStateChange = (e) => {
    const selectedStateId = e.target.value;


    setAddFormData((prevData) => ({
      ...prevData,
      StateId: selectedStateId,
      DistrictId: "", // Reset district when state changes
    }));

    getDistricts(selectedStateId); // Fetch districts for selected state
  };

  const handleDistrictChange = (e) => {
    const districtId = e.target.value;

    setAddFormData((prevData) => ({
      ...prevData,
      DistrictId: districtId,
    }));
  };

  useEffect(() => {
    if (addFormData.StateId) {
      getDistricts(addFormData.StateId); // Load districts when editing
    }
  }, [addFormData.StateId]);

  useEffect(() => {

  }, [districtDropdown]);

  useEffect(() => {

  }, [districtDropdown]);

  const getRegionalManagers = async (rmId = null) => {

    if (isFetching.current) return;
    isFetching.current = true;
    try {
      if (rmId) {
        // Fetch RM by ID (after updating RM)
        const userData = await fetchAllData(`Users/GetRMById?rmId${Id}`);
        setSelectedRM(userData?.UserId)
        setProfile((prev) => ({
          ...prev,
          RMName: userData?.UserName || "Not exist", // Update displayed RM name
        }));
      } else {
        // Fetch all RM names
        const usersData = await fetchAllData(`lambdaAPI/Employee/GetRMNames`);
        setRmOptions(
          usersData?.map((user) => ({
            label: user.UserName,
            value: user.UserId,
          })) || []
        );
      }
    } catch (error) {
      console.error("Error fetching RM data:", error);
    } finally {
      isFetching.current = false;
    }
  };


  const handleDelete = () => {
    setConfirmationData({
      title: "Delete Member",
      message: "Are you sure you want to delete this Member?",
      onConfirm: () => confirmhandleDelete(),
    });
    setConfirmationOpen(true);
  };

  const confirmhandleDelete = async () => {
    try {
      const response = await fetchDeleteData(`lambdaAPI/Customer/delete/${Id}`);
      if (response.status === false) {
        setSnackbarMessage(response.message);
        setSnackbarOpen(true);
        return;
      }
      setSnackbarMessage(`Deleted Successfully`);
      setSnackbarOpen(true);

      setTimeout(() => {
        navigate("/customers/list");
      }, 2000);
    } catch (error) {
      console.error("Error deleting event:", error);
      setSnackbarMessage("Failed to delete. Please try again.");
      setSnackbarOpen(true);
    }
  };

  const fetchCallHistoryData = async () => {
    setLoading(true);
    try {
      setCallHistoryLoading(true);
      const response = await fetchAllData(
        `lambdaAPI/CallHistory/GetAllCallHistoryByCustomerId/${Id}`
      );
      setCallHistory(response);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    } finally {
      setCallHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchCallHistoryData();
  }, [Id]);

  const handleAddNewCallLog = () => {
    setFormVisible(true);
    setFormData({
      callHistoryId: "",
      callLog: "",
      CollectedDate: "",
      callResponsesId: "",
      DateToBeVisited: "",
    });
  };

  const handleBackToView = () => {
    setFormVisible(false);
  };

  const formatCardNumber = (cardNumber) => {
    if (!cardNumber) return "";
    const chunks = cardNumber.replace(/\s/g, "").match(/.{1,4}/g);
    return chunks.join(" ");
  };

  const handlePrint = () => {
    // Concatenate the address as needed
    const addAddress = () => {
      let address = "";
      selectedProduct.AddressLine1 &&
        (address = `${address} ${selectedProduct.AddressLine1}`);
      selectedProduct.AddressLine2 &&
        (address = `${address}, ${selectedProduct.AddressLine2}`);
      selectedProduct.Village &&
        (address = `${address}, ${selectedProduct.Village}`);
      selectedProduct.City && (address = `${address}, ${selectedProduct.City}`);
      selectedProduct.Mandal &&
        (address = `${address}, ${selectedProduct.Mandal}`);
      selectedProduct.District &&
        (address = `${address}, ${selectedProduct.District}`);
      selectedProduct.State &&
        (address = `${address}, ${selectedProduct.State}`);
      selectedProduct.pincode &&
        (address = `${address}, ${selectedProduct.pincode}`);
      return address;
    };

    const recipientName = selectedProduct.Name || "Recipient Name";
    const recipientMobile = selectedProduct.MobileNumber || "Mobile Number";

    const fromAddress = `
                OHOINDIA LIFE TECH PVT. LTD<br>
                5th Floor, 1-98/9/4/20,<br>
                Arunodaya Colony, VIP Hills,<br>
                Hi-Tech City, Madhapur,<br>
                Hyderabad, Telangana 500081<br>
                Mobile No. 7671997108
            `;

    const appDetails = `
            <div style="text-align: center; padding: 10px; margin-bottom: 20px;">
                <img src="${process.env.PUBLIC_URL}/assets/applogo.png" height="50" alt="App Logo" /><br>
                <strong>OHOINDIA</strong><br>
                Website:- www.ohoindialife.com<br>
                Contact No:- 7671997108 / 7032107108<br>
                Email:- contact@ohoindialife.com<br>
            </div>
            `;

    const printWindow = window.open("", "", "width=396,height=912");
    printWindow.document.write("<html>");
    printWindow.document.write(`
                        <style>
                            @page {
                                size: 4.125in 9.5in;
                                margin: 0;
                            }
                            body {
                                font-family: Arial, sans-serif;
                                padding: 20px;
                            }
                            .box {
                                border: 1px solid black;
                                padding: 10px;
                                margin-bottom: 20px;
                            }
                            h5 {
                                margin: 0;
                            }
                        </style>
                    `);
    printWindow.document.write("<body>");
    printWindow.document.write(appDetails);
    printWindow.document.write(`
                        <div class="box">
                            <strong>From:</strong><br>
                            ${fromAddress}
                        </div>
                        <div class="box">
                            <strong>To:</strong><br>
                            <h5>${recipientName}</h5>
                            ${addAddress()}<br>
                            <strong>Mobile:</strong> ${recipientMobile}
                        </div>
                    `);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };

  const handleUploadChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);

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
  };

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    const content = base64.split("base64,");

    const formData = new FormData();
    formData.append("MemberId", Id);
    formData.append("productsId", selectedPolicy.PoliciesProductsId);
    formData.append(
      "individualProductsId",
      selectedPolicy.IndividualProductsId
    );
    formData.append("policyDocument", file);
    formData.append("memberProductId", selectedPolicy.PoliciesMemberProductId);
    formData.append("PolicyCOINumber", PolicyCOINumber);
    formData.append("FileContent", content[1]);

    try {
      setPolicyUploadLoad(true);

      const uploadFile = await uploadPdf(
        "lambdaAPI/Subscription/uploadingPolicyDoc",
        formData
      );
      setSnackbarMessage(uploadFile.message);
      setSnackbarOpen(true);
      setPolicyUploadLoad(false);

      // setTimeout(() => {
      //   window.location.reload();
      // }, 2000);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleGenerateMembership = async () => {
    try {
      setGmcLoading(true);
      const configResponse = await fetchData("ConfigValues/all", {
        skip: 0,
        take: 0,
      });

      const bucketUrlConfig =
        configResponse && configResponse.length > 0
          ? configResponse.find(
            (val) => val.ConfigKey === "policiesDownloadURL"
          )
          : null;

      if (!bucketUrlConfig) {
        console.error("Policies download URL configuration not found.");
        alert("Unable to download PDF. Configuration missing.");
        return;
      }

      const bucketUrl = bucketUrlConfig.ConfigValue;

      const response = await fetchData("lambdaAPI/Payment/PolicyGeneration", {
        memberId: Id,
        productsId: selectedProduct.ProductsId,
        MemberProductId: selectedProduct.MemberProductId,
      });

      const { status, message, data } = response || {};

      if (status && data) {
        const downloadUrl = `${bucketUrl}${data}`;

        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = data;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error(
          "File generation failed or data is missing. Status:",
          status,
          "Message:",
          message
        );
        alert("Unable to download PDF. " + message);
      }
    } catch (error) {
      console.error("Error downloading membership PDF:", error);
      alert("An error occurred while trying to download the PDF.");
    } finally {
      setGmcLoading(false);
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      let CallHistoryData;
      const requestData = {
        callLog: formData.callLog,
        CustomerId: Id,
        userId: UserId,
        callResponsesId: formData.callResponsesId,
        DateToBeVisited:
          formData.DateToBeVisited === "" ? null : formData.DateToBeVisited,
        RequestCallBack:
          formData.RequestCallBack === "" ? null : formData.RequestCallBack,
      };

      // if (formData.DateToBeVisited) {
      //     requestData.DateToBeVisited = new Date(formData.DateToBeVisited).toISOString();
      // }

      // if (formData.RequestCallBack) {
      //     requestData.RequestCallBack = new Date(formData.RequestCallBack).toISOString();
      // }

      // if (isEditing) {
      //     requestData.callHistoryId = formData.callHistoryId;
      //     CallHistoryData = await fetchUpdateData('CallHistory/update', requestData);
      //     setSnackbarMessage("Call log updated successfully!");
      // } else {
      CallHistoryData = await fetchData("lambdaAPI/CallHistory/add", requestData);
      setSnackbarMessage("New call log added successfully!");
      // }

      setCallHistory(CallHistoryData);
      setSnackbarOpen(true);
      setIsEditing(false);

      await fetchCallHistoryData();
    } catch (error) {
      console.error("Error adding call log:", error);
    } finally {
      setLoading(false);
      setFormVisible(false);
      setFormData(initialFormData);
    }
  };

  const handleEditForm = () => {
    navigate("/customers/new", { state: { profile } });
  };

  const handleResetForm = () => {
    setFormData(initialFormData);
    setFormError({});
  };

  const onChangeHandler = (event) => {
    const { name, value, type, checked } = event.target;
    let updatedFormData = {
      ...formData,
      [name]: type === "checkbox" ? (checked ? value : "") : value,
    };
    let error = "";

    //if (name === 'DateToBeVisited' && value.length === 10) {
    //    const defaultTime = "T00:00:00";
    //    updatedFormData = { ...updatedFormData, DateToBeVisited: `${value}${defaultTime}` };
    //}
    setFormData(updatedFormData);
    setFormError({ ...formError, [name]: error });
  };

  const cardActiveAndDeactive = async () => {
    const memberId = cardDetails.returnData[0].CardPurchasedMemberId;
    const isActivated =
      cardDetails.returnData[0].IsActivated === null
        ? true
        : cardDetails.returnData[0].IsActivated === false
          ? true
          : false;

    const updateApi = await fetchData("lambdaAPI/OHOCards/ActivateorDeactivateTheCard", {
      customerId: Id,
      isActivated,
    });

    window.location.reload();
  };

  const handleUpdateActivated = (message) => {
    setConfirmationData({
      title: `${message} Caed`,
      message: `Are you sure you want to ${message} this Card?`,
      onConfirm: () => cardActiveAndDeactive(),
    });
    setConfirmationOpen(true);
  };

  const onChangeUtrNumber = (e) => {
    setUtrNumber(e.target.value);
  };

  const submitUtrForm = async (e) => {
    e.preventDefault();

    if (utrNumber && utrNumber.length >= 10) {
      setUtrError(false);
      setUtrSubmitLoad(true);

      const memberProductPayload = {
        productsId: purchaseProduct.ProductsId,
        memberId: memberDetails[0].MemberId,
        userId: UserId,
      };

      const responseMemberProductAdd = await fetchData(
        "MembersProducts/add",
        memberProductPayload
      );

      if (responseMemberProductAdd && responseMemberProductAdd.length > 0) {
        setMemberProdAddFail("");

        const paymentPayload = {
          paidAmount: purchaseProduct.SaleAmount,
          utrNumber: utrNumber,
          typeofCard: "Privilege",
          memberProductId: responseMemberProductAdd[0].memberProductId,
          memberId: memberDetails[0].MemberId,
        };

        const responsePayment = await fetchData(
          "PaymentDetails/add",
          paymentPayload
        );

        if (responsePayment && responsePayment.paymentDetailsId) {
          setPaymentFailureError("");

          const paymentMemberProductPayload = {
            productsId: responseMemberProductAdd[0].productsId,
            memberId: memberDetails[0].MemberId,
            paymentDetailsId: responsePayment.paymentDetailsId,
          };

          const responsePaymentMemberProduct = await fetchData(
            "PaymentDetails/UpdatePaymentIdInMemberProduct",
            paymentMemberProductPayload
          );

          if (responsePaymentMemberProduct) {
            setUpdatePaymentForProductError("");

            const ohoCardPayload = {
              ohoCardsId: 0,
              ohoCardNumber: cardNumber,
              assignedToRM: UserId,
              assignedToMember: memberDetails[0].MemberId,
              cardPurchasedMemberId: memberDetails[0].MemberId,
              productsId: responseMemberProductAdd[0].productsId,
              userId: UserId,
            };

            const responseOhoCard = await fetchData(
              "OHOCards/add",
              ohoCardPayload
            );

            setPaymentSeccessMsg(true);
            if (responseOhoCard && responseOhoCard.status) {
              setCardAddError("");
              setPaymentSeccessMsg(true);
              setTimeout(() => {
                setPurchaseProduct();
                setPaymentSeccessMsg(false);
                setUtrNumber("");
                setUtrError(false);
                setUtrSubmitLoad(false);
                window.location.reload();
              }, 2000);
            } else {
              setUtrSubmitLoad(false);
              setCardAddError(
                "Sorry, Failed to add card. Please contact Technical team"
              );
              console.error("Failed to generate OHO card:", responseOhoCard);
            }
          } else {
            setUtrSubmitLoad(false);
            setUpdatePaymentForProductError(
              "Sorry, Failed to update payment for product. Please contact technical team"
            );
          }
        } else {
          setUtrSubmitLoad(false);
          setPaymentFailureError(
            "Sorry payment failed. Please contact technical team."
          );
        }
      } else {
        setUtrSubmitLoad(false);
        setMemberProdAddFail(
          "Sorry, Failed to add product. Please contact technical team"
        );
      }
    } else {
      setUtrError(true);
    }
  };

  const handleBookService = async (e) => {
    e.preventDefault();
    navigate("/HospitalConsultation/book", {
      state: { memberId: Id },
    });
  };

  const handleSelectPolicy = (data) => {
    setSelectedpolicy(data);
    setFile();
  };

  const showIndividualProductView = () => (
    <div className="my-2">
      <h5 className="text-center text-danger fw-semibold">
        {selectedIndividualProduct.PoliciesProductName}
      </h5>

      <SelectNominee
        comboProductId={selectedIndividualProduct.IndividualProductsId}
        selectedProduct={selectedIndividualProduct}
        customerId={Id}
      />

      <CardEditForms
        selectedProductId={selectedIndividualProduct.IndividualProductsId}
        selectedProduct={selectedIndividualProduct}
      />
    </div>
  );

  const handleCloseModal = () => {
    setSelectedpolicy();
    setFile();
  };

  const handleProductsBack = () => {
    if (showIndividualProducts) {
      setShowIndividualProducts(false);
    } else {
      setActiveTab("");
    }
  };

  const thresholdDays = 5;

  return (
    <>
      <div className="row justify-content-center mt-2">
        <div className="col-lg-8 col-md-12">
          <div className="card border-0 rounded-4 overflow-hidden">
            <div className="position-relative">

              <div
                className="bg-gradient-primary w-100"
                style={{
                  height: "100px",
                  background: "linear-gradient(135deg, #4158d0 0%, #c850c0 75%, #ffcc70 100%)"
                }}
              ></div>


              <div className="px-4">
                <div className="d-flex flex-wrap align-items-end gap-4">

                  <div className="position-relative mt-n5">
                    <div className="rounded-circle p-1 bg-white" style={{ width: "150px", height: "150px" }}>
                      <img
                        src={
                          profile.MemberImage
                            ? `${imageUrl}${profile.MemberImage}`
                            : profile.Gender && profile.Gender === "Female"
                              ? "../../assets/img/womenlogo.jpg"
                              : "../../assets/img/menlogo.jpg"
                        }
                        className="rounded-circle w-100 h-100"
                        style={{ objectFit: "cover" }}
                        alt="User avatar"
                      />
                    </div>
                  </div>


                  <div className="d-flex flex-column flex-grow-1">
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                      <div>
                        <h2 className="fw-bold mb-1" style={{ color: "#000" }}>
                          {profile.Name}
                        </h2>
                        <div className="d-flex align-items-center flex-wrap gap-2">
                          {profile.Gender && (
                            <span className="badge bg-info bg-opacity-10  fw-normal px-3 py-2 rounded-pill">
                              <i className="bx bx-user me-1"></i> {profile.Gender}
                            </span>
                          )}
                          {profile.RegisterOn && (
                            <span className="badge bg-light text-secondary fw-normal px-3 py-2 rounded-pill">
                              <i className="bx bx-calendar me-1"></i>
                              Joined {moment(profile.RegisterOn).format("DD MMM YYYY")}
                            </span>
                          )}
                        </div>
                      </div>


                      <div className="d-flex gap-2 mt-2 mt-md-0">
                        {/* <button className="btn btn-primary rounded-pill px-3 py-2 d-flex align-items-center gap-2">
                          <i className="bx bx-user-voice fs-5"></i>
                          <span className="d-none d-sm-inline">Contact</span>
                        </button> */}
                        <button
                          className="btn btn-outline-danger rounded-pill px-3 py-2 d-flex align-items-center gap-2"
                          onClick={handleDelete}
                        >
                          <i className="bx bx-trash-alt fs-5"></i>
                          <span className="d-none d-sm-inline">Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            <div className="card-body p-4">
              <div className="row g-4">

                <div className="col-md-4">

                  <h5 className="d-flex align-items-center">
                    <span className="icon-wrapper d-flex align-items-center justify-content-center rounded-circle bg-primary text-white me-3"
                      style={{ width: "38px", height: "38px" }}>
                      <i className="bx bx-phone fs-5"></i>
                    </span>
                    Contact Details
                  </h5>

                  <ul className="list-unstyled mb-0">
                    <li className="pb-3">
                      <div className="d-flex align-items-start">
                        <i className="bx bx-phone-call text-primary fs-4 me-3 mt-1"></i>
                        <div>
                          <div className="text-muted mb-1">Mobile Number</div>
                          {profile.MobileNumber ? (
                            <a href={`tel:${profile.MobileNumber}`} className="text-decoration-none fw-semibold fs-5">
                              {profile.MobileNumber}
                            </a>
                          ) : (
                            <span className="text-danger fw-semibold">Not Available</span>
                          )}
                        </div>
                      </div>
                    </li>
                    {profile.AlternateMobileNumber ? (
                      <li className="pb-3">
                        <div className="d-flex align-items-start">
                          <i className="bx bx-phone-call text-primary fs-4 me-3 mt-1"></i>
                          <div>
                            <div className="text-muted mb-1">Alternate Mobile Number</div>
                            {profile.AlternateMobileNumber ? (
                              <a href={`tel:${profile.AlternateMobileNumber}`} className="text-decoration-none fw-semibold fs-5">
                                {profile.AlternateMobileNumber}
                              </a>
                            ) : (
                              <span className="text-danger fw-semibold">Not Available</span>
                            )}
                          </div>
                        </div>
                      </li>
                    ) : null}
                    <li className="pb-3">
                      <div className="d-flex align-items-start">
                        <i className="bx bx-envelope text-primary fs-4 me-3 mt-1"></i>
                        <div>
                          <div className="text-muted mb-1">Email Address</div>
                          {profile.Email ? (
                            <a href={`mailto:${profile.Email}`} className="text-decoration-none fw-semibold text-break">
                              {profile.Email}
                            </a>
                          ) : (
                            <span className="text-danger fw-semibold">Not Available</span>
                          )}
                        </div>-
                      </div>
                    </li>
                    <li>
                      <div className="d-flex align-items-start">
                        <i className="bx bx-calendar-event text-primary fs-4 me-3 mt-1"></i>
                        <div>
                          <div className="text-muted mb-1">Date of Birth</div>
                          {profile.DateofBirth ? (
                            <span className="fw-semibold">
                              {moment(profile.DateofBirth).format("DD MMM YYYY")}
                            </span>
                          ) : (
                            <span className="text-warning fw-semibold">Not updated</span>
                          )}
                        </div>
                      </div>
                    </li>
                  </ul>

                </div>

                {/* Management Information Card */}
                <div className="col-md-4">

                  <h5 className="d-flex align-items-center">
                    <span className="icon-wrapper d-flex align-items-center justify-content-center rounded-circle bg-primary text-white me-3"
                      style={{ width: "38px", height: "38px" }}>
                      <i className="bx bx-user-check fs-5"></i>
                    </span>
                    Management
                  </h5>

                  <div className="position-relative">
                    <div className="d-flex align-items-start">
                      <i className="bx bx-id-card text-primary fs-4 me-3 mt-1"></i>
                      <div className="w-100">
                        <div className="text-muted mb-1">Regional Manager</div>
                        <div className="mt-2 d-flex align-items-center">
                          {!isEditingRM ? (
                            <>
                              <span className="fw-semibold fs-5">
                                {profile.RMName || <span className="text-danger">Not assigned</span>}
                              </span>
                              <button
                                className="btn btn-link btn-sm text-primary p-0 ms-3"
                                onClick={() => {
                                  getRegionalManagers();
                                  setIsEditingRM(true);
                                }}
                              >
                                <i className="bx bx-edit-alt fs-5"></i>
                              </button>
                            </>
                          ) : (
                            <div className="d-flex flex-column w-100 gap-3">
                              <select
                                className="form-select"
                                value={selectedRM}
                                onChange={(e) => setSelectedRM(e.target.value)}
                              >
                                <option value="">Select Regional Manager</option>
                                {rmOptions.map((rm) => (
                                  <option key={rm.value} value={rm.value}>
                                    {rm.label}
                                  </option>
                                ))}
                              </select>
                              <div className="d-flex gap-2 mt-2">
                                <button className="btn btn-success py-2 px-3 flex-grow-1" onClick={handleRMUpdate}>
                                  <i className="bx bx-check me-1"></i> Save
                                </button>
                                <button className="btn btn-outline-secondary py-2 px-3" onClick={() => setIsEditingRM(false)}>
                                  <i className="bx bx-x"></i> Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Address Information Card */}
                <div className="col-md-4">

                  <div className="d-flex align-items-center justify-content-between">
                    <h5 className="d-flex align-items-center mb-0">
                      <span className="icon-wrapper d-flex align-items-center justify-content-center rounded-circle bg-primary text-white me-3"
                        style={{ width: "38px", height: "38px" }}>
                        <i className="bx bx-map fs-5"></i>
                      </span>
                      Address
                    </h5>

                    {!isEditing && (
                      <span
                        className="text-primary cursor-pointer"
                        onClick={() => {
                          if (!profile) {
                            console.error("Profile data is missing or incomplete.");
                            return;
                          }
                          setAddFormData({
                            AddressLine1: profile.AddressLine1 ?? "",
                            AddressLine2: profile.AddressLine2 ?? "",
                            City: profile.City ?? "",
                            Pincode: profile.Pincode ?? "",
                            Village: profile.Village ?? "",
                            Mandal: profile.Mandal ?? "",
                            StateId: profile.StateId || "",
                            DistrictId: profile.DistrictId || "",
                          });
                          setIsEditing(true);
                        }}
                      >
                        <i className="bx bx-edit-alt me-1"></i>
                      </span>
                    )}
                  </div>

                  <div className="address-content p-4 rounded-4">
                    {profile ? (
                      profile.completeAddress ? (
                        <div className="fw-light lh-lg d-flex flex-row align-items-center flex-wrap">
                          {profile.completeAddress.split(',').map((line, index, arr) => (
                            <React.Fragment key={index}>
                              <span className={`${index === 0 ? 'fw-semibold' : ''}`}>
                                {line.trim()}
                              </span>
                              {index < arr.length - 1 && <span>,&nbsp;</span>}
                            </React.Fragment>
                          ))}
                        </div>
                      ) : (
                        <div className="text-warning d-flex align-items-center">
                          <i className="bx bx-error-circle me-2 fs-4"></i>
                          Address not available
                        </div>
                      )
                    ) : (
                      <div className="text-danger d-flex align-items-center">
                        <i className="bx bx-error-circle me-2 fs-4"></i>
                        Not available
                      </div>
                    )}
                  </div>


                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-12 mt-3 mt-lg-0">
          <div className="card border-0 rounded-4 overflow-hidden h-100">
            {/* Card Header */}
            <div className="card-header bg-white border-0 d-flex align-items-center py-3">
              <div className="d-flex align-items-center">
                <i className="bi bi-credit-card-2-front-fill fs-5 me-2 text-success"></i>
                <h6 className="m-0 fw-bold text-success">Card Information</h6>
              </div>
            </div>

            <hr className="m-0 opacity-25" />

            {/* Card Body - Loading State */}
            {cardLoading ? (
              <div className="d-flex flex-column justify-content-center align-items-center h-100 py-4">
                <div className="spinner-border text-success" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Retrieving card details...</p>
              </div>
            ) : cardDetails.status && cardDetails.returnData.length > 0 ? (
              <div className="p-3 d-flex flex-column align-items-center">
                {/* Credit Card 3D Display */}
                <div className="position-relative mb-3 card-display-container">
                  <div
                    style={{
                      width: "280px",
                      height: "180px",
                      perspective: "800px",
                      marginBottom: "1rem"
                    }}
                    onMouseEnter={() => setIsFlipped(true)}
                    onMouseLeave={() => setIsFlipped(false)}
                    className="cursor-pointer"
                  >
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                        transition: "transform 0.6s",
                        transformStyle: "preserve-3d",
                        transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                      }}
                    >
                      {/* Front Side */}
                      <div
                        style={{
                          position: "absolute",
                          width: "100%",
                          height: "100%",
                          backfaceVisibility: "hidden",
                          borderRadius: "12px",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={cardDetails.returnData ? cardFrontImage : "../../assets/img/dummy-avatar.jpg"}
                          alt="Front side"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover"
                          }}
                        />

                        <div
                          style={{
                            position: "absolute",
                            bottom: "0",
                            left: "0",
                            width: "100%",
                            padding: "15px 20px",
                          }}
                        >
                          <p
                            style={{
                              color: "white",
                              fontSize: "1rem",
                              fontFamily: "monospace",
                              margin: "0",
                              textShadow: "1px 1px 3px rgba(0,0,0,0.6)"
                            }}
                          >
                            {formatCardNumber(cardDetails.returnData[0]?.OHOCardnumber)}
                          </p>

                          {cardDetails.returnData[0].IsActivated === true ? (
                            <span className="badge bg-success bg-opacity-75 mt-1">
                              <i className="bi bi-check-circle-fill me-1"></i> Active
                            </span>
                          ) : (
                            <span className="badge bg-danger bg-opacity-75 mt-1">
                              <i className="bi bi-x-circle-fill me-1"></i> Inactive
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Back Side */}
                      <div
                        style={{
                          position: "absolute",
                          width: "100%",
                          height: "100%",
                          backfaceVisibility: "hidden",
                          transform: "rotateY(180deg)",
                          borderRadius: "12px",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={cardDetails.returnData ? cardBackImage : "../../assets/img/dummy-avatar.jpg"}
                          alt="Back side"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover"
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center text-muted small mb-2">
                  <i className="bi bi-info-circle me-1"></i> Hover over card to see the reverse side
                </div>

                {/* Action Buttons */}
                <div className="d-flex justify-content-center gap-2 mt-1">
                  {cardDetails.returnData[0].IsActivated === null || cardDetails.returnData[0].IsActivated === false ? (
                    <button
                      type="button"
                      className="btn btn-success btn-sm rounded-pill px-3 py-1 d-flex align-items-center"
                      onClick={() => handleUpdateActivated("Activate")}
                    >
                      <i className="bi bi-check-circle-fill me-1"></i>
                      Activate
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm rounded-pill px-3 py-1 d-flex align-items-center"
                      onClick={() => handleUpdateActivated("Deactivate")}
                    >
                      <i className="bi bi-x-circle-fill me-1"></i>
                      Deactivate
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn btn-sm rounded-pill px-3 py-1 d-flex align-items-center"
                    style={{
                      backgroundColor: isBookServiceHovered ? "#a30280" : "#f71ec8",
                      color: "white",
                      transition: "background-color 0.3s ease"
                    }}
                    onMouseEnter={() => setIsBookServiceHovered(true)}
                    onMouseLeave={() => setIsBookServiceHovered(false)}
                    onClick={(e) => handleBookService(e)}
                  >
                    <i className="bi bi-calendar-check-fill me-1"></i>
                    Book Service
                  </button>
                </div>
              </div>
            ) : (
              <div className="d-flex flex-column justify-content-center align-items-center py-4">
                <div className="text-center mb-2">
                  <i className="bi bi-exclamation-circle text-danger fs-3"></i>
                </div>
                <div className="text-danger fw-semibold text-center mx-3">
                  {cardDetails.message || "No Card Information Available"}
                </div>
                <p className="text-muted mt-1 text-center small">
                  The customer does not have a card associated with their account.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>


      {isEditing && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">

              {/* Modal Header */}
              <div className="modal-header bg-gradient-primary text-white px-4 py-3">
                <h5 className="modal-title fw-semibold">
                  <i className="bx bx-map-pin me-2"></i>
                  Update Address
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setIsEditing(false)}
                ></button>
              </div>

              {/* Modal Body */}
              <div className="modal-body p-4">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Address Line 1</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0">
                        <i className="bx bx-home text-primary"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-0 bg-light"
                        placeholder="Enter address line 1"
                        value={addFormData.AddressLine1 || ""}
                        onChange={(e) => setAddFormData({ ...addFormData, AddressLine1: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Address Line 2</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0">
                        <i className="bx bx-building-house text-primary"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-0 bg-light"
                        placeholder="Enter address line 2"
                        value={addFormData.AddressLine2 || ""}
                        onChange={(e) => setAddFormData({ ...addFormData, AddressLine2: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Pincode</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0">
                        <i className="bx bx-code-alt text-primary"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-0 bg-light"
                        placeholder="Enter pincode"
                        value={addFormData.Pincode || ""}
                        onChange={(e) => setAddFormData({ ...addFormData, Pincode: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">City</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0">
                        <i className="bx bx-buildings text-primary"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-0 bg-light"
                        placeholder="Enter city"
                        value={addFormData.City || ""}
                        onChange={(e) => setAddFormData({ ...addFormData, City: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Mandal</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0">
                        <i className="bx bx-buildings text-primary"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-0 bg-light"
                        placeholder="Enter Mandal"
                        value={addFormData.Mandal || ""}
                        onChange={(e) => setAddFormData({ ...addFormData, Mandal: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Village</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0">
                        <i className="bx bx-buildings text-primary"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-0 bg-light"
                        placeholder="Enter Village"
                        value={addFormData.Village || ""}
                        onChange={(e) => setAddFormData({ ...addFormData, Village: e.target.value })}
                      />
                    </div>
                  </div>


                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">State</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0">
                        <i className="bx bx-globe text-primary"></i>
                      </span>
                      <select
                        className="form-select border-0 bg-light"
                        value={addFormData.StateId}
                        onChange={handleStateChange}
                      >
                        <option value="">Select State</option>
                        {stateDropdown.map((state) => (
                          <option key={state.StateId} value={state.StateId}>
                            {state.StateName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">District</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0">
                        <i className="bx bx-map-pin text-primary"></i>
                      </span>
                      <select
                        className="form-select border-0 bg-light"
                        value={addFormData.DistrictId}
                        onChange={handleDistrictChange}
                      >
                        <option value="">Select District</option>
                        {districtDropdown.map((district) => (
                          <option key={district.DistrictId} value={district.DistrictId}>
                            {district.DistrictName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer bg-light border-0 d-flex justify-content-between px-4 py-3">
                <button
                  className="btn btn-outline-danger rounded-pill px-4"
                  onClick={() => setIsEditing(false)}
                >
                  <i className="bx bx-x-circle"></i> Cancel
                </button>
                <button
                  className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2"
                  onClick={EditAddress}
                >
                  <i className="bx bx-save"></i> Save Changes
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: { xs: 0.5, sm: 1.5 }, // Reduce spacing between buttons
          padding: 1.5, // Reduce padding
          borderRadius: 3,
          justifyContent: { xs: "center", md: "flex-start" }
        }}
      >
        {[
          { id: "product", label: "Member Products", icon: "bi-box-seam" },
          { id: "call", label: "Call History", icon: "bi-telephone" },
          { id: "services", label: "Services", icon: "bi-gear" }
        ]

          .map((item) => (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "contained" : "outlined"}
              onClick={() => setActiveSection(item.id)}
              sx={{
                borderRadius: 5,
                px: { xs: 1.5, sm: 2 },
                py: 0.8,
                fontSize: "0.85rem",
                textTransform: "none",
                transition: "all 0.3s ease",
                backgroundColor: activeSection === item.id ? "primary.main" : "transparent",
                borderColor: activeSection === item.id ? "primary.main" : "divider",
                color: activeSection === item.id ? "white" : "text.primary",
                fontWeight: 500,
                "&:hover": {
                  backgroundColor: activeSection === item.id ? "primary.dark" : "rgba(0, 0, 0, 0.04)",
                  transform: "translateY(-1px)", // Slight hover effect
                  boxShadow: activeSection === item.id ? "0 4px 10px rgba(25, 118, 210, 0.2)" : "0 3px 6px rgba(0, 0, 0, 0.05)"
                }
              }}
              startIcon={
                <i className={item.icon} style={{ fontSize: "0.95rem" }}></i> // Reduce icon size
              }
            >
              {item.label}
            </Button>
          ))}
      </Box>
      {activeSection === "call" && (
        <div className="col-md-12 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
              <h5 className="m-0 fw-bold" style={{ color: "#1e88e5" }}>
                <i className="bi bi-telephone-fill me-2"></i>
                Call History
              </h5>

              <button
                className="btn btn-primary d-flex align-items-center gap-2 rounded-pill px-3"
                data-bs-toggle="modal"
                data-bs-target="#exLargeModalCallLog"
              >
                <i className="bi bi-plus-lg"></i>
                <span>New Call</span>
              </button>
            </div>

            <div className="card-body p-0">
              {callHistoryLoading ? (
                <div className="d-flex justify-content-center align-items-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : callHistory && callHistory.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Contact Person</th>
                        <th>Response</th>
                        <th>Date & Time</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {callHistory.map((call, index) => (
                        <tr key={index}>
                          <td className="fw-semibold">{call.UserName}</td>
                          <td>
                            <span className="badge bg-label-primary rounded-pill">
                              {call.CallResponseName}
                            </span>
                          </td>
                          <td>
                            {moment(call.CollectedDate).local().diff(moment(), "days") <= thresholdDays ? (
                              <span className="text-muted">
                                {moment(call.CollectedDate).local().fromNow()}
                              </span>
                            ) : (
                              <span className="text-muted">
                                {moment(call.CollectedDate).local().format("DD-MMM-YYYY h:mm A")}
                              </span>
                            )}
                          </td>
                          <td>
                            {call.CallLog && call.CallLog.trim() !== "" ? (
                              <span className="text-truncate d-inline-block" style={{ maxWidth: "250px" }}>
                                {call.CallLog}
                              </span>
                            ) : (
                              <span className="text-muted">No remarks</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <i className="bi bi-telephone-x fs-1 text-muted"></i>
                  </div>
                  <h6 className="text-muted">No Call History Records</h6>
                  <button
                    className="btn btn-outline-primary mt-2"
                    data-bs-toggle="modal"
                    data-bs-target="#exLargeModalCallLog"
                  >
                    Add Your First Call
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSection === "product" && (
        <div className="col-md-12 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center p-3">
              <div className="d-flex align-items-center">
                {activeTab === "products" && (
                  <button
                    className="btn btn-outline-secondary rounded-circle me-3 d-flex align-items-center justify-content-center"
                    style={{ width: "38px", height: "38px" }}
                    onClick={() => handleProductsBack()}
                  >
                    <i className="bi bi-arrow-left"></i>
                  </button>
                )}
                <h5 className="m-0 fw-bold" style={{ color: "#2e7d32" }}>
                  <i className="bi bi-box-seam me-2"></i>
                  Member Products
                </h5>
              </div>

              {activeTab === "products" && selectedProduct && (
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={handlePrint}
                  >
                    <i className="bi bi-printer"></i>
                    <span>Print Address</span>
                  </button>
                </div>
              )}
            </div>



            <div className="card-body">
              <div className="overflow-auto" style={{ maxHeight: "650px" }}>
                {showIndividualProducts ? (
                  showIndividualProductView()
                ) : activeTab === "products" && selectedProduct ? (
                  <div className="row mb-2">
                    <div className="col-lg-4 mb-4 mb-lg-0">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-success bg-opacity-10 border-success-subtle">
                          <h6 className="mb-0 fw-bold d-flex align-items-center">
                            <i className="bi bi-info-circle me-2"></i>
                            Product Details
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="mb-4 text-center mt-4">
                            <h5 className="fw-bold">{selectedProduct.ProductName || "N/A"}</h5>
                          </div>

                          <div className="list-group list-group-flush">
                            <div className="list-group-item px-0 d-flex justify-content-between align-items-center py-3">
                              <span className="fw-semibold text-secondary">
                                <i className="bi bi-currency-rupee me-2"></i>Price
                              </span>
                              <span className="badge bg-success fs-6 px-3 py-2">
                                <i className="bi bi-currency-rupee"></i>{selectedProduct.PaidAmount || "0"}
                              </span>
                            </div>

                            <div className="list-group-item px-0 d-flex justify-content-between align-items-center py-3">
                              <span className="fw-semibold text-secondary">
                                <i className="bi bi-credit-card me-2"></i>UTR Number
                              </span>
                              {selectedProduct.UTRNumber && selectedProduct.UTRNumber.length > 0 ? (
                                <span className="fw-semibold">{selectedProduct.UTRNumber}</span>
                              ) : (
                                <span className="badge bg-danger">Not Available</span>
                              )}
                            </div>

                            {selectedProduct.IssuedOn && selectedProduct.ValidTill && (
                              <div className="list-group-item px-0 d-flex justify-content-between align-items-center py-3">
                                <span className="fw-semibold text-secondary">
                                  <i className="bi bi-calendar-check me-2"></i>Valid Until
                                </span>
                                <span className="fw-semibold">{formatDate(selectedProduct.ValidTill).slice(0, 11)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {policies && policies.length > 0 && (
                      <div className="col-lg-8">
                        <div className="card border-0 shadow-sm h-100">
                          <div className="card-header bg-primary bg-opacity-10 border-primary-subtle d-flex justify-content-between align-items-center">
                            <h6 className="mb-0 fw-bold d-flex align-items-center">
                              <i className="bi bi-file-earmark-text me-2"></i>
                              Policy Documents
                            </h6>
                            <span className="badge bg-primary">{policies.length} Documents</span>
                          </div>
                          <div className="card-body p-0">
                            <div className="table-responsive">
                              <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                  <tr>
                                    <th className="border-0">Policy Name</th>
                                    <th className="border-0">Status</th>
                                    <th className="border-0">COI Number</th>
                                    <th className="border-0 text-end">Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {policies.map((policy) => (
                                    <tr key={policy.PoliciesId}>
                                      <td>
                                        <div className="d-flex align-items-center">
                                          <div className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3" style={{ width: "40px", height: "40px" }}>
                                            <i className="bi bi-file-earmark-pdf text-danger"></i>
                                          </div>
                                          <div>
                                            <a
                                              className="fw-semibold text-primary d-block mb-1"
                                              style={{ cursor: "pointer" }}
                                              onClick={() => {
                                                setSelectedIndividualPrdouct(policy);
                                                setShowIndividualProducts(true);
                                              }}
                                            >
                                              {policy.PoliciesProductName}
                                            </a>
                                            {policy.IsMembership && (
                                              <span className="badge bg-info bg-opacity-10">Membership</span>
                                            )}
                                          </div>
                                        </div>
                                      </td>
                                      <td>
                                        {policy.PolicyDocument ? (
                                          <span className="badge bg-success">Available</span>
                                        ) : (
                                          <span className="badge bg-warning">Pending Upload</span>
                                        )}
                                      </td>
                                      <td>
                                        {policy.PolicyCOINumber && policy.PolicyCOINumber.length > 0 ? (
                                          <span className="fw-semibold">{policy.PolicyCOINumber}</span>
                                        ) : (
                                          <span className="text-muted">—</span>
                                        )}
                                      </td>
                                      <td>
                                        <div className="d-flex justify-content-end gap-2">
                                          {policy.IsMembership ? (
                                            <button
                                              className="btn btn-primary btn-sm"
                                              onClick={handleGenerateMembership}
                                              disabled={gmcLoading}
                                            >
                                              {gmcLoading ? (
                                                <div className="spinner-border spinner-border-sm" role="status">
                                                  <span className="visually-hidden">Loading...</span>
                                                </div>
                                              ) : (
                                                <>
                                                  <i className="bi bi-arrow-repeat me-1"></i>
                                                  Regenerate
                                                </>
                                              )}
                                            </button>
                                          ) : (
                                            <button
                                              className="btn btn-primary btn-sm"
                                              data-bs-toggle="modal"
                                              data-bs-target="#exLargeModal"
                                              onClick={() => handleSelectPolicy(policy)}
                                            >
                                              <i className="bi bi-upload me-1"></i>
                                              {policy.PolicyDocument ? "Re-Upload" : "Upload"}
                                            </button>
                                          )}

                                          {policy.PolicyDocument && (
                                            <a
                                              href={`${paUrl}${policy.PolicyDocument}`}
                                              className="btn btn-outline-secondary btn-sm"
                                              target="_blank"
                                              download
                                            >
                                              <i className="bi bi-download"></i>
                                            </a>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : productsLoading ? (
                  <div className="d-flex justify-content-center align-items-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : products && products.length > 0 ? (
                  <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4 mb-2">
                    {products.map((product, index) => (
                      product.ProductName ? (
                        <div key={index} className="col">
                          <div className="card h-100 shadow-sm hover-shadow position-relative overflow-hidden product-card">
                            <div className="position-absolute top-0 start-0 h-100 bg-success" style={{ width: "5px" }}></div>

                            <div className="position-absolute top-0 end-0 m-2">
                              <span className={`badge ${product.IsCombo ? "bg-primary" : "bg-warning"} rounded-pill px-3 py-2`}>
                                {product.IsCombo ? "Combo" : "Individual"}
                              </span>
                            </div>

                            <div className="card-body pt-4 pb-3 px-4">
                              <h5 className="card-title fw-bold mb-3 pe-5">{product.ProductName}</h5>

                              {product.IssuedOn && product.ValidTill && (
                                <div className="d-flex align-items-center mb-3">
                                  <div className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3" style={{ width: "40px", height: "40px" }}>
                                    <i className="bi bi-calendar-check text-success"></i>
                                  </div>
                                  <div>
                                    <small className="text-muted d-block">Valid Until</small>
                                    <strong>{formatDate(product.ValidTill).slice(0, 11)}</strong>
                                  </div>
                                </div>
                              )}

                              <div className="mt-3 d-flex align-items-center">
                                <div className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3" style={{ width: "40px", height: "40px" }}>
                                  <i className="bi bi-file-earmark-text text-primary"></i>
                                </div>
                                <div className="progress flex-grow-1" style={{ height: "8px" }}>
                                  <div
                                    className="progress-bar bg-success"
                                    role="progressbar"
                                    style={{ width: "75%" }}
                                    aria-valuenow="75"
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                  ></div>
                                </div>
                              </div>
                            </div>

                            <div className="card-footer bg-white border-top-0 d-flex justify-content-end py-3 px-4">
                              <button
                                className="btn btn-outline-success fw-semibold"
                                onClick={() => handleProductClick(product)}
                              >
                                View Details
                                <i className="bi bi-arrow-right ms-2"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : null
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <div className="mb-4">
                      <div className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "100px", height: "100px" }}>
                        <i className="bi bi-box-seam fs-1 text-muted"></i>
                      </div>
                    </div>
                    <h5 className="text-muted mb-3">No Products Available</h5>
                    <p className="text-secondary mb-4">You haven't purchased any products yet.</p>
                    {/* <button className="btn btn-outline-primary px-4">
                      <i className="bi bi-cart-plus me-2"></i>
                      Browse Available Products
                    </button> */}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {activeSection === "services" && (
        <div id="services">
          <div className="col-md-12 mb-4">
            <div className="card shadow-sm border-0">
              {/* Header */}
              <div className="card-header bg-white d-flex align-items-center py-3 border-bottom shadow-sm">
                <h5 className="m-0 fw-bold me-4 text-primary">
                  <i className="bi bi-tools me-2"></i> Services
                </h5>
              </div>

              {/* Tabs */}
              <div className="card-header bg-white border-bottom py-2 px-4 d-flex gap-3">
                {["claimServices", "activity"].map((tab) => (
                  <button
                    key={tab}
                    className={`btn btn-sm fw-semibold ${activeServiceTab === tab ? "text-white" : "text-dark"}`}
                    style={{
                      backgroundColor: activeServiceTab === tab ? "#008080" : "#D4B996",
                      borderRadius: 6,
                      padding: "10px 16px",
                      border: "none"
                    }}
                    onClick={() => setActiveServiceTab(tab)}
                  >
                    <i className={`bi ${tab === "claimServices" ? "bi-clipboard-check" : "bi-clock-history"} me-1`}></i>
                    {tab === "claimServices" ? "Claimed Services" : "Activity"}
                  </button>
                ))}
              </div>

              {/* Main Content */}
              {activeServiceTab === "claimServices" && (
                <div className="container-fluid my-1">
                  {claimedDate && claimedDate.length > 0 ? (
                    <div className="container-fluid px-1">
                      {claimedDate.map((consultation, index) => (
                        <div
                          key={index}
                          className="card border-0 shadow-sm mb-2 rounded-3 position-relative overflow-hidden"
                          style={{
                            background: "#fff",
                            borderLeft: `6px solid ${statusColors[consultation.StatusName]?.bg || "#6c757d"}`,
                            transition: "transform 0.2s ease-in-out",
                            padding: "8px",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                        >
                          {/* Status Indicator */}
                          <div className="card-body d-flex align-items-center p-2">
                            <div
                              className="d-flex flex-column justify-content-center align-items-center px-3"
                              style={{ borderRight: "1px solid #eee", minWidth: "65px" }}
                            >
                              <div
                                className="rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                                style={{
                                  width: "45px",
                                  height: "45px",
                                  backgroundColor: statusColors[consultation.StatusName]?.bg || "#f8f9fa",
                                  color: statusColors[consultation.StatusName]?.text || "#000",
                                  fontSize: "1.2rem",
                                }}
                              >
                                {consultation.StatusName === "Booked " && <i className="fas fa-check-circle"></i>}
                                {consultation.StatusName === "Visited" && <i className="fas fa-clock"></i>}
                                {consultation.StatusName === 'Initiated' && <i className="fas fa-times-circle"></i>}
                                {!["Booked", "Visited", "Initiated"].includes(consultation.StatusName) && <i className="fas fa-calendar"></i>}
                              </div>
                              <span className="small fw-bold mt-1 text-muted">{consultation.StatusName}</span>
                            </div>

                            {/* Main Content */}
                            <div className="flex-grow-1 px-3">
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center text-dark">
                                  <i className="fas fa-user me-2 text-primary"></i>
                                  <span className="fw-bold">{consultation.Name || "Unknown"}</span>
                                </div>
                                <div className="d-flex align-items-center text-dark">
                                  <i className="fas fa-hospital me-2 text-info"></i>
                                  <span>{consultation.HospitalName || "N/A"}</span>
                                </div>
                              </div>

                              {/* Date & Status */}
                              <div className="d-flex align-items-center justify-content-between mt-2">
                                <div className="d-flex align-items-center text-muted">
                                  <i className="fas fa-calendar-alt me-2 text-danger"></i>
                                  <span>
                                    {consultation.AppointmentDate
                                      ? new Date(consultation.AppointmentDate).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "2-digit",
                                      })
                                      : "N/A"}
                                  </span>
                                </div>
                              </div>

                              {/* Coupon Claimed */}
                              {consultation.PoliciesType === "Free Consultation" && (
                                  <div className="mt-2">
                                    <span className={`badge ${consultation.IsCouponClaimed ? "bg-success" : "bg-secondary"} d-flex align-items-center px-3 py-2`}>
                                      <i className="fas fa-ticket-alt me-2"></i>
                                      {consultation.IsCouponClaimed ? "Coupon Claimed" : "Unclaimed Coupon"}
                                    </span>
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4 bg-light border-0 rounded-3 shadow-sm"
                      style={{ background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)" }}>
                      <div className="position-relative d-inline-block mb-3">
                        <i className="fas fa-calendar-alt text-secondary" style={{ fontSize: "3.5rem", opacity: 0.7 }}></i>
                        <div className="position-absolute top-0 end-0 translate-middle">
                          <span className="badge rounded-pill bg-primary p-2">
                            <i className="fas fa-plus"></i>
                          </span>
                        </div>
                      </div>
                      <h5 className="text-muted fw-bold mb-2">No Consultations Yet</h5>
                      <p className="text-muted mb-3 w-75 mx-auto">
                        Your health journey begins here. Schedule your first consultation to get started with personalized care.
                      </p>

                    </div>
                  )}
                </div>
              )}

              {/* Activity Section */}
              {activeServiceTab === "activity" && (
                <div className="container-fluid p-2 ">
                  <h6 className="mb-3 text-primary">
                    <i className="bi bi-clock-history me-2"></i>
                    Recent Activity
                  </h6>

                  {/* Sub-tabs (Inside the same card) */}
                  <div className="d-flex gap-2 mb-3">
                    {[{ id: "all", label: "All Activity" },
                    { id: "booking", label: "Booking" },
                    { id: "feedback", label: "Feedback" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        className={`btn btn-sm fw-semibold shadow-sm ${activeActivityTab === tab.id ? 'bg-primary text-white' : 'bg-light text-dark'}`}
                        style={{ borderRadius: "6px", padding: "8px 14px", transition: "all 0.2s" }}
                        onClick={() => setActiveActivityTab(tab.id)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Sub-tab Content */}
                  <div className="card border-light shadow-sm">
                    {loading ? (
                      <div className="card-body text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted mt-3">Loading activities...</p>
                      </div>
                    ) : (
                      (() => {
                        const filteredActivities = activity.filter(item =>
                          activeActivityTab === "all" || (item.ActivityCategory?.toLowerCase() === activeActivityTab.toLowerCase())
                        );

                        if (filteredActivities.length > 0) {
                          return (
                            <div className="container-fluid p-0 m-0">
                              <div className="list-group gap-2">
                                {filteredActivities.map((item, index) => {
                                  const status = statusConfig[item.StatusName] || statusConfig.default;

                                  return (
                                    <div
                                      key={index}
                                      className="list-group-item border-0 shadow-sm rounded-3 overflow-hidden position-relative"
                                      style={{
                                        padding: "10px",
                                        marginBottom: "8px",
                                        transition: "all 0.3s ease",
                                        borderLeft: `4px solid ${status.color}`,
                                      }}
                                      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
                                      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                                    >
                                      {/* Header */}
                                      <div className="d-flex align-items-center mb-2">
                                        <div className="me-2 d-flex align-items-center justify-content-center rounded-circle bg-primary text-white"
                                          style={{ width: "30px", height: "30px" }}>
                                          <i className="fas fa-user-circle"></i>
                                        </div>
                                        <h6 className="mb-0 flex-grow-1 text-truncate" style={{ fontSize: "0.9rem" }}>
                                          {item.Name || "Unknown"}
                                        </h6>
                                        <span className="badge rounded-pill px-3 py-1" style={{
                                          backgroundColor: status.color,
                                          color: status.textColor,
                                          fontSize: "0.75rem",
                                        }}>
                                          <i className={`fas fa-${status.icon} me-1`}></i>
                                          {item.StatusName}
                                        </span>
                                      </div>

                                      {/* Content */}
                                      <div className="row g-2" style={{ fontSize: "0.85rem" }}>
                                        {/* Row 1: Name & Hospital */}
                                        <div className="col-6 d-flex align-items-center" style={{ borderColor: "#f0f0f0" }}>
                                          <i className="fas fa-calendar-alt text-danger me-2"></i>
                                          <span>{new Date(item.CreatedDate).toLocaleString()}</span>
                                        </div>

                                        <div className="col-6 d-flex align-items-center">
                                          <i className="fas fa-hospital text-info me-2"></i>
                                          <span className="text-truncate">{item.HospitalName || "N/A"}</span>
                                        </div>

                                        {/* Row 2: Policy Type & Activated By */}
                                        <div className="col-6 d-flex align-items-center">
                                          <i className="fas fa-shield-alt text-warning me-2"></i>
                                          <span className="text-truncate">{item.PoliciesType || "N/A"}</span>
                                        </div>
                                        <div className="col-6 d-flex align-items-center">
                                          <i className="fas fa-user-md text-success me-2"></i>
                                          <span className="text-truncate">Action By: {item.EmployeeName || "Self"}</span>
                                        </div>

                                        {(activeActivityTab === "feedback" || activeActivityTab === "all") && (
                                          (item.CustomerFeedback || item.Hospitalfeedback) && (
                                            <div className={`col-12 ${activeActivityTab === "feedback" ? "mt-2 p-2 bg-light rounded" : ""}`}>

                                              {item.StatusName === "Customer Feedback" && item.CustomerFeedback && (
                                                <div className="d-flex align-items-start mb-1">
                                                  <i className="fas fa-comment-alt text-primary me-2 mt-1"></i>
                                                  <div>
                                                    <span className="fw-semibold">Customer Feedback:</span>
                                                    <p className="mb-1">
                                                      {item.CustomerFeedback}
                                                    </p>
                                                  </div>
                                                </div>
                                              )}

                                              {item.StatusName === "Hospital Feedback" && item.Hospitalfeedback && (
                                                <div className="d-flex align-items-start">
                                                  <i className="fas fa-comment-medical text-secondary me-2 mt-1"></i>
                                                  <div>
                                                    <span className="fw-semibold">Hospital Feedback:</span>
                                                    <p className="mb-0">
                                                      {item.Hospitalfeedback}
                                                    </p>
                                                  </div>
                                                </div>
                                              )}

                                            </div>
                                          )
                                        )}

                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        } else {
                          return (
                            <div className="text-center py-5">
                              <i className="bi bi-inbox text-muted mb-3" style={{ fontSize: "2rem" }}></i>
                              <p className="text-muted">No {activeActivityTab === "all" ? "" : activeActivityTab} activities found.</p>
                            </div>
                          );
                        }
                      })()
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      <div
        className="modal fade"
        id="exLargeModalCallLog"
        tabIndex="-1"
        aria-hidden="true"
        aria-labelledby="exampleModalLabel4"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title" id="exampleModalLabel4">
                Add Call History
              </h4>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <form onSubmit={onSubmitHandler} className="p-4">
              <div className="mb-4">
                <h5 className="mb-3" style={{ fontWeight: "bold" }}>
                  Call Response{" "}
                  <span className="required" style={{ color: "red" }}>
                    {" "}
                    *
                  </span>
                </h5>

                <div className="d-flex flex-wrap">
                  {callResponseOptions.map((option) => (
                    <div
                      className="form-check me-4 mb-2 col-5"
                      key={option.CallResponsesId}
                    >
                      <input
                        className="form-check-input"
                        type="radio"
                        id={`callResponse_${option.CallResponsesId}`}
                        name="callResponsesId"
                        value={option.CallResponsesId}
                        checked={formData.callResponsesId.includes(
                          option.CallResponsesId
                        )}
                        onChange={onChangeHandler}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`callResponse_${option.CallResponsesId}`}
                      >
                        {option.ResponseName}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="row">
                <div className="col-12 col-sm-6">
                  <div className="mb-3">
                    <label htmlFor="DateToBeVisited" className="form-label">
                      Date To Be Visited
                    </label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      id="DateToBeVisited"
                      name="DateToBeVisited"
                      placeholder="YYYY-MM-DD HH:MM"
                      value={formData.DateToBeVisited}
                      onChange={onChangeHandler}
                    />
                  </div>
                </div>
                <div className="col-12 col-sm-6">
                  <div className="mb-3">
                    <label htmlFor="RequestCallBack" className="form-label">
                      Request Call Back
                    </label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      id="RequestCallBack"
                      name="RequestCallBack"
                      placeholder="YYYY-MM-DD HH:MM"
                      value={formData.RequestCallBack}
                      onChange={onChangeHandler}
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12">
                  <div className="mb-3">
                    <label htmlFor="remarks" className="form-label">
                      Remarks
                    </label>
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
                <div className="col-md-12 d-flex justify-content-center">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!isFormValid}
                  >
                    {isEditing ? "Update" : "Submit"}
                  </button>
                  <button
                    className="btn btn-secondary ms-2"
                    type="button"
                    onClick={handleResetForm}
                  >
                    Reset
                  </button>
                  <button
                    className="btn btn-danger ms-2"
                    type="button"
                    onClick={handleBackToView}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="exLargeModalPurchase"
        tabIndex="-1"
        aria-hidden="true"
        aria-labelledby="exampleModalLabel4"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title" id="exampleModalLabel4">
                Product Purchase
              </h4>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            {purchaseProduct ? (
              <>
                {/* OHO Card Number Input Card */}
                {purchaseProduct.IsCombo === true && !cardNumberEntered && (
                  <div className="card p-3" style={{ minWidth: "400px" }}>
                    <label
                      className="form-label"
                      htmlFor="cardNumber"
                      style={{ fontSize: "15px" }}
                    >
                      Card Number <span className="text-danger"> *</span>
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      className="form-control"
                      placeholder="2804 0000 0001"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      maxLength={14}
                    />
                    {cardNumberError && (
                      <p className="text-danger">{cardNumberError}</p>
                    )}
                    <button
                      className="btn btn-primary mt-3"
                      onClick={checkCardNumberExists} // Check if card number exists on click
                    >
                      Confirm Card Number
                    </button>
                  </div>
                )}

                {/* Main Product Details Card */}
                {(!purchaseProduct.IsCombo || cardNumberEntered) && (
                  <div className="card p-3 d-flex flex-column align-items-center">
                    <h5 className="card-header">
                      <strong>Product Name: </strong>
                      <span className="text-primary fs-4 fw-bold">
                        {purchaseProduct.ProductName}
                      </span>
                    </h5>
                    <img
                      src="https://ohoindia-mous.s3.ap-south-1.amazonaws.com/70ec0ebd-a761-4dc4-acb8-80750653a421.jpg"
                      alt="QR Code"
                      className="h-25 w-25 mt-3 mb-3"
                    />
                    <p className="fs-5">
                      Amount to pay:{" "}
                      <FontAwesomeIcon
                        icon={faIndianRupeeSign}
                        className="text-primary"
                      />{" "}
                      <span>
                        {purchaseProduct.InsurancePremiums[0].TotalAmount}
                      </span>
                    </p>

                    <div style={{ minWidth: "400px" }}>
                      <label
                        className="form-label"
                        htmlFor="utrnumber"
                        style={{ fontSize: "15px" }}
                      >
                        UTR Number <span className="text-danger"> *</span>
                      </label>
                      <input
                        type="text"
                        id="utrnumber"
                        className="form-control"
                        placeholder="Enter UTR Number"
                        value={utrNumber}
                        onChange={(e) => onChangeUtrNumber(e)}
                      />
                      {utrError && (
                        <p className="text-danger">*Please Enter UTR Number</p>
                      )}
                    </div>

                    <div className="mt-3 d-flex flex-row justify-content-center">
                      <button
                        type="submit"
                        className="btn btn-primary me-sm-3 me-1"
                        onClick={(e) => submitUtrForm(e)}
                        style={{ minWidth: "100px" }}
                        disabled={utrSubmitLoad}
                      >
                        {utrSubmitLoad ? (
                          <div class="spinner-border text-white" role="status">
                            <span class="sr-only">Loading...</span>
                          </div>
                        ) : (
                          "Submit"
                        )}
                      </button>
                      <button
                        type="button"
                        className="btn btn-label-secondary"
                        onClick={() => setPurchaseProduct()}
                      >
                        Cancel
                      </button>
                    </div>

                    {paymentSuccessMsg && (
                      <p className="text-success mt-3">
                        Successfully purchased product
                      </p>
                    )}
                    {memberPrdAddFail && memberPrdAddFail.length > 0 && (
                      <p className="text-danger mt-3">{memberPrdAddFail}</p>
                    )}
                    {paymentFailureError && paymentFailureError.length > 0 && (
                      <p className="text-danger mt-3">{paymentFailureError}</p>
                    )}
                    {updatePaymentForProductError &&
                      updatePaymentForProductError.length > 0 && (
                        <p className="text-danger mt-3">
                          {updatePaymentForProductError}
                        </p>
                      )}
                    {cardAddError && cardAddError.length > 0 && (
                      <p className="text-danger mt-3">{cardAddError}</p>
                    )}
                  </div>
                )}
              </>
            ) : availableProducts && availableProducts.length > 0 ? (
              <div className="container-fluid">
                <div className="row">
                  {availableProducts.map((product) => (
                    <div
                      key={product.ProductsId}
                      className="card d-flex flex-column col-md-5 p-3 mt-2 mb-2 me-3"
                    >
                      <div className="d-flex flex-row align-items-center">
                        <i
                          className="fa-solid fa-circle-check me-2"
                          style={{ color: "#349bc7" }}
                        ></i>
                        <h5 className="mb-1 text-dark">
                          {product.ProductName}
                        </h5>
                      </div>

                      <div className="d-flex flex-row align-items-center">
                        <h6>Amount: </h6>
                        <p className="ms-1">
                          <i
                            className="fa-solid fa-indian-rupee-sign"
                            style={{ color: "#349bc7" }}
                          ></i>{" "}
                          {product.InsurancePremiums[0].TotalAmount}
                        </p>
                      </div>
                      <button
                        className="btn btn-primary align-self-end"
                        onClick={() => setPurchaseProduct(product)}
                      >
                        Purchase
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <h4 className="text-danger fw-semibold text-center">
                  No Products Available
                </h4>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="exLargeModal"
        tabIndex="-1"
        aria-hidden="true"
        aria-labelledby="exampleModalLabel4"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          {selectedPolicy && (
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title" id="exampleModalLabel4">
                  Upload Document for {selectedPolicy.PoliciesProductName}
                </h4>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={() => handleCloseModal()}
                ></button>
              </div>

              <form
                className="form-group custom-form p-3"
                onSubmit={handleFileSubmit}
              >
                <div className="row g-2">
                  <div className="col-12 col-md-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter COI Number"
                      value={PolicyCOINumber}
                      onChange={(e) => setPolicyCOINumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <input
                      type="file"
                      className="form-control"
                      required
                      onChange={(e) => handleUploadChange(e)}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-success mt-2"
                  disabled={!file || !PolicyCOINumber}
                >
                  {policyUploadLoad ? (
                    <div className="spinner-border text-white" role="status">
                      <span className="sr-only">Loading...</span>
                    </div>
                  ) : (
                    "UPLOAD"
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* <div
        style={{
          position: "sticky",
          bottom: "10px",
          display: "flex",
          justifyContent: "flex-end",
          width: "100%",
        }}
      >
        <button
          className="btn btn-dark"
          data-bs-toggle="modal"
          data-bs-target="#exLargeModalPurchase"
          onClick={() => setPurchaseProduct()}
        >
          Purchase
        </button>
      </div> */}

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
          <Alert onClose={handleSnackbarClose} severity="success">
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </TableContainer>
    </>
  );
}
