document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.querySelector(".hamburger");
  const nav = document.querySelector(".nav");
  const bars = hamburger.querySelectorAll(".hamburger_bar"); 

  hamburger.addEventListener("click", function () {
    bars.forEach((bar) => bar.classList.toggle("is_active")); 
    nav.classList.toggle("is_active");
  });
});


window.addEventListener("scroll", () => {
  const header = document.querySelector("header");
  header.classList.toggle("scrolled", window.scrollY > 50);
});


const fadeEls = document.querySelectorAll(".fade-in");
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
fadeEls.forEach(el => observer.observe(el));

// ハンバーガーメニュー
const hamburger = document.querySelector(".hamburger");
const navList = document.querySelector(".nav-list");
hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  navList.classList.toggle("active");
});
