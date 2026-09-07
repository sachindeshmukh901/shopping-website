import { useState, useEffect, useRef, useCallback } from "react";

import "../styles/heroCarousel.css";

import { FiChevronLeft, FiChevronRight } from "react-icons/fi";


/**
 * Fully responsive, autoplay image carousel used for the
 * Women / Men / Accessories page hero banners.
 *
 * Props:
 *  - slides: [{ image, alt, title?, subtitle? }]
 *  - interval: autoplay delay in ms (default 4000)
 */

function HeroCarousel({
  slides = [],
  interval = 4000
}) {

  const [activeIndex, setActiveIndex] =
    useState(0);

  const [isPaused, setIsPaused] =
    useState(false);

  const timerRef =
    useRef(null);

  const totalSlides =
    slides.length;


  // =====================================================
  // GO TO SLIDE
  // =====================================================

  const goToSlide = useCallback((index) => {

    if (totalSlides === 0) {
      return;
    }

    let nextIndex =
      ((index % totalSlides) + totalSlides) % totalSlides;

    setActiveIndex(nextIndex);

  }, [totalSlides]);


  const goNext = useCallback(() => {
    goToSlide(activeIndex + 1);
  }, [activeIndex, goToSlide]);


  const goPrev = useCallback(() => {
    goToSlide(activeIndex - 1);
  }, [activeIndex, goToSlide]);


  // =====================================================
  // AUTOPLAY
  // =====================================================

  useEffect(() => {

    if (
      isPaused ||
      totalSlides <= 1
    ) {

      return;

    }

    timerRef.current = setInterval(() => {

      setActiveIndex(
        (previous) => (previous + 1) % totalSlides
      );

    }, interval);


    return () => {

      if (timerRef.current) {

        clearInterval(timerRef.current);

      }

    };

  }, [isPaused, totalSlides, interval]);


  // =====================================================
  // SWIPE SUPPORT (MOBILE)
  // =====================================================

  const touchStartX =
    useRef(0);

  const touchEndX =
    useRef(0);

  function handleTouchStart(event) {

    touchStartX.current =
      event.touches[0].clientX;

  }

  function handleTouchMove(event) {

    touchEndX.current =
      event.touches[0].clientX;

  }

  function handleTouchEnd() {

    let delta =
      touchStartX.current - touchEndX.current;

    if (Math.abs(delta) > 40) {

      if (delta > 0) {

        goNext();

      }

      else {

        goPrev();

      }

    }

  }


  if (totalSlides === 0) {

    return null;

  }


  return (

    <div
      className="hero-carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >

      <div
        className="hero-carousel-track"
        style={{
          transform: `translateX(-${activeIndex * 100}%)`
        }}
      >

        {slides.map((slide, index) => (

          <div
            className="hero-carousel-slide"
            key={index}
          >

            <img
              src={slide.image}
              alt={slide.alt || "Banner"}
              loading={index === 0 ? "eager" : "lazy"}
            />

            {(slide.title || slide.subtitle) && (

              <div className="hero-carousel-caption">

                {slide.title && (
                  <h2>{slide.title}</h2>
                )}

                {slide.subtitle && (
                  <p>{slide.subtitle}</p>
                )}

              </div>

            )}

          </div>

        ))}

      </div>


      {/* ARROWS (hidden on small screens via CSS) */}

      {totalSlides > 1 && (

        <>

          <button
            type="button"
            className="hero-carousel-arrow prev"
            onClick={goPrev}
            aria-label="Previous slide"
          >
            <FiChevronLeft />
          </button>

          <button
            type="button"
            className="hero-carousel-arrow next"
            onClick={goNext}
            aria-label="Next slide"
          >
            <FiChevronRight />
          </button>

        </>

      )}


      {/* DOTS */}

      {totalSlides > 1 && (

        <div className="hero-carousel-dots">

          {slides.map((_, index) => (

            <button
              type="button"
              key={index}
              className={
                index === activeIndex
                  ? "hero-carousel-dot active"
                  : "hero-carousel-dot"
              }
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />

          ))}

        </div>

      )}

    </div>

  );

}


export default HeroCarousel;
