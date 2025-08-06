document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.querySelector(".hamburger");
  const nav = document.querySelector(".nav");
  const bars = hamburger.querySelectorAll(".hamburger_bar"); 

  hamburger.addEventListener("click", function () {
    bars.forEach((bar) => bar.classList.toggle("is_active")); 
    nav.classList.toggle("is_active");
  });
});
