const WEDDING_DATE = new Date("2026-08-27T15:00:00+08:00");
const MUSIC = {
  ru: "assets/music/ru.mp3",
  ko: "assets/music/ko.mp3",
  ja: "assets/music/ja.mp3"
};

const MUSIC_START_AT = {
  ru: 170,
  ko: 0,
  ja: 0
};

const MUSIC_FADE_IN = {
  ru: 3,
  ko: 0,
  ja: 0
};

function fadeInAudio(audio, durationSeconds = 0) {
  if (!durationSeconds) {
    audio.volume = 1;
    return;
  }

  audio.volume = 0;

  const steps = 30;
  const stepTime = (durationSeconds * 1000) / steps;
  let currentStep = 0;

  const fade = setInterval(() => {
    currentStep += 1;
    audio.volume = Math.min(currentStep / steps, 1);

    if (currentStep >= steps) {
      clearInterval(fade);
      audio.volume = 1;
    }
  }, stepTime);
}

function applyMusicStartTime(audio, lang = currentLang) {
  const startAt = MUSIC_START_AT[lang] || 0;
  if (audio.currentTime < startAt) {
    audio.currentTime = startAt;
  }
}

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxlosjqzt23rT8RWM0ZmAADPXVVyAwpgFh9iG7_ABNw1I5qkTM5WwzNxaKn-IyFzg-6iw/exec"; // сюда вставить URL Google Apps Script

async function submitRsvpForm(data) {
  const response = await fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error(`RSVP request failed with HTTP ${response.status}`);
  }

  const result = await response.json();
  if (!result || result.status !== "ok") {
    throw new Error(result?.message || "RSVP was not saved");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("inviteLang");
  applyTranslations(savedLang || "ru");
  initLangs();
  initIntro();
  initReveal();
  initCountdown();
  initModal();
  initMusic();
  initForm();
  initMap();
  initGallery();
});

function initLangs() {
  document.querySelectorAll(".lang").forEach((button) => {
    button.addEventListener("click", () => applyTranslations(button.dataset.lang));
  });
}

function initIntro() {
  const openButton = document.getElementById("openInvite");
  const intro = document.getElementById("intro");
  if (!openButton || !intro) return;

  document.body.classList.add("intro-active");

  openButton.addEventListener("click", async () => {
    if (intro.classList.contains("intro--opening")) return;

    intro.classList.add("intro--opening");
    document.body.classList.remove("intro-active");

    window.setTimeout(() => {
      intro.classList.add("hidden");
    }, 1250);

    await startMusic();
  });
}

function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
}

function initCountdown() {
  const ids = ["days", "hours", "minutes", "seconds"];

  function updateCountdown() {
    const distance = Math.max(WEDDING_DATE - new Date(), 0);
    const values = [
      Math.floor(distance / 86400000),
      Math.floor(distance / 3600000) % 24,
      Math.floor(distance / 60000) % 60,
      Math.floor(distance / 1000) % 60
    ];

    ids.forEach((id, index) => {
      const node = document.getElementById(id);
      if (node) node.textContent = String(values[index]).padStart(2, "0");
    });
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

function initModal() {
  const modal = document.getElementById("modal");
  const openButton = document.getElementById("openRsvp");
  if (!modal || !openButton) return;

  openButton.addEventListener("click", () => {
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  });

  document.querySelectorAll("[data-close]").forEach((element) => {
    element.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });

  function closeModal() {
    modal.classList.remove("open");
    document.body.style.overflow = "";
  }
}

function initMusic() {
  const audio = document.getElementById("audio");
  const button = document.getElementById("musicToggle");
  if (!audio || !button) return;

  audio.src = MUSIC[currentLang] || MUSIC.ru;

  window.addEventListener("languageChanged", async (event) => {
    const wasPlaying = !audio.paused;
    audio.src = MUSIC[event.detail.lang] || MUSIC.ru;
    audio.load();
    applyMusicStartTime(audio, event.detail.lang);
    if (wasPlaying) await startMusic();
  });

  button.addEventListener("click", async () => {
    if (audio.paused) {
      await startMusic();
      return;
    }

    audio.pause();
    button.classList.add("muted");
    button.textContent = "♪";
    button.setAttribute("aria-label", "music off");
  });
}

async function startMusic() {
  const audio = document.getElementById("audio");
  const button = document.getElementById("musicToggle");
  if (!audio) return;

  if (!audio.src) audio.src = MUSIC[currentLang] || MUSIC.ru;

  try {
    audio.muted = false;
    applyMusicStartTime(audio, currentLang);
    fadeInAudio(audio, MUSIC_FADE_IN[currentLang] || 0);
    await audio.play();
    if (button) {
      button.classList.remove("muted");
      button.textContent = "♪";
      button.setAttribute("aria-label", "music on");
    }
  } catch (error) {
    console.warn("Music blocked", error);
  }
}

function initMap() {
  const mapToggle = document.getElementById("mapToggle");
  const mapFrame = document.getElementById("mapFrame");
  if (!mapToggle || !mapFrame) return;

  function updateMapButton() {
    mapToggle.textContent = mapFrame.classList.contains("open") ? t("mapHide") : t("map");
  }

  mapToggle.addEventListener("click", () => {
    mapFrame.classList.toggle("open");
    updateMapButton();
  });

  window.addEventListener("languageChanged", updateMapButton);
  updateMapButton();
}

function initGallery() {
  const carousel = document.querySelector(".galleryCarousel");
  if (!carousel) return;

  const items = [...carousel.querySelectorAll("figure")];
  const prev = carousel.querySelector(".galleryPrev");
  const next = carousel.querySelector(".galleryNext");
  const current = document.getElementById("galleryCurrent");
  const total = document.getElementById("galleryTotal");
  let index = 0;

  if (total) total.textContent = String(items.length).padStart(2, "0");

  function render() {
    items.forEach((item, itemIndex) => {
      let offset = itemIndex - index;
      if (offset > items.length / 2) offset -= items.length;
      if (offset < -items.length / 2) offset += items.length;

      item.dataset.offset = String(offset);
      item.classList.toggle("is-active", offset === 0);
    });

    if (current) current.textContent = String(index + 1).padStart(2, "0");
  }

  function go(delta) {
    index = (index + delta + items.length) % items.length;
    render();
  }

  prev?.addEventListener("click", () => go(-1));
  next?.addEventListener("click", () => go(1));

  items.forEach((item, itemIndex) => {
    item.addEventListener("click", () => {
      index = itemIndex;
      render();
    });
  });

  render();
}

function initForm() {
  const form = document.getElementById("rsvpForm");
  const status = document.getElementById("formStatus");
  const button = document.getElementById("submitBtn");
  if (!form || !status || !button) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    data.food = formData.getAll("food");
    data.createdAt = new Date().toISOString();

    status.textContent = t("sending");
    button.disabled = true;

    try {
      if (GOOGLE_SCRIPT_URL) {
        await submitRsvpForm(data);
      } else {
        console.log("FORM DATA", data);
        await new Promise((resolve) => setTimeout(resolve, 700));
      }

      status.textContent = t("success");
      form.reset();
      document.getElementById("formLang").value = currentLang;
    } catch (error) {
      console.error(error);
      status.textContent = t("error");
    } finally {
      button.disabled = false;
    }
  });
}
