# `ProfilePopup` (Попап профиля пользователя)

Модальное окно с детальной информацией о пользователе. Рендерится через портал
поверх всего приложения, закрывается по клавише Escape или клику вне области.

## Props

| Prop      | Тип          | Default | Описание                   |
|-----------|--------------|---------|----------------------------|
| `user`    | `Object`     | `-`     | Объект данных пользователя |
| `onClose` | `() => void` | `-`     | Обработчик закрытия        |

## Зависимости

- `react`: `useRef`
- `react-dom`: `createPortal`
- `framer-motion`: `motion`
- `lucide-react`: `X`
- `@/shared/hooks/useClickOutside`, `@/shared/hooks/useEscClose`
- `./ProfilePopup.module.css`

## Архитектура и поведение

- Использует `createPortal` для рендеринга DOM-дерева в `document.body`, избегая
  проблем с `overflow` и `z-index` родительских контейнеров.
- Применяет анимации появления/исчезновения для оверлея и контента через
  `motion.div` с пружинной физикой.
- Закрывается автоматически при нажатии `Escape` или клике вне области попапа
  через кастомные хуки.
- Отображает аватар, логин и дату рождения пользователя с защитой от `undefined`
  через опциональную цепочку.

## Пример использования

```jsx
import ProfilePopup from '@/shared/ui/ProfilePopup';

{
  isPopupOpen && (
    <ProfilePopup
      user={currentUser}
      onClose={() => setIsPopupOpen(false)}
    />
  )
}
```