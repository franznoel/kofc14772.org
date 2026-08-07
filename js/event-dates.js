(function () {
    "use strict";

    var dateFormatter = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    });

    function nthWeekdayOfMonth(year, month, weekday, week) {
        var firstDay = new Date(year, month, 1);
        var offset = (weekday - firstDay.getDay() + 7) % 7;
        return new Date(year, month, 1 + offset + ((week - 1) * 7));
    }

    function nextOccurrence(weekday, weeks, today) {
        for (var monthOffset = 0; monthOffset <= 12; monthOffset += 1) {
            var monthDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);

            for (var index = 0; index < weeks.length; index += 1) {
                var candidate = nthWeekdayOfMonth(
                    monthDate.getFullYear(),
                    monthDate.getMonth(),
                    weekday,
                    weeks[index]
                );

                if (candidate >= today) {
                    return candidate;
                }
            }
        }

        return null;
    }

    var today = new Date();
    today.setHours(0, 0, 0, 0);

    document.querySelectorAll(".event-card[data-weekday][data-weeks]").forEach(function (card) {
        var weekday = Number(card.dataset.weekday);
        var weeks = card.dataset.weeks.split(",").map(Number).sort(function (a, b) {
            return a - b;
        });
        var nextDate = nextOccurrence(weekday, weeks, today);
        var time = card.querySelector(".event-next-date time");

        if (!nextDate || !time) {
            return;
        }

        time.dateTime = [
            nextDate.getFullYear(),
            String(nextDate.getMonth() + 1).padStart(2, "0"),
            String(nextDate.getDate()).padStart(2, "0")
        ].join("-");
        time.textContent = dateFormatter.format(nextDate);
    });
}());
