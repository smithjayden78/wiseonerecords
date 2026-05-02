const trackTitle = document.getElementById('track-title');
const startBtn = document.getElementById('start-btn');
const albumCover = document.getElementById('album-cover');
const playPauseBtn = document.getElementById('play-pause-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const repeatBtn = document.getElementById('repeat-btn');
const playlistElement = document.getElementById('playlist');
const searchInput = document.getElementById('search');
const equalizer = document.getElementById('equalizer');
const volumeSlider = document.getElementById('volume');
const controls = document.getElementById('controls');

let wavesurfer;
let currentTrackIndex = 0;
let isShuffle = false;
let isRepeat = false;

const playlist = [
    { title: "Grateful", file: "Bangers/Grateful [VOCAL DEMO].m4a", image:"Covers/party.jpeg" }, 
    { title: "Greater Love", file: "Bangers/greater love.mp4", image: "Covers/greater love.jpeg" }, 
    { title: "Wont Stop", file: "Bangers/Wont Stop.mp4", image: "Covers/Wont stop.jpeg" },
    { title: "Luv 66", file: "Bangers/Luv 66.mp4", image: "Covers/Luv 66.jpeg"},
    { title: "Welcome to the Party", file: "Bangers/Welcome to the Party.mp4", image: "Covers/Welcome to the Party Cover.jpeg" }
];

function renderPlaylist(filter=""){
    playlistElement.innerHTML="";
    playlist
    .filter(t=>t.title.toLowerCase().includes(filter.toLowerCase()))
    .forEach(track=>{
        const li=document.createElement("li");
        li.innerText=track.title;
        li.onclick=()=>{
            currentTrackIndex=playlist.indexOf(track);
            loadAndPlay(currentTrackIndex);
        };
        playlistElement.appendChild(li);
    });
}

function loadAndPlay(index){
    const track=playlist[index];
    if(!track) return;

    if(wavesurfer) wavesurfer.destroy();

    wavesurfer=WaveSurfer.create({
        container:"#waveform",
        waveColor:"#555",
        progressColor:"#bb86fc",
        height:60
    });

    wavesurfer.load(track.file);

    trackTitle.innerText=track.title;
    albumCover.src=track.image;

    wavesurfer.on('ready',()=>{
        wavesurfer.play();
        playPauseBtn.innerText="⏸";
        equalizer.style.visibility="visible";
        albumCover.classList.add("spin");
    });

    wavesurfer.on('finish',()=>{
        if(isRepeat) wavesurfer.play();
        else nextBtn.click();
    });
}

startBtn.onclick=()=>{
    startBtn.style.display="none";
    controls.style.display="flex";
    renderPlaylist();
    loadAndPlay(currentTrackIndex);
};

playPauseBtn.onclick=()=>{
    if(!wavesurfer) return;
    wavesurfer.playPause();

    if(wavesurfer.isPlaying()){
        playPauseBtn.innerText="⏸";
        equalizer.style.visibility="visible";
        albumCover.classList.add("spin");
    } else {
        playPauseBtn.innerText="▶";
        equalizer.style.visibility="hidden";
        albumCover.classList.remove("spin");
    }
};

nextBtn.onclick=()=>{
    currentTrackIndex=isShuffle
        ? Math.floor(Math.random()*playlist.length)
        : (currentTrackIndex+1)%playlist.length;

    loadAndPlay(currentTrackIndex);
};

prevBtn.onclick=()=>{
    currentTrackIndex=(currentTrackIndex-1+playlist.length)%playlist.length;
    loadAndPlay(currentTrackIndex);
};

shuffleBtn.onclick=()=>{
    isShuffle=!isShuffle;
    shuffleBtn.style.color=isShuffle?"#bb86fc":"white";
};

repeatBtn.onclick=()=>{
    isRepeat=!isRepeat;
    repeatBtn.style.color=isRepeat?"#bb86fc":"white";
};

volumeSlider.oninput=()=>{
    if(wavesurfer) wavesurfer.setVolume(volumeSlider.value);
};

searchInput.oninput=(e)=>{
    renderPlaylist(e.target.value);
};