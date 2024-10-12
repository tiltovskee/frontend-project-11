const parse = ({ contents }) => {
  const parser = new DOMParser();
  const parsedData = parser.parseFromString(contents, 'text/xml');

  const rssTag = parsedData.querySelector('rss');
  if (!rssTag) {
    throw new Error('notRssSource');
  }

  return parsedData;
};

export default parse;
