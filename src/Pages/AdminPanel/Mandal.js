import Layout from "../../Layout/Layout";
import React, { useState, useEffect } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  fetchData,
  fetchUpdateData,
  fetchDeleteData,
  fetchAllData,
} from "../../helpers/externapi";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CommonTables from "../../Commoncomponents/CommonTables";
import TableContainer from "@mui/material/TableContainer";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import ConfirmationDialogDelete from "../../Components/ConfirmationDialogDelete";

const customStyles = {
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
  },
  container: { marginTop: "24px" },

  activeButton: { backgroundColor: "#1976d2", color: "#fff" },
  inactiveButton: { backgroundColor: "#e0e0e0", color: "#000" },
};

const StyledButton = styled(Button)(customStyles.addButton);

export default function StateList(props) {
  const [loading, setLoading] = useState(false);
  const [mandals, setMandals] = useState([]);
  const [Villages, setVillages] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formType, setFormType] = useState("mandal");
  const [formData, setFormData] = useState({
    MandalId: "",
    MandalName: "",
    VillageId: "",
    VillageName: "",
    StateId: "",
    DistrictName: "",
    DistrictId: "",
    StateName: "",
    CreatedDate: "",
  });
  const [totalCountVillage, setTotalCountVillage] = React.useState(0);
  const [currentPageVillage, setCurrentPageVillage] = React.useState(1);
  const [perPageVillage, setPerPageVillage] = React.useState(10);
  const [totalCountMandal, setTotalCountMandal] = React.useState(0);
  const [currentPageMandal, setCurrentPageMandal] = React.useState(1);
  const [perPageMandal, setPerPageMandal] = React.useState(10);
  const [currentPageDistrict, setCurrentPageDistrict] = React.useState(1);
  const [perPageDistrict, setPerPageDistrict] = React.useState(10);
  const [districts, setDistricts] = useState([]);
  const [currentPageState, setCurrentPageState] = React.useState(1);
  const [perPageState, setPerPageState] = React.useState(10);
  const [states, setStates] = useState([]);

  const [selectedStateId, setSelectedStateId] = useState(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState(null);
  const [selectedMandalId, setSelectedMandalId] = useState(null);
  const [mandal, setMandal] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  const [confirmationData, setConfirmationData] = useState({});
  const [activeSection, setActiveSection] = useState("Mandal");
  const [mode, setMode] = useState("add"); // "add" or "edit"
  const [isDistrictDisabled, setIsDistrictDisabled] = useState(mode === "add");
  const [isMandalDisabled, setIsMandalDisabled] = useState(mode === "add");
  const [isVillageDisabled, setIsVillageDisabled] = useState(mode === "add");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDisctrict, setSelectedDistrict] = useState("");
  const [mandalInput, setMandalInput] = useState("");
  const [error, setError] = useState("");
  const [selectedStateVillage, setSelectedStateVillage] = useState([]);
  const [selectedDisctrictVillage, setSelectedDistrictVillage] = useState([]);
  const [selectedMandalVillage, setSelectedMandalVillage] = useState([]);
  const [villageInput, setVillageInput] = useState([]);

  const [stateDropdown, setStateDropdown] = useState([]);
  const [districtDropdown, setDistrictDropdown] = useState([]);
  const [mandalDropdown, setMandalDropdown] = useState([]);

  const [mandalFilterCriteria, setMandalFilterCriteria] = useState([]);
  const [villageFilterCriteria, setVillageFilterCriteria] = useState([]);
  const [isDisableApply, setIsDisableApply] = useState(true);
  const [isDisableVillageApply, setIsDisableVillageApply] = useState(true);

  let UserId = localStorage.getItem("UserId");

  const tableHeadsMandal = [
    "Mandal Name",
    "District Name",
    "State Name",
    "Status",
    "Actions",
  ];
  const tableHeadsVillage = [
    "Village Name",
    "Mandal Name",
    "District Name",
    "State Name",
    "Status",
    "Actions",
  ];

  const tableElementsMandal =
    mandals && mandals.length > 0
      ? mandals.map((mandal) => [
          mandal.MandalName,
          mandal.DistrictName,
          mandal.StateName,
          <span
            style={{
              backgroundColor: mandal.IsActive ? "#d4f8d4" : "#f8d7da",
              color: mandal.IsActive ? "#28a745" : "#dc3545",
              padding: "5px 6px",
              borderRadius: "5px",
              display: "inline-block",
              textTransform: "uppercase",
              fontSize: "9px",
            }}
          >
            {mandal.IsActive ? "ACTIVE" : "INACTIVE"}
          </span>,
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              style={{ marginRight: "10px" }}
              onClick={() => handleEditWrapper(mandal, "mandal")}
            >
              Edit
            </Button>
            <Button
              variant="contained"
              size="small"
              sx={{
                backgroundColor: "red",
                color: "white",
                "&:hover": { backgroundColor: "darkred" },
              }}
              onClick={() => handleDelete(mandal.MandalId, "Mandal")}
            >
              Delete
            </Button>
          </div>,
        ])
      : [];

  const tableElementsVillage =
    Villages.length > 0
      ? Villages.map((Village) => [
          Village.VillageName,
          Village.MandalName,
          Village.DistrictName,
          Village.StateName,
          // IsActive Button-Like Element
          <span
            style={{
              backgroundColor: Village.IsActive ? "#d4f8d4" : "#f8d7da",
              color: Village.IsActive ? "#28a745" : "#dc3545",
              padding: "5px 6px",
              borderRadius: "5px",
              display: "inline-block",
              textTransform: "uppercase",
              fontSize: "9px",
            }}
          >
            {Village.IsActive ? "ACTIVE" : "INACTIVE"}
          </span>,
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              style={{ marginRight: "10px" }}
              onClick={() => handleEditWrapper(Village, "village")}
            >
              Edit
            </Button>
            <Button
              variant="contained"
              size="small"
              sx={{
                backgroundColor: "red",
                color: "white",
                "&:hover": { backgroundColor: "darkred" },
              }}
              onClick={() => handleDelete(Village.VillageId, "village")}
            >
              Delete
            </Button>
          </div>,
        ])
      : [];

  const getMandals = async () => {
    try {
      const skip = (currentPageMandal - 1) * perPageMandal;
      const take = perPageMandal;

      let mandalData;

      setLoading(true);

      if (mandalFilterCriteria.length > 0) {
        mandalData = await fetchData("Mandal/filter", {
          skip,
          take,
          filter: mandalFilterCriteria,
        });
      } else {
        mandalData = await fetchData("Mandal/all", { skip, take });
      }

      setMandals(mandalData);
    } catch (error) {
      console.error("Error fetching mandal data:", error);
    } finally {
      setLoading(false);
    }
  };
  const getVillages = async () => {
    try {
      const skip = (currentPageVillage - 1) * perPageVillage;
      const take = perPageVillage;

      let VillagesData;

      setLoading(true);
      if (villageFilterCriteria.length > 0) {
        VillagesData = await fetchData("Village/filter", {
          skip,
          take,
          filter: villageFilterCriteria,
        });
      } else {
        VillagesData = await fetchData("Village/all", { skip, take });
      }

      setVillages(VillagesData);
    } catch (error) {
      console.error("Error fetching village data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getStateDropdown = async () => {
      try {
        setLoading(true);

        const statesData = await fetchData("States/all", { skip: 0, take: 0 });
        setStateDropdown(statesData);
      } catch (error) {
        console.error("Error fetching states data:", error);
      } finally {
        setLoading(false);
      }
    };
    getStateDropdown();
  }, []);

  useEffect(() => {
    const getDistrictDropdown = async () => {
      try {
        setLoading(true);
        const statesData = await fetchData("Districts/all", {
          skip: 0,
          take: 0,
        });
        setDistrictDropdown(statesData);
      } catch (error) {
        console.error("Error fetching states data:", error);
      } finally {
        setLoading(false);
      }
    };
    getDistrictDropdown();
  }, []);

  useEffect(() => {
    const getMandalDropdown = async () => {
      try {
        setLoading(true);
        const statesData = await fetchData("Mandal/all", { skip: 0, take: 0 });
        setMandalDropdown(statesData);
      } catch (error) {
        console.error("Error fetching states data:", error);
      } finally {
        setLoading(false);
      }
    };
    getMandalDropdown();
  }, []);

  useEffect(() => {
    const getDistrictsByMandal = async () => {
      if (selectedDistrictId !== null) {
        setLoading(true);
        const DistrictsByMandal = await fetchAllData(
          `Mandal/GetMandalsByDistrictId/${selectedDistrictId}`
        );
        setMandal(
          DistrictsByMandal.map((mandal) => ({
            ...mandal,
            id: mandal.MandalId,
          }))
        );
        setMandal(DistrictsByMandal);
        setLoading(false);
      } else {
        setMandal([]);
      }
    };
    getDistrictsByMandal();
  }, [selectedDistrictId]);

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

  const getStates = async () => {
    try {
      const skip = (currentPageState - 1) * perPageState;
      const take = perPageState;

      setLoading(true);
      const statesData = await fetchData("States/all", { skip, take });
      setStates(statesData);
    } catch (error) {
      console.error("Error fetching states data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMandals();
  }, [
    currentPageMandal,
    perPageMandal,
    selectedDistrictId,
    mandalFilterCriteria,
  ]);

  useEffect(() => {
    getVillages();
  }, [
    currentPageVillage,
    perPageVillage,
    selectedDistrictId,
    villageFilterCriteria,
  ]);

  useEffect(() => {
    getVillageCountData();
    getMandalCountData();
  }, []);

  useEffect(() => {
    getStates();
  }, [currentPageState, perPageState]);

  useEffect(() => {}, [currentPageDistrict, perPageDistrict]);
  const handleEditWrapper = (item, type) => {
    setIsEditMode(true);
    setFormVisible(true);
    setFormType(type);
    if (type === "mandal") {
      setSelectedStateId(item.StateId);
      setMode("edit");
      setIsDistrictDisabled(false);
      setIsMandalDisabled(false);
      setIsVillageDisabled(false);
      setFormData({
        MandalId: item.MandalId,
        MandalName: item.MandalName,
        StateId: item.StateId,
        DistrictId: item.DistrictId,
        DistrictName: item.DistrictName,
        VillageId: "",
        VillageName: "",
      });
    } else {
      setSelectedStateId(item.StateId);
      setSelectedDistrictId(item.DistrictId);
      setSelectedMandalId(item.MandalId);
      setFormData({
        MandalId: item.MandalId,
        MandalName: "",
        VillageId: item.VillageId,
        VillageName: item.VillageName,
        StateId: item.StateId,
        DistrictId: item.DistrictId,
        DistrictName: item.DistrictName,
      });
    }
  };
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };
  const handleAddNew = (type) => {
    setIsEditMode(false);
    setFormVisible(true);
    setIsDistrictDisabled(true);
    setIsMandalDisabled(true);
    setFormType(type);
    setFormData({
      StateId: "",
      DistrictId: "",
      MandalId: "",
      mandalName: "",
      VillageId: "",
      VillageName: "",
    });
  };

  const validateForm = () => {
    let valid = true;
    const errors = {};

    if (formType === "mandal") {
      if (!formData.MandalName.trim()) {
        errors.MandalName = "Please enter Mandal Name";
        valid = false;
      }
    } else {
      if (!formData.MandalId) {
        errors.mandalId = "Please select mandal Name";
        valid = false;
      }
      if (!formData.VillageName.trim()) {
        errors.VillageName = "Please enter Village Name";
        valid = false;
      }
    }
    setFormErrors(errors);
    return valid;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (validateForm()) {
        if (formType === "mandal") {
          if (isEditMode) {
            await fetchUpdateData("Mandal/update", {
              DistrictId: formData.DistrictId,
              MandalId: formData.MandalId,
              MandalName: formData.MandalName,
              StateId: formData.StateId,
              UpdatedBy: UserId,
            });
            setSnackbarMessage("Mandal updated successfully!");
          } else {
            await fetchData("Mandal/add", {
              DistrictId: formData.DistrictId,
              StateId: formData.StateId,
              MandalName: formData.MandalName,
              CreatedBy: UserId,
            });
            setSnackbarMessage("Mandal added successfully!");
          }
          setSnackbarOpen(true);
          await getMandals();
        } else {
          if (isEditMode) {
            await fetchUpdateData("Village/update", {
              villageId: formData.VillageId,
              villageName: formData.VillageName,
              mandalId: formData.MandalId,
              DistrictId: formData.DistrictId,
              stateId: formData.StateId,
              UpdatedBy: UserId,
            });
            setSnackbarMessage("Village updated successfully!");
          } else {
            await fetchData("Village/add", {
              villageName: formData.VillageName,
              MandalId: formData.MandalId,
              DistrictId: formData.DistrictId,
              StateId: formData.StateId,
              CreatedBy: UserId,
            });
            setSnackbarMessage("Village added successfully!");
          }
          setSnackbarOpen(true);
          await getVillages();
        }
        setFormVisible(false);
        setFormData({
          MandalId: "",
          MandalName: "",
          VillageId: "",
          VillageName: "",
        });
      }
    } catch (error) {
      console.error("Error adding/updating item:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = (id, type) => {
    setConfirmationData({
      title: "Delete Mandal Or Village",
      message: "Are you sure you want to delete this Mandal or Villaget?",
      onConfirm: () => confirmhandleDelete(id, type),
    });
    setConfirmationOpen(true);
  };

  const confirmhandleDelete = async (id, type) => {
    try {
      setLoading(true);
      setConfirmationOpen(false);
      if (type === "Mandal") {
        await fetchDeleteData(`Mandal/delete/${id}`);
        await getMandals();
        setSnackbarMessage("Mandal deleted Successfully");
        setSnackbarOpen(true);
      } else {
        await fetchDeleteData(`Village/delete/${id}`);
        await getVillages();
        setSnackbarMessage("village deleted Successfully");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleClose = () => {
    setFormVisible(false);
  };
  const getVillageCountData = async () => {
    setLoading(true);
    try {
      const VillageCountData = await fetchData(
        `CommonRowCount/GetTableRowCount`,
        { tableName: "Village" }
      );
      const totalCount = VillageCountData[0]?.CountOfRecords || 0;
      setTotalCountVillage(totalCount);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching hospital count data:", error);
      setLoading(false);
    }
  };

  const getMandalCountData = async () => {
    setLoading(true);
    try {
      const mandalCountData = await fetchData(
        `CommonRowCount/GetTableRowCount`,
        { tableName: "Mandal" }
      );
      const totalCount = mandalCountData[0]?.CountOfRecords || 0;
      setTotalCountMandal(totalCount);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching hospital count data:", error);
      setLoading(false);
    }
  };

  const handlePageChangeVillage = (event, page) => {
    setCurrentPageVillage(page);
  };

  const handlePerPageChangeVillage = (event) => {
    setPerPageVillage(parseInt(event.target.value, 10));
    setCurrentPageVillage(1);
  };

  const handlePageChangeMandal = (event, page) => {
    setCurrentPageMandal(page);
  };

  const handlePerPageChangeMandal = (event) => {
    setPerPageMandal(parseInt(event.target.value, 10));
    setCurrentPageMandal(1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "StateId") {
      setIsDistrictDisabled(!value); // Disable district if no state selected
      setIsMandalDisabled(true); // Disable mandal when state changes
      setIsVillageDisabled(true); // Disable village until mandal is selected
      setSelectedStateId(value);
      setSelectedDistrictId(null); // Reset district selection
      setSelectedMandalId(null); // Reset mandal selection
    }
    if (name === "DistrictId") {
      setSelectedDistrictId(value);
      setIsMandalDisabled(!value); // Enable mandal if district is selected
      setIsVillageDisabled(true); // Disable village until mandal is selected
      setSelectedMandalId(null); // Reset mandal selection
    }
    if (name === "MandalId") {
      setSelectedMandalId(value);
      setIsVillageDisabled(!value); // Enable village if mandal is selected
    }
  };

  const handleApply = async () => {
   

    const filterCriteria = [];

    // Add state filter if selected
    if (selectedState) {
      filterCriteria.push({
        key: "StateId",
        value: selectedState,
        operator: "IN",
      });
    }

    // Add district filter if input is provided
    if (selectedDisctrict) {
      filterCriteria.push({
        key: "DistrictId",
        value: selectedDisctrict,
        operator: "IN",
      });
    }

    if (mandalInput) {
      filterCriteria.push({
        key: "MandalName",
        value: mandalInput,
        operator: "LIKE",
      });
    }

    if (filterCriteria.length === 0) {
      setError("Please provide at least a State or District to filter.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const distributorCountData = await fetchData(
        `CommonRowCount/GetTableRowCount`,
        { tableName: "Mandal", filter: filterCriteria }
      );

      const totalCount = distributorCountData[0]?.CountOfRecords || 0;
      setTotalCountMandal(totalCount);

      const suggestionData = await fetchData("Mandal/filter", {
        skip: 0,
        take: perPageState,
        filter: filterCriteria,
      });

      setMandalFilterCriteria(filterCriteria);


      setMandals(suggestionData);
    } catch (error) {
      setError("Failed to fetch suggestions.");
      console.error("Error fetching district data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVillageApply = async () => {
   

    const filterCriteria = [];

    // Add state filter if selected
    if (selectedStateVillage) {
      filterCriteria.push({
        key: "StateId",
        value: selectedStateVillage,
        operator: "IN",
      });
    }

    // Add district filter if input is provided
    if (selectedDisctrictVillage) {
      filterCriteria.push({
        key: "DistrictId",
        value: selectedDisctrictVillage,
        operator: "IN",
      });
    }

    if (selectedMandalVillage) {
      filterCriteria.push({
        key: "MandalId",
        value: selectedMandalVillage,
        operator: "IN",
      });
    }

    if (villageInput) {
      filterCriteria.push({
        key: "VillageName",
        value: villageInput,
        operator: "LIKE",
      });
    }

    if (filterCriteria.length === 0) {
      setError("Please provide at least a State or District to filter.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const distributorCountData = await fetchData(
        `CommonRowCount/GetTableRowCount`,
        { tableName: "Village", filter: filterCriteria }
      );

      const totalCount = distributorCountData[0]?.CountOfRecords || 0;
      setTotalCountVillage(totalCount);

      const suggestionData = await fetchData("Village/filter", {
        skip: 0,
        take: perPageState,
        filter: filterCriteria,
      });

      setVillageFilterCriteria(filterCriteria);
      setVillages(suggestionData);
    } catch (error) {
      setError("Failed to fetch suggestions.");
      console.error("Error fetching district data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      selectedState === "" &&
      selectedDisctrict === "" &&
      mandalInput === ""
    ) {
      setIsDisableApply(true);
    } else {
      setIsDisableApply(false);
    }
  }, [selectedState, selectedDisctrict, mandalInput]);

  useEffect(() => {
    if (
      selectedStateVillage === "" &&
      selectedDisctrictVillage === "" &&
      selectedMandalVillage === "" &&
      villageInput === ""
    ) {
      setIsDisableVillageApply(true);
    } else {
      setIsDisableVillageApply(false);
    }
  }, [
    selectedStateVillage,
    selectedMandalVillage,
    selectedDisctrictVillage,
    villageInput,
  ]);

  const handleClear = async () => {
    setSelectedState("");
    setSelectedDistrict("");
    setMandalInput("");

    setMandalFilterCriteria([]);

    await getMandals();
    await getMandalCountData();
  };

  const handleClearVillage = async () => {
    setSelectedStateVillage("");
    setSelectedDistrictVillage("");
    setSelectedMandalVillage("");
    setVillageInput("");

    setVillageFilterCriteria([]);

    await getVillages();
    await getVillageCountData();
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
          <div style={customStyles.container}>
            <Box style={customStyles.buttonGroup}>
              <Button
                variant="contained"
                style={
                  activeSection === "Mandal"
                    ? customStyles.activeButton
                    : customStyles.inactiveButton
                }
                onClick={() => setActiveSection("Mandal")}
              >
                MandalS
              </Button>
              <Button
                variant="contained"
                style={
                  activeSection === "villages"
                    ? customStyles.activeButton
                    : customStyles.inactiveButton
                }
                onClick={() => setActiveSection("villages")}
              >
                Villages
              </Button>
            </Box>

            {/* Content Based on Active Section */}
            {activeSection === "Mandal" && (
              <div>
                <h2 style={customStyles.header}>Mandal List</h2>

                <div className="row align-items-end">
                  <div className="col-md-3 mb-2">
                    <label htmlFor="state-select" className="form-label">
                      State Name
                    </label>
                    <select
                      id="state-select"
                      className="form-select"
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                    >
                      <option value="">Select a State</option>
                      {stateDropdown.map((state) => (
                        <option key={state.StateId} value={state.StateId}>
                          {state.StateName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-3 mb-2">
                    <label htmlFor="state-select" className="form-label">
                      District Name
                    </label>
                    <select
                      id="state-select"
                      className="form-select"
                      value={selectedDisctrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                    >
                      <option value="">Select a District</option>
                      {districtDropdown.map((district) => (
                        <option
                          key={district.DistrictId}
                          value={district.DistrictId}
                        >
                          {district.DistrictName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-3 mb-2">
                    <label htmlFor="district-input" className="form-label">
                      Mandal Name
                    </label>
                    <input
                      type="text"
                      id="district-input"
                      className="form-control"
                      maxLength="50"
                      value={mandalInput}
                      onChange={(e) => setMandalInput(e.target.value)}
                    />
                  </div>

                  <div className="col-md-2 mb-2 d-flex">
                    <button
                      className="btn btn-primary me-2"
                      onClick={handleApply}
                      disabled={isDisableApply}
                    >
                      Apply
                    </button>
                    <button className="btn btn-secondary" onClick={handleClear}>
                      Clear
                    </button>
                  </div>
                </div>

                <StyledButton
                  variant="contained"
                  color="primary"
                  onClick={() => handleAddNew("mandal")}
                >
                  Add Mandal
                </StyledButton>

                <div className="card">
                  {loading ? (
                    <div style={customStyles.loadingContainer}>
                      <CircularProgress />
                    </div>
                  ) : (
                    <CommonTables
                      tableHeads={tableHeadsMandal}
                      tableData={tableElementsMandal}
                      perPage={perPageMandal}
                      currentPage={currentPageMandal}
                      perPageChange={handlePerPageChangeMandal}
                      pageChange={handlePageChangeMandal}
                      totalCount={totalCountMandal}
                    />
                  )}
                </div>
              </div>
            )}

            {activeSection === "villages" && (
              <div>
                <h2 style={customStyles.header}>Villages List</h2>

                <div className="row align-items-end">
                  <div className="col-md-3 mb-2">
                    <label htmlFor="state-select" className="form-label">
                      State Name
                    </label>
                    <select
                      id="state-select"
                      className="form-select"
                      value={selectedStateVillage}
                      onChange={(e) => setSelectedStateVillage(e.target.value)}
                    >
                      <option value="">Select a State</option>
                      {stateDropdown.map((state) => (
                        <option key={state.StateId} value={state.StateId}>
                          {state.StateName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-3 mb-2">
                    <label htmlFor="state-select" className="form-label">
                      District Name
                    </label>
                    <select
                      id="state-select"
                      className="form-select"
                      value={selectedDisctrictVillage}
                      onChange={(e) =>
                        setSelectedDistrictVillage(e.target.value)
                      }
                    >
                      <option value="">Select a District</option>
                      {districtDropdown.map((district) => (
                        <option
                          key={district.DistrictId}
                          value={district.DistrictId}
                        >
                          {district.DistrictName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-3 mb-2">
                    <label htmlFor="state-select" className="form-label">
                      Mandal Name
                    </label>
                    <select
                      id="state-select"
                      className="form-select"
                      value={selectedMandalVillage}
                      onChange={(e) => setSelectedMandalVillage(e.target.value)}
                    >
                      <option value="">Select a Mandal</option>
                      {mandalDropdown.map((mandal) => (
                        <option key={mandal.MandalId} value={mandal.MandalId}>
                          {mandal.MandalName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-3 mb-2">
                    <label htmlFor="district-input" className="form-label">
                      Village Name
                    </label>
                    <input
                      type="text"
                      id="district-input"
                      className="form-control"
                      maxLength="50"
                      value={villageInput}
                      onChange={(e) => setVillageInput(e.target.value)}
                    />
                  </div>

                  <div className="col-md-3 mb-2 d-flex align-items-center gap-2">
                    <button
                      className="btn btn-primary px-4 py-2"
                      onClick={handleVillageApply}
                      disabled={isDisableVillageApply}
                    >
                      Apply
                    </button>
                    <button
                      className="btn btn-secondary px-4 py-2"
                      onClick={handleClearVillage}
                    >
                      Clear
                    </button>

                    <button
                      className="btn tn-secondary"
                      onClick={() => handleAddNew("village")}
                      style={{
                        height: "40px",
                        minWidth: "120px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#28a745",
                        fontSize: "14px",
                        color: "white",
                      }}
                    >
                      Add Village
                    </button>
                  </div>
                </div>

                <div className="card">
                  {loading ? (
                    <div style={customStyles.loadingContainer}>
                      <CircularProgress />
                    </div>
                  ) : (
                    <CommonTables
                      tableHeads={tableHeadsVillage}
                      tableData={tableElementsVillage}
                      perPage={perPageVillage}
                      currentPage={currentPageVillage}
                      perPageChange={handlePerPageChangeVillage}
                      pageChange={handlePageChangeVillage}
                      totalCount={totalCountVillage}
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
                <Alert onClose={handleSnackbarClose} severity="success">
                  {snackbarMessage}
                </Alert>
              </Snackbar>
            </TableContainer>

            <Dialog
              open={formVisible}
              onClose={handleClose}
              aria-labelledby="form-dialog-title"
            >
              <DialogTitle id="form-dialog-title">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="h6">
                    {isEditMode
                      ? formType === "mandal"
                        ? "Update mandal"
                        : "Update Village"
                      : formType === "mandal"
                      ? "Add Mandal"
                      : "Add Village"}
                  </Typography>
                  <IconButton onClick={handleClose} style={{ color: "red" }}>
                    ✖
                  </IconButton>
                </div>
              </DialogTitle>
              <DialogContent>
                <DialogContentText>
                  {isEditMode
                    ? formType === "mandal"
                      ? "Update the details of the mandal."
                      : "Update the details of the village."
                    : formType === "mandal"
                    ? "Fill in the details of the new madal."
                    : "Fill in the details of the new village."}
                </DialogContentText>
                <form noValidate autoComplete="off">
                  {formType === "mandal" ? (
                    <>
                      <div className="col-md-12">
                        <div className="form-group">
                          {/* State Dropdown */}
                          <label className="form-label">State</label>
                          <span className="required" style={{ color: "red" }}>
                            *
                          </span>
                          <select
                            className="form-select"
                            name="StateId"
                            value={formData.StateId}
                            onChange={handleChange}
                            style={{
                              width: "100%",
                              padding: "8px",
                              marginBottom: "16px",
                            }}
                          >
                            <option value="" disabled>
                              Select State
                            </option>
                            {states.map((state) => (
                              <option key={state.StateId} value={state.StateId}>
                                {state.StateName}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-">District</label>
                          <span className="required" style={{ color: "red" }}>
                            *
                          </span>
                          <select
                            className="form-select"
                            name="DistrictId"
                            value={formData.DistrictId}
                            onChange={handleChange}
                            disabled={isDistrictDisabled}
                            style={{
                              width: "100%",
                              padding: "8px",
                              marginBottom: "16px",
                            }}
                          >
                            <option value="" disabled>
                              Select District
                            </option>
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
                        {/* )} */}

                        <div className="form-group">
                          <label className="form-label">Mandal</label>
                          <span className="required" style={{ color: "red" }}>
                            *
                          </span>
                          <input
                            className="form-control"
                            type="text"
                            name="MandalName"
                            value={formData.MandalName}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                MandalName: e.target.value,
                              }))
                            }
                            disabled={isMandalDisabled}
                            style={{
                              width: "100%",
                              padding: "8px",
                              marginBottom: "16px",
                            }}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="col-md-12">
                        <div className="form-group">
                          {/* State Dropdown */}
                          <label className="form-label">State</label>
                          <span className="required" style={{ color: "red" }}>
                            *
                          </span>
                          <select
                            className="form-select"
                            name="StateId"
                            value={formData.StateId}
                            onChange={handleChange}
                            style={{
                              width: "100%",
                              padding: "8px",
                              marginBottom: "16px",
                            }}
                          >
                            <option value="" disabled>
                              Select State
                            </option>
                            {states.map((state) => (
                              <option key={state.StateId} value={state.StateId}>
                                {state.StateName}
                              </option>
                            ))}
                          </select>
                          {formErrors.StateId && (
                            <Typography variant="caption" color="error">
                              {formErrors.StateId}
                            </Typography>
                          )}
                        </div>
                        <div className="form-group">
                          <label className="form-label">District</label>
                          <span className="required" style={{ color: "red" }}>
                            *
                          </span>
                          <select
                            className="form-select"
                            name="DistrictId"
                            value={formData.DistrictId}
                            onChange={handleChange}
                            disabled={!isEditMode && isDistrictDisabled}
                            style={{
                              width: "100%",
                              padding: "8px",
                              marginBottom: "16px",
                            }}
                          >
                            <option value="" disabled>
                              Select District
                            </option>
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

                        <div className="form-group">
                          <label className="form-label">Mandal</label>
                          <span className="required" style={{ color: "red" }}>
                            *
                          </span>
                          <select
                            className="form-select"
                            name="MandalId"
                            value={formData.MandalId}
                            onChange={handleChange}
                            disabled={!isEditMode && isMandalDisabled}
                            style={{
                              width: "100%",
                              padding: "8px",
                              marginBottom: "16px",
                            }}
                          >
                            <option value="" disabled>
                              Select Mandal
                            </option>
                            {mandal.map((m) => (
                              <option key={m.MandalId} value={m.MandalId}>
                                {m.MandalName}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Village Name Input */}
                        <div className="form-group">
                          <label className="form-label">Village</label>
                          <span className="required" style={{ color: "red" }}>
                            *
                          </span>
                          <input
                            className="form-control"
                            type="text"
                            name="VillageName"
                            value={formData.VillageName}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                VillageName: e.target.value,
                              }))
                            }
                            disabled={!isEditMode && isVillageDisabled}
                            style={{
                              width: "100%",
                              padding: "8px",
                              marginBottom: "16px",
                            }}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <DialogActions>
                    <Button onClick={handleClose} color="primary">
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      variant="contained"
                      color="primary"
                      type="submit"
                    >
                      {isEditMode ? "Update" : "Add"}{" "}
                      {/* Show different text for Add or Update */}
                    </Button>
                  </DialogActions>
                </form>
              </DialogContent>
            </Dialog>
          </div>
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
