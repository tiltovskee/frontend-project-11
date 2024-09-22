import i18next from 'i18next';

const input = document.querySelector('input');
const submitButton = document.querySelector('button[type=submit]');
const feedsDiv = document.querySelector('div.feeds');
const postsDiv = document.querySelector('div.posts');
const modalTitle = document.querySelector('.modal-title');
const modalBody = document.querySelector('.modal-body');
const modalBtn = document.querySelector('.modal-footer > .full-article');

const renderFeedbackMessage = (state, path, value) => {
  const feedbackMessage = document.querySelector('.feedback');
  if (path === 'status') {
    feedbackMessage.classList.remove('text-danger', 'text-success');
    feedbackMessage.textContent = '';
    if (value === 'invalid') {
      input.classList.add('is-invalid');
      feedbackMessage.classList.add('text-danger');
      feedbackMessage.textContent = state.error;
    }
    if (value === 'success') {
      feedbackMessage.classList.add('text-success');
      feedbackMessage.textContent = i18next.t('success.validUrl');
      input.classList.remove('is-invalid');
      input.value = '';
    }
  }
};

const disabledSubmitButton = (status) => {
  if (status === 'loading') {
    submitButton.setAttribute('disabled', true);
    input.disabled = true;
  } else {
    submitButton.removeAttribute('disabled');
    input.disabled = false;
  }
};

const renderCard = (type) => {
  const container = type === 'feeds' ? feedsDiv : postsDiv;
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  const cardDiv = document.createElement('div');
  cardDiv.classList.add('card', 'border-0');
  container.prepend(cardDiv);

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  cardDiv.prepend(cardBody);

  const cardTitle = document.createElement('h4');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18next.t(`${type}Title`);
  cardBody.prepend(cardTitle);

  const ulEl = document.createElement('ul');
  ulEl.classList.add('list-group', 'border-0', 'rounded-0');
  cardDiv.append(ulEl);

  return container;
};

const renderFeeds = (value) => {
  const card = renderCard('feeds');
  const ulEl = card.querySelector('.list-group');
  value.forEach((feed) => {
    const { title, description } = feed;
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item', 'border-0', 'border-end-0');
    liEl.innerHTML = `<h3 class='h6 m-0'>${title}</h3><p class='m-0 small text-black-50'>${description}</p>`;
    ulEl.append(liEl);
  });
};

const renderPosts = (state, value) => {
  const card = renderCard('posts');
  const ulEl = card.querySelector('.list-group');
  value.forEach((post) => {
    const { title, link, id } = post;
    const liEl = document.createElement('li');
    liEl.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-end',
      'border-0',
      'border-end-0',
    );
    const classesForVisited = state.visitedLinks.includes(id) ? ['fw-normal', 'link-secondary'] : ['fw-bold'];
    const aEl = document.createElement('a');
    aEl.setAttribute('href', link);
    aEl.classList.add(...classesForVisited);
    aEl.setAttribute('data-id', id);
    aEl.setAttribute('target', '_blank');
    aEl.setAttribute('rel', 'noopener noreferrer');
    aEl.textContent = title;

    const btnEl = document.createElement('button');
    btnEl.setAttribute('type', 'button');
    btnEl.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    btnEl.setAttribute('data-id', id);
    btnEl.setAttribute('data-bs-toggle', 'modal');
    btnEl.setAttribute('data-bs-target', '#modal');

    btnEl.textContent = i18next.t('viewBtn');

    liEl.append(aEl, btnEl);
    ulEl.append(liEl);
  });
};

const viewPosts = (state, visitedLinksList) => {
  const { posts } = state;
  const visitedLinkId = visitedLinksList[visitedLinksList.length - 1];
  const currentLink = document.querySelector(`a[data-id="${visitedLinkId}"]`);
  currentLink.classList.remove('fw-bold');
  currentLink.classList.add('fw-normal', 'link-secondary');

  const currentPost = posts.find((post) => post.id === visitedLinkId);
  const { title, description, link } = currentPost;

  modalBtn.setAttribute('href', link);
  modalTitle.textContent = title;
  modalBody.textContent = description;
};

const render = (state, path, value) => {
  switch (path) {
    case 'status':
      renderFeedbackMessage(state, path, value);
      disabledSubmitButton(value);
      break;
    case 'feeds':
      renderFeedbackMessage(state, path, value);
      renderFeeds(value);
      input.value = '';
      input.focus();
      break;
    case 'posts':
      renderPosts(state, value);
      break;
    case 'error':
      renderFeedbackMessage(state, path, value);
      break;
    case 'visitedLinks':
      viewPosts(state, value);
      break;
    default:
      throw new Error('someError');
  }
};

export default render;
