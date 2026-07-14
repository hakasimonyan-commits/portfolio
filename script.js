"use strict";

const header = document.querySelector("[data-header]");
const navToggle = document.querySelector(".nav-toggle");
const navLinksList = document.querySelector(".nav-links");
const revealElements = [
    ...document.querySelectorAll(
        "[data-reveal], .section, .project-showcase, .highlight-card, .skill-group"
    )
];
const anchorLinks = [...document.querySelectorAll('a[href^="#"]')];
const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const sections = [...document.querySelectorAll("main section[id]")];
const yearNode = document.querySelector("[data-year]");

const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
);

let scrollTicking = false;

const getHeaderOffset = () => {
    return header ? header.offsetHeight + 28 : 28;
};

const updateHeaderState = () => {
    if (!header) return;

    header.classList.toggle("is-scrolled", window.scrollY > 18);
};

const updateActiveNav = () => {
    if (!sections.length || !navLinks.length) return;

    const scrollPosition =
        window.scrollY + getHeaderOffset() + 32;

    let currentId = sections[0].id;

    sections.forEach((section) => {
        if (scrollPosition >= section.offsetTop) {
            currentId = section.id;
        }
    });

    navLinks.forEach((link) => {
        const isActive =
            link.getAttribute("href") === `#${currentId}`;

        link.classList.toggle("is-active", isActive);

        if (isActive) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });
};

const updateScrollState = () => {
    updateHeaderState();
    updateActiveNav();
    scrollTicking = false;
};

const requestScrollUpdate = () => {
    if (scrollTicking) return;

    scrollTicking = true;
    window.requestAnimationFrame(updateScrollState);
};

const setupSmoothScroll = () => {
    anchorLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            const targetSelector = link.getAttribute("href");

            if (
                !targetSelector ||
                targetSelector === "#"
            ) {
                return;
            }

            const target =
                document.querySelector(targetSelector);

            if (!target) return;

            event.preventDefault();

            const top =
                target.getBoundingClientRect().top +
                window.scrollY -
                getHeaderOffset();

            window.scrollTo({
                top,
                behavior: prefersReducedMotion.matches
                    ? "auto"
                    : "smooth"
            });

            window.history.replaceState(
                null,
                "",
                targetSelector
            );
        });
    });
};

const setupReveal = () => {
    if (!revealElements.length) return;

    if (prefersReducedMotion.matches) {
        revealElements.forEach((element) => {
            element.classList.add("is-visible", "show");
        });

        return;
    }

    const observer = new IntersectionObserver(
        (entries, currentObserver) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

               entry.target.classList.add("is-visible", "show");
                currentObserver.unobserve(entry.target);
            });
        },
        {
            threshold: 0.14,
            rootMargin: "0px 0px -72px 0px"
        }
    );

    revealElements.forEach((element) => {
        observer.observe(element);
    });
};

const syncYear = () => {
    if (yearNode) {
        yearNode.textContent =
            new Date().getFullYear();
    }
};

const init = () => {
    document.documentElement.classList.add("js");

    updateScrollState();
    setupSmoothScroll();
    if (navToggle && navLinksList) {
        navToggle.addEventListener("click", () => {
            const isOpen = navLinksList.classList.toggle("is-open");
            navToggle.classList.toggle("is-open", isOpen);
            navToggle.setAttribute("aria-expanded", String(isOpen));
        });

        navLinksList.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                navLinksList.classList.remove("is-open");
                navToggle.classList.remove("is-open");
                navToggle.setAttribute("aria-expanded", "false");
            });
        });
    }
    setupReveal();
    syncYear();

    window.addEventListener(
        "scroll",
        requestScrollUpdate,
        {
            passive: true
        }
    );

    window.addEventListener(
        "resize",
        requestScrollUpdate
    );

    prefersReducedMotion.addEventListener(
        "change",
        () => {
            if (prefersReducedMotion.matches) {
               revealElements.forEach((element) => {
    element.classList.add("is-visible", "show");
});
            }
        }
    );
};

init();