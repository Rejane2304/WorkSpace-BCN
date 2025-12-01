"use client"

import { useState, useEffect } from "react"

function ScrollToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setVisible(scrollTop > 400);
    }
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (!visible) return null

  return (
    <button
      type="button"
      className="scroll-to-top-btn"
      onClick={scrollToTop}
      aria-label="Subir al inicio de la página"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        width="28"
        height="28"
        fill="none"
        stroke="currentColor"
      >
        <path
          d="M12 18V7.5M8 11.5L12 7.5L16 11.5"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

export default ScrollToTopButton
