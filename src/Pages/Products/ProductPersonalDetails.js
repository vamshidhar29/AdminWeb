import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchAllData } from "../../helpers/externapi";

export default function ProductPersonalDetails(props) {
  const [profile, setProfile] = useState(props.data || []);
  const [otherCharges, setOtherCharges] = useState([]);
  const [productOffers, setProductsOffers] = useState([]);
  const [productDependents, setProductDependents] = useState([]);
  const [productNominees, setProductNominees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [comboList, setComboList] = useState([]);

  const navigate = useNavigate();
  const id = useParams();

  useEffect(() => {
    const fetchProductsDetails = async () => {
      setLoading(true);
      try {
        const response = await fetchAllData(
          `Products/GetAllProductDetailsById/${id.Id}`
        );
        setProductsOffers(response[0].ProductsOffers);
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductsDetails();
  }, [id.Id]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const chargesResponse = await fetchAllData(
          `OtherCharges/GetOtherChargesDetailsByProductsId/${id.Id}`
        );
        setOtherCharges(chargesResponse);

        const dependentsResponse = await fetchAllData(
          `ProductDependents/GetByProductId/${id.Id}`
        );
        setProductDependents(dependentsResponse);

        const nomineesResponse = await fetchAllData(
          `ProductNominee/GetByProductId/${id.Id}`
        );
        setProductNominees(nomineesResponse);
      } catch (error) {
        console.error("Error fetching additional data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id.Id]);

  useEffect(() => {
    if (profile.length > 0 && profile[0].IsCombo) {
      const getSelectedProducts = async () => {
        try {
          const response = await fetchAllData(
            `ComboProducts/FetchComboProducts/${profile[0].ProductsId}`
          );
          setComboList(response);
        } catch (error) {
          console.error("Error fetching combo products:", error);
        }
      };

      getSelectedProducts();
    }
  }, [profile]);

  const handleEditForm = () => {
    navigate("/products/new", { state: { profile, otherCharges } });
  };

  const handleBackToList = () => {
    navigate("/products/list");
  };

  const stripHtmlTags = (html) => {
    if (!html) return "";
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.innerHTML;
  };

  const formatHtml = (html) => {
    if (!html) return "";
    return html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/\.\s*/g, ".\n")
      .replace(/\n{2,}/g, "\n")
      .trim();
  };

 

  const formatKeyFeatures = (keyFeatures) => {

    if (!keyFeatures) return [];

    const matches = keyFeatures.match(/<p>.*?<\/p>|<strong>.*?<\/strong>/g);

    if (!matches) return [];

    return matches.map(item => {

      const withBoldMarkers = item

        .replace(/<strong>(.*?)<\/strong>/g, '**$1**')

        .replace(/<b>(.*?)<\/b>/g, '**$1**');

      const cleanText = withBoldMarkers.replace(/<[^>]*>/g, '').trim();

      const result = [];

      const segments = cleanText.split(/\\n\s*/);

      segments.forEach((segment, index) => {

        if (index > 0) {

          result.push({ text: '', isBold: false, lineBreak: true });

        }

        if (segment.trim() === '') {

          if (index > 0) {

            result.push({ text: '', isBold: false, lineBreak: true });

          }

        } else {

          const parts = segment.split(/(\*\*.*?\*\*)/g).filter(part => part !== '');

          parts.forEach(part => {

            if (part.startsWith('**') && part.endsWith('**')) {

              result.push({ text: part.slice(2, -2), isBold: true });

            } else {

              result.push({ text: part, isBold: false });

            }

          });

        }

      });

      return result;

    });

  };


  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  return (
    <div className=" w-full sm:w-auto mx-1">
      {profile?.length > 0 && (
        <div className="row g-4">
          <div className="card p-3 shadow-sm mb-0">
            <div className="row g-2 align-items-start">
              <div className="col-md-8">
                <div className="d-flex flex-wrap gap-2 align-items-center mb-1">
                  <span className={`badge ${profile[0]?.IsCombo ? "bg-success" : "bg-warning"} px-3 py-2 rounded-pill`}>
                    <i className={`bi ${profile[0]?.IsCombo ? "bi-boxes" : "bi-box"} me-1`}></i>
                    {profile[0]?.IsCombo ? "Combo Product" : "Individual Product"}
                  </span>
                  <span className="badge bg-primary px-3 py-2 rounded-pill">
                    <i className="bi bi-building me-1"></i>
                    {profile[0]?.ServiceProvider}
                  </span>
                </div>
                <h1 className="fs-5 fw-semibold text-dark mb-1">{profile[0]?.ProductName}</h1>
                <p className="text-muted small mb-2">{profile[0]?.ShortDescription}</p>
              </div>

              <div className="col-md-4">
                <div className="bg-white p-3 rounded-3 shadow-sm border">
                  <h6 className="text-primary border-bottom pb-1 mb-2 d-flex align-items-center">
                    <i className="bi bi-person-vcard-fill me-2"></i> Eligibility Criteria
                  </h6>
                  <div className="row g-1">
                    {[
                      { label: "Age Range", value: `${profile[0]?.MinimumAge} - ${profile[0]?.MaximumAge}` },
                      { label: "Children Age", value: profile[0]?.ChildrenAge },
                      { label: "Max Adults", value: profile[0]?.MaximumAdult },
                      { label: "Max Children", value: profile[0]?.MaximumChild },
                      { label: "Max Members", value: profile[0]?.MaximumMembers, borderClass: "border-success" }
                    ].map((item, index) => (
                      <div key={index} className="col-6">
                        <div className={`p-2 bg-light rounded-3 shadow-sm border-start border-4 ${item.borderClass || "border-primary"}`}>
                          <span className="text-dark fw-semibold small">{item.label}</span>
                          <span className="fw-bold small text-primary d-block">{item.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6 mb-3">
            <div className="card border-0 shadow-sm rounded-3 bg-white">
              <div className="card-header bg-success text-white border-0 py-2 px-3 d-flex align-items-center">
                <i className="bi bi-star-fill me-2 fs-6"></i>
                <h4 className="h6 fw-bold m-0 text-white">Key Features</h4>
              </div>
              <div className="card-body p-3">
                {profile[0]?.KeyFeatures ? (
                  <ul className="list-unstyled mb-0">
                    {formatKeyFeatures(profile[0].KeyFeatures).map((featureGroup, index, array) => (
                      <li key={index}>
                        <div className="d-flex align-items-start mb-2">
                          <i className="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                          <div>
                            {featureGroup.map((part, i) =>
                              part.lineBreak ? (
                                <br key={i} />
                              ) : part.isBold ? (
                                <strong key={i}>{part.text}</strong>
                              ) : (
                                <span key={i}>{part.text}</span>
                              )
                            )}
                          </div>
                        </div>
                        {index < array.length - 1 && <hr className="my-2" />}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No features available</p>
                )}
              </div>

            </div>
          </div>
          <div className="col-lg-6">
            {profile[0]?.LongDescription && (
              <div className="card border-0 shadow-sm rounded-3 bg-white mb-3 w-100">
                <div className="card-header bg-primary text-white border-0 py-3 px-4 d-flex align-items-center">
                  <i className="bi bi-info-circle-fill me-2 fs-5"></i>
                  <h4 className="h5 fw-bold m-0 text-white">Description</h4>
                </div>
                <div className="card-body p-4">
                  <p className="mb-0 lh-lg text-dark">
                    {formatKeyFeatures(profile[0]?.LongDescription).map((featureParts, index) => (
                      <span key={index}>
                        {featureParts.map((part, idx) =>
                          part.isold ? <strong key={idx}>{part.text}</strong> : <span key={idx}>{part.text}</span>
                        )}
                        {index < formatKeyFeatures(profile[0]?.LongDescription).length - 1 && ". "}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            )}
            {(productDependents.length > 0 || productNominees.length > 0) && (
              <div className="card border-0 shadow-sm rounded-3 bg-white mb-4 w-100">
                <div className="card-header bg-primary text-white border-0 py-3 px-4 d-flex align-items-center">
                  <i className="bi bi-people-fill me-2 fs-5"></i>
                  <h4 className="h5 fw-bold m-0 text-white">Relationships</h4>
                </div>
                <div className="card-body p-4">
                  <div className="row g-4 w-100">
                    {productDependents.length > 0 && (
                      <div className="col-12">
                        <h5 className="text-primary fw-bold mb-2 d-flex align-items-center">
                          <i className="bi bi-people-fill me-2 fs-5"></i>
                          Dependent Relationships
                        </h5>
                        <div className="d-flex flex-wrap gap-2 w-100">
                          {productDependents.map((item, index) => (
                            <span key={index} className="badge bg-light text-dark border px-3 py-2 rounded-pill w-100 text-center">
                              {item.RelationshipType}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {productNominees.length > 0 && (
                      <div className="col-12">
                        <h5 className="text-primary fw-bold mb-2 d-flex align-items-center">
                          <i className="bi bi-person-check-fill me-2 fs-5"></i>
                          Nominee Relationships
                        </h5>
                        <div className="d-flex flex-wrap gap-2 w-100">
                          {productNominees.map((item, index) => (
                            <span key={index} className="badge bg-light text-dark border px-3 py-2 rounded-pill w-100 text-center">
                              {item.RelationshipType}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {profile[0]?.IsCombo && comboList?.length > 0 && (
              <div className="card border-0 shadow rounded-3 bg-white mb-4 w-100">
                <div className="card-header bg-primary text-white border-0 py-2 px-3 d-flex align-items-center">
                  <i className="bi bi-box-fill me-2"></i>
                  <h4 className="h6 fw-bold m-0 text-white">Combo Products</h4>
                </div>
                <div className="card-body p-0">
                  <div className="list-group list-group-flush">
                    {comboList.map((item) => (
                      <a
                        key={item?.ProductsId}
                        href={`/products/details/${item?.ProductsId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="list-group-item list-group-item-action border-0 py-2 px-3 d-flex align-items-center"
                      >
                        <div className="bg-teal-light text-teal p-1 rounded me-2">
                          <i className="bi bi-box"></i>
                        </div>
                        <span className="fw-medium small">{item?.ProductName}</span>
                        <i className="bi bi-chevron-right ms-auto"></i>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          {productOffers?.length > 0 && (
            <div className="col-12 mt-0">
              <div className="card border-0 shadow rounded-lg overflow-hidden bg-white">
                <div className="card-header bg-amber text-dark border-0 py-2 px-3">
                  <h4 className="h6 fw-bold m-0">
                    <i className="bi bi-tag-fill me-2"></i>
                    Product Offers
                  </h4>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table align-middle mb-0">
                      <thead style={{ background: "linear-gradient(to right, #1976D2, #0D47A1)", color: "white" }}>
                        <tr>
                          <th className="py-2 px-3 border-0">Member Type</th>
                          <th className="py-2 px-3 border-0">Offer Amount</th>
                          <th className="py-2 px-3 border-0">Offer Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productOffers.map((item, index) => (
                          <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-light"}>
                            <td className="py-2 px-3 fw-medium">{item.MemberType}</td>
                            <td className="py-2 px-3">{item.OfferAmount}</td>
                            <td className="py-2 px-3">
                              <span className="badge bg-amber text-dark rounded-pill px-2">
                                {item.OfferPercentage}%
                              </span>
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

          {profile[0]?.InsurancePremiums?.length > 0 && (
            <div className="col-12 mt-0">
              <div className="card border-0 shadow rounded-lg overflow-hidden bg-white">
                <div className="card-header bg-forest text-white border-0 py-2 px-3">
                  <h4 className="h5 fw-bold m-2">
                    <i className="bi bi-shield-fill me-2"></i>
                    Insurance Premium
                  </h4>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table align-middle mb-0">
                      <thead style={{ background: "linear-gradient(to right, #1976D2, #0D47A1)", color: "white" }}>
                        <tr>
                          <th className="py-3 px-4 border-0" style={{ color: "white" }}>Minimum Age</th>
                          <th className="py-3 px-4 border-0" style={{ color: "white" }}>Maximum Age</th>
                          <th className="py-3 px-4 border-0" style={{ color: "white" }}>Base Premium</th>
                          <th className="py-3 px-4 border-0" style={{ color: "white" }}>GST</th>
                          <th className="py-3 px-4 border-0" style={{ color: "white" }}>Total Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {profile[0].InsurancePremiums.map((item, index) => (
                          <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-light"}>
                            <td className="py-3 px-4">{item?.MinimumAge}</td>
                            <td className="py-3 px-4">{item?.MaximumAge}</td>
                            <td className="py-3 px-4">{item?.BasePremium}</td>
                            <td className="py-3 px-4">{item?.GST}</td>
                            <td className="py-3 px-4 fw-bold text-forest">{item?.TotalAmount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {otherCharges?.length > 0 && (
            <div className="col-12 mt-0">
              <div className="card border-0 shadow rounded-lg overflow-hidden bg-white">
                <div className="card-header bg-indigo text-white border-0 py-3 px-4">
                  <h4 className="h5 fw-bold m-0">
                    <i className="bi bi-cash-stack me-2"></i>
                    Other Charges
                  </h4>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table align-middle mb-0">
                      <thead style={{ background: "linear-gradient(to right, #1976D2, #0D47A1)", color: "white" }}>
                        <tr>
                          <th className="py-3 px-4 border-0">Label Name</th>
                          <th className="py-3 px-4 border-0">Value</th>
                          <th className="py-3 px-4 border-0">Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {otherCharges.map((item, index) => (
                          <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-light"}>
                            <td className="py-3 px-4">{item?.LabelName}</td>
                            <td className="py-3 px-4">{item?.Value}</td>
                            <td className="py-3 px-4">{item?.Type}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="col-12 mt-1">
            <div className="d-flex flex-wrap justify-content-between mt-1 mb-2 gap-2">
              <button
                onClick={handleBackToList}
                className="btn btn-outline-primary px-4 py-2 rounded-pill"
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back to List
              </button>
              <button
                onClick={handleEditForm}
                className="btn btn-primary px-4 py-2 rounded-pill"
              >
                <i className="bi bi-pencil-square me-2"></i>
                Edit Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




