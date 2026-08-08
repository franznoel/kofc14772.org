(function () {
    "use strict";

    var status = new URLSearchParams(window.location.search).get("payment");
    var statusElement = document.querySelector("[data-payment-status]");
    if (!statusElement) return;

    var messages = {
        cancelled: {
            className: "is-error",
            text: "Payment was cancelled. No dues were charged."
        },
        success: {
            className: "is-success",
            text: "Thank you. Stripe received your membership dues payment."
        },
        unavailable: {
            className: "is-error",
            text: "Online payment is temporarily unavailable. Please try again later."
        }
    };

    if (!messages[status]) return;

    statusElement.classList.add(messages[status].className);
    statusElement.textContent = messages[status].text;
    statusElement.hidden = false;
}());
