const icons = document.querySelectorAll(".icon");
const characters = document.querySelectorAll(".character");

icons.forEach((icon) => {
  icon.addEventListener("click", () => {
    icons.forEach((i) => i.classList.remove("active"));
    icon.classList.add("active");

    characters.forEach((c) => c.classList.remove("active"));

    const id = icon.dataset.id;
    document.getElementById(id).classList.add("active");
  });
});

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
