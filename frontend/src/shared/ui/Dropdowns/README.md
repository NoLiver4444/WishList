# `DropdownContainer` (Анимированный контейнер выпадающих меню)

Обёртка с анимацией появления и исчезновения для выпадающих списков. Использует
`framer-motion` для плавных переходов на основе пружинной физики.

## Props

| Prop       | Тип         | Default | Описание                    |
|------------|-------------|---------|-----------------------------|
| `children` | `ReactNode` | `-`     | Содержимое выпадающего меню |

## Зависимости

- `framer-motion`: `motion` (анимации)
- `@/shared/ui/Menu/Menu.module.css`: CSS-модули

## Архитектура и поведение

- Оборачивает дочерние элементы в `motion.div`.
- При монтировании анимирует масштаб (`scale`), прозрачность (`opacity`) и
  вертикальную позицию (`y`).
- При удалении из DOM воспроизводит анимацию выхода с теми же параметрами.
- Использует пружинную физику (`type: "spring"`) для естественного отклика
  интерфейса.

## Пример использования

```jsx
import DropdownContainer from '@/shared/ui/Dropdowns/DropdownContainer';

const Menu = () => (
  <DropdownContainer>
    <ul>
      <li>Пункт 1</li>
      <li>Пункт 2</li>
    </ul>
  </DropdownContainer>
);
```

---

# `Dropdowns` (Компоненты выпадающих меню)

Содержит два компонента для отображения уведомлений и профиля пользователя.
Интегрирует хуки закрытия по Escape, анимированный контейнер и подменю выбора
темы.

## `NotificationDropdown`

### Props

| Prop      | Тип          | Default | Описание            |
|-----------|--------------|---------|---------------------|
| `onClose` | `() => void` | `-`     | Обработчик закрытия |

### Архитектура и поведение

- Отображает заголовок и заглушку при отсутствии новых уведомлений.
- Использует хук `useEscClose` для закрытия при нажатии Escape.

## `ProfileDropdown`

### Props

| Prop                | Тип                      | Default | Описание                                    |
|---------------------|--------------------------|---------|---------------------------------------------|
| `onClose`           | `() => void`             | `-`     | Обработчик закрытия                         |
| `currentUser`       | `Object`                 | `-`     | Данные текущего пользователя                |
| `users`             | `Array<Object>`          | `-`     | Список доступных аккаунтов                  |
| `onSelectUser`      | `(user: Object) => void` | `-`     | Обработчик выбора аккаунта                  |
| `onOpenFullProfile` | `() => void`             | `-`     | Обработчик открытия полной страницы профиля |

### Зависимости

- `react-router-dom`: `Link`
- `react`: `useState`
- `lucide-react`: `Check`, `LogOut`, `Plus`, `Settings`
- `@/shared/hooks/useEscClose`
- `@/shared/ui/Dropdowns/DropdownContainer`
- `@/features/theme-switch/ThemeSwitcher`
- `@/shared/ui/Menu/Menu.module.css`

### Архитектура и поведение

- Отображает аватар и логин текущего пользователя с возможностью перехода в
  профиль.
- Содержит ссылку на настройки и интегрированное подменю переключения темы (
  `ThemeSubmenu`).
- Рендерит список доступных аккаунтов для быстрого переключения.
- Включает кнопки добавления нового аккаунта и выхода из системы.
- Закрывается автоматически по нажатию Escape через `useEscClose`.

## Пример использования

```jsx
import {ProfileDropdown} from '@/shared/ui/Dropdowns';

<ProfileDropdown
  onClose={() => setMenuOpen(false)}
  currentUser={user}
  users={allUsers}
  onSelectUser={handleSwitch}
  onOpenFullProfile={() => navigate('/profile')}
/>
```
