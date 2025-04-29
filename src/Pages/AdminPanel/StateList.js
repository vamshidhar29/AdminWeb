import React, { useEffect, useState } from "react";
import {
  fetchData,
  fetchUpdateData,
  fetchDeleteData,
} from "../../helpers/externapi";
import { Tabs, Tab, Box } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CommonTables from "../../Commoncomponents/CommonTables";
import TableContainer from "@mui/material/TableContainer";
import ConfirmationDialogDelete from "../../Components/ConfirmationDialogDelete";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Layout from "../../Layout/Layout";

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
  const [states, setStates] = useState([]);
  const [stateDropdown, setStatesDropdown] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formType, setFormType] = useState("state"); // 'state' or 'district'
  const [formData, setFormData] = useState({
    StateId: "",
    StateName: "",
    DistrictId: "",
    DistrictName: "",
  });
  const [totalCountDistrict, setTotalCountDistrict] = React.useState(0);
  const [currentPageDistrict, setCurrentPageDistrict] = React.useState(1);
  const [perPageDistrict, setPerPageDistrict] = React.useState(10);
  const [totalCountState, setTotalCountState] = React.useState(0);
  const [currentPageState, setCurrentPageState] = React.useState(1);
  const [perPageState, setPerPageState] = React.useState(10);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationData, setConfirmationData] = useState({});

  const [activeSection, setActiveSection] = useState("states");
  const [searchLoading, setSearchLoading] = useState(false);
  const [input, setInput] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [districtInput, setDistrictInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState("");

  const [districtFilterCriteria, setDistrictFilterCriteria] = useState([]);
  const [stateFilterCriteria, setStateFilterCriteria] = useState([]);
  const [isDisableApply, setIsDisableApply] = useState(true);

  const tableHeadsState = ["State Name", "Actions"];
  const tableHeadsDistrict = ["District Name", "State Name", "Actions"];

  const tableElementsState =
    states.length > 0
      ? states.map((state) => [
          state.StateName,
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              style={{ marginRight: "10px" }}
              onClick={() => handleEdit(state, "state")}
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
              onClick={() => handleDelete(state.StateId, "state")}
            >
              Delete
            </Button>
          </div>,
        ])
      : [];

  const tableElementsDistrict =
    districts.length > 0
      ? districts.map((district) => [
          district.DistrictName,
          district.StateName,
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              style={{ marginRight: "10px" }}
              onClick={() => handleEdit(district, "district")}
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
              onClick={() => handleDelete(district.DistrictId, "district")}
            >
              Delete
            </Button>
          </div>,
        ])
      : [];

  const getStates = async () => {
    try {
      const skip = (currentPageState - 1) * perPageState;
      const take = perPageState;

      let statesData;

      setLoading(true);
      if (stateFilterCriteria.length > 0) {
        statesData = await fetchData("States/filter", {
          skip,
          take,
          filter: stateFilterCriteria,
        });
      } else {
        statesData = await fetchData("States/all", { skip, take });
      }
      setStates(statesData);
    } catch (error) {
      console.error("Error fetching states data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getStateDropdown = async () => {
      try {
        setLoading(true);

        const statesData = await fetchData("States/all", { skip: 0, take: 0 });
        setStatesDropdown(statesData);
      } catch (error) {
        console.error("Error fetching states data:", error);
      } finally {
        setLoading(false);
      }
    };
    getStateDropdown();
  }, []);

  const getDistricts = async () => {
    try {
      const skip = (currentPageDistrict - 1) * perPageDistrict;
      const take = perPageDistrict;

      let districtsData;

      setLoading(true);

      if (districtFilterCriteria.length > 0) {
        districtsData = await fetchData("Districts/filter", {
          skip,
          take,
          filter: districtFilterCriteria,
        });
      } else {
        districtsData = await fetchData("Districts/all", { skip, take });
      }
      setDistricts(districtsData);
    } catch (error) {
      console.error("Error fetching district data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStates();
    getDistricts();
  }, [
    currentPageDistrict,
    perPageDistrict,
    stateFilterCriteria,
    districtFilterCriteria,
    currentPageState,
    perPageState,
  ]);

  useEffect(() => {
    getDistrictCountData();
    getStateCountData();
  }, []);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEdit = (item, type) => {
    setIsEditMode(true);
    setFormVisible(true);
    setFormType(type);
    if (type === "state") {
      setFormData({
        StateId: item.StateId,
        StateName: item.StateName,
        DistrictId: "",
        DistrictName: "",
      });
    } else {
      setFormData({
        StateId: item.StateId,
        StateName: "",
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
    setFormType(type);
    setFormData({
      StateId: "",
      StateName: "",
      DistrictId: "",
      DistrictName: "",
    });
  };

  const validateForm = () => {
    let valid = true;
    const errors = {};

    if (formType === "state") {
      if (!formData.StateName.trim()) {
        errors.StateName = "Please enter State Name";
        valid = false;
      }
    } else {
      if (!formData.StateId) {
        errors.StateId = "Please select State";
        valid = false;
      }
      if (!formData.DistrictName.trim()) {
        errors.DistrictName = "Please enter District Name";
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
        if (formType === "state") {
          if (isEditMode) {
            await fetchUpdateData("States/update", {
              stateId: formData.StateId,
              stateName: formData.StateName,
            });
            setSnackbarMessage("State updated successfully!");
          } else {
            await fetchData("States/add", {
              stateName: formData.StateName,
            });
            setSnackbarMessage("State added successfully!");
          }
          setSnackbarOpen(true);
          await getStates();
        } else {
          if (isEditMode) {
            await fetchUpdateData("Districts/update", {
              districtId: formData.DistrictId,
              districtName: formData.DistrictName,
              stateId: formData.StateId,
            });
            setSnackbarMessage("District updated successfully!");
          } else {
            await fetchData("Districts/add", {
              districtName: formData.DistrictName,
              stateId: formData.StateId,
            });
            setSnackbarMessage("District added successfully!");
          }
          setSnackbarOpen(true);
          await getDistricts();
        }
        setFormVisible(false);
        setFormData({
          StateId: "",
          StateName: "",
          DistrictId: "",
          DistrictName: "",
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
      title: "Delete State Or District",
      message: "Are you sure you want to delete this State or District?",
      onConfirm: () => confirmhandleDelete(id, type),
    });
    setConfirmationOpen(true);
  };

  const confirmhandleDelete = async (id, type) => {
    try {
      setLoading(true);
      setConfirmationOpen(false);
      if (type === "state") {
        await fetchDeleteData(`States/delete/${id}`);
        await getStates();
        setSnackbarMessage("State deleted Successfully");
        setSnackbarOpen(true);
      } else {
        await fetchDeleteData(`Districts/delete/${id}`);
        await getDistricts();
        setSnackbarMessage("District deleted Successfully");
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

  const getDistrictCountData = async () => {
    setLoading(true);
    try {
      const districtCountData = await fetchData(
        `CommonRowCount/GetTableRowCount`,
        { tableName: "District" }
      );
      const totalCount = districtCountData[0]?.CountOfRecords || 0;
      setTotalCountDistrict(totalCount);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching hospital count data:", error);
      setLoading(false);
    }
  };

  const getStateCountData = async () => {
    setLoading(true);
    try {
      const stateCountData = await fetchData(
        `CommonRowCount/GetTableRowCount`,
        { tableName: "State" }
      );
      const totalCount = stateCountData[0]?.CountOfRecords || 0;
      setTotalCountState(totalCount);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching hospital count data:", error);
      setLoading(false);
    }
  };

  const handlePageChangeDistrict = (event, page) => {
    setCurrentPageDistrict(page);
  };

  const handlePerPageChangeDistrict = (event) => {
    setPerPageDistrict(parseInt(event.target.value, 10));
    setCurrentPageDistrict(1);
  };

  const handlePageChangeState = (event, page) => {
    setCurrentPageState(page);
  };

  const handlePerPageChangeState = (event) => {
    setPerPageState(parseInt(event.target.value, 10));
    setCurrentPageState(1);
  };

  const handleInputChange = async (event) => {
    const value = event.target.value;
    setInput(value);

    if (value.length > 0) {
      const filterCriteria = [];

      filterCriteria.push({
        key: "StateName",
        value: value,
        operator: "LIKE",
      });

      setSearchLoading(true);
      setError("");
      try {
        const distributorCountData = await fetchData(
          `CommonRowCount/GetTableRowCount`,
          { tableName: "State", filter: filterCriteria }
        );

        const totalCount = distributorCountData[0]?.CountOfRecords || 0;
        setTotalCountState(totalCount);

                const suggestionData = await fetchData("States/filter", {
                    skip: 0,
                    take: perPageState,
                    filter: filterCriteria
                });

        setStates(suggestionData);

        setStateFilterCriteria(filterCriteria);
      } catch (error) {
        console.error(error);
      } finally {
        setSearchLoading(false);
      }
    } else {
      setSuggestions([]);
      setStateFilterCriteria([]);

      await getStates();
      await getStateCountData();
    }
  };

  const clearSearch = async () => {
    setInput("");
    setStateFilterCriteria([]);

    getStates();
    getStateCountData();
  };

  useEffect(() => {
    if (selectedState === "" && districtInput === "") {
      setIsDisableApply(true);
    } else {
      setIsDisableApply(false);
    }
  }, [selectedState, districtInput]);

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
    if (districtInput) {
      filterCriteria.push({
        key: "DistrictName",
        value: districtInput,
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
        { tableName: "District", filter: filterCriteria }
      );

      const totalCount = distributorCountData[0]?.CountOfRecords || 0;
      setTotalCountDistrict(totalCount);

      const suggestionData = await fetchData("Districts/filter", {
        skip: 0,
        take: perPageState,
        filter: filterCriteria,
      });

            setDistrictFilterCriteria(filterCriteria);
            setDistricts(suggestionData);

        } catch (error) {
            setError('Failed to fetch suggestions.');
            setSuggestions([]);
            console.error('Error fetching district data:', error);
        } finally {
            setLoading(false);
        }
    };


  const handleClear = async () => {
    setSelectedState("");
    setDistrictInput("");

    setDistrictFilterCriteria([]);

    await getDistricts();
    await getDistrictCountData();
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
                  activeSection === "states"
                    ? customStyles.activeButton
                    : customStyles.inactiveButton
                }
                onClick={() => setActiveSection("states")}
              >
                States
              </Button>
              <Button
                variant="contained"
                style={
                  activeSection === "districts"
                    ? customStyles.activeButton
                    : customStyles.inactiveButton
                }
                onClick={() => setActiveSection("districts")}
              >
                Districts
              </Button>
            </Box>

            {activeSection === "states" && (
              <div>
                {/* State List Header */}
                <h2 style={{ ...customStyles.header, marginBottom: "5px" }}>
                  State List
                </h2>

                {/* Search & Add State Container */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px", // Reduced from 20px to 10px
                    marginBottom: "5px", // Reduced from 10px to 5px
                  }}
                >
                  {/* Search Input */}
                  <div
                    style={{
                      position: "relative",
                      maxWidth: "250px",
                      flexGrow: 1,
                    }}
                  >
                    <input
                      type="text"
                      id="search-input"
                      className="form-control"
                      style={{
                        width: "100%",
                        height: "38px", // Reduced height slightly
                        fontSize: "14px",
                        paddingLeft: "10px",
                      }}
                      maxLength="50"
                      value={input}
                      onChange={handleInputChange}
                      placeholder="Enter State Name"
                    />
                    {input && (
                      <i
                        className="fas fa-times-circle"
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          fontSize: "16px",
                          color: "red",
                          cursor: "pointer",
                        }}
                        onClick={clearSearch}
                      ></i>
                    )}
                    {searchLoading && (
                      <div
                        style={{
                          position: "absolute",
                          right: "40px",
                          top: "50%",
                          transform: "translateY(-50%)",
                        }}
                      >
                        <div
                          className="spinner-border text-primary"
                          role="status"
                          style={{ width: "1.5rem", height: "1.5rem" }}
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Add State Button */}
                  {/* <StyledButton
        variant="contained"
        color="primary"
        onClick={() => handleAddNew("state")}
        style={{
          height: "38px", // Reduced height slightly
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 12px", // Slightly reduced padding
          fontSize: "14px",
          marginTop:"18px"
        }}
      >
        Add State
      </StyledButton> */}
                  <button
                    className="btn btn-secondary mt-2 "
                    onClick={() => handleAddNew("state")}
                    style={{
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#28a745",
                      fontSize: "14px",
                    }}
                  >
                    Add state
                  </button>
                </div>

                <div className="card">
                  {states && states.length > 0 && (
                    <CommonTables
                      tableHeads={tableHeadsState}
                      tableData={tableElementsState}
                      perPage={perPageState}
                      currentPage={currentPageState}
                      perPageChange={handlePerPageChangeState}
                      pageChange={handlePageChangeState}
                      totalCount={totalCountState}
                    />
                  )}
                </div>

                {/* No Records Message */}
                {!loading && states.length === 0 && (
                  <h5
                    className="text-danger"
                    style={{ textAlign: "center", padding: "10px" }}
                  >
                    There are no records to display.
                  </h5>
                )}
              </div>
            )}

            {activeSection === "districts" && (
              <div>
                <h2 style={customStyles.header}>District List</h2>

                <div className="row align-items-end">
                  <div className="col-md-3 mb-2">
                    <select
                      id="state-select"
                      className="form-select"
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      style={{ height: "40px" }}
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
                    <input
                      type="text"
                      id="district-input"
                      placeholder="Enter District Name "
                      className="form-control"
                      maxLength="50"
                      value={districtInput}
                      onChange={(e) => setDistrictInput(e.target.value)}
                      style={{ height: "40px" }}
                    />
                  </div>

                  <div className="col-md-4  d-flex" style={{ gap: "10px" }}>
                    <button
                      className="btn btn-primary mt-2"
                      onClick={handleApply}
                      disabled={isDisableApply}
                      style={{
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "8px",
                      }}
                    >
                      Apply
                    </button>

                    <button
                      className="btn btn-secondary mt-2"
                      onClick={handleClear}
                      style={{
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: "20px",
                      }}
                    >
                      Clear
                    </button>

                    <button
                      className="btn btn-secondary mt-2 "
                      onClick={() => handleAddNew("district")}
                      style={{
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#28a745",
                      }}
                    >
                      Add District
                    </button>
                  </div>
                </div>

                <div className="card">
                  {districts && districts.length > 0 && (
                    <CommonTables
                      tableHeads={tableHeadsDistrict}
                      tableData={tableElementsDistrict}
                      perPage={perPageDistrict}
                      currentPage={currentPageDistrict}
                      perPageChange={handlePerPageChangeDistrict}
                      pageChange={handlePageChangeDistrict}
                      totalCount={totalCountDistrict}
                    />
                  )}
                </div>

                {!loading && districts.length === 0 && (
                  <h5
                    className="text-danger"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    There are no records to display.
                  </h5>
                )}
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
                      ? formType === "state"
                        ? "Update State"
                        : "Update District"
                      : formType === "state"
                      ? "Add State"
                      : "Add District"}
                  </Typography>
                  <IconButton onClick={handleClose} style={{ color: "red" }}>
                    ✖
                  </IconButton>
                </div>
              </DialogTitle>
              <DialogContent>
                <DialogContentText>
                  {isEditMode
                    ? formType === "state"
                      ? "Update the details of the state."
                      : "Update the details of the district."
                    : formType === "state"
                    ? "Fill in the details of the new state."
                    : "Fill in the details of the new district."}
                </DialogContentText>
                <form noValidate autoComplete="off">
                  {formType === "state" ? (
                    <TextField
                      name="StateName"
                      label="State Name"
                      value={formData.StateName}
                      onChange={onChangeHandler}
                      variant="outlined"
                      size="small"
                      fullWidth
                      margin="normal"
                      error={!!formErrors.StateName}
                      helperText={formErrors.StateName}
                    />
                  ) : (
                    <>
                      <div className="col-md-12">
                        <div className="form-group">
                          <label className="form-label">State</label>
                          <span className="required" style={{ color: "red" }}>
                            {" "}
                            *
                          </span>
                          <select
                            className="form-select"
                            name="StateId"
                            value={formData.StateId}
                            onChange={onChangeHandler}
                            style={{
                              width: "100%",
                              padding: "8px",
                              marginBottom: "16px",
                            }}
                            error={!!formErrors.StateId}
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
                      </div>
                      <TextField
                        name="DistrictName"
                        label="District Name"
                        value={formData.DistrictName}
                        onChange={onChangeHandler}
                        variant="outlined"
                        size="small"
                        fullWidth
                        margin="normal"
                        error={!!formErrors.DistrictName}
                        helperText={formErrors.DistrictName}
                      />
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
                      {isEditMode ? "Update" : "Add"}
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
