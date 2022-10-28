import { fetchPixabay } from './fetch-pixabay';
import { renderMarkup } from './renderMarkup';
import { smoothScroll } from './smoothScroll';
import { Notify } from './notify';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

let query = '';
let page = 1;
const perPage = 40;
const maxPages = 500;

let lightbox;

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
    Notify.info('Write something');
    return;
  }

  clearSearchContent();
  resetPage();
  fetchImage();
  incrementPage();
  refs.form.reset();
}

const fetchImage = async () => {
  try {
    const data = await fetchPixabay(query, page, perPage);
    const fetchData = data.data;
    Notify.addLoading();
    if (fetchData.hits.length === 0) {
      Notify.removeLoading();
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    Notify.removeLoading();

    renderMarkup(fetchData.hits, refs.gallery);
    lightbox = new SimpleLightbox('.gallery a', {
      captionsData: 'alt',
      captionDelay: 250,
    }).refresh();
    Notify.success(`Hooray! We found ${fetchData.totalHits} images.`);
    observer.observe(refs.sentinel);
  } catch (error) {
    console.log(error);
    Notify.failure('Something went wrong');
  }
};

const onEntry = entries => {
  entries.forEach(async entry => {
    const totalImages = document.querySelectorAll('.photo-card').length;
    if (totalImages < perPage) {
      return;
    }
    if (entry.isIntersecting && query !== '') {
      try {
        if (totalImages >= maxPages) {
          if (totalImages > perPage) {
            Notify.info(
              "We're sorry, but you've reached the end of search results."
            );
          }
          observer.unobserve(refs.sentinel);
          return;
        }
        Notify.addLoading();
        const data = await fetchPixabay(query, page, perPage);
        const fetchData = data.data;

        lightbox.destroy();
        Notify.removeLoading();
        renderMarkup(fetchData.hits, refs.gallery);
        lightbox = new SimpleLightbox('.gallery a', {
          captionsData: 'alt',
          captionDelay: 250,
        }).refresh();
        incrementPage();
      } catch (error) {
        console.log(error);
        Notify.failure('Something went wrong');
      }
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
const observer = new IntersectionObserver(onEntry, {
  rootMargin: '200px',
});
