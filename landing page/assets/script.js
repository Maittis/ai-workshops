/* ============================================================
   AI-Preneur Workshops — Landing page form + signup backend
   ============================================================ */

/* Primary backend: saves each signup to the local SQLite database
   (viewed in the admin panel at /admin/). No setup needed.
   This is what runs on XAMPP. */
var API_URL = "api/submit.php";

/* Online backend (use this on Vercel): your Google Apps Script
   Web App /exec URL. The form tries API_URL first, and if that
   fails (e.g. on Vercel, where PHP doesn't run) it falls back to
   this URL, which saves the signup into your Google Sheet.

   Setup: see README.md -> "Optional: Google Sheets collection". */
var APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxpnG0PTbDFUFzU1JkJx5jIk1qTYgcDcKywwK9Q2Y_B-sWT3LMpEEeebJgecW5MFzWu/exec"; // example: https://script.google.com/macros/s/AKfycbxxxxx/exec

var form = document.getElementById("signupForm");
var submitBtn = document.getElementById("submitBtn");
var formWrap = form.closest(".form-wrap");
var formNote = document.getElementById("formNote");

document.getElementById("year").textContent = new Date().getFullYear();

/* ---- Validation helpers ---- */
var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var phoneRe = /^[+0-9][0-9 ()-]{7,16}$/;

function setInvalid(input, message) {
  var errEl = form.querySelector('.err[data-for="' + input.name + '"]');
  input.classList.add("invalid");
  if (errEl) errEl.textContent = message;
}

function clearInvalid(input) {
  var errEl = form.querySelector('.err[data-for="' + input.name + '"]');
  input.classList.remove("invalid");
  if (errEl) errEl.textContent = "";
  input.addEventListener("input", function () {
    input.classList.remove("invalid");
    if (errEl) errEl.textContent = "";
  }, { once: true });
}

function validateField(input) {
  var value = input.value.trim();
  if (input.required && !value) {
    setInvalid(input, "This field is required.");
    return false;
  }
  if (input.type === "email" && value && !emailRe.test(value)) {
    setInvalid(input, "Please enter a valid email address.");
    return false;
  }
  if (input.type === "tel" && value && !phoneRe.test(value)) {
    setInvalid(input, "Please enter a valid phone number.");
    return false;
  }
  return true;
}

function validateRadios(name) {
  var selected = form.querySelector('input[name="' + name + '"]:checked');
  var errEl = form.querySelector('.err[data-for="' + name + '"]');
  if (!selected) {
    if (errEl) errEl.textContent = "Please choose one option.";
    return false;
  }
  if (errEl) errEl.textContent = "";
  return true;
}

/* ---- Collect form data ---- */
function getFormData() {
  var fd = new FormData(form);
  var data = {};
  data["Full Name"] = fd.get("fullName").trim();
  data["Email"] = fd.get("email").trim();
  data["Phone Number"] = fd.get("phone").trim();
  data["Profession"] = fd.get("profession").trim();
  data["Class Time"] = fd.get("classTime");
  data["Level"] = fd.get("level");
  data["Message"] = (fd.get("message") || "").trim();
  data["Submitted At"] = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lusaka",
    dateStyle: "medium",
    timeStyle: "short",
    hour12: false
  }).format(new Date());
  return data;
}

/* ---- Submit ---- */
form.addEventListener("submit", function (e) {
  e.preventDefault();

  var inputs = form.querySelectorAll("input[type=text], input[type=email], input[type=tel], textarea");
  var valid = true;
  inputs.forEach(function (input) {
    if (!validateField(input)) valid = false;
  });
  if (!validateRadios("classTime")) valid = false;
  if (!validateRadios("level")) valid = false;
  if (!valid) return;

  var label = submitBtn.querySelector(".btn-label");
  var spinner = document.createElement("span");
  spinner.className = "btn-spinner";
  submitBtn.disabled = true;
  label.textContent = "Submitting...";
  submitBtn.prepend(spinner);

  var payload = getFormData();

  sendToBackend(payload)
    .then(function () {
      showSuccess(payload);
    })
    .catch(function () {
      setStatus("error");
    })
    .finally(function () {
      submitBtn.disabled = false;
      label.textContent = "Reserve My Spot";
      if (spinner.parentNode) spinner.parentNode.removeChild(spinner);
    });
});

function sendToBackend(payload) {
  var payloadJson = JSON.stringify(payload);
  return fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payloadJson
  })
    .then(function (res) {
      return res.json().catch(function () {
        return { ok: false };
      }).then(function (body) {
        if (!res.ok || !body.ok) throw new Error("local backend failed");
        return body;
      });
    })
    .catch(function (localErr) {
      if (!APPS_SCRIPT_URL) throw localErr;
      return fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: payloadJson
      }).then(function () {
        return { ok: true };
      });
    });
}

function showSuccess(data) {
  document.getElementById("successName").textContent = data["Full Name"].split(" ")[0];
  document.getElementById("successEmail").textContent = data["Email"];
  form.hidden = true;
  document.getElementById("formSuccess").hidden = false;
  window.scrollTo({ top: formWrap.offsetTop - 80, behavior: "smooth" });
}

function setStatus(state) {
  if (state === "error") {
    formNote.textContent = "Something went wrong sending your details. Please try again or contact us directly.";
    formNote.style.color = "#f87171";
  }
}