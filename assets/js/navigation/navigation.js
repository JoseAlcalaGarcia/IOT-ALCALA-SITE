// La navegación usa enlaces relativos para funcionar tanto en localhost como
// cuando el repositorio se publica dentro de una subruta de GitHub Pages.
export function markCurrentView() {
  const current = location.pathname.endsWith("monitoreo.html") ? "monitoreo" : "control";
  document.querySelectorAll(".app-nav a").forEach(link => {
    const target = link.href.endsWith("monitoreo.html") ? "monitoreo" : "control";
    link.classList.toggle("active", target === current);
    if (target === current) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}
