(function () {
  "use strict";

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");

  function setOpen(open) {
    if (!nav || !toggle) {
      return;
    }
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("nav-open", open);
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setOpen(!nav.classList.contains("is-open"));
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setOpen(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    });
  }

  document.querySelectorAll('a[href=""], [data-pending-form]').forEach(function (el) {
    el.addEventListener("click", function (event) {
      if (!el.getAttribute("href")) {
        event.preventDefault();
      }
    });
  });

  document.querySelectorAll("a.is-disabled").forEach(function (el) {
    el.addEventListener("click", function (event) {
      event.preventDefault();
    });
  });

  function copyFallback(value) {
    var field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.top = "0";
    field.style.left = "0";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.focus();
    field.select();
    var ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (error) {
      ok = false;
    }
    document.body.removeChild(field);
    if (!ok) {
      throw new Error("Copia non riuscita");
    }
  }

  function copyText(value) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(value).catch(function () {
        copyFallback(value);
      });
    }

    return new Promise(function (resolve, reject) {
      try {
        copyFallback(value);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  document.querySelectorAll(".js-copy").forEach(function (button) {
    var original = button.textContent;

    button.addEventListener("click", function () {
      var value = button.getAttribute("data-copy") || "";
      copyText(value).catch(function () {});
      button.textContent = button.getAttribute("data-copied") || "Copiato ✓";
      button.classList.add("is-copied");
      window.setTimeout(function () {
        button.textContent = original;
        button.classList.remove("is-copied");
      }, 2000);
    });
  });

  var pdfWrap = document.getElementById("pdf-adesione-wrap");
  if (pdfWrap) {
    var pdfLink = pdfWrap.querySelector(".js-pdf-adesione");
    var pdfFallback = pdfWrap.querySelector(".pdf-fallback");
    var pdfHref = pdfLink ? pdfLink.getAttribute("href") : "assets/moduli/modulo-adesione-privacy.pdf";
    fetch(pdfHref, { method: "HEAD" }).then(function (response) {
      if (response.status === 404 && pdfLink && pdfFallback) {
        pdfLink.hidden = true;
        pdfFallback.hidden = false;
      }
    }).catch(function () {});
  }

  var track = document.querySelector(".partner-track");
  var prev = document.querySelector(".partner-arrow--prev");
  var next = document.querySelector(".partner-arrow--next");
  var modal = document.getElementById("partner-modal");
  var lastFocus = null;

  function slideWidth() {
    var slide = track && track.querySelector(".partner-slide");
    if (!slide) {
      return 0;
    }
    var styles = window.getComputedStyle(track);
    var gap = parseFloat(styles.columnGap || styles.gap) || 16;
    return slide.getBoundingClientRect().width + gap;
  }

  function updateArrows() {
    if (!track || !prev || !next) {
      return;
    }
    var max = track.scrollWidth - track.clientWidth - 4;
    prev.disabled = track.scrollLeft <= 4;
    next.disabled = track.scrollLeft >= max;
  }

  if (track && prev && next) {
    prev.addEventListener("click", function () {
      track.scrollBy({ left: -slideWidth(), behavior: "smooth" });
    });
    next.addEventListener("click", function () {
      track.scrollBy({ left: slideWidth(), behavior: "smooth" });
    });
    track.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    updateArrows();
  }

  function isFinePointer() {
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }

  document.querySelectorAll(".partner-slide").forEach(function (card) {
    var maps = (card.getAttribute("data-maps") || "").trim();
    var mapsLink = card.querySelector(".js-partner-maps");
    if (maps && mapsLink) {
      mapsLink.hidden = false;
      mapsLink.href = maps;
    }

    card.addEventListener("click", function (event) {
      if (isFinePointer()) {
        return;
      }
      if (event.target.closest("a, button")) {
        return;
      }
      document.querySelectorAll(".partner-slide.is-flipped").forEach(function (open) {
        if (open !== card) {
          open.classList.remove("is-flipped");
        }
      });
      card.classList.toggle("is-flipped");
    });

    card.addEventListener("keydown", function (event) {
      if (event.target !== card) {
        return;
      }
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }
      event.preventDefault();
      if (isFinePointer()) {
        return;
      }
      card.classList.toggle("is-flipped");
    });
  });

  function textOrHide(el, value) {
    if (!el) {
      return;
    }
    if (value) {
      el.hidden = false;
      el.textContent = value;
    } else {
      el.hidden = true;
      el.textContent = "";
    }
  }

  function closePartnerModal() {
    if (!modal || modal.hidden) {
      return;
    }
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    if (lastFocus && lastFocus.focus) {
      lastFocus.focus();
    }
  }

  function openPartnerModal(card, trigger) {
    if (!modal) {
      return;
    }
    lastFocus = trigger;
    document.getElementById("partner-modal-title").textContent = card.getAttribute("data-name") || "";
    document.getElementById("partner-modal-cat").textContent = card.getAttribute("data-category") || "";
    textOrHide(document.getElementById("partner-modal-note"), (card.getAttribute("data-note") || "").trim());
    document.getElementById("partner-modal-perk").textContent =
      (card.getAttribute("data-benefit") || "").trim() || "Convenzione in aggiornamento";
    textOrHide(document.getElementById("partner-modal-conditions"), (card.getAttribute("data-conditions") || "").trim());
    textOrHide(document.getElementById("partner-modal-address"), (card.getAttribute("data-address") || "").trim());
    textOrHide(document.getElementById("partner-modal-phone"), (card.getAttribute("data-phone") || "").trim());
    textOrHide(document.getElementById("partner-modal-web"), (card.getAttribute("data-web") || "").trim());

    var mapsUrl = (card.getAttribute("data-maps") || "").trim();
    var mapsBtn = document.getElementById("partner-modal-maps");
    if (mapsUrl) {
      mapsBtn.hidden = false;
      mapsBtn.href = mapsUrl;
      mapsBtn.setAttribute("aria-label", "Dove si trova " + (card.getAttribute("data-name") || ""));
    } else {
      mapsBtn.hidden = true;
      mapsBtn.removeAttribute("href");
    }

    var logoHost = document.getElementById("partner-modal-logo");
    logoHost.innerHTML = "";
    var sourceLogo = card.querySelector(".partner-logo");
    if (sourceLogo && !sourceLogo.hidden && sourceLogo.naturalWidth) {
      var clone = sourceLogo.cloneNode(true);
      clone.removeAttribute("onerror");
      logoHost.appendChild(clone);
      logoHost.classList.remove("is-fallback");
    } else {
      var fallback = document.createElement("span");
      fallback.className = "partner-logo-fallback";
      fallback.textContent = card.getAttribute("data-name") || "";
      logoHost.appendChild(fallback);
      logoHost.classList.add("is-fallback");
    }

    modal.hidden = false;
    document.body.classList.add("modal-open");
    modal.querySelector(".partner-modal-close").focus();
  }

  document.querySelectorAll(".js-partner-detail").forEach(function (button) {
    button.addEventListener("click", function () {
      openPartnerModal(button.closest(".partner-slide"), button);
    });
  });

  document.querySelectorAll(".js-modal-close").forEach(function (el) {
    el.addEventListener("click", closePartnerModal);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closePartnerModal();
    }
  });
})();
