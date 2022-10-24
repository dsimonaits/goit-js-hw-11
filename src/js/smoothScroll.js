export { smoothScroll };

function smoothScroll(querySelector) {
  const { height } = querySelector.firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: height * 2,
    behavior: 'smooth',
  });
}
