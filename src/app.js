import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import { uniqueId } from 'lodash';
import ru from './locales/ru.js';
import render from './view.js';
import parse from './utils/parser.js';

export default () => {
  i18next.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru,
    },
  })
    .then(() => {
      yup.setLocale({
        mixed: {
          notOneOf: 'notOneOfError',
        },
        string: {
          url: 'notValidUrl',
        },
      });
    });

  const schema = (feeds) => yup.string().url().notOneOf(feeds).required();

  const state = {
    status: 'valid',
    links: [],
    feeds: [],
    posts: [],
    error: null,
    visitedLinks: [],
  };

  // View layer
  const watchedState = onChange(state, (path, value) => {
    render(state, path, value);
  });

  // Controller layer
  document.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const rssLink = formData.get('url');
    schema(state.links).validate(rssLink)
      .then((url) => {
        watchedState.status = 'loading';
        const newUrl = new URL(`https://allorigins.hexlet.app/get?disableCache=true&url=${url}`);
        return axios.get(newUrl);
      })
      .then(({ data }) => {
        const { feed, posts } = parse(data);
        const postsWithId = posts.map((post) => ({ ...post, id: uniqueId() }));
        state.links.push(rssLink);
        watchedState.error = null;
        watchedState.feeds.unshift(feed);
        watchedState.posts.unshift(...postsWithId);
        watchedState.status = 'success';
      })
      .catch((err) => {
        watchedState.error = i18next.t(`errors.${err.message}`);
        watchedState.status = 'invalid';
      });
  });
  const postContainer = document.querySelector('.posts');
  postContainer.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') {
      const { id } = e.target.dataset;
      if (!watchedState.visitedLinks.includes(id)) {
        watchedState.visitedLinks.push(id);
      }
    }
  });
};
