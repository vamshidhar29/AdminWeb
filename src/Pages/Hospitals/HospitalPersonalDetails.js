import React, { useEffect, useState } from "react";
import { fetchData, fetchAllData } from "../../helpers/externapi";
import MapBoxHospital from "../../Components/MapBoxHospital";
import { async } from "validate.js";

export default function HospitalPersonalDetails(props) {
  const profile = props.data;
  const [mocUrl, setMocUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [doctorData, setDoctorData] = useState([]);
  const [spocData, setSpocData] = useState([]);
  const [hospitalPolicies, setHospitalPolicies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("")


  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const response = await fetchAllData(
          `Doctor/GetByHospitalId/${profile.HospitalId}`
        );
        setDoctorData(response);
      } catch (error) {
        console.error("Error fetching doctor data:", error);
      }
    };

    const fetchSpocData = async () => {
      try {
        const spocresponse = await fetchAllData(`HospitalContact/GetByHospitalId/${profile.HospitalId}`);
        setSpocData(spocresponse);
      } catch (error) {
        console.error("Error fetching spoc data:", error);
      }
    }


    fetchSpocData();
    fetchDoctorData();
  }, []);

  useEffect(() => {
    const fetchHospitalPoliciesData = async () => {
      try {
        const response = await fetchAllData(
          `HospitalPoliciesProvision/GetByHospitalId/${profile.HospitalId}`
        );
        setHospitalPolicies(response);
      } catch (error) {
        console.error("Error fetching doctor data:", error);
      }
    };
    fetchHospitalPoliciesData();
  }, []);

  useEffect(() => {
    const getMocUrl = async () => {
      const response = await fetchData('ConfigValues/all', { skip: 0, take: 0 });
      const bucketUrl = response && response.length > 0 && response.find(val => val.ConfigKey === "mouBucketURL");
      const imageUrl = response && response.length > 0 && response.find(val => val.ConfigKey === "hospitalImagesURL");
      setMocUrl(bucketUrl.ConfigValue);
      setImageUrl(imageUrl.ConfigValue);
    };

    getMocUrl();
  }, []);

  const handleUpdateLocation = async () => {
    try {
      const response = await fetchData('Geocoding/forward', { hospitalId: profile.HospitalId });
      window.location.reload();
    } catch (error) {
      console.error("Error fetching location data: ", error);
    }
  };


  const hospitalImages = profile.HospitalImages;



  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? hospitalImages.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === hospitalImages.length - 1 ? 0 : prevIndex + 1
    );
  };
  const getPlaceholderImage = (id) => {
    return id % 2 === 0
      ? "/assets/img/avatars/doctor (1).png" // Even IDs
      : "/assets/img/avatars/doctor.png"; // Odd IDs
  };


  return (


    <>
      <div className="row mt-2 align-items-stretch mb-1">
        <div className="col-12 col-md-8 mb-0">
          <div className="card p-2 p-md-3 h-100 d-flex flex-column">
            <div className="d-flex flex-row justify-content-start align-items-center">
              {profile.Image ? (
                <img
                  src={`${imageUrl}${profile.Image}`}
                  alt=""
                  style={{
                    height: "100px",
                    width: "120px",
                    borderRadius: "10px",
                  }}
                />
              ) : (
                <img
                  src={`${process.env.PUBLIC_URL}/assets/hospitaldummyimage.jpg`}
                  alt=""
                  style={{ height: "100px", width: "120px" }}
                />
              )}

              <div className="d-flex flex-column ms-1 ms-sm-3 ms-md-4">
                <div className="d-flex flex-row align-items-center">
                  <i className="fas fa-phone me-2 text-dark"></i>
                  {profile.HospitalMobileNumber ? (
                    <a href={`tel:${profile.HospitalMobileNumber}`}>
                      {profile.HospitalMobileNumber}
                    </a>
                  ) : (
                    <span className="text-danger">Not exist</span>
                  )}
                </div>

                <div className="d-flex flex-row align-items-center">
                  <i className="fa-solid fa-blender-phone me-2 text-dark"></i>
                  {profile.Landline ? (
                    <a href={`tel:${profile.Landline}`}>{profile.Landline}</a>
                  ) : (
                    <span className="text-danger">Not exist</span>
                  )}
                </div>

                <div className="d-flex flex-row flex-wrap align-items-center">
                  <i className="fas fa-envelope me-2 text-dark"></i>
                  {profile.Email ? (
                    <a href={`mailto:${profile.Email}`}>{profile.Email}</a>
                  ) : (
                    <span className="text-danger">Not exist</span>
                  )}
                </div>
              </div>
            </div>

            <h5 className="text-dark fw-semibold my-3 fs-4">
              {profile.HospitalName}
            </h5>

            <div className="d-flex flex-row align-items-center flex-wrap">
              {profile.City && (
                <div className="d-flex flex-row align-items-center me-4 me-md-5 mb-2">
                  <i className="fa-solid fa-location-dot me-2 text-dark"></i>{" "}
                  {profile.City}
                </div>
              )}

              {profile.Pincode && (
                <div className="d-flex flex-row align-items-center me-4 me-md-5 mb-2">
                  <i className="fas fa-thumbtack me-2 text-dark"></i>{" "}
                  {profile.Pincode}
                </div>
              )}

              {profile.Website && (
                <div className="d-flex flex-row align-items-center mb-2">
                  <i className="fas fa-globe me-2 text-dark"></i>
                  <a
                    href={profile.Website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Hospital Website
                  </a>
                </div>
              )}
            </div>

            <div className="d-flex flex-row align-items-center flex-wrap">
              {profile.Mandal && (
                <div className="d-flex flex-row align-items-center me-4 me-md-5 mb-2">
                  <strong className="me-1 text-dark">Mandal:</strong>{" "}
                  {profile.Mandal}
                </div>
              )}
              {profile.HospitalCode && (
                <div className="d-flex flex-row align-items-center me-4 me-md-5 mb-2">
                  <strong className="me-1 text-dark">Code:</strong>{" "}
                  {profile.HospitalCode}
                </div>
              )}
              {profile.Specialization && (
                <div className="d-flex flex-row align-items-center mb-2">
                  <strong className="me-1 text-dark">Specialization:</strong>{" "}
                  {profile.Specialization}
                </div>
              )}
            </div>

            {profile.AddressLine1 && (
              <div className="d-flex flex-row mb-2">
                <strong className="me-1 text-dark">Address:</strong>{" "}
                {profile.AddressLine1}
              </div>
            )}
          </div>
        </div>

        <div className="col-12 col-md-4 mb-0">
          <div className="card h-100 d-flex flex-column">
            {profile.Latitude && profile.Longitude ? (
              <MapBoxHospital hospitalsData={[profile]} />
            ) : (
              <>
                <h5
                  className="ps-2 ps-md-3 pt-2 pt-md-3 m-0 fw-semibold"
                  style={{ color: "#008000" }}
                >
                  Location Coordinates
                </h5>
                <hr className="mb-0" />
                <span className="text-danger text-center mt-md-5">
                  Please update location coordinates
                </span>
                <div className="align-self-center">
                  <button
                    className="btn btn-primary"
                    onClick={() => handleUpdateLocation()}
                  >
                    Update Location
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* <div className="container-fluid">
        <div className="d-flex border-bottom mb-3">
  <button
    onClick={() => setActiveTab("spocInfo")}
    className={`btn px-4 py-2 me-2 ${
      activeTab === "spocInfo"
        ? "btn-success text-white fw-bold shadow-sm"
        : "btn-outline-success"
    }`}
    style={{ minWidth: "150px", borderRadius: "8px" }}
  >
    SPOC
  </button>
  <button
    onClick={() => setActiveTab("doctorInfo")}
    className={`btn px-4 py-2 ${
      activeTab === "doctorInfo"
        ? "btn-primary text-white fw-bold shadow-sm"
        : "btn-outline-primary"
    }`}
    style={{ minWidth: "150px", borderRadius: "8px" }}
  >
    Doctors
  </button>
</div> */}

        {/* <div className="tab-content w-100">
 
  {activeTab === "spocInfo" && (
    <div className="card shadow border-0 rounded-3 p-3 h-100">
      <h5 className="text-success fw-bold mb-3">SPOC INFORMATION</h5>
      {spocData && spocData.length > 0 ? (
        <div className="row">
          {spocData.map((spoc) => {
            const badgeText = spoc.IsPrimary
              ? "Primary"
              : spoc.IsSecondary
              ? "Secondary"
              : "General";
            const badgeClass = spoc.IsPrimary
              ? "badge bg-success"
              : spoc.IsSecondary
              ? "badge bg-warning text-dark"
              : "badge bg-secondary";

            return (
              <div key={spoc.HospitalContactId} className="col-md-6 mb-4">
                <div className="border rounded-3 p-3 shadow-sm bg-light">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="m-0 text-dark fw-bold">{spoc.FullName}</h6>
                    <span className={badgeClass}>{badgeText}</span>
                  </div>
                  {spoc.Qualification && (
                    <p className="text-muted small mb-2">({spoc.Qualification})</p>
                  )}
                  <p className="mb-1">
                    <strong>Contact:</strong>{" "}
                    {spoc.MobileNumber || <span className="text-danger">Not available</span>}
                  </p>
                  <p className="mb-0">
                    <strong>Address:</strong>{" "}
                    {spoc.Address || <span className="text-danger">Not available</span>}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-3">
          <p className="text-danger fw-semibold">No SPOC data available.</p>
        </div>
      )}
    </div>
  )}

  
  {activeTab === "doctorInfo" && (
    <div className="card shadow border-0 rounded-3 p-3 h-100">
      <h5 className="text-success fw-bold mb-3">Doctor Details</h5>
      {doctorData && doctorData.length > 0 ? (
        <div className="row">
          {doctorData.map((doc) => (
            <div key={doc.DoctorId} className="col-md-6 col-lg-4 mb-4">
              <div className="border rounded-3 p-3 shadow-sm bg-light text-center h-100">
                {/* Doctor Image */}
        {/* <div
                  className="mx-auto my-2 rounded-circle overflow-hidden border border-primary shadow-sm"
                  style={{ width: "100px", height: "100px" }}
                >
                  <img
                    src={doc.ImageUrl || getPlaceholderImage(doc.DoctorID)}
                    alt={doc.FullName || "Doctor"}
                    className="w-100 h-100 object-cover"
                  />
                </div>
                <h6 className="m-0 text-dark fw-bold">{doc.FullName}</h6>
                {doc.Qualification && (
                  <p className="text-muted small mb-2">({doc.Qualification})</p>
                )}
                <div className="d-flex justify-content-center gap-3 mt-2">
                  {doc.Email && (
                    <a href={`mailto:${doc.Email}`} className="text-primary fs-5">
                      <i className="fas fa-envelope"></i>
                    </a>
                  )}
                  {doc.MobileNumber && (
                    <a href={`tel:${doc.MobileNumber}`} className="text-success fs-5">
                      <i className="fas fa-phone"></i>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-3">
          <p className="text-danger fw-semibold">No doctor data available.</p>
        </div>
      )}
    </div>
  )}
</div>
</div> */}

        <div className="row g-3 mt-1">
          <div className="col-12 col-md-6 ">
            <div className="card shadow-sm border-0 rounded-lg p-3 h-100">
              <h5 className="mb-2" style={{ color: "#008000" }}>
                SPOCs INFORMATION
              </h5>
              <div className="row">
                {spocData && spocData.length > 0 ? (
                  spocData.map((spoc, index) => {
                    const badgeText = spoc.IsPrimary
                      ? "Primary"
                      : spoc.IsSecondary
                        ? "Secondary"
                        : "";
                    const badgeColor = spoc.IsPrimary
                      ? "bg-success"
                      : spoc.IsSecondary
                        ? "bg-warning"
                        : "";
                    return (
                      <div key={spoc.HospitalContactId} className="col-12 mb-2">
                        <div className="border p-2">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <h6 className="m-0 text-success">
                              {spoc.FullName}
                            </h6>
                            {badgeText && (
                              <span
                                className={`badge ${badgeColor} text-uppercase`}
                              >
                                {badgeText}
                              </span>
                            )}
                          </div>
                          {spoc.Qualification && (
                            <p className="text-muted mb-1">
                              ({spoc.Qualification})
                            </p>
                          )}
                          <p className="mb-1">
                            <strong>Primary Contact:</strong>{" "}
                            {spoc.MobileNumber || (
                              <span className="text-danger">Not available</span>
                            )}
                          </p>
                          <p className="mb-1">
                            <strong>Address:</strong>{" "}
                            {spoc.Address || (
                              <span className="text-danger">Not available</span>
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-12 text-center text-danger">
                    No SPOC data available.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Doctor Information */}
          <div className="col-12 col-md-6">
            <div className="card shadow-sm border-0 rounded-lg p-3 h-100">
              <h5 className="mb-2" style={{ color: "#008000" }}>
                Doctor Information
              </h5>
              <div className="row">
                {doctorData.length > 0 ? (
                  doctorData.map((doctor, index) => (
                    <div key={index} className="col-12 mb-3">
                      <div className="border p-2">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <h6 className="m-0 text-success">
                            {doctor.FullName || (
                              <span className="text-danger">
                                Name not available
                              </span>
                            )}
                          </h6>
                        </div>
                        <p className="mb-1">
                          <strong>Qualification:</strong>{" "}
                          {doctor.Qualification || (
                            <span className="text-danger">Not available</span>
                          )}
                        </p>
                        <p className="mb-1">
                          <strong>Primary Contact:</strong>{" "}
                          {doctor.MobileNumber || (
                            <span className="text-danger">Not available</span>
                          )}
                        </p>
                        <p className="mb-1">
                          <strong>Email:</strong>{" "}
                          {doctor.Email || (
                            <span className="text-danger">Not available</span>
                          )}
                        </p>
                        <p className="mb-1">
                          <strong>Specializations:</strong>
                          {doctor.DoctorSpecialization &&
                            doctor.DoctorSpecialization.length > 0 ? (
                            <ul className="list-unstyled ms-3">
                              {doctor.DoctorSpecialization.map(
                                (specialization, specIndex) => (
                                  <li key={specIndex}>
                                    {specialization.ServiceName}
                                  </li>
                                )
                              )}
                            </ul>
                          ) : (
                            <span className="text-danger">
                              No specializations listed
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12 text-center text-danger">
                    No doctor information available.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hospital Policies Provision */}
          {/* Hospital Policies Card */}
          {/* Hospital Policies Card */}
          <div className="col-12 col-md-6 mb-4">
            <div className="card shadow-sm border-0 rounded-4 h-100">
              <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
                <h5 className="text-success fw-semibold mb-0">
                  Hospital Policies Provision
                </h5>
                <hr className="mt-3 mb-0" style={{ height: "2px", width: "60px", backgroundColor: "#198754", opacity: "1" }} />
              </div>
              <div className="card-body px-4">
                {hospitalPolicies && hospitalPolicies.length > 0 ? (
                  <div className="list-group">
                    {hospitalPolicies.map((policy, index) => (
                      <div
                        key={index}
                        className="list-group-item d-flex justify-content-between align-items-center px-3 py-3 border-0 border-bottom"
                      >
                        <div className="d-flex align-items-center">
                          <div className={`rounded-circle me-3 ${policy.IsActive ? 'bg-success' : 'bg-danger'}`} style={{ width: "8px", height: "8px" }}></div>
                          <div>
                            <span className="fw-medium">
                              {policy.PoliciesType}
                            </span>
                            {policy.DiscountPercentage !== undefined &&
                              policy.DiscountPercentage > 0 && (
                                <span className="ms-2 text-success fw-medium">
                                  {policy.DiscountPercentage}% discount
                                </span>
                              )}
                          </div>
                        </div>
                        <span
                          className={`badge ${policy.IsActive ? "text-success bg-success-subtle" : "text-danger bg-danger-subtle"
                            } rounded-pill px-3 py-2`}
                        >
                          {policy.IsActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="bi bi-clipboard-x text-danger opacity-75" style={{ fontSize: "2rem" }}></i>
                    <p className="text-muted mt-2">No hospital policy data available.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information Card */}
          <div className="col-12 col-md-6 mb-3">
            <div className="card shadow-sm border-0 rounded-4 h-100">
              <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
                <h5 className="text-primary fw-semibold mb-0">
                  Additional Information
                </h5>
                <hr className="mt-2 mb-0" style={{ height: "2px", width: "60px", backgroundColor: "#0d6efd", opacity: "1" }} />
              </div>
              <div className="card-body p-0">
                {/* Hospital Documentation Section */}
                <div className="px-3 py-2">
                  <p className="text-uppercase text-muted mb-3 fw-medium small letter-spacing-1">
                    Hospital Documentation
                  </p>
                  <div className="row g-2">
                    {[
                      {
                        label: "CIN Number",
                        value: profile.CINNumber,
                        icon: "bi bi-upc"
                      },
                      {
                        label: "GST Number",
                        value: profile.GSTNumber,
                        icon: "bi bi-receipt"
                      },
                      {
                        label: "Hospital Registration",
                        value: profile.HospitalRegistrationNumber,
                        icon: "bi bi-building"
                      },
                      {
                        label: "Medical Counsellation",
                        value: profile.MedicalCounsellationNumber,
                        icon: "bi bi-card-text"
                      }
                    ].map((item, index) => (
                      <div key={index} className="col-md-6">
                        <div className="d-flex align-items-center">
                          <div className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3" style={{ width: "38px", height: "38px" }}>
                            <i className={`${item.icon} text-primary`}></i>
                          </div>
                          <div>
                            <div className="text-muted small">{item.label}</div>
                            {item.value ? (
                              <div className="fw-medium">{item.value}</div>
                            ) : (
                              <div className="text-danger small fw-medium">Not provided</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-3">
                  <hr className="my-1 opacity-25" />
                </div>

                {/* Files & Documentation Section */}
                <div className="px-3 py-2">
                  <p className="text-uppercase text-muted mb-1 fw-medium small letter-spacing-1">
                    Files & Documentation
                  </p>
                  <div className="row g-2">
                    {[
                      {
                        label: "MOU File",
                        value: profile.MOUFileName,
                        url: profile.MOUFileName ? `${mocUrl}${profile.MOUFileName}` : null,
                        icon: "bi bi-file-earmark-text"
                      },
                      {
                        label: "IOC File",
                        value: profile.IOCFile,
                        url: profile.IOCFile ? `${mocUrl}${profile.IOCFile}` : null,
                        icon: "bi bi-file-earmark-pdf"
                      },
                      {
                        label: "Agreement Status",
                        value: profile.IsAgreementReceived ? "Received" : "Not Received",
                        icon: "bi bi-clipboard-check",
                        status: profile.IsAgreementReceived ? "success" : "danger"
                      }
                    ].map((item, index) => (
                      <div key={index} className="col-md-4">
                        <div className="text-center py-2 px-1 h-100 border rounded-3" style={{ backgroundColor: "#f8f9fa" }}>
                          <div className="mb-1">
                            <i className={`${item.icon} fs-4 text-primary`}></i>
                          </div>
                          <div className="text-muted small mb-1">{item.label}</div>
                          {item.url ? (
                            <a
                              className="btn btn-sm btn-outline-primary rounded-pill px-3"
                              href={item.url}
                              target="_blank"
                              download
                            >
                              <i className="bi bi-download me-1"></i>
                              Download
                            </a>
                          ) : item.status ? (
                            <span className={`badge bg-${item.status}-subtle text-${item.status}`}>
                              {item.value}
                            </span>
                          ) : (
                            <span className="badge bg-light text-secondary">
                              Not provided
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-2">
                  <hr className="my-1 opacity-25" />
                </div>

                {/* Policies & Services Section */}
                <div className="px-2 py-2">
                  <p className="text-uppercase text-muted mb-2 fw-medium small letter-spacing-1">
                    Policies & Services
                  </p>
                  <div className="row g-2">
                    {[
                      {
                        label: "Aarogyasri",
                        value: profile.Aarogyasri,
                        icon: "bi bi-shield-check"
                      },
                      {
                        label: "Call to Front Desk",
                        value: profile.CallToFrontDesk,
                        icon: "bi bi-telephone"
                      },
                      {
                        label: "Resident Counselling Fee",
                        value: profile.PatientCounsellingFee,
                        icon: "bi bi-chat-square-text"
                      },
                      {
                        label: "Menu Card for Diagnostics",
                        value: profile.MenuCardForDiagnostics,
                        icon: "bi bi-card-checklist"
                      },
                      {
                        label: "Discount On Diagnostics",
                        value: profile.DiscountOnDiagnostics,
                        icon: "bi bi-percent"
                      },
                      {
                        label: "Free OP Consultation",
                        value: profile.IsFreeOPConsultation,
                        icon: "bi bi-clipboard-pulse"
                      }
                    ].map((item, index) => (
                      <div key={index} className="col-md-6 col-lg-4">
                        <div className="card border shadow-none h-100">
                          <div className="card-body">
                            <div className="text-primary mb-1">
                              <i className={`${item.icon}`}></i>
                            </div>
                            <div className="text-muted small">{item.label}</div>
                            <div className="mt-0 fw-medium">
                              {item.value || (
                                <span className="text-danger">Not specified</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Custom CSS */}
          <style jsx>{`
  .letter-spacing-1 {
    letter-spacing: 1px;
  }
`}</style>
        </div>
      </div>

    </>
  );
}










