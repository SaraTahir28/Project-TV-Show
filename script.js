//You can edit ALL of the code here
function setup() {
  //Get all episodes from the TVMaze API
  allEpisodes = getAllEpisodes();

  //adding search box to display desired episodes
  const searchInput = document.createElement("input");
  searchInput.setAttribute("type", "text");
  searchInput.setAttribute("placeholder", "Search episodes......");
  searchInput.id = "search-box";
  document.body.insertBefore(searchInput, document.getElementById("root"));

  //filter episodes based on the search option
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
  //Create dropdown list and render all episodes
  createEpisodeDropdown(allEpisodes);
  makePageForEpisodes(allEpisodes, allEpisodes.length);
}

//Render the episodes on the page with episode count and details
function makePageForEpisodes(episodeList, totalCount) {
  const rootElem = document.getElementById("root");
  rootElem.textContent = "";

  //Show how many episodes are displayed out of 73 episodes
  const count = document.createElement("p");
  count.textContent = `Displaying ${episodeList.length} / ${totalCount} episodes`;
  rootElem.appendChild(count);

  //Render each episode
  episodeList.forEach((episode) => {
    const episodeDiv = document.createElement("div");
    rootElem.appendChild(episodeDiv);

    //Format the episode to Season and Episode number
    const season = String(episode.season).padStart(2, "0");
    const number = String(episode.number).padStart(2, "0");
    const episodeCode = `S${season}E${number}`;
    episodeDiv.textContent = `${episodeCode} - ${episode.name}`;

    //Add image to episode
    const imgElement = document.createElement("img");
    imgElement.src = episode.image.medium;
    episodeDiv.appendChild(imgElement);

    //Add episode summary
    const episodeSummary = document.createElement("div");
    episodeSummary.innerHTML = episode.summary;
    episodeDiv.appendChild(episodeSummary);
  });
}
const footer = document.createElement("footer");
footer.innerHTML = `Data from <a href="https://www.tvmaze.com/api" target="_blank">TVMaze.com</a>`;
document.body.appendChild(footer);

//Create the dropdown list for choosing the desired episode
function createEpisodeDropdown(episodeList) {
  const select = document.createElement("select");

  //Default option
  const defaultOption = document.createElement("option");
  defaultOption.textContent = "Select an episode";
  defaultOption.value = "";
  select.appendChild(defaultOption);

  //Adding the episode with the chosen episode/season
  episodeList.forEach((episode, index) => {
    const option = document.createElement("option");
    const season = String(episode.season).padStart(2, "0");
    const number = String(episode.number).padStart(2, "0");
    option.value = index;
    option.textContent = `S${season}E${number} - ${episode.name}`;
    select.appendChild(option);
  });

  //Dropdown selection
  select.addEventListener("change", (e) => {
    const selectedIndex = e.target.value;

    //Shows all episodes or selected ones
    if (selectedIndex === "") {
      makePageForEpisodes(episodeList, allEpisodes.length); // Show all episodes
    } else {
      const selectedEpisode = [episodeList[selectedIndex]];
      makePageForEpisodes(selectedEpisode, allEpisodes.length); // Show only selected episode
    }
  });

  document.body.insertBefore(select, document.getElementById("root"));
}

window.onload = setup;
