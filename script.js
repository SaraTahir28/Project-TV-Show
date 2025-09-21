// === TVMaze Episode Browser ===

let allShows = [];
let allEpisodes = [];
let episodeCache = {}; // Cache episodes by show ID. show ID will be key for this object and value is array of episodes.

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
      allShows = data.sort((a, b) => //sorting shows alphabetically a and b are two shows being compared.
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );
      rootElem.removeChild(loadingMessage);
      createControls()
      makePageForShows(allShows)
     
      
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
  showSelect.addEventListener("change", (e) => {//when the user changes the option run this function.
    const showId = e.target.value;// e.target is what triggered the event object and .value is the selected show
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
    const index = e.target.value;// the index stores the selected value.
    if (index === "") { //if user chooses the first option, default option, no episode selected.
      makePageForEpisodes(allEpisodes, allEpisodes.length);// full list and no of episodes.
    } else {
      makePageForEpisodes([allEpisodes[index]], allEpisodes.length);//if a specific episode is selected,it picks it at that position and displays it
    }
    document.getElementById("search-box").value = "";//changing selection.clear search box so doesn't interfere with epi selection
  });
  controls.appendChild(episodeSelect);

  // Search box for episodes.
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.id = "search-box";
  searchInput.placeholder = "Search episodes...";
  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();//reads current value of input and makes it case insensitive
    const filtered = allEpisodes.filter((ep) => {//new array with filtered episodes based on match to searchterm. .filter() runs callback for every episode.
      const name = ep.name.toLowerCase();// episode name  converted to lc for case-insensitive matching.
      const summary = ep.summary ? ep.summary.toLowerCase() : "";//if summary exists(!null,!undefined)convert to lowcase else set to ""
      return name.includes(term) || summary.includes(term);//filter condition to return ep if name or summary matches the term.
    });
    makePageForEpisodes(filtered, allEpisodes.length);
    document.getElementById("episode-select").value = "";
  });
  controls.appendChild(searchInput);

  //Creating  search box for shows
const showSearch = document.createElement("input");
showSearch.type = "text";
showSearch.id = "show-search-box";
showSearch.placeholder = "Search shows...";
showSearch.addEventListener("input", () => {
  const term = showSearch.value.toLowerCase();
  const filteredShows = allShows.filter((show) => {
    const name = show.name.toLowerCase();
    const summary = show.summary?.toLowerCase() || "";
    const genres = show.genres.join(", ").toLowerCase();
    return name.includes(term) || summary.includes(term) || genres.includes(term);
  });

  makePageForShows(filteredShows); 
});
controls.appendChild(showSearch);



  const backButton = document.createElement("button");
  backButton.id = "back-button";
  backButton.textContent = "Back to shows";
  backButton.style.display = "none"; 

  backButton.addEventListener("click", () => {
  backButton.style.display = "none"; 
  //resetting select a show dropdown to default.
  document.getElementById("show-select").value = "";

  makePageForShows(allShows);         
  updateEpisodeDropdown();            
});
controls.appendChild(backButton);
}
function loadEpisodesForShow(showId) {
  const rootElem = document.getElementById("root");
//using cached data if available.
  if (episodeCache[showId]) { //checks cache for the selected show.
    allEpisodes = episodeCache[showId];//if cache exists it gets assigned to our global allEpisodes variable.
    updateEpisodeDisplay();//calling to render episodes and update the episode dropdown
    return;// early return because we don't need any request to API for fetching data 
  }
// visual feedback that the app is fetching episodes.
  const loading = document.createElement("p");
  loading.id = "episodes-loading";
  loading.textContent = "Loading episodes...";
  rootElem.appendChild(loading);

  fetch(`https://api.tvmaze.com/shows/${showId}/episodes`)//network request for the given show.
    .then((response) => {
      if (!response.ok) throw new Error("Failed to fetch episodes.");//if !response throws an error to be handled in catch()
      return response.json();
    })
    .then((data) => {   //after JSON is available
      episodeCache[showId] = data;//stores fetched data into episodeCache[showId] where cache gets populated, so that if next time we need to get data for the same show its stored in cache.
      allEpisodes = data; //setting allEpisodes to that data
      document.getElementById("episodes-loading").remove();//get loading element by id and removes it
      updateEpisodeDisplay(); //calls the function to render episodes.
    })
    .catch(() => { //any error occurs (network, non-OK status, JSON parse error), the .catch runs:
      document.getElementById("episodes-loading").remove();
      const error = document.createElement("p");
      error.textContent = "Error loading episodes. Try again later.";
      error.style.color = "red";
      rootElem.appendChild(error);
    });
}

function updateEpisodeDisplay() {
  updateEpisodeDropdown();//creating dropdown for episodes bases on season and episode no and name.
  document.getElementById("search-box").value = "";//sets episodes search box to "", to reset it.
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
  //Hide Back Button
  const backButton = document.getElementById("back-button");
  if (backButton) backButton.style.display = "none";


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
  document.getElementById("back-button").style.display = "inline-block";

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
