// === TVMaze Episode Browser ===

let allShows = [];
let allEpisodes = [];
let episodeCache = {}; // Cache episodes by show ID

window.onload = () => setupFetch();

function setupFetch() {
  const rootElem = document.getElementById("root");

  const loadingMessage = document.createElement("p");
  loadingMessage.textContent = "Loading shows...";
  rootElem.appendChild(loadingMessage);

  fetch("https://api.tvmaze.com/shows")
    .then((response) => {
      if (!response.ok) throw new Error("Failed to fetch shows.");
      return response.json();
    })
    .then((data) => {
      allShows = data.sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );
      rootElem.removeChild(loadingMessage);
      setupUI();
      makePageForShows(allShows);
    })
    .catch(() => {
      rootElem.removeChild(loadingMessage);
      const error = document.createElement("p");
      error.textContent = "Error loading shows. Try again later.";
      error.style.color = "red";
      rootElem.appendChild(error);
      allShows = [];
      setupUI();
    });
}

function setupUI() {
  createControls();
  makePageForShows(allShows);
}

function createControls() {
  const controls = document.createElement("div");
  controls.id = "controls";
  document.body.insertBefore(controls, document.getElementById("root"));

  // Show dropdown
  const showSelect = document.createElement("select");
  showSelect.id = "show-select";
  showSelect.innerHTML = `<option value="">Select a show</option>`;
  allShows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelect.appendChild(option);
  });
  showSelect.addEventListener("change", (e) => {
    const showId = e.target.value;
    if (showId === "") {
      allEpisodes = [];
      makePageForShows(allShows);
      updateEpisodeDropdown();
    } else {
      loadEpisodesForShow(parseInt(showId));
    }
  });
  controls.appendChild(showSelect);

  // Episode dropdown
  const episodeSelect = document.createElement("select");
  episodeSelect.id = "episode-select";
  episodeSelect.innerHTML = `<option value="">Select an episode</option>`;
  episodeSelect.addEventListener("change", (e) => {
    const index = e.target.value;
    if (index === "") {
      makePageForEpisodes(allEpisodes, allEpisodes.length);
    } else {
      makePageForEpisodes([allEpisodes[index]], allEpisodes.length);
    }
    document.getElementById("search-box").value = "";
  });
  controls.appendChild(episodeSelect);

  // Search box
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.id = "search-box";
  searchInput.placeholder = "Search episodes...";
  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();
    const filtered = allEpisodes.filter((ep) => {
      const name = ep.name.toLowerCase();
      const summary = ep.summary ? ep.summary.toLowerCase() : "";
      return name.includes(term) || summary.includes(term);
    });
    makePageForEpisodes(filtered, allEpisodes.length);
    document.getElementById("episode-select").value = "";
  });
  controls.appendChild(searchInput);
}

function loadEpisodesForShow(showId) {
  const rootElem = document.getElementById("root");

  if (episodeCache[showId]) {
    allEpisodes = episodeCache[showId];
    updateEpisodeDisplay();
    return;
  }

  const loading = document.createElement("p");
  loading.id = "episodes-loading";
  loading.textContent = "Loading episodes...";
  rootElem.appendChild(loading);

  fetch(`https://api.tvmaze.com/shows/${showId}/episodes`)
    .then((response) => {
      if (!response.ok) throw new Error("Failed to fetch episodes.");
      return response.json();
    })
    .then((data) => {
      episodeCache[showId] = data;
      allEpisodes = data;
      document.getElementById("episodes-loading").remove();
      updateEpisodeDisplay();
    })
    .catch(() => {
      document.getElementById("episodes-loading").remove();
      const error = document.createElement("p");
      error.textContent = "Error loading episodes. Try again later.";
      error.style.color = "red";
      rootElem.appendChild(error);
    });
}

function updateEpisodeDisplay() {
  updateEpisodeDropdown();
  document.getElementById("search-box").value = "";
  makePageForEpisodes(allEpisodes, allEpisodes.length);
}

function updateEpisodeDropdown() {
  const select = document.getElementById("episode-select");
  select.innerHTML = `<option value="">Select an episode</option>`;
  allEpisodes.forEach((ep, i) => {
    const option = document.createElement("option");
    const season = String(ep.season).padStart(2, "0");
    const number = String(ep.number).padStart(2, "0");
    option.value = i;
    option.textContent = `S${season}E${number} - ${ep.name}`;
    select.appendChild(option);
  });
}

function makePageForShows(showList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  const count = document.createElement("p");
  count.textContent = `Displaying ${showList.length} shows`;
  rootElem.appendChild(count);

  showList.forEach((show) => {
    const showDiv = document.createElement("div");
    showDiv.className = "episode-card";

    const title = document.createElement("h4");
    title.textContent = show.name;
    showDiv.appendChild(title);

    if (show.image && show.image.medium) {
      const img = document.createElement("img");
      img.src = show.image.medium;
      img.alt = show.name;
      showDiv.appendChild(img);
    }

    const summary = document.createElement("div");
    summary.innerHTML = show.summary;
    showDiv.appendChild(summary);

    // Extra info (Genres, Status, Rating, Runtime)
    const info = document.createElement("div");
    info.className = "show-details"; 

    const genres = show.genres && show.genres.length > 0 ? show.genres.join(", ") : "N/A";
    const status = show.status || "N/A";
    const rating = show.rating && show.rating.average !== null ? show.rating.average : "N/A";
    const runtime = show.runtime !== null ? `${show.runtime} min` : "N/A";

    info.innerHTML = `
      <p><strong>Genres:</strong> ${genres}</p>
      <p><strong>Status:</strong> ${status}</p>
      <p><strong>Rating:</strong> ${rating}</p>
      <p><strong>Runtime:</strong> ${runtime}</p>
    `;
    showDiv.appendChild(info);

    showDiv.style.cursor = "pointer";
    showDiv.addEventListener("click", () => {
      document.getElementById("show-select").value = show.id;
      loadEpisodesForShow(show.id);
    });

    rootElem.appendChild(showDiv);
  });

  if (!document.querySelector("footer")) {
    const footer = document.createElement("footer");
    footer.innerHTML = `Data from <a href="https://www.tvmaze.com/api" target="_blank">TVMaze.com</a>`;
    document.body.appendChild(footer);
  }
}

function makePageForEpisodes(episodeList, totalCount) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  const count = document.createElement("p");
  count.textContent = `Displaying ${episodeList.length} / ${totalCount} episodes`;
  rootElem.appendChild(count);

  episodeList.forEach((ep) => {
    const epDiv = document.createElement("div");
    epDiv.className = "episode-card";

    const season = String(ep.season).padStart(2, "0");
    const number = String(ep.number).padStart(2, "0");
    const epCode = `S${season}E${number}`;

    const title = document.createElement("h4");
    title.textContent = `${epCode} - ${ep.name}`;
    epDiv.appendChild(title);

    if (ep.image && ep.image.medium) {
      const img = document.createElement("img");
      img.src = ep.image.medium;
      img.alt = ep.name;
      epDiv.appendChild(img);
    }

    const summary = document.createElement("div");
    summary.innerHTML = ep.summary;
    epDiv.appendChild(summary);

    rootElem.appendChild(epDiv);
  });

  if (!document.querySelector("footer")) {
    const footer = document.createElement("footer");
    footer.innerHTML = `Data from <a href="https://www.tvmaze.com/api" target="_blank">TVMaze.com</a>`;
    document.body.appendChild(footer);
  }
}
