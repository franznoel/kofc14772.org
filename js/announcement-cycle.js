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

document.querySelectorAll(".nav-submenu [data-announcement-date]").forEach((link) => {
    if (link.dataset.announcementDate < today) link.hidden = true;
});
