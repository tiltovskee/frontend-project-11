import { uniqueId } from 'lodash';
import axios from 'axios';
import parse from './parser.js';

const updatePosts = (state) => {
  const { links, posts } = state;
  const promises = links.map((link) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${link}`)
    .then(({ data }) => {
      const updatedData = parse(data);
      const currentTitles = posts.map((post) => post.title);
      const newTitles = updatedData.posts
        .filter((post) => !currentTitles.includes(post.title))
        .map((post) => ({ ...post, id: uniqueId() }));
      posts.unshift(...newTitles);
    }));
  Promise.all(promises).finally(() => setTimeout(updatePosts, 5000, state));
};

export default updatePosts;
