const parse = ({ contents }) => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(contents, 'text/xml');

  const rssTag = xml.querySelector('rss');
  if (!rssTag) {
    throw new Error('notRssSource');
  }

  const titles = Array.from(xml.querySelectorAll('title')).map((item) => item.textContent);
  const [feedTitle, ...postsTitles] = titles;

  const descriptions = Array.from(xml.querySelectorAll('description')).map((item) => item.textContent);
  const [feedDescription, ...postsDescriptions] = descriptions;

  const links = Array.from(xml.querySelectorAll('link')).map((item) => item.textContent);
  const [feedLink, ...postsLinks] = links;

  const parsedData = {
    feed: {
      title: feedTitle,
      description: feedDescription,
      link: feedLink,
    },
    posts: postsTitles.map((title, index) => ({
      title,
      description: postsDescriptions[index],
      link: postsLinks[index],
    })),
  };
  return parsedData;
};

export default parse;