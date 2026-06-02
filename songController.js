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

let trackIndex = 0;
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

function loadTrack(index) {
    const track = playlist[index];
    trackTitle.innerText = track.title;
    albumCover.src = track.image;
    audio.src = track.file;
    updatePlaylistUI();
    gsap.fromTo("#app-interface", { filter: "hue-rotate(90deg) brightness(2)" }, { filter: "hue-rotate(0deg) brightness(1)", duration: 0.2 });
}

function updatePlaylistUI() {
    document.querySelectorAll('#playlist li').forEach((li, i) => {
        if (i === trackIndex) {
            li.classList.add('active');
            gsap.to(li, { x: 10, duration: 0.3 });
        } else {
            li.classList.remove('active');
            gsap.to(li, { x: 0, duration: 0.3 });
        }
    });
}

function playTrack() {
    audio.play();
    playPauseBtn.innerText = "⏸";
    gsap.to(albumCover, { scale: 1.05, duration: 0.5 });
}

function pauseTrack() {
    audio.pause();
    playPauseBtn.innerText = "▶";
    gsap.to(albumCover, { scale: 1, duration: 0.5 });
}

// Next Track Logic
function nextTrack() {
    if (isRepeat) {
        audio.currentTime = 0;
        playTrack();
    } else {
        if (isShuffle) {
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * playlist.length);
            } 
            while (newIndex === trackIndex && playlist.length > 1);
            trackIndex = newIndex;
            } 
            else {
            trackIndex = (trackIndex + 1) % playlist.length;
            }
        loadTrack(trackIndex);
        playTrack();
    }
}

// Previous Track Logic
function prevTrack() {
    trackIndex = (trackIndex - 1 + playlist.length) % playlist.length;
    loadTrack(trackIndex);
    playTrack();
}

// AUTO-PLAY NEXT SONG
audio.onended = () => {
    nextTrack();
};

playPauseBtn.onclick = () => {
    audio.paused ? playTrack() : pauseTrack();
};

// Progress Bar Logic
audio.ontimeupdate = (e) => {
    const { duration, currentTime } = e.srcElement;
    if (duration) {
        const progressPercent = (currentTime / duration) * 100;
        progressBar.style.width = `${progressPercent}%`;

        let curM = Math.floor(currentTime / 60);
        let curS = Math.floor(currentTime % 60);
        if(curS < 10) curS = `0${curS}`;
        currentTimeEl.innerText = `${curM}:${curS}`;
    }
};

audio.onloadeddata = () => {
    let durM = Math.floor(audio.duration / 60);
    let durS = Math.floor(audio.duration % 60);
    if(durS < 10) durS = `0${durS}`;
    durationEl.innerText = `${durM}:${durS}`;
};

progressArea.onclick = (e) => {
    let width = progressArea.clientWidth;
    let clickX = e.offsetX;
    audio.currentTime = (clickX / width) * audio.duration;
};

// Controls
document.getElementById('next-btn').onclick = nextTrack;
document.getElementById('prev-btn').onclick = prevTrack;

shuffleBtn.onclick = () => {
    isShuffle = !isShuffle;
    shuffleBtn.style.color = isShuffle ? "#bb86fc" : "white";
    shuffleBtn.style.opacity = isShuffle ? "1" : "0.4";
};

repeatBtn.onclick = () => {
    isRepeat = !isRepeat;
    repeatBtn.style.color = isRepeat ? "#bb86fc" : "white";
    repeatBtn.style.opacity = isRepeat ? "1" : "0.4";
};

document.getElementById('start-btn').onclick = () => {
    gsap.to("#start-btn", { scale: 0, opacity: 0, duration: 0.5 });
    
    gsap.to("#overlay", { 
        opacity: 0, 
        duration: 1.5, 
        onComplete: () => {
            document.getElementById('overlay').style.display = 'none';
            const app = document.getElementById('app-interface');
            app.style.opacity = '1';
            // Trigger the initial load
            renderPlaylist();
            loadTrack(trackIndex);
            playTrack();
        }
    });
};

function renderPlaylist() {
    playlistElement.innerHTML = "";
    playlist.forEach((track, i) => {
        const li = document.createElement('li');
        li.innerText = track.title;
        li.onclick = () => { 
            trackIndex = i; 
            loadTrack(i); 
            playTrack(); 
        };
        playlistElement.appendChild(li);
    });
}
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    const playlistItems = document.querySelectorAll('#playlist li');
    
    playlistItems.forEach((item) => {
        // Reads the exact text displaying on the screen for this song row
        const itemText = item.innerText.toLowerCase();
        
        // If the text matches your search query, keep it visible
        if (itemText.includes(searchTerm)) {
            // Restore your clean neon border layout style
            item.style.display = ''; 
        } else {
            // Hide the rows that don't match
            item.style.display = 'none';  
        }
    });
});
function selectPlayer(cardElement, name, role, desc) {
    // 1. Find all cards and clear out any old selections
    const allCards = document.querySelectorAll('.player-card');
    allCards.forEach(card => {
        card.classList.remove('selected-fighter');
    });

    // 2. Add the selected glowing class to the exact card that was clicked
    cardElement.classList.add('selected-fighter');

    // 3. Swap out the text inside the bio terminal element instantly
    document.getElementById('bio-name').innerText = name;
    document.getElementById('bio-role').innerText = role;
    document.getElementById('bio-desc').innerText = desc;

    // 4. Smoothly trigger your GSAP bounce animation on the text box
    gsap.fromTo("#bio-box", 
        { scale: 0.97, opacity: 0.8 }, 
        { scale: 1, opacity: 1, duration: 0.25, ease: "power2.out" }
    );
}