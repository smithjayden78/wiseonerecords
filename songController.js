document.addEventListener("DOMContentLoaded", function(){
const audio = document.getElementById('audio-player');
const trackTitle = document.getElementById('track-title');
const albumCover = document.getElementById('album-cover');
const playPauseBtn = document.getElementById('play-pause-btn');
const progressArea = document.getElementById('progress-bar');
const progressBar = document.querySelector('.progress-bar');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const playlistElement = document.getElementById('playlist');
const shuffleBtn = document.getElementById('shuffle-btn');
const repeatBtn = document.getElementById('repeat-btn');
const searchInput = document.getElementById('search');

let isShuffle = false;
let isRepeat = false;

const playlist = [
    { title: "HeartBreaker", file: "Bangers/Heartbreaker.mp4", image: "Covers/wise ones.png"},
    { title: "Extraordinary", file: "Bangers/Extraordinary.mp4", image:"Covers/party.jpeg" }, 
    { title: "Better Than Wine", file: "Bangers/Better than wine.mp4", image: "Covers/wise ones.png"},
    { title: "Thank you LORD", file: "Bangers/Thank you LORD.mp4", image: "Covers/wise ones.png"},
    { title: "Over You", file: "Bangers/Over You.mp4", image: "Covers/wise ones.png"},
    { title: "Alone", file: "Bangers/Alone.mp4", image: "Covers/wise ones.png"},
    { title: "Grateful", file: "Bangers/Grateful [VOCAL DEMO].m4a", image:"Covers/party.jpeg" }, 
    { title: "Falling in Love", file: "Bangers/Falling in love.m4a", image:"Covers/party.jpeg" }, 
    { title: "Greater Love", file: "Bangers/greater love.mp4", image: "Covers/greater love.jpeg" }, 
    { title: "Wont Stop", file: "Bangers/Wont Stop.mp4", image: "Covers/Wont stop.jpeg" },
    { title: "Luv 66", file: "Bangers/Luv 66.mp4", image: "Covers/Luv 66.jpeg"},
    { title: "Welcome to the Party", file: "Bangers/Welcome to the Party.mp4", image: "Covers/wise ones.png" },
    { title: "Never leave ya", file: "Bangers/Never leave ya.mp4", image: "Covers/Welcome to the Party Cover.jpeg"},
    { title: "Washa", file: "Bangers/Washa.mp4", image: "Covers/wise ones.png"},
    { title: "Jamka", file: "Bangers/Jamka.mp4", image: "Covers/Welcome to the Party Cover.jpeg"},
    { title: "SpaceJam", file: "Bangers/SpaceJam.mp4", image: "Covers/wise ones.png"},
    { title: "Your Body", file: "Bangers/Your Body.mp4", image: "Covers/Welcome to the Party Cover.jpeg"},
    { title: "Gypsy", file: "Bangers/Gypsy.mp4", image: "Covers/Welcome to the Party Cover.jpeg"},
];

// ==========================================================================
// DYNAMIC QUEUE ENGINE
// ==========================================================================
// This array tracks the files actively chosen to play next in runtime sequence
let playbackQueue = []; 

function loadTrackFromQueue() {
    if (playbackQueue.length === 0) return;
    
    const currentTrack = playbackQueue[0];
    trackTitle.innerText = currentTrack.title;
    albumCover.src = currentTrack.image;
    audio.src = currentTrack.file;
    updatePlaylistUI(currentTrack.title);
    
    if (typeof gsap !== 'undefined') {
        gsap.fromTo("#app-interface", { filter: "hue-rotate(90deg) brightness(2)" }, { filter: "hue-rotate(0deg) brightness(1)", duration: 0.2 });
    }
}

function updatePlaylistUI(activeTitle) {
    if (!activeTitle) return;

    document.querySelectorAll('#playlist li').forEach((li) => {
        // 1. Grab the text and safely clean it up
        const rowTitle = li.querySelector('.song-title-text')?.innerText.toLowerCase().trim() || "";
        const cleanActiveTitle = activeTitle.toLowerCase().trim();

        // 2. Perform a safe, case-insensitive match 🌟
        if (rowTitle === cleanActiveTitle) {
            li.classList.add('active');
            if (typeof gsap !== 'undefined') gsap.to(li, { x: 10, duration: 0.3 });
        } else {
            li.classList.remove('active');
            if (typeof gsap !== 'undefined') gsap.to(li, { x: 0, duration: 0.3 });
        }
    });
}

function playTrack() {
    if (!audio.src) return;
    audio.play();
    if (playPauseBtn) playPauseBtn.innerText = "⏸";
    if (typeof gsap !== 'undefined') gsap.to(albumCover, { scale: 1.05, duration: 0.5 });
}

function pauseTrack() {
    audio.pause();
    if (playPauseBtn) playPauseBtn.innerText = "▶";
    if (typeof gsap !== 'undefined') gsap.to(albumCover, { scale: 1, duration: 0.5 });
}

// Next Track Logic
// Next Track Logic (Fixed Navigation Engine)
function nextTrack() {
    if (isRepeat) {
        audio.currentTime = 0;
        playTrack();
        return;
    }

    // 1. If there's an explicit user queue, handle shifting it out
    if (playbackQueue.length > 1) {
        playbackQueue.shift();
        // The new index 0 is our next queued song, so find where it sits in the master playlist array
        const nextTrackData = playbackQueue[0];
        trackIndex = playlist.findIndex(t => t.title === nextTrackData.title);
        if (trackIndex === -1) trackIndex = 0; 
    } else {
        // 2. Default behavior: advance normal indexing through the master playlist
        if (isShuffle) {
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * playlist.length);
            } while (newIndex === trackIndex && playlist.length > 1);
            trackIndex = newIndex;
        } else {
            trackIndex = (trackIndex + 1) % playlist.length;
        }
        // Set up the playback queue to mirror the newly advanced index item
        playbackQueue = [playlist[trackIndex]];
    }

    loadTrackFromQueue();
    playTrack();
}

// Previous Track Logic (Fixed Navigation Engine)
function prevTrack() {
    // If the song is already well underway, a back click should just restart the current track
    if (audio.currentTime > 3) {
        audio.currentTime = 0;
        playTrack();
        return;
    }

    // Otherwise, step backward cleanly through the master track index
    if (isShuffle) {
        trackIndex = Math.floor(Math.random() * playlist.length);
    } else {
        trackIndex = (trackIndex - 1 + playlist.length) % playlist.length;
    }

    // Reset the manual queue context over the previous historical tracker target
    playbackQueue = [playlist[trackIndex]];
    loadTrackFromQueue();
    playTrack();
}
// Context Menu Helper Functions
function addPlayNext(track) {
    if (playbackQueue.length === 0) {
        playbackQueue.push(track);
        loadTrackFromQueue();
        playTrack();
    } else {
        // Insert directly at index 1 (underneath index 0, which is currently streaming)
        playbackQueue.splice(1, 0, track);
    }
}

function addQueueEnd(track) {
    if (playbackQueue.length === 0) {
        playbackQueue.push(track);
        loadTrackFromQueue();
        playTrack();
    } else {
        // Append smoothly to the end of the existing chain array
        playbackQueue.push(track);
    }
}

// ==========================================================================
// COMPONENT INTERFACE RENDERING ENGINE
// ==========================================================================
function renderPlaylist() {
    playlistElement.innerHTML = "";
    playlist.forEach((track) => {
        const li = document.createElement('li');
        
        // 1. Create a dedicated span for the title text and give it the correct class 🌟
        const titleSpan = document.createElement('span');
        titleSpan.className = "song-title-text"; 
        titleSpan.innerText = track.title;
        
        // Move your base click behavior to the title span
        titleSpan.onclick = () => { 
            trackIndex = playlist.findIndex(t => t.title === track.title);
            playbackQueue = [track];
            loadTrackFromQueue(); 
            playTrack(); 
        };
        
        // 2. Action Dropdown Activation Button frame
        const dotsBtn = document.createElement('button');
        dotsBtn.className = "menu-dots-btn";
        dotsBtn.innerText = "⋮";
        
        // Sub-menu frame elements
        const menuDiv = document.createElement('div');
        menuDiv.className = "song-context-menu";
        
        const nextBtnOpt = document.createElement('button');
        nextBtnOpt.innerText = "Play Next";
        nextBtnOpt.onclick = (e) => {
            e.stopPropagation();
            addPlayNext(track);
            menuDiv.style.display = "none";
        };
        
        const queueBtnOpt = document.createElement('button');
        queueBtnOpt.innerText = "Add to Queue";
        queueBtnOpt.onclick = (e) => {
            e.stopPropagation();
            addQueueEnd(track);
            menuDiv.style.display = "none";
        };
        
        menuDiv.appendChild(nextBtnOpt);
        menuDiv.appendChild(queueBtnOpt);
        
        dotsBtn.onclick = (e) => {
            e.stopPropagation();
            
            // Check if this specific menu is currently open
            const isAlreadyOpen = menuDiv.style.display === "flex";
            
            // First, close all menus and completely restore baseline pointer behaviors across the app
            document.querySelectorAll('.song-context-menu').forEach(menu => {
                menu.style.display = 'none';
                menu.parentElement.style.zIndex = ""; 
            });
            document.querySelectorAll('#playlist li').forEach(row => {
                row.style.pointerEvents = "auto"; 
                row.style.zIndex = "";
            });

            // If it wasn't open, let's open it cleanly
            if (!isAlreadyOpen) {
                menuDiv.style.display = "flex";
                
                // 1. Force the current active parent row to the top of the stack pile
                li.style.zIndex = "99999";
                
                // 2. CRITICAL: Freeze interaction tracking on ALL OTHER list items 
                // so they can't fire hover animations beneath the menu panel! 🌟
                document.querySelectorAll('#playlist li').forEach(row => {
                    if (row !== li) {
                        row.style.pointerEvents = "none";
                        row.style.zIndex = "1"; // Push down below our active layer
                    }
                });
            }
        };

        // Append everything in order
        li.appendChild(titleSpan);
        li.appendChild(dotsBtn);
        li.appendChild(menuDiv);
        playlistElement.appendChild(li);
    });
}

// Global click escape guard to reset state cleanly
document.addEventListener('click', () => {
    document.querySelectorAll('.song-context-menu').forEach(menu => {
        menu.style.display = 'none';
    });
    document.querySelectorAll('#playlist li').forEach(row => {
        row.style.pointerEvents = "auto";
        row.style.zIndex = "";
    });
});

// ==========================================================================
// CORE DEVICE COMPONENT EVENT ATTACHMENTS
// ==========================================================================
if (audio) {
    audio.onended = () => { nextTrack(); };
}

if (playPauseBtn) {
    playPauseBtn.onclick = () => { audio.paused ? playTrack() : pauseTrack(); };
}

audio.ontimeupdate = (e) => {
    const { duration, currentTime } = e.srcElement;
    if (duration) {
        const progressPercent = (currentTime / duration) * 100;
        if (progressBar) progressBar.style.width = `${progressPercent}%`;

        let curM = Math.floor(currentTime / 60);
        let curS = Math.floor(currentTime % 60);
        if(curS < 10) curS = `0${curS}`;
        if (currentTimeEl) currentTimeEl.innerText = `${curM}:${curS}`;
    }
};

audio.onloadeddata = () => {
    let durM = Math.floor(audio.duration / 60);
    let durS = Math.floor(audio.duration % 60);
    if(durS < 10) durS = `0${durS}`;
    if (durationEl) durationEl.innerText = `${durM}:${durS}`;
};

if (progressArea) {
    progressArea.onclick = (e) => {
        let width = progressArea.clientWidth;
        let clickX = e.offsetX;
        audio.currentTime = (clickX / width) * audio.duration;
    };
}

const nextBtn = document.getElementById('next-btn');
if (nextBtn) nextBtn.onclick = nextTrack;

const prevBtn = document.getElementById('prev-btn');
if (prevBtn) prevBtn.onclick = prevTrack;

if (shuffleBtn) {
    shuffleBtn.onclick = () => {
        isShuffle = !isShuffle;
        shuffleBtn.style.color = isShuffle ? "#bb86fc" : "white";
        shuffleBtn.style.opacity = isShuffle ? "1" : "0.4";
    };
}

if (repeatBtn) {
    repeatBtn.onclick = () => {
        isRepeat = !isRepeat;
        repeatBtn.style.color = isRepeat ? "#bb86fc" : "white";
        repeatBtn.style.opacity = isRepeat ? "1" : "0.4";
    };
}

document.getElementById('start-btn').onclick = () => {
    if (typeof gsap !== 'undefined') {
        gsap.to("#start-btn", { scale: 0, opacity: 0, duration: 2});
        
        gsap.to("#overlay", { 
            opacity: 0, 
            duration: 1.5, 
            onComplete: () => {
                const overlayEl = document.getElementById('overlay');
                if (overlayEl) overlayEl.style.display = 'none';
                const app = document.getElementById('app-interface');
                if (app) app.style.opacity = '1';
                
                // 1. Render out the visual rows
                renderPlaylist();
                
                // 2. Set your baseline tracking index explicitly to 0 🌟
                trackIndex = 0;
                
                // 3. Initialize your dynamic queue with the first song item cleanly
                playbackQueue = [playlist[trackIndex]];
                
                // 4. Trigger the layout sync and play the audio pipeline streams
                loadTrackFromQueue();
                playTrack();
            }
        });
    }
};

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        const playlistItems = document.querySelectorAll('#playlist li');
        
        playlistItems.forEach((item) => {
            const itemText = item.querySelector('.song-title-text')?.innerText.toLowerCase() || "";
            if (itemText.includes(searchTerm)) {
                item.style.display = ''; 
            } else {
                item.style.display = 'none';  
            }
        });
    });
}
});