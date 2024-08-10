class AppBar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="title-bar">
        <h1>NOTES APP</h1>
      </header>
    `;
  }
}
customElements.define("app-bar", AppBar);

class NoteInput extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <form id="inputTasks">
        <div class="list-input">
          <label for="inputTasksTitle">Title</label>
          <input id="inputTasksTitle" type="text" required />
        </div>
        <div class="list-input">
          <label for="inputTasksDetail">Task Details</label>
          <textarea id="inputTasksDetail" required></textarea>
        </div>
        <div class="list-input">
          <label for="inputDate">Deadline</label>
          <input id="inputDate" type="datetime-local" />
        </div>
        <button id="tasksSubmit" type="submit">Add Note</button>
      </form>
    `;

    this.querySelector("#inputTasks").addEventListener("submit", addNote);
  }
}
customElements.define("note-input", NoteInput);

class NoteItem extends HTMLElement {
  set noteData(note) {
    this.innerHTML = `
      <div class="note">
        <h3>${note.title}</h3>
        <p>${note.body}</p>
        <p>Deadline: ${
          note.deadline
            ? new Date(note.deadline).toLocaleString()
            : new Date(note.createdAt).toLocaleString()
        }</p>
        <div class="action">
          <button class="list-item" onclick="toggleComplete('${note.id}')">${
      note.archived ? "Not Completed" : "Completed"
    }</button>
          <button class="delete" onclick="deleteNote('${
            note.id
          }')">Delete</button>
        </div>
      </div>
    `;
  }
}
customElements.define("note-item", NoteItem);

// Fetch non-archived notes
async function fetchNotes() {
  try {
    const response = await fetch("https://notes-api.dicoding.dev/v2/notes");
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    return data.data; // Sesuaikan dengan struktur data API
  } catch (error) {
    console.error("Fetching notes failed:", error);
    return [];
  }
}

// Fetch archived notes
async function fetchArchivedNotes() {
  try {
    const response = await fetch(
      "https://notes-api.dicoding.dev/v2/notes/archived"
    );
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Fetching archived notes failed:", error);
    return [];
  }
}

// Save note to API
async function saveNoteToAPI(note) {
  try {
    const response = await fetch("https://notes-api.dicoding.dev/v2/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(note),
    });

    if (!response.ok) throw new Error("Network response was not ok");
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Saving note failed:", error);
  }
}

// Delete note from API
async function deleteNoteFromAPI(id) {
  try {
    const response = await fetch(
      `https://notes-api.dicoding.dev/v2/notes/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) throw new Error("Network response was not ok");
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Deleting note failed:", error);
  }
}

// Archive note
async function archiveNoteInAPI(id) {
  try {
    const response = await fetch(
      `https://notes-api.dicoding.dev/v2/notes/${id}/archive`,
      {
        method: "POST",
      }
    );

    if (!response.ok) throw new Error("Network response was not ok");
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Archiving note failed:", error);
  }
}

// Unarchive note
async function unarchiveNoteInAPI(id) {
  try {
    const response = await fetch(
      `https://notes-api.dicoding.dev/v2/notes/${id}/unarchive`,
      {
        method: "POST",
      }
    );

    if (!response.ok) throw new Error("Network response was not ok");
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Unarchiving note failed:", error);
  }
}

// Render notes
async function renderNotes() {
  const incompleteTasksContainer = document.getElementById("incompleteTasks");
  const completeTasksContainer = document.getElementById("completeTasks");

  incompleteTasksContainer.innerHTML = "";
  completeTasksContainer.innerHTML = "";

  const [notes, archivedNotes] = await Promise.all([
    fetchNotes(),
    fetchArchivedNotes(),
  ]);

  notes.forEach((note) => {
    const noteElement = document.createElement("note-item");
    noteElement.noteData = note;
    incompleteTasksContainer.appendChild(noteElement);
  });

  archivedNotes.forEach((note) => {
    const noteElement = document.createElement("note-item");
    noteElement.noteData = note;
    completeTasksContainer.appendChild(noteElement);
  });
}

// Add note
async function addNote(event) {
  event.preventDefault();

  const title = document.getElementById("inputTasksTitle").value;
  const body = document.getElementById("inputTasksDetail").value;
  const deadline = document.getElementById("inputDate").value;

  const newNote = {
    title,
    body,
    deadline: deadline || null, // Use deadline if provided
  };

  const addedNote = await saveNoteToAPI(newNote);
  if (addedNote) {
    await renderNotes();
    document.getElementById("inputTasks").reset();
  }
}

// Delete note
async function deleteNote(id) {
  await deleteNoteFromAPI(id);
  await renderNotes();
}

// Toggle complete status
async function toggleComplete(id) {
  const notes = await fetchNotes();
  const note = notes.find((n) => n.id === id);
  if (note) {
    if (note.archived) {
      await unarchiveNoteInAPI(id);
    } else {
      await archiveNoteInAPI(id);
    }
    await renderNotes();
  }
}

// Initial render
window.addEventListener("load", async () => {
  await renderNotes();
  hideLoadingIndicator();
});

// Hide loading indicator
function hideLoadingIndicator() {
  const loadingIndicator = document.getElementById("loadingIndicator");
  if (loadingIndicator) {
    loadingIndicator.style.display = "none";
  }
}
