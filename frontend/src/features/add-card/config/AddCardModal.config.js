export const FIELDS = {
  wishes: [
    {
      name: 'name',
      label: 'Название',
      placeholder: 'На что копим?',
      required: true,
    },
    {
      name: 'url',
      label: 'Ссылка',
      placeholder: 'Ссылка на желание',
      type: 'url',
      pattern: '^https?://.+',
      errorText: 'Введите корректную ссылку с http/https',
    },
    {
      name: 'price',
      label: 'Цена',
      placeholder: 'Цена',
      type: 'number',
      min: 0,
      max: 1000000,
    },
    {
      name: 'description',
      label: 'Описание',
      placeholder: 'Описание',
      type: 'textarea',
    },
    {
      name: 'image',
      label: 'Изображение',
      type: 'file',
      accept: 'image/*',
    },
    {
      name: 'imageUrl',
      label: 'Изображение(ссылка)',
      placeholder: 'Если у вас не скачано изображение',
      type: 'url',
      pattern: '^https?://.+',
      errorText: 'Введите корректную ссылку с http/https',
    },
    {
      name: 'private',
      label: 'Приватность',
      options: [
        { value: 'public', label: 'Публичный' },
        { value: 'private', label: 'Приватный' },
        { value: 'friends', label: 'Видят только друзья' },
      ],
      type: 'select',
    },
  ],
  wishlists: [
    {
      name: 'name',
      label: 'Название',
      placeholder: 'Название вишлиста',
      required: true,
    },
    {
      name: 'date',
      label: 'Дедлайн',
      placeholder: 'К какому сроку хотите успеть?',
      type: 'date',
      min: new Date().toISOString().split('T')[0],
      max: '2100-01-01',
    },
    {
      name: 'private',
      label: 'Приватность',
      options: [
        { value: 'public', label: 'Публичный' },
        { value: 'private', label: 'Приватный' },
        { value: 'friends', label: 'Видят только друзья' },
      ],
      type: 'select',
    },
  ],
  friends: [
    {
      name: 'id',
      label: 'id друга',
      placeholder: 'Введите id друга',
      required: true,
    },
    {
      name: 'login',
      label: 'Имя друга',
      placeholder: 'Введите имя друга',
      required: true,
    },
  ],
};
