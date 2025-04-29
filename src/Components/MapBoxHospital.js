import React, { useState, useEffect } from "react";
import Map, { Marker, Popup } from "react-map-gl";
import { fetchData } from "../helpers/externapi";
import "mapbox-gl/dist/mapbox-gl.css";

const MapBoxHospital = ({ hospitalsData = [] }) => {
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [mapBoxToken, setMapBoxToken] = useState("");

    const handleLocation = (event, location) => {
        event.preventDefault();
        setSelectedLocation(location);
    };

    const getMocUrl = async () => {
        try {
            const response = await fetchData("ConfigValues/all", { skip: 0, take: 0 });
            const imageUrl = response?.find((val) => val.ConfigKey === "REACT_APP_MAP_BOX");
            if (imageUrl?.ConfigValue) {
                setMapBoxToken(imageUrl.ConfigValue);
            }
        } catch (error) {
            console.error("Error fetching Mapbox token:", error);
        }
    };

    useEffect(() => {
        getMocUrl();
    }, []);

    if (!mapBoxToken) return <p>Loading Map...</p>;

    return (
        <Map
            initialViewState={{
                longitude: hospitalsData.length > 0 ? hospitalsData[0].Longitude || 78.477740 : 78.477740,
                latitude: hospitalsData.length > 0 ? hospitalsData[0].Latitude || 17.434170 : 17.434170,
                zoom: 10
            }}
            style={{ width: hospitalsData.length > 1 ? "70%" : "100%", height: hospitalsData.length > 1 ? "400px" : "300px" }}
            mapStyle="mapbox://styles/mapbox/streets-v11"
            mapboxAccessToken={mapBoxToken}
        >
            {hospitalsData.length > 0 &&
                hospitalsData.map((location, index) =>
                    location.Longitude && location.Latitude ? (
                        <Marker key={index} longitude={location.Longitude} latitude={location.Latitude} color="red">
                            <button
                                style={{ border: "0px", backgroundColor: "transparent", cursor: "pointer" }}
                                onClick={(e) => handleLocation(e, location)}
                            >
                                <i className="fa-solid fa-location-dot fa-2x text-danger"></i>
                            </button>
                        </Marker>
                    ) : null
                )}

            {selectedLocation && (
                <Popup latitude={selectedLocation.Latitude} longitude={selectedLocation.Longitude} onClose={() => setSelectedLocation(null)} closeOnClick={false}>
                    <p>{selectedLocation.HospitalName}</p>
                </Popup>
            )}
        </Map>
    );
};

export default MapBoxHospital;
