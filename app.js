const items = [
  {
    id: 'clock-watch',
    name: 'Gilt Clock-Watch',
    category: 'Clocks & Watches',
    bid: 85,
    daysUntilEnd: 2,
    condition: 'Good vintage condition',
    description: 'A small, ornate gilt timepiece with a decorative case. Fine details give it a distinctive old-world look.',
    image: './images/clock-watch.jpg',
    imageAlt: 'Gilt clock-watch with engraved detail'
  },
  {
    id: 'painted-amphora',
    name: 'Painted Amphora',
    category: 'Ceramics',
    bid: 120,
    daysUntilEnd: 3,
    condition: 'Used; age marks visible',
    description: 'A tall pottery vessel with painted figures and a rounded body. It makes a striking shelf or display piece.',
    image: './images/amphora.jpg',
    imageAlt: 'Decorated ancient amphora on a plain background'
  },
  {
    id: 'italian-candlestick',
    name: 'Italian Brass Candlestick',
    category: 'Decorative',
    bid: 64,
    daysUntilEnd: 4,
    condition: 'Good; light surface wear',
    description: 'A sculptural brass candlestick with a warm patina and a sturdy base. A simple decorative object for a mantel or table.',
    image: './images/italian-candlestick.jpg',
    imageAlt: 'Ornate Italian candlestick from a museum collection'
  },
  {
    id: 'tripod-candlestick',
    name: 'Three-Footed Candle Stand',
    category: 'Decorative',
    bid: 48,
    daysUntilEnd: 5,
    condition: 'Fair; age-related marks',
    description: 'A compact, three-footed metal candle stand with a detailed stem. The surface has a naturally aged finish.',
    image: './images/tripod-candlestick.jpg',
    imageAlt: 'Small antique tripod candlestick on a neutral background'
  }
];

const grid = document.querySelector('#listing-grid');
const searchInput = document.querySelector('#search-input');
const categoryFilter = document.querySelector('#category-filter');
const itemCount = document.querySelector('#item-count');
const emptyState = document.querySelector('#empty-state');
const dialog = document.querySelector('#item-dialog');
const dialogContent = document.querySelector('#dialog-content');
let activeItemId = null;

function endDate(item) {
  return new Date(Date.now() + item.daysUntilEnd * 24 * 60 * 60 * 1000);
}

function formatEndDate(item) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
  }).format(endDate(item));
}

function money(value) {
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(value);
}

function getVisibleItems() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  return items.filter((item) => {
    const matchesText = `${item.name} ${item.category} ${item.description}`.toLowerCase().includes(query);
    const matchesCategory = category === 'all' || item.category === category;
    return matchesText && matchesCategory;
  });
}

function renderItems() {
  const visibleItems = getVisibleItems();
  itemCount.textContent = `${visibleItems.length} ${visibleItems.length === 1 ? 'item' : 'items'}`;
  emptyState.hidden = visibleItems.length !== 0;
  grid.innerHTML = visibleItems.map((item) => `
    <article class="item-card">
      <button class="item-photo-button" type="button" data-open-item="${item.id}" aria-label="View ${item.name}">
        <img class="item-photo" src="${item.image}" alt="${item.imageAlt}" loading="lazy">
      </button>
      <div class="item-card-body">
        <span class="category-tag">${item.category}</span>
        <h3><button type="button" data-open-item="${item.id}">${item.name}</button></h3>
        <p class="bid-summary">Current bid <strong>${money(item.bid)}</strong></p>
        <p class="end-time">Ends ${formatEndDate(item)}</p>
        <button class="card-link" type="button" data-open-item="${item.id}">View item details</button>
      </div>
    </article>
  `).join('');
}

function renderDetails(item, message = '') {
  const minimumBid = item.bid + 5;
  dialogContent.innerHTML = `
    <div class="dialog-top"><button class="dialog-close" type="button" data-close-dialog>Close</button></div>
    <div class="dialog-main">
      <img src="${item.image}" alt="${item.imageAlt}">
      <span class="category-tag">${item.category}</span>
      <h2 id="dialog-title">${item.name}</h2>
      <p>${item.description}</p>
      <div class="detail-row">
        <p><strong>Condition</strong>${item.condition}</p>
        <p><strong>Current bid</strong>${money(item.bid)}</p>
        <p><strong>Auction ends</strong>${formatEndDate(item)}</p>
        <p><strong>Next minimum bid</strong>${money(minimumBid)}</p>
      </div>
      <form class="bid-form" id="bid-form">
        <label for="bid-amount">Your bid (KSh)</label>
        <div class="bid-controls">
          <input id="bid-amount" name="bid" type="number" min="${minimumBid}" step="1" value="${minimumBid}" required>
          <button class="button button-primary" type="submit">Place demo bid</button>
        </div>
        <p class="bid-message" id="bid-message" role="status">${message || 'This is only a demo. Bids reset when the page is refreshed.'}</p>
      </form>
    </div>
  `;
}

function openItem(itemId) {
  const item = items.find((entry) => entry.id === itemId);
  if (!item) return;
  activeItemId = item.id;
  renderDetails(item);
  if (!dialog.open) dialog.showModal();
}

grid.addEventListener('click', (event) => {
  const button = event.target.closest('[data-open-item]');
  if (button) openItem(button.dataset.openItem);
});

dialog.addEventListener('click', (event) => {
  if (event.target.closest('[data-close-dialog]')) dialog.close();
});

dialog.addEventListener('submit', (event) => {
  if (event.target.id !== 'bid-form') return;
  event.preventDefault();
  const item = items.find((entry) => entry.id === activeItemId);
  const amount = Number(new FormData(event.target).get('bid'));
  const message = dialog.querySelector('#bid-message');
  if (!item || !Number.isFinite(amount) || amount <= item.bid) {
    message.textContent = `Please enter more than ${money(item ? item.bid : 0)}.`;
    return;
  }
  item.bid = amount;
  renderItems();
  renderDetails(item, `Demo bid added. The current bid is now ${money(item.bid)}.`);
});

searchInput.addEventListener('input', renderItems);
categoryFilter.addEventListener('change', renderItems);
renderItems();
