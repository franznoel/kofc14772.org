function localDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

const today = localDateString();
const upcomingList = document.querySelector("#upcoming-announcements");
const archiveList = document.querySelector("#archived-announcements");

if (upcomingList && archiveList) {
    const announcements = Array.from(upcomingList.querySelectorAll("[data-announcement-date]"));

    announcements
        .sort((a, b) => a.dataset.announcementDate.localeCompare(b.dataset.announcementDate))
        .forEach((announcement) => {
            if (announcement.dataset.announcementDate < today) {
                archiveList.prepend(announcement);
            } else {
                upcomingList.append(announcement);
            }
        });
}

const announcementsSubmenu = document.querySelector("#announcements-submenu");

if (announcementsSubmenu) {
    const archiveLink = announcementsSubmenu.querySelector(".nav-submenu-archive");
    const announcementLinks = Array.from(
        announcementsSubmenu.querySelectorAll("[data-announcement-date]")
    );

    announcementLinks
        .sort((a, b) => a.dataset.announcementDate.localeCompare(b.dataset.announcementDate))
        .forEach((link) => {
            link.hidden = link.dataset.announcementDate < today;
            announcementsSubmenu.insertBefore(link, archiveLink);
        });
}
