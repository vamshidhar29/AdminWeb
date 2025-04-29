"use strict";

let isRtl = window.Helpers.isRtl(),
    isDarkStyle = window.Helpers.isDarkStyle(),
    menu, animate, isHorizontalLayout = !1;

document.getElementById("layout-menu") && (isHorizontalLayout = document.getElementById("layout-menu").classList.contains("menu-horizontal"));

function initialize() {
    document.querySelectorAll("#layout-menu").forEach(function (e) {
        menu = new Menu(e, {
            orientation: isHorizontalLayout ? "horizontal" : "vertical",
            closeChildren: !!isHorizontalLayout,
            showDropdownOnHover: window.templateCustomizer ? (window.templateCustomizer.settings.defaultShowDropdownOnHover || false) : false
        });
        window.Helpers.scrollToActive(animate = !1);
        window.Helpers.mainMenu = menu;
    });

    document.querySelectorAll(".layout-menu-toggle").forEach(e => {
        e.addEventListener("click", e => {
            e.preventDefault();
            window.Helpers.toggleCollapsed();
            if (config.enableMenuLocalStorage && !window.Helpers.isSmallScreen()) {
                try {
                    localStorage.setItem("templateCustomizer-" + templateName + "--LayoutCollapsed", String(window.Helpers.isCollapsed()));
                } catch (e) { }
            }
        });
    });

    const layoutMenu = document.getElementById("layout-menu");
    if (layoutMenu) {
        var t = layoutMenu;
        var n = function () {
            if (!Helpers.isSmallScreen()) {
                document.querySelector(".layout-menu-toggle").classList.add("d-block");
            }
        };
        let e = null;
        t.onmouseenter = function () {
            e = Helpers.isSmallScreen() ? setTimeout(n, 0) : setTimeout(n, 300);
        };
        t.onmouseleave = function () {
            document.querySelector(".layout-menu-toggle").classList.remove("d-block");
            clearTimeout(e);
        };
    }
    window.Helpers.swipeIn(".drag-target", function () {
        window.Helpers.setCollapsed(!1);
    });
    window.Helpers.swipeOut("#layout-menu", function () {
        if (window.Helpers.isSmallScreen()) {
            window.Helpers.setCollapsed(!0);
        }
    });

    let menuInnerElements = document.getElementsByClassName("menu-inner"),
        menuInnerShadow = document.getElementsByClassName("menu-inner-shadow")[0];
    if (menuInnerElements.length > 0 && menuInnerShadow) {
        menuInnerElements[0].addEventListener("ps-scroll-y", function () {
            menuInnerShadow.style.display = this.querySelector(".ps__thumb-y").offsetTop ? "block" : "none";
        });
    }

    let styleSwitcherToggle = document.querySelector(".style-switcher-toggle");
    function updateImages(n) {
        document.querySelectorAll(`[data-app-${n}-img]`).forEach(function (e) {
            var imgSrc = e.getAttribute(`data-app-${n}-img`);
            e.src = assetsPath + "img/" + imgSrc;
        });
    }

    let dropdownLanguage = document.getElementsByClassName("dropdown-language");
    if (dropdownLanguage.length) {
        let items = dropdownLanguage[0].querySelectorAll(".dropdown-item");
        items.forEach(function (item) {
            item.addEventListener("click", function () {
                let language = this.getAttribute("data-language"),
                    iconClass = this.querySelector(".fi").getAttribute("class"),
                    fontSizeClass = iconClass.split(" ").filter(function (cls) {
                        return cls.startsWith("fs-");
                    }).join(" ").trim() + " fs-3";

                this.parentNode.querySelectorAll(".dropdown-item").forEach(child => child.classList.remove("selected"));
                this.classList.add("selected");
                dropdownLanguage[0].querySelector(".dropdown-toggle .fi").className = fontSizeClass;
                i18next.changeLanguage(language, (err) => {
                    if (err) console.log("something went wrong loading", err);
                    updateText();
                });
            });
        });
    }

    function updateText() {
        var elements = document.querySelectorAll("[data-i18n]"),
            selectedItem = document.querySelector(`.dropdown-item[data-language="${i18next.language}"]`);
        if (selectedItem) {
            selectedItem.click();
        }
        elements.forEach(function (element) {
            element.innerHTML = i18next.t(element.dataset.i18n);
        });
    }

    var notificationsAll = document.querySelector(".dropdown-notifications-all");
    function handleCollapseEvent(e) {
        if (e.type === "show.bs.collapse") {
            e.target.closest(".accordion-item").classList.add("active");
        } else if (e.type === "hide.bs.collapse") {
            e.target.closest(".accordion-item").classList.remove("active");
        }
    }
    const notificationsRead = document.querySelectorAll(".dropdown-notifications-read");
    if (notificationsAll) {
        notificationsAll.addEventListener("click", () => {
            notificationsRead.forEach(item => item.closest(".dropdown-notifications-item").classList.add("marked-as-read"));
        });
    }
    notificationsRead.forEach(item => {
        item.addEventListener("click", () => {
            item.closest(".dropdown-notifications-item").classList.toggle("marked-as-read");
        });
    });
    document.querySelectorAll(".dropdown-notifications-archive").forEach(item => {
        item.addEventListener("click", () => {
            item.closest(".dropdown-notifications-item").remove();
        });
    });
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(elem => new bootstrap.Tooltip(elem));
    document.querySelectorAll(".accordion").forEach(elem => {
        elem.addEventListener("show.bs.collapse", handleCollapseEvent);
        elem.addEventListener("hide.bs.collapse", handleCollapseEvent);
    });
    if (isRtl) {
        Helpers._addClass("dropdown-menu-end", document.querySelectorAll("#layout-navbar .dropdown-menu"));
    }
    window.Helpers.setAutoUpdate(true);
    window.Helpers.initPasswordToggle();
    window.Helpers.initSpeechToText();
    window.Helpers.initNavbarDropdownScrollbar();
    window.addEventListener("resize", function () {
        if (window.innerWidth >= window.Helpers.LAYOUT_BREAKPOINT) {
            let searchInputWrapper = document.querySelector(".search-input-wrapper");
            if (searchInputWrapper) {
                searchInputWrapper.classList.add("d-none");
                document.querySelector(".search-input").value = "";
            }
            let horizontalMenu = document.querySelector("[data-template^='horizontal-menu']");
            if (horizontalMenu) {
                setTimeout(function () {
                    let layoutMenu = document.getElementById("layout-menu");
                    if (layoutMenu) {
                        if (window.innerWidth < window.Helpers.LAYOUT_BREAKPOINT && layoutMenu.classList.contains("menu-horizontal")) {
                            menu.switchMenu("vertical");
                        } else if (layoutMenu.classList.contains("menu-vertical")) {
                            menu.switchMenu("horizontal");
                        }
                    }
                }, 100);
            }
        }
    }, true);

    if (!isHorizontalLayout && !window.Helpers.isSmallScreen() && config && typeof TemplateCustomizer !== "undefined" && window.templateCustomizer && window.templateCustomizer.settings && window.templateCustomizer.settings.defaultMenuCollapsed) {
        window.Helpers.setCollapsed(true, false);
        try {
            let layoutCollapsed = localStorage.getItem("templateCustomizer-" + templateName + "--LayoutCollapsed");
            if (layoutCollapsed !== null && layoutCollapsed !== "false") {
                window.Helpers.setCollapsed(layoutCollapsed === "true", false);
            }
        } catch (e) { }
    }
}

initialize();

if (typeof $ !== "undefined") {
    $(function () {
        window.Helpers.initSidebarToggle();
        let searchToggler = $(".search-toggler"),
            searchInputWrapper = $(".search-input-wrapper"),
            searchInput = $(".search-input"),

        searchToggler.length && searchToggler.on("click", function () {
            if (searchInputWrapper.length) {
                searchInputWrapper.toggleClass("d-none");
                searchInput.focus();
            }
        });

        $(document).on("keydown", function (e) {
            if (e.ctrlKey && e.which === 191 && searchInputWrapper.length) {
                searchInputWrapper.toggleClass("d-none");
                searchInput.focus();
            }
        });

        searchInput.on("focus", function () {
            if (searchInputWrapper.hasClass("container-xxl")) {
                searchInputWrapper.find(".twitter-typeahead").addClass("container-xxl");
            }
        });

        let searchData = [];
        $.ajax({
            url: assetsPath + "json/" + (document.getElementById("layout-menu")?.classList.contains("menu-horizontal") ? "search-horizontal.json" : "search-vertical.json"),
            dataType: "json",
            async: false,
            success: function (data) {
                searchData = data;
            }
        });

        searchInput.typeahead({
            minLength: 1,
            highlight: true
        }, {
            name: "pages",
            display: "name",
            limit: 5,
            source: function (query, syncResults) {
                let results = searchData.pages.filter(item => item.name.toLowerCase().startsWith(query.toLowerCase()));
                syncResults(results);
            },
            templates: {
                header: '<h6 class="suggestions-header text-primary mb-0 mx-3 mt-3 pb-2">Pages</h6>',
                suggestion: function (data) {
                    return '<a href="' + data.href + '" class="list-group-item list-group-item-action">' + data.name + "</a>";
                }
            }
        }).on("typeahead:selected", function (e, suggestion) {
            if (suggestion && suggestion.href) {
                window.location = suggestion.href;
            }
        });
    });
}
