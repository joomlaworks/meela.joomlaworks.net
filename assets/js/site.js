/* Meela site */

(function () {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // The phone menu
    var nav = document.getElementById("nav"), menuBtn = document.getElementById("menuBtn");
    menuBtn.addEventListener("click", function () { menuBtn.setAttribute("aria-expanded", nav.classList.toggle("open")) });
    nav.querySelectorAll(".nav-links a").forEach(function (a) { a.addEventListener("click", function () { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false") }) });

    // The logo links: back to the very top like a link home, without "#top" in the address bar
    document.querySelectorAll('a[href="#top"]').forEach(function (a) {
        a.addEventListener("click", function (e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
            if (location.hash && history.replaceState) history.replaceState(null, "", location.pathname + location.search);
        });
    });

    // The hero's thread plays once: the question, Baldrick typing, its answer, the thanks, "Resolved"
    var convo = document.querySelector(".convo");
    if (convo && !reduce) {
        var posts = convo.querySelectorAll(".post"), typing = convo.querySelector(".typing"), resolved = convo.querySelector(".resolved");
        convo.classList.add("play");
        var steps = [
            [300, function () { posts[0].classList.add("in") }],
            [900, function () { typing.classList.add("on") }],
            [1700, function () { typing.classList.remove("on"); posts[1].classList.add("in") }],
            [1500, function () { posts[2].classList.add("in") }],
            [700, function () { resolved.classList.add("in") }]
        ];
        var t = 0;
        steps.forEach(function (s) { t += s[0]; setTimeout(s[1], t) });
    }

    // Carousels: one screenshot at a time, moved with the arrows, the dots, a swipe or the arrow keys (without JavaScript, a row to scroll)
    document.querySelectorAll("[data-carousel]").forEach(function (box) {
        var track = box.querySelector(".car-track"), slides = Array.prototype.slice.call(track.children), n = slides.length, cur = 0;
        if (n < 2) return;
        var bar = document.createElement("div"), dots = document.createElement("div");
        bar.className = "car-nav"; dots.className = "car-dots";
        function button(cls, label, text) {
            var b = document.createElement("button");
            b.type = "button"; b.className = cls; b.setAttribute("aria-label", label); b.textContent = text;
            return b;
        }
        var prev = button("car-btn", "Previous screenshot", "←"), next = button("car-btn", "Next screenshot", "→");
        var dotList = slides.map(function (s, i) {
            var d = button("car-dot", "Screenshot " + (i + 1) + " of " + n, "");
            d.addEventListener("click", function () { go(i) });
            dots.appendChild(d);
            return d;
        });
        bar.appendChild(prev); bar.appendChild(dots); bar.appendChild(next);
        box.appendChild(bar);
        box.querySelector(".car-viewport").setAttribute("aria-live", "polite");
        function go(i) {
            cur = (i + n) % n;
            track.style.transform = "translateX(" + (-100 * cur) + "%)";
            slides.forEach(function (s, k) {
                s.setAttribute("aria-hidden", k === cur ? "false" : "true");
                var a = s.querySelector("a");
                if (a) a.tabIndex = k === cur ? 0 : -1;
            });
            dotList.forEach(function (d, k) { d.setAttribute("aria-current", k === cur ? "true" : "false") });
        }
        prev.addEventListener("click", function () { go(cur - 1) });
        next.addEventListener("click", function () { go(cur + 1) });
        box.addEventListener("keydown", function (e) {
            if (e.key === "ArrowLeft") { e.preventDefault(); go(cur - 1) }
            else if (e.key === "ArrowRight") { e.preventDefault(); go(cur + 1) }
        });
        // A swipe follows the finger; a click that ended a swipe doesn't open the screenshot
        var startX = null, dx = 0, moved = false;
        track.addEventListener("pointerdown", function (e) {
            if (e.pointerType === "mouse" && e.button !== 0) return;
            startX = e.clientX; dx = 0; moved = false;
        });
        track.addEventListener("pointermove", function (e) {
            if (startX === null) return;
            dx = e.clientX - startX;
            if (!moved && Math.abs(dx) > 8) { moved = true; track.classList.add("is-dragging"); track.setPointerCapture(e.pointerId) }
            if (moved) track.style.transform = "translateX(calc(" + (-100 * cur) + "% + " + dx + "px))";
        });
        function end() {
            if (startX === null) return;
            startX = null; track.classList.remove("is-dragging");
            if (moved && Math.abs(dx) > track.offsetWidth / 6) go(dx < 0 ? cur + 1 : cur - 1); else go(cur);
        }
        track.addEventListener("pointerup", end);
        track.addEventListener("pointercancel", end);
        track.addEventListener("click", function (e) { if (moved) { e.preventDefault(); e.stopImmediatePropagation(); moved = false } }, true);
        track.addEventListener("dragstart", function (e) { e.preventDefault() });
        box.classList.add("is-ready");
        go(0);
    });

    // Screenshots: open the full size in a dialog (a plain link to the image without JavaScript)
    var viewer = document.getElementById("viewer"), vImg = document.getElementById("viewerImg"), vCap = document.getElementById("viewerCaption");
    if (viewer.showModal) {
        document.querySelectorAll("a.zoom").forEach(function (a) {
            a.addEventListener("click", function (e) {
                e.preventDefault();
                var img = a.querySelector("img");
                vImg.src = a.getAttribute("href"); vImg.alt = img ? img.alt : ""; vCap.textContent = a.getAttribute("data-caption") || "";
                viewer.showModal();
            });
        });
        document.getElementById("viewerClose").addEventListener("click", function () { viewer.close() });
        viewer.addEventListener("click", function (e) { if (e.target === viewer) viewer.close() });
    }
}());
