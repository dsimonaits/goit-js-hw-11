import Notiflix from 'notiflix';
import axios from 'axios';

export { fetchPixabay };

const KEY = '30781043-697065eb175f1ee93924e4241';

async function fetchPixabay(query, page, perPage) {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: 'true',
        page: page,
        per_page: perPage,
      },
    });
    return response;
  } catch (error) {
    Notiflix.Notify.failure('Something went wrong');
  }
}

// export class FetchPixabay {
//   static URL = 'https://pixabay.com/api/';
//   static #API = '30781043-697065eb175f1ee93924e4241';

//   constructor() {
//     this.searchQuery = '';
//     this.page = 1;
//   }

//   async fetch() {
//     const params = new URLSearchParams({
//       key: FetchPixabay.#API,
//       q: this.searchQuery,
//       image_type: 'photo',
//       orientation: 'horizontal',
//       safesearch: 'true',
//       page: this.page,
//       per_page: 40,
//     });

//     const result = await fetch(`${FetchPixabay.URL}?${params}`);

//     return result.ok
//       ? result.json()
//       : Promise.reject(Notiflix.Notify.failure('Something went wrong'));
//   }

//   resetPage() {
//     this.page = 1;
//   }

//   incrementPage() {
//     this.page += 1;
//   }

//   get query() {
//     return this.searchQuery;
//   }

//   set query(value) {
//     this.searchQuery = value;
//   }
// }
