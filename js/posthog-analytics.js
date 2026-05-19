!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

(function() {
    var allowedHosts = ["stgenknights.com", "www.stgenknights.com"];

    if (!allowedHosts.includes(window.location.hostname)) {
        return;
    }

    window.posthog.init("phc_nQdUwsshRQc2KqCPmaaVSMLGWQA4DkRmcjDtVaVFxExN", {
        api_host: "https://us.i.posthog.com",
        defaults: "2026-01-30",
        capture_pageview: true,
        autocapture: true,
        person_profiles: "identified_only"
    });

    window.posthog.register({
        site: "stgenknights.com",
        council: "Knights of Columbus Council 14772"
    });

    function trackNewsletterReader() {
        if (!document.body || !document.body.classList.contains("reader-body")) {
            return;
        }

        var issueTitle = document.querySelector(".reader-title h1");
        var pages = Array.from(document.querySelectorAll(".reader-page"));
        var issue = issueTitle ? issueTitle.textContent.trim() : document.title;

        window.posthog.capture("knightline_issue_viewed", {
            issue: issue,
            page_count: pages.length,
            path: window.location.pathname
        });

        if ("IntersectionObserver" in window) {
            var seenPages = new Set();
            var observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (!entry.isIntersecting || entry.intersectionRatio < 0.55) {
                        return;
                    }

                    var pageNumber = entry.target.id.replace("page-", "");

                    if (seenPages.has(pageNumber)) {
                        return;
                    }

                    seenPages.add(pageNumber);
                    window.posthog.capture("knightline_page_read", {
                        issue: issue,
                        page_number: Number(pageNumber),
                        path: window.location.pathname
                    });
                });
            }, {
                threshold: [0.55]
            });

            pages.forEach(function(page) {
                observer.observe(page);
            });
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", trackNewsletterReader);
    } else {
        trackNewsletterReader();
    }
})();
