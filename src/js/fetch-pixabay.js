export { fetchPixabay };
import Notiflix from 'notiflix';

class fetchPixabay {
  static URL = 'https://pixabay.com/api/';
  static #API = '30781043-697065eb175f1ee93924e4241';
  #page = 1;

  constructor(query = '') {
    this.query = query;
    this.#page = page;
  }

  async fetchImages() {
    const params = new URLSearchParams({
      key: fetchPixabay.#API,
      q: this.query,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: 'true',
      per_page: 40,
    });

    const result = await fetch(`${fetchPixabay.URL}/${params}`);

    return result.ok
      ? result.json()
      : Promise.reject(Notiflix.Notify.failure('Something went wrong'));
  }

  resetPage() {
    this.#page = 0;
  }

  get page() {
    return this.#page;
  }

  set page(value) {
    this.#page = value;
  }

  get query() {
    return this.#query;
  }

  set query(value) {
    this.#query = value;
  }
}
