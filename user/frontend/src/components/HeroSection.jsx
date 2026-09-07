import "../styles/hero.css";

import girl from "../assets/images/girl.png";
import couple1 from "../assets/images/couple1.png";
import couple2 from "../assets/images/couple2.png";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useEffect, useRef, useState } from "react";

const slides = [
  { image: girl, eyebrow: "AUTUMN EDIT", title: "Complete Your Look With Orgos", description: "Premium fashion collection with modern style." },
  { image: couple1, eyebrow: "THE OCCASION EDIT", title: "Made For Your Best Moments", description: "Thoughtful looks for celebrations, evenings and everything between." },
  { image: couple2, eyebrow: "NEW SEASON", title: "Style That Feels Like You", description: "Discover expressive pieces designed to move with your day." }
];

function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef(0);

  const showSlide = (index) => setActiveIndex((index + slides.length) % slides.length);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, []);

  const activeSlide = slides[activeIndex];

  return (
    <section className="hero-wrapper" onTouchStart={(event) => { touchStartX.current = event.touches[0].clientX; }} onTouchEnd={(event) => { const distance = touchStartX.current - event.changedTouches[0].clientX; if (Math.abs(distance) > 45) showSlide(activeIndex + (distance > 0 ? 1 : -1)); }}>
      <section className="hero" aria-roledescription="carousel" aria-label="Featured fashion">
        <div className="hero-left" key={`copy-${activeIndex}`}>
          <span className="hero-eyebrow">{activeSlide.eyebrow}</span>
          <h1>{activeSlide.title}</h1>
          <p>{activeSlide.description}</p>
          <button type="button">Explore Shop</button>
        </div>
        <div className="hero-right" key={`image-${activeIndex}`}>
          <img src={activeSlide.image} alt={activeSlide.title} />
          <span className="hero-slide-count">0{activeIndex + 1} / 0{slides.length}</span>
        </div>
        <button type="button" className="hero-arrow hero-arrow-prev" onClick={() => showSlide(activeIndex - 1)} aria-label="Previous slide"><FiChevronLeft /></button>
        <button type="button" className="hero-arrow hero-arrow-next" onClick={() => showSlide(activeIndex + 1)} aria-label="Next slide"><FiChevronRight /></button>
        <div className="hero-dots" aria-label="Choose featured slide">
          {slides.map((slide, index) => <button type="button" key={slide.eyebrow} className={index === activeIndex ? "active" : ""} onClick={() => showSlide(index)} aria-label={`Show ${slide.eyebrow.toLowerCase()}`} aria-current={index === activeIndex ? "true" : undefined} />)}
        </div>
      </section>
    </section>
  );
}

export default HeroSection;