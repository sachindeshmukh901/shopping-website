import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Map,
    RefreshCw,
    AlertCircle,
    Search,
    Users,
    ShoppingBag,
    IndianRupee,
    MapPinned,
    MapPin
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

let INDIA_CENTER = [22.5937, 78.9629];


// ======================================================
// LOCATION TEXT
// ======================================================

let getLocationText = (item) => {

    let parts = [

        item.address_line,

        item.city,

        item.state,

        item.pincode

    ];

    return parts.filter(Boolean).join(", ");

};


// ======================================================
// MAP CENTER COMPONENT
// ======================================================

function MapCenter({ location }) {

    let map = useMap();

    useEffect(() => {

        if (!location) return;

        map.flyTo(
            [location.lat, location.lng],
            12,
            { duration: 1 }
        );

    }, [location, map]);

    return null;

}


// ======================================================
// VENDOR HEATMAP PAGE
// ======================================================

function HeatMap() {

    let [locations, setLocations] =
        useState([]);

    let [stats, setStats] =
        useState({

            totalOrders: 0,

            uniqueCustomers: 0,

            uniqueCities: 0,

            totalRevenue: 0

        });

    let [loading, setLoading] =
        useState(true);

    let [error, setError] =
        useState("");

    let [search, setSearch] =
        useState("");

    let [selectedLocation, setSelectedLocation] =
        useState(null);


    // ==================================================
    // TOKEN
    // ==================================================

    let getToken = () => {

        return localStorage.getItem("vendorToken");

    };


    // ==================================================
    // FETCH + GEOCODE
    // ==================================================

    let fetchHeatMapData = async () => {

        try {

            setLoading(true);

            setError("");

            let token =
                getToken();

            if (!token) {

                setError(
                    "Vendor session expired. Please login again."
                );

                return;

            }

            let response =
                await fetch(
                    "https://orgos-backend-l7mx.onrender.com/api/vendor/heatmap",
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

            let data =
                await response.json();

            if (!response.ok || !data.success) {

                throw new Error(
                    data.message ||
                    "Failed to fetch heatmap data"
                );

            }

            setStats(
                data.stats || {

                    totalOrders: 0,

                    uniqueCustomers: 0,

                    uniqueCities: 0,

                    totalRevenue: 0

                }
            );

            let geocoded =
                await geocodeLocations(
                    data.orderLocations || []
                );

            setLocations(geocoded);

        }

        catch (error) {

            console.error(
                "Vendor HeatMap Error:",
                error
            );

            setError(
                error.message ||
                "Failed to fetch heatmap data"
            );

        }

        finally {

            setLoading(false);

        }

    };


    // ==================================================
    // GEOCODING (address text -> lat/lng)
    // ==================================================

    let geocodeLocations = async (items) => {

        let result = [];

        let cache = {};

        for (let i = 0; i < items.length; i++) {

            let item = items[i];

            let address =
                getLocationText(item);

            if (!address) continue;

            if (cache[address]) {

                result.push({
                    ...item,
                    lat: cache[address].lat,
                    lng: cache[address].lng
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
                        headers: { Accept: "application/json" }
                    });

                let data =
                    await response.json();

                if (data && data.length > 0) {

                    let lat = Number(data[0].lat);
                    let lng = Number(data[0].lon);

                    cache[address] = { lat, lng };

                    result.push({ ...item, lat, lng });

                }

            }

            catch (error) {

                console.error(
                    "Geocoding failed:",
                    address,
                    error
                );

            }

            await new Promise(
                (resolve) => setTimeout(resolve, 250)
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

            if (!search.trim()) return locations;

            let keyword =
                search.toLowerCase().trim();

            return locations.filter((item) => {

                let text = [

                    item.full_name,

                    item.email,

                    item.address_line,

                    item.city,

                    item.state,

                    item.pincode,

                    item.order_id

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                return text.includes(keyword);

            });

        }, [locations, search]);


    // ==================================================
    // CURRENCY
    // ==================================================

    let formatCurrency = (amount) => {

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0
            }
        ).format(Number(amount) || 0);

    };


    // ==================================================
    // RENDER
    // ==================================================

    return (

        <div className="vendor-heatmap-page">


            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="vendor-heatmap-header">

                <div>

                    <h1>Order HeatMap</h1>

                    <p>
                        See which cities and customers your
                        orders are coming from.
                    </p>

                </div>

                <button
                    className="vendor-heatmap-refresh"
                    onClick={fetchHeatMapData}
                    disabled={loading}
                >

                    <RefreshCw
                        size={18}
                        className={
                            loading ? "vendor-heatmap-spin" : ""
                        }
                    />

                    {loading ? "Loading..." : "Refresh"}

                </button>

            </div>


            {/* ==================================================
                ERROR
            ================================================== */}

            {
                error && (

                    <div className="vendor-heatmap-error">

                        <AlertCircle size={20} />

                        <span>{error}</span>

                        <button onClick={fetchHeatMapData}>
                            Retry
                        </button>

                    </div>

                )
            }


            {/* ==================================================
                STATS
            ================================================== */}

            <div className="vendor-heatmap-stats">

                <div className="vendor-heatmap-stat-card">

                    <div className="stat-icon orders">
                        <ShoppingBag size={22} />
                    </div>

                    <div>
                        <span>Total Orders</span>
                        <strong>{stats.totalOrders}</strong>
                    </div>

                </div>

                <div className="vendor-heatmap-stat-card">

                    <div className="stat-icon customers">
                        <Users size={22} />
                    </div>

                    <div>
                        <span>Unique Customers</span>
                        <strong>{stats.uniqueCustomers}</strong>
                    </div>

                </div>

                <div className="vendor-heatmap-stat-card">

                    <div className="stat-icon cities">
                        <MapPinned size={22} />
                    </div>

                    <div>
                        <span>Cities Reached</span>
                        <strong>{stats.uniqueCities}</strong>
                    </div>

                </div>

                <div className="vendor-heatmap-stat-card">

                    <div className="stat-icon revenue">
                        <IndianRupee size={22} />
                    </div>

                    <div>
                        <span>Total Revenue</span>
                        <strong>
                            {formatCurrency(stats.totalRevenue)}
                        </strong>
                    </div>

                </div>

            </div>


            {/* ==================================================
                SEARCH
            ================================================== */}

            <div className="vendor-heatmap-search">

                <Search size={18} />

                <input
                    type="text"
                    value={search}
                    onChange={
                        (event) => setSearch(event.target.value)
                    }
                    placeholder="Search customer, city, state or order ID..."
                />

            </div>


            {/* ==================================================
                MAP
            ================================================== */}

            <div className="vendor-heatmap-map-wrapper">

                {loading ? (

                    <div className="vendor-heatmap-loading">

                        <RefreshCw
                            size={28}
                            className="vendor-heatmap-spin"
                        />

                        <p>Loading order locations...</p>

                    </div>

                ) : (

                    <MapContainer
                        center={INDIA_CENTER}
                        zoom={5}
                        scrollWheelZoom={true}
                        className="vendor-heatmap-map"
                    >

                        <TileLayer
                            attribution='&copy; OpenStreetMap contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {
                            selectedLocation && (

                                <MapCenter
                                    location={selectedLocation}
                                />

                            )
                        }

                        {
                            filteredLocations.map(
                                (location, index) => (

                                    <Marker
                                        key={
                                            `${location.order_vendor_id}-${index}`
                                        }
                                        position={[
                                            location.lat,
                                            location.lng
                                        ]}
                                        eventHandlers={{
                                            click: () =>
                                                setSelectedLocation(location)
                                        }}
                                    >

                                        <Popup>

                                            <div className="vendor-map-popup">

                                                <div className="popup-order-id">
                                                    Order #{location.order_id}
                                                </div>

                                                <h3>
                                                    {
                                                        location.full_name ||
                                                        "Customer"
                                                    }
                                                </h3>

                                                {
                                                    location.email && (
                                                        <p>{location.email}</p>
                                                    )
                                                }

                                                <p>

                                                    <strong>Location:</strong>

                                                    <br />

                                                    {getLocationText(location)}

                                                </p>

                                                <p>

                                                    <strong>Order Value:</strong>{" "}

                                                    {
                                                        formatCurrency(
                                                            location.vendor_total
                                                        )
                                                    }

                                                </p>

                                                <p>

                                                    <strong>Status:</strong>{" "}

                                                    {
                                                        location.vendor_status ||
                                                        "Confirmed"
                                                    }

                                                </p>

                                            </div>

                                        </Popup>

                                    </Marker>

                                )
                            )
                        }

                    </MapContainer>

                )}

            </div>


            {/* ==================================================
                LOCATION LIST
            ================================================== */}

            <div className="vendor-heatmap-list">

                <div className="vendor-heatmap-list-header">

                    <div>
                        <h2>Recent Orders</h2>
                        <p>Real orders from your ORGOS store</p>
                    </div>

                    <strong>{filteredLocations.length}</strong>

                </div>

                {
                    filteredLocations.length === 0 ? (

                        <div className="vendor-heatmap-empty">

                            <MapPin size={32} />

                            <h3>No order locations found</h3>

                            <p>
                                Orders with a shipping address
                                will appear here.
                            </p>

                        </div>

                    ) : (

                        <div className="vendor-heatmap-rows">

                            {
                                filteredLocations
                                    .slice(0, 25)
                                    .map((location, index) => (

                                        <button
                                            type="button"
                                            key={
                                                `${location.order_vendor_id}-row-${index}`
                                            }
                                            className="vendor-heatmap-row"
                                            onClick={() =>
                                                setSelectedLocation(location)
                                            }
                                        >

                                            <div className="row-icon">
                                                <Users size={18} />
                                            </div>

                                            <div className="row-info">

                                                <strong>
                                                    {
                                                        location.full_name ||
                                                        "Customer"
                                                    }
                                                </strong>

                                                <span>
                                                    {getLocationText(location)}
                                                </span>

                                            </div>

                                            <span className="row-order">
                                                #{location.order_id}
                                            </span>

                                        </button>

                                    ))
                            }

                        </div>

                    )
                }

            </div>

        </div>

    );

}


export default HeatMap;
