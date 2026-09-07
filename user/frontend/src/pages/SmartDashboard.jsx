import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FeatureCard from "../components/FeatureCard";

import "../styles/smartDashboard.css";

import { useNavigate } from "react-router-dom";

import {

FaRulerCombined,

FaChartLine,

FaTshirt

} from "react-icons/fa";

function SmartDashboard(){

const navigate = useNavigate();

return(

<>

<Navbar/>

<div className="dashboard-container">

<h1>

AI Smart Features

</h1>

<p>

Choose any smart feature to continue

</p>

<div className="dashboard-grid">

<FeatureCard

title="AI Size Recommendation"

description="Find your perfect clothing size using AI."

icon={<FaRulerCombined/>}

onClick={()=>navigate("/ai-size")}

/>

<FeatureCard

title="Future Price Alert"

description="Get notified when product price drops."

icon={<FaChartLine/>}

onClick={()=>navigate("/future-price")}

/>

<FeatureCard

title="AI Outfit Generator"

description="Generate outfits according to your style."

icon={<FaTshirt/>}

onClick={()=>navigate("/outfit-generator")}

/>

</div>

</div>

<Footer/>

</>

);

}

export default SmartDashboard;