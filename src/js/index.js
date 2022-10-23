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

refs.form.addEventListener('submit', onSearch);

function onSearch(e) {
  e.preventDefault();

  fetchPixabay.query = e.currentTarget.elements.searchQuery.value;

  if (fetchPixabay.query === '') {
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
    renderMarkup(data);
    Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
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
        if (fetchPixabay.page === Math.round(data.totalHits / 40) || 2) {
          Notiflix.Notify.info(
            "We're sorry, but you've reached the end of search results."
          );
          observer.unobserve(refs.sentinel);
          return;
        }
        renderMarkup(data);
        fetchPixabay.incrementPage();
      });
    }
  });
};

const observer = new IntersectionObserver(onEntry, {
  rootMargin: '300px',
});

observer.observe(refs.sentinel);
