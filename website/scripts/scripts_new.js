// DOM Elements
const addNewsButton = document.getElementById("addNewsButton");
const newsFormContainer = document.getElementById("newsFormContainer");
const newsForm = document.getElementById("newsForm");
const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");
const categoryInput = document.getElementById("category");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const newsContainer = document.getElementById("newsContainer");
const cancelBtn = document.getElementById("cancelBtn");

let currentNewsId = null; // Для хранения ID редактируемой новости

// Initial load
document.addEventListener("DOMContentLoaded", () => {
  renderNews(getAllNews());
});

// Открытие формы
addNewsButton.addEventListener("click", () => {
  newsFormContainer.style.display = "block";
  addNewsButton.style.display = "none";
  newsForm.reset();
  currentNewsId = null; // Сброс ID редактируемой новости
});

// Закрытие формы
cancelBtn.addEventListener("click", () => {
  newsFormContainer.style.display = "none";
  addNewsButton.style.display = "block";
  newsForm.reset();
  const newsItemElement = document.querySelector(`.news-item[data-id="${currentNewsId}"]`);
  if (newsItemElement) {
    newsItemElement.style.display = "block"; // Показываем скрытый блок новости
  }
  currentNewsId = null;
});

// Обработка отправки формы
newsForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addNewsButton.style.display = "block";
  const newsItem = {
    title: titleInput.value,
    content: contentInput.value,
    category: categoryInput.value,
    timestamp: Date.now(),
    date: new Date().toLocaleString(),
  };

  if (currentNewsId) {
    updateNews(currentNewsId, newsItem);
  } else {
    addNews(newsItem);
  }

  newsFormContainer.style.display = "none";
  newsForm.reset();
});

// Поиск и сортировка
searchInput.addEventListener("input", (e) => {
  applyFiltersAndSearch();
});

sortSelect.addEventListener("change", () => {
  applyFiltersAndSearch();
});

// Функция для применения фильтрации и поиска
function applyFiltersAndSearch() {
  let news = getAllNews();

  // Применяем поиск, если есть текст в поисковой строке
  if (searchInput.value) {
    news = filterNews(searchInput.value);
  }

  // Применяем сортировку
  news = sortNews(news);

  renderNews(news);
}

// CRUD операции
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
  applyFiltersAndSearch();
}

function deleteNews(id) {
  const news = getAllNews();
  const updatedNews = news.filter((item) => item.id !== id);
  saveNews(updatedNews);
  applyFiltersAndSearch();
}

function updateNews(id, updatedItem) {
  const news = getAllNews().map((item) => (item.id === id ? { ...updatedItem, id } : item));
  saveNews(news);
  applyFiltersAndSearch();
}

// Фильтрация и сортировка
function filterNews(query) {
  const search = query.toLowerCase();
  return getAllNews().filter(
    (item) =>
      item.title.toLowerCase().includes(search) ||
      item.content.toLowerCase().includes(search) ||
      (item.category && item.category.toLowerCase().includes(search)),
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

// Отрисовка новостей
function renderNews(newsArray) {
  newsContainer.innerHTML = "";

  newsArray.forEach((item) => {
    const newsEl = document.createElement("div");
    newsEl.className = "news-item";
    newsEl.setAttribute("data-id", item.id);
    newsEl.innerHTML = `
      <div class="news-meta">
        ${item.date} |
        ${item.category ? `Категория: ${item.category}` : ""}
      </div>
      <h3>${item.title}</h3>
      <p>${item.content}</p>
      <div class="news-controls">
        <button onclick="editNewsHandler('${item.id}')">Редактировать</button>
        <button class="danger" onclick="deleteNews('${item.id}')">Удалить</button>
      </div>
    `;
    newsContainer.appendChild(newsEl);
  });
}

// Редактирование новости
window.editNewsHandler = function (id) {
  if (newsFormContainer.style.display === "block") {
    alert(
      "Вы уже открыли форму редактирования. Закройте текущую форму, чтобы редактировать другую новость.",
    );
    return;
  }

  const newsItem = getAllNews().find((item) => item.id === id);
  const newsItemElement = document.querySelector(`.news-item[data-id="${id}"]`);

  if (newsItemElement) {
    newsItemElement.style.display = "none";
  }

  titleInput.value = newsItem.title;
  contentInput.value = newsItem.content;
  categoryInput.value = newsItem.category || "";
  currentNewsId = id;
  newsFormContainer.style.display = "block";
};
