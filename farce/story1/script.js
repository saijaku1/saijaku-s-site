function checkVisibility() {
  const elements = document.querySelectorAll(".talk");
  const images = document.querySelectorAll(".show-image");

  elements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom >= 0) {
      element.classList.add("visible");
    }
  });

  images.forEach((image) => {
    const rect = image.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom >= 0) {
      image.classList.add("visible");
    } else {
      image.classList.remove("visible");
    }
  });
}

window.addEventListener("scroll", checkVisibility);
document.addEventListener("DOMContentLoaded", checkVisibility);

document.querySelector(".returnBtn").addEventListener("click", () => {
  window.location.href = "https://saijaku.f5.si/farce/";
});

document.querySelector(".nextBtn").addEventListener("click", () => {
  window.location.href = "https://saijaku.f5.si/farce/story2/";
});
