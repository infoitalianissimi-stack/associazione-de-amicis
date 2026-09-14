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
      button.textContent = "Copiato ✓";
      button.classList.add("is-copied");
      window.setTimeout(function () {
        button.textContent = original;
        button.classList.remove("is-copied");
      }, 2000);
    });
  });
})();
