// =========================================================================
// НАСТРОЙКА ЦИТАТ ГРИФФИТА
// Поставь точное количество цитат, файлы которых загружены в папку Griffith/quotes/
// =========================================================================
const TOTAL_QUOTES = 7; 

// Связываем картинки с номерами цитат
// Убедись, что файлы в папке Griffith/images/ называются именно так (1.jpg, 2.jpg и т.д.)
const quoteImages = {
    1: "1.jpg",
    2: "2.jpg",
    3: "3.jpg",
    4: "4.jpg",
    5: "5.jpg",
    6: "6.jpg",
    7: "7.jpg"
};

// =========================================================================
// ССЫЛКИ НА СКАЧИВАНИЕ С GOOGLE ДИСКА
// Замени ссылки внутри кавычек на свои реальные ссылки для каждого mp3 файла.
// Если ссылки для какой-то цитаты нет, кнопка скачивания отображаться не будет.
// =========================================================================
const downloadLinks = {
    1: "https://drive.google.com/file/d/10nBi3OZSbbRb_qpaDuaKaGzcnz3n0T8O/view?usp=drivesdk",
    2: "https://drive.google.com/file/d/1ACpWkspTlExa94ZoUZFRziQ8RJCYFTP-/view?usp=drivesdk",
    3: "https://drive.google.com/file/d/1OEF2vsYF9zmuDiK9tQ_5thPZZPSWd79n/view?usp=drivesdk",
    4: "https://drive.google.com/file/d/12jtzyxGTGzgG3U22vsA_M-y2Oj9i5vPt/view?usp=drivesdk",
    5: "https://drive.google.com/file/d/1YlaoFZJk2dfZOPWXtEMgsODtbW_UJAbn/view?usp=drivesdk",
    6 "https://drive.google.com/file/d/1R0zwOhfzO_UiN4VXTudMdeJOwHfR0Mnc/view?usp=drivesdk",
    7 "https://drive.google.com/file/d/1gVPnYVGreHp9dJWO-uXqUzFa_aN_c3fM/view?usp=drivesdk"
};

const DEFAULT_IMAGE = "2.jpg";
const quotesGrid = document.getElementById('quotes-grid');

let currentAudio = null;
let currentButton = null;

async function loadQuote(id) {
    try {
        // Загружаем текст цитаты
        const textResponse = await fetch(`Griffith/quotes/${id}.txt`);
        if (!textResponse.ok) return null;
        const text = await textResponse.text();

        // Определяем путь к картинке
        const imageName = quoteImages[id] || DEFAULT_IMAGE;
        const imagePath = `Griffith/images/${imageName}`;

        // Проверка аудио (.mp3) без HEAD-запроса, который блокирует гитхаб
        const audioPath = `Griffith/quotes/${id}.mp3`;
        let hasAudio = false;
        
        try {
            const audioResponse = await fetch(audioPath);
            if (audioResponse.ok) {
                hasAudio = true;
            }
        } catch (e) {
            if (downloadLinks[id]) hasAudio = true;
        }

        const driveLink = downloadLinks[id] || null;

        return { id, text, imagePath, audioPath, hasAudio, driveLink };
    } catch (error) {
        console.error(`Ошибка загрузки цитаты ${id}:`, error);
        return null;
    }
}

async function renderQuotes() {
    if (!quotesGrid) return;
    quotesGrid.innerHTML = '';

    // Выводим цитаты сверху вниз (от новых к старым)
    for (let i = TOTAL_QUOTES; i >= 1; i--) {
        const quote = await loadQuote(i);
        if (!quote) continue;

        const card = document.createElement('div');
        card.className = 'quote-card';

        // Формируем блок аудио управления (Play + Скачать)
        let audioCellHTML = '';
        if (quote.hasAudio) {
            let downloadBtnHTML = '';
            if (quote.driveLink && quote.driveLink.includes("http")) {
                downloadBtnHTML = `<a href="${quote.driveLink}" target="_blank" class="download-link">Скачать</a>`;
            }

            audioCellHTML = `
                <div class="quote-audio-cell">
                    <button class="play-btn" data-audio="Griffith/quotes/${quote.id}.mp3" title="Слушать"></button>
                    ${downloadBtnHTML}
                </div>
            `;
        }

        // ОШИБКА ИСПРАВЛЕНА: теперь здесь строго quote.text вместо старого ломающего text
        card.innerHTML = `
            <div class="quote-layout">
                <div class="quote-img-cell">
                    <img src="${quote.imagePath}" class="quote-card-img" alt="Griffith">
                </div>
                <div class="quote-content-cell">
                    <p class="quote-text">“${quote.text.trim()}”</p>
                </div>
                ${audioCellHTML}
            </div>
        `;

        quotesGrid.appendChild(card);
    }

    setupAudioLogic();
}

function setupAudioLogic() {
    const playButtons = document.querySelectorAll('.play-btn');

    playButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const audioSrc = this.getAttribute('data-audio');

            if (currentAudio && currentButton === this) {
                if (!currentAudio.paused) {
                    currentAudio.pause();
                    this.classList.remove('playing');
                } else {
                    currentAudio.play();
                    this.classList.add('playing');
                }
                return;
            }

            if (currentAudio) {
                currentAudio.pause();
                if (currentButton) currentButton.classList.remove('playing');
            }

            currentAudio = new Audio(audioSrc);
            currentButton = this;
            
            currentAudio.play();
            this.classList.add('playing');

            currentAudio.addEventListener('ended', () => {
                this.classList.remove('playing');
                currentAudio = null;
                currentButton = null;
            });
        });
    });
}

document.addEventListener('DOMContentLoaded', renderQuotes);
