# `ThemeSubmenu` (Подменю выбора темы)

Выпадающее меню для переключения темы оформления приложения. Использует
кастомный хук темы, `framer-motion` для анимации появления и иконки
`lucide-react` для визуального обозначения вариантов.

## Props

| Prop           | Тип          | Default | Описание                                  |
|----------------|--------------|---------|-------------------------------------------|
| `isOpen`       | `boolean`    | `false` | Флаг открытия подменю                     |
| `onMouseEnter` | `() => void` | `-`     | Обработчик наведения курсора на контейнер |
| `onMouseLeave` | `() => void` | `-`     | Обработчик ухода курсора с контейнера     |

## Зависимости

- `@/shared/hooks/useTheme`: Хук получения и установки текущей темы
- `lucide-react`: `Check`, `ChevronRight`, `Palette`, `Monitor`, `Moon`, `Sun`,
  `Tractor`
- `framer-motion`: `AnimatePresence`, `motion`
- `./ThemeSwitcher.module.css`: CSS-модули

## Архитектура и поведение

- Рендерит кнопку-триггер с иконкой палитры и названием "Тема".
- При `isOpen === true` через `AnimatePresence` анимирует появление списка тем (
  `opacity`, `x`).
- Использует массив `THEMES` для генерации кнопок выбора.
- Подсвечивает активную тему через `useTheme().theme` и отображает иконку
  `Check`.
- Вызывает `setTheme(value)` при клике на вариант.
- Управляется внешними обработчиками наведения курсора (`onMouseEnter`/
  `onMouseLeave`).

## Примеры использования

```jsx
<ThemeSubmenu
  isOpen={isHovered}
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
/>
```