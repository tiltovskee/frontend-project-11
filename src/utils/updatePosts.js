import { uniqueId } from 'lodash';
import parse from './parser.js';
import fetch from './fetch.js';

const updatePosts = (state) => {
  const { feeds, posts } = state;
  const promises = feeds.map(({ link }) => fetch(link)
    .then(({ data }) => {
      const updatedData = parse(data);
      const titles = Array.from(updatedData.querySelectorAll('title')).map((item) => item.textContent);
      const [, ...postsTitles] = titles;
      const descriptions = Array.from(updatedData.querySelectorAll('description')).map((item) => item.textContent);
      const [, ...postsDescriptions] = descriptions;
      const links = Array.from(updatedData.querySelectorAll('link')).map((item) => item.textContent);
      const [, ...postsLinks] = links;
      const updatedPosts = postsTitles.map((title, index) => ({
        title,
        description: postsDescriptions[index],
        link: postsLinks[index],
        id: uniqueId(),
      }));
      const currentTitles = posts.map((post) => post.title);
      const newTitles = updatedPosts.filter((post) => !currentTitles.includes(post.title));
      posts.unshift(...newTitles);
    }));
  Promise.all(promises).finally(() => setTimeout(updatePosts, 5000, state));
};

export default updatePosts;
