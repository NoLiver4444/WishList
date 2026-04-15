# `HeaderButton` (Кнопка навигации в шапке)

Компонент ссылки для основного меню навигации. Рендерит иконку и активный
маршрут с динамическим применением стилей.

## Props

| Prop        | Тип                                 | Default | Описание                          |
|-------------|-------------------------------------|---------|-----------------------------------|
| `item`      | `{ icon: Component, path: string }` | `-`     | Объект маршрута с иконкой и путём |
| `className` | `string`                            | `-`     | Дополнительные CSS-классы         |

## Зависимости

- `react-router-dom`: `NavLink`
- `@/shared/ui/Navigation/Navigation.module.css`: CSS-модули

## Архитектура и поведение

- Обёрнут в `forwardRef` для передачи ссылки на DOM-элемент родительским
  компонентам.
- Использует `NavLink` для клиентской навигации без перезагрузки страницы.
- Динамически добавляет класс `activeItem` при совпадении текущего URL с
  `item.path`.
- Рендерит переданную иконку из `item.icon` с фиксированными размерами.

## Пример использования

```jsx
import HeaderButton from '@/shared/ui/Navigation/HeaderButton';

<HeaderButton
  item={{ icon: HomeIcon, path: '/' }}
  className="custom-class"
/>
```