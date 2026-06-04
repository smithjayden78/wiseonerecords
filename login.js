/* ==========================================================================
   1. FIREBASE ES MODULE IMPORTS (UPDATED TO INCLUDE FIRESTORE)
   ========================================================================== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
// Added Firestore imports here:
import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your Firebase Configurations
const firebaseConfig = {
    apiKey: "AIzaSyAxxkldN5s3xSlArLWqMdnnz0GDeDjeeF8",
    authDomain: "heart-and-soul-3c95c.firebaseapp.com",
    projectId: "heart-and-soul-3c95c",
    storageBucket: "heart-and-soul-3c95c.firebasestorage.app",
    messagingSenderId: "990986587189",
    appId: "1:990986587189:web:fa99c76266a0dae04af57c",
    measurementId: "G-VS02R1LHW9"
};

// Initialize Active Firebase Core Services
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app); // Active Firestore instance
const provider = new GoogleAuthProvider();


/* ==========================================================================
   2. INTERACTIVE AUTHENTICATION HANDLERS (EXPOSED TO WINDOW)
   ========================================================================== */

// --- 1. Google Auth Handler ---
window.loginWithGoogle = function() {
    signInWithPopup(auth, provider)
        .then((result) => { 
            console.log("Authenticated via Google successfully:", result.user);
            checkIfUserAlreadyHasTag(result.user);
        })
        .catch((error) => { 
            console.error(error);
            triggerError("TERMINAL FAULT: GOOGLE TOKEN REJECTED"); 
        });
}

// --- 2. Email Sign-In / Account Creation Hybrid Handler ---
window.handleEmailAuth = function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log("Logged in via Email:", userCredential.user);
            checkIfUserAlreadyHasTag(userCredential.user);
        })
        .catch((error) => {
            console.log("Firebase Login Error Code:", error.code);
            
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                
                createUserWithEmailAndPassword(auth, email, password)
                    .then((userCredential) => {
                        console.log("New Account Registered successfully:", userCredential.user);
                        navigateToUsernameStep(); 
                    })
                    .catch((regError) => {
                        console.log("Registration Error Code:", regError.code);
                        if (regError.code === 'auth/email-already-in-use') {
                            triggerError("LINK DETECTED: PLEASE USE CONNECT GMAIL BUTTON");
                        } else if (regError.code === 'auth/weak-password') {
                            triggerError("SECURITY ALERT: PASSWORD TOO WEAK (MIN 6 CHARS)");
                        } else {
                            triggerError("ACCESS DENIED: PASSWORD MISMATCH");
                        }
                    });
                    
            } else {
                triggerError("ACCESS DENIED: INVALID DATA STREAM");
            }
        });
}


/* ==========================================================================
   3. SMART REDIRECTION LOOKUP (NEW CONTROLLER)
   ========================================================================== */
/**
 * Checks if this user has already created an arcade tag in a past session.
 * If yes, bypasses step 2 completely and takes them straight to the dashboard!
 */
async function checkIfUserAlreadyHasTag(user) {
    try {
        // Look up user mapping profiles under their unique Firebase UID
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists() && userSnap.data().username) {
            // Already has a tag! Save to local storage and skip step 2
            localStorage.setItem('userTag', userSnap.data().username);
            window.location.href = "dashboard.html";
        } else {
            // New user, send them to select their tag
            navigateToUsernameStep();
        }
    } catch (err) {
        console.error("Error reading profile database: ", err);
        navigateToUsernameStep(); // Fallback to step 2 anyway if rules block it
    }
}


/* ==========================================================================
   4. ARCADE NAVIGATION CONTROLLER & UNIQUE USERNAME DATA VERIFICATION
   ========================================================================== */

function navigateToUsernameStep() {
    const step1 = document.getElementById('step-1-container');
    const step2 = document.getElementById('step-2-container');
    const errorMsg = document.getElementById('error-msg');
    
    if (step1 && step2) {
        if (errorMsg) errorMsg.style.display = "none";

        step1.style.display = 'none';
        step2.style.display = 'block';
        
        const usernameField = document.getElementById('username');
        if (usernameField) usernameField.focus();
    }
}

// Handles the final arcade tag submission with Cloud uniqueness confirmation
window.handleUsernameSave = async function(event) {
    event.preventDefault();
    
    const usernameField = document.getElementById('username');
    // Force lowercase alphanumeric characters to make filtering duplicates simple
    const usernameValue = usernameField ? usernameField.value.trim().toLowerCase() : "";
    const currentUser = auth.currentUser;
    
    if (usernameValue === "") {
        triggerError("CRITICAL FAULT: ARCADE TAG CANNOT BE EMPTY.");
        return;
    }

    if (!currentUser) {
        triggerError("SECURITY FAULT: NO ACTIVE AUTHENTICATED STREAM.");
        return;
    }
    
    try {
        // 1. Check if username document exists under "usernames/the_chosen_tag"
        const usernameRef = doc(db, "usernames", usernameValue);
        const usernameSnap = await getDoc(usernameRef);

        if (usernameSnap.exists()) {
            // Document exists, meaning someone else claimed it!
            triggerError("TAG UNAVAILABLE: CHOOSE ANOTHER CALLSIGN");
            return;
        }

        // 2. Claim the unique username document and map it to their email
        await setDoc(usernameRef, {
            email: currentUser.email,
            uid: currentUser.uid
        });

        // 3. Save the username inside their primary profile document
        await setDoc(doc(db, "users", currentUser.uid), {
            username: usernameValue,
            email: currentUser.email
        }, { merge: true });
        localStorage.setItem('isNewUser', 'true')
        // 4. Save locally and launch the game!
        localStorage.setItem('userTag', usernameValue);
        window.location.href = "dashboard.html";

    } catch (error) {
        console.error("Database operation failed: ", error);
        triggerError("DATABASE ERROR: ACCESS BLOCKED BY POLICY");
    }
}

// Helper engine for terminal cabinet wobble feedback
function triggerError(msg) {
    const errorMsg = document.getElementById('error-msg');
    if (errorMsg) {
        errorMsg.innerText = msg;
        errorMsg.style.display = "block";
    }
    const box = document.querySelector('.terminal-box');
    if (box) {
        box.style.animation = 'none';
        setTimeout(() => box.style.animation = 'terminalShake 0.3s ease', 10);
    }
}


/* ==========================================================================
   5. INTERACTIVE PASSWORD TOGGLE & VECTOR GRAPHICS CONFIG
   ========================================================================== */
const passwordInput = document.getElementById('password');
const togglePassword = document.getElementById('togglePassword');

if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        const svgIcon = this.querySelector('svg');
        if (svgIcon) {
            if (type === 'password') {
                svgIcon.setAttribute('data-lucide', 'eye-off');
            } else {
                svgIcon.setAttribute('data-lucide', 'eye');
            }
        }
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    });
}

if (typeof lucide !== 'undefined') {
    lucide.createIcons();
}