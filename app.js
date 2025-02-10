// Firebase configuration (Replace with your actual Firebase config)
const firebaseConfig = {
    apiKey: "AIzaSyADNVw0iLuUd0jvSYSQoo2Vxo_IQ0J9tlg",
    authDomain: "frutify-d7ddd.firebaseapp.com",
    projectId: "frutify-d7ddd",
    storageBucket: "frutify-d7ddd.firebasestorage.app",
    messagingSenderId: "266501744563",
    appId: "1:266501744563:web:cf7e360897203d20a48dc6"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Firebase Authentication Logic (for user login)

// Function to sign in user
function signInUser(email, password) {
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log('User signed in:', userCredential.user.email);
        })
        .catch((error) => {
            console.error('Error signing in:', error.message);
        });
}

// Function to sign out user
function signOutUser() {
    auth.signOut()
        .then(() => console.log('User signed out'))
        .catch((error) => console.error('Error signing out:', error.message));
}

// Music Player Logic
const audioPlayer = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const volumeSlider = document.getElementById('volumeSlider');
const progressBar = document.querySelector('.progress');
let isPlaying = false;
let currentTrackIndex = 0;
const tracks = [
    { title: 'Watermelon Sugar', artist: 'Harry Styles', src: 'path/to/track1.mp3' },
    { title: 'Blinding Lights', artist: 'The Weeknd', src: 'path/to/track2.mp3' },
    { title: 'Levitating', artist: 'Dua Lipa', src: 'path/to/track3.mp3' }
];

// Function to toggle play/pause
function togglePlayPause() {
    if (isPlaying) {
        audioPlayer.pause();
        playBtn.classList.replace('fa-pause', 'fa-play');
    } else {
        audioPlayer.play();
        playBtn.classList.replace('fa-play', 'fa-pause');
    }
    isPlaying = !isPlaying;
}

// Function to load a track
function loadTrack(index) {
    const track = tracks[index];
    audioPlayer.src = track.src;
    document.querySelector('.track-info h4').textContent = track.title;
    document.querySelector('.track-info p').textContent = track.artist;
    audioPlayer.play();
    playBtn.classList.replace('fa-play', 'fa-pause');
    isPlaying = true;
}

// Function to update progress bar
audioPlayer.addEventListener('timeupdate', () => {
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressBar.style.width = `${progress}%`;
});

// Function to control volume
volumeSlider.addEventListener('input', () => {
    audioPlayer.volume = volumeSlider.value;
});

// Event Listeners for Player Controls
playBtn.addEventListener('click', togglePlayPause);
nextBtn.addEventListener('click', () => {
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    loadTrack(currentTrackIndex);
});
prevBtn.addEventListener('click', () => {
    currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    loadTrack(currentTrackIndex);
});

// Fetch and display playlists
async function fetchPlaylists() {
    const user = auth.currentUser;
    if (!user) return;

    const snapshot = await db.collection('playlists').where('userId', '==', user.uid).get();
    playlistsContainer.innerHTML = '';

    snapshot.forEach(doc => {
        const playlist = doc.data();
        const playlistCard = document.createElement('div');
        playlistCard.classList.add('playlist-card');
        playlistCard.innerHTML = `<h4>${playlist.name}</h4><p>${playlist.description}</p>`;
        playlistsContainer.appendChild(playlistCard);
    });
}

auth.onAuthStateChanged(user => {
    if (user) fetchPlaylists();
});

async function addSongToPlaylist(playlistId, song) {
    try {
        const playlistRef = db.collection("playlists").doc(playlistId).collection("songs");
        await playlistRef.add({
            title: song.title,
            artist: song.artist,
            url: song.url,
            addedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log("Song added successfully!");
    } catch (error) {
        console.error("Error adding song:", error);
    }
}

// Function to delete a playlist
async function deletePlaylist(playlistId) {
    try {
        await db.collection('playlists').doc(playlistId).delete();
        console.log('Playlist deleted successfully!');
    } catch (error) {
        console.error('Error deleting playlist:', error);
    }
}

document.getElementById("addSongForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const songTitle = document.getElementById("songTitle").value;
    const songArtist = document.getElementById("songArtist").value;
    const songUrl = document.getElementById("songUrl").value;
    const playlistId = document.getElementById("playlistId").value;

    const song = {
        title: songTitle,
        artist: songArtist,
        url: songUrl
    };

    await addSongToPlaylist(playlistId, song);
    console.log("Song added to playlist!");
    
    // Clear the form
    document.getElementById("addSongForm").reset();
});

// Sign Up
document.getElementById("signUpBtn").addEventListener("click", async () => {
    const email = document.getElementById("emailInput").value;
    const password = document.getElementById("passwordInput").value;

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        console.log("User signed up:", userCredential.user);
        alert("Account created successfully!");
    } catch (error) {
        console.error("Error signing up:", error);
        alert(error.message);
    }
});

// Login
document.getElementById("loginBtn").addEventListener("click", async () => {
    const email = document.getElementById("emailInput").value;
    const password = document.getElementById("passwordInput").value;

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log("User logged in:", userCredential.user);
        alert("Login successful!");
    } catch (error) {
        console.error("Error logging in:", error);
        alert(error.message);
    }
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", async () => {
    try {
        await auth.signOut();
        console.log("User logged out");
        alert("Logged out successfully!");
    } catch (error) {
        console.error("Error logging out:", error);
        alert(error.message);
    }
});

// Initialize the first track
loadTrack(currentTrackIndex);
