const root = document.documentElement;
const header = document.querySelector('.header');
const menuButton = document.querySelector('.menu-button');
const menuPanel = document.querySelector('.menu-panel');
const motionButton = document.querySelector('.motion-toggle');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let motionPaused = false;

function setMenu(open) {
  menuPanel.classList.toggle('open', open);
  header.classList.toggle('menu-open', open);
  menuButton.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  menuPanel.inert = !open;
  document.body.style.overflow = open ? 'hidden' : '';
}
menuButton.addEventListener('click', () => setMenu(!menuPanel.classList.contains('open')));
menuPanel.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuPanel.classList.contains('open')) setMenu(false);
});
motionButton.addEventListener('click', () => {
  motionPaused = !motionPaused;
  root.classList.toggle('motion-paused', motionPaused);
  motionButton.setAttribute('aria-pressed', String(motionPaused));
  motionButton.setAttribute('aria-label', motionPaused ? 'Resume animations' : 'Pause animations');
  motionButton.textContent = motionPaused ? 'RESUME MOTION' : 'PAUSE MOTION';
  updateScroll();
});

if (!prefersReducedMotion.matches) root.classList.add('motion-ready');
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('in-view');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
document.querySelectorAll('.reveal, .manifesto-visual').forEach(element => revealObserver.observe(element));

let scrollQueued = false;
function updateScroll() {
  scrollQueued = false;
  const scrollable = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  root.style.setProperty('--scroll', `${Math.min(100, scrollY / scrollable * 100)}%`);
  header.classList.toggle('scrolled', scrollY > 40);
  if (motionPaused || prefersReducedMotion.matches) {
    root.style.setProperty('--hero-scale', '1');
    root.style.setProperty('--break-y', '0px');
    return;
  }
  const heroProgress = Math.min(1, scrollY / Math.max(1, innerHeight));
  root.style.setProperty('--hero-scale', String(1.08 - heroProgress * 0.08));
  const breakFrame = document.querySelector('.break-frame');
  const distance = breakFrame.getBoundingClientRect().top - innerHeight;
  const progress = Math.max(0, Math.min(1, -distance / (innerHeight + breakFrame.offsetHeight)));
  root.style.setProperty('--break-y', `${(progress - 0.5) * 80}px`);
}
addEventListener('scroll', () => {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(updateScroll);
}, { passive: true });
addEventListener('resize', updateScroll);
updateScroll();

const capRows = [...document.querySelectorAll('.cap-row')];
const capImage = document.querySelector('.cap-image');
const capPhoto = capImage.querySelector('img');
let imageTimer;
capRows.forEach(row => row.addEventListener('click', () => {
  capRows.forEach(item => {
    const selected = item === row;
    item.classList.toggle('active', selected);
    item.setAttribute('aria-expanded', String(selected));
  });
  clearTimeout(imageTimer);
  capImage.classList.add('changing');
  imageTimer = setTimeout(() => {
    capPhoto.src = row.dataset.image;
    capPhoto.alt = row.dataset.alt;
    capImage.classList.remove('changing');
  }, motionPaused || prefersReducedMotion.matches ? 0 : 180);
}));

const reel = document.querySelector('.reel');
const frames = [...reel.querySelectorAll('figure')];
const count = document.querySelector('.reel-count');
let currentFrame = 0;
function goToFrame(index) {
  currentFrame = Math.max(0, Math.min(frames.length - 1, index));
  const left = frames[currentFrame].getBoundingClientRect().left - reel.getBoundingClientRect().left + reel.scrollLeft;
  reel.scrollTo({ left, behavior: motionPaused || prefersReducedMotion.matches ? 'auto' : 'smooth' });
  count.textContent = `${String(currentFrame + 1).padStart(2, '0')} / ${String(frames.length).padStart(2, '0')}`;
}
document.querySelector('.reel-prev').addEventListener('click', () => goToFrame(currentFrame - 1));
document.querySelector('.reel-next').addEventListener('click', () => goToFrame(currentFrame + 1));
reel.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    goToFrame(currentFrame + (event.key === 'ArrowRight' ? 1 : -1));
  }
});
let reelQueued = false;
reel.addEventListener('scroll', () => {
  if (reelQueued) return;
  reelQueued = true;
  requestAnimationFrame(() => {
    reelQueued = false;
    const center = reel.getBoundingClientRect().left + reel.clientWidth / 2;
    let smallestDistance = Infinity;
    frames.forEach((frame, index) => {
      const rect = frame.getBoundingClientRect();
      const distance = Math.abs(rect.left + rect.width / 2 - center);
      if (distance < smallestDistance) { smallestDistance = distance; currentFrame = index; }
    });
    count.textContent = `${String(currentFrame + 1).padStart(2, '0')} / ${String(frames.length).padStart(2, '0')}`;
  });
}, { passive: true });

const cursor = document.querySelector('.cursor');
if (matchMedia('(pointer: fine)').matches) {
  document.addEventListener('pointermove', event => {
    cursor.classList.add('visible');
    cursor.style.setProperty('--cursor-x', `${event.clientX}px`);
    cursor.style.setProperty('--cursor-y', `${event.clientY}px`);
  }, { passive: true });
  document.querySelectorAll('.reel figure, .cap-row, .hero-scroll').forEach(element => {
    element.addEventListener('pointerenter', () => cursor.classList.add('over-media'));
    element.addEventListener('pointerleave', () => cursor.classList.remove('over-media'));
  });
  document.addEventListener('pointerleave', () => cursor.classList.remove('visible'));
}
document.querySelector('#year').textContent = new Date().getFullYear();
