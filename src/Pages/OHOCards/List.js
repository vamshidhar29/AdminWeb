import React, { useEffect, useState, useRef } from "react";
import { fetchAllData, fetchData } from "../../helpers/externapi";
import Cleave from 'cleave.js/react';
import moment from 'moment';
import CircularProgress from '@mui/material/CircularProgress';
import CommonTables from '../../Commoncomponents/CommonTables';
import { Link, useNavigate } from "react-router-dom";

export default function List(props) {
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [error, setError] = useState('');
    const [tableloading, setTableLoading] = useState(false);
    const [filteredData, setFilteredData] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [selectedCardNames, setSelectedCardNames] = useState([]);
    const [selectedCardNumbers, setSelectedCardNumbers] = useState([]);
    const [selectedRouteMap, setSelectedRouteMap] = useState('');
    const [filterCriteria, setFilterCriteria] = useState([]);
    const [isDisableApply, setIsDisableApply] = useState(true);
    const [input, setInput] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const navigate = useNavigate();

    const tableHeads = ["FULL NAME", "CARD NUMBER", "SOLD DATE", "START DATE", "EXPIRE DATE"];

    const handleNavigation = (data) => {
        if (data?.CustomerId) {
            const path =
                data.MemberTypeId === 1
                    ? `/distributor/details/${data.CustomerId}`
                    : `/customers/details/${data.CustomerId}`;
            navigate(path);
        } else {
            alert("Customer Not Found");
        }
    };

    const tableElements = filteredData && filteredData.length > 0 ?
        filteredData.map((data) => ([
            <span
                onClick={() => handleNavigation(data)}
                className="text-start-important"
                style={{
                    whiteSpace: "normal",
                    textAlign: "start",
                    display: "block",
                    cursor: "pointer",
                    color: "blue" 
                }}
            >
                {data.FullName}
            </span>,
            data.OHOCardNumber,
            data.CardSoldDate ? moment(data.IssuedOn).format('YYYY-MMM-DD') : '',
            data.StartDate ? moment(data.StartDate).format('YYYY-MMM-DD') : '',
            data.EndDate ? moment(data.EndDate).format('YYYY-MMM-DD') : '',
        ])) : [];


    const getMemberCardCountData = async () => {
        setLoading(true);
        try {
            const distributorCountData = await fetchAllData('lambdaAPI/OHOCards/GetSoldOHOCardsListCount');
            setTotalCount(distributorCountData[0].soldOHOCardsListCount);
            setLoading(false);
        }
        catch (error) {
            console.error("Error fetching MemberCard count data:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        getMemberCardCountData();
    }, []);

    const handleCardNumberSelect = (event) => {
        const selectedCardNumber = event.target.value;
        setSelectedCardNumbers(selectedCardNumber);
    };

    const handleNameSelect = (event) => {
        const selectedName = event.target.value;
        if (selectedName === '') {
            setSelectedCardNames([]);
        } else {
            setSelectedCardNames([...selectedCardNames, selectedName]);
        }
    };

    const getMemberCardData = async () => {
        setTableLoading(true);
        try {
            const skip = (currentPage - 1) * perPage;
            const take = perPage;
            let cardData;
            if (filterCriteria.length > 0) {
                cardData = await fetchData("OHOCards/filter", {
                    skip,
                    take,
                    filter: filterCriteria
                });
            } else {
                cardData = await fetchData("lambdaAPI/OHOCards/GetSoldOHOCardsList", { skip, take });
            }
            const dataToDisplay = cardData.map(cards => ({
                ...cards,
            }));
            setTableLoading(false);
            setFilteredData(dataToDisplay)
        }
        catch (err) {
            console.error('Error fetching card data:', err);

        }
    };

    useEffect(() => {
        getMemberCardData();
    }, [filterCriteria, currentPage, perPage]);

    const clearFilters = () => {
        setSelectedCardNumbers("");
        setSelectedRouteMap("")
        setSelectedCardNames("")
        setFilterCriteria([])
        setIsDisableApply(true);
        // setTotalCount();

        getMemberCardCountData();
        document.getElementById("name-input").value = "";
        document.getElementById("cardNumberInput").value = "";
        document.getElementById("rm-input").value = ""
    };

    const applyFilters = async () => {
        setLoading(true);
        const selectedRouteMapIds = selectedRouteMap;
        const name = document.getElementById("name-input").value;
        const cardnumber = selectedCardNumbers;
        const filterCriteria = [];
        if (name.trim() !== "") {
            filterCriteria.push({
                key: "FullName",
                value: name,
                operator: "LIKE"
            });
        }
        if (cardnumber.length > 0) {
            filterCriteria.push({
                key: "OHOCardNumber",
                value: cardnumber,
                operator: "LIKE"
            });
        }
        if (selectedRouteMapIds.length > 0) {
            filterCriteria.push({
                key: "CardType",
                value: selectedRouteMapIds,
                operator: "LIKE"
            });
        }

        try {

            //const distributorCountData = await fetchData(`OHOCards/GetSoldOHOCardsListCount`, {  filter: filterCriteria });
            //const totalCount = distributorCountData[0]?.soldOHOCardsListCount || 0;
            //setTotalCount(totalCount);

            const filterData = await fetchData("OHOCards/filter", {
                skip: 0,
                take: perPage,
                filter: filterCriteria
            });
            const filterCount = await fetchData("OHOCards/filter", {
                countOnly: true,
                filter: filterCriteria
            });
            const totalCount = filterCount.length;

            setTotalCount(totalCount);
            setPerPage(perPage);
            setCurrentPage(1);
            setFilteredData(filterData.map(membercard => ({
                ...membercard
            })));
            setFilterCriteria(filterCriteria);
            // const accordionElement = accordionRef.current;
            // if (accordionElement) {
            //     const bsCollapse = new bootstrap.Collapse(accordionElement, { toggle: true });
            //     bsCollapse.hide();
            // }
        } catch (error) {
            console.error("Error applying filter:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = async (event) => {
        let value = event.target.value;
        let formattedValue = value;

        if (/^\d+$/.test(value.replace(/\s/g, ''))) {
            formattedValue = value.replace(/\s/g, '');
            formattedValue = formattedValue.replace(/(\d{4})(?=\d)/g, '$1 ');
            setInput(formattedValue);
        } else {

            setInput(value);
        }

        if (formattedValue.length >= 2) {
            const filterCriteria = [];

            if (/^\d+$/.test(value.replace(/\s/g, ''))) {
                filterCriteria.push({
                    key: "OHOCardNumber",
                    value: formattedValue,
                    operator: "LIKE"
                });
            } else {
                filterCriteria.push({
                    key: "FullName",
                    value: value,
                    operator: "LIKE"
                });
            }

            setSearchLoading(true);
            setError('');

            try {
                const suggestionData = await fetchData("OHOCards/filter", {
                    skip: 0,
                    take: perPage,
                    filter: filterCriteria
                });
                if (suggestionData.length > 0) {
                    setSuggestions(suggestionData);
                } else {
                    setError('No suggestions found.');
                    setSuggestions([]);
                }

            } catch (error) {
                setError('Failed to fetch suggestions.');
                setSuggestions([]);
            } finally {
                setSearchLoading(false);
            }
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        if (!suggestion?.CustomerId) {
            alert("Customer Not Found");
            return;
        }
    
        const path =
            suggestion.MemberTypeId === 1
                ? `/distributor/details/${suggestion.CustomerId}`
                : `/customers/details/${suggestion.CustomerId}`;
    
        navigate(path);
    };
    

    const clearSearch = () => {
        setInput('');
        setSuggestions([]);
    };

    const handlePageChange = (event, page) => {
        setCurrentPage(page);
    };

    const handlePerPageChange = (event) => {
        setPerPage(parseInt(event.target.value, 10));
        setCurrentPage(1);
    };

    useEffect(() => {
        if (selectedRouteMap.length === 0 && selectedCardNumbers.length === 0 && selectedCardNames.length === 0) {
            setIsDisableApply(true);
        } else {
            setIsDisableApply(false);
        }

    }, [selectedRouteMap, selectedCardNumbers, selectedCardNames]);






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
                                    <h6 className="shimmer-text2 " ></h6>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

        </>
    )

    return (
        <>
            {loading && skeletonloading()}
            {!loading && (
                <>
                    {/* Filter Button */}
                    <div className="card mb-4">
                        <div className="card-body">
                            <div className="select2-primary mx-2" style={{ display: 'flex', flexWrap: 'wrap' }}>

                                {(selectedCardNames.length > 0 || selectedCardNumbers.length > 0) && (
                                    <>
                                        <strong style={{ marginRight: '5px' }}>Filter Criteria - </strong>

                                        {selectedCardNames.length > 0 && (
                                            <div style={{ marginRight: '10px', marginBottom: '0px', display: 'flex', alignItems: 'center' }}>
                                                <strong style={{ marginRight: '5px' }}>Full Name : </strong>
                                                <span className="selected-option-button">
                                                    {selectedCardNames[selectedCardNames.length - 1]}
                                                </span>
                                            </div>
                                        )}


                                        {selectedCardNumbers.length > 0 && (
                                            <div style={{ marginRight: '10px', marginBottom: '0px', display: 'flex', alignItems: 'center' }}>
                                                <strong style={{ marginRight: '5px' }}>Card Number: </strong>
                                                <span className="selected-option-button">
                                                    {selectedCardNumbers}
                                                </span>
                                            </div>
                                        )}


                                    </>
                                )}
                            </div>
                            <div className="row align-items-center">
                                <div className="col-md-9 mb-2">
                                    <label htmlFor="search-input" className="form-label">FullName or Card Number</label>
                                    <div style={{ position: 'relative', maxWidth: '350px' }}>
                                        <input
                                            type="text"
                                            id="search-input"
                                            className="form-control"
                                            style={{ paddingLeft: '30px' }}
                                            maxLength="19"
                                            value={input}
                                            onChange={handleInputChange}
                                        />
                                        {input && (
                                            <i
                                                className="fas fa-times-circle"
                                                style={{
                                                    position: 'absolute',
                                                    right: '10px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    fontSize: '16px',
                                                    color: 'red',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={clearSearch}
                                            ></i>
                                        )}
                                        {searchLoading && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    right: '40px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)'
                                                }}
                                            >
                                                <div className="spinner-border text-primary" role="status" style={{ width: '1.5rem', height: '1.5rem' }}>
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            </div>
                                        )}


                                        {input && !searchLoading && suggestions.length > 0 && (
                                            <ul
                                                style={{
                                                    listStyleType: 'none',
                                                    padding: '0',
                                                    margin: '0',
                                                    border: '1px solid #00796b',
                                                    borderRadius: '4px',
                                                    maxHeight: '200px',
                                                    overflowY: 'auto',
                                                    position: 'absolute',
                                                    width: '100%',
                                                    backgroundColor: '#fff',
                                                    zIndex: 10,
                                                    top: '100%',
                                                    left: '0'
                                                }}
                                            >
                                                {suggestions.map((suggestion, index) => (
                                                    <li
                                                        key={index}
                                                        onClick={() => handleSuggestionClick(suggestion)}
                                                        style={{
                                                            padding: '8px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            position: 'relative'
                                                        }}
                                                    >
                                                        <i
                                                            className="fas fa-arrow-up-left"
                                                            style={{
                                                                marginRight: '8px',
                                                                color: '#00796b'
                                                            }}
                                                        ></i>
                                                        <span style={{ flex: 1 }}>{suggestion.FullName}-{suggestion.OHOCardNumber}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}


                                        {input && !searchLoading && error && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: '100%',
                                                    left: '0',
                                                    color: 'red',
                                                    fontSize: '0.9rem',
                                                    marginTop: '4px',
                                                    backgroundColor: '#fff', // Matches suggestion background
                                                    border: '1px solid #00796b', // Matches suggestion border
                                                    borderRadius: '4px', // Matches suggestion border-radius
                                                    padding: '8px', // Adds spacing similar to suggestions
                                                    zIndex: 10, // Ensures it appears above other elements
                                                    width: '100%' // Ensures it aligns with the input width
                                                }}
                                            >
                                                {error}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#filterModal"
                                    >
                                        <i className="fas fa-filter" style={{ marginRight: '5px' }}></i> Filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>



                    {/* Modal for Filters */}
                    <div
                        className="modal fade"
                        id="filterModal"
                        tabIndex="-1"
                        aria-labelledby="filterModalLabel"
                        aria-hidden="true"
                        style={{ marginTop: '120px' }}
                    >
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="filterModalLabel">Filters</h5>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                    <div className="row">
                                        {/*<div className="col-md-4">*/}
                                        {/*    <label htmlFor="rm-input" className="form-label my-2">Card Type Name</label>*/}
                                        {/*    <select*/}
                                        {/*        id="rm-input"*/}
                                        {/*        className="form-select"*/}
                                        {/*        onChange={(e) => handleRouteMapChange(e.target.value)}*/}
                                        {/*        value={selectedRouteMap || ''}*/}
                                        {/*    >*/}
                                        {/*        <option value="">Select...</option>*/}
                                        {/*        {routeOptions.map((option, index) => (*/}
                                        {/*            <option key={index} value={option.value}>{option.label}</option>*/}
                                        {/*        ))}*/}
                                        {/*    </select>*/}
                                        {/*</div>*/}
                                        <div className="col-md-4">
                                            <label htmlFor="cardNumberInput" className="form-label">Card Number</label>
                                            <Cleave
                                                type="text"
                                                id="cardNumberInput"
                                                className="form-control"
                                                value={selectedCardNumbers}
                                                options={{ blocks: [4, 4, 4], delimiter: ' ' }}
                                                onChange={handleCardNumberSelect}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label htmlFor="name-input" className="form-label">Full Name</label>
                                            <input
                                                type="text"
                                                id="name-input"
                                                value={selectedCardNames[selectedCardNames.length - 1]}
                                                className="form-control"
                                                onChange={handleNameSelect}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        data-bs-dismiss="modal"
                                        onClick={clearFilters}
                                    >
                                        Clear
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        data-bs-dismiss="modal"
                                        onClick={applyFilters}
                                        disabled={isDisableApply}
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="row" style={{ margin: 0, padding: 0 }}>
  <div className="col-xl-12 col-lg-12 col-md-12 order-0 order-md-1" style={{ margin: 0, padding: 0 }}>
    <div className="card mb-4" style={{ opacity: loading ? 0.5 : 1, margin: 0, padding: 0 }}>
      <div className="card-body" style={{ margin: 0, padding: 0, position: "relative" }}>
        {/* Loading spinner */}
        {(loading || tableloading) && (
          <div
            style={{
              position: "absolute",
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

        {/* No records message */}
        {!loading && filteredData.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            There are no records to display.
          </div>
        )}

        {/* Table Data */}
        {!loading && filteredData.length > 0 && (
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
    </div>
  </div>
</div>

                </>
            )}
        </>
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

