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
    let trackIndex = 0; // Added explicit tracker baseline memory placeholder

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
    let playbackQueue = []; 

    function loadTrackFromQueue() {
        if (playbackQueue.length === 0) return;
        
        const currentTrack = playbackQueue[0];
        if (trackTitle) trackTitle.innerText = currentTrack.title;
        if (albumCover) albumCover.src = currentTrack.image;
        if (audio) audio.src = currentTrack.file;
        updatePlaylistUI(currentTrack.title);
        
        if (typeof gsap !== 'undefined') {
            gsap.fromTo("#app-interface", { filter: "hue-rotate(90deg) brightness(2)" }, { filter: "hue-rotate(0deg) brightness(1)", duration: 0.2 });
        }
    }

    function updatePlaylistUI(activeTitle) {
        if (!activeTitle) return;

        document.querySelectorAll('#playlist li').forEach((li) => {
            const rowTitle = li.querySelector('.song-title-text')?.innerText.toLowerCase().trim() || "";
            const cleanActiveTitle = activeTitle.toLowerCase().trim();

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
        if (!audio || !audio.src) return;
        audio.play();
        if (playPauseBtn) playPauseBtn.innerText = "⏸";
        if (typeof gsap !== 'undefined' && albumCover) gsap.to(albumCover, { scale: 1.05, duration: 0.5 });
    }

    function pauseTrack() {
        if (!audio) return;
        audio.pause();
        if (playPauseBtn) playPauseBtn.innerText = "▶";
        if (typeof gsap !== 'undefined' && albumCover) gsap.to(albumCover, { scale: 1, duration: 0.5 });
    }

    function nextTrack() {
        if (!audio) return;
        if (isRepeat) {
            audio.currentTime = 0;
            playTrack();
            return;
        }

        if (playbackQueue.length > 1) {
            playbackQueue.shift();
            const nextTrackData = playbackQueue[0];
            trackIndex = playlist.findIndex(t => t.title === nextTrackData.title);
            if (trackIndex === -1) trackIndex = 0; 
        } else {
            if (isShuffle) {
                let newIndex;
                do {
                    newIndex = Math.floor(Math.random() * playlist.length);
                } while (newIndex === trackIndex && playlist.length > 1);
                trackIndex = newIndex;
            } else {
                trackIndex = (trackIndex + 1) % playlist.length;
            }
            playbackQueue = [playlist[trackIndex]];
        }

        loadTrackFromQueue();
        playTrack();
    }

    function prevTrack() {
        if (!audio) return;
        if (audio.currentTime > 3) {
            audio.currentTime = 0;
            playTrack();
            return;
        }

        if (isShuffle) {
            trackIndex = Math.floor(Math.random() * playlist.length);
        } else {
            trackIndex = (trackIndex - 1 + playlist.length) % playlist.length;
        }

        playbackQueue = [playlist[trackIndex]];
        loadTrackFromQueue();
        playTrack();
    }

    function addPlayNext(track) {
        if (playbackQueue.length === 0) {
            playbackQueue.push(track);
            loadTrackFromQueue();
            playTrack();
        } else {
            playbackQueue.splice(1, 0, track);
        }
    }

    function addQueueEnd(track) {
        if (playbackQueue.length === 0) {
            playbackQueue.push(track);
            loadTrackFromQueue();
            playTrack();
        } else {
            playbackQueue.push(track);
        }
    }

    // ==========================================================================
    // COMPONENT INTERFACE RENDERING ENGINE
    // ==========================================================================
    function renderPlaylist() {
        if (!playlistElement) return;
        playlistElement.innerHTML = "";
        playlist.forEach((track) => {
            const li = document.createElement('li');
            
            const titleSpan = document.createElement('span');
            titleSpan.className = "song-title-text"; 
            titleSpan.innerText = track.title;
            
            titleSpan.onclick = () => { 
                trackIndex = playlist.findIndex(t => t.title === track.title);
                playbackQueue = [track];
                loadTrackFromQueue(); 
                playTrack(); 
            };
            
            const dotsBtn = document.createElement('button');
            dotsBtn.className = "menu-dots-btn";
            dotsBtn.innerText = "⋮";
            
            const menuDiv = document.createElement('div');
            menuDiv.className = "song-context-menu";
            
            const nextBtnOpt = document.createElement('button');
            nextBtnOpt.innerText = "Play Next";
            nextBtnOpt.onclick = (e) => {
                e.stopPropagation();
                addPlayNext(track);
                menuDiv.style.display = "none";
                
                // Clear blocking states on selection click cleanly
                document.querySelectorAll('#playlist li').forEach(row => {
                    row.style.pointerEvents = "auto";
                    row.style.zIndex = "";
                });
            };
            
            const queueBtnOpt = document.createElement('button');
            queueBtnOpt.innerText = "Add to Queue";
            queueBtnOpt.onclick = (e) => {
                e.stopPropagation();
                addQueueEnd(track);
                menuDiv.style.display = "none";
                
                // Clear blocking states on selection click cleanly
                document.querySelectorAll('#playlist li').forEach(row => {
                    row.style.pointerEvents = "auto";
                    row.style.zIndex = "";
                });
            };
            
            menuDiv.appendChild(nextBtnOpt);
            menuDiv.appendChild(queueBtnOpt);
            
            dotsBtn.onclick = (e) => {
                e.stopPropagation();
                
                const isAlreadyOpen = menuDiv.style.display === "flex";
                
                const openMenus = document.querySelectorAll('.song-context-menu');
                if (openMenus.length > 0) {
                    openMenus.forEach(menu => {
                        menu.style.display = 'none';
                        if (menu.parentElement) menu.parentElement.style.zIndex = ""; 
                    });
                }

                const playlistRows = document.querySelectorAll('#playlist li');
                if (playlistRows.length > 0) {
                    playlistRows.forEach(row => {
                        row.style.pointerEvents = "auto"; 
                        row.style.zIndex = "";
                    });
                }

                if (!isAlreadyOpen) {
                    menuDiv.style.display = "flex";
                    li.style.zIndex = "99999";
                    
                    if (playlistRows.length > 0) {
                        playlistRows.forEach(row => {
                            if (row !== li) {
                                row.style.pointerEvents = "none";
                                row.style.zIndex = "1";
                            }
                        });
                    }
                }
            };

            li.appendChild(titleSpan);
            li.appendChild(dotsBtn);
            li.appendChild(menuDiv);
            playlistElement.appendChild(li);
        });
    }

    // Global click escape guard
    document.addEventListener('click', () => {
        const openMenus = document.querySelectorAll('.song-context-menu');
        if (openMenus.length > 0) {
            openMenus.forEach(menu => {
                menu.style.display = 'none';
            });
        }

        const playlistRows = document.querySelectorAll('#playlist li');
        if (playlistRows.length > 0) {
            playlistRows.forEach(row => {
                row.style.pointerEvents = "auto";
                row.style.zIndex = "";
            });
        }
    });

    // ==========================================================================
    // CORE DEVICE COMPONENT EVENT ATTACHMENTS
    // ==========================================================================
    if (audio) {
        audio.onended = () => { nextTrack(); };

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
    }

    if (playPauseBtn) {
        playPauseBtn.onclick = () => { audio.paused ? playTrack() : pauseTrack(); };
    }

    if (progressArea) {
        progressArea.onclick = (e) => {
            if (!audio || !audio.duration) return;
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

    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.onclick = () => {
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
                        
                        renderPlaylist();
                        
                        trackIndex = 0;
                        playbackQueue = [playlist[trackIndex]];
                        loadTrackFromQueue();
                        playTrack();
                    }
                });
            }
        };
    }

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
    // ==========================================================================
    // CREW ROSTER / PROFILE INTERACTION ENGINE (For crew.html)
    // ==========================================================================
    
    // 1. Grab all character fighter cards on the page
    const crewCards = document.querySelectorAll('.crew-card'); // Or whatever class your character items use
    
    // DOM Targets for the detail display screen area
    const crewNameDisplay = document.getElementById('crew-name'); 
    const crewRoleDisplay = document.getElementById('crew-role');
    const crewBioDisplay = document.getElementById('crew-bio');
    const crewImageDisplay = document.getElementById('crew-detail-img');

    if (crewCards.length > 0) {
        console.log(`🎯 Crew system activated: Found ${crewCards.length} character cards.`);
        
        crewCards.forEach((card) => {
            card.onclick = () => {
                // Remove active styling states from all other cards first
                crewCards.forEach(c => c.classList.remove('selected-card'));
                card.classList.add('selected-card');

                // Pull information dynamically from custom data-attributes on the HTML element
                const name = card.getAttribute('data-name');
                const role = card.getAttribute('data-role');
                const bio = card.getAttribute('data-bio');
                const img = card.getAttribute('data-img');

                // Safely inject them into your arcade display panel if they exist
                if (crewNameDisplay && name) crewNameDisplay.innerText = name;
                if (crewRoleDisplay && role) crewRoleDisplay.innerText = role;
                if (crewBioDisplay && bio) crewBioDisplay.innerText = bio;
                if (crewImageDisplay && img) crewImageDisplay.src = img;

                // Add a swift GSAP matrix flash when selecting a new profile layout
                if (typeof gsap !== 'undefined' && crewBioDisplay) {
                    gsap.fromTo([crewNameDisplay, crewBioDisplay], 
                        { opacity: 0, x: -10 }, 
                        { opacity: 1, x: 0, duration: 0.3, stale: true }
                    );
                }
            };
        });
    }
}); // <--- THIS is where DOMContentLoaded now correctly and safely closes!