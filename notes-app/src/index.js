import "./styles/style.css";

// Fungsi untuk fetch catatan dari API
async function fetchNotes() {
  try {
    const response = await fetch("https://notes-api.dicoding.dev/v2/notes");
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    return data.notes; // Sesuaikan dengan struktur data API
  } catch (error) {
    console.error("Fetching notes failed:", error);
    return [];
  }
}

// Fungsi untuk menampilkan catatan
function renderNotes(notes) {
  const incompleteTasksContainer = document.getElementById("incompleteTasks");
  const completeTasksContainer = document.getElementById("completeTasks");

  incompleteTasksContainer.innerHTML = "";
  completeTasksContainer.innerHTML = "";

  notes.forEach((note) => {
    const noteElement = document.createElement("note-item");
    noteElement.noteData = note;

    if (note.archived) {
      completeTasksContainer.appendChild(noteElement);
    } else {
      incompleteTasksContainer.appendChild(noteElement);
    }
  });
}

// Fungsi untuk menambahkan catatan
async function addNoteToAPI(note) {
  try {
    const response = await fetch("https://notes-api.dicoding.dev/v2/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(note),
    });

    if (!response.ok) throw new Error("Network response was not ok");
    const newNote = await response.json();
    return newNote;
  } catch (error) {
    console.error("Adding note failed:", error);
  }
}

// Event listener untuk menambahkan catatan
document
  .getElementById("inputTasks")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = document.getElementById("inputTasksTitle").value;
    const body = document.getElementById("inputTasksDetail").value;
    const deadline = document.getElementById("inputDate").value;

    const newNote = {
      title,
      body,
      deadline: deadline || null,
      archived: false,
    };

    const addedNote = await addNoteToAPI(newNote);
    if (addedNote) {
      const notes = await fetchNotes();
      renderNotes(notes);
      document.getElementById("inputTasks").reset();
    }
  });

// Initial fetch and render
window.addEventListener("load", async () => {
  const notes = await fetchNotes();
  renderNotes(notes);
});
