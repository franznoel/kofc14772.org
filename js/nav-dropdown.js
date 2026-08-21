const dropdownMenus = Array.from(document.querySelectorAll(".nav-dropdown"));

dropdownMenus.forEach((menu) => {
    const toggle = menu.querySelector(".nav-dropdown-toggle");

    function setMenuOpen(open) {
        menu.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", String(open));
    }

    toggle.addEventListener("click", () => {
        const willOpen = !menu.classList.contains("is-open");
        dropdownMenus.forEach((otherMenu) => {
            if (otherMenu !== menu) {
                otherMenu.classList.remove("is-open");
                otherMenu.querySelector(".nav-dropdown-toggle").setAttribute("aria-expanded", "false");
            }
        });
        setMenuOpen(willOpen);
    });

    document.addEventListener("click", (event) => {
        if (!menu.contains(event.target)) setMenuOpen(false);
    });

    menu.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            setMenuOpen(false);
            toggle.focus();
        }
    });
});
