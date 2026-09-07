import { useEffect, useMemo, useState } from "react";

import {
    Map,
    Users,
    Store,
    ShoppingBag,
    MapPin,
    Search,
    RefreshCw
} from "lucide-react";

import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import "./HeatMap.css";



// ======================================================
// FIX LEAFLET ICON
// ======================================================

delete L.Icon.Default.prototype._getIconUrl;


L.Icon.Default.mergeOptions({

    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png"

});



// ======================================================
// DEFAULT INDIA CENTER
// ======================================================

let INDIA_CENTER = [
    22.5937,
    78.9629
];



// ======================================================
// CREATE LOCATION TEXT
// ======================================================

let getLocationText = (location) => {

    let parts = [

        location.address,

        location.city,

        location.state,

        location.pincode

    ];

    return parts
        .filter(Boolean)
        .join(", ");
};



// ======================================================
// BUILD UNIFIED LOCATION LIST FROM REAL DB DATA
// ======================================================
//
// Backend returns customerLocations (user_address),
// vendorLocations (vendors) and orderLocations (orders)
// as separate raw DB rows. This maps them into the shape
// the map/list/filters below expect: { id, type, name,
// email, address, city, state, pincode, amount }
//

let buildLocationsFromRealData = (data) => {

    let combined = [];


    // ==================================================
    // CUSTOMERS
    // ==================================================

    (data.customerLocations || []).forEach((item) => {

        combined.push({

            id: item.address_id,
            type: "customer",
            name: item.full_name || "Customer",
            address: item.address_line,
            city: item.city,
            state: item.state,
            pincode: item.pincode

        });

    });


    // ==================================================
    // VENDORS
    // ==================================================

    (data.vendorLocations || []).forEach((item) => {

        combined.push({

            id: item.vendor_id,
            type: "vendor",
            name: item.shop_name || item.owner_name || "Vendor",
            email: item.email,
            address: item.address,
            city: item.city,
            state: item.state,
            pincode: item.pincode

        });

    });


    // ==================================================
    // ORDERS
    // ==================================================

    (data.orderLocations || []).forEach((item) => {

        combined.push({

            id: item.order_id,
            type: "order",
            name:
                item.full_name
                    ? `Order #${item.order_id} - ${item.full_name}`
                    : `Order #${item.order_id}`,
            email: item.email,
            address: item.address_line,
            city: item.city,
            state: item.state,
            pincode: item.pincode,
            amount: item.total_amount

        });

    });


    return combined;

};



// ======================================================
// MAP CENTER COMPONENT
// ======================================================

function MapCenter({ location }) {

    let map = useMap();


    useEffect(() => {

        if (!location) {
            return;
        }


        map.flyTo(
            [
                location.lat,
                location.lng
            ],
            12,
            {
                duration: 1
            }
        );

    }, [location, map]);


    return null;
}



// ======================================================
// HEATMAP PAGE
// ======================================================

function HeatMap() {

    let [locations, setLocations] =
        useState([]);

    let [loading, setLoading] =
        useState(true);

    let [error, setError] =
        useState("");

    let [activeFilter, setActiveFilter] =
        useState("all");

    let [search, setSearch] =
        useState("");

    let [selectedLocation, setSelectedLocation] =
        useState(null);



    // ==================================================
    // FETCH DATA
    // ==================================================

    let fetchHeatMapData = async () => {

        try {

            setLoading(true);

            setError("");


            let response =
                await fetch(
                    "https://orgos-backend-h7ad.onrender.com/api/admin/heatmap"
                );


            let data =
                await response.json();


            if (!response.ok || !data.success) {

                throw new Error(
                    data.message ||
                    "Failed to fetch HeatMap data"
                );

            }


            let actualLocations =
                buildLocationsFromRealData(
                    data
                );


            // ==========================================
            // GEOCODE REAL DATABASE ADDRESSES
            // ==========================================

            let geocodedLocations =
                await geocodeLocations(
                    actualLocations
                );


            setLocations(
                geocodedLocations
            );


        } catch (error) {

            console.error(
                "HeatMap Error:",
                error
            );


            setError(
                error.message ||
                "Failed to fetch HeatMap data"
            );

        } finally {

            setLoading(false);

        }

    };



    // ==================================================
    // GEOCODING
    // ==================================================

    let geocodeLocations =
        async (items) => {

            let result = [];

            let cache = {};



            for (
                let i = 0;
                i < items.length;
                i++
            ) {

                let item =
                    items[i];


                let address =
                    getLocationText(item);


                if (!address) {
                    continue;
                }



                // ======================================
                // CACHE SAME LOCATION
                // ======================================

                if (cache[address]) {

                    result.push({

                        ...item,

                        lat:
                            cache[address].lat,

                        lng:
                            cache[address].lng

                    });

                    continue;

                }



                try {

                    let url =
                        "https://nominatim.openstreetmap.org/search?" +
                        new URLSearchParams({

                            q: address + ", India",

                            format: "json",

                            limit: "1"

                        });



                    let response =
                        await fetch(url, {

                            headers: {

                                Accept:
                                    "application/json"

                            }

                        });



                    let data =
                        await response.json();



                    if (
                        data &&
                        data.length > 0
                    ) {

                        let lat =
                            Number(data[0].lat);

                        let lng =
                            Number(data[0].lon);


                        cache[address] = {

                            lat,
                            lng

                        };


                        result.push({

                            ...item,

                            lat,

                            lng

                        });

                    }


                } catch (error) {

                    console.error(
                        "Geocoding failed:",
                        address,
                        error
                    );

                }



                // ======================================
                // SMALL DELAY FOR GEOCODING API
                // ======================================

                await new Promise(
                    (resolve) => {

                        setTimeout(
                            resolve,
                            250
                        );

                    }
                );

            }


            return result;

        };



    // ==================================================
    // INITIAL LOAD
    // ==================================================

    useEffect(() => {

        fetchHeatMapData();

    }, []);



    // ==================================================
    // FILTER
    // ==================================================

    let filteredLocations =
        useMemo(() => {

            let data =
                locations;


            if (
                activeFilter !== "all"
            ) {

                data =
                    data.filter(
                        (item) =>
                            item.type ===
                            activeFilter
                    );

            }



            if (search.trim()) {

                let keyword =
                    search
                        .toLowerCase()
                        .trim();


                data =
                    data.filter(
                        (item) => {

                            let text = [

                                item.name,

                                item.email,

                                item.address,

                                item.city,

                                item.state,

                                item.pincode

                            ]
                                .filter(Boolean)
                                .join(" ")
                                .toLowerCase();


                            return text.includes(
                                keyword
                            );

                        }
                    );

            }


            return data;

        }, [
            locations,
            activeFilter,
            search
        ]);



    // ==================================================
    // STATS
    // ==================================================

    let customerCount =
        locations.filter(
            (item) =>
                item.type === "customer"
        ).length;


    let vendorCount =
        locations.filter(
            (item) =>
                item.type === "vendor"
        ).length;


    let orderCount =
        locations.filter(
            (item) =>
                item.type === "order"
        ).length;



    // ==================================================
    // RENDER
    // ==================================================

    return (

        <div className="heatmap-page">


            {/* =========================================
                HEADER
            ========================================= */}

            <div className="heatmap-header">

                <div className="heatmap-title">

                    <div className="heatmap-title-icon">

                        <Map size={28} />

                    </div>


                    <div>

                        <h1>
                            HeatMap
                        </h1>

                        <p>
                            View customer, vendor and
                            order locations across the
                            ORGOS platform.
                        </p>

                    </div>

                </div>



                <button
                    type="button"
                    className="heatmap-refresh"
                    onClick={
                        fetchHeatMapData
                    }
                    disabled={loading}
                >

                    <RefreshCw
                        size={18}
                        className={
                            loading
                                ? "refresh-spin"
                                : ""
                        }
                    />

                    {loading
                        ? "Loading..."
                        : "Refresh"
                    }

                </button>

            </div>



            {/* =========================================
                ERROR
            ========================================= */}

            {error && (

                <div className="heatmap-error">

                    <span>
                        {error}
                    </span>


                    <button
                        type="button"
                        onClick={
                            fetchHeatMapData
                        }
                    >
                        Retry
                    </button>

                </div>

            )}



            {/* =========================================
                STATS
            ========================================= */}

            <div className="heatmap-stats">


                <div className="heatmap-stat-card">

                    <div className="stat-icon customer">

                        <Users size={22} />

                    </div>

                    <div>

                        <span>
                            Customers
                        </span>

                        <strong>
                            {customerCount}
                        </strong>

                    </div>

                </div>



                <div className="heatmap-stat-card">

                    <div className="stat-icon vendor">

                        <Store size={22} />

                    </div>

                    <div>

                        <span>
                            Vendors
                        </span>

                        <strong>
                            {vendorCount}
                        </strong>

                    </div>

                </div>



                <div className="heatmap-stat-card">

                    <div className="stat-icon order">

                        <ShoppingBag size={22} />

                    </div>

                    <div>

                        <span>
                            Orders
                        </span>

                        <strong>
                            {orderCount}
                        </strong>

                    </div>

                </div>



                <div className="heatmap-stat-card">

                    <div className="stat-icon location">

                        <MapPin size={22} />

                    </div>

                    <div>

                        <span>
                            Map Locations
                        </span>

                        <strong>
                            {locations.length}
                        </strong>

                    </div>

                </div>


            </div>



            {/* =========================================
                FILTER BAR
            ========================================= */}

            <div className="heatmap-toolbar">


                <div className="heatmap-filters">


                    <button
                        type="button"
                        className={
                            activeFilter === "all"
                                ? "filter-button active"
                                : "filter-button"
                        }
                        onClick={() =>
                            setActiveFilter("all")
                        }
                    >
                        All
                    </button>



                    <button
                        type="button"
                        className={
                            activeFilter === "customer"
                                ? "filter-button active"
                                : "filter-button"
                        }
                        onClick={() =>
                            setActiveFilter(
                                "customer"
                            )
                        }
                    >

                        <Users size={17} />

                        Customers

                    </button>



                    <button
                        type="button"
                        className={
                            activeFilter === "vendor"
                                ? "filter-button active"
                                : "filter-button"
                        }
                        onClick={() =>
                            setActiveFilter(
                                "vendor"
                            )
                        }
                    >

                        <Store size={17} />

                        Vendors

                    </button>



                    <button
                        type="button"
                        className={
                            activeFilter === "order"
                                ? "filter-button active"
                                : "filter-button"
                        }
                        onClick={() =>
                            setActiveFilter(
                                "order"
                            )
                        }
                    >

                        <ShoppingBag size={17} />

                        Orders

                    </button>

                </div>



                <div className="heatmap-search">

                    <Search size={18} />

                    <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder="Search city, state or address..."
                    />

                </div>

            </div>



            {/* =========================================
                MAP
            ========================================= */}

            <div className="heatmap-map-wrapper">

                {loading ? (

                    <div className="heatmap-loading">

                        <RefreshCw
                            size={28}
                            className="refresh-spin"
                        />

                        <p>
                            Loading real ORGOS locations...
                        </p>

                    </div>

                ) : (

                    <MapContainer
                        center={INDIA_CENTER}
                        zoom={5}
                        scrollWheelZoom={true}
                        className="heatmap-map"
                    >

                        <TileLayer
                            attribution='&copy; OpenStreetMap contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />


                        {selectedLocation && (

                            <MapCenter
                                location={
                                    selectedLocation
                                }
                            />

                        )}



                        {filteredLocations.map(
                            (location, index) => (

                                <Marker
                                    key={
                                        `${location.type}-${location.id}-${index}`
                                    }
                                    position={[
                                        location.lat,
                                        location.lng
                                    ]}
                                    eventHandlers={{
                                        click: () => {

                                            setSelectedLocation(
                                                location
                                            );

                                        }
                                    }}
                                >

                                    <Popup>

                                        <div className="map-popup">

                                            <div
                                                className={
                                                    `popup-type ${location.type}`
                                                }
                                            >

                                                {location.type}

                                            </div>


                                            <h3>
                                                {location.name}
                                            </h3>


                                            {location.email && (

                                                <p>
                                                    {location.email}
                                                </p>

                                            )}


                                            <p>

                                                <strong>
                                                    Location:
                                                </strong>

                                                <br />

                                                {
                                                    getLocationText(
                                                        location
                                                    )
                                                }

                                            </p>


                                            {location.type === "order" && (

                                                <p>

                                                    <strong>
                                                        Amount:
                                                    </strong>

                                                    ₹
                                                    {Number(
                                                        location.amount || 0
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}

                                                </p>

                                            )}

                                        </div>

                                    </Popup>

                                </Marker>

                            )
                        )}

                    </MapContainer>

                )}

            </div>



            {/* =========================================
                LOCATION LIST
            ========================================= */}

            <div className="heatmap-location-list">

                <div className="location-list-header">

                    <div>

                        <h2>
                            Locations
                        </h2>

                        <p>
                            Real records from ORGOS database
                        </p>

                    </div>

                    <strong>
                        {filteredLocations.length}
                    </strong>

                </div>



                {filteredLocations.length === 0 ? (

                    <div className="empty-location">

                        <MapPin size={32} />

                        <h3>
                            No locations found
                        </h3>

                        <p>
                            No matching location is
                            available in the database.
                        </p>

                    </div>

                ) : (

                    <div className="location-list">

                        {filteredLocations
                            .slice(0, 20)
                            .map(
                                (location, index) => (

                                    <button
                                        type="button"
                                        className="location-row"
                                        key={
                                            `${location.type}-${location.id}-${index}`
                                        }
                                        onClick={() =>
                                            setSelectedLocation(
                                                location
                                            )
                                        }
                                    >

                                        <div
                                            className={
                                                `location-row-icon ${location.type}`
                                            }
                                        >

                                            {location.type ===
                                                "customer" ? (

                                                <Users
                                                    size={18}
                                                />

                                            ) : location.type ===
                                                "vendor" ? (

                                                <Store
                                                    size={18}
                                                />

                                            ) : (

                                                <ShoppingBag
                                                    size={18}
                                                />

                                            )}

                                        </div>



                                        <div className="location-row-info">

                                            <strong>
                                                {location.name}
                                            </strong>

                                            <span>

                                                {
                                                    getLocationText(
                                                        location
                                                    )
                                                }

                                            </span>

                                        </div>



                                        <span
                                            className={
                                                `location-type ${location.type}`
                                            }
                                        >
                                            {location.type}
                                        </span>

                                    </button>

                                )
                            )}

                    </div>

                )}

            </div>

        </div>

    );

}


export default HeatMap;