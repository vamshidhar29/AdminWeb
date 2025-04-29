import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BoxWrapper from "../../Components/BoxWrapper";
import { fetchAllData, fetchData, fetchUpdateData, uploadImage } from "../../helpers/externapi";
import DataTable from 'react-data-table-component';
import { Link } from "react-router-dom";
import moment from 'moment';
import CardEditForms from '../../Components/CardEditForms';
import SelectNominee from '../../Components/SelectNominee';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Cleave from 'cleave.js/react';
import TableContainer from '@mui/material/TableContainer';
import ConfirmationDialogDelete from "../../Components/ConfirmationDialogDelete";
import Paper from '@mui/material/Paper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faIndianRupeeSign } from '@fortawesome/free-solid-svg-icons';
import { formatDate, formatDate1 } from '../../Commoncomponents/CommonComponents';

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function DistributorTabs(props) {
    const [loading, setLoading] = React.useState();
    const [formVisible, setFormVisible] = useState(false);
    const [leadsData, setLeadsData] = React.useState([]);
    const [cardDetails, setCardDetails] = React.useState([]);
    const [showNominee, setShowNominee] = useState(false);
    const [products, setProducts] = useState([]);
    const [callHistory, setCallHistory] = useState([]);
    const [PolicyCOINumber, setPolicyCOINumber] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [selectedProduct, setSelectedProduct] = React.useState(null);
    const [callResponseOptions, setCallResponseOptions] = useState([]);
    const [formError, setFormError] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showProductDetailsTab, setShowProductDetailsTab] = useState(false);
    const initialFormData = {
        callHistoryId: "", callLog: "", CollectedDate: "", callResponsesId: "", DateToBeVisited: "", RequestCallBack: ""
    }
    const [formData, setFormData] = useState(initialFormData);
    const [distributorCards, setDistributorCards] = useState([]);
    const [isFormValid, setIsFormValid] = useState(false);
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [confirmationData, setConfirmationData] = useState({});
    const [file, setFile] = useState();
    const [availableProducts, setAvailableProducts] = useState();
    const [memberDetails, setMemberDetails] = useState();
    const [purchaseProduct, setPurchaseProduct] = useState();
    const [utrNumber, setUtrNumber] = useState('');
    const [utrError, setUtrError] = useState(false);
    const [paymentSuccessMsg, setPaymentSeccessMsg] = useState(false);
    const [comboProductDetails, setComboProductDetails] = useState([]);
    const [noOfAssigns, setNoOfAssigns] = useState(null);
    const [familyMembersLength, setFamilyMembesLength] = useState();
    const [cardNumbers, setCardNumbers] = useState([{ cardNumber: '2804 00', error: '' }]);
    const [cardsNumberError, setCardsNumberError] = useState("");
    const [cardNumberEntered, setCardNumberEntered] = useState(false);
    const [cardNumber, setCardNumber] = useState("2804 00");
    const [cardNumberError, setCardNumberError] = useState(null);
    const [memberPrdAddFail, setMemberProdAddFail] = useState('');
    const [paymentFailureError, setPaymentFailureError] = useState('');
    const [updatePaymentForProductError, setUpdatePaymentForProductError] = useState('');
    const [cardAddError, setCardAddError] = useState('');
    const [utrSubmitLoad, setUtrSubmitLoad] = useState(false);
    const [base64, setBase64] = useState(null);
    const [paUrl, setPaUrl] = useState('');
    const [policyUploadLoad, setPolicyUploadLoad] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);
    const [policies, setPolicies] = useState([]);
    const [selectedPolicy, setSelectedpolicy] = useState();

    const id = useParams();
    let UserId = localStorage.getItem("UserId");
    const navigate = useNavigate();

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setPurchaseProduct();
        if (tab !== 'products') {
            setShowProductDetailsTab(false);
        }
    };

    const customStyles = {
        rows: {
            style: {
                minHeight: '45px',
            },
        },
        headCells: {
            style: {
                paddingLeft: '8px',
                paddingRight: '8px',
                color: "#566a7f",
                fontSize: "0.75rem",
                letterSpacing: 1,
                textTransform: "uppercase"
            },
        },
        cells: {
            style: {
                paddingLeft: '2px',
                paddingRight: '2px',
                fontSize: "12px"
            },
        },
        addCallLogButton: {
            fontSize: 14,
            padding: 5,
        },
    };

    const handleCardNumberChange = (e) => {
        let input = e.target.value.replace(/\D/g, "").substring(6);

        if (input.length > 6) {
            input = input.slice(0, 6);
        }

        const formattedCardNumber = `2804 00${input.slice(0, 2)} ${input.slice(2)}`.trim();
        setCardNumber(formattedCardNumber);
    };

    const checkCardNumberExists = async () => {
        try {
            const response = await fetchData('OHOCards/cardNumberExistorNot', { cardNumber, rmId:UserId, memberId:id.Id });
            if (response.status === true) {
                setCardNumberEntered(true);
                setCardNumberError(null);
            } else {
                setCardNumberError(response.message);
            }
        } catch (error) {
            setCardNumberError("An error occurred while checking the card number. Please try again.");
        }
    };

    const handleProductClick = async (product) => {
        const details = await fetchAllData(`ComboProducts/FetchComboProducts/${product.ProductsId}`);
        setComboProductDetails(details);

        const response = await fetchAllData(`MemberDependent/GetDependentsByMemberProductId/${id.Id}/${product.ProductsId}`);
        setFamilyMembesLength(response.length);

        setSelectedProduct(product);
        setShowNominee(true);

        setIsEditing(true);
        setShowProductDetailsTab(true);
        setActiveTab('products');
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetchAllData(`OHOCards/GetMemberCardByMemberId/${id.Id}`);
                setCardDetails(response);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [id]);

    useEffect(() => {
        const getLeadData = async () => {
            setLoading(true);
            try {
                const skip = (currentPage - 1) * itemsPerPage;
                const leadsData = await fetchAllData(`Lead/GetListById/${id.Id}`, { "skip": skip, "take": itemsPerPage });
                setLeadsData(leadsData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching lead data:', error);
                setLoading(false);
            }
        };

        const getPAUrl = async () => {
            const response = await fetchData('ConfigValues/all', { skip: 0, take: 0 });
            const bucketUrl = response && response.length > 0 && response.find(val => val.ConfigKey === "productPoliciesURL");
            setPaUrl(bucketUrl.ConfigValue);
        };

        getLeadData();
        getPAUrl();
    }, []);

    const convertDOBFormat = (dobString) => {
        const date = new Date(dobString);
        if (isNaN(date.getTime())) {
            return "Invalid Date";
        } else {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        }
    };

    useEffect(() => {
        const getCardTypes = async () => {
            setLoading(true);
            try {
                const cardTypes = await fetchData(`TypeofCard/all`, { "skip": 0, "take": 0 });
                setLoading(false);
            } catch (error) {
                console.error('Error fetching card types:', error);

            } finally {
                setLoading(false);
            }
        };
        getCardTypes();
    }, []);

    useEffect(() => {
        const isFormValid = formData.callResponsesId.length > 0;
        setIsFormValid(isFormValid);
    }, [formData]);

    useEffect(() => {
        const fetchProductsData = async () => {
            setLoading(true);
            try {
                const response = await fetchAllData(`Member/GetMemberProducts/${id.Id}`);

                const updatedProducts = response[0].Products.map(product => ({
                    ...product,
                    verificationMessage: product.IsVerified === false || product.IsVerified === null
                        ? "Product is under verification"
                        : "Product verification success"
                }));

                setProducts(updatedProducts);
                setPolicies(response[0].Products[0].Policies)
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        const fetchMemberData = async () => {
            setLoading(true);
            try {
                const response = await fetchAllData(`Member/GetById/${id.Id}`);
                setMemberDetails(response);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        fetchMemberData();
        fetchProductsData();
    }, [id.Id]);

    useEffect(() => {
        const getCallResponse = async () => {
            setLoading(true);
            try {
                const getResponseTypes = await fetchData('CallResponseType/all', { skip: 0, take: 0 });

                let CallResponseTypeId = getResponseTypes.filter(types => types.ResponseName === "Member");

                const response = await fetchAllData(`CallResponse/GetCallResponsesByResponseType/${CallResponseTypeId[0].CallResponseTypeId}`);
                setCallResponseOptions(response);
            } catch (error) {
                console.error('Error fetching call responses:', error);
            } finally {
                setLoading(false);
            }
        };

        const getAvailableProducts = async () => {
            setLoading(true);
            try {
                if (cardDetails && products && cardDetails.status && products.length > 0) {
                    const response = await fetchAllData(`MembersProducts/GetProductForMember/${memberDetails[0].MemberId}`);
                    setAvailableProducts(response);
                } else {
                    const response = await fetchData('Products/all', { skip: 0, take: 0 });
                    let getCombo = [];

                    response && response.length > 0 && response.map(each => {
                        if (each.IsCombo) {
                            getCombo = [...getCombo, each];
                        }
                    })

                    setAvailableProducts(getCombo);
                }
            } catch (error) {
                console.error('Error fetching available products: ', error);
            }
        };

        getAvailableProducts();
        getCallResponse();
    }, [memberDetails, products, cardDetails]);

    const fetchCallHistoryData = async () => {
        setLoading(true);
        try {
            const response = await fetchAllData(`CallHistory/GetAllCallHistoryByMemberId/${id.Id}`);
            setCallHistory(response);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCallHistoryData();
    }, [id.Id]);

    const formatCardNumber = (cardNumber) => {
        if (!cardNumber) return '';
        const chunks = cardNumber.replace(/\s/g, '').match(/.{1,4}/g);
        return chunks.join(' ');
    };;

    const columns = [
        {
            name: 'Full name',
            cell: row => (<div style={{ display: "flex", flexDirection: "row" }}>
                <div className="mx-2">
                    <Link className="nav-link" to={row.MemberTypeId === 1 ? `/distributor/details/${row.MemberId}` : `/customers/details/${row.MemberId}`}>{row.LeadName}</Link>
                </div>
            </div>),
            wrap: true,
            sortable: true,
        },
        {
            name: 'Contact',
            selector: row => row.MobileNo,
            cell: row => (
                <div>
                    <div><a href={"tel:" + row.MobileNumber}><i className='bx bx-phone-call'></i> &nbsp;{row.MobileNumber}</a></div>
                </div>),
        },
        {
            name: 'Generated On',
            selector: row => row.GeneratedOn,
            cell: row => moment(row.GeneratedOn).format('DD-MMM-YYYY'),
        },
    ];

    const onChangeHandler = (event) => {
        const { name, value, type, checked } = event.target;
        let updatedFormData = { ...formData, [name]: type === 'checkbox' ? (checked ? value : '') : value };
        let error = '';

        setFormData(updatedFormData);
        setFormError({ ...formError, [name]: error });
    };

    const handleAddNewCallLog = () => {
        setFormVisible(true);
        setFormData({ callHistoryId: "", callLog: "", CollectedDate: "", callResponsesId: "", DateToBeVisited: "", RequestCallBack: "" });
    };

    const handleResetForm = () => {
        setFormData(initialFormData);
        setFormError({});
    };

    const handleBackToView = () => {
        setFormVisible(false);
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            let CallHistoryData;
            const requestData = {
                callLog: formData.callLog,
                MemberId: id.Id,
                userId: UserId,
                callResponsesId: formData.callResponsesId
            };

            if (formData.DateToBeVisited) {
                requestData.DateToBeVisited = new Date(formData.DateToBeVisited).toISOString();
            }

            if (formData.RequestCallBack) {
                requestData.RequestCallBack = new Date(formData.RequestCallBack).toISOString();
            }

            // if (isEditing) {
            //     requestData.callHistoryId = formData.callHistoryId;
            //     CallHistoryData = await fetchUpdateData('CallHistory/update', requestData);
            //     setSnackbarMessage("Call log updated successfully!");
            // } else {
            CallHistoryData = await fetchData('CallHistory/add', requestData);
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

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const getDistributorCards = async () => {
        try {
            setLoading(true);
            const distributorCardsData = await fetchAllData(`OHOCards/GetByMemberId/${id.Id}`);
            setDistributorCards(distributorCardsData);
        } catch (error) {
            console.error("Error fetching Ditributor Card data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCard = () => {
        setCardNumbers([...cardNumbers, { cardNumber: '2804 00', error: '' }]);
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
            const cardNumber = input.cardNumber.replace(/\s/g, ''); // Remove spaces
            if (cardNumber.length !== 12 || !/^\d{12}$/.test(cardNumber)) {
                updatedCardNumbers[index].error = 'Card number must be exactly 12 digits.';
                hasError = true;
            } else {
                updatedCardNumbers[index].error = '';
            }
        });

        setCardNumbers(updatedCardNumbers);

        if (hasError) {
            setCardsNumberError('Enter a valid 12-digit Card Number.');
            return;
        }

        try {
            const cardsToAssign = noOfAssigns || updatedCardNumbers.length; // Use noOfAssigns if provided, otherwise use actual count
            const payload = {
                ohoCardNumber: updatedCardNumbers.slice(0, cardsToAssign).map((input) => input.cardNumber.trim()),
                noOfAssigns: cardsToAssign,
                rmId: UserId,
                memberId: id.Id,
            };

            const response = await fetchData('OHOCards/AssignCardsToDistributor', payload);

            setSnackbarMessage(response.message || response.data);
            setSnackbarOpen(true);
            setCardNumbers([{ cardNumber: '2804 00', error: '' }]); // Reset input fields
            setNoOfAssigns(null);

            await getDistributorCards();
        } catch (error) {
            console.error('Error assigning card numbers:', error);
        }
    };

    useEffect(() => {
        getDistributorCards();
    }, []);

    const cardActiveAndDeactive = async () => {
        const memberId = cardDetails.returnData[0].CardPurchasedMemberId;
        const isActivated = cardDetails.returnData[0].IsActivated === null ? true : cardDetails.returnData[0].IsActivated === false ? true : false;

        const updateApi = await fetchData('OHOCards/ActivateorDeactivateTheCard', { memberId, isActivated });

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

    const formatKeyFeatures = (keyFeatures) => {
        if (!keyFeatures) return [];
        return keyFeatures
            .replace(/<[^>]*>/g, '')
            .split('.')
            .filter(feature => feature.trim() !== '');
    };

    const CardcustomStyles = {
        container: {
            padding: '20px',
            backgroundColor: '#f0f0f0',
            borderRadius: '8px',
            margin: '20px'
        },
        header: {
            marginBottom: '10px',
            color: '#333',
        },
        addButton: {
            marginBottom: '20px',
            backgroundColor: '#4caf50',
        },
        tableContainer: {
            overflowX: 'auto',
            marginBottom: '20px',
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
        },
        th: {
            border: '1px solid #ddd',
            padding: '8px',
            backgroundColor: '#f2f2f2',
            color: '#333',
        },
        customheight: {
            height: '15px',
            padding: '10px'
        },
        td: {
            border: '1px solid #ddd',
            padding: '8px',
            color: '#333',
        },
        tdCenter: {
            border: '1px solid #ddd',
            padding: '8px',
            textAlign: 'center',
            color: '#333',
        },
        loadingContainer: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
        },
        errorContainer: {

            color: '#721c24',
            padding: '10px',
            marginBottom: '10px',
        },
        errorText: {
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#ff0000',
        },
    };

    const handlePrint = () => {
        // Concatenate the address as needed
        const addAddress = () => {
            let address = '';
            selectedProduct.AddressLine1 && (address = `${address} ${selectedProduct.AddressLine1}`);
            selectedProduct.AddressLine2 && (address = `${address}, ${selectedProduct.AddressLine2}`);
            selectedProduct.Village && (address = `${address}, ${selectedProduct.Village}`);
            selectedProduct.City && (address = `${address}, ${selectedProduct.City}`);
            selectedProduct.Mandal && (address = `${address}, ${selectedProduct.Mandal}`);
            selectedProduct.District && (address = `${address}, ${selectedProduct.District}`);
            selectedProduct.State && (address = `${address}, ${selectedProduct.State}`);
            selectedProduct.pincode && (address = `${address}, ${selectedProduct.pincode}`);
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
        printWindow.document.write('<html>');
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
        printWindow.document.write('<body>');
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
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    };

    const handleUploadChange = (e) => {
        const file = e.target.files[0];
        e.preventDefault();

        if (file) {
            setFile(file);
            const reader = new FileReader();

            reader.onload = () => {
                if (reader.result) {
                    setBase64(reader.result.toString());
                }
            };

            reader.readAsDataURL(file);
        }
    };

    const handleFileSubmit = async (e) => {
        e.preventDefault();
        const content = base64.split('base64,');

        const formData = new FormData();
        formData.append('memberId', id.Id);
        formData.append('productsId', selectedPolicy.PoliciesProductsId);
        formData.append('individualProductsId', selectedPolicy.IndividualProductsId);
        formData.append('policyDocument', file);
        formData.append('PolicyCOINumber', PolicyCOINumber);
        formData.append("FileContent", content[1]);

        try {
            setPolicyUploadLoad(true);

            const uploadFile = await uploadImage('MembersProducts/uploadingPolicyDoc', formData);
            setSnackbarMessage(uploadFile.message)
            setSnackbarOpen(true);
            setPolicyUploadLoad(false);

            setTimeout(() => {
                window.location.reload();
            }, 2000)

        } catch (error) {
            console.error("Error uploading file:", error);
        }
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
                userId: UserId
            };

            const responseMemberProductAdd = await fetchData('MembersProducts/add', memberProductPayload);

            if (responseMemberProductAdd && responseMemberProductAdd.length > 0) {
                setMemberProdAddFail('');

                const paymentPayload = {
                    paidAmount: purchaseProduct.InsurancePremiums[0].BasePremium,
                    utrNumber: utrNumber,
                    typeofCard: "Privilege",
                    memberProductId: responseMemberProductAdd[0].memberProductId,
                    memberId: memberDetails[0].MemberId,
                }

                const responsePayment = await fetchData("PaymentDetails/add", paymentPayload);

                if (responsePayment.paymentDetailsId) {
                    setPaymentFailureError('');

                    const paymentMemberProductPayload = {
                        productsId: responseMemberProductAdd[0].productsId,
                        memberId: memberDetails[0].MemberId,
                        paymentDetailsId: responsePayment.paymentDetailsId
                    }

                    const responsePaymentMemberProduct = await fetchData('PaymentDetails/UpdatePaymentIdInMemberProduct', paymentMemberProductPayload);

                    if (responsePaymentMemberProduct) {
                        setUpdatePaymentForProductError('');

                        const ohoCardPayload = {
                            ohoCardsId: 0,
                            ohoCardNumber: cardNumber,
                            assignedToRM: UserId,
                            assignedToMember: memberDetails[0].MemberId,
                            cardPurchasedMemberId: memberDetails[0].MemberId,
                            productsId: responseMemberProductAdd[0].productsId,
                            userId: UserId
                        };

                        const responseOhoCard = await fetchData('OHOCards/add', ohoCardPayload);

                        setPaymentSeccessMsg(true);
                        if (responseOhoCard && responseOhoCard.status) {
                            setCardAddError('');
                            setPaymentSeccessMsg(true);
                            setTimeout(() => {
                                setPurchaseProduct();
                                setPaymentSeccessMsg(false);
                                setUtrNumber('');
                                setUtrError(false);
                                setUtrSubmitLoad(false);
                                window.location.reload();
                            }, 2000);
                        } else {
                            setUtrSubmitLoad(false);
                            setCardAddError('Sorry, Failed to add card. Please contact Technical team');
                            console.error('Failed to generate OHO card:', responseOhoCard);
                            //  console.error('Failed to generate OHO card:', responseOhoCard);
                        }
                    } else {
                        setUtrSubmitLoad(false);
                        setUpdatePaymentForProductError('Sorry, Failed to update payment for product. Please contact technical team');
                    }
                } else {
                    setUtrSubmitLoad(false);
                    setPaymentFailureError('Sorry payment failed. Please contact technical team.');
                }
            } else {
                setUtrSubmitLoad(false);
                setMemberProdAddFail('Sorry, Failed to add product. Please contact technical team');
            }

        } else {
            setUtrError(true);
        }
    };

    const handleGenerateMembership = async () => {
        setLoading(true);
        try {
            const configResponse = await fetchData('ConfigValues/all', { skip: 0, take: 0 });

            const bucketUrlConfig = configResponse && configResponse.length > 0
                ? configResponse.find(val => val.ConfigKey === "policiesDownloadURL")
                : null;

            if (!bucketUrlConfig) {
                //  console.error("Policies download URL configuration not found.");
                alert("Unable to download PDF. Configuration missing.");
                return;
            }

            const bucketUrl = bucketUrlConfig.ConfigValue;

            const response = await fetchData('PaymentDetails/PolicyGeneration', {
                MemberId: selectedProduct.MemberId,
                productsId: selectedProduct.ProductsId,
                MemberProductId: selectedProduct.MemberProductId
            });

            const { status, message, data } = response || {};

            if (status && data) {
                const downloadUrl = `${data}`;

                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = data;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

            } else {
                //  console.error("File generation failed or data is missing. Status:", status, "Message:", message);
                alert("Unable to download PDF. " + message);
            }
        } catch (error) {
            console.error('Error downloading membership PDF:', error);
            alert("An error occurred while trying to download the PDF.");
        } finally {
            setLoading(false);
        }
    };

    const handleBookService = async (e) => {
        e.preventDefault();
        navigate('/HospitalConsultation/book', {
            state: { memberId: id.Id }
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

    const thresholdDays = 5;

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <ul className="nav nav-pills flex-column flex-sm-row mb-4">
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                                onClick={() => handleTabChange('dashboard')}
                            >
                                <i className='bx bx-phone'></i> Call History & Leads
                            </button>
                        </li>

                        <li className="nav-item"><button
                            className={`nav-link ${activeTab === 'cards' ? 'active' : ''}`} onClick={() => handleTabChange('cards')}>
                            <i className='bx bx-card'></i>Cards & Products</button></li>
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
                            <button
                                className={`nav-link ${activeTab === 'ohoCardsDistributor' ? 'active' : ''}`}
                                onClick={() => handleTabChange('ohoCardsDistributor')}
                            >
                                <i className='bx bx-grid-alt'></i> OHOCards Distributor
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'availableProducts' ? 'active' : ''}`}
                                onClick={() => {
                                    handleTabChange('availableProducts');
                                    setPurchaseProduct();
                                }}
                            >
                                <i className="fa-solid fa-list"></i> Purchase Products
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            <BoxWrapper>
                <>
                    {activeTab === 'dashboard' && (
                        <div className="row">

                            <div className="row">
                                <div className="card col-md-5 pt-2 pb-2" style={{ marginRight: 11, minWidth: 495 }}>
                                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <h4>Call History</h4>
                                        <div className="col-md-4">
                                            <button className="btn btn-primary btn-md mb-4" style={customStyles.addCallLogButton} onClick={handleAddNewCallLog}>Add New Call Log</button>
                                        </div>
                                    </div>
                                    {formVisible && (
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
                                                            placeholder="YYYY-MM-DD HH:MM"
                                                            value={formData.DateToBeVisited}
                                                            onChange={onChangeHandler}
                                                        />
                                                        {formError.DateToBeVisited && <div className="text-danger mt-1">{formError.DateToBeVisited}</div>}
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
                                                        {formError.DateToBeVisited && <div className="text-danger mt-1">{formError.DateToBeVisited}</div>}
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
                                                        {formError.callLog && <div className="text-danger mt-1">{formError.callLog}</div>}
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
                                                                        <span className="badge bg-label-primary mb-2">
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
                                <div className="card col-md-5 pt-2 pb-2" style={{ minWidth: 495 }}>
                                    <h4>Leads</h4>
                                    {leadsData.length > 0 ? (
                                        <DataTable
                                            pagination={true}
                                            columns={columns}
                                            data={leadsData}
                                            customStyles={customStyles}
                                        />
                                    ) : (
                                        <div className="text-danger fw-semibold mb-4 mx-2">No leads available</div>
                                    )}
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
                                                perspective: "1000px", // Adds depth to the 3D effect
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
                                                {/* Front Side */}
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
                                                    {/* Card Number Overlay */}
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

                                                {/* Back Side */}
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
                                                                        {/* Product Name and Category */}
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
                                <div className="text-danger fw-semibold mb-4 mx-2 text-center">{cardDetails.message}</div>
                            ) : (
                                <div className="text-danger fw-semibold mb-4 mx-2 text-center">Sorry, You haven't purchased any products.</div>
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
                                                className="card"
                                                style={{
                                                    borderRadius: "12px",
                                                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                                    padding: "16px",
                                                    backgroundColor: "#ffffff"
                                                }}
                                            >
                                                <div className="">
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
                                                                    {/* {new Intl.NumberFormat('en-IN', {
                                                                        style: 'currency',
                                                                        currency: 'INR',
                                                                    }).format(selectedProduct.PaidAmount)} */}
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
                                                                                {/* <button className="btn btn-sm bg-success ms-2">
                                                                                    <a
                                                                                        href={`${paUrl}${one.PolicyDocument}`}
                                                                                        className="text-white"
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        download
                                                                                    >
                                                                                        Download Policy
                                                                                    </a>
                                                                                </button> */}
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
                                                    ) : 'UPLOAD'}
                                                </button>
                                            </form>

                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'ohoCardsDistributor' && (
                        <>
                            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
                                <div style={{ marginBottom: '15px' }}>
                                    <label htmlFor="noOfAssigns" style={{ fontWeight: 'bold' }}>Number of Cards to Assign:</label>
                                    <input
                                        type="number"
                                        id="noOfAssigns"
                                        value={noOfAssigns || ''}
                                        onChange={(e) => setNoOfAssigns(parseInt(e.target.value) || null)}
                                        min={1}
                                        style={{ padding: '8px', marginLeft: '10px', borderRadius: '4px', border: '1px solid #ddd', width: '150px' }}

                                    />
                                </div>

                                {cardNumbers.map((card, index) => (
                                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                                        <div style={{ flexGrow: 1 }}>
                                            <Cleave
                                                type="tel"
                                                placeholder="Enter Oho Card series number"
                                                maxLength={14}
                                                onChange={(e) => handleChange(index, e.target.value)}
                                                value={card.cardNumber}
                                                options={{ blocks: [4, 4, 4], delimiter: ' ' }}
                                                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', width: '100%' }}
                                            />
                                            {card.error && (
                                                <div style={{ color: '#d9534f', fontSize: '13px', marginTop: '5px' }}>
                                                    {card.error}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleRemoveCard(index)}
                                            style={{
                                                padding: '10px',
                                                backgroundColor: '#dc3545',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                transition: 'background-color 0.3s',
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}

                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '10px' }}>
                                    <button
                                        onClick={handleAddCard}
                                        style={{
                                            padding: '10px 20px',
                                            backgroundColor: '#007bff',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.3s',
                                        }}
                                    >
                                        + Add Cards
                                    </button>

                                    <button
                                        onClick={handleAdd}
                                        style={{
                                            padding: '10px 20px',
                                            backgroundColor: '#28a745',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.3s',
                                        }}
                                        onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
                                        onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
                                    >
                                        Assign Cards
                                    </button>
                                </div>

                                {cardsNumberError && (
                                    <div style={{ color: '#d9534f', fontSize: '13px', marginTop: '5px' }}>
                                        {cardsNumberError}
                                    </div>
                                )}
                            </div>

                            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                                <Alert onClose={handleSnackbarClose} severity="success">
                                    {snackbarMessage}
                                </Alert>
                            </Snackbar>

                            <h2 style={CardcustomStyles.header}>Distributor Cards</h2>

                            {loading ? (
                                <div style={CardcustomStyles.loadingContainer}>
                                    <CircularProgress />
                                </div>
                            ) : distributorCards.length === 0 ? (
                                <div style={CardcustomStyles.errorContainer}>
                                    <p style={CardcustomStyles.errorText}>No distributor cards found.</p>
                                </div>
                            ) : (
                                <div style={CardcustomStyles.tableContainer}>
                                    <table style={CardcustomStyles.table}>
                                        <thead>
                                            <tr>
                                                <th style={CardcustomStyles.th}>CARD ID</th>
                                                <th style={CardcustomStyles.th}>CARD NUMBER</th>
                                                <th style={CardcustomStyles.th}>ASSIGNED DATE</th>
                                                <th style={CardcustomStyles.th}>CARD SOLD</th>
                                                <th style={CardcustomStyles.th}>SOLD DATE</th>
                                                <th style={CardcustomStyles.th}>User Name</th>
                                                <th style={CardcustomStyles.th}>Distributor Name</th>
                                                <th style={CardcustomStyles.th}>Sold TO</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {distributorCards.map((distributorCard, index) => (
                                                <tr key={index}>
                                                    <td style={CardcustomStyles.td}>{distributorCard.OHOCardsId}</td>
                                                    <td style={CardcustomStyles.td}>{distributorCard.OHOCardNumber}</td>
                                                    <td style={CardcustomStyles.td}>
                                                        {distributorCard.AssignedTOMemberDate ? formatDate1(distributorCard.AssignedTOMemberDate) : null}
                                                    </td>
                                                    <td style={CardcustomStyles.td}>
                                                        <span
                                                            style={{
                                                                padding: '5px 10px',
                                                                borderRadius: '5px',
                                                                backgroundColor: distributorCard.IsCardSold ? 'green' : 'red',
                                                                color: 'white',
                                                                fontWeight: 'bold',
                                                            }}
                                                        >
                                                            {distributorCard.IsCardSold ? 'Sold' : 'Not Sold'}
                                                        </span>
                                                    </td>
                                                    <td style={CardcustomStyles.td}>
                                                        {distributorCard.CardSoldDate ? formatDate1(distributorCard.CardSoldDate) : null}
                                                    </td>
                                                    <td style={CardcustomStyles.td}>{distributorCard.UserName}</td>
                                                    <td style={CardcustomStyles.td}>{distributorCard.DistributorName}</td>
                                                    <td style={CardcustomStyles.td}>{distributorCard.SoldTo}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'availableProducts' && (
                        <>
                            {purchaseProduct ? (
                                <>
                                    {/* OHO Card Number Input Card */}
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
                                                        <p className="ms-1"><i className="fa-solid fa-indian-rupee-sign" style={{ color: '#349bc7' }}></i> {product.InsurancePremiums[0].TotalAmount}</p>
                                                    </div>
                                                    <button className="btn btn-primary align-self-end" onClick={() => setPurchaseProduct(product)}>Purchase</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <h5 className="text-danger fw-semibold text-center">No Products Available</h5>
                                    </div>
                                )
                            )}

                        </>
                    )}

                </>
            </BoxWrapper>

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
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <Alert onClose={handleSnackbarClose} severity="success">
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </TableContainer>
        </>
    );
}