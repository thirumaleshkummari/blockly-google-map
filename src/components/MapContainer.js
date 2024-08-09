import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api';
import axios from 'axios';

const MapContainer = () => {
    const [locations, setLocations] = useState([]);
    const [currentLocation, setCurrentLocation] = useState(null);

    useEffect(() => {
        const fetchLocationData = async () => {
            const response = await axios.get('http://localhost:3000/location');
            setLocations(response.data);
            setCurrentLocation(response.data[response.data.length - 1]);
        };

        fetchLocationData();
        const intervalId = setInterval(fetchLocationData, 5000); // Update every 5 seconds

        return () => clearInterval(intervalId);
    }, []);

    const mapStyles = {        
        height: "100vh",
        width: "100%"};
    
    const defaultCenter = {
        lat: 17.385044, lng: 78.486671
    };

    return (
        <LoadScript googleMapsApiKey='AIzaSyAoWgfkMykLsH-LlHgJuVmrsCfu7adVbYY'>
            <GoogleMap
                mapContainerStyle={mapStyles}
                zoom={14}
                center={currentLocation ? { lat: currentLocation.latitude, lng: currentLocation.longitude } : defaultCenter}
            >
                {currentLocation && (
                    <Marker position={{ lat: currentLocation.latitude, lng: currentLocation.longitude }} />
                )}
                <Polyline
                    path={locations.map(loc => ({ lat: loc.latitude, lng: loc.longitude }))}
                    options={{ strokeColor: "#FF0000", strokeOpacity: 0.8, strokeWeight: 2 }}
                />
            </GoogleMap>
        </LoadScript>
    )
}

export default MapContainer;

