// DOM Elements
const newsForm = document.getElementById("newsForm");
const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");
const categoryInput = document.getElementById("category");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const newsContainer = document.getElementById("newsContainer");
let currentNewsId = null;

// Initial load
document.addEventListener("DOMContentLoaded", () => {
  renderNews(getAllNews());
});

// Form submit handler
newsForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const newsItem = {
    title: titleInput.value,
    content: contentInput.value,
    category: categoryInput.value,
    timestamp: Date.now(),
    date: new Date().toLocaleString(),
  };

  if (currentNewsId) {
    updateNews(currentNewsId, newsItem);
    currentNewsId = null;
  } else {
    addNews(newsItem);
  }

  newsForm.reset();
});

// Search and sort handlers
searchInput.addEventListener("input", (e) => {
  renderNews(filterNews(e.target.value));
});

sortSelect.addEventListener("change", () => {
  renderNews(sortNews(getAllNews()));
});

// News CRUD operations
function getAllNews() {
  return JSON.parse(localStorage.getItem("news") || "[]");
}

function saveNews(newsArray) {
  localStorage.setItem("news", JSON.stringify(newsArray));
}

function addNews(newsItem) {
  const news = getAllNews();
  news.push({ ...newsItem, id: Date.now().toString() });
  saveNews(news);
  renderNews(sortNews(news));
}

function deleteNews(id) {
  const news = getAllNews().filter((item) => item.id !== id);
  saveNews(news);
  renderNews(sortNews(news));
}

function updateNews(id, updatedItem) {
  const news = getAllNews().map((item) =>
    item.id === id ? { ...updatedItem, id } : item
  );
  saveNews(news);
  renderNews(sortNews(news));
}

// News filtering and sorting
function filterNews(query) {
  const search = query.toLowerCase();
  return getAllNews().filter(
    (item) =>
      item.title.toLowerCase().includes(search) ||
      item.content.toLowerCase().includes(search) ||
      (item.category && item.category.toLowerCase().includes(search))
  );
}

function sortNews(news) {
  switch (sortSelect.value) {
    case "newest":
      return [...news].sort((a, b) => b.timestamp - a.timestamp);
    case "oldest":
      return [...news].sort((a, b) => a.timestamp - b.timestamp);
    case "title":
      return [...news].sort((a, b) => a.title.localeCompare(b.title));
    default:
      return news;
  }
}

// Render news items
function renderNews(newsArray) {
  newsContainer.innerHTML = "";

  newsArray.forEach((item) => {
    const newsEl = document.createElement("div");
    newsEl.className = "news-item";
    newsEl.innerHTML = `
              <div class="news-meta">
                  ${item.date} | 
                  ${item.category ? `Категория: ${item.category}` : ""}
              </div>
              <h3>${item.title}</h3>
              <p>${item.content}</p>
              <div class="news-controls">
                  <button onclick="editNewsHandler('${
                    item.id
                  }')">Редактировать</button>
                  <button class="danger" onclick="deleteNews('${
                    item.id
                  }')">Удалить</button>
              </div>
          `;
    newsContainer.appendChild(newsEl);
  });
}

// Edit news handler
window.editNewsHandler = function (id) {
  const newsItem = getAllNews().find((item) => item.id === id);
  titleInput.value = newsItem.title;
  contentInput.value = newsItem.content;
  categoryInput.value = newsItem.category || "";
  currentNewsId = id;
};