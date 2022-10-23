import { FetchPixabay } from './fetch-pixabay';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  sentinel: document.querySelector('#sentinel'),
};

const fetchPixabay = new FetchPixabay();

Notiflix.Notify.init({
  width: '280px',
  position: 'center-top',
  distance: '25px',
});

refs.form.addEventListener('submit', onSearch);

function onSearch(e) {
  e.preventDefault();

  fetchPixabay.query = e.currentTarget.elements.searchQuery.value;

  if (fetchPixabay.query === '') {
    clearSearchContent();
    return Notiflix.Notify.info('Write something');
  }
  fetchPixabay.resetPage();
  clearSearchContent();
  fetchPixabay.fetch().then(data => {
    if (data.hits.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    Notiflix.Loading.standard();
    renderMarkup(data);
    Notiflix.Loading.remove();
    Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
    observer.observe(refs.sentinel);
  });

  fetchPixabay.incrementPage();
}

function clearSearchContent() {
  refs.gallery.innerHTML = '';
}

function renderMarkup(images) {
  const imagesMarkup = images.hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<div class="photo-card">
    <a class="gallery_item" href="${largeImageURL}">
    <img class='gallery__image' src="${webformatURL}" alt="${tags}" loading="lazy" />
    <div class="info">
      <p class="info-item">
        <b>Likes</b> ${likes}
      </p>
      <p class="info-item">
        <b>Views</b> ${views}
      </p>
      <p class="info-item">
        <b>Comments</b> ${comments}
      </p>
      <p class="info-item">
        <b>Downloads</b> ${downloads}
      </p>
    </div>
    </a>
  </div>`;
      }
    )
    .join('');
  refs.gallery.insertAdjacentHTML('beforeend', imagesMarkup);

  const lightbox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250,
  });
}

const onEntry = entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && fetchPixabay.query !== '') {
      fetchPixabay.fetch().then(data => {
        const totalImages = document.querySelectorAll('.photo-card').length;
        if (totalImages === data.totalHits) {
          if (totalImages > 40) {
            Notiflix.Notify.info(
              "We're sorry, but you've reached the end of search results."
            );
          }
          observer.unobserve(refs.sentinel);
          return;
        }
        Notiflix.Loading.standard();
        renderMarkup(data);
        fetchPixabay.incrementPage();
        Notiflix.Loading.remove();
      });
    }
  });
};

const observer = new IntersectionObserver(onEntry, {
  rootMargin: '200px',
});
