document.addEventListener('DOMContentLoaded', () => {
const themeToggle = document.getElementById('theme-toggle');
let currentTheme = 'dark';
try { currentTheme = localStorage.getItem('theme') || 'dark'; } catch (e) {}
document.documentElement.setAttribute('data-theme', currentTheme);
if (themeToggle) {
themeToggle.addEventListener('click', () => {
const atual = document.documentElement.getAttribute('data-theme');
const novo = atual === 'dark' ? 'light' : 'dark';
document.documentElement.setAttribute('data-theme', novo);
try { localStorage.setItem('theme', novo); } catch (e) {}
});
}
const filterButtons = document.querySelectorAll('.btn-filter');
const cards = document.querySelectorAll('.card-post');
filterButtons.forEach(button => {
button.addEventListener('click', () => {
filterButtons.forEach(item => {
item.classList.remove('active');
item.setAttribute('aria-pressed', 'false');
});
button.classList.add('active');
button.setAttribute('aria-pressed', 'true');
const mood = button.dataset.mood;
cards.forEach(card => {
const mostrar = mood === 'todos' || card.dataset.mood === mood;
card.style.display = mostrar ? 'flex' : 'none';
});
});
});
const playlists = {
celestial: [
{ titulo: 'A Sky Full of Stars — Coldplay', videoId: 'VPRjCeoBqrI' },
{ titulo: 'Starboy — The Weeknd ft. Daft Punk', videoId: '34Na4j8AVgA' },
{ titulo: 'Midnight City — M83', videoId: 'dX3k_QDnzHE' }
],
energia: [
{ titulo: 'Summer — Calvin Harris', videoId: 'ebXbLfLACGM' },
{ titulo: 'Titanium — David Guetta ft. Sia', videoId: 'JRfuAukYTKg' },
{ titulo: 'Blinding Lights — The Weeknd', videoId: '4NRXx6U8ABQ' }
],
foco: [
{ titulo: 'Loops Ambientais e Codificação', videoId: '5qap5aO4i9A' },
{ titulo: 'The xx — Intro', videoId: '3PXrNl2cSx4' }
],
melancolia: [
{ titulo: 'Someone Like You — Adele', videoId: 'hLQl3WQQoQ0' },
{ titulo: 'Photograph — Ed Sheeran', videoId: 'nSDgHBxUbVQ' },
{ titulo: 'Fix You — Coldplay', videoId: 'k4V3Mo61fJM' }
]
};
const nomes = {
celestial: 'Visão Celestial',
energia: 'Energia Alta',
foco: 'Hiperfoco',
melancolia: 'Bad/Reflexivo'
};
const readButtons = document.querySelectorAll('.btn-read');
const videoModal = document.getElementById('video-modal');
const modalTitle = document.getElementById('modal-title');
const closeModal = document.getElementById('close-modal');
const playlistInfo = document.getElementById('playlist-info');
const btnPlay = document.getElementById('btn-play');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const btnMute = document.getElementById('btn-mute');
const progressBar = document.getElementById('progress-bar');
const volumeBar = document.getElementById('volume-bar');
const currentTime = document.getElementById('current-time');
const duration = document.getElementById('duration');
let player = null;
let playerReady = false;
let playlistAtual = [];
let indiceAtual = 0;
let categoriaAtual = '';
let atualizandoBarra = false;
const tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';
document.body.appendChild(tag);
window.onYouTubeIframeAPIReady = function () {
player = new YT.Player('youtube-player', {
height: '100%',
width: '100%',
videoId: '',
playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
events: {
onReady: () => { playerReady = true; },
onStateChange: onPlayerStateChange
}
});
};
function formatarTempo(segundos) {
const minutos = Math.floor(segundos / 60);
const resto = Math.floor(segundos % 60);
return minutos + ':' + String(resto).padStart(2, '0');
}
function abrirPlaylist(categoria, indice) {
categoriaAtual = categoria;
playlistAtual = playlists[categoria] || [];
indiceAtual = indice;
if (!playlistAtual[indiceAtual]) indiceAtual = 0;
videoModal.classList.remove('escondido');
document.body.style.overflow = 'hidden';
carregarMusica(indiceAtual, true);
}
function carregarMusica(indice, tocar) {
if (!playerReady || !playlistAtual[indice]) return;
indiceAtual = indice;
const musica = playlistAtual[indice];
modalTitle.textContent = musica.titulo;
playlistInfo.textContent = 'Categoria: ' + nomes[categoriaAtual] + ' — Música ' + (indice + 1) + ' de ' + playlistAtual.length;
if (tocar) player.loadVideoById(musica.videoId);
else player.cueVideoById(musica.videoId);
}
function proximaMusica() {
carregarMusica((indiceAtual + 1) % playlistAtual.length, true);
}
function musicaAnterior() {
carregarMusica((indiceAtual - 1 + playlistAtual.length) % playlistAtual.length, true);
}
function alternarPlay() {
if (!playerReady) return;
const estado = player.getPlayerState();
if (estado === YT.PlayerState.PLAYING) {
player.pauseVideo();
btnPlay.textContent = '▶️';
} else {
player.playVideo();
btnPlay.textContent = '⏸️';
}
}
function onPlayerStateChange(event) {
if (event.data === YT.PlayerState.PLAYING) {
btnPlay.textContent = '⏸️';
duration.textContent = formatarTempo(player.getDuration());
}
if (event.data === YT.PlayerState.PAUSED) btnPlay.textContent = '▶️';
if (event.data === YT.PlayerState.ENDED) proximaMusica();
}
readButtons.forEach(button => {
button.addEventListener('click', () => {
abrirPlaylist(button.dataset.category, Number(button.dataset.index));
});
});
btnPlay.addEventListener('click', alternarPlay);
btnNext.addEventListener('click', proximaMusica);
btnPrev.addEventListener('click', musicaAnterior);
btnMute.addEventListener('click', () => {
if (!playerReady) return;
if (player.isMuted()) {
player.unMute();
btnMute.textContent = '🔊';
} else {
player.mute();
btnMute.textContent = '🔇';
}
});
volumeBar.addEventListener('input', () => {
if (!playerReady) return;
player.setVolume(Number(volumeBar.value));
btnMute.textContent = Number(volumeBar.value) === 0 ? '🔇' : '🔊';
});
progressBar.addEventListener('input', () => {
if (!playerReady) return;
atualizandoBarra = true;
const duracao = player.getDuration();
const novoTempo = (Number(progressBar.value) / 100) * duracao;
player.seekTo(novoTempo, true);
currentTime.textContent = formatarTempo(novoTempo);
});
progressBar.addEventListener('change', () => { atualizandoBarra = false; });
setInterval(() => {
if (!playerReady || atualizandoBarra) return;
if (player.getPlayerState() === YT.PlayerState.PLAYING) {
const duracao = player.getDuration();
const tempo = player.getCurrentTime();
progressBar.value = (tempo / duracao) * 100;
currentTime.textContent = formatarTempo(tempo);
duration.textContent = formatarTempo(duracao);
}
}, 500);
function fecharModal() {
if (playerReady) player.stopVideo();
videoModal.classList.add('escondido');
document.body.style.overflow = '';
}
closeModal.addEventListener('click', fecharModal);
videoModal.addEventListener('click', event => {
if (event.target === videoModal) fecharModal();
});
document.addEventListener('keydown', event => {
if (event.key === 'Escape' && !videoModal.classList.contains('escondido')) fecharModal();
});
const form = document.getElementById('form-inscricao');
const email = document.getElementById('email-inscricao');
const mensagem = document.getElementById('mensagem-inscricao');
form.addEventListener('submit', event => {
event.preventDefault();
const valor = email.value.trim();
if (!valor || !valor.includes('@') || !valor.includes('.')) {
mensagem.textContent = 'Digite um e-mail válido para entrar na vibe.';
mensagem.classList.remove('escondido');
return;
}
mensagem.textContent = 'Inscrição realizada! ' + valor + ' entrou na frequência MoodWave. 🌀';
mensagem.classList.remove('escondido');
form.reset();
});
});