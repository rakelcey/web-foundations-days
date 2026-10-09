// Selecting DOM Elements
const noteText = document.getElementById("note-text");
const charCount = document.getElementById("char-count");
const wordCount = document.getElementById("word-count");
const clearBtn = document.getElementById("clear-btn");
const themeToggle = document.getElementById("theme-toggle");

// Updates counters, formatting classes, and local storage draft
function updateCounts() {
  const text = noteText.value;
  const charLength = text.length;

  // Calculate word count (filters out empty spaces)
  const trimmedText = text.trim();
  const words = trimmedText ? trimmedText.split(/\s+/).length : 0;

  // Update text outputs
  charCount.textContent = `${charLength} / 200 characters`;
  wordCount.textContent = `${words} ${words === 1 ? "word" : "words"}`;

  // Manage warning classes based on character limits
  charCount.classList.remove("warning", "over");
  if (charLength > 200) {
    charCount.classList.add("over");
  } else if (charLength > 180) {
    charCount.classList.add("warning");
  }

  // Save current text as draft in localStorage
  localStorage.setItem("noteDraft", text);
}

// Clears the textarea, counters, and saved draft
function clearAll() {
  noteText.value = "";
  localStorage.removeItem("noteDraft");
  updateCounts();
}

// Toggles theme on body, updates button text, and persists choice
function toggleTheme() {
  const isDark = document.body.classList.toggle("dark");
  themeToggle.textContent = isDark ? "Light mode" : "Dark mode";
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

// Restore saved state on page load
function initializePage() {
  // Restore saved theme
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "Light mode";
  } else {
    themeToggle.textContent = "Dark mode";
  }

  // Restore draft note text
  const savedDraft = localStorage.getItem("noteDraft");
  if (savedDraft !== null) {
    noteText.value = savedDraft;
  }

  // Initial call to set counts and classes
  updateCounts();
}

// Event Listeners
noteText.addEventListener("input", updateCounts);

clearBtn.addEventListener("click", clearAll);

themeToggle.addEventListener("click", toggleTheme);

noteText.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    clearAll();
  }
});

// Run setup when page finishes loading
initializePage();