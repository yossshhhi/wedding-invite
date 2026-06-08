# Wedding Invite Starter

## Запуск
Открой папку проекта в VS Code/IntelliJ и запусти `index.html` через Live Server.

## Что заменить
Картинки:
- assets/images/couple/hero-couple.png
- assets/images/couple/location-couple.png
- assets/images/couple/details-couple.png
- assets/images/couple/rsvp-couple.png
- assets/images/decor/leaf-left.png
- assets/images/decor/leaf-right.png
- assets/images/decor/location-villa.png
- assets/images/decor/dress-code.png
- assets/images/decor/ship.png
- assets/images/gallery/photo-1.jpg ... photo-6.jpg

Музыка:
- assets/music/ru.mp3
- assets/music/ko.mp3
- assets/music/ja.mp3

Тексты:
- js/i18n.js

Дата свадьбы:
- js/app.js, переменная WEDDING_DATE

Google Sheets:
1. Создай Google Таблицу.
2. Extensions → Apps Script.
3. Вставь код из google-apps-script.js.
4. Deploy → New deployment → Web app.
5. Execute as: Me.
6. Who has access: Anyone.
7. Web App URL вставь в js/app.js в GOOGLE_SCRIPT_URL.
# wedding-invite
