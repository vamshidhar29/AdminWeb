import React, { useEffect, useState } from "react";
import PageWrapper from "../../Components/PageWrapper";
import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import HospitalPersonalDetails from "./HospitalPersonalDetails";
import { fetchAllData } from "../../helpers/externapi";
import Layout from "../../Layout/Layout";
import HospitalTab from "./HospitalTab"; 

export default function HospitalDetails(props) {
  const profile = props.data;

   
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [details, setDetails] = useState(null);
  const location = useLocation();
  const [navPath, setNavPath] = useState("");
  const [doctorData, setDoctorData] = useState([]);
  const [spocData, setSpocData] = useState([]);

 
  const navigate = useNavigate();

  const id = useParams();
  const { Id: hospitalId } = useParams();
 

  // Determine navigation path
  useEffect(() => {
    if (location.pathname.toLowerCase().includes("new")) {
      setNavPath("new");
    } else if (location.pathname.toLowerCase().includes("details")) {
      setNavPath("details");
    } else {
      setNavPath("list");
    }
  }, [location]);


  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const response = await fetchAllData(`Doctor/GetByHospitalId/${id.Id}`);
        setDoctorData(response);

      } catch (error) {
        console.error("Error fetching doctor data:", error);
      }
    };

    const fetchSpocData = async () => {
      try {
        const spocresponse = await fetchAllData(
          `HospitalContact/GetByHospitalId/${id.Id}`
        );
        setSpocData(spocresponse);
      } catch (error) {
        console.error("Error fetching spoc data:", error);
      }
    };

    fetchSpocData();
    fetchDoctorData();
  }, []);   

  // useEffect(() => {
  //   if (!hospitalId) return;
  //   const getHospitalDetails = async (hospitalId) => {
  //     try {
  //       setLoading(true);
  //       const hospitalData = await fetchAllData(
  //         `Hospital/GetById/${hospitalId}`
  //       );
  //       if (hospitalData && hospitalData.length > 0) {
  //         setDetails(hospitalData[0]);
  //       }
  //     } catch (error) {
  //       setError("Failed to fetch hospital details");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   console.log("Fetching hospital details for ID:", id);
  //   if (id.Id) {
  //     getHospitalDetails(id.Id);
  //   }
  // }, [ hospitalId]);

  useEffect(() => {
    if (!hospitalId) return; // ✅ Ensure hospitalId exists before fetching
  
    const getHospitalDetails = async () => {
      try {
        setLoading(true);
        const hospitalData = await fetchAllData(`Hospital/GetById/${hospitalId}`);
        if (hospitalData && hospitalData.length > 0) {
          setDetails(hospitalData[0]);
        }
      } catch (error) {
        setError("Failed to fetch hospital details");
      } finally {
        setLoading(false);
      }
    };
  
    getHospitalDetails(); // ✅ CALL THE FUNCTION
  
  }, [hospitalId]); // ✅ Dependency array to re-run when hospitalId changes

  
  
  const handleEditForm = () => {
    navigate("/hospitals/new", { state: { profile: details } });
  };

  const handleSpocNavigation = () => {
    navigate(`/hospitals/spocinfo/hospital/${hospitalId}`, {
      state: {
        spocData: spocData.length > 0 ? spocData : details?.Spocs || [],
        doctorData: doctorData.length > 0 ? doctorData : details?.Doctors || [], // ✅ Always pass doctorData
      },
    });
  };
  
  const handleDoctorNavigation = () => {
    navigate(`/hospitals/doctorinfo/hospital/${hospitalId}`, {
      state: {
        doctorData: doctorData.length > 0 ? doctorData : details?.Doctors || [],
        spocData: spocData.length > 0 ? spocData : details?.Spocs || [], // ✅ Always pass spocData
      },
    });
  };
  
  

  return (
    <Layout>
      <PageWrapper loading={loading} error={error}>
        <>
          <div className="text-center bg-white p-2 m-1">
            <div className="d-flex flex-row justify-content-between align-items-center">
              <div className="d-flex flex-row justify-content-start align-items-center">
                <button
                  onClick={handleEditForm}
                  className="btn btn-md btn-primary me-2 me-md-4"
                >
                  Edit
                </button>
                <span className="nav-item">
                  <Link className="nav-link" to={`/hospitals/list`}>
                    <i className="bx bx-user me-1"></i>&nbsp;List
                  </Link>
                </span>
              </div>

              {/* <div className="d-flex border-bottom mb-3">
                <button
                  className="btn btn-success me-2"
                  onClick={handleSpocNavigation}
                >
                  SPOC Info
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleDoctorNavigation}
                >
                  Doctor Info
                </button>
              </div> */}
            </div>
            

            <h5 className="fw-bold py-1 mb-1 text-md-end">
              Hospitals Management
            </h5>
          </div>

          {details ? (
            <div id="detail">
              <HospitalPersonalDetails data={details} />
            </div>
          ) : loading ? (
            <div className="d-flex flex-row justify-content-center pt-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="text-center mt-5">
              <h4 className="text-danger">Hospital Not Available</h4>
            </div>
          )}
        </>
      </PageWrapper>
    </Layout>
  );
}
