import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BoxWrapper from "../../Components/BoxWrapper";
import moment from "moment";
import MuiAlert from "@mui/material/Alert";
import {
  fetchDeleteData,
  fetchData,
  fetchAllData,
  fetchUpdateData,
  uploadPdf,
} from "../../helpers/externapi";
import Snackbar from "@mui/material/Snackbar";
import CardEditForms from "../../Components/CardEditForms";
import SelectNominee from "../../Components/SelectNominee";
import TableContainer from "@mui/material/TableContainer";
import ConfirmationDialogDelete from "../../Components/ConfirmationDialogDelete";
import Paper from "@mui/material/Paper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faIndianRupeeSign } from "@fortawesome/free-solid-svg-icons";
import {
  formatDate,
  formatDate1,
} from "../../Commoncomponents/CommonComponents";
import Cleave from "cleave.js/react";
import CircularProgress from "@mui/material/CircularProgress";
import { Box, Button, Typography } from "@mui/material";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function DistributorPersonalDetails(props) {
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
  const [cardDetails, setCardDetails] = React.useState([]);
  const [loading, setLoading] = React.useState();
  const [products, setProducts] = useState([]);
  const [showNominee, setShowNominee] = useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState(null);
  const [showProductDetailsTab, setShowProductDetailsTab] = useState(false);
  const initialFormData = {
    callHistoryId: "",
    callLog: "",
    CollectedDate: "",
    callResponsesId: "",
    DateToBeVisited: "",
  };
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
  const [cardNumbers, setCardNumbers] = useState([
    { cardNumber: "2804 00", error: "" },
  ]);
  const [distributorCards, setDistributorCards] = useState([]);
  const [cardsNumberError, setCardsNumberError] = useState("");
  const [noOfAssigns, setNoOfAssigns] = useState(null);
  const [cardLoading, setCardLoading] = useState(false);
  const [callHistoryLoading, setCallHistoryLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [isBookServiceHovered, setIsBookServiceHovered] = useState(false);
  const [gmcLoading, setGmcLoading] = useState(false);
  const [selectedIndividualProduct, setSelectedIndividualPrdouct] = useState();
  const [showIndividualProducts, setShowIndividualProducts] = useState(false);
  const [cardFrontImage, setCardFrontImage] = useState(null);
  const [cardBackImage, setCardBackImage] = useState(null);
  const [activeSection, setActiveSection] = useState("product");
  const [imageUrl, setImageUrl] = useState('');
  const UserId = localStorage.getItem("UserId");
  const { Id } = useParams();

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
          `OHOCards/GetMemberCardByMemberId/${Id}`
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
    const fetchProductsData = async () => {
      setLoading(true);
      try {
        setProductsLoading(true);
        const response = await fetchAllData(`Member/GetMemberProducts/${Id}`);

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

    const fetchMemberData = async () => {
      setLoading(true);
      try {
        const response = await fetchAllData(`Member/GetById/${Id}`);
        setMemberDetails(response);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchMemberData();
    fetchProductsData();
  }, [Id]);

  const handleCardNumberChange = (e) => {
    // Extract only digits after the default prefix "2804 00"
    let input = e.target.value.replace(/\D/g, "").substring(6);

    // Limit to 6 digits for the user-input portion
    if (input.length > 6) {
      input = input.slice(0, 6);
    }

    // Format as "2804 00XX XXXX"
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
    setIsEditing(true);
    setShowProductDetailsTab(true);
    setActiveTab("products");
    // }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetchAllData(`Dependent/GetMemberById/${Id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        setProfile(data);
        setFormData(data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [Id]);

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
      const response = await fetchDeleteData(`Member/delete/${Id}`);
      if (response.status === false) {
        setSnackbarMessage(response.message);
        setSnackbarOpen(true);
        return;
      }
      setSnackbarMessage(`Deleted Successfully`);
      setSnackbarOpen(true);

      setTimeout(() => {
        navigate("/distributor/list");
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
        `CallHistory/GetAllCallHistoryByMemberId/${Id}`
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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPurchaseProduct();
    if (tab !== "products") {
      setShowProductDetailsTab(false);
    }
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
    formData.append("memberId", Id);
    formData.append("productsId", selectedPolicy.PoliciesProductsId);
    formData.append(
      "individualProductsId",
      selectedPolicy.IndividualProductsId
    );
    formData.append("policyDocument", file);
    formData.append("PolicyCOINumber", PolicyCOINumber);
    formData.append("memberProductId", selectedPolicy.PoliciesMemberProductId);
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

      setTimeout(() => {
        window.location.reload();
      }, 2000);
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
        MemberId: Id,
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
        MemberId: Id,
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
      CallHistoryData = await fetchData("CallHistory/add", requestData);
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
    navigate("/distributor/new", { state: { profile } });
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

  const formatKeyFeatures = (keyFeatures) => {
    if (!keyFeatures) return [];
    return keyFeatures
      .replace(/<[^>]*>/g, "")
      .split(".")
      .filter((feature) => feature.trim() !== "");
  };

  const cardActiveAndDeactive = async () => {
    const memberId = cardDetails.returnData[0].CardPurchasedMemberId;
    const isActivated =
      cardDetails.returnData[0].IsActivated === null
        ? true
        : cardDetails.returnData[0].IsActivated === false
          ? true
          : false;

    const updateApi = await fetchData("OHOCards/ActivateorDeactivateTheCard", {
      memberId,
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

  const handleCloseModal = () => {
    setSelectedpolicy();
    setFile();
  };

  const getDistributorCards = async () => {
    try {
      setLoading(true);
      const distributorCardsData = await fetchAllData(
        `OHOCards/GetByMemberId/${Id}`
      );
      setDistributorCards(distributorCardsData);
    } catch (error) {
      console.error("Error fetching Ditributor Card data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = () => {
    setCardNumbers([...cardNumbers, { cardNumber: "2804 00", error: "" }]);
  };

  const handleRemoveCard = (index) => {
    const updatedCardNumbers = cardNumbers.filter((_, i) => i !== index);
    setCardNumbers(updatedCardNumbers);
  };

  const handleChange = (index, value) => {
    const updatedCardNumbers = [...cardNumbers];
    updatedCardNumbers[index].cardNumber = value;
    setCardNumbers(updatedCardNumbers);
  };

  const handleAdd = async () => {
    const updatedCardNumbers = [...cardNumbers];
    let hasError = false;

    updatedCardNumbers.forEach((input, index) => {
      const cardNumber = input.cardNumber.replace(/\s/g, ""); // Remove spaces
      if (cardNumber.length !== 12 || !/^\d{12}$/.test(cardNumber)) {
        updatedCardNumbers[index].error =
          "Card number must be exactly 12 digits.";
        hasError = true;
      } else {
        updatedCardNumbers[index].error = "";
      }
    });

    setCardNumbers(updatedCardNumbers);

    if (hasError) {
      setCardsNumberError("Enter a valid 12-digit Card Number.");
      return;
    }

    try {
      const cardsToAssign = noOfAssigns || updatedCardNumbers.length; // Use noOfAssigns if provided, otherwise use actual count
      const payload = {
        ohoCardNumber: updatedCardNumbers
          .slice(0, cardsToAssign)
          .map((input) => input.cardNumber.trim()),
        noOfAssigns: cardsToAssign,
        rmId: UserId,
        memberId: Id,
      };

      const response = await fetchData(
        "OHOCards/AssignCardsToDistributor",
        payload
      );

      setSnackbarMessage(response.message || response.data);
      setSnackbarOpen(true);
      setCardNumbers([{ cardNumber: "2804 00", error: "" }]); // Reset input fields
      setNoOfAssigns(null);

      await getDistributorCards();
    } catch (error) {
      console.error("Error assigning card numbers:", error);
    }
  };

  useEffect(() => {
    getDistributorCards();
  }, []);

  const showIndividualProductView = () => (
    <div className="my-2">
      <h5 className="text-center text-danger fw-semibold">
        {selectedIndividualProduct.PoliciesProductName}
      </h5>

      <SelectNominee
        comboProductId={selectedIndividualProduct.IndividualProductsId}
        selectedProduct={selectedIndividualProduct}
      />

      <CardEditForms
        selectedProductId={selectedIndividualProduct.IndividualProductsId}
        selectedProduct={selectedIndividualProduct}
      />
    </div>
  );

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

                  <div className="position-relative mt-n5 mb-2">
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


                  <div className="d-flex flex-column flex-grow-1 mb-2">
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
                            <span className="text-secondary fw-normal px-3 py-2">
                              <i className="bx bx-calendar me-1"></i>
                              Joined {moment(profile.RegisterOn).format("DD MMM YYYY")}
                            </span>
                          )}
                        </div>
                      </div>


                      <div className="d-flex gap-2 mt-2 mt-md-0">
                        <button
                          className="btn btn-primary rounded-pill px-3 py-2 d-flex align-items-center gap-2"
                          onClick={handleEditForm}
                        >
                          <i className="bx bx-edit-alt fs-5"></i>
                          <span className="d-none d-sm-inline">Edit</span>
                        </button>

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

                  <h5 className="d-flex align-items-center mb-4">
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

                          <span className="fw-semibold fs-5">
                            {profile.RMName || <span className="text-danger">Not assigned</span>}
                          </span>

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
                  </div>

                  <div className="address-content bg-light p-4 rounded-4">
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
          { id: "cardAssigning", label: "Card Assigning", icon: "bi-card-checklist" }
        ].map((item) => (
          <Button
            key={item.id}
            variant={activeSection === item.id ? "contained" : "outlined"}
            onClick={() => setActiveSection(item.id)}
            sx={{
              borderRadius: 5, // Reduce border radius
              px: { xs: 1.5, sm: 2 }, // Reduce horizontal padding
              py: 0.8, // Reduce vertical padding
              fontSize: "0.85rem", // Reduce font size
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
                        <th>Actions</th>
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
                          <td>
                            <div className="dropdown">
                              <button
                                className="btn btn-sm btn-outline-secondary dropdown-toggle"
                                type="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                Actions
                              </button>
                              <ul className="dropdown-menu">
                                <li>
                                  <a className="dropdown-item" href="#">
                                    <i className="bi bi-eye me-2"></i>View Details
                                  </a>
                                </li>
                                {call.DateToBeVisited && call.DateToBeVisited !== "0001-01-01T00:00:00" && (
                                  <li>
                                    <a className="dropdown-item" href="#">
                                      <i className="bi bi-calendar-check me-2"></i>
                                      Scheduled Visit: {moment(call.DateToBeVisited).local().format("DD-MMM-YYYY")}
                                    </a>
                                  </li>
                                )}
                                {call.RequestCallBack && call.RequestCallBack !== "0001-01-01T00:00:00" && (
                                  <li>
                                    <a className="dropdown-item" href="#">
                                      <i className="bi bi-telephone-outbound me-2"></i>
                                      Callback: {moment(call.RequestCallBack).local().format("DD-MMM-YYYY")}
                                    </a>
                                  </li>
                                )}
                              </ul>
                            </div>
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

      {activeSection === "cardAssigning" && (
        <div className="container-fluid p-0">
          {/* Card Assignment Section */}
          <div className="card shadow-sm mb-4 border-0 rounded-lg">
            <div className="card-header bg-white py-3 border-0">
              <h5 className="fw-bold m-0 text-primary">Assign Cards</h5>
            </div>
            <div className="card-body p-4">
              <div className="row g-4">
                {/* Number of Cards Input */}
                <div className="col-12 col-md-6 col-lg-4">
                  <div className="form-group">
                    <label htmlFor="noOfAssigns" className="form-label fw-semibold mb-2">
                      Enter number of cards:
                    </label>
                    <input
                      type="number"
                      id="noOfAssigns"
                      className="form-control form-control-lg"
                      value={noOfAssigns || ""}
                      onChange={(e) => setNoOfAssigns(parseInt(e.target.value) || null)}
                      min={1}
                      placeholder="How many cards?"
                    />
                  </div>
                </div>

                {/* Card Number Inputs */}
                <div className="col-12 mt-2">
                  <div className="row g-3">
                    {cardNumbers.map((card, index) => (
                      <div className="col-12 col-md-6 col-lg-4" key={index}>
                        <div className="input-group">
                          <Cleave
                            type="tel"
                            className="form-control"
                            placeholder="Enter Card Number"
                            maxLength={14}
                            onChange={(e) => handleChange(index, e.target.value)}
                            value={card.cardNumber}
                            options={{ blocks: [4, 4, 4], delimiter: " " }}
                          />
                          <button
                            className="btn btn-outline-danger"
                            type="button"
                            onClick={() => handleRemoveCard(index)}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="col-12 mt-4">
                  <div className="d-flex flex-wrap gap-3">
                    <button
                      className="btn btn-outline-primary px-4 py-2"
                      onClick={handleAddCard}
                    >
                      <i className="fas fa-plus me-2"></i> Add Card
                    </button>
                    <button
                      className="btn btn-primary px-4 py-2"
                      onClick={handleAdd}
                      disabled={cardNumbers.length === 0}
                    >
                      <i className="fas fa-check me-2"></i> Assign Cards
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Advisor Cards Display Section */}
          {distributorCards && distributorCards.length > 0 && (
            <div className="card shadow-sm border-0 rounded-lg">
              <div className="card-header d-flex justify-content-between align-items-center bg-white py-3 border-0">
                <h5 className="fw-bold m-0 text-primary">Distributor Cards</h5>
                <span className="badge bg-info text-white">{distributorCards.length} cards</span>
              </div>
              <div className="card-body p-0">
                {loading ? (
                  <div className="d-flex justify-content-center align-items-center p-5">
                    <CircularProgress />
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-primary">
                        <tr>
                          {[
                            "CARD ID",
                            "CARD NUMBER",
                            "ASSIGNED DATE",
                            "STATUS",
                            "SOLD DATE",
                            "USER NAME",
                            "DISTRIBUTOR NAME",
                            "SOLD TO"
                          ].map((header) => (
                            <th key={header} className="py-3">{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {distributorCards.map((distributorCard, index) => (
                          <tr key={index}>
                            <td className="py-3">{distributorCard.OHOCardsId}</td>
                            <td className="py-3 fw-semibold">{distributorCard.OHOCardNumber}</td>
                            <td className="py-3">
                              {distributorCard.AssignedTOMemberDate
                                ? formatDate1(distributorCard.AssignedTOMemberDate)
                                : "-"}
                            </td>
                            <td className="py-3">
                              <span
                                className={`badge ${distributorCard.IsCardSold ? "bg-success" : "bg-danger"} px-3 py-2`}
                              >
                                {distributorCard.IsCardSold ? "Sold" : "Not Sold"}
                              </span>
                            </td>
                            <td className="py-3">
                              {distributorCard.CardSoldDate
                                ? formatDate1(distributorCard.CardSoldDate)
                                : "-"}
                            </td>
                            <td className="py-3">{distributorCard.UserName}</td>
                            <td className="py-3">{distributorCard.DistributorName}</td>
                            <td className="py-3">{distributorCard.SoldTo || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
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

      {/* <div className="row">
                <div className="col-md-12">
                    <ul className="nav nav-pills flex-column flex-sm-row mb-4">
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'callHistory' ? 'active' : ''}`}
                                onClick={() => handleTabChange('callHistory')}
                            >
                                <i className='bx bx-phone'></i> Call History
                            </button>
                        </li>

                        <li className="nav-item">
                            <button className={`nav-link ${activeTab === 'cards' ? 'active' : ''}`} onClick={() => handleTabChange('cards')}>
                                <i className='bx bx-card'></i> Cards & Products</button>
                        </li>

                        {showProductDetailsTab && (
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
                                    onClick={() => handleTabChange('products')}
                                >
                                    <i className='bx bx-grid-alt'></i> Product Details
                                </button>
                            </li>
                        )}

                        <li className="nav-item">
                            <button className={`nav-link ${activeTab === 'purchaseProducts' ? 'active' : ''}`} onClick={() => handleTabChange('purchaseProducts')}>
                                <i className="fa-solid fa-list"></i> Purchase Products</button>
                        </li>

                    </ul>
                </div>
            </div>

            <BoxWrapper>
                <>
                    {activeTab === 'callHistory' && (
                        <div className="row">
                            <div className="row">
                                <div className="card col-md-5 pt-2 pb-2" style={{ marginRight: 11, minWidth: 495 }}>
                                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <h3>Call History</h3>
                                        <div className="col-md-4">
                                            <button className="btn btn-primary btn-md mb-4" style={customStyles.addCallLogButton} onClick={handleAddNewCallLog}>Add New Call Log</button>
                                        </div>
                                    </div>
                                    {formVisible && (
                                        <form onSubmit={onSubmitHandler} className="p-4 border rounded shadow-sm bg-white mb-4">
                                            <div className="mb-4">
                                                <h5 className="mb-3" style={{ fontWeight: 'bold' }}>Call Response  <span className="required" style={{ color: "red" }}> *</span></h5>

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
                                                            placeholder="YYYY-MM-DD HH:MM"
                                                            value={formData.DateToBeVisited}
                                                            onChange={onChangeHandler}
                                                        />

                                                    </div>
                                                </div>

                                                <div className="col-12 col-sm-6">
                                                    <div className="mb-3">
                                                        <label htmlFor="RequestCallBack" className="form-label">Request Call Back</label>
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
                                                    <button type="submit" className="btn btn-primary" disabled={!isFormValid}>
                                                        {isEditing ? 'Update' : 'Submit'}
                                                    </button>
                                                    <button className="btn btn-secondary ms-2" type="button" onClick={handleResetForm}>
                                                        Reset
                                                    </button>
                                                    <button className="btn btn-danger ms-2" type="button" onClick={handleBackToView}>
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>

                                        </form>
                                    )}
                                    {callHistory && callHistory.length > 0 ? (
                                        <div className="card card-action mb-4">
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
                                                                        <span className="badge bg-label-primary mb-2" style={{ marginLeft: '8px' }} >
                                                                            {call.CallResponseName}
                                                                        </span>
                                                                    </h6>
                                                                    <small className="text-muted">
                                                                        {moment.utc(call.CollectedDate).local().diff(moment(), 'days') <= thresholdDays
                                                                            ? <strong>{moment.utc(call.CollectedDate).local().fromNow()}</strong>
                                                                            : <strong>{moment.utc(call.CollectedDate).local().format('DD-MMM-YYYY HH:mm')}</strong>}
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
                                                                        <p className="mb-0">{moment.utc(call.DateToBeVisited).local().format('DD-MMM-YYYY HH:mm')}</p>
                                                                    </>
                                                                )}

                                                                {call.RequestCallBack !== '0001-01-01T00:00:00' && (
                                                                    <>
                                                                        <div className="timeline-header mb-1 mt-1">
                                                                            <h6 className="mb-0">Requested Callback on :</h6>
                                                                        </div>
                                                                        <p className="mb-0">{moment.utc(call.RequestCallBack).local().format('DD-MMM-YYYY HH:mm')}</p>
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
                                    ) : (
                                        <div className="text-danger fw-semibold mb-4 mx-2">
                                            No Call History records
                                        </div>
                                    )}
                                    <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                                        <Alert onClose={handleSnackbarClose} severity="success">
                                            {snackbarMessage}
                                        </Alert>
                                    </Snackbar>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'cards' && (
                        <>
                            {cardDetails.status && cardDetails.returnData.length > 0 ? (
                                <div className="card-body position-relative mx-4 my-4">
                                    {cardDetails.returnData[0].IsActivated === null && (
                                        <button type='button' className="btn btn-success mb-3" onClick={() => handleUpdateActivated('Activate')}>Activate Card</button>
                                    )}

                                    {cardDetails.returnData[0].IsActivated === false && (
                                        <button type='button' className="btn btn-success mb-3" onClick={() => handleUpdateActivated('Activate')}>Activate Card</button>
                                    )}

                                    {cardDetails.returnData[0].IsActivated === true && (
                                        <button type='button' className="btn btn-danger mb-3" onClick={() => handleUpdateActivated('Deactivate')}>Deactivate Card</button>
                                    )}

                                    <button type='button' className="btn btn-success mb-3 ms-3" onClick={(e) => handleBookService(e)}>Book Service</button>

                                    <div
                                        className="row"
                                    >
                                        <div
                                            style={{
                                                width: "330px",
                                                height: "200px",
                                                margin: "10px",
                                                perspective: "1000px",
                                                borderRadius: "5px",
                                            }}
                                            onMouseEnter={() => setIsFlipped(true)}
                                            onMouseLeave={() => setIsFlipped(false)}
                                        >
                                            <div
                                                style={{
                                                    position: "relative",
                                                    width: "100%",
                                                    height: "100%",
                                                    textAlign: "center",
                                                    transition: "transform 0.6s",
                                                    transformStyle: "preserve-3d",
                                                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                                                    borderRadius: "8px",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        position: "absolute",
                                                        width: "100%",
                                                        height: "100%",
                                                        backfaceVisibility: "hidden",
                                                        borderRadius: "10px",
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    <img
                                                        src={
                                                            cardDetails.returnData
                                                                ? "https://ohoindia-mous.s3.ap-south-1.amazonaws.com/40831cda-bf5a-4945-b607-36b65f77ac70.jpg"
                                                                : "../../assets/img/dummy-avatar.jpg"
                                                        }
                                                        alt="Front side"
                                                        style={{
                                                            width: "100%",
                                                            height: "100%"
                                                        }}
                                                    />
                                                    <p
                                                        style={{
                                                            position: "absolute",
                                                            bottom: "13px",
                                                            left: "34px",
                                                            color: "white",
                                                            fontSize: "1.1rem",
                                                        }}
                                                    >
                                                        {formatCardNumber(cardDetails.returnData[0]?.OHOCardnumber)}
                                                    </p>
                                                </div>

                                                <div
                                                    style={{
                                                        position: "absolute",
                                                        width: "100%",
                                                        height: "100%",
                                                        backfaceVisibility: "hidden",
                                                        transform: "rotateY(180deg)",
                                                        borderRadius: "10px",
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    <img
                                                        src={
                                                            cardDetails.returnData
                                                                ? "https://ohoindia-mous.s3.ap-south-1.amazonaws.com/3b56a6e5-41ca-4049-a882-02a3d14e1d78.jpg"
                                                                : "../../assets/img/dummy-avatar.jpg"
                                                        }
                                                        alt="Back side"
                                                        style={{
                                                            width: "100%",
                                                            height: "100%"
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row mt-4">
                                        <div className="col-xl-12 col-lg-12">
                                            <div className="card-body d-flex flex-row overflow-auto mb-2 mx-2">
                                                {products && products.length > 0 ? (
                                                    products.map((product, index) => (
                                                        (product.ProductName) ? (
                                                            <div key={index} className="col-md-4 mb-4">
                                                                <div
                                                                    className="card me-2 shadow-sm border-0"
                                                                    onClick={() => handleProductClick(product)}
                                                                    style={{ cursor: "pointer", borderRadius: "8px" }}
                                                                >
                                                                    <div className="p-3">
                                                                        <div className="d-flex flex-column mb-2">
                                                                            {product.ProductCategoryName && (
                                                                                <span className="badge bg-label-primary align-self-end mb-1">
                                                                                    {product.ProductCategoryName}
                                                                                </span>
                                                                            )}
                                                                            {product.ProductName && (
                                                                                <h6 className="fw-bold mb-0" style={{ fontSize: "1.1rem" }}>
                                                                                    {product.ProductName}
                                                                                </h6>
                                                                            )}
                                                                        </div>

                                                                        <hr className="mb-2" />

                                                                        <ul className="list-unstyled d-flex flex-column align-items-start">
                                                                            {product.IsCombo !== null && (
                                                                                <li className="mb-2">
                                                                                    <span className={`fw-bold badge ${product.IsCombo ? 'bg-primary' : 'bg-success'}`}>
                                                                                        {product.IsCombo ? 'Combo Product' : 'Individual Product'}
                                                                                    </span>
                                                                                </li>
                                                                            )}
                                                                            {product.IssuedOn && product.ValidTill && (
                                                                                <li className="mb-2">
                                                                                    <div className="d-flex flex-row align-items-center">
                                                                                        <strong className="fw-bold me-1">Validity:</strong>
                                                                                        <span>{formatDate(product.ValidTill).slice(0, 11)}</span>
                                                                                    </div>
                                                                                </li>
                                                                            )}
                                                                        </ul>

                                                                        {product.IsVerified !== null && (
                                                                            <div className={`alert ${product.IsVerified ? 'alert-success' : 'alert-danger'} m-0 p-1`} role="alert">
                                                                                {product.IsVerified ? 'Product verification successful' : product.verificationMessage || 'Product not verified'}
                                                                            </div>
                                                                        )}

                                                                        <button
                                                                            className="btn btn-outline-primary mt-3 w-100"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation(); 
                                                                                handleProductClick(product);
                                                                            }}
                                                                        >
                                                                            Add Family Members
                                                                        </button>

                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : null
                                                    ))
                                                ) : (
                                                    <div className="text-danger fw-semibold mb-4 mx-2 text-center">
                                                        Sorry, You haven't purchased any products.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : cardDetails.status === false ? (
                                <div className="text-danger fw-semibold text-center mb-4 mx-2">{cardDetails.message}</div>
                            ) : (
                                <div className="text-danger fw-semibold text-center mb-4 mx-2">Sorry, You haven't purchased any products.</div>
                            )}
                        </>
                    )}

                    {activeTab === 'products' && selectedProduct && (
                        <>
                            {selectedProduct ? (
                                <>
                                    <div className="d-flex flex-row mb-2">
                                        <button className="btn bg-primary text-white h-25 ms-2" onClick={handlePrint}>
                                            Print Address
                                        </button>
                                        <button className="btn bg-primary text-white h-25 ms-2" onClick={handleGenerateMembership}>
                                            Generate Membership
                                        </button>
                                    </div>

                                    <div className="col-xl-12 col-md-12 col-lg-12 d-flex justify-content-center">
                                        <div className="card-body d-flex flex-wrap overflow-auto" style={{ width: "50%" }}>
                                            <div
                                                className="card card-custom"
                                                style={{
                                                    borderRadius: "12px",
                                                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                                    padding: "16px",
                                                    backgroundColor: "#ffffff"
                                                }}
                                            >
                                                <div className="card-body card-body-custom">
                                                    <dl className="row mb-0">
                                                        {selectedProduct.ProductName && (
                                                            <>
                                                                <dt className="col-6 col-sm-4 fw-bold text-primary">
                                                                    <i className="bi bi-box-seam me-1"></i>Product Name:
                                                                </dt>
                                                                <dd className="col-6 col-sm-8 text-dark fw-semibold">
                                                                    {selectedProduct.ProductName}
                                                                </dd>
                                                            </>
                                                        )}

                                                        {selectedProduct.PaidAmount && (
                                                            <>
                                                                <dt className="col-6 col-sm-4 fw-bold text-primary">
                                                                    <i className="bi bi-currency-rupee me-1"></i>Price:
                                                                </dt>
                                                                <dd className="col-6 col-sm-8 text-success">
                                                                    <i className="bi bi-currency-rupee"></i> {selectedProduct.PaidAmount}
                                                                </dd>
                                                            </>
                                                        )}

                                                        <>
                                                            <dt className="col-6 col-sm-4 fw-bold text-primary">
                                                                <i className="bi bi-credit-card me-1"></i>UTR Number:
                                                            </dt>
                                                            <dd className="col-6 col-sm-8">
                                                                {selectedProduct.UTRNumber && selectedProduct.UTRNumber.length > 0 ? (
                                                                    <span>{selectedProduct.UTRNumber}</span>
                                                                ) : (<span className="text-danger">UTR Number does't exist</span>)}
                                                            </dd>
                                                        </>

                                                        {policies && policies.length > 0 && (
                                                            <>
                                                                <h5 className="ps-5 py-3 text-dark fw-bold">Policy Documents</h5>
                                                                {policies.map(one => (
                                                                    one.PolicyDocument && one.PolicyDocument ? (
                                                                        <div key={one.PoliciesId} className="row">
                                                                            <a href={`${paUrl}${one.PolicyDocument}`}
                                                                                className="col-6 col-sm-4 fw-bold text-primary"
                                                                                target="_blank" download
                                                                            >
                                                                                <i className="bi bi-file-earmark-pdf me-1"></i>{one.PoliciesProductName}
                                                                            </a>
                                                                            <dd className="col-6 col-sm-8">
                                                                                <button
                                                                                    className="btn btn-sm btn-primary"
                                                                                    data-bs-toggle="modal"
                                                                                    data-bs-target="#exLargeModal"
                                                                                    onClick={() => handleSelectPolicy(one)}
                                                                                >
                                                                                    Re-Upload
                                                                                </button>
                                                                            </dd>
                                                                        </div>
                                                                    ) : (
                                                                        <div key={one.PoliciesId} className="row">
                                                                            <a className="col-6 col-sm-4 fw-bold text-primary">
                                                                                <i className="bi bi-file-earmark-pdf me-1"></i>{one.PoliciesProductName}
                                                                            </a>
                                                                            <dd className="col-6 col-sm-8">
                                                                                <button
                                                                                    className="btn btn-sm btn-warning"
                                                                                    data-bs-toggle="modal"
                                                                                    data-bs-target="#exLargeModal"
                                                                                    onClick={() => handleSelectPolicy(one)}
                                                                                >
                                                                                    Upload
                                                                                </button>
                                                                            </dd>
                                                                        </div>
                                                                    )
                                                                ))}
                                                            </>
                                                        )}
                                                    </dl>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-danger fw-semibold mb-4 mx-2">No products purchased.</div>
                            )}

                            {showNominee && familyMembersLength < 3 && (
                                <BoxWrapper>
                                    {selectedProduct.IsCombo
                                        ? comboProductDetails.map((product, index) => (
                                            <SelectNominee key={index} selectedProduct={product} />
                                        ))
                                        : <SelectNominee selectedProduct={selectedProduct} />
                                    }
                                </BoxWrapper>
                            )}

                            {isEditing && selectedProduct && (
                                <>
                                    {selectedProduct.IsCombo
                                        ? comboProductDetails.map((product) => (
                                            <CardEditForms
                                                key={product.ProductsId} // Unique key for each CardEditForms component
                                                selectedProductId={product.ProductsId}
                                            />
                                        ))
                                        : <CardEditForms selectedProductId={selectedProduct.ProductsId} />
                                    }
                                </>
                            )}

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

                                            <form className="form-group custom-form p-3" onSubmit={handleFileSubmit}>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    required
                                                    onChange={(e) => handleUploadChange(e)}
                                                />
                                                <button
                                                    type="submit"
                                                    className="btn btn-success mt-2"
                                                    disabled={!file}
                                                >
                                                    {policyUploadLoad ? (
                                                        <div className="spinner-border text-white" role="status">
                                                            <span className="sr-only">Loading...</span>
                                                        </div>
                                                    ) : 'UPLOAD'}
                                                </button>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'purchaseProducts' && (
                        <>
                            {purchaseProduct ? (
                                <>
                                    {purchaseProduct.IsCombo === true && !cardNumberEntered && (
                                        <div className="card p-3" style={{ minWidth: "400px" }}>
                                            <label className="form-label" htmlFor="cardNumber" style={{ fontSize: "15px" }}>
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
                                            {cardNumberError && <p className="text-danger">{cardNumberError}</p>}
                                            <button
                                                className="btn btn-primary mt-3"
                                                onClick={checkCardNumberExists} 
                                            >
                                                Confirm Card Number
                                            </button>
                                        </div>
                                    )}

                                    {(!purchaseProduct.IsCombo || cardNumberEntered) && (
                                        <div className="card p-3 d-flex flex-column align-items-center">
                                            <h5 className="card-header">
                                                <strong>Product Name: </strong>
                                                <span className="text-primary fs-4 fw-bold">{purchaseProduct.ProductName}</span>
                                            </h5>
                                            <img
                                                src="https://ohoindia-mous.s3.ap-south-1.amazonaws.com/70ec0ebd-a761-4dc4-acb8-80750653a421.jpg"
                                                alt="QR Code"
                                                className="h-25 w-25 mt-3 mb-3"
                                            />
                                            <p className="fs-5">
                                                Amount to pay: <FontAwesomeIcon icon={faIndianRupeeSign} className="text-primary" />{" "}
                                                <span>{purchaseProduct.InsurancePremiums[0].TotalAmount}</span>
                                            </p>

                                            <div style={{ minWidth: "400px" }}>
                                                <label className="form-label" htmlFor="utrnumber" style={{ fontSize: "15px" }}>
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
                                                {utrError && <p className="text-danger">*Please Enter UTR Number</p>}
                                            </div>

                                            <div className="mt-3 d-flex flex-row justify-content-center">
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary me-sm-3 me-1"
                                                    onClick={(e) => submitUtrForm(e)}
                                                    style={{ minWidth: '100px' }}
                                                    disabled={utrSubmitLoad}
                                                >
                                                    {utrSubmitLoad ? (
                                                        <div class="spinner-border text-white" role="status">
                                                            <span class="sr-only">Loading...</span>
                                                        </div>
                                                    ) : 'Submit'}
                                                </button>
                                                <button type="button" className="btn btn-label-secondary" onClick={() => setPurchaseProduct()}>
                                                    Cancel
                                                </button>
                                            </div>

                                            {paymentSuccessMsg && <p className="text-success mt-3">Successfully purchased product</p>}
                                            {memberPrdAddFail && memberPrdAddFail.length > 0 && <p className="text-danger mt-3">{memberPrdAddFail}</p>}
                                            {paymentFailureError && paymentFailureError.length > 0 && <p className="text-danger mt-3">{paymentFailureError}</p>}
                                            {updatePaymentForProductError && updatePaymentForProductError.length > 0 && <p className="text-danger mt-3">{updatePaymentForProductError}</p>}
                                            {cardAddError && cardAddError.length > 0 && <p className="text-danger mt-3">{cardAddError}</p>}
                                        </div>
                                    )}
                                </>
                            ) : (
                                availableProducts && availableProducts.length > 0 ? (
                                    <div className="container-fluid">
                                        <div className="row">
                                            {availableProducts.map(product => (
                                                <div key={product.ProductsId} className="card d-flex flex-column col-md-5 p-3 mt-2 mb-2 me-3">
                                                    <div className="d-flex flex-row align-items-center">
                                                        <i className="fa-solid fa-circle-check me-2" style={{ color: '#349bc7' }}></i>
                                                        <h5 className="mb-1 text-dark">{product.ProductName}</h5>
                                                    </div>
                                                    <p className="text-secondary" style={{ fontSize: '14px' }}>{product.ProductCategoryName}</p>

                                                    <div className="d-flex flex-row align-items-center">
                                                        <h6>Amount: </h6>
                                                        <p className="ms-1"><i className="fa-solid fa-indian-rupee-sign" style={{ color: '#349bc7' }}></i> {product.SaleAmount}</p>
                                                    </div>
                                                    <button className="btn btn-primary align-self-end" onClick={() => setPurchaseProduct(product)}>Purchase</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <h4 className="text-danger fw-semibold text-center">No Products Available</h4>
                                    </div>
                                )
                            )}

                        </>
                    )}
                </>
            </BoxWrapper> */}

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
