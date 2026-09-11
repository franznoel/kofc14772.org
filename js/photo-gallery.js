(function () {
    "use strict";

    var dialog = document.querySelector(".photo-lightbox");

    if (!dialog || typeof dialog.showModal !== "function") {
        return;
    }

    var image = dialog.querySelector(".photo-lightbox-image");
    var title = dialog.querySelector("#photo-lightbox-title");
    var caption = dialog.querySelector(".photo-lightbox-caption p");
    var closeButton = dialog.querySelector(".photo-lightbox-close");
    var activeTrigger = null;

    document.querySelectorAll(".photo-lightbox-trigger").forEach(function (trigger) {
        trigger.addEventListener("click", function (event) {
            event.preventDefault();
            activeTrigger = trigger;
            image.src = trigger.href;
            image.alt = trigger.querySelector("img").alt;
            title.textContent = trigger.dataset.photoTitle;
            caption.textContent = trigger.dataset.photoCaption;
            dialog.showModal();
            document.body.classList.add("lightbox-open");
            closeButton.focus();
        });
    });

    function closeDialog() {
        dialog.close();
    }

    closeButton.addEventListener("click", closeDialog);

    dialog.addEventListener("click", function (event) {
        if (event.target === dialog) {
            closeDialog();
        }
    });

    dialog.addEventListener("close", function () {
        document.body.classList.remove("lightbox-open");
        image.removeAttribute("src");

        if (activeTrigger) {
            activeTrigger.focus();
        }
    });
}());
