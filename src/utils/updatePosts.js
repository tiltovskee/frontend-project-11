import { uniqueId } from 'lodash';
import parse from './parser.js';
import fetch from './fetch.js';

const updatePosts = (state) => {
  const { feeds, posts } = state;
  const promises = feeds.map(({ link }) => fetch(link)
    .then(({ data }) => {
      const updatedData = parse(data);
      const updatedPosts = updatedData.postsTitles.map((title, index) => ({
        title,
        description: updatedData.postsDescriptions[index],
        link: updatedData.postsLinks[index],
        id: uniqueId(),
      }));
      const currentTitles = posts.map((post) => post.title);
      const newTitles = updatedPosts.filter((post) => !currentTitles.includes(post.title));
      posts.unshift(...newTitles);
    }));
  Promise.all(promises).finally(() => setTimeout(updatePosts, 5000, state));
};

export default updatePosts;
