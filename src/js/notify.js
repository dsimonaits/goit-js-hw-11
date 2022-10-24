import Notiflix from 'notiflix';

Notiflix.Notify.init({
  width: '280px',
  position: 'center-top',
  distance: '100px',
});

export { Notify };

const Notify = {
  info(message) {
    Notiflix.Notify.info(`${message}`);
  },

  failure(message) {
    Notiflix.Notify.failure(`${message}`);
  },

  warning(message) {
    Notiflix.Notify.warning(`${message}`);
  },

  success(message) {
    Notiflix.Notify.success(`${message}`);
  },

  addLoading() {
    Notiflix.Loading.standard();
  },

  removeLoading() {
    Notiflix.Loading.remove();
  },
};
