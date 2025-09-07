console.log('Lets write JavaScript');

let currentSong = new Audio();
let songs = [];
let currentFolder;

// Format time in MM:SS
function formatTime(seconds) {
    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    // add leading zero if needed
    if (secs < 10) secs = "0" + secs;
    return `${mins}:${secs}`;
}

// Fetch songs from a folder
async function getSongs(folder) {
    currentFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    // Show all songs in playlist
    let songUl = document.querySelector(".songsList").getElementsByTagName("ul")[0];
    songUl.innerHTML = "";
    for (const song of songs) {
        let a = await fetch(`/${folder}/info.json`);
        let response = await a.json();
        songUl.innerHTML += `
        <li>
            <img class="invert" src="assets/music_icon.svg" alt="music">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div>${response.author}</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
            </div>
            <img class="list-play" src="assets/play_song.svg" alt="play">
        </li>`;
    }

    // // Attach event listener to each song
    // Array.from(document.querySelector(".songsList").getElementsByTagName("li")).forEach((e) => {
    //     e.addEventListener("click", () => {
    //         playMusic(e.querySelector(".info").firstElementChild.innerHTML);
    //     });
    // });
    // Attach event listener to each song
Array.from(document.querySelector(".songsList").getElementsByTagName("li")).forEach((li) => {
    const playBtn = li.querySelector(".list-play");

    // when li is clicked
    li.addEventListener("click", () => {
        const trackName = li.querySelector(".info").firstElementChild.innerHTML;
        playMusic(trackName);

        // reset all icons to play
        Array.from(document.querySelectorAll(".list-play")).forEach((img) => {
            img.src = "/assets/play_song.svg";
        });

        // set current li's icon to pause
        playBtn.src = "/assets/pause_song.svg";
    });

    // when playBtn is clicked directly
    playBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // prevent li click duplication
        const trackName = li.querySelector(".info").firstElementChild.innerHTML;

        if (currentSong.src.includes(trackName) && !currentSong.paused) {
            // Pause if same song is already playing
            currentSong.pause();
            playBtn.src = "/assets/play_song.svg";
            play.src = "/assets/play_song.svg";
        } else {
            // Play the clicked song
            playMusic(trackName);

            // reset all icons to play
            Array.from(document.querySelectorAll(".list-play")).forEach((img) => {
                img.src = "/assets/play_song.svg";
            });

            // set current one to pause
            playBtn.src = "/assets/pause_song.svg";
        }
    });
});

   

    return songs;
}

// Play a specific track
const playMusic = (track, pause = false) => {
    currentSong.src = `/${currentFolder}/${track}`;
    if (!pause) {
        currentSong.play();
        play.src = "/assets/pause_song.svg";
    }

    document.querySelector(".songInfo").innerHTML = decodeURI(track);
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
}

// Display albums/cards
async function displayAlbums() {
    console.log("displaying albums")
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;

    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors);

    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2, -1)[0]; // get only subfolder
            if (!folder || folder === "songs") continue;

            // Get metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            // console.log(response);

            cardContainer.innerHTML += `
            <div data-folder="${folder}" class="card">
                <div class="play">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
                        <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" stroke="black" stroke-width="1.5" stroke-linejoin="round" />
                    </svg>
                </div>
                <img src="/songs/${folder}/cover.jpg" alt="Cover">
                <h2>${response.title}</h2>
                <p>${response.description}</p>
            </div>`;
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        e.addEventListener("click", async (item) => {
            console.log("displaying albums")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);

            // reset all cards background
            Array.from(document.getElementsByClassName("card")).forEach((card) => {
                card.style.background = "";
            });

            // set clicked one to black

            e.style.background = "black"
            playMusic(songs[0]);
        });
    });
}

// Main function
async function main() {
    // Get songs list
    await getSongs("songs/new");
    playMusic(songs[0], true);

    // Display all playlists
    displayAlbums();

    // Play/Pause button
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "/assets/pause_song.svg";
        } else {
            currentSong.pause();
            play.src = "/assets/play_song.svg";
        }
    });

    // Previous button
    prev.addEventListener("click", () => {
        console.log("Previous clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    // Next button
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        console.log("Next clicked")
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        } else {
            playMusic(songs[0]);
        }
    });

    // Listen for time update
    currentSong.addEventListener("timeupdate", () => {
        if (!isNaN(currentSong.duration)) {
            document.querySelector(".songTime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
            document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        }
    });

    // Seekbar click
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        if (isNaN(currentSong.duration)) return;
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Hamburger menu
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    // Volume control
    const volIcon = document.querySelector(".volume > img");
    const volRange = document.querySelector(".volume input");

    volRange.addEventListener("change", (e) => {
        currentSong.volume = e.target.value / 100;
    });

    // Mute/unmute button
    volIcon.parentElement.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!currentSong.muted) {
            currentSong.muted = true;
            volIcon.src = "/assets/mute.svg";
        } else {
            currentSong.muted = false;
            volIcon.src = "/assets/volume.svg";
        }
    });

    // Unmute on range click
    volRange.addEventListener("click", (e) => {
        e.stopPropagation();
        if (currentSong.muted) {
            currentSong.muted = false;
            volIcon.src = "/assets/volume.svg";
        }
    });

    // Adjust volume with range input
    volRange.addEventListener("input", (e) => {
        currentSong.volume = e.target.value / 100;
        if (currentSong.muted) {
            currentSong.muted = false;
            volIcon.src = "/assets/volume.svg";
        }
    });

    // Space key for play/pause
    document.addEventListener("keydown", (e) => {
        if (e.code === "Space") {
            e.preventDefault(); // stop page from scrolling
            if (currentSong.paused) {
                currentSong.play();
                play.src = "/assets/pause_song.svg";
            } else {
                currentSong.pause();
                play.src = "/assets/play_song.svg";
            }
        }
    });
}

// Run main function
main();
