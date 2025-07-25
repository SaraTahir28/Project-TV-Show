//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.textContent = `Got ${episodeList.length} episode(s)`;
  episodeList.forEach((episode) => {
    const episodeDiv= document.createElement("div");
    rootElem.appendChild(episodeDiv);
    episodeDiv.textContent= episode.name;
  });
}


window.onload = setup;
