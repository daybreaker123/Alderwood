const emailLink = document.querySelector("#contact-email");
const EMAIL = emailLink ? emailLink.textContent.trim() : "";

if (emailLink && EMAIL) {
  emailLink.href = `mailto:${EMAIL}`;
}

const header = document.querySelector(".site-header");
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#site-nav");

function setMenu(open) {
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  nav.classList.toggle("is-open", open);
}

function onScroll() {
  header.classList.toggle("is-scrolled", window.scrollY > 8);
}

onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

toggle.addEventListener("click", () => {
  setMenu(toggle.getAttribute("aria-expanded") !== "true");
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

document.addEventListener("focusin", (event) => {
  if (!nav.classList.contains("is-open")) return;
  if (nav.contains(event.target) || toggle.contains(event.target)) return;
  setMenu(false);
});

const form = document.querySelector("#intro-form");
const success = document.querySelector("#form-success");
const resetButton = document.querySelector("#reset-form");

function fieldValue(name) {
  return form.elements[name].value.trim();
}

function setRequired(field, message) {
  field.setCustomValidity(field.value.trim() ? "" : message);
}

form.addEventListener("input", (event) => {
  if (event.target.setCustomValidity) event.target.setCustomValidity("");
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (form.elements.fax.value) {
    showSuccess();
    return;
  }

  setRequired(form.elements.name, "Enter your name.");
  setRequired(form.elements.email, "Enter your work email.");
  setRequired(form.elements.company, "Enter your company.");
  setRequired(form.elements.role, "Enter your role.");

  if (!form.reportValidity()) return;

  const name = fieldValue("name");
  const email = fieldValue("email");
  const company = fieldValue("company");
  const role = fieldValue("role");
  const note = fieldValue("note");

  const body = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Company: ${company}`,
    `Role: ${role}`,
    note ? `About the work: ${note}` : null,
  ]
    .filter(Boolean)
    .join("\r\n");

  const subject = `Introductory conversation — ${company}`;
  window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  showSuccess();
});

function showSuccess() {
  form.hidden = true;
  success.hidden = false;
  success.focus();
}

resetButton.addEventListener("click", () => {
  form.reset();
  success.hidden = true;
  form.hidden = false;
  form.elements.name.focus();
});
