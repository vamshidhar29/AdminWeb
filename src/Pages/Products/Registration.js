import React, { useEffect, useState } from "react";
import "cleave.js/dist/addons/cleave-phone.in";
import { useNavigate, useLocation } from "react-router-dom";
import {
  fetchData,
  fetchUpdateData,
  uploadImage,
  fetchDeleteData,
  fetchAllData,
} from "../../helpers/externapi";
import ReactQuill from "react-quill";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { MultiSelect } from "react-multi-select-component";

export default function Registration() {
  const location = useLocation();
  const profileFromLocation = location.state ? location.state.profile : null;
  const otherChargesFromLocation = location.state
    ? location.state.otherCharges
    : null;
  const [isAddForm, setIsAddForm] = useState(false);
  const navigate = useNavigate();
  const [formError, setFormError] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [products, setProducts] = useState();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const initialFormData = {
    productFormData: {
      ProductName: "",
      Image: "",
      LongDescription: "",
      ShortDescription: "",
      MaximumAdult: "",
      MaximumChild: "",
      ServiceProvider: "",
      MinimumAge: "",
      MaximumAge: "",
      ChildrenAge: "",
      WelcomeEmail: "",
      KeyFeatures: "",
      IsDefault: false,
      IsFree: false,
      IsActive: false,
      IsNomineeRequired: false,
      EndorseEmail: "",
      ProductCategoryId: "",
      SumAssured: "",
      IsCombo: false,
      IsCorporate: false,
      SaleAmount: 0,
      MaximumMembers: "",
      HospitalCoupons: null
    },
    insurancePremiumFormData: {
      MinimumAge: "",
      MaximumAge: "",
      BasePremium: "",
      GST: "",
      TotalAmount: "",
    },
    otherChargesFormData: {
      LabelName: "",
      Value: "",
      IsFixed: "",
      CreatedBy: "",
    },
  };
  const [formData, setFormData] = useState([initialFormData]);
  const [rows, setRows] = useState([
    {
      MinimumAge: "",
      MaximumAge: "",
      BasePremium: "",
      GST: "",
      TotalAmount: "",

    },
  ]);
  const [offersRows, setOffersRows] = useState([
    { MemberTypeId: "", OfferAmount: "", OfferPercentage: "", TotalAmount: "" },
  ]);
  const [additionalRows, setAdditionalRows] = useState([
    { LabelName: "", Value: "", IsFixed: true, CreatedBy: "" },
  ]);
  const [allProducts, setAllProducts] = useState();
  const [dependentRelationships, setDependentsRealtioships] = useState();
  const [noimeesRelationships, setNomineesRelationships] = useState();
  const [prodNames, setProdNames] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedDependentsRelationships, setSelectedDependentsRelatioships] =
    useState([]);
  const [selectedNomineesRelationships, setSelectedNomineesRelatioships] =
    useState([]);
  const [memberTypes, setMemberTypes] = useState([]);
  const [offersFormError, setOffersFormError] = useState("");

  let UserId = localStorage.getItem("UserId");

  const quillModules = {
    toolbar: [
      ["bold", "italic", "underline"], 
      [{ list: "ordered" }, { list: "bullet" }], 
      ["link", "image"], // Attachment options (link and image)
      // Attachment options (link and image)
      [{ color: [] }],
    ],
  };

  // You'll also need to add custom CSS to ensure the toolbar is always visible
  // Add this to your CSS file:

  const customStyles = `
  .ql-toolbar {
    opacity: 1 !important;
    visibility: visible !important;
    display: flex !important;
    flex-wrap: wrap !important;
    border-bottom: 1px solid #e3e6f0 !important;
    padding: 8px !important;
    background-color: #f8f9fc !important;
  }
  
  .ql-formats {
    display: inline-flex !important;
    margin-right: 15px !important;
    margin-bottom: 5px !important;
  }
  
  .ql-editor {
    min-height: 200px !important;
  }
  `;

  const quillFormats = [
    "bold",
    "italic",
    "underline",
    "list",
    "bullet",
    "link",
    "image",
    "color",
  ];
  

  useEffect(() => {
   
    const style = document.createElement("style");

    style.innerHTML = `
      /* Force all toolbar buttons to be visible */
      .ql-toolbar .ql-formats button,
      .ql-toolbar .ql-formats button svg,
      .ql-toolbar .ql-formats .ql-picker {
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
      }
      
      /* Style the toolbar to be more visible */
      .ql-toolbar {
        background-color: #f8f9fc !important;
       
        border-bottom: none !important;
        border-top-left-radius: 4px !important;
        border-top-right-radius: 4px !important;
        padding: 8px !important;
      }
      
      /* Make sure all toolbar buttons display properly */
      .ql-toolbar button {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 28px !important;
        height: 28px !important;
      }
      
      /* Ensure dropdown menus are visible */
      .ql-toolbar .ql-picker-label {
        visibility: visible !important;
        opacity: 1 !important;
      }
      
      /* Give editor more height */
      .ql-editor {
        min-height: 150px !important;
      }
      
      /* Force SVG icons to be visible */
      .ql-toolbar button svg,
      .ql-toolbar button svg path,
      .ql-toolbar .ql-stroke {
        visibility: visible !important;
        opacity: 1 !important;
        stroke: currentColor !important;
      }
      
      /* Make the toolbar buttons more visible */
      .ql-formats {
        display: inline-flex !important;
        margin-right: 10px !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (style && document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);
  const addRow = (event) => {
    event.preventDefault();
    if (rows.length < 20) {
      const newRow = {
        SLNo: rows.length + 1,
        MinimumAge: "",
        MaximumAge: "",
        BasePremium: "",
        GST: "",
        TotalAmount: "",
      };
      setRows([...rows, newRow]);
    } else {
      alert("Maximum limit of 20 rows reached.");
    }
  };

  const addOffersRow = (event) => {
    event.preventDefault();
    if (offersRows.length < 20) {
      const newRow = {
        SLNo: offersRows.length + 1,
        MemberTypeId: "",
        OfferAmount: "",
        OfferPercentage: "",
        TotalAmount: rows[0].TotalAmount,
      };
      setOffersRows([...offersRows, newRow]);
    } else {
      alert("Maximum limit of 20 rows reached.");
    }
  };

  const addAdditionalRow = (event) => {
    event.preventDefault();
    if (additionalRows.length < 20) {
      const newRow = {
        SLNo: additionalRows.length + 1,
        "Inflated Rate": "",
        "Tax %": "",
        "Other Charges": "",
        "Total Amount": "",
      };
      setAdditionalRows([...additionalRows, newRow]);
    } else {
      alert("Maximum limit of 20 rows reached.");
    }
  };

  const deleteRow = async (index) => {
    const rowToDelete = rows[index];
    if (index > 0) {
      if (rowToDelete.InsurancePremiumId) {
        try {
          const deleteResponse = await fetchDeleteData(
            `InsurancePremium/delete/${rowToDelete.InsurancePremiumId}`
          );

          if (!deleteResponse) {
            throw new Error(
              `Failed to delete insurance premium with ID: ${rowToDelete.InsurancePremiumId}`
            );
          }

          const updatedRows = rows.filter((row, i) => i !== index);
          setRows(updatedRows.map((row, i) => ({ ...row, SLNo: i + 1 })));
        } catch (error) {
          console.error("Error deleting row:", error.message);
          alert("Failed to delete the row, please try again.");
        }
      } else {
        const updatedRows = rows.filter((row, i) => i !== index);
        setRows(updatedRows.map((row, i) => ({ ...row, SLNo: i + 1 })));
      }
    }
  };

  useEffect(() => {
    const getDependentsRelationships = async () => {
      try {
        const response = await fetchAllData(
          `ProductDependents/GetByProductId/${profileFromLocation[0].ProductsId}`
        );

        const formattedDependents = response.map((dependent) => ({
          label: dependent.RelationshipType,
          value: dependent.RelationshipTypesId,
        }));

        setSelectedDependentsRelatioships(formattedDependents);
      } catch (error) {
        console.error("Error fetching hospital services:", error);
      }
    };

    const getNomineesRelationships = async () => {
      try {
        const response = await fetchAllData(
          `ProductNominee/GetByProductId/${profileFromLocation[0].ProductsId}`
        );

        const formattedDependents = response.map((dependent) => ({
          label: dependent.RelationshipType,
          value: dependent.RelationshipTypesId,
        }));

        setSelectedNomineesRelatioships(formattedDependents);
      } catch (error) {
        console.error("Error fetching hospital services:", error);
      }
    };

    getDependentsRelationships();
    getNomineesRelationships();
  }, []);

  const deleteOffersRow = async (index) => {
    const rowToDelete = offersRows[index];
    if (rowToDelete.InsurancePremiumId) {
      try {
        const deleteResponse = await fetchDeleteData(
          `InsurancePremium/delete/${rowToDelete.InsurancePremiumId}`
        );

        if (!deleteResponse) {
          throw new Error(
            `Failed to delete insurance premium with ID: ${rowToDelete.InsurancePremiumId}`
          );
        }

        const updatedRows = offersRows.filter((row, i) => i !== index);
        setOffersRows(updatedRows.map((row, i) => ({ ...row, SLNo: i + 1 })));
      } catch (error) {
        console.error("Error deleting row:", error.message);
        alert("Failed to delete the row, please try again.");
      }
    } else {
      const updatedRows = offersRows.filter((row, i) => i !== index);
      setOffersRows(updatedRows.map((row, i) => ({ ...row, SLNo: i + 1 })));
    }
  };

  const deleteAdditionalRow = (index) => {
    const updatedRows = additionalRows.filter((row, i) => i !== index);
    const renumberedRows = updatedRows.map((row, i) => ({
      ...row,
      SLNo: i + 1,
    }));
    setAdditionalRows(renumberedRows);
  };

  const handleAdditionalInputChange = (index, fieldName, value) => {
    let newValue = value;

    if (fieldName === "LabelName") {
      newValue = value.toString();
    } else {
      if (newValue === "" || isNaN(newValue)) {
        newValue = "";
      }
    }
    const updatedRows = [...additionalRows];
    updatedRows[index][fieldName] = newValue;

    const inflatedRate = parseFloat(updatedRows[index]["Inflated Rate"]) || 0;
    const taxPercentage = parseFloat(updatedRows[index]["Tax %"]) || 0;
    const otherCharges = parseFloat(updatedRows[index]["Other Charges"]) || 0;

    if (!isNaN(inflatedRate) && !isNaN(taxPercentage) && !isNaN(otherCharges)) {
      const totalAmount =
        inflatedRate + inflatedRate * (taxPercentage / 100) + otherCharges;
      updatedRows[index]["Total Amount"] = totalAmount.toFixed(2);
    } else {
      updatedRows[index]["Total Amount"] = "0";
    }

    setAdditionalRows(updatedRows);

    calculateTotalAmount();
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleInputChange = (index, fieldName, value) => {
    let newValue = value;
    let totalAmount;

    if (fieldName === "BasePremium") {
      if (/^\d*\.?\d*$/.test(value)) {
        newValue = value;
      } else {
        return;
      }
    } else if (fieldName === "MinimumAge" || fieldName === "MaximumAge") {
      if (value > 99) {
        return;
      } else {
        newValue = value;
      }
      
    } else if (fieldName === "GST") {
      if (value > 99) {
        return;
      } else {
        newValue = value;
      }
    }
      let updatedRows = [...rows];
    updatedRows[index][fieldName] = newValue;
  
    let basePremium = parseFloat(updatedRows[index]["BasePremium"]) || 0;
    const gst = parseFloat(updatedRows[index]["GST"]) || 0;

    /*if (!isNaN(basePremium) && !isNaN(gst))*/
    if (fieldName === "GST") {
      totalAmount = parseInt(updatedRows[index]["TotalAmount"]) || 0;
      if (totalAmount > 0) {
        basePremium = (totalAmount * 100) / (100 + gst);
        updatedRows[index]["BasePremium"] = basePremium.toFixed(2);
      } else if (basePremium > 0) {
        const gstAmount = (basePremium * gst) / 100;
        totalAmount = basePremium + gstAmount;
        updatedRows[index]["TotalAmount"] = parseInt(totalAmount);
      }
    } else if (fieldName === "BasePremium") {
      if (basePremium > 0) {
        const gstAmount = (basePremium * gst) / 100;
        totalAmount = basePremium + gstAmount;
        updatedRows[index]["TotalAmount"] = parseInt(totalAmount);
      } else {
        updatedRows[index]["TotalAmount"] = 0;
      }
    } else if (fieldName === "TotalAmount") {
      totalAmount = parseInt(newValue) || 0;
      if (totalAmount > 0) {
        basePremium = (totalAmount * 100) / (100 + gst);
        updatedRows[index]["BasePremium"] = basePremium.toFixed(2);
      } else {
        updatedRows[index]["BasePremium"] = 0;
      }
    }

    if (additionalRows.length > 0 && additionalRows[0].Value) {
      totalAmount = parseInt(updatedRows[index]["TotalAmount"]) || 0;
      additionalRows.map((row) => {
        totalAmount += parseFloat(row.Value);
      });
      updatedRows[index]["TotalAmount"] = parseInt(totalAmount);
    }

    setRows(updatedRows);

    if (offersRows.length > 0) {
      offersRows.map((row) => (row.TotalAmount = parseInt(totalAmount)));
    }

    /*calculateTotalAmount();*/

    setFormData((preVal) => ({
      ...preVal,
      SaleAmount: totalAmount,
    }));
  };
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = mediaQueryStyle;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style); // Cleanup on component unmount
    };
  }, []);
  // const handleOffersChange = (index, fieldName, value) => {
  //     let updatedRows = [...offersRows];
  //     updatedRows[index][fieldName] = value;

  //     let totalAmount = parseInt(rows[0].TotalAmount);

  //     if (fieldName === 'OfferAmount') {
  //         if (parseInt(value) > 0 && totalAmount > 0 && parseInt(value) < totalAmount) {
  //             let percentage = 100 - (value / totalAmount * 100);

  //             updatedRows[index]['OfferPercentage'] = percentage.toFixed(2);

  //             setOffersFormError('');
  //         } else {
  //             setOffersFormError('Offer Amount must be less than Total Amount');
  //         }
  //     } else if (fieldName === 'OfferPercentage') {
  //         if (parseInt(value) > 0 && totalAmount > 0 && parseInt(value) < 100) {
  //             let offerAmount = totalAmount - (value / 100 * totalAmount);

  //             updatedRows[index]['OfferAmount'] = offerAmount.toFixed(2)

  //             setOffersFormError('');
  //         } else {
  //             if (!totalAmount || totalAmount <= 0) {
  //                 setOffersFormError('Please Enter Total Amount');
  //             } else {
  //                 setOffersFormError('Offer Percentage must ranges between 0 to 100');
  //             }

  //         }
  //     }

  //     setOffersRows(updatedRows);
  // };

  const handleOffersChange = (index, fieldName, value) => {
    let updatedRows = [...offersRows];
    updatedRows[index][fieldName] = value;
    let totalAmount = Number(rows[0]?.TotalAmount) || 0; 

    if (value === "") {
     
      updatedRows[index][fieldName] = "";
      if (fieldName === "OfferAmount") {
        updatedRows[index]["OfferPercentage"] = "";
      } else if (fieldName === "OfferPercentage") {
        updatedRows[index]["OfferAmount"] = "";
      }
      setOffersRows(updatedRows);
      setOffersFormError("");
      return;
    }

    let inputValue = Number(value) || 0; 
    if (fieldName === "OfferAmount") {
      if (inputValue > 0 && totalAmount > 0 && inputValue < totalAmount) {
        let percentage = (inputValue / totalAmount) * 100; 
        updatedRows[index]["OfferAmount"] = inputValue;
        updatedRows[index]["OfferPercentage"] = percentage.toFixed(2);
        setOffersFormError("");
      } else {
        setOffersFormError(
          "Offer Amount must be greater than 0 and less than Total Amount"
        );
        return;
      }
    } else if (fieldName === "OfferPercentage") {
      if (inputValue > 0 && inputValue <= 100 && totalAmount > 0) {
        let offerAmount = (inputValue / 100) * totalAmount;
        updatedRows[index]["OfferAmount"] = offerAmount.toFixed(2);
        updatedRows[index]["OfferPercentage"] = inputValue;
        setOffersFormError("");
      } else {
        setOffersFormError(
          totalAmount <= 0
            ? "Please enter a valid Total Amount"
            : "Offer Percentage must be between 0 and 100"
        );
        return;
      }
    }

    setOffersRows([...updatedRows]);
  };

  useEffect(() => {
    calculateTotalAmount();
  }, [additionalRows]);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await fetchData("Products/all", { skip: 0, take: 0 });

        setAllProducts(response);
        let getIndividualPrd = [];

        response &&
          response.length > 0 &&
          response.map((each) => {
            if (!each.IsCombo) {
              getIndividualPrd = [...getIndividualPrd, each];
            }
          });

        let prods = [];
        {
          getIndividualPrd &&
            getIndividualPrd.length > 0 &&
            getIndividualPrd.map((data) => {
              prods = [
                ...prods,
                { label: data.ProductName, value: data.ProductsId },
              ];
            });
        }

        setProdNames(prods);
      } catch (e) {
        console.error("Error fetching products: ", e);
      }
    };

    getProducts();
  }, []);

  useEffect(() => {
    const getRelationships = async () => {
      try {
        const response = await fetchData("RelationshipTypes/all", {
          skip: 0,
          take: 0,
        });

        const relationshipsArray = response.map((item) => ({
          label: item.RelationshipType,
          value: item.RelationshipTypesId,
        }));

        setDependentsRealtioships(relationshipsArray);
        setNomineesRelationships(relationshipsArray);
      } catch (e) {
        console.error("Error fetching products: ", e);
      }
    };

    getRelationships();
  }, []);

  const calculateTotalAmount = () => {
    let finalTotalAmount = 0;
    let fixedTotal = 0;
    let variableTotal = 0;
    additionalRows.forEach((row) => {
      const amount = parseFloat(row.Value) || 0;
      if (!isNaN(amount)) {
        if (row.IsFixed) {
          fixedTotal += amount;
        } else {
          variableTotal += amount;
        }
      }
    });

    rows.forEach((row, index) => {
      const basePremium = parseFloat(row.BasePremium) || 0;
      const variableAmount =
        variableTotal > 0 ? (basePremium / variableTotal) * 2 : 0;
      const totalBeforeGST = basePremium + fixedTotal + variableAmount;
      const gst = parseFloat(row.GST) || 0;
      const gstAmount = (totalBeforeGST * gst) / 100;
      const totalAmount = totalBeforeGST + gstAmount;
      rows[index].TotalAmount = totalAmount.toFixed(2);
      if (!isNaN(totalAmount)) {
        finalTotalAmount += totalAmount;
      }
    });

    return finalTotalAmount;
  };

  useEffect(() => {
    if (profileFromLocation) {
      setFormData({
        ProductName: profileFromLocation[0].ProductName,
        Image: profileFromLocation[0].Image,
        LongDescription: profileFromLocation[0].LongDescription,
        ShortDescription: profileFromLocation[0].ShortDescription,
        MaximumAdult: profileFromLocation[0].MaximumAdult,
        MaximumChild: profileFromLocation[0].MaximumChild,
        ServiceProvider: profileFromLocation[0].ServiceProvider,
        MinimumAge: profileFromLocation[0].MinimumAge,
        MaximumAge: profileFromLocation[0].MaximumAge,
        ChildrenAge: profileFromLocation[0].ChildrenAge,
        WelcomeEmail: profileFromLocation[0].WelcomeEmail,
        KeyFeatures: profileFromLocation[0].KeyFeatures,
        IsDefault: profileFromLocation[0].IsDefault,
        IsFree: profileFromLocation[0].IsFree,
        IsActive: profileFromLocation[0].IsActive,
        IsNomineeRequired: profileFromLocation[0].IsNomineeRequired,
        EndorseEmail: profileFromLocation[0].EndorseEmail,
        ProductCategoryId: profileFromLocation[0].ProductCategoryId,
        SumAssured: profileFromLocation[0].SumAssured,
        ProductsId: profileFromLocation[0].ProductsId,
        SaleAmount: profileFromLocation[0].SaleAmount,
        IsCombo: profileFromLocation[0].IsCombo,
        MaximumMembers: profileFromLocation[0].MaximumMembers,
        IsCorporate: profileFromLocation[0].IsCorporate,
        HospitalCoupons: profileFromLocation[0].HospitalCoupons,
      });

      if (profileFromLocation[0].IsCombo) {
        const getSelectedProducts = async () => {
          const response = await fetchAllData(
            `ComboProducts/FetchComboProducts/${profileFromLocation[0].ProductsId}`
          );

          let selectedList = [];
          response &&
            response.length > 0 &&
            response.map(
              (prod) =>
              (selectedList = [
                ...selectedList,
                { label: prod.ProductName, value: prod.ProductsId },
              ])
            );

          setSelectedProducts(selectedList);
        };

        getSelectedProducts();
      }

      const insuranceRows = profileFromLocation[0].InsurancePremiums.map(
        (insurance, index) => ({
          SLNo: index + 1,
          MinimumAge: insurance.MinimumAge,
          MaximumAge: insurance.MaximumAge,
          BasePremium: insurance.BasePremium,
          GST: insurance.GST,
          TotalAmount: insurance.TotalAmount,
          InsurancePremiumId: insurance.InsurancePremiumId,
        })
      );
      setRows(insuranceRows);
      const otherChargesRows = otherChargesFromLocation.map(
        (charges, index) => ({
          SLNo: index + 1,
          LabelName: charges.LabelName,
          Value: charges.Value,
          IsFixed: charges.IsFixed,
          CreatedBy: charges.CreatedBy,
          OtherChargesId: charges.OtherChargesId,
        })
      );
      setAdditionalRows(otherChargesRows);

      const offersRows = profileFromLocation[0].ProductsOffers.map(
        (offers, index) => ({
          SLNo: index + 1,
          MemberTypeId: offers.MemberTypeId,
          OfferAmount: offers.OfferAmount,
          OfferPercentage: offers.OfferPercentage,
          TotalAmount: profileFromLocation[0].InsurancePremiums[0].TotalAmount,
          ProductsOffersId: offers.ProductsOffersId,
        })
      );
      setOffersRows(offersRows);
    } else {
      setIsAddForm(true);
      setFormData(initialFormData.productFormData);
      setRows([initialFormData.insurancePremiumFormData]);
      setAdditionalRows([initialFormData.otherChargesFormData]);
      setOffersRows([]);
    }
  }, [profileFromLocation]);

  const validateForm = () => {
    let err = {};

    if (!formData.ProductName || formData.ProductName.trim() === "") {
      err.ProductName = "Please Enter Product Name";
    }
    if (!formData.ShortDescription || formData.ShortDescription.trim() === "") {
      err.ShortDescription = "Please Enter Short Description";
    }
    if (!formData.ServiceProvider || formData.ServiceProvider.trim() === "") {
      err.ServiceProvider = "Please Enter Service Provider";
    }

    if (
      formData.MaximumAdult === "string" &&
      formData.MaximumAdult.trim() === ""
    ) {
      err.MaximumAdult = "Please Enter Maximum Adult";
    } else {
      if (formData.MaximumAdult.length === 0) {
        err.MaximumAdult = "Please Enter Maximum Adult";
      }
    }

    if (
      formData.MaximumMembers === "string" &&
      formData.MaximumMembers.trim() === ""
    ) {
      err.MaximumMembers = "Please Enter Maximum Members";
    } else {
      if (formData.MaximumMembers.length === 0) {
        err.MaximumMembers = "Please Enter Maximum Members";
      }
    }

    if (formData.IsCombo) {
      if (selectedProducts.length <= 1) {
        err.SelectedProducts = "Please Select atleast 2 products";
      }
    }

    if (profileFromLocation) {
      if (!formData.MinimumAge || formData.MinimumAge === "") {
        err.MinimumAge = "Please Enter Minimum Age";
      } else if (
        isNaN(formData.MinimumAge) ||
        parseInt(formData.MinimumAge) < 17
      ) {
        err.MinimumAge = "Minimum Age Must be 18 Atleast";
      }
    } else {
      if (!formData.MinimumAge || formData.MinimumAge.trim() === "") {
        err.MinimumAge = "Please Enter Minimum Age";
      } else if (
        isNaN(formData.MinimumAge) ||
        parseInt(formData.MinimumAge) < 17
      ) {
        err.MinimumAge = "Minimum Age Must be 18 Atleast";
      }
    }

    if (profileFromLocation) {
      if (!formData.MaximumAge || formData.MaximumAge === "") {
        err.MaximumAge = "Please Enter Maximum Age";
      } else if (
        isNaN(formData.MaximumAge) ||
        parseInt(formData.MaximumAge) > 80
      ) {
        err.MaximumAge = "Maximum Age Must be less than 80";
      }
    } else {
      if (!formData.MaximumAge || formData.MaximumAge.trim() === "") {
        err.MaximumAge = "Please Enter Maximum Age";
      } else if (
        isNaN(formData.MaximumAge) ||
        parseInt(formData.MaximumAge) > 80
      ) {
        err.MaximumAge = "Maximum Age Must be less than 80";
      }
    }
    if (formData.MinimumAge && formData.MaximumAge) {
      const minAge = parseInt(formData.MinimumAge, 18);
      const maxAge = parseInt(formData.MaximumAge, 80);
      if (!isNaN(minAge) && !isNaN(maxAge) && maxAge <= minAge) {
        err.MaximumAge = "Maximum Age is Greater Than The Minimum age";
      }
    }

    if (!profileFromLocation) {
      if (
        !formData.ProductCategoryId ||
        typeof formData.ProductCategoryId !== "string" ||
        formData.ProductCategoryId.trim() === ""
      ) {
        err.ProductCategoryId = "Please Select a Product Category";
      }
    } else {
      if (formData.ProductCategoryId.length === 0) {
        err.ProductCategoryId = "Please Select a Product Category";
      }
    }

    if (formData.HospitalCoupons) {
      const hospitalCoupons = parseInt(formData.HospitalCoupons, 10);

      if (
        isNaN(hospitalCoupons) ||
        hospitalCoupons < 0 ||
        !Number.isInteger(hospitalCoupons) ||
        hospitalCoupons > 20
      ) {
        err.HospitalCoupons = "Invalid Hospital Coupons";
      }
    }

    if (
      rows.length === 0 ||
      rows.some(
        (row) =>
          !row.MinimumAge ||
          !row.MaximumAge ||
          !row.BasePremium ||
          !row.GST ||
          !row.TotalAmount
      )
    ) {
      err.InsurancePremium = "At least one insurance premium row is required";
    }

    if (
      offersRows.length >= 1 &&
      offersRows.some(
        (row) => !row.MemberTypeId || !row.OfferPercentage || !row.OfferAmount
      )
    ) {
      err.Offers = "Fill all the data or delete the row";
    }

    setFormError({ ...err });
    const isValid = Object.keys(err).length === 0;
    return isValid;
  };

  const onChangeHandler = (e) => {
    const { name, type, checked, value, files, id } = e.target;
    if (
      [
        "MinimumAge",
        "MaximumAge",
        "MaximumAdult",
        "MaximumChild",
        "ChildrenAge",
        "MaximumMembers",
        "HospitalCoupons"
      ].includes(name) &&
      !/^\d*$/.test(value)
    ) {
      return;
    }
    setFormError((prevError) => ({
      ...prevError,
      [name]: "",
    }));

    if (type === "radio") {
      setFormData((prevState) => ({
        ...prevState,
        [name]: id.includes("Yes") ? true : false,
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    if (files && files.length > 0) {
      const file = files[0];
      setSelectedImage(file);
    }
  };

  const onQuillChangeHandler = (field) => (value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: value,
    }));
  };

  useEffect(() => {
    const getProductCategory = async () => {
      const productsData = await fetchData("ProductCategory/all", {
        skip: 0,
        take: 0,
      });
      setProducts(productsData);
    };

    const getMemberTypes = async () => {
      const memberTypesReponse = await fetchData("MemberTypes/all", {
        skip: 0,
        take: 0,
      });
      setMemberTypes(memberTypesReponse);
    };

    getProductCategory();
    getMemberTypes();
  }, []);

  const handleFileSelection = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);
  };

  const handleFileUpload = async (ProductsId) => {
    try {
      const formData = new FormData();
      formData.append("ProductsId", ProductsId);
      formData.append("Image", selectedImage);

      const response = await uploadImage("Products/upload", formData);

      return response;
    } catch (error) {
      console.error("Error uploading files:", error);
      throw error;
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const isValid = validateForm();

    if (isValid) {
      try {
        let ProductsData;
        let PProductsId;

        const productPayload = {
          productname: formData.ProductName,
          image: formData.Image,
          longdescription: formData.LongDescription,
          shortdescription: formData.ShortDescription,
          serviceprovider: formData.ServiceProvider,
          maximumAdult: formData.MaximumAdult || 0,
          maximumChild: formData.MaximumChild || 0,
          minimumAge: formData.MinimumAge,
          maximumAge: formData.MaximumAge,
          childrenAge: formData.ChildrenAge || 0,
          isNomineeRequired: formData.IsNomineeRequired,
          WelcomeEmail: formData.WelcomeEmail,
          KeyFeatures: formData.KeyFeatures,
          isDefault: formData.IsDefault,
          isActive: formData.IsActive,
          isFree: formData.IsFree,
          endorseEmail: formData.EndorseEmail,
          ProductCategoryId: formData.ProductCategoryId,
          saleAmount: formData.SaleAmount,
          isCombo: formData.IsCombo,
          maximumMembers: formData.MaximumMembers,
          IsCorporate: formData.IsCorporate,
          HospitalCoupons: formData.HospitalCoupons

        };

        if (formData.SumAssured) {
          productPayload.sumAssured = formData.SumAssured;
        }

        if (isAddForm) {
          ProductsData = await fetchData("Products/add", productPayload);

          if (formData.IsCombo && ProductsData.status) {
            let payload = [];
            {
              selectedProducts.map((prod) => {
                payload = [
                  ...payload,
                  {
                    ComboId: ProductsData.returnData.productsId,
                    ProductsId: prod.value,
                  },
                ];
              });
            }
            await fetchData("ComboProducts/seed", payload);
          }
          setSnackbarMessage("Product Added Successfully");
        } else {
          productPayload.productsId = formData.ProductsId;
          ProductsData = await fetchUpdateData(
            "Products/update",
            productPayload
          );

          if (formData.IsCombo && ProductsData) {
            let payload = [];
            {
              selectedProducts.map((prod) => {
                payload = [
                  ...payload,
                  { ComboId: ProductsData.productsId, ProductsId: prod.value },
                ];
              });
            }
            await fetchData("ComboProducts/updateComboProducts", payload);
          }
          setSnackbarMessage("Product updated Successfully");
        }

        if (ProductsData.message === "This Product already exists") {
          setFormError((prevState) => ({
            ...prevState,
            ProductName: "This Product already exists",
          }));
          return;
        }

        if (!profileFromLocation) {
          PProductsId = ProductsData.returnData.productsId;
        } else {
          PProductsId = ProductsData.productsId;
        }

        const insurancePremiumArray = rows.map((row) => ({
          InsurancePremiumId: row.InsurancePremiumId,
          MinimumAge: row.MinimumAge,
          MaximumAge: row.MaximumAge,
          BasePremium: row.BasePremium,
          GST: row.GST,
          productsId: PProductsId,
          TotalAmount: parseFloat(row.TotalAmount),
        }));

        const otherChargesArray = additionalRows.map((row) => ({
          OtherChargesId: row.OtherChargesId,
          productsId: PProductsId,
          labelName: row.LabelName,
          value: isNaN(parseFloat(row.Value))
            ? row.Value
            : parseFloat(row.Value),
          isFixed: row.IsFixed === true,
        }));

        if (offersRows.length > 0) {
          // Check if any row has a `ProductsOffersId` (indicating it's an update)
          const isUpdate = offersRows.some((row) => row.ProductsOffersId);

          if (!isUpdate) {
            // Insert logic
            const offersPayload = offersRows.map((row) => ({
              productsId: PProductsId,
              memberTypeId: row.MemberTypeId,
              offerPercentage: row.OfferPercentage,
              offerAmount: row.OfferAmount,
              userId: UserId,
            }));

            const offersResponse = await fetchData(
              "ProductsOffers/seedToInsert",
              offersPayload
            );
          } else {
            // Update logic
            const offersPayload = offersRows.map((row) => ({
              productsOffersId: row.ProductsOffersId,
              productsId: PProductsId,
              memberTypeId: row.MemberTypeId,
              offerPercentage: row.OfferPercentage,
              offerAmount: row.OfferAmount,
              userId: UserId,
            }));

            const offersResponse = await fetchUpdateData(
              "ProductsOffers/seedToUpdate",
              offersPayload
            );
          }
        }

        const deletedInsurancePremiumIds = rows
          .filter((row) => row.markedForDeletion)
          .map((row) => row.InsurancePremiumId);

        if (deletedInsurancePremiumIds.length > 0) {
          for (const id of deletedInsurancePremiumIds) {
            const deleteResponse = await fetchDeleteData(
              `InsurancePremium/delete/${id}`
            );
            if (!deleteResponse)
              throw new Error(
                `Failed to delete insurance premium with ID: ${id}`
              );
          }
        }

        if (
          insurancePremiumArray.some(
            (item) =>
              item.MinimumAge ||
              item.MaximumAge ||
              item.BasePremium ||
              item.GST ||
              item.InsurancePremiumId
          )
        ) {
          for (const item of insurancePremiumArray) {
            let response;
            if (item.InsurancePremiumId) {
              response = await fetchUpdateData("InsurancePremium/update", item);
            } else {
              response = await fetchData("InsurancePremium/add", item);
            }
            if (!response) throw new Error("Failed to save insurance premium");
          }
        }

        if (otherChargesArray.some((item) => item.labelName || item.value)) {
          for (const item of otherChargesArray) {
            let response;
            if (item.OtherChargesId) {
              response = await fetchUpdateData("OtherCharges/update", item);
            } else {
              response = await fetchData("OtherCharges/add", item);
            }
            if (!response) throw new Error("Failed to save other charges");
          }
        }

        const dependentRelationshipsArray = selectedDependentsRelationships.map(
          (selectedDependentsRelationship) => ({
            ProductsId: PProductsId,
            CreatedBy: UserId,
            RelationshipTypesId: selectedDependentsRelationship.value,
          })
        );

        if (dependentRelationshipsArray.length > 0) {
          const dependentAddResponse = await fetchData(
            "ProductDependents/seed",
            dependentRelationshipsArray
          );
        }

        const nomineeRelationshipsArray = selectedNomineesRelationships.map(
          (selectedNomineeRelationship) => ({
            ProductsId: PProductsId,
            CreatedBy: UserId,
            RelationshipTypesId: selectedNomineeRelationship.value,
          })
        );

        if (nomineeRelationshipsArray.length > 0) {
          const nomineeAddResponse = await fetchData(
            "ProductNominee/seed",
            nomineeRelationshipsArray
          );
        }

        let ProductsId;
        if (
          ProductsData &&
          ProductsData.returnData &&
          ProductsData.returnData.productsId
        ) {
          ProductsId = ProductsData.returnData.productsId;
        } else if (ProductsData && ProductsData.productsId) {
          ProductsId = ProductsData.productsId;
        } else {
          throw new Error("ProductsId is not available.");
        }

        if (!ProductsId) {
          throw new Error("ProductsId is undefined");
        }

        // if (selectedImage) {
        //     await handleFileUpload(ProductsId);
        // }

        setTimeout(() => {
          navigate(`/products/details/${PProductsId}`);
        }, 3000);

        setSnackbarOpen(true);
      } catch (error) {
        console.error("Error in onSubmitHandler:", error.message);
        alert("Failed to save data, please try again.");
      }
    }
  };

  const handleBackToView = () => {
    navigate(`/products/list`);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedImage(null);
    /*clearErrorMessages();*/
  };

  const handleRadioChange = (index, value) => {
    const updatedRows = [...additionalRows];
    updatedRows[index].IsFixed = value === "fixed";
    setAdditionalRows(updatedRows);
  };

  useEffect(() => {
    rows.forEach((row) => {
      const basePremium = parseFloat(row["basePremium"]) || 0;
      const GST = parseFloat(row["gst"]) || 0;
      const gstAmount = (basePremium * GST) / 100;
      const totalAmountWithGST = basePremium + gstAmount;
      const otherChargesForCurrentRow = additionalRows
        .filter((additionalRow) => additionalRow["rowId"] === row["id"])
        .reduce(
          (acc, additionalRow) =>
            acc + parseFloat(additionalRow["Amount"] || 0),
          0
        );
      const rowTotal = totalAmountWithGST + otherChargesForCurrentRow;
      row["totalAmount"] = rowTotal.toFixed(2);
    });
  }, [rows, additionalRows]);

  return (
    <>
      <div>
        <form className="w-full sm:w-auto mx-1" onSubmit={onSubmitHandler}>
          
            <div className="col-sm-12" style={{ zIndex: 1 }}>
              {/* Product Information */}
              <div
                className="card mb-2 border-0 rounded-lg"
                style={{
                  boxShadow: "0 10px 20px rgba(0, 0, 0, 0.08)",
                  transition: "transform 0.3s, box-shadow 0.3s",
                }}
              >
                <div
                  className="card-header d-flex align-items-center py-3 rounded-top"
                  style={{
                    background: "linear-gradient(to right, #1976D2, #0D47A1)",
                    border: "none",
                  }}
                >
                  <i className="bi bi-info-circle-fill me-2 text-white"></i>
                  <span className="fw-bold fs-5 text-white">
                    Product Information
                  </span>
                </div>
                <div className="card-body p-4">
                  <div className="row g-4">
                    {/* Product Name */}
                    <div className="col-md-12">
                      <label className="text-dark fw-semibold small text-uppercase">
                        Product Name <span className="text-danger">*</span>
                      </label>
                      <div className="input-group mt-0">
                        <span
                          className="input-group-text border-end-0"
                          style={{
                            backgroundColor: "#ECEFF1",
                            width: "40px",
                            height: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "4px",
                          }}
                        >
                          <i
                            className="bi bi-tag"
                            style={{ fontSize: "20px" }}
                          ></i>
                        </span>

                        <input
                          type="text"
                          name="ProductName"
                          className="form-control mt-0 py-2 border-start-0"
                          placeholder="Enter product name"
                          maxLength={100}
                          value={formData.ProductName || ""}
                          onChange={onChangeHandler}
                          onFocus={(e) =>
                            (e.currentTarget.style.borderColor = "#007bff")
                          }
                          onBlur={(e) =>
                            (e.currentTarget.style.borderColor = "#dee2e6")
                          }
                          style={{
                            borderRadius: "0 8px 8px 0",
                            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
                            borderColor: "#dee2e6",
                            borderLeft: "none",
                          }}
                        />
                      </div>
                      {formError.ProductName && (
                        <div className="text-danger small mt-1">
                          <i className="bi bi-exclamation-triangle me-1"></i>
                          {formError.ProductName}
                        </div>
                      )}
                    </div>
                    {/* Short Description */}
                    <div className="col-md-6">
                      <label className="text-dark fw-semibold small text-uppercase">
                        Short Description <span className="text-danger">*</span>
                      </label>
                      <div className="input-group mt-0">
                        <span
                          className="input-group-text  border-end-0"
                          style={{
                            backgroundColor: "#ECEFF1",
                            width: "40px",
                            height: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "4px",
                          }}
                        >
                          <i
                            className="bi bi-card-text"
                            style={{ fontSize: "20px" }}
                          ></i>
                        </span>
                        <input
                          type="text"
                          name="ShortDescription"
                          className="form-control mt-0 py-2 border-start-0"
                          placeholder="Enter short description"
                          maxLength={200}
                          value={formData.ShortDescription || ""}
                          onChange={onChangeHandler}
                          onFocus={(e) =>
                            (e.currentTarget.style.borderColor = "#007bff")
                          }
                          onBlur={(e) =>
                            (e.currentTarget.style.borderColor = "#dee2e6")
                          }
                          style={{
                            borderRadius: "0 8px 8px 0",
                            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
                            borderColor: "#dee2e6",
                            borderLeft: "none",
                          }}
                        />
                      </div>
                      {formError.ShortDescription && (
                        <div className="text-danger small mt-1">
                          <i className="bi bi-exclamation-triangle me-1"></i>
                          {formError.ShortDescription}
                        </div>
                      )}
                    </div>
                    {/* Service Provider */}
                    <div className="col-md-6">
                      <label className="text-dark fw-semibold small text-uppercase">
                        Service Provider <span className="text-danger">*</span>
                      </label>
                      <div className="input-group mt-0">
                        <span
                          className="input-group-text border-end-0"
                          style={{
                            backgroundColor: "#ECEFF1",
                            width: "40px",
                            height: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "4px",
                          }}
                        >
                          <i
                            className="bi bi-building"
                            style={{ fontSize: "20px" }}
                          ></i>
                        </span>
                        <input
                          type="text"
                          id="ServiceProvider"
                          name="ServiceProvider"
                          className="form-control mt-0 py-2 border-start-0"
                          placeholder="Enter service provider"
                          value={formData.ServiceProvider || ""}
                          onChange={onChangeHandler}
                          onFocus={(e) =>
                            (e.currentTarget.style.borderColor = "#007bff")
                          }
                          onBlur={(e) =>
                            (e.currentTarget.style.borderColor = "#dee2e6")
                          }
                          style={{
                            borderRadius: "0 8px 8px 0",
                            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
                            borderColor: "#dee2e6",
                            borderLeft: "none",
                          }}
                        />
                      </div>
                      {formError.ServiceProvider && (
                        <div className="text-danger small mt-1">
                          <i className="bi bi-exclamation-triangle me-1"></i>
                          {formError.ServiceProvider}
                        </div>
                      )}
                    </div>
                    {/* Product Category */}
                    <div className="col-md-6">
                      <label className="text-dark fw-semibold small text-uppercase">
                        Product Category <span className="text-danger">*</span>
                      </label>
                      <div className="input-group mt-0">
                        <span
                          className="input-group-text border-end-0"
                          style={{
                            backgroundColor: "#ECEFF1",
                            width: "40px",
                            height: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "4px",
                          }}
                        >
                          <i
                            className="bi bi-grid"
                            style={{ fontSize: "20px" }}
                          ></i>
                        </span>
                        <select
                          name="ProductCategoryId"
                          className="form-select mt-0 py-2 border-start-0"
                          value={formData.ProductCategoryId}
                          onChange={onChangeHandler}
                          onFocus={(e) =>
                            (e.currentTarget.style.borderColor = "#007bff")
                          }
                          onBlur={(e) =>
                            (e.currentTarget.style.borderColor = "#dee2e6")
                          }
                          style={{
                            borderRadius: "0 8px 8px 0",
                            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
                            borderColor: "#dee2e6",
                            borderLeft: "none",
                          }}
                        >
                          <option value="">Select a category</option>
                          {products?.map((option, index) => (
                            <option
                              key={index}
                              value={option.ProductCategoryId}
                            >
                              {option.ProductCategoryName}
                            </option>
                          ))}
                        </select>
                      </div>
                      {formError.ProductCategoryId && (
                        <div className="text-danger small mt-1">
                          <i className="bi bi-exclamation-triangle me-1"></i>
                          {formError.ProductCategoryId}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="text-dark fw-semibold small text-uppercase">
                        <i className="bi bi-currency-dollar me-1"></i>Sum Assured
                      </label>
                      <div className="input-group mt-1"
                      >
                        <span className="input-group-text border-end-0"
                          style={{
                            backgroundColor: "#ECEFF1",
                            width: "40px",
                            height: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "4px",
                          }}
                        >
                          <i className="bi bi-cash"></i>
                        </span>
                        <input
                          type="text"
                          id="SumAssured"
                          name="SumAssured"
                          className="form-control mt-0 py-2 border-start-0"
                          placeholder="Enter sum assured"
                          maxLength={10}
                          value={formData.SumAssured || ""}
                          onChange={onChangeHandler}
                          onFocus={(e) =>
                            (e.currentTarget.style.borderColor = "#007bff")
                          }
                          onBlur={(e) =>
                            (e.currentTarget.style.borderColor = "#dee2e6")
                          }
                          style={{
                            borderRadius: "0 8px 8px 0",
                            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
                            borderColor: "#dee2e6",
                            borderLeft: "none",
                          }}
                        />
                      </div>

                      {formError.SumAssured && (
                        <div className="text-danger small mt-1">
                          <i className="bi bi-exclamation-triangle me-1"></i>
                          {formError.SumAssured}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Radio Button Row */}
                  <div className="row mt-0 g-4">
                    <div className="col-md-6">
                      <div
                        className="p-3 rounded"
                        style={{
                          background: "rgba(176, 179, 182, 0.05)",
                          border: "1px solid rgba(26, 82, 118, 0.2)",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
                          transition: "all 0.3s",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background =
                            "rgba(44, 62, 80, 0.08)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background =
                            "rgba(44, 62, 80, 0.05)";
                        }}
                      >
                        <label className="d-block text-dark fw-semibold small text-uppercase mb-3">
                          <i className="bi bi-box me-2"></i>Is Combo{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <div className="d-flex">
                          <div className="me-4">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="IsCombo"
                                id="IsComboYes"
                                value="true"
                                checked={formData.IsCombo === true}
                                onChange={onChangeHandler}
                                style={{
                                  borderColor: "#1a5276",
                                  width: "18px",
                                  height: "18px",
                                }}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="IsComboYes"
                              >
                                Yes
                              </label>
                            </div>
                          </div>
                          <div>
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="IsCombo"
                                id="IsComboNo"
                                value="false"
                                checked={formData.IsCombo === false}
                                onChange={onChangeHandler}
                                style={{
                                  borderColor: "#1a5276",
                                  width: "18px",
                                  height: "18px",
                                }}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="IsComboNo"
                              >
                                No
                              </label>
                            </div>
                          </div>
                        </div>
                        {formError.IsCombo && (
                          <div className="text-danger small mt-1">
                            <i className="bi bi-exclamation-triangle me-1"></i>
                            {formError.IsCombo}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div
                        className="p-3 rounded"
                        style={{
                          background: "rgba(44, 62, 80, 0.05)",
                          border: "1px solid rgba(26, 82, 118, 0.2)",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
                          transition: "all 0.3s",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background =
                            "rgba(44, 62, 80, 0.08)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background =
                            "rgba(44, 62, 80, 0.05)";
                        }}
                      >
                        <label className="d-block text-dark fw-semibold small text-uppercase mb-3">
                          <i className="bi bi-building-fill me-2"></i>Is
                          Corporate <span className="text-danger">*</span>
                        </label>
                        <div className="d-flex">
                          <div className="me-4">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="IsCorporate"
                                id="IsCorporateYes"
                                value="true"
                                checked={formData.IsCorporate === true}
                                onChange={onChangeHandler}
                                style={{
                                  borderColor: "#1a5276",
                                  width: "18px",
                                  height: "18px",
                                }}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="IsCorporateYes"
                              >
                                Yes
                              </label>
                            </div>
                          </div>
                          <div>
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="IsCorporate"
                                id="IsCorporateNo"
                                value="false"
                                checked={formData.IsCorporate === false}
                                onChange={onChangeHandler}
                                style={{
                                  borderColor: "#1a5276",
                                  width: "18px",
                                  height: "18px",
                                }}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="IsCorporateNo"
                              >
                                No
                              </label>
                            </div>
                          </div>
                        </div>
                        {formError.IsCorporate && (
                          <div className="text-danger small mt-1">
                            <i className="bi bi-exclamation-triangle me-1"></i>
                            {formError.IsCorporate}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Products MultiSelect (conditional) */}
                  {formData.IsCombo && (
                    <div className="mt-3">
                      <div
                        className="p-3 rounded"
                        style={{
                          background: "rgba(44, 62, 80, 0.05)",
                          border: "1px solid rgba(26, 82, 118, 0.2)",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
                          transition: "all 0.3s",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background =
                            "rgba(44, 62, 80, 0.08)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background =
                            "rgba(44, 62, 80, 0.05)";
                        }}
                      >
                        <label className="d-block text-dark fw-semibold small text-uppercase mb-2">
                          <i className="bi bi-boxes me-2"></i>Products{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <div>
                          {allProducts && (
                            <MultiSelect
                              options={prodNames}
                              value={selectedProducts}
                              onChange={setSelectedProducts}
                            />
                          )}
                        </div>
                        {formError.SelectedProducts && (
                          <div className="text-danger small mt-1">
                            <i className="bi bi-exclamation-triangle me-1"></i>
                            {formError.SelectedProducts}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {/* Relationship Selectors */}
                  <div className="row mt-0 g-4">
                    <div className="col-md-6">
                      <div
                        className="p-3 rounded"
                        style={{
                          background: "rgba(44, 62, 80, 0.05)",
                          border: "1px solid rgba(26, 82, 118, 0.2)",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
                          transition: "all 0.3s",
                          position: "relative",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = "rgba(44, 62, 80, 0.08)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = "rgba(44, 62, 80, 0.05)";
                        }}
                      >
                        <label
                          className="d-flex align-items-center text-dark fw-semibold small text-uppercase mb-2"
                          style={{ whiteSpace: "nowrap" }} // Ensures text stays in one line
                        >
                          <i className="bi bi-people me-2"></i> Dependent Relationships
                        </label>
                        <div style={{ overflow: "visible", zIndex: 5000 }}>
                          {dependentRelationships && (
                            <MultiSelect
                              options={dependentRelationships}
                              value={selectedDependentsRelationships}
                              onChange={setSelectedDependentsRelatioships}
                              onFocus={(e) => (e.currentTarget.style.borderColor = "#007bff")}
                              onBlur={(e) => (e.currentTarget.style.borderColor = "#dee2e6")}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div
                        className="p-3 rounded"
                        style={{
                          background: "rgba(44, 62, 80, 0.05)",
                          border: "1px solid rgba(26, 82, 118, 0.2)",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
                          transition: "all 0.3s",
                          position: "relative",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = "rgba(44, 62, 80, 0.08)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = "rgba(44, 62, 80, 0.05)";
                        }}
                      >
                        <label
                          className="d-flex align-items-center text-dark fw-semibold small text-uppercase mb-2"
                          style={{ whiteSpace: "nowrap" }}
                        >
                          <i className="bi bi-person-check me-2"></i> Nominee Relationships
                        </label>
                        <div style={{ position: "relative" }}>
                          {noimeesRelationships && (
                            <MultiSelect
                              options={noimeesRelationships}
                              value={selectedNomineesRelationships}
                              onChange={setSelectedNomineesRelatioships}
                              onFocus={(e) => (e.currentTarget.style.borderColor = "#007bff")}
                              onBlur={(e) => (e.currentTarget.style.borderColor = "#dee2e6")}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
             {/* Age Management */}
            <div className="row px-1 g-1">
    <div className="col-md-6 col-lg-4 mb-1">
      <div
        className="card h-100 border-0 rounded-lg"
        style={{
          boxShadow: "0 10px 20px rgba(0, 0, 0, 0.08)",
          transition: "transform 0.3s, box-shadow 0.3s",
        }}
      >
        <div
          className="card-header py-2 rounded-top d-flex align-items-center"
          style={{
            background: "linear-gradient(to right, #1976D2, #0D47A1)",
            border: "none",
          }}
        >
          <i className="bi bi-calendar-event me-2 text-white"></i>
          <span className="fw-bold fs-6 text-white">
            Age Management
          </span>
        </div>
        <div className="card-body py-3 px-2">
          <div className="row g-1 pe-0">
            <div className="col-md-4 pe-1">
              <label className="text-dark fw-semibold small text-uppercase mb-1">
               Min Adult Age{" "}
                <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="MinimumAge"
                className="form-control py-1 border"
                placeholder="Min age"
                maxLength="2"
                value={formData.MinimumAge}
                onChange={onChangeHandler}
                style={{
                  borderRadius: "8px",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
                  borderColor: "#dee2e6",
                  borderLeft: "4px solid #1a5276",
                }}
              />
              {formError.MinimumAge && (
                <div className="text-danger small mt-1">
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  {formError.MinimumAge}
                </div>
              )}
            </div>
            <div className="col-md-4 pe-1">
              <label className="text-dark fw-semibold small text-uppercase mb-1">
               Max Adult Age{" "}
                <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="MaximumAge"
                className="form-control py-1 border"
                placeholder="Max age"
                maxLength="2"
                value={formData.MaximumAge}
                onChange={onChangeHandler}
                style={{
                  borderRadius: "8px",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
                  borderColor: "#dee2e6",
                  borderLeft: "4px solid #1a5276",
                }}
              />
              {formError.MaximumAge && (
                <div className="text-danger small mt-1">
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  {formError.MaximumAge}
                </div>
              )}
            </div>
            <div className="col-md-4 pe-0">
              <label className="text-dark fw-semibold small text-uppercase mb-1">
               Children Age
              </label>
              <input
                type="text"
                name="ChildrenAge"
                className="form-control py-1 border"
                placeholder="Child age"
                maxLength="2"
                value={formData.ChildrenAge}
                onChange={onChangeHandler}
                style={{
                  borderRadius: "8px",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
                  borderColor: "#dee2e6",
                  borderLeft: !formData.MaximumChild
                    ? "none"
                    : "4px solid #1a5276",
                  opacity: !formData.MaximumChild ? 0.6 : 1,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Primary Member */}
    <div className="col-md-6 col-lg-4 mb-1">
      <div
        className="card h-100 border-0 rounded-lg"
        style={{
          boxShadow: "0 10px 20px rgba(0, 0, 0, 0.08)",
          transition: "transform 0.3s, box-shadow 0.3s",
        }}
      >
        <div
          className="card-header py-2 rounded-top d-flex align-items-center"
          style={{
            background: "linear-gradient(to right, #1976D2, #0D47A1)",
            border: "none",
          }}
        >
          <i className="bi bi-person-badge me-2 text-white"></i>
          <span className="fw-bold fs-6 text-white">
            Primary Member
          </span>
        </div>
        <div className="card-body py-3 px-2">
          <div className="row g-1 pe-0">
            <div className="col-md-4 pe-1">
              <label className="text-dark fw-semibold small text-uppercase mb-1">
                <i className="bi bi-people-fill me-1"></i>Max Adult{" "}
                <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="MaximumAdult"
                className="form-control py-1 border"
                placeholder="Max adults"
                maxLength="2"
                value={formData.MaximumAdult}
                onChange={onChangeHandler}
                style={{
                  borderRadius: "8px",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
                  borderColor: "#dee2e6",
                  borderLeft: "4px solid #1a5276",
                }}
              />
              {formError.MaximumAdult && (
                <div className="text-danger small mt-1">
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  {formError.MaximumAdult}
                </div>
              )}
            </div>
            <div className="col-md-4 pe-1">
              <label className="text-dark fw-semibold small text-uppercase mb-1">
                <i className="bi bi-emoji-laughing me-1"></i>Max Child
              </label>
              <input
                type="text"
                name="MaximumChild"
                className="form-control py-1 border"
                placeholder="Max children"
                maxLength="2"
                value={formData.MaximumChild}
                onChange={onChangeHandler}
                style={{
                  borderRadius: "8px",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
                  borderColor: "#dee2e6",
                  borderLeft: "4px solid #1a5276",
                }}
              />
            </div>
            <div className="col-md-4 pe-0">
              <label className="text-dark fw-semibold small text-uppercase mb-1">
                <i className="bi bi-people me-1"></i>Max Members{" "}
                <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="MaximumMembers"
                className="form-control py-1 border"
                placeholder="Max members"
                maxLength="2"
                value={formData.MaximumMembers}
                onChange={onChangeHandler}
                style={{
                  borderRadius: "8px",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
                  borderColor: "#dee2e6",
                  borderLeft: "4px solid #1a5276",
                }}
              />
              {formError.MaximumMembers && (
                <div className="text-danger small mt-1">
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  {formError.MaximumMembers}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Hospital Coupons */}
    <div className="col-md-6 col-lg-4 mb-1">
      <div 
        className="card h-100 border-0 rounded-lg"
        style={{
          boxShadow: "0 10px 20px rgba(0, 0, 0, 0.08)",
          transition: "transform 0.3s, box-shadow 0.3s",
        }}
      >
        <div
          className="card-header py-2 rounded-top d-flex align-items-center"
          style={{
            background: "linear-gradient(to right, #1976D2, #0D47A1)",
            border: "none",
          }}
        >
          <i className="bi bi-ticket-perforated me-2 text-white"></i>
          <span className="fw-bold fs-6 text-white">
            Hospital Coupons
          </span>
        </div>
        <div className="card-body py-3 px-2">
          <div className="row g-1 pe-0">
            <div className="col-md-12 pe-0">
              <label className="text-dark fw-semibold small text-uppercase mb-1">
                <i className="bi bi-ticket-perforated me-1"></i>Hospital Coupons{" "}
              </label>
              <input
                type="number"
                name="HospitalCoupons"
                className="form-control py-1 border"
                placeholder="Hospital coupons"
                maxLength="20"
                min="1"
                value={formData.HospitalCoupons}
                onChange={onChangeHandler}
                style={{
                  borderRadius: "8px",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
                  borderColor: "#dee2e6",
                  borderLeft: "4px solid #1a5276",
                }}
              />
              {formError.HospitalCoupons && (
                <div className="text-danger small mt-1">
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  {formError.HospitalCoupons}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
            {/* Right Column */}
            <div
    className="card shadow-lg border-0 mt-1 mb-2 rounded-4 overflow-hidden"
    style={{ zIndex: 0, maxWidth: "1200px", marginLeft: "2px", marginRight: "1px" }}
  >
    <div
      className="card-header text-white py-2 px-3 d-flex align-items-center"
      style={{
        background: "linear-gradient(to right, #1976D2, #0D47A1)",
        border: "none",
      }}
    >
      <i className="bi bi-gear-fill me-2"></i>
      <span className="fw-bold fs-5 text-white">
        Additional Options
      </span>
    </div>

    <div className="card-body p-3">
      <div className="row g-3">
        {/* Option 1: Nominee Required */}
        <div className="col-md-6 col-lg-3">
          <div className="p-2 rounded bg-light border-start border-primary border-4 h-100">
            <label className="form-label fw-semibold">
              Nominee Required
            </label>
            <p className="text-muted small">
              Is a nominee required?
            </p>
            <div className="d-flex gap-2">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="IsNomineeRequired"
                  id="NomineeYes"
                  value="Yes"
                  checked={formData?.IsNomineeRequired === true}
                  onChange={() =>
                    onChangeHandler({
                      target: {
                        name: "IsNomineeRequired",
                        value: true,
                      },
                    })
                  }
                />
                <label
                  className="form-check-label"
                  htmlFor="NomineeYes"
                >
                  Yes
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="IsNomineeRequired"
                  id="NomineeNo"
                  value="No"
                  checked={formData?.IsNomineeRequired === false}
                  onChange={() =>
                    onChangeHandler({
                      target: {
                        name: "IsNomineeRequired",
                        value: false,
                      },
                    })
                  }
                />
                <label
                  className="form-check-label"
                  htmlFor="NomineeNo"
                >
                  No
                </label>
              </div>
            </div>
          </div>
        </div>
        {/* Option 2: Default Option */}
        <div className="col-md-6 col-lg-3">
          <div className="p-2 rounded bg-light border-start border-primary border-2 h-100">
            <label className="form-label fw-semibold">
              Default Option
            </label>
            <p className="text-muted small">
              Should this be the default?
            </p>
            <div className="d-flex gap-2">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="IsDefault"
                  id="DefaultYes"
                  value="Yes"
                  checked={formData?.IsDefault === true}
                  onChange={() =>
                    onChangeHandler({
                      target: { name: "IsDefault", value: true },
                    })
                  }
                />
                <label
                  className="form-check-label"
                  htmlFor="DefaultYes"
                >
                  Yes
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="IsDefault"
                  id="DefaultNo"
                  value="No"
                  checked={formData?.IsDefault === false}
                  onChange={() =>
                    onChangeHandler({
                      target: { name: "IsDefault", value: false },
                    })
                  }
                />
                <label
                  className="form-check-label"
                  htmlFor="DefaultNo"
                >
                  No
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Option 3: Pricing Option */}
        <div className="col-md-6 col-lg-3">
          <div className="p-2 rounded bg-light border-start border-primary border-2 h-100">
            <label className="form-label fw-semibold">
              Pricing Option
            </label>
            <p className="text-muted small">
              Is this free or paid?
            </p>
            <div className="d-flex gap-2">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="IsFree"
                  id="Free"
                  value="Free"
                  checked={formData?.IsFree === true}
                  onChange={() =>
                    onChangeHandler({
                      target: { name: "IsFree", value: true },
                    })
                  }
                />
                <label className="form-check-label" htmlFor="Free">
                  Free
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="IsFree"
                  id="Paid"
                  value="Paid"
                  checked={formData?.IsFree === false}
                  onChange={() =>
                    onChangeHandler({
                      target: { name: "IsFree", value: false },
                    })
                  }
                />
                <label className="form-check-label" htmlFor="Paid">
                  Paid
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Option 4: Status */}
        <div className="col-md-6 col-lg-3">
          <div className="p-2 rounded bg-light border-start border-primary border-1 h-100">
            <label className="form-label fw-semibold">Status</label>
            <p className="text-muted small">Is this active?</p>
            <div className="d-flex gap-2">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="IsActive"
                  id="ActiveYes"
                  value="Yes"
                  checked={formData?.IsActive === true}
                  onChange={() =>
                    onChangeHandler({
                      target: { name: "IsActive", value: true },
                    })
                  }
                />
                <label
                  className="form-check-label"
                  htmlFor="ActiveYes"
                >
                  Active
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="IsActive"
                  id="ActiveNo"
                  value="No"
                  checked={formData?.IsActive === false}
                  onChange={() =>
                    onChangeHandler({
                      target: { name: "IsActive", value: false },
                    })
                  }
                />
                <label
                  className="form-check-label"
                  htmlFor="ActiveNo"
                >
                  Inactive
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

          <div
            className="card shadow-lg border-0 mt-3 mb-3 rounded-4 overflow-hidden"
            style={{ zIndex: 0 }}
          >
            <div
              className="card-header text-white py-2 px-3 d-flex align-items-center"
              style={{
                background: "linear-gradient(to right, #1976D2, #0D47A1)",
                border: "none",
              }}
            >
              <i className="bi bi-shield-check me-2 fs-5"></i>
              <span className="fw-bold fs-5 text-white">Insurance Premium</span>
            </div>

            <div className="card-body p-3">
              <div
                className="table-responsive"
                style={{ maxHeight: "300px", overflowY: "auto" }}
              >
                <table className="table table-hover align-middle text-center table-striped border rounded-3">
                  <thead className="bg-light text-uppercase fw-semibold text-secondary">
                    <tr>
                      <th className="py-2">SL No</th>
                      <th className="py-2">Min Age</th>
                      <th className="py-2">Max Age</th>
                      <th className="py-2">Base Premium</th>
                      <th className="py-2">GST%</th>
                      <th className="py-2">Total</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr key={index}>
                        <td className="fw-bold text-primary">{index + 1}</td>
                        <td>
                          <input
                            className="form-control form-control-sm border-primary-subtle"
                            type="number"
                            min="18"
                            value={row.MinimumAge}
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                "MinimumAge",
                                e.target.value
                              )
                            }
                            placeholder="Min"
                          />
                        </td>
                        <td>
                          <input
                            className="form-control form-control-sm border-primary-subtle"
                            type="number"
                            min="18"
                            value={row.MaximumAge}
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                "MaximumAge",
                                e.target.value
                              )
                            }
                            placeholder="Max"
                          />
                        </td>
                        <td>
                          <div className="input-group input-group-sm">
                            <span className="input-group-text bg-light">₹</span>
                            <input
                              className="form-control border-primary-subtle"
                              type="text"
                              value={row.BasePremium}
                              onChange={(e) =>
                                handleInputChange(
                                  index,
                                  "BasePremium",
                                  e.target.value
                                )
                              }
                              placeholder="Amount"
                            />
                          </div>
                        </td>
                        <td>
                          <div
                            className="input-group input-group-sm"
                            style={{ width: "100px", margin: "0 auto" }}
                          >
                            <input
                              className="form-control border-primary-subtle"
                              type="number"
                              min="0"
                              max="99"
                              value={row.GST}
                              onChange={(e) =>
                                handleInputChange(index, "GST", e.target.value)
                              }
                              placeholder="%"
                            />
                            <span className="input-group-text bg-light">%</span>
                          </div>
                        </td>
                        <td>
                          <div className="input-group input-group-sm">
                            <span className="input-group-text bg-light">₹</span>
                            <input
                              className="form-control border-primary-subtle"
                              type="number"
                              min="0"
                              value={row.TotalAmount}
                              onChange={(e) =>
                                handleInputChange(index, "TotalAmount", e.target.value)
                              }
                            />
                          </div>
                        </td>
                        <td>
                          <button
                            className="btn btn-outline-danger btn-sm rounded-circle"
                            onClick={() => deleteRow(index)}
                            title="Delete row"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {formError.InsurancePremium && (
              <div className="alert alert-danger d-flex align-items-center mx-3 my-2 rounded-3 p-2">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {formError.InsurancePremium}
              </div>
            )}

            <div className="text-center py-2 bg-light rounded-bottom">
              <button
                className="btn btn-primary btn-sm shadow px-3 py-2 rounded-3"
                onClick={addRow}
              >
                <i className="bi bi-plus-circle me-2"></i> Add Row
              </button>
            </div>
          </div>

          <div className="card shadow-lg border-0 mt-3 mb-3 rounded-4 overflow-hidden">
            <div
              className="card-header bg-primary text-white py-2 px-3 d-flex align-items-center"
              style={{
                background: "linear-gradient(to right, #1976D2, #0D47A1)",
                border: "none",
              }}
            >
              <i className="bi bi-gift-fill me-2 fs-5"></i>
              <span className="fw-bold fs-5 text-white">Offers</span>
            </div>

            <div className="card-body p-3">
              <div
                className="table-responsive"
                style={{ maxHeight: "300px", overflowY: "auto" }}
              >
                <table className="table table-hover align-middle text-center table-striped border rounded-3">
                  <thead className="bg-light text-uppercase fw-semibold text-secondary">
                    <tr>
                      <th className="py-2">SL No</th>
                      <th className="py-2">Member Type</th>
                      <th className="py-2">Offer Amount</th>
                      <th className="py-2">Offer %</th>
                      <th className="py-2">Total</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offersRows.map((row, index) => (
                      <tr key={index}>
                        <td className="fw-bold text-primary">{index + 1}</td>
                        <td>
                          <select
                            className="form-select form-select-sm border-primary-subtle"
                            value={row.MemberTypeId}
                            onChange={(e) =>
                              handleOffersChange(
                                index,
                                "MemberTypeId",
                                e.target.value
                              )
                            }
                          >
                            <option value="">--Select--</option>
                            {memberTypes &&
                              memberTypes.map((option, idx) => (
                                <option key={idx} value={option.MemberTypeId}>
                                  {option.Type}
                                </option>
                              ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control form-control-sm border-primary-subtle"
                            min="0"
                            step="0.01"
                            value={row.OfferAmount}
                            onChange={(e) =>
                              handleOffersChange(
                                index,
                                "OfferAmount",
                                e.target.value
                              )
                            }
                            placeholder="Amount"
                          />
                        </td>
                        <td>
                          <div className="input-group input-group-sm">
                            <input
                              className="form-control border-primary-subtle"
                              type="number"
                              min="0"
                              max="99"
                              step="0.01"
                              value={row.OfferPercentage}
                              onChange={(e) =>
                                handleOffersChange(
                                  index,
                                  "OfferPercentage",
                                  e.target.value
                                )
                              }
                              placeholder="%"
                            />
                            <span className="input-group-text bg-light">%</span>
                          </div>
                        </td>
                        <td>
                          <div className="input-group input-group-sm">
                            <span className="input-group-text bg-light">₹</span>
                            <input
                              className="form-control border-primary-subtle"
                              type="number"
                              min="0"
                              value={row.TotalAmount}
                              disabled
                            />
                          </div>
                        </td>
                        <td>
                          <button
                            className="btn btn-outline-danger btn-sm rounded-circle"
                            onClick={() => deleteOffersRow(index)}
                            title="Delete row"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {formError.Offers && (
              <div className="alert alert-danger d-flex align-items-center mx-3 my-2 rounded-3 p-2">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {formError.Offers}
              </div>
            )}

            {offersFormError && offersFormError.length > 0 && (
              <div className="alert alert-danger d-flex align-items-center mx-3 my-2 rounded-3 p-2">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {offersFormError}
              </div>
            )}

            <div className="text-center py-2 bg-light rounded-bottom">
              <button
                className="btn btn-primary btn-sm shadow px-3 py-2 rounded-3"
                onClick={addOffersRow}
              >
                <i className="bi bi-plus-circle me-2"></i> Add Row
              </button>
            </div>
          </div>

          <div className="card shadow-lg border-0 mt-3 mb-3 rounded-4 overflow-hidden">
            <div
              className="card-header bg-primary text-white py-2 px-3"
              style={{
                background: "linear-gradient(to right, #1976D2, #0D47A1)",
                border: "none",
              }}
            >
              <span className="fw-bold fs-5 text-white">Other Charges</span>
            </div>

            <div className="card-body p-3">
              <div
                className="table-responsive"
                style={{ maxHeight: "300px", overflowY: "auto" }}
              >
                <table className="table table-hover border align-middle text-center table-striped">
                  <thead className="bg-light text-uppercase fw-semibold text-secondary">
                    <tr>
                      <th className="py-2">SL No</th>
                      <th className="py-2">Label</th>
                      <th className="py-2">Amount</th>
                      <th className="py-2">Type</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {additionalRows.map((row, index) => (
                      <tr key={index}>
                        <td className="fw-bold text-primary">{index + 1}</td>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm border-primary-subtle"
                            value={row.LabelName}
                            onChange={(e) =>
                              handleAdditionalInputChange(
                                index,
                                "LabelName",
                                e.target.value
                              )
                            }
                            placeholder="Label"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control form-control-sm border-primary-subtle"
                            value={row.Value}
                            onChange={(e) =>
                              handleAdditionalInputChange(
                                index,
                                "Value",
                                e.target.value
                              )
                            }
                            placeholder="Amount"
                          />
                        </td>
                        <td>
                          <div className="d-flex justify-content-center">
                            <div className="form-check me-3">
                              <input
                                className="form-check-input"
                                id={`fixedRadio${index}`}
                                type="radio"
                                name={`priceType-${index}`}
                                value="fixed"
                                checked={row.IsFixed === true}
                                onChange={() =>
                                  handleRadioChange(index, "fixed")
                                }
                              />
                              <label
                                className="form-check-label small"
                                htmlFor={`fixedRadio${index}`}
                              >
                                Fixed
                              </label>
                            </div>
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                id={`variableRadio${index}`}
                                type="radio"
                                name={`priceType-${index}`}
                                value="variable"
                                checked={row.IsFixed === false}
                                onChange={() =>
                                  handleRadioChange(index, "variable")
                                }
                              />
                              <label
                                className="form-check-label small"
                                htmlFor={`variableRadio${index}`}
                              >
                                Variable
                              </label>
                            </div>
                          </div>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm rounded-circle"
                            onClick={() => deleteAdditionalRow(index)}
                            title="Delete row"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-center py-2 bg-light rounded-bottom">
              <button
                className="btn btn-primary btn-sm shadow px-3 py-2 rounded-3"
                onClick={addAdditionalRow}
              >
                <i className="bi bi-plus-circle me-2"></i> Add Row
              </button>
            </div>
          </div>
          <div className="row g-3">
            {/* Welcome Email */}
            <div className="col-md-6">
              <div className="card shadow-sm border-0 rounded-4 h-100">
                <div className="card-body p-3">
                  <h6 className="fw-bold text-primary mb-3">Welcome Email</h6>
                  <div className="form-group">
                    <div className="border rounded p-2">
                      <ReactQuill
                        value={formData.WelcomeEmail}
                        onChange={onQuillChangeHandler("WelcomeEmail")}
                        modules={quillModules}
                        formats={quillFormats}
                        theme="snow"
                        preserveWhitespace={true}
                        contentType="html" 
                      />
                    </div>

                    {formError.WelcomeEmail && (
                      <span className="text-danger small">
                        {formError.WelcomeEmail}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Endorse Email */}
            <div className="col-md-6">
              <div className="card shadow-sm border-0 rounded-4 h-100">
                <div className="card-body p-3">
                  <h6 className="fw-bold text-primary mb-3">Endorse Email</h6>
                  <div className="form-group">
                    <div className="border rounded p-2">
                      <ReactQuill
                        value={formData.EndorseEmail}
                        onChange={onQuillChangeHandler("EndorseEmail")}
                        modules={quillModules}
                        formats={quillFormats}
                        theme="snow"
                        preserveWhitespace={true}
                        contentType="html" 
                      />
                    </div>

                    {formError.EndorseEmail && (
                      <span className="text-danger small">
                        {formError.EndorseEmail}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Long Description */}
            <div className="col-md-6">
              <div className="card shadow-sm border-0 rounded-4 h-100">
                <div className="card-body p-3">
                  <h6 className="fw-bold text-primary mb-3">
                    Long Description
                  </h6>
                  <div className="form-group">
                    <div className="border rounded p-2">
                      <ReactQuill
                        value={formData.LongDescription}
                        onChange={onQuillChangeHandler("LongDescription")}
                        modules={quillModules}
                        formats={quillFormats}
                        theme="snow"
                        preserveWhitespace={true} 
                        contentType="html" />
                    </div>
                    {formError.LongDescription && (
                      <span className="text-danger small">
                        {formError.LongDescription}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Key Features */}
            <div className="col-md-6">
              <div className="card shadow-sm border-0 rounded-4 h-100">
                <div className="card-body p-3">
                  <h6 className="fw-bold text-primary mb-3">Key Features</h6>
                  <div className="form-group">
                    <div className="border rounded p-2">
                      <ReactQuill
                        value={formData.KeyFeatures}
                        onChange={onQuillChangeHandler("KeyFeatures")}
                        modules={quillModules}
                        formats={quillFormats}
                        theme="snow"
                        preserveWhitespace={true}
                        contentType="html"  
                      />
                    </div>
                    {formError.KeyFeatures && (
                      <span className="text-danger small">
                        {formError.KeyFeatures}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="form-group mt-2" style={{ marginBottom: "50px" }}>
            <div className="col-md-12 col-md-offset-2 d-flex align-items-end">
              <button
                className="btn btn-md btn-primary"
                type="reset"
                onClick={resetForm}
              >
                Reset
              </button>
              <button
                className="btn btn-danger  ms-auto me-2"
                type="reset"
                onClick={handleBackToView}
              >
                Cancel
              </button>
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
                }}
              >
                Submit
              </button>
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
@media (max-width: 640px) {
  form {
    width: 100% !important;
    max-width: 100% !important;
  }
  
  
  .card {
    margin-right: -15px !important; /* Adjust value as needed */
    width: calc(100% + 15px) !important;
  }

  
  .col-md-6 {
    width: 100% !important;
    flex: 0 0 100% !important;
    max-width: 100% !important;
  }
}
`;
