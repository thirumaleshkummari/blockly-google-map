import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow, Polyline } from '@react-google-maps/api';
import axios from 'axios';
import './MapContainer.css'; // Ensure your CSS is set up for custom controls

const mapContainerStyle = {
    width: '100vw',
    height: '100vh',
    position: 'relative',
};

const center = {
    lat: 17.385044,
    lng: 78.486671,
};

const MapContainer = () => {
    const [VehiclePath, setVehiclePath] = useState([]);
    const [currentLocation, setCurrentLocation] = useState(center);
    const [mapCenter, setMapCenter] = useState(center);
    const [startLocation, setStartLocation] = useState(null);
    const [endLocation, setEndLocation] = useState(null);
    const [selectedDate, setSelectedDate] = useState('today');
    const [showInfowindow, setShowInfoWindow] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [playbackInterval, setPlaybackInterval] = useState(null);
    const [markerRotation, setMarkerRotation] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5001/vehicle-location', {
                    params: { date: selectedDate },
                });
                const data = response.data;

                if (Array.isArray(data) && data.length > 0) {
                    const formattedPath = data.map(coord => ({ lat: coord.latitude, lng: coord.longitude }));
                    setVehiclePath(formattedPath);
                    setStartLocation(formattedPath[0]);
                    setEndLocation(formattedPath[formattedPath.length - 1]);
                    setMapCenter(formattedPath[0]);
                } else {
                    setVehiclePath([]);
                    setCurrentLocation(center);
                    setStartLocation(null);
                    setEndLocation(null);
                    setMapCenter(center);
                }
            } catch (error) {
                console.log('Error fetching vehicle location:', error);
            }
        };

        fetchData();
    }, [selectedDate]);

    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
    };

    const toggleInfoWindow = () => {
        setShowInfoWindow(!showInfowindow);
    };

    const handlePlaybackSpeedChange = (event) => {
        setPlaybackSpeed(Number(event.target.value));
    };

    const calculateAngle = (point1, point2) => {
        const dy = point2.lat - point1.lat;
        const dx = point2.lng - point1.lng;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        return angle;
    };

    const startPlayback = () => {
        if (playbackInterval) {
            clearInterval(playbackInterval);
        }

        let index = 0;
        const interval = setInterval(() => {
            if (index < VehiclePath.length - 1) {
                setCurrentLocation(VehiclePath[index]);
                const angle = calculateAngle(VehiclePath[index], VehiclePath[index + 1]);
                setMarkerRotation(angle);
                index++;
            } else {
                clearInterval(interval);
            }
        }, 1000 / playbackSpeed);

        setPlaybackInterval(interval);
    };

    return (
        <LoadScript
            googleMapsApiKey='AIzaSyBtY8hZVBnCjYgC-alV1R4s_8itQYB4sYE'
            onLoad={() => setIsLoaded(true)}
            onError={() => console.error('Error loading Google Maps API')}
        >
            {isLoaded && (
                <div style={mapContainerStyle}>
                    <GoogleMap mapContainerStyle={mapContainerStyle} zoom={8} center={mapCenter}>
                        {startLocation && (
                            <Marker
                                position={startLocation}
                                icon={{
                                    url: 'http://maps.google.com/mapfiles/kml/paddle/go.png',
                                    scaledSize: new window.google.maps.Size(50, 50),
                                }}
                            />
                        )}

                        {endLocation && (
                            <Marker
                                position={endLocation}
                                icon={{
                                    url: 'http://maps.google.com/mapfiles/kml/paddle/stop.png',
                                    scaledSize: new window.google.maps.Size(50, 50),
                                }}
                            />
                        )}

                        {VehiclePath.length > 0 && (
                            <>
                                <Polyline path={VehiclePath} options={{ strokeColor: '#558052', strokeWeight: 5 }} />
                                <Marker
                                    position={currentLocation}
                                    icon={{
                                        url: 'https://images.vexels.com/media/users/3/154573/isolated/preview/bd08e000a449288c914d851cb9dae110-hatchback-car-top-view-silhouette-by-vexels.png',
                                        scaledSize: new window.google.maps.Size(50, 50),
                                        rotation: markerRotation,
                                    }}
                                />
                            </>
                        )}

                        {showInfowindow && (
                            <InfoWindow position={currentLocation} onCloseClick={toggleInfoWindow}>
                                <div className='info-window-content'>
                                    <h2>WIRELESS</h2>
                                    <p>A/23/28, Vijay Nagar Rd, Vijay Nagar, Delhi</p>
                                    <p>Jul 20, 07:09 AM</p>
                                    <div className='info-window-details'>
                                        <div>
                                            <p>Speed: 0.00 km/h</p>
                                            <p>Distance: 0.00 km</p>
                                            <p>Total Distance: 834.00 km</p>
                                        </div>
                                    </div>
                                </div>
                            </InfoWindow>
                        )}

                        {/* Custom Controls */}
                        <div className="custom-map-controls">
                            <div className="control">
                                <label>Date:</label>
                                <select value={selectedDate} onChange={handleDateChange}>
                                    <option value="today">Today</option>
                                    <option value="yesterday">Yesterday</option>
                                    <option value="this_week">This Week</option>
                                    <option value="previous_week">Previous Week</option>
                                    <option value="this_month">This Month</option>
                                    <option value="previous_month">Previous Month</option>
                                </select>
                            </div>

                            <div className="control">
                                <label>Playback Speed:</label>
                                <input
                                    type="number"
                                    value={playbackSpeed}
                                    onChange={handlePlaybackSpeedChange}
                                    min="0.1"
                                    step="0.1"
                                />
                            </div>

                            <div className="control">
                                <button onClick={startPlayback}>Start Playback</button>
                            </div>
                        </div>
                    </GoogleMap>
                </div>
            )}
        </LoadScript>
    );
};

export default MapContainer;




