import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { fetchData } from "../../helpers/externapi";
import CircularProgress from "@mui/material/CircularProgress";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CommonTables from "../../Commoncomponents/CommonTables";
import { TableSkeletonLoading } from "../../Commoncomponents/SkeletonLoading";
import DescriptionCell from "../../Commoncomponents/DescriptionCell";


export default function List(props) {
  const [loading, setLoading] = useState(true);
  const [productsData, setProductsData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [activeButton, setActiveButton] = useState("all");
  const [selectedFilterType, setSelectedFilterType] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");
  const filterCriteria = [];

  const navigate = useNavigate();
  const location = useLocation();

  const tableHeads = [
    "Product Name",
    "Short Description",
    "Is Combo",
    "Service Provider",
    "Base Price",
    "GST",
    "Total Amount",
  ];
  // const tableElementsActive = activeProducts.length > 0 ?
  //     activeProducts.map(data => ([
  //         <Link
  //             to={`/products/details/${data.ProductsId}`}
  //             className="text-start-important"
  //             style={{
  //                 whiteSpace: 'normal',
  //                 textAlign: 'start',
  //                 display: 'block',
  //             }}
  //             onClick={() => handleNavigation(`/products/details/${data.ProductsId}`)}
  //         >
  //             {data.ProductName}
  //         </Link>,
  //         <DescriptionCell description={data.ShortDescription} />,
  //         /*<div dangerouslySetInnerHTML={{ __html: data.KeyFeatures }} />*/
  //         data.IsCombo ? (
  //             <p className='badge bg-label-success'>COMBO</p>
  //         ) : (
  //             <p className='badge bg-label-warning'>INDIVIDUAL</p>
  //         ),
  //         data.ServiceProvider,
  //         data.BasePremium,
  //         data.GST,
  //         data.InsurancePremiums[0].TotalAmount,
  //     ])) : [];

  const tableElements =
    productsData.length > 0
      ? productsData.map((data) => [
        <Link
          to={`/products/details/${data.ProductsId}`}
          className="text-start-important"
          style={{
            whiteSpace: "normal",
            textAlign: "start",
            display: "block",
          }}
          onClick={() =>
            handleNavigation(`/products/details/${data.ProductsId}`)
          }
        >
          {data.ProductName}
        </Link>,
        <DescriptionCell description={data.ShortDescription} />,
        /*<div dangerouslySetInnerHTML={{ __html: data.KeyFeatures }} />*/
        data.IsCombo ? (
          <p className="badge bg-label-success">COMBO</p>
        ) : (
          <p className="badge bg-label-warning">INDIVIDUAL</p>
        ),
        data.ServiceProvider,
        data.BasePremium,
        data.GST,
        data.InsurancePremiums[0].TotalAmount,
      ])
      : [];
      // const tableElementsInActive = inActiveProducts.length > 0 ?
  //     inActiveProducts.map(data => ([
  //         <Link
  //             to={`/products/details/${data.ProductsId}`}
  //             className="text-start-important"
  //             style={{
  //                 whiteSpace: 'normal',
  //                 textAlign: 'start',
  //                 display: 'block',
  //             }}
  //             onClick={() => handleNavigation(`/products/details/${data.ProductsId}`)}
  //         >
  //             {data.ProductName}
  //         </Link>,
  //         <DescriptionCell description={data.ShortDescription} />,
  //         /*<div dangerouslySetInnerHTML={{ __html: data.KeyFeatures }} />*/
  //         data.IsCombo ? (
  //             <p className='badge bg-label-success'>COMBO</p>
  //         ) : (
  //             <p className='badge bg-label-warning'>INDIVIDUAL</p>
  //         ),
  //         data.ServiceProvider,
  //         data.BasePremium,
  //         data.GST,
  //         data.InsurancePremiums[0].TotalAmount,
  //     ])) : [];
  // const getProductcountData = async () => {
  //     setLoading(true);
  //     const productCountData = await fetchData(`CommonRowCount/GetTableRowCount`,
  //         { tableName: "Products", isActive: location.pathname.includes('inactive') ? false : true });
  //     const totalCount = productCountData[0]?.CountOfRecords || 0;
  //     setTotalCount(totalCount);
  //     setLoading(false);
  // };

  // useEffect(() => {
  //     getProductcountData();
  // }, [location]);

 
  const getProductData = async (filterType = "all", searchQuery = "") => {
    setLoading(true);
    try {
      const skip = (currentPage - 1) * perPage;
      const take = perPage;
      const isActive = location.pathname.includes("inactive") ? false : true;

      let filterParams = { skip, take, isActive };
      if (filterType === "combo") filterParams.IsCombo = true;
      if (filterType === "individual") filterParams.IsCombo = false;

      if (searchQuery.length >= 2) {
        filterParams.search = searchQuery;
      }

      const productCountData = await fetchData(
        "CommonRowCount/GetTableRowCount",
        {
          tableName: "Products",
          isActive,
          ...(filterType !== "all" && { IsCombo: filterParams.IsCombo }),
        }
      );
      const totalProductCount = productCountData[0]?.CountOfRecords || 0;
      setTotalCount(totalProductCount);

      let productData;
      if (filterCriteria.length > 0) {
        productData = await fetchData("Products/filter", {
          skip,
          take,
          filter: filterCriteria,
        });
      } else {
        productData = await fetchData(
          "Products/fetchProductsList/all",
          filterParams
        );

        setProductData(productData);
        setIsDataLoaded(true);
      }
       // const productData = await fetchData(
      //   "Products/fetchProductsList/all",
      //   filterParams
      // );

      const insurancePremiumData = await fetchData("InsurancePremium/all", {
        skip: 0,
        take: -1,
      });

      // Merge insurance details with products
      let filteredProducts = productData.map((product) => {
        const matchingPremium = insurancePremiumData.find(
          (premium) => premium.ProductsId === product.ProductsId
        );

        return {
          ...product,
          BasePremium: matchingPremium?.BasePremium ?? null,
          GST: matchingPremium?.GST ?? null,
          TotalAmount: matchingPremium?.TotalAmount ?? null,
        };
      });

      setProductsData(filteredProducts);
      setIsDataLoaded(true);
    } catch (error) {
      console.error("Error fetching product data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProductData(selectedFilterType);
  }, [currentPage, perPage, selectedFilterType, location.pathname]);

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (event) => {
    setPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1);
  };

  const handleButtonClick = (buttonType) => {
    setActiveButton(buttonType);
    setSelectedFilterType(buttonType);
    setCurrentPage(1);
    getProductData(buttonType);
  };

  const handleNavigation = (path) => {
    setIsNavigating(true);
    navigate(path);
    setIsNavigating(false);
  };

 // Add this useEffect to reset search when switching tabs
useEffect(() => {
  // Reset search when switching between active/inactive tabs
  setInput("");
  setSuggestions([]);
  setError("");
  setSearchLoading(false);
}, [location.pathname]);

// Your existing handleInputChange function remains the same
const handleInputChange = async (event) => {
  const value = event.target.value;
  setInput(value);

  // Clear suggestions if input is too short
  if (value.length < 2) {
    setSuggestions([]);
    setError("");
    return;
  }

  setSearchLoading(true);
  
  try {
    // Get the current active state based on URL
    const isActive = !location.pathname.includes("inactive");
    
    // Use the same endpoint and parameters as the main product fetch
    const productSuggestions = await fetchData("Products/fetchProductsList/all", {
      skip: 0,
      take: perPage,
      isActive: isActive,
      search: value  // This should search for the exact current input
    });

    // Only show suggestions that match the CURRENT input value
    const currentInputValue = value.toLowerCase();
    
    const filteredSuggestions = productSuggestions.filter(product => 
      product.ProductName.toLowerCase().includes(currentInputValue)
    );

    if (filteredSuggestions.length > 0) {
      setSuggestions(filteredSuggestions);
      setError("");
    } else {
      setSuggestions([]);
      setError("No matching products found");
    }
  } catch (error) {
    console.error("Search error:", error);
    setSuggestions([]);
    setError("Failed to fetch suggestions");
  } finally {
    setSearchLoading(false);
  }
};

  const handleSuggestionClick = (suggestion) => {
    navigate(`/products/details/${suggestion.ProductsId}`);
  };

  const clearSearch = () => {
    setInput("");
    setSuggestions([]);
  };
  // const showComboProducts = () => {
  //   getProductData("combo");
  // };

  // const showIndividualProducts = () => {
  //   getProductData("individual");
  // };

  // const showAllProducts = () => {
  //   getProductData("all");
  // };

  // const handleSearchInputChange = (event) => {
  //   const value = event.target.value.toLowerCase().trim();
  //   setSearchInput(value);

  //   if (!value) {
  //     setFilteredResults([]);
  //     return;
  //   }

  //   if (!productsData || productsData.length === 0) {
  //     console.warn("No product data available to filter.");
  //     return;
  //   }

  //   // Filter by product name
  //   const results = productsData.filter((product) =>
  //     product.ProductName?.toLowerCase().includes(value)
  //   );

  //   setFilteredResults(results);
  // };

  // const clearSearch = () => {
  //   setSearchInput("");
  //   getProductData(selectedFilterType, "");
  // };

  return (
    <>
      {loading ? (
        <TableSkeletonLoading />
      ) : !isDataLoaded ? (
        <TableSkeletonLoading />
      ) : (
        <>
          {(loading || isNavigating) && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
              }}
            >
              <CircularProgress />
            </div>
          )}

          <div className="card border-0 shadow-sm p-2 mb-3">
            <div className="d-flex flex-wrap justify-content-between align-items-center">
              {/* Filter Buttons */}
              <div className="d-flex flex-wrap gap-3">
  <button
    className={`btn btn-sm fw-bold px-4 py-2 rounded-pill`}
    onClick={() => handleButtonClick("all")}
    style={{
      background: activeButton === "all" ? "linear-gradient(135deg, #0052D4, #4364F7, #6FB1FC)" : "rgba(255, 255, 255, 0.2)",
      color: activeButton === "all" ? "white" : "#0052D4",
      border: "none",
      boxShadow: activeButton === "all" ? "0 4px 10px rgba(0, 82, 212, 0.3)" : "0 2px 5px rgba(0,0,0,0.1)",
      transition: "all 0.3s ease-in-out",
      backdropFilter: "blur(10px)"
    }}
  >
    <i className="fas fa-th-large me-2"></i> All Products
  </button>

  <button
    className={`btn btn-sm fw-bold px-4 py-2 rounded-pill`}
    onClick={() => handleButtonClick("individual")}
    style={{
      background: activeButton === "individual" ? "linear-gradient(135deg, #11998E, #38EF7D)" : "rgba(255, 255, 255, 0.2)",
      color: activeButton === "individual" ? "white" : "#11998E",
      border: "none",
      boxShadow: activeButton === "individual" ? "0 4px 10px rgba(17, 153, 142, 0.3)" : "0 2px 5px rgba(0,0,0,0.1)",
      transition: "all 0.3s ease-in-out",
      backdropFilter: "blur(10px)"
    }}
  >
    <i className="fas fa-cube me-2"></i> Individual
  </button>

  <button
    className={`btn btn-sm fw-bold px-4 py-2 rounded-pill`}
    onClick={() => handleButtonClick("combo")}
    style={{
      background: activeButton === "combo" ? "linear-gradient(135deg, #FF8008, #FFC837)" : "rgba(255, 255, 255, 0.2)",
      color: activeButton === "combo" ? "white" : "#FF8008",
      border: "none",
      boxShadow: activeButton === "combo" ? "0 4px 10px rgba(255, 128, 8, 0.3)" : "0 2px 5px rgba(0,0,0,0.1)",
      transition: "all 0.3s ease-in-out",
      backdropFilter: "blur(10px)"
    }}
  >
    <i className="fas fa-cubes me-2"></i> Combo
  </button>
</div>



              {/* Search Box */}
              <div className="position-relative" style={{ maxWidth: "400px", width: "100%" }}>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="fas fa-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    id="search-input"
                    className="form-control border-start-0"
                    placeholder="Search products..."
                    value={input}
                    onChange={handleInputChange}
                    maxLength="50"
                  />
                  {input && (
                    <button
                      className="btn btn-outline-secondary border-start-0"
                      type="button"
                      onClick={clearSearch}
                    >
                      <i className="fas fa-times-circle text-danger"></i>
                    </button>
                  )}
                  {searchLoading && (
                    <span className="input-group-text bg-white border-start-0">
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </span>
                  )}
                </div>

                {/* Suggestions Dropdown */}
                {input && !searchLoading && suggestions.length > 0 && (
                  <div className="card position-absolute w-100 mt-1 shadow-lg rounded-3 overflow-hidden" style={{ zIndex: 1050 }}>
                    <ul className="list-group">
                      {suggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="list-group-item list-group-item-action d-flex align-items-center py-2"
                        >
                          <i className="fas fa-search me-2 text-info"></i>
                          <span>{suggestion.ProductName}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Error Message */}
                {input && !searchLoading && error && (
                  <div className="position-absolute w-100 mt-1 shadow-lg rounded-3 overflow-hidden" style={{ zIndex: 1050 }}>
                    <div className="alert alert-danger py-2 mb-0">
                      <i className="fas fa-exclamation-circle me-2"></i>
                      {error}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>


          <Card style={{ borderRadius: "10px", margin: 0, padding: 0 }}>
  <CardContent style={{ padding: 0, margin: 0 }}>
    <div style={{ overflowX: "auto", padding: 0, margin: 0 }}>
      <CommonTables
        tableHeads={tableHeads}
        tableData={tableElements}
        perPage={perPage}
        currentPage={currentPage}
        perPageChange={handlePerPageChange}
        pageChange={handlePageChange}
        totalCount={totalCount}
      />
    </div>
  </CardContent>
</Card>

        </>
      )}
    </>
  );
}
