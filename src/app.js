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
    })
    .then(() => {
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
        appStatus: {
          loading: 'ready',
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
        watchedState.appStatus.loading = 'in progress';
        const links = state.feeds.map((feed) => feed.link);
        schema(links).validate(rssLink)
          .then(() => fetch(rssLink))
          .then(({ data }) => {
            const parsedData = parse(data);

            const dataTitles = Array.from(parsedData.querySelectorAll('title')).map((item) => item.textContent);
            const [feedTitle, ...postsTitles] = dataTitles;
            const dataDescriptions = Array.from(parsedData.querySelectorAll('description')).map((item) => item.textContent);
            const [feedDescription, ...postsDescriptions] = dataDescriptions;
            const dataLinks = Array.from(parsedData.querySelectorAll('link')).map((item) => item.textContent);
            const [feedLink, ...postsLinks] = dataLinks;

            const feed = {
              title: feedTitle,
              description: feedDescription,
              link: feedLink,
            };
            const posts = postsTitles.map((title, index) => ({
              title,
              description: postsDescriptions[index],
              link: postsLinks[index],
              id: uniqueId(),
            }));

            watchedState.appStatus.error = null;
            watchedState.feeds.unshift({ ...feed, link: rssLink });
            watchedState.posts.unshift(...posts);
            watchedState.appStatus.loading = 'success';
            elements.input.focus();
          })
          .catch((err) => {
            watchedState.appStatus.error = i18next.t(`errors.${err.message}`);
            watchedState.appStatus.loading = 'failed';
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
