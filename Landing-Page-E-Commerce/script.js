const nav = document.getElementById("nav");
const phone = document.getElementById("phone3d");
const revealEls = document.querySelectorAll(
  ".reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-scale"
);

document.addEventListener("contextmenu", (event) => event.preventDefault());
document.addEventListener("dragstart", (event) => event.preventDefault());
document.addEventListener("selectstart", (event) => event.preventDefault());
document.addEventListener("copy", (event) => event.preventDefault());
document.addEventListener("cut", (event) => event.preventDefault());

document.querySelectorAll("img, a, button, svg").forEach((element) => {
  element.setAttribute("draggable", "false");
});

document.querySelectorAll("[data-url]").forEach((element) => {
  element.setAttribute("role", "button");
  element.setAttribute("tabindex", "0");

  function openExternalUrl() {
    window.open(element.dataset.url, "_blank", "noopener");
  }

  element.addEventListener("click", openExternalUrl);
  element.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openExternalUrl();
    }
  });
});

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  const isZoomShortcut =
    (event.ctrlKey || event.metaKey) && ["+", "-", "=", "0"].includes(key);
  const blockedKeys =
    event.key === "F12" ||
    isZoomShortcut ||
    (event.ctrlKey && event.shiftKey && ["i", "j", "c"].includes(key)) ||
    (event.ctrlKey && ["u", "s", "p"].includes(key));

  if (blockedKeys) {
    event.preventDefault();
    event.stopPropagation();
  }
});

document.addEventListener(
  "wheel",
  (event) => {
    if (event.ctrlKey) event.preventDefault();
  },
  { passive: false }
);

document.addEventListener(
  "gesturestart",
  (event) => {
    event.preventDefault();
  },
  { passive: false }
);

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 24);
  updateJourney();
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const href = anchor.getAttribute("href");
    if (href === "#") return;

    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

document.querySelectorAll(".pix-copy").forEach((button) => {
  button.addEventListener("click", async () => {
    const pixKey = button.dataset.pix;
    if (!pixKey) return;

    try {
      await navigator.clipboard.writeText(pixKey);
      const originalText = button.textContent;
      button.textContent = "Pix copiado";
      window.setTimeout(() => {
        button.textContent = originalText;
      }, 1600);
    } catch {
      window.prompt("Copie a chave Pix:", pixKey);
    }
  });
});

function formatCurrency(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

document.querySelectorAll("[data-options]").forEach((options) => {
  const qtyValue = options.querySelector("[data-qty-value]");
  const priceEls = options.querySelectorAll("[data-unit-price]");
  const totalEl = options.querySelector("[data-options-total]");
  let quantity = Number(qtyValue?.textContent || 1);

  function updateOptionPrices() {
    let total = 0;

    priceEls.forEach((priceEl) => {
      const unitPrice = Number(priceEl.dataset.unitPrice || 0);
      const itemTotal = unitPrice * quantity;
      total += itemTotal;
      priceEl.textContent = `+ ${formatCurrency(itemTotal)}`;
    });

    if (qtyValue) qtyValue.textContent = quantity;
    if (totalEl) totalEl.textContent = formatCurrency(total);
  }

  options.querySelectorAll("[data-qty-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.qtyAction;
      quantity = action === "increase" ? quantity + 1 : Math.max(1, quantity - 1);
      updateOptionPrices();
    });
  });

  updateOptionPrices();
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.14 }
);

revealEls.forEach((el) => revealObserver.observe(el));

window.addEventListener("mousemove", (event) => {
  if (!phone || window.matchMedia("(max-width: 900px)").matches) return;

  const x = (event.clientX / window.innerWidth - 0.5) * 10;
  const y = (event.clientY / window.innerHeight - 0.5) * 8;
  phone.style.transform = `rotateX(${9 - y}deg) rotateY(${-16 + x}deg) rotateZ(2deg)`;
});

window.addEventListener("mouseleave", () => {
  if (!phone) return;
  phone.style.transform = "";
});

const journeyStage = document.getElementById("journeyStage");
const travelCard = document.getElementById("travelCard");
const lineFill = document.getElementById("lineFill");
const journeySteps = document.querySelectorAll(".journey-step");

function updateJourney() {
  if (!journeyStage || !travelCard || !lineFill) return;

  const rect = journeyStage.getBoundingClientRect();
  const viewport = window.innerHeight;
  const rawProgress = (viewport * 0.42 - rect.top) / (rect.height - viewport * 0.42);
  const progress = clamp(rawProgress, 0, 1);
  const wave = Math.sin(progress * Math.PI * 2);
  const x = wave * Math.min(140, window.innerWidth * 0.14);
  const rotateY = -34 + progress * 68;
  const rotateZ = -8 + progress * 16;
  const rotateX = 16 - progress * 32;

  travelCard.style.transform = `translate3d(${x}px, 0, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;
  lineFill.style.height = `${progress * 100}%`;

  const activeIndex = Math.min(journeySteps.length - 1, Math.floor(progress * journeySteps.length));
  journeySteps.forEach((step, index) => {
    step.classList.toggle("active", index === activeIndex);
  });
}

document.querySelectorAll(".feature-card").forEach((card) => {
  card.addEventListener("mousemove", (event) => {
    if (window.matchMedia("(max-width: 900px)").matches) return;

    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(900px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg) translateY(-4px)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
});

updateJourney();
