import React, { useState, useEffect,useRef } from "react";
import { fetchData, fetchAllData } from "../../helpers/externapi";
import { Button, Spinner } from "react-bootstrap";
import Layout from "../../Layout/Layout";
import { MultiSelect } from "react-multi-select-component";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";


export default function UserArea() {
  const UserId = localStorage.getItem("UserId");
  const isFetching = useRef(false); 

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    MandalId: "",
    VillageId: [],
    StateId: "",
    DistrictId: "",
  });
  const [mandals, setMandals] = useState([]);
  const [villages, setVillages] = useState([]);
  const [districtDropdown, setDistrictDropdown] = useState([]);
  const [stateDropdown, setStateDropdown] = useState([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState(null);
  const [selectedStateId, setSelectedStateId] = useState(null);
  const [isFormDisabled, setIsFormDisabled] = useState(true); 
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [rmOptions, setRmOptions] = useState([]);
  const [selectedRm, setSelectedRm] = useState("");

 
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

  useEffect(() => {
    const getMandals = async () => {
      if (selectedDistrictId) {
        const mandalsData = await fetchAllData(
          `Mandal/GetMandalsByDistrictId/${selectedDistrictId}`
        );
        setMandals(mandalsData);
        setLoading(false);
      }
    };
    getMandals();
  }, [selectedDistrictId]);

 
  useEffect(() => {
    const getVillages = async () => {
      if (formData.MandalId) {
        const villagesData = await fetchAllData(
          `Village/GetVillagesByMandalId/${formData.MandalId}`
        );
        setVillages(villagesData);
        setLoading(false);
      }
    };
    getVillages();
  }, [formData.MandalId]);


  useEffect(() => {
    const getRegionalManagers = async () => {
      if (isFetching.current) return;
      isFetching.current = true;

      try {
        const usersData = await fetchAllData(`lambdaAPI/Employee/GetRMNames`);
        setRmOptions(
          usersData?.map((user) => ({
            label: user.UserName,
            value: user.UserId,
          })) || []
        );
      } catch (error) {
        console.error("Error fetching RMs:", error);
      } finally {
        setLoading(false);
        isFetching.current = false;
      }
    };

    getRegionalManagers();
  }, []);

  const villageOptions = villages.map((village) => ({
    label: village.VillageName,
    value: village.VillageId,
  }));
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = mediaQueryStyle;
    document.head.appendChild(style);
  
    return () => {
      document.head.removeChild(style); // Cleanup on component unmount
    };
  }, []);
  const handleSubmit = async () => {
    const data = formData.VillageId.length
      ? formData.VillageId.map((villageId) => ({
          StateId: formData.StateId,
          UserId: selectedRm, 
          DistrictId: formData.DistrictId,
          MandalId: formData.MandalId,
          VillageId: villageId,
          CreatedBy: UserId,
        }))
      : [
          {
            StateId: formData.StateId,
            UserId: selectedRm,
            DistrictId: formData.DistrictId,
            MandalId: formData.MandalId,
            VillageId: formData.VillageId,
            CreatedBy: UserId,
          },
        ];

    try {
      await fetchData("RouteAssigning/seed", data);
      setSnackbarMessage("User Area added successfully!");
      setSnackbarOpen(true);

      setFormData({
        MandalId: "",
        VillageId: [],
        StateId: "",
        DistrictId: "",
      });
      setSelectedDistrictId(null);
      setSelectedStateId(null);
      setMandals([]);
      setVillages([]);
      setSelectedRm("");
      setIsFormDisabled(true);
    } catch (error) {
      console.error("Error assigning area:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleSnackbarClose = (_, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  const isSubmitDisabled = !formData.StateId || !formData.DistrictId;

  return (
    <Layout>
    <div className="container my-5">
      {/* Updated header with background color and white text */}
      <div
  className="p-4 rounded-3 mb-4 mx-auto"
  style={{ backgroundColor: "#0D47A1", maxWidth: "600px" }} // Adjust width as needed
>
  <h3 className="text-center mb-0 fw-bold text-white">
    <i className="fas fa-map-marker-alt me-2"></i>Assign Area to Users
  </h3>
</div>

  
      <div className="row justify-content-center">
        <div className="col-md-8 col-sm-10 col-12">
          <div className="card shadow-lg border-0 rounded-3" style={{ borderTop: "4px solid #1976D2" }}>
            <div className="card-body p-4">
              {/* Regional Manager */}
              <div className="mb-4">
                <label className="form-label fw-semibold" style={{ color: "#0D47A1" }}>
                 Regional Manager
                </label>
                <div className="input-group">
                  <span className="input-group-text" style={{ backgroundColor: "#1976D2", color: "white" }}>
                    <i className="fas fa-search"></i>
                  </span>
                  <select
                    className="form-select form-select-lg"
                    value={selectedRm}
                    onChange={(e) => {
                      setSelectedRm(e.target.value);
                      setIsFormDisabled(false);
                    }}
                    disabled={loading}
                    style={{
                      borderColor: "#1976D2",
                      boxShadow: "none",
                      borderRadius: "0 8px 8px 0"
                    }}
                  >
                    <option value="">Select User</option>
                    {rmOptions.map((rm) => (
                      <option key={rm.value} value={rm.value}>{rm.label}</option>
                    ))}
                  </select>
                </div>
              </div>
  
              {/* State */}
              <div className="mb-4">
                <label className="form-label fw-semibold" style={{ color: "#0D47A1" }}>
                  State
                </label>
                <div className="input-group">
                  <span className="input-group-text" style={{ backgroundColor: "#1976D2", color: "white" }}>
                    <i className="fas fa-map"></i>
                  </span>
                  <select
                    className="form-select form-select-lg shadow-none"
                    value={formData.StateId}
                    onChange={(e) => {
                      setFormData({ ...formData, StateId: e.target.value });
                      setSelectedStateId(e.target.value);
                    }}
                    disabled={isFormDisabled}
                    style={{
                      borderColor: "#1976D2",
                      borderRadius: "0 8px 8px 0"
                    }}
                  >
                    <option value="">Select State</option>
                    {stateDropdown.map((state) => (
                      <option key={state.StateId} value={state.StateId}>{state.StateName}</option>
                    ))}
                  </select>
                </div>
              </div>
  
              {/* District */}
              <div className="mb-4">
                <label className="form-label fw-semibold" style={{ color: "#0D47A1" }}>
                 District
                </label>
                <div className="input-group">
                  <span className="input-group-text" style={{ backgroundColor: "#1976D2", color: "white" }}>
                    <i className="fas fa-building"></i>
                  </span>
                  <select
                    className="form-select form-select-lg shadow-none"
                    value={formData.DistrictId}
                    onChange={(e) => {
                      setFormData({ ...formData, DistrictId: e.target.value });
                      setSelectedDistrictId(e.target.value);
                      setMandals([]);
                      setVillages([]);
                    }}
                    disabled={loading || !formData.StateId || isFormDisabled}
                    style={{
                      borderColor: "#1976D2",
                      borderRadius: "0 8px 8px 0"
                    }}
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
              
              {/* Mandal */}
              <div className="mb-4">
                <label className="form-label fw-semibold" style={{ color: "#0D47A1" }}>
                  Mandal
                </label>
                <div className="input-group">
                  <span className="input-group-text" style={{ backgroundColor: "#1976D2", color: "white" }}>
                    <i className="fas fa-map-pin"></i>
                  </span>
                  <select
                    className="form-select form-select-lg shadow-none"
                    value={formData.MandalId}
                    onChange={(e) => setFormData({ ...formData, MandalId: e.target.value })}
                    disabled={loading || !formData.DistrictId || isFormDisabled}
                    style={{
                      borderColor: "#1976D2",
                      borderRadius: "0 8px 8px 0"
                    }}
                  >
                    <option value="">Select Mandal</option>
                    {mandals.map((mandal) => (
                      <option key={mandal.MandalId} value={mandal.MandalId}>{mandal.MandalName}</option>
                    ))}
                  </select>
                </div>
              </div>
  
              {/* Village */}
              <div className="mb-4">
                <label className="form-label fw-semibold" style={{ color: "#0D47A1" }}>
                 Village
                </label>
                <div className="input-group">
                  <span className="input-group-text" style={{ backgroundColor: "#1976D2", color: "white" }}>
                    <i className="fas fa-list"></i>
                  </span>
                  <div style={{ flex: 1 }}>
                    <MultiSelect
                      isMulti
                      options={villageOptions}
                      value={formData.VillageId.map((villageId) => {
                        const village = villages.find((v) => v.VillageId === villageId);
                        return village ? { label: village.VillageName, value: villageId } : null;
                      }).filter(Boolean)}
                      onChange={(selected) => {
                        setFormData((prevData) => ({
                          ...prevData,
                          VillageId: selected.map(item => item.value),
                        }));
                      }}
                      isDisabled={loading || !formData.MandalId || isFormDisabled}
                      closeMenuOnSelect={false}
                      placeholder="Select Village"
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          borderRadius: '0 8px 8px 0',
                          border: '1px solid #1976D2',
                          borderLeft: 'none',
                          minHeight: '48px',
                          boxShadow: 'none'
                        }),
                        multiValue: (provided) => ({
                          ...provided,
                          backgroundColor: '#1976D2',
                          borderRadius: '4px',
                        }),
                        multiValueLabel: (provided) => ({...provided, color: 'white'}),
                        multiValueRemove: (provided) => ({
                          ...provided,
                          color: 'white',
                          ':hover': { backgroundColor: '#0D47A1' }
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          backgroundColor: state.isSelected ? '#1976D2' : 'white',
                          color: state.isSelected ? 'white' : 'black',
                          ':hover': { backgroundColor: '#e3f2fd' }
                        })
                      }}
                      getOptionLabel={(e) => (
                        <div className="d-flex align-items-center p-1">
                          <input
                            type="checkbox"
                            checked={formData.VillageId.includes(e.value)}
                            onChange={() => {}}
                            className="form-check-input"
                            style={{borderColor: "#1976D2"}}
                            disabled={loading || !formData.MandalId || isFormDisabled}
                          />
                          <label className="ms-2 mb-0">{e.label}</label>
                        </div>
                      )}
                    />
                  </div>
                </div>
              </div>
  
              {/* Submit Button */}
              <div className="d-grid mt-4">
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={loading || isSubmitDisabled}
                  className="btn-lg py-3 fw-semibold text-white"
                  style={{
                    backgroundColor: '#0D47A1',
                    borderColor: '#0D47A1',
                    boxShadow: '0 4px 6px rgba(25, 118, 210, 0.3)'
                  }}
                >
                  {loading ? (
                    <div className="d-flex align-items-center justify-content-center">
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Processing...
                    </div>
                  ) : (
                    <>Assign Area</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Snackbar
      open={snackbarOpen}
      autoHideDuration={6000}
      onClose={handleSnackbarClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert 
        onClose={handleSnackbarClose} 
        severity="success"
        sx={{
          width: '100%',
          boxShadow: '0 4px 6px rgba(25, 118, 210, 0.3)',
          borderRadius: '8px',
          backgroundColor: '#1976D2',
          color: 'white'
        }}
      >
        <i className="fas fa-check-circle me-2"></i>{snackbarMessage}
      </Alert>
    </Snackbar>
  </Layout>
  );
}

const mediaQueryStyle = `
  @media (max-width: 767px) {
    .container {
      padding: 0; 
      margin-top: 0; 
    }
    .card {
      width: 100%; 
      margin: 0;   
      padding: 15px;
    }
    .row {
      margin-top: 0;
      height: 100%; 
    }
    .col-md-8 {
      width: 100% !important; 
    }
    .form-select, .btn {
      font-size: 14px; 
    }
    .d-grid {
      margin-top: 20px; 
    }
  }
`;
