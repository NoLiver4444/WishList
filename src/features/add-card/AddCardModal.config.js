export const FIELDS = {
  wishes: [
    {
      name: 'title',
      label: 'Название',
      placeholder: 'На что копим?',
      required: true,
    },
    {
      name: 'date',
      label: 'Дедлайн',
      placeholder: 'К какому сроку хотите успеть?',
      type: 'date',
      min: new Date().toISOString().split('T')[0],
    },
    {
      name: 'url',
      label: 'Ссылка',
      placeholder: 'Ссылка на желание',
      type: 'url',
      pattern: '^https?://.+',
      errorText: 'Введите корректную ссылку с http/https',
    },
    {name: 'price', label: 'Цена', placeholder: 'Цена', type: 'number'},
    {
      name: 'description',
      label: 'Описание',
      placeholder: 'Описание',
      as: 'textarea',
    },
    {
      name: 'image',
      label: 'Ссылка на изображение',
      placeholder: 'Ссылка на изображение',
      type: 'url',
      pattern: '^https?://.+',
      errorText: 'Введите корректную ссылку с http/https',
    },
    {
      name: 'private',
      label: 'Приватность',
      placeholder: 'Публичный',
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
    },
    {
      name: 'private',
      label: 'Приватность',
      placeholder: 'Публичный',
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
  ],
};
