import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "../styles/about.css";

import store from "../assets/images/about/store.png";

function About() {

return(

<>
<Navbar/>

<section className="about-hero">

<div className="about-content">

<p className="about-tag">
ABOUT US
</p>

<h1>
We're Here To Make
<br/>
Fashion Personal
</h1>

<p className="about-desc">

Orgos is your go-to destination
for the latest fashion trends.

We bring together style,
quality, and affordability to
help you look and feel your
best every day.

</p>

</div>

</section>

<section className="promise-section">

<h2>
OUR PROMISE TO YOU
</h2>

<div className="promise-grid">

<div className="promise-card">

<div className="promise-icon">
👔
</div>

<div>

<h3>Great Style</h3>

<p>
Handpicked collections from
top brands and new-age labels
</p>

</div>

</div>

<div className="promise-card">

<div className="promise-icon">
👜
</div>

<div>

<h3>Best Quality</h3>

<p>
We ensure quality in every
product you shop.
</p>

</div>

</div>

<div className="promise-card">

<div className="promise-icon">
🚚
</div>

<div>

<h3>Fast Delivery</h3>

<p>
Quick and reliable delivery
right to your doorstep.
</p>

</div>

</div>

<div className="promise-card">

<div className="promise-icon">
😊
</div>

<div>

<h3>Happy Customer</h3>

<p>
Your satisfaction is our
highest priority.
</p>

</div>

</div>

</div>

</section>

<section className="journey-section">

<div className="journey-left">

<p className="journey-tag">
OUR JOURNEY
</p>

<h2>
Built with passion,
driven by you.
</h2>

<p>

Orgos was founded with a
simple idea — to make fashion
accessible to everyone.

From a small beginning to
becoming a trusted fashion
destination, our journey is
inspired by you.

</p>

<button>
Read More
</button>

</div>

<div className="journey-center">

<img
src={store}
alt=""
/>

</div>

<div className="journey-right">

<div className="stat">

<h1>1K+</h1>

<p>
Happy Customers
</p>

</div>

<div className="stat">

<h1>5K+</h1>

<p>
Top Brands
</p>

</div>

<div className="stat">

<h1>1K+</h1>

<p>
Styles to Choose
</p>

</div>

<div className="stat">

<h1>99%</h1>

<p>
Customer Satisfaction
</p>

</div>

</div>

</section>

<Footer/>

</>

);

}

export default About;