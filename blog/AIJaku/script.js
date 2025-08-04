const targets = document.querySelectorAll(".hidden");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      } else {
        entry.target.classList.remove("show");
      }
    });
  },
  {
    threshold: 0.1,
  }
);

targets.forEach((target) => observer.observe(target));

const hamburger = document.getElementById("hamburger");
const sidebar = document.getElementById("sidebar");
const closeBtn = document.getElementById("closeBtn");

hamburger.addEventListener("click", () => {
  const isOpen = sidebar.style.width === "250px";
  sidebar.style.width = isOpen ? "0" : "250px";
  sidebar.style.zIndex = isOpen ? "0" : "100";
  sidebar.style.display = "block";
  hamburger.classList.toggle("active");
});

closeBtn.addEventListener("click", () => {
  sidebar.style.width = "0";
  sidebar.style.zIndex = "0";
  hamburger.classList.remove("active");
});
