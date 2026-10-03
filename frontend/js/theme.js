// Apply the saved appearance before styles render to avoid a theme flash.
// Only the theme preference is stored here; expenses still come from the API.
(() => {
  const storageKey = "expense-tracker-theme";
  const root = document.documentElement;
  let theme = "dark";

  try {
    const savedTheme = localStorage.getItem(storageKey);
    if (savedTheme === "light" || savedTheme === "dark") {
      theme = savedTheme;
    }
  } catch {
    // The toggle still works if browser storage is unavailable.
  }

  root.setAttribute("data-bs-theme", theme);

  document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("themeToggle");
    if (!button) return;

    function updateButton() {
      const lightMode = root.getAttribute("data-bs-theme") === "light";
      button.textContent = lightMode ? "Dark mode" : "Light mode";
      button.setAttribute("aria-label", "Light mode");
      button.setAttribute("aria-pressed", String(lightMode));
    }

    button.addEventListener("click", () => {
      const nextTheme = root.getAttribute("data-bs-theme") === "dark"
        ? "light"
        : "dark";
      root.setAttribute("data-bs-theme", nextTheme);
      updateButton();
      try {
        localStorage.setItem(storageKey, nextTheme);
      } catch {
        // Storage failure should never prevent switching appearance.
      }
    });

    updateButton();
  });
})();
