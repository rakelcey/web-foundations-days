// Starting data
let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];

// 1. searchNotes(word)
// Returns an array of notes whose text contains word, ignoring case.
function searchNotes(word) {
  const searchTerm = word.toLowerCase();
  return notes.filter((note) => note.text.toLowerCase().includes(searchTerm));
}

// 2. longestNote()
// Returns the note object with the most characters, or null if empty.
function longestNote() {
  if (notes.length === 0) return null;
  return notes.reduce((longest, current) =>
    current.text.length > longest.text.length ? current : longest
  );
}

// 3. countByCategory()
// Returns an object counting notes per category.
function countByCategory() {
  const counts = {};
  for (const note of notes) {
    counts[note.category] = (counts[note.category] || 0) + 1;
  }
  return counts;
}

// 4. getSummary()
// Returns a summary sentence using template literal and handling singular/plural.
function getSummary() {
  const totalNotes = notes.length;
  const counts = countByCategory();
  const categoryPairs = [];

  for (const [cat, count] of Object.entries(counts)) {
    categoryPairs.push(`${count} ${cat}`);
  }

  const categoryString = categoryPairs.join(", ");
  const noteWord = totalNotes === 1 ? "note" : "notes";

  return `${totalNotes} ${noteWord}: ${categoryString}.`;
}

// 5. isDuplicate(text)
// Returns true if a note with the same text exists (ignoring case and extra spaces).
function isDuplicate(text) {
  const cleanText = text.trim().toLowerCase();
  return notes.some((note) => note.text.trim().toLowerCase() === cleanText);
}

// 6. addNote(text, category)
// Adds a note if valid, logging the reason on failure.
function addNote(text, category) {
  const validCategories = ["personal", "work", "study"];

  if (!text || text.length < 1 || text.length > 200) {
    console.log("Failed to add note: Text length must be between 1 and 200 characters.");
    return false;
  }

  if (!validCategories.includes(category)) {
    console.log(`Failed to add note: Category must be one of ${validCategories.join(", ")}.`);
    return false;
  }

  if (isDuplicate(text)) {
    console.log("Failed to add note: Duplicate note text already exists.");
    return false;
  }

  const newId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) + 1 : 1;
  notes.push({ id: newId, text: text, category: category });
  return true;
}

// ==========================================
// TESTING & VERIFICATION (Console Logs)
// ==========================================

console.log("--- Testing searchNotes ---");
console.log(searchNotes("javascript")); 
// Expected output: [ { id: 4, text: "Revise JavaScript arrays", category: "study" } ]
console.log(searchNotes("python")); 
// Expected output: []

console.log("\n--- Testing longestNote ---");
console.log(longestNote()); 
// Expected output: { id: 3, text: "Email the project report to Grace", category: "work" }
const originalNotes = [...notes];
notes = [];
console.log(longestNote()); 
// Expected output: null
notes = [...originalNotes]; // Restore original array

console.log("\n--- Testing countByCategory ---");
console.log(countByCategory()); 
// Expected output: { personal: 2, study: 2, work: 1 }
notes = [{ id: 1, text: "Test", category: "work" }];
console.log(countByCategory()); 
// Expected output: { work: 1 }
notes = [...originalNotes]; // Restore original array

console.log("\n--- Testing getSummary ---");
console.log(getSummary()); 
// Expected output: "5 notes: 2 personal, 2 study, 1 work."
notes = [{ id: 1, text: "Only note", category: "personal" }];
console.log(getSummary()); 
// Expected output: "1 note: 1 personal."
notes = [...originalNotes]; // Restore original array

console.log("\n--- Testing isDuplicate ---");
console.log(isDuplicate("  buy milk and BREAD  ")); 
// Expected output: true
console.log(isDuplicate("Buy groceries")); 
// Expected output: false

console.log("\n--- Testing addNote ---");
console.log(addNote("Submit Day 3 lab", "study")); 
// Expected output: true
console.log(addNote("Call mum", "personal")); 
// Expected output: Failed to add note: Duplicate note text already exists. -> false
console.log(addNote("Exercise", "fitness")); 
// Expected output: Failed to add note: Category must be one of personal, work, study. -> false