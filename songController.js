const audioPlayer = document.getElementById('audio-player');
const trackTitle = document.getElementById('track-title');
const startBtn = document.getElementById('start-btn');
const currentTimeLabel = document.getElementById('current-time')
const durationLabel = document.getElementById('duration')
const progressBar = document.getElementById('progress-bar')
const albumCover = document.getElementById('album-cover');
const playPauseBtn = document.getElementById('play-pause-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const shuffleBtn = document.getElementById('shuffle-btn');

let isShuffle = false;

const playlist = [
    { title: "Greater Love", file: "Bangers/greater love.mp4", image: "Covers/greater love.jpeg" }, 
    { title: "Wont Stop", file: "Bangers/Wont Stop.mp4", image: "Covers/Wont stop.jpeg" },
    { title: "Luv 66", file: "Bangers/Luv 66.mp4", image: "Covers/Luv 66.jpeg"},
    { title: "Welcome to the Party", file: "Bangers/Welcome to the Party.mp4", image: "Covers/Welcome to the Party Cover.jpeg" },
    { title: "Never Leave Ya", file: "Bangers/Never leave ya.mp4" }, 
    { title: "Gypsy vocals", file: "Bangers/Gypsy vocals.mp4" }, 
    { title: "Falling in Love", file: "Bangers/Falling in love.m4a" },
    { title: "Grateful", file: "Bangers/Grateful [VOCAL DEMO].m4a" }, 
    { title: "Jamka", file: "Bangers/Jamka.mp4" }, 
    { title: "Washa", file: "Bangers/Washa.mp4" }, 
    { title: "I NEED UR LOVE", file: "Bangers/I NEED UR LOVE.mp4" },   
    { title: "SpaceJam", file: "Bangers/SpaceJam.mp4" }, 
    { title: "Your Body", file: "Bangers/Your Body.mp4" }
];

let currentTrackIndex = 0;

function loadAndPlay(index) {
    if (index >= playlist.length) {
        trackTitle.innerText = "Mix Finished";
        albumCover.src = "Covers/finished.jpeg"
        return;
    }
    
    const track = playlist[index];
    
    audioPlayer.pause();
    audioPlayer.src = ""; // Clear the old source entirely
    
    //Reset the UI to blank
    progressBar.style.width = "0%";
    currentTimeLabel.innerText = "0:00";
    durationLabel.innerText = "0:00";
    trackTitle.innerText = `Loading: ${track.title}...`;

    //Set the new file
    audioPlayer.src = track.file;
    audioPlayer.load();

    //browser to say "I'm ready"
    audioPlayer.onloadeddata = () => {
        trackTitle.innerText = `${track.title}`;
        
        durationLabel.innerText = formatTime(audioPlayer.duration);
        
        audioPlayer.play().catch(error => {
            console.error("Playback failed:", error);
        });
        
        // Clean up the listener so it doesn't stack
        audioPlayer.onloadeddata = null;
    };
    if (track.image) {
        albumCover.src = track.image;
    }

    // Set the new file and load
    audioPlayer.src = track.file;
    audioPlayer.load();

    audioPlayer.onloadeddata = () => {
        trackTitle.innerText = `${track.title}`;
        durationLabel.innerText = formatTime(audioPlayer.duration);
        audioPlayer.play().catch(error => console.error("Playback failed:", error));
        audioPlayer.onloadeddata = null;
    };
}

// Start button satisfies the "User Gesture" requirement
startBtn.addEventListener('click', () => {
    startBtn.style.display = 'none'; // Hide button after start
    loadAndPlay(currentTrackIndex);
});

// The "Live" loop: when one song ends, the next starts immediately
// This event fires the exact millisecond the current song finishes
audioPlayer.addEventListener('ended', () => {
    console.log("Current song finished. Moving to next track...");
    
    currentTrackIndex++; // Move to the next song in the array
    
    // Check if we still have songs left in the playlist
    if (currentTrackIndex < playlist.length) {
        loadAndPlay(currentTrackIndex);
    } else {
        console.log("End of playlist reached.");
        trackTitle.innerText = "Mix Finished";
        // Optional: Set currentTrackIndex = 0; loadAndPlay(0); to loop the whole mix
    }
});
function formatTime(seconds) {
    let min = Math.floor(seconds / 60);
    let sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// Update the duration once the file is loaded
audioPlayer.addEventListener('loadedmetadata', () => {
    durationLabel.innerText = formatTime(audioPlayer.duration);
});

// Update progress as the song plays
audioPlayer.addEventListener('timeupdate', () => {
    if (!isNaN(audioPlayer.duration)) { // Ensure duration is a number
        currentTimeLabel.innerText = formatTime(audioPlayer.currentTime);
        
        const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.style.width = percent + "%";
    }
    // Inside your existing timeupdate listener
});
// Toggle Play/Pause
playPauseBtn.addEventListener('click', () => {
    if (audioPlayer.paused) {
        audioPlayer.play();
        playPauseBtn.innerText = "⏸";
    } else {
        audioPlayer.pause();
        playPauseBtn.innerText = "▶";
    }
});

// Next Song
nextBtn.addEventListener('click', () => {
    if (isShuffle) {
        currentTrackIndex = Math.floor(Math.random() * playlist.length);
    } else {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    }
    loadAndPlay(currentTrackIndex);
});

// Previous Song
prevBtn.addEventListener('click', () => {
    // If song is more than 3 seconds in, restart the current song
    // Otherwise, go to the previous song in the array
    if (audioPlayer.currentTime > 3) {
        audioPlayer.currentTime = 0;
    } else {
        currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        loadAndPlay(currentTrackIndex);
    }
});

// Toggle Shuffle
shuffleBtn.addEventListener('click', () => {
    isShuffle = !isShuffle;
    shuffleBtn.style.color = isShuffle ? "#bb86fc" : "white"; // Purple when active
});