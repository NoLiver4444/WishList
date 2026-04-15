# `SearchForm` (Форма поиска)

Управляемый компонент поля поиска с поддержкой рефов, клавиатурных событий и
иконок состояния. Используется для ввода, отправки и очистки поискового запроса.

## Props

| Prop       | Тип                     | Default | Описание                                                              |
|------------|-------------------------|---------|-----------------------------------------------------------------------|
| `query`    | `string`                | `-`     | Текущее значение поля поиска                                          |
| `setQuery` | `(val: string) => void` | `-`     | Функция обновления значения                                           |
| `onSearch` | `() => void`            | `-`     | Обработчик отправки поиска (вызывается по Enter или кнопке)           |
| `onClose`  | `() => void`            | `-`     | Обработчик закрытия/очистки (вызывается по Escape или кнопке очистки) |
| `inputRef` | `React.RefObject`       | `-`     | Реф для программного фокуса на инпуте                                 |
| `ref`      | `React.Ref`             | `-`     | Внешний реф (forwardRef) для доступа к корневому элементу формы       |

## Зависимости

- `react`: `forwardRef`
- `lucide-react`: `Search`, `X` (иконки лупы и крестика)
- `./SearchForm.module.css`: CSS-модули

## Архитектура и поведение

- Обернут в `React.forwardRef` для проброса внешних ссылок на корневой
  DOM-элемент.
- Синхронизирует состояние инпута с пропсом `query` через `value` и `onChange`.
- Обрабатывает `onKeyDown`: клавиша `Enter` вызывает `onSearch`, клавиша
  `Escape` вызывает `onClose`.
- Принимает `inputRef` для управления фокусом вне компонента (например,
  автофокус при открытии формы).
- Использует `type="button"` для вспомогательных кнопок, чтобы не провоцировать
  submit формы по умолчанию.

## Примеры использования

```jsx
import { useRef, useState } from 'react';
import SearchForm from '@/features/search-task/SearchForm';

const Header = () => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  return (
    <SearchForm
      query={query}
      setQuery={setQuery}
      onSearch={() => console.log('Поиск:', query)}
      onClose={() => setQuery('')}
      inputRef={inputRef}
    />
  );
};
```