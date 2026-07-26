document.addEventListener("DOMContentLoaded", function() {
    // 1. Grab values from local browser storage
    const savedTag = localStorage.getItem('userTag') || "PILOT";
    const isNewUser = localStorage.getItem('isNewUser');
    
    // Elements
    const welcomePopup = document.getElementById('welcome-popup');
    const popupText = document.getElementById('popup-text-message');
    
    if (welcomePopup && popupText) {
        let greetingString = "";

        // Check condition: New User vs Returning User
        if (isNewUser === 'true') {
            // High-energy welcome for first-timers!
            greetingString = `WhatsUp ${savedTag.toUpperCase()}.WELCOME TO THE PARTY !`;
            
            // Wipe the flag immediately so it doesn't trigger on next load
            localStorage.removeItem('isNewUser');
        } else {
            // Calculate real-time hours to create dynamic greetings
            const currentHour = new Date().getHours();
            
            if (currentHour >= 5 && currentHour < 12) {
                greetingString = `Rise and shine ${savedTag.toUpperCase()}. Welcome to the Party!`;
            } else if (currentHour >= 12 && currentHour < 17) {
                greetingString = `Good afternoon ${savedTag.toUpperCase()}. Welcome to the PARTY!`;
            } else {
                greetingString = `Good evening ${savedTag.toUpperCase()}, WELCOME TO THE PARTY !`;
            }
        }

        // 2. Inject text and show the custom toast card
        popupText.textContent = greetingString;
        welcomePopup.style.display = "block";

        // 3. Let it sit on screen for 4 seconds, then slide/fade it away smoothly
        setTimeout(() => {
            welcomePopup.style.transition = "all 0.5s ease";
            welcomePopup.style.opacity = "0";
            welcomePopup.style.top = "-50px";
            
            // Clean up the DOM completely after transition closes
            setTimeout(() => {
                welcomePopup.style.display = "none";
            }, 500);
        }, 5000);
    }
});