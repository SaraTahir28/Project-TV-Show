//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}
//Amending function to add Episode Code- (Episode Season and Episode name.)
function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.textContent = `Got ${episodeList.length} episode(s)`;
  episodeList.forEach((episode) => {
    const episodeDiv= document.createElement("div");
    rootElem.appendChild(episodeDiv);
    const season = String(episode.season).padStart(2, "0");
    const number = String(episode.number).padStart(2, "0");
    const episodeCode =`S${season}E${number}`;
    episodeDiv.textContent = `${episodeCode} - ${episode.name}`;

    const imgElement = document.createElement("img")
    imgElement.src = episode.image.medium;
    episodeDiv.appendChild(imgElement);

    const episodeSummary = document.createElement("div");
    episodeDiv.appendChild(episodeSummary)
    episodeSummary.innerHTML = episode.summary;

    
})}
const footer = document.createElement("footer");
    footer.textContent = "Data from ";
    const link = document.createElement("a");
    link.href = "https://tvmaze.com";
    link.textContent = "TVMaze.com";
    footer.append(link);
    document.body.append(footer);


window.onload = setup;
