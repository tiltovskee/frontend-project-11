import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import { uniqueId } from 'lodash';
import ru from './locales/ru.js';
import render from './view.js';
import parse from './utils/parser.js';
import updatePosts from './utils/updatePosts.js';
import fetch from './utils/fetch.js';

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

      const schema = (feeds) => yup.string().url().notOneOf(feeds).required();

      const elements = {
        input: document.querySelector('input'),
        submitButton: document.querySelector('button[type=submit]'),
        feedsDiv: document.querySelector('div.feeds'),
        postsDiv: document.querySelector('div.posts'),
        modalTitle: document.querySelector('.modal-title'),
        modalBody: document.querySelector('.modal-body'),
        modalBtn: document.querySelector('.modal-footer > .full-article'),
        feedbackMessage: document.querySelector('.feedback'),
      };

      const state = {
        loadingProcess: {
          status: 'ready',
          error: null,
        },
        feeds: [],
        posts: [],
        visitedLinks: [],
      };

      const watchedState = onChange(state, (path, value) => {
        render(elements, state, path, value);
      });

      document.querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const rssLink = formData.get('url');
        watchedState.loadingProcess.status = 'in progress';
        const links = state.feeds.map((feed) => feed.link);
        schema(links).validate(rssLink)
          .then(() => fetch(rssLink))
          .then(({ data }) => {
            const parsedData = parse(data);

            const feed = {
              title: parsedData.feedTitle,
              description: parsedData.feedDescription,
              link: parsedData.feedLink,
            };
            const posts = parsedData.postsTitles.map((title, index) => ({
              title,
              description: parsedData.postsDescriptions[index],
              link: parsedData.postsLinks[index],
              id: uniqueId(),
            }));

            watchedState.loadingProcess.error = null;
            watchedState.feeds.unshift({ ...feed, link: rssLink });
            watchedState.posts.unshift(...posts);
            watchedState.loadingProcess.status = 'success';
          })
          .catch((err) => {
            watchedState.loadingProcess.error = i18next.t(`errors.${err.message}`);
            watchedState.loadingProcess.status = 'failed';
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
      updatePosts(watchedState);
    });
};
