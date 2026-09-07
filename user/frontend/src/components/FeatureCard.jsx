import "./../styles/smartDashboard.css";

function FeatureCard({

title,
description,
icon,
onClick

}){

return(

<div
className="feature-card"
onClick={onClick}
>

<div className="feature-icon">

{icon}

</div>

<h2>

{title}

</h2>

<p>

{description}

</p>

<button>

Open Feature

</button>

</div>

);

}

export default FeatureCard;