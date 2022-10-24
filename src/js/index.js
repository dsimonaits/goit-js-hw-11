import { fetchPixabay } from './fetch-pixabay';
import { renderMarkup } from './renderMarkup';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

Notiflix.Notify.init({
  width: '280px',
  position: 'center-top',
  distance: '100px',
});

let query = '';
let page = 1;
const perPage = 40;

let fetchData = null;

const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  sentinel: document.querySelector('#sentinel'),
};

refs.form.addEventListener('submit', onSearch);

function onSearch(e) {
  e.preventDefault();
  query = e.currentTarget.elements.searchQuery.value.trim();
  if (query === '') {
    clearSearchContent();
    NotifyEmptySearch();
    return;
  }

  resetPage();
  clearSearchContent();

  fetchPixabay(query, page, perPage)
    .then(data => {
      fetchData = data.data;
      NotifyLoading();

      if (fetchData.length === 0) {
        Notiflix.Loading.remove();
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return;
      }
      Notiflix.Loading.remove();

      renderMarkup(fetchData.hits, refs.gallery);
      Notiflix.Notify.success(
        `Hooray! We found ${fetchData.totalHits} images.`
      );
      observer.observe(refs.sentinel);
    })
    .catch(error => {
      console.log(error);
      Notiflix.Notify.failure('Something went wrong');
    });

  incrementPage();
}

const onEntry = entries => {
  entries.forEach(entry => {
    const totalImages = document.querySelectorAll('.photo-card').length;
    if (totalImages < 40) {
      return;
    }
    if (entry.isIntersecting && query !== '') {
      Notiflix.Loading.standard();
      fetchPixabay(query, page, perPage).then(data => {
        fetchData = data.data;
        if (
          totalImages >= (fetchData.totalHits && 460) ||
          totalImages === fetchData.totalHits
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
        renderMarkup(fetchData.hits, refs.gallery);
        incrementPage();
      });
    }
  });
};

function resetPage() {
  page = 1;
}

function incrementPage() {
  page += 1;
}

function clearSearchContent() {
  refs.gallery.innerHTML = '';
}

function NotifyEmptySearch() {
  Notiflix.Notify.info('Write something');
}

function NotifyLoading() {
  Notiflix.Loading.standard();
}

const observer = new IntersectionObserver(onEntry, {
  rootMargin: '200px',
});
