# CONTEMPORARY HORECA SCENE

**Образовательный курс для Hotel Institute Montreux · Educational course proposal for Hotel Institute Montreux**
Автор / Author: **Егор Тарасенко / Egor Tarasenko** — Master in Business Management, Hotel Institute Montreux Alumnus

Курс о трендах ресторанной индустрии, дизайне заведений и создании атмосферы, нейрогастрономии, автоматизации и новых технологиях — и о ведущих барах и ресторанах мира. Построен на четырёх первоисточниках:

1. **GreatList** — [greatlist.ru](https://greatlist.ru) — международный ресторанный гид (методология, критерии, география, GreatList Sessions).
2. **The 50 Best (the50.com)** — [the50.com](https://www.the50.com) — The World's 50 Best Restaurants & Bars, истории, церемонии.
3. **Гид MICHELIN** — [michelin.ru](http://www.michelin.ru/) / guide.michelin.com — звёздная система, релизы 2026 (Токио, Калифорния, Торонто), история московского гида.
4. **Diageo World Class** — [diageo.com](https://www.diageo.com/en/news-and-media/press-releases/2025/diageo-crowns-worlds-best-bartender-2025-at-world-class-finals) — глобальный конкурс барменов, победитель 2025 Феличе Капассо.

## Структура репозитория

```
presentation/
  dist/   Contemporary-HoReCa-Scene-Course-Pitch-EN.pdf  ← презентация курса (EN)
          Contemporary-HoReCa-Scene-Course-Pitch-RU.pdf  ← презентация курса (RU)
  build/  исходники генератора слайдов (Python + reportlab):
          deck_lib.py, content_en.py, content_ru.py, build_deck.py
course/
  syllabus-EN.md / syllabus-RU.md            силлабус (12 недель, 5 модулей, оценка)
  lectures-EN.md / lectures-RU.md            конспекты лекций по модулям
  cases-EN.md / cases-RU.md                  база кейсов (рейтинги, рестораны, бары)
  practical-assignments-EN.md / -RU.md       практические задания: «Моё заведение»
```

## Курс в одну минуту

- **Формат:** семестровый электив, 12 недель × 3 ч (36 контактных часов), английский; BBA/MIB.
- **Модули:** 1) тренды современной HoReCa · 2) дизайн и атмосфера · 3) нейрогастрономия · 4) технологии и автоматизация · 5) ведущие рестораны и бары мира.
- **Практика:** на первом занятии каждый рассказывает о любимом баре/ресторане; весь семестр каждый студент строит собственное заведение («Моё заведение») до состояния «открывайся и работай»: УТП, дизайн, меню, операции, маркетинг (гостевые смены, партнёрства с алкобрендами), дорожная карта к рейтингам. Финал — питч перед экспертной панелью.
- **Оценка:** Задание 0 и участие 10% · Field Notes 15% · майлстоуны «Моё заведение» 35% · финальный питч 40%.

## Пересборка презентации

```bash
cd presentation/build && python build_deck.py   # требуется venv с reportlab (см. /tmp/venv в песочнице)
```

Шрифты Inter (Latin + Cyrillic) собраны из пакетов @fontsource и лежат вне репозитория; PDF — артефакты в `presentation/dist`.

## Ключевые факты, заложенные в курс (2025–2026)

- The World's 50 Best Restaurants 2025: №1 Maido (Лима); церемония 2026 — Лима, 4 ноября 2026.
- The World's 50 Best Bars 2025 (Гонконг): №1 Bar Leone — первый азиатский №1.
- MICHELIN 2026: Myojaku (Токио) — три звезды; Californios — первый трёхзвёздный мексиканский ресторан мира; Restaurant Pearl Morissette (Торонто) — две звезды.
- Diageo World Class 2025 (Торонто): победитель Феличе Капассо (Норвегия); 51 страна; жюри — владельцы знаковых баров.
- GreatList: 100+ экспертов, анонимные визиты; география — Россия, ОАЭ, Катар, Таиланд, Китай.

*Данные о событиях после июня 2026 приведены по открытым источникам, доступным на дату подготовки курса (30 сентября 2026).*
