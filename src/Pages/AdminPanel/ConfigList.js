import React, { useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ShareIcon from "@mui/icons-material/Share";
import CommonTables from "../../Commoncomponents/CommonTables";
import { formatDate } from "../../Commoncomponents/CommonComponents";
import TableContainer from "@mui/material/TableContainer";
import ConfirmationDialogDelete from "../../Components/ConfirmationDialogDelete";
import Paper from "@mui/material/Paper";
import {
  fetchData,
  fetchUpdateData,
  fetchDeleteData,
  fetchAllData,
} from "../../helpers/externapi";
import Layout from "../../Layout/Layout";
import DescriptionCell from "../../Commoncomponents/DescriptionCell";

const customStyles = {
  container: {
    padding: "20px",
    backgroundColor: "#f0f0f0",
    borderRadius: "8px",
    margin: "20px",
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
  customheight: {
    height: "15px",
    padding: "10px",
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
  header: {
    marginBottom: "10px",
    color: "#333",
  },
  addButton: {
    marginBottom: "20px",
    backgroundColor: "#4caf50",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
};

const ConfigList = (props) => {
  const [loading, setLoading] = useState(false);
  const [configValues, setConfigValues] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    ConfigValuesId: "",
    ConfigKey: "",
    ConfigValue: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [totalCount, setTotalCount] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationData, setConfirmationData] = useState({});
  const [configCount, setConfigCount] = useState({});
  const [configKeySearch, setConfigKeySearch] = useState("");
  const [configValueSearch, setConfigValueSearch] = useState("");

  let searchTimeout;

  let UserId = localStorage.getItem("UserId");

  const tableHeads = ["Config Key", "Config Value", "Actions"];

  const tableElements =
    configValues && configValues.length > 0
      ? configValues.map((configValue) => [
          <div
            className="text-start-important"
            style={{
              whiteSpace: "normal",
              textAlign: "start",
              display: "block",
            }}
          >
            {" "}
            {configValue.ConfigKey}
          </div>,
          <DescriptionCell description={configValue.ConfigValue} />,
          <div style={{ display: "flex", flexDirection: "row" }}>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => handleEdit(configValue)}
              style={{ marginRight: "8px" }}
            >
              Edit
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => handleDelete(configValue.ConfigValuesId)}
            >
              Delete
            </button>
          </div>,
        ])
      : [];

  const getConfigValues = async () => {
    try {
      const skip = (currentPage - 1) * perPage;
      const take = perPage;

      //setLoading(true);
      const eventData = await fetchData("ConfigValues/all", { skip, take });
      if (eventData && eventData.length > 0) {
        setConfigValues(eventData);
      }
    } catch (error) {
      console.error("Error fetching event data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!configKeySearch && !configValueSearch) {
      getConfigValues();
      getConfigValuesCountData();
    }
  }, [totalCount, currentPage, perPage, configKeySearch, configValueSearch]);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    let updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);
  };

  const handleEdit = (event) => {
    setIsEditMode(true);
    setFormVisible(true);
    setFormData({
      ConfigValuesId: event.ConfigValuesId,
      ConfigKey: event.ConfigKey,
      ConfigValue: event.ConfigValue,
    });
  };

  const handleAddNewEvent = () => {
    setIsEditMode(false);
    setFormVisible(true);
    setFormData({
      ConfigValuesId: "",
      ConfigKey: "",
      ConfigValue: "",
    });
  };

  const validateForm = () => {
    let errors = {};
    if (!formData.ConfigKey) errors.Configkey = "Please enter config key";
    if (!formData.ConfigValue) errors.ConfigValue = "Please enter config value";

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);

    try {
      if (isEditMode) {
        const addResponse = await fetchUpdateData("ConfigValues/update", {
          ConfigValuesId: formData.ConfigValuesId,
          ConfigKey: formData.ConfigKey,
          ConfigValue: formData.ConfigValue,
        });
        setSnackbarMessage("Config Value updated successfully!");
      } else {
        const update = await fetchData("ConfigValues/add", {
          ConfigKey: formData.ConfigKey,
          ConfigValue: formData.ConfigValue,
        });
        setSnackbarMessage("Config Value Added successfully!");
      }
      setSnackbarOpen(true);

      const refresh = await fetchAllData("Configvalues/refresh");

      await getConfigValuesCountData();
      await getConfigValues();
    } catch (error) {
      console.error("Error adding/updating event:", error);
    } finally {
      setLoading(false);
      setFormData({
        ConfigValuesId: "",
        ConfigKey: "",
        ConfigValue: "",
      });
      setIsEditMode(false);
      setFormVisible(false);
    }
  };

  const handleDelete = (configValueId) => {
    setConfirmationData({
      title: "Delete Config Value",
      message: "Are you sure you want to delete this Config Value?",
      onConfirm: () => confirmhandleDelete(configValueId),
    });
    setConfirmationOpen(true);
  };

  const confirmhandleDelete = async (configValueId) => {
    setConfirmationOpen(false);
    try {
      setLoading(true);
      await fetchDeleteData(`ConfigValues/delete/${configValueId}`);
      await getConfigValuesCountData();
      await getConfigValues();
      setSnackbarMessage("Config Value deleted Successfully");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error deleting Config Value:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await fetchData("ConfigValues/search", {
        configkey: configKeySearch,
        configValue: configValueSearch,
        take: 0,
        skip: 0,
      });

      const responseCount = await fetchData("ConfigValues/searchCount", {
        configkey: configKeySearch,
        configValue: configValueSearch,
      });

      setConfigValues(response);

      setTotalCount(responseCount.count);

    } catch (error) {
      console.error("Error fetching search data:", error);
    }

    //await fetchSearchCount();
    // try {

    //     const responseCount = await fetchData("ConfigValues/searchCount", {
    //       configkey: configKeySearch,
    //       configValue: configValueSearch,
    //     });

    //     console.log("Search Count:", responseCount);
    //     setTotalCount(responseCount?.count || 0);
    //   } catch (error) {
    //     console.error("Error fetching search count:", error);
    //   } finally {
    //     setLoading(false);
    //   }
  };

  const handleClose = () => {
    setFormVisible(false);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const getConfigValuesCountData = async () => {
    //setLoading(true);
    try {
      const eventCountData = await fetchData(
        `CommonRowCount/GetTableRowCount`,
        { tableName: "ConfigValues" }
      );
      const totalCount = eventCountData[0]?.CountOfRecords || 0;
      setTotalCount(totalCount);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching hospital count data:", error);
      setLoading(false);
    }
  };

  const handleInputChange = (setterFunction, value) => {
    setterFunction(value);

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      handleSearch();
    }, 500);
  };

  // useEffect(() => {
  //   handleSearch(); // Fetch initial data
  // }, []);
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (event) => {
    setPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1);
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
          <h2 style={customStyles.header}>Config Values List</h2>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "10px",
              flexWrap: "wrap",
            }}
          >
            <button
              className="btn btn-sm btn-success"
              onClick={handleAddNewEvent}
              style={{
                fontSize: "12px",
                padding: "5px 10px",
                whiteSpace: "nowrap",
              }}
            >
              Add Config Value
            </button>

            <div
              className="search-container"
              style={{
                display: "flex",
                gap: "8px",
                padding: "10px",
                borderRadius: "8px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <input
                type="text"
                placeholder="Search by Config Key"
                value={configKeySearch}
                onChange={(e) =>
                  handleInputChange(setConfigKeySearch, e.target.value)
                }
                style={{
                  width: "200px",
                  padding: "6px 10px",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  outline: "none",
                  fontSize: "14px",
                }}
              />
              <input
                type="text"
                placeholder="Search by Config Value"
                value={configValueSearch}
                onChange={(e) =>
                  handleInputChange(setConfigValueSearch, e.target.value)
                }
                style={{
                  width: "200px",
                  padding: "6px 10px",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  outline: "none",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>

          {/* Card Section (Table) */}
          <div className="card">
            {configValues && configValues.length > 0 && (
              <CommonTables
                tableHeads={tableHeads}
                tableData={tableElements}
                perPage={perPage}
                currentPage={currentPage}
                perPageChange={handlePerPageChange}
                pageChange={handlePageChange}
                totalCount={totalCount}
              />
            )}
          </div>

          {!loading && configValues.length === 0 && (
            <h5
              className="text-danger"
              style={{ textAlign: "center", padding: "20px" }}
            >
              There are no records to display.
            </h5>
          )}

          {/* Table Container */}
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

          {/* Dialog for Add/Edit Config Value */}
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
                  {isEditMode ? "Update Config Value" : "Add Config Value"}
                </Typography>
                <IconButton onClick={handleClose} style={{ color: "red" }}>
                  ✖
                </IconButton>
              </div>
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                {isEditMode
                  ? "Update the details of the config value."
                  : "Fill in the details of the new config value."}
              </DialogContentText>
              <form noValidate autoComplete="off" onSubmit={handleSubmit}>
                <TextField
                  name="ConfigKey"
                  label="Config Key Name"
                  value={formData.ConfigKey}
                  onChange={onChangeHandler}
                  variant="outlined"
                  size="small"
                  fullWidth
                  margin="normal"
                  error={!!formErrors.Configkey}
                  helperText={formErrors.Configkey}
                />

                <TextField
                  name="ConfigValue"
                  label="Config Value"
                  value={formData.ConfigValue}
                  onChange={onChangeHandler}
                  variant="outlined"
                  size="small"
                  fullWidth
                  margin="normal"
                  error={!!formErrors.ConfigValue}
                  helperText={formErrors.ConfigValue}
                />

                <DialogActions>
                  <Button onClick={handleClose} color="primary">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    color="primary"
                    variant="contained"
                    disabled={loading}
                  >
                    {isEditMode ? "Update" : "Add"}
                  </Button>
                </DialogActions>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}
    </Layout>
  );
};

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

export default ConfigList;
