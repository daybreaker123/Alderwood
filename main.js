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

const taskTabs = Array.from(document.querySelectorAll(".task-tabs [role='tab']"));
const taskPanels = Array.from(document.querySelectorAll(".task-panel"));
const runButton = document.querySelector("#run-task");
const stepLabel = document.querySelector("#task-step-label");
const stepText = document.querySelector(".task-now-text");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let runTimer = null;
let activePanel = document.querySelector("#panel-invoice");

function stepsOf(panel) {
  return Array.from(panel.querySelectorAll(".flow li"));
}

function placeToken(panel) {
  const wrap = panel.querySelector(".flow-wrap");
  const token = panel.querySelector(".flow-token");
  const current = panel.querySelector(".flow li.is-current .node");
  if (!wrap || !token || !current) return;
  const wrapBox = wrap.getBoundingClientRect();
  const nodeBox = current.getBoundingClientRect();
  if (wrapBox.width === 0) return;
  const x = nodeBox.left + nodeBox.width / 2 - wrapBox.left - token.offsetWidth / 2;
  const y = nodeBox.top + nodeBox.height / 2 - wrapBox.top - token.offsetHeight / 2;
  token.style.transform = `translate(${x}px, ${y}px)`;
  token.classList.add("is-placed");
}

function showStep(panel, index) {
  const steps = stepsOf(panel);
  steps.forEach((step, i) => {
    step.classList.toggle("is-current", i === index);
    step.classList.toggle("is-done", i < index);
  });
  const detail = steps[index].querySelector(".step-detail").textContent;
  stepLabel.textContent = `Step ${index + 1} of ${steps.length}`;
  stepText.textContent = detail;
  requestAnimationFrame(() => placeToken(panel));
}

function stopRun() {
  clearInterval(runTimer);
  runTimer = null;
  runButton.disabled = false;
  runButton.textContent = "Run this task";
}

function runTask(panel) {
  stopRun();
  const steps = stepsOf(panel);
  let index = 0;
  showStep(panel, 0);
  runButton.disabled = true;
  runButton.textContent = "Running";
  const delay = reducedMotion ? 900 : 1400;
  runTimer = setInterval(() => {
    index += 1;
    if (index >= steps.length) {
      clearInterval(runTimer);
      runTimer = null;
      runButton.disabled = false;
      runButton.textContent = "Run it again";
      return;
    }
    showStep(panel, index);
  }, delay);
}

function selectTask(tab) {
  stopRun();
  runButton.textContent = "Run this task";
  taskTabs.forEach((item) => {
    const selected = item === tab;
    item.setAttribute("aria-selected", String(selected));
    item.tabIndex = selected ? 0 : -1;
  });
  taskPanels.forEach((panel) => {
    const show = panel.id === tab.getAttribute("aria-controls");
    panel.hidden = !show;
    if (show) activePanel = panel;
  });
  showStep(activePanel, 0);
}

taskTabs.forEach((tab) => {
  tab.addEventListener("click", () => selectTask(tab));
});

runButton.addEventListener("click", () => runTask(activePanel));

document.querySelectorAll(".flow li").forEach((step) => {
  step.addEventListener("click", () => {
    if (step.closest(".task-panel").hidden) return;
    stopRun();
    runButton.textContent = "Run this task";
    const steps = stepsOf(activePanel);
    showStep(activePanel, steps.indexOf(step));
  });
});

showStep(activePanel, 0);
window.addEventListener("resize", () => placeToken(activePanel));

const taskSection = document.querySelector("#task");
if (!reducedMotion && "IntersectionObserver" in window) {
  const watcher = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      watcher.disconnect();
      runTask(activePanel);
    },
    { threshold: 0.45 }
  );
  watcher.observe(taskSection);
}
