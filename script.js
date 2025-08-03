let allShows = [];
let allEpisodes = [];
let episodeCache = {}; //Cache store episodes for each show

function setupFetch() {
  const rootElem = document.getElementById("root");

  // Show loading message
  const loadingMessage = document.createElement("p");
  loadingMessage.textContent = "Loading shows...";
  rootElem.appendChild(loadingMessage);

  // Fetch episodes from the API
  fetch("https://api.tvmaze.com/shows")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch shows.");
      }
      return response.json();
    })
    .then((data) => {
      allShows = data;
      rootElem.removeChild(loadingMessage);

      //The shows are sorted alphabetically
      allShows.sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );

      setupUI();

      makePageForShows(allShows); //display all shows by default
    })
    .catch((error) => {
      rootElem.removeChild(loadingMessage);

      //show error message but continue with empty show arrays
      const errorMessage = document.createElement("p");
      errorMessage.textContent =
        "Oops! Something went wrong while loading shows. Please try again later.";
      errorMessage.style.color = "red";
      rootElem.appendChild(errorMessage);

      allShows = [];
      setupUI();
    });
}

function loadEpisodesForShow(showId) {
  //Check if episodes are already cached to avoid duplicate API calls
  if (episodeCache[showId]) {
    allEpisodes = episodeCache[showId];
    updateEpisodeDisplay();
    return;
  }
  const rootElem = document.getElementById("root");

  // Loading message for episodes
  const loadingMessage = document.createElement("p");
  loadingMessage.textContent = "Loading episodes....";
  loadingMessage.id = "episodes-loading";
  rootElem.appendChild(loadingMessage);

  //Fetch episodes for specific show
  fetch(`https://api.tvmaze.com/shows/${showId}/episodes`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch episodes.");
      }
      return response.json();
    })
    .then((data) => {
      //Cache the episodes
      episodeCache[showId] = data;
      allEpisodes = data;

      //Remove loading message
      const loading = document.getElementById("episodes-loading");
      if (loading) {
        rootElem.removeChild(loading);
      }

      updateEpisodeDisplay(); //Update episode dropdown and display
    })
    .catch((error) => {
      const loading = document.getElementById("episodes-loading");
      if (loading) {
        rootElem.removeChild(loading);
      }
      const errorMessage = document.createElement("p");
      errorMessage.textContent =
        "Something went wrong while loading episodes. Please try again later.";
      errorMessage.style.color = "red";
      rootElem.appendChild(errorMessage);
    });
}

function updateEpisodeDisplay() {
  updateEpisodeDropdown(); //update episode dropdown

  //reset search box
  const searchInput = document.getElementById("search-box");
  if (searchInput) {
    searchInput.value = "";
  }
  //Display all episodes for the selected show
  makePageForEpisodes(allEpisodes, allEpisodes.length);
}

function setupUI() {
  createShowDropdown();
  createEpisodeDropdown();

  //Adding search box to display desired episodes
  const searchInput = document.createElement("input");
  searchInput.setAttribute("type", "text");
  searchInput.setAttribute("placeholder", "Search episodes......");
  searchInput.id = "search-box";
  document.body.insertBefore(searchInput, document.getElementById("root"));

  //Filter episodes based on the search option
  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLocaleLowerCase();
    const filteredEpisodes = allEpisodes.filter((ep) => {
      const name = ep.name.toLocaleLowerCase();
      const summary = ep.summary ? ep.summary.toLocaleLowerCase() : "";
      return name.includes(searchTerm) || summary.includes(searchTerm);
    });
    //Display filtered result and show total count
    makePageForEpisodes(filteredEpisodes, allEpisodes.length);
  });

  //Reset episode dropdown when searching
  const episodeSelect = document.getElementById("episode-select");
  if (episodeSelect) {
    episodeSelect.value = ""; // Clear selection
  }

  makePageForShows(allShows); //Display shows initially
}

function createShowDropdown() {
  const select = document.createElement("select");
  select.id = "show-select";

  //Create default option
  const defaultOption = document.createElement("option"); //Default option
  defaultOption.textContent = "Select a show";
  defaultOption.value = "";
  select.appendChild(defaultOption);

  //Add each show as an option
  allShows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    select.appendChild(option);
  });

  // Show selection change
  select.addEventListener("change", (e) => {
    const selectedShowId = e.target.value;

    if (selectedShowId === "") {
      allEpisodes = [];
      makePageForShows(allShows);
      updateEpisodeDropdown();
    } else {
      loadEpisodesForShow(parseInt(selectedShowId));
    }
  });
  //Insert dropdown before the root element
  document.body.insertBefore(select, document.getElementById("root"));
}

function createEpisodeDropdown() {
  const existingSelect = document.getElementById("episode-select");
  if (existingSelect) {
    existingSelect.remove();
  }

  //Create new episode dropdown
  const select = document.createElement("select");
  select.id = "episode-select";

  //create default option
  const defaultOption = document.createElement("option"); // Default option
  defaultOption.textContent = "Select an episode";
  defaultOption.value = "";
  select.appendChild(defaultOption);

  //Insert dropdown before the root element
  document.body.insertBefore(select, document.getElementById("root"));
}

function updateEpisodeDropdown() {
  const select = document.getElementById("episode-select");

  while (select.children.length > 1) {
    //clear existing options, keep the first one
    select.removeChild(select.lastChild);
  }
  //Reset selection
  select.value = "";

  //Adding episodes
  allEpisodes.forEach((episode, index) => {
    const option = document.createElement("option");
    const season = String(episode.season).padStart(2, "0");
    const number = String(episode.number).padStart(2, "0");
    option.value = index;
    option.textContent = `S${season}E${number} - ${episode.name}`;
    select.appendChild(option);
  });

  //update event listener
  select.onchange = (e) => {
    const selectedIndex = e.target.value;

    if (selectedIndex === "") {
      //No episode selected , then show all episodes
      makePageForEpisodes(allEpisodes, allEpisodes.length);
    } else {
      const selectedEpisode = [allEpisodes[selectedIndex]]; // Show only selected episode
      makePageForEpisodes(selectedEpisode, allEpisodes.length);
    }
    //clear search when using dropdown
    const searchInput = document.getElementById("search-box");
    if (searchInput) {
      searchInput.value = "";
    }
  };
}
//Render the shows on the page as clickable cards
function makePageForShows(showList) {
  const rootElem = document.getElementById("root");
  rootElem.textContent = "";

  //Show how many shows are displayed
  const count = document.createElement("p");
  count.textContent = `Displaying ${showList.length} shows`;
  rootElem.appendChild(count);

  //Create card for each show
  showList.forEach((show) => {
    const showDiv = document.createElement("div");
    showDiv.className = "episode-card";
    rootElem.appendChild(showDiv);

    //Show the title
    const titleElement = document.createElement("h4");
    titleElement.textContent = show.name;
    showDiv.appendChild(titleElement);

    //add show image
    if (show.image && show.image.medium) {
      const imgElement = document.createElement("img");
      imgElement.src = show.image.medium;
      imgElement.alt = show.name;
      imgElement.onerror = function () {
        this.style.display = "none";
      };
      showDiv.appendChild(imgElement);
    }

    //Add show summary
    const showSummary = document.createElement("div");
    showSummary.innerHTML = show.summary;
    showDiv.appendChild(showSummary);

    //add click handler to select shows
    showDiv.style.cursor = "pointer";
    showDiv.addEventListener("click", () => {
      const showSelect = document.getElementById("show-select");
      showSelect.value = show.id;
      loadEpisodesForShow(show.id);
    });
  });
  if (!document.querySelector("footer")) {
    const footer = document.createElement("footer");
    footer.innerHTML = `Data from <a href="https://www.tvmaze.com/api" target="_blank">TVMaze.com</a>`;
    document.body.appendChild(footer);
  }
}

//Render the episodes on the page with episode count and details
function makePageForEpisodes(episodeList, totalCount) {
  const rootElem = document.getElementById("root");
  rootElem.textContent = "";

  //Show how many episodes are displayed out of 73 episodes
  const count = document.createElement("p");
  count.textContent = `Displaying ${episodeList.length} / ${totalCount} episodes`;
  rootElem.appendChild(count);

  //Create card for each episode
  episodeList.forEach((episode) => {
    const episodeDiv = document.createElement("div");
    episodeDiv.className = "episode-card";
    rootElem.appendChild(episodeDiv);

    //Format the episode to Season and Episode number
    const season = String(episode.season).padStart(2, "0");
    const number = String(episode.number).padStart(2, "0");
    const episodeCode = `S${season}E${number}`;

    //Episode title with season & episode code
    const titleElement = document.createElement("h4");
    titleElement.textContent = `${episodeCode} - ${episode.name}`;
    episodeDiv.appendChild(titleElement);

    //Add image to episode
    if (episode.image && episode.image.medium) {
      const imgElement = document.createElement("img");
      imgElement.src = episode.image.medium;
      imgElement.alt = episode.name;
      imgElement.onerror = function () {
        this.style.display = "none";
      };
      episodeDiv.appendChild(imgElement);
    }

    //Add episode summary
    const episodeSummary = document.createElement("div");
    episodeSummary.innerHTML = episode.summary;
    episodeDiv.appendChild(episodeSummary);
  });

  if (!document.querySelector("footer")) {
    const footer = document.createElement("footer");
    footer.innerHTML = `Data from <a href="https://www.tvmaze.com/api" target="_blank">TVMaze.com</a>`;
    document.body.appendChild(footer);
  }
}

window.onload = setupFetch;
