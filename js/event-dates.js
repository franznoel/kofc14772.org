(function () {
    "use strict";

    var councilTimeZone = "America/Los_Angeles";
    var dateFormatter = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC"
    });

    function nthWeekdayOfMonth(year, month, weekday, week) {
        var firstDay = new Date(Date.UTC(year, month, 1));
        var offset = (weekday - firstDay.getUTCDay() + 7) % 7;
        return new Date(Date.UTC(year, month, 1 + offset + ((week - 1) * 7)));
    }

    function currentDateInTimeZone(timeZone) {
        var parts = new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            timeZone: timeZone
        }).formatToParts(new Date());
        var values = {};

        parts.forEach(function (part) {
            if (part.type !== "literal") {
                values[part.type] = Number(part.value);
            }
        });

        return new Date(Date.UTC(values.year, values.month - 1, values.day));
    }

    function nextOccurrence(weekday, weeks, today) {
        for (var monthOffset = 0; monthOffset <= 12; monthOffset += 1) {
            var monthDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + monthOffset, 1));

            for (var index = 0; index < weeks.length; index += 1) {
                var candidate = nthWeekdayOfMonth(
                    monthDate.getUTCFullYear(),
                    monthDate.getUTCMonth(),
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

    var today = currentDateInTimeZone(councilTimeZone);
    var eventsList = document.querySelector(".events-list");
    var cards = Array.from(document.querySelectorAll(".event-card[data-weekday][data-weeks]"));

    cards.forEach(function (card, originalIndex) {
        var weekday = Number(card.dataset.weekday);
        var weeks = card.dataset.weeks.split(",").map(Number).sort(function (a, b) {
            return a - b;
        });
        var nextDate = nextOccurrence(weekday, weeks, today);
        var time = card.querySelector(".event-next-date time");

        if (!nextDate || !time) {
            return;
        }

        card.dataset.nextDate = String(nextDate.getTime());
        card.dataset.originalIndex = String(originalIndex);
        time.dateTime = [
            nextDate.getUTCFullYear(),
            String(nextDate.getUTCMonth() + 1).padStart(2, "0"),
            String(nextDate.getUTCDate()).padStart(2, "0")
        ].join("-");
        time.textContent = dateFormatter.format(nextDate);
    });

    cards.sort(function (first, second) {
        var dateDifference = Number(first.dataset.nextDate) - Number(second.dataset.nextDate);

        if (dateDifference !== 0) {
            return dateDifference;
        }

        return Number(first.dataset.originalIndex) - Number(second.dataset.originalIndex);
    });

    if (eventsList) {
        cards.forEach(function (card) {
            eventsList.appendChild(card);
        });
    }
}());
