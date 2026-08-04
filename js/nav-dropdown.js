const announcementMenu = document.querySelector(".nav-dropdown");

if (announcementMenu) {
    const toggle = announcementMenu.querySelector(".nav-dropdown-toggle");

    function setMenuOpen(open) {
        announcementMenu.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", String(open));
    }

    toggle.addEventListener("click", () => {
        setMenuOpen(!announcementMenu.classList.contains("is-open"));
    });

    document.addEventListener("click", (event) => {
        if (!announcementMenu.contains(event.target)) setMenuOpen(false);
    });

    announcementMenu.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            setMenuOpen(false);
            toggle.focus();
        }
    });
}
