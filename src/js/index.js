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

let lightbox;

Notiflix.Notify.init({
  width: '280px',
  position: 'center-top',
  distance: '100px',
});

refs.form.addEventListener('submit', onSearch);

function onSearch(e) {
  e.preventDefault();

  fetchPixabay.query = e.currentTarget.elements.searchQuery.value.trim();
  if (fetchPixabay.query === '') {
    clearSearchContent();
    return Notiflix.Notify.info('Write something');
  }

  fetchPixabay.resetPage();
  clearSearchContent();

  fetchPixabay.fetch().then(data => {
    Notiflix.Loading.standard();
    if (data.hits.length === 0) {
      Notiflix.Loading.remove();
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    Notiflix.Loading.remove();
    renderMarkup(data);
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
        return `<a class="gallery-item" href="${largeImageURL}"><div class="photo-card">
    <img class='gallery-image' src="${webformatURL}" alt="${tags}" loading="lazy" />
    <div class="info">
      <p class="info-item">
        <b>Likes:</b> ${likes}
      </p>
      <p class="info-item">
        <b>Views:</b> ${views}
      </p>
      <p class="info-item">
        <b>Comments:</b> ${comments}
      </p>
      <p class="info-item">
        <b>Downloads:</b> ${downloads}
      </p>
    </div>
  </div>
  </a>`;
      }
    )
    .join('');
  refs.gallery.insertAdjacentHTML('beforeend', imagesMarkup);

  lightbox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250,
  }).refresh();
}

const onEntry = entries => {
  entries.forEach(entry => {
    const totalImages = document.querySelectorAll('.photo-card').length;
    if (totalImages < 40) {
      return;
    }
    if (entry.isIntersecting && fetchPixabay.query !== '') {
      Notiflix.Loading.standard();
      fetchPixabay.fetch().then(data => {
        if (
          totalImages >= (data.totalHits && 460) ||
          totalImages === data.totalHits
        ) {
          if (totalImages > 40) {
            Notiflix.Notify.info(
              "We're sorry, but you've reached the end of search results."
            );
          }

          Notiflix.Loading.remove();
          observer.unobserve(refs.sentinel);
          return;
        }
        lightbox.destroy();
        Notiflix.Loading.remove();
        renderMarkup(data);
        fetchPixabay.incrementPage();
      });
    }
  });
};

const observer = new IntersectionObserver(onEntry, {
  rootMargin: '200px',
});
