const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');
menuButton.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
}));
document.querySelector('#year').textContent = new Date().getFullYear();
const dialog = document.querySelector('.image-dialog');
const dialogImage = dialog.querySelector('img');
const dialogTitle = dialog.querySelector('p');
const gallery = document.querySelector('.gallery');
const cards = [...document.querySelectorAll('.gallery-card')];
let activeIndex = 0;
const visibleCards = () => cards.filter(card => !card.hidden);
const showImage = index => {
  const items = visibleCards();
  activeIndex = (index + items.length) % items.length;
  const card = items[activeIndex];
  dialogImage.src = card.dataset.image;
  dialogImage.alt = card.querySelector('img').alt;
  dialogTitle.textContent = card.dataset.title;
  dialog.querySelector('.dialog-count').textContent = `${activeIndex + 1} / ${items.length}`;
};
cards.forEach(card => card.addEventListener('click', () => {
  showImage(visibleCards().indexOf(card));
  dialog.showModal();
}));
document.querySelectorAll('.filter-button').forEach(button => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  document.querySelectorAll('.filter-button').forEach(item => {
    const selected = item === button;
    item.classList.toggle('active', selected);
    item.setAttribute('aria-pressed', String(selected));
  });
  cards.forEach(card => { card.hidden = filter !== 'all' && card.dataset.category !== filter; });
  gallery.classList.toggle('filtered', filter !== 'all');
}));
dialog.querySelector('.dialog-prev').addEventListener('click', () => showImage(activeIndex - 1));
dialog.querySelector('.dialog-next').addEventListener('click', () => showImage(activeIndex + 1));
dialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') { event.preventDefault(); showImage(activeIndex - 1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); showImage(activeIndex + 1); }
});
dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
