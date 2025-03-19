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
  console.log(newsItemElement);
  if (newsItemElement) {
    newsItemElement.style.display = "block"; // Скрываем блок новости
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
  renderNews(filterNews(e.target.value));
});

sortSelect.addEventListener("change", () => {
  renderNews(sortNews(getAllNews()));
});

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
  renderNews(sortNews(news));
}

// Функция удаления новости
function deleteNews(id) {
  // 1. Получаем все новости из localStorage
  const news = getAllNews();

  // 2. Фильтруем новости, оставляя только те, у которых ID не совпадает с переданным ID
  const updatedNews = news.filter((item) => item.id !== id);

  // 3. Сохраняем обновленный массив новостей в localStorage
  saveNews(updatedNews);

  // 4. Отрисовываем обновленный список новостей на странице
  renderNews(sortNews(updatedNews));
}

function updateNews(id, updatedItem) {
  const news = getAllNews().map((item) => (item.id === id ? { ...updatedItem, id } : item));
  saveNews(news);
  renderNews(sortNews(news));
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
  // Проверяем, открыта ли уже форма редактирования
  if (newsFormContainer.style.display === "block") {
    alert(
      "Вы уже открыли форму редактирования. Закройте текущую форму, чтобы редактировать другую новость.",
    );
    return; // Прерываем выполнение функции, если форма уже открыта
  }

  // Находим новость в массиве
  const newsItem = getAllNews().find((item) => item.id === id);

  // Находим соответствующий DOM-элемент новости
  const newsItemElement = document.querySelector(`.news-item[data-id="${id}"]`);
  console.log(newsItemElement);
  if (newsItemElement) {
    newsItemElement.style.display = "none"; // Скрываем блок новости
  }

  // Заполняем форму данными новости
  titleInput.value = newsItem.title;
  contentInput.value = newsItem.content;
  categoryInput.value = newsItem.category || "";

  // Сохраняем ID текущей новости для дальнейшего использования
  currentNewsId = id;

  // Отображаем форму редактирования
  newsFormContainer.style.display = "block";
};
