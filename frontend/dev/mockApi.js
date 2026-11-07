/**
 * @file Мок-API для вёрстки без бэкенда (`npm run dev:mock`).
 *
 * Vite-плагин, который перехватывает /api/* в dev-сервере и отвечает
 * из памяти, повторяя контракт Go-бэкенда (/v1/*). Данные живут до
 * перезапуска dev-сервера. Войти можно под любым логином с любым паролем.
 */

import { randomUUID } from 'node:crypto';

const now = () => new Date().toISOString();
const daysFromNow = (d) => new Date(Date.now() + d * 86_400_000).toISOString();

/** Картинка-заглушка (data URI), чтобы всё работало офлайн. */
const placeholder = (text, hue) =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">` +
      `<rect width="100%" height="100%" fill="hsl(${hue},55%,72%)"/>` +
      `<text x="50%" y="50%" font-family="sans-serif" font-size="28" fill="#fff" ` +
      `text-anchor="middle" dominant-baseline="middle">${text}</text></svg>`
  );

// Фиксированные ID демо-пользователей: токен в localStorage переживает перезапуск dev-сервера.
const seedId = (n) => `00000000-0000-4000-8000-00000000000${n}`;

const createDb = () => {
  let seq = 0;
  const user = (login) => ({
    id: seedId(++seq),
    login,
    email: `${login}@example.com`,
    phone: null,
    avatar_url: null,
    birthday: '1999-04-12T00:00:00Z',
    created_at: now(),
    updated_at: now(),
  });

  const me = user('demo');
  const anna = user('anna');
  const ivan = user('ivan');
  const olga = user('olga');

  const product = (owner, title, price, hue, extra = {}) => ({
    id: randomUUID(),
    owner_id: owner.id,
    title,
    price,
    url: 'https://example.com',
    image_url: placeholder(title, hue),
    description: `Описание: ${title}`,
    created_at: now(),
    ...extra,
  });

  const products = [
    product(me, 'Наушники', 12990, 210),
    product(me, 'Кофемашина', 34990, 25),
    product(me, 'Книга «Дюна»', 890, 45, { description: null }),
    product(me, 'Рюкзак', 5490, 140, { image_url: null }),
    product(
      me,
      'Настольная игра с очень длинным названием для проверки переноса строк',
      3990,
      280
    ),
    product(anna, 'Плед', 2990, 330),
    product(anna, 'Сертификат в спа', 7000, 180),
  ];

  const wishlist = (owner, name, privacy, deadline) => ({
    id: randomUUID(),
    user_id: owner.id,
    name,
    description: null,
    privacy,
    deadline,
    created_at: now(),
    updated_at: now(),
  });

  const wishlists = [
    wishlist(me, 'День рождения', 'public', daysFromNow(2)),
    wishlist(me, 'Новый год', 'friends', daysFromNow(40)),
    wishlist(me, 'Секретное', 'private', null),
    wishlist(anna, 'Анна: новоселье', 'friends', daysFromNow(10)),
  ];

  const item = (wl, p, reservedBy = null) => ({
    id: randomUUID(),
    wishlist_id: wl.id,
    product_id: p.id,
    reserved_by: reservedBy,
    comment: null,
    order: null,
    created_at: now(),
    updated_at: now(),
  });

  const items = [
    item(wishlists[0], products[0], anna.id),
    item(wishlists[0], products[1]),
    item(wishlists[0], products[2]),
    item(wishlists[1], products[3]),
    item(wishlists[1], products[4], ivan.id),
    item(wishlists[3], products[5]),
    item(wishlists[3], products[6], me.id),
  ];

  const friendship = (from, to, status) => ({
    id: randomUUID(),
    user_id: from.id,
    friend_id: to.id,
    status,
    created_at: now(),
  });

  const friendships = [
    friendship(me, anna, 'accepted'),
    friendship(ivan, me, 'accepted'),
    friendship(olga, me, 'pending'),
  ];

  const notifications = [
    {
      id: randomUUID(),
      user_id: me.id,
      type: 'friend_request',
      title: 'Новая заявка в друзья',
      message: 'olga хочет добавить вас в друзья',
      is_read: false,
      actor_id: olga.id,
      created_at: now(),
    },
    {
      id: randomUUID(),
      user_id: me.id,
      type: 'wishlist_deadline',
      title: 'Приближается дедлайн',
      message: 'До дедлайна вишлиста «День рождения» осталось 2 дн.',
      is_read: false,
      actor_id: null,
      created_at: now(),
    },
  ];

  return {
    users: [me, anna, ivan, olga],
    products,
    wishlists,
    items,
    friendships,
    notifications,
  };
};

// ---------- helpers ----------

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const notFound = (what = 'Не найдено') => new HttpError(404, what);
const forbidden = () => new HttpError(403, 'Доступ запрещён');

const readBody = (req) =>
  new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });

const send = (res, status, data) => {
  res.statusCode = status;
  if (data === undefined) return res.end();
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
};

const publicUser = (u) => ({ ...u });

/** Копия объекта без указанного поля. */
const omit = (obj, key) => {
  const copy = { ...obj };
  delete copy[key];
  return copy;
};
const tokenFor = (user) => `mock-${user.id}`;

export const mockApi = () => {
  let db = createDb();

  const userByToken = (token) =>
    token?.startsWith('mock-')
      ? db.users.find((u) => u.id === token.slice(5))
      : undefined;

  const productDTO = (p) => omit(p, 'owner_id');

  const itemDTO = (it, viewerId) => ({
    id: it.id,
    product: productDTO(db.products.find((p) => p.id === it.product_id)),
    comment: it.comment,
    order: it.order,
    is_reserved: !!it.reserved_by,
    reserved_by_me: !!viewerId && it.reserved_by === viewerId,
    created_at: it.created_at,
    updated_at: it.updated_at,
  });

  const wishlistDTO = (wl) => ({
    ...wl,
    item_count: db.items.filter((i) => i.wishlist_id === wl.id).length,
  });

  const areFriends = (a, b) =>
    db.friendships.some(
      (f) =>
        f.status === 'accepted' &&
        ((f.user_id === a && f.friend_id === b) ||
          (f.user_id === b && f.friend_id === a))
    );

  const canView = (viewerId, wl) =>
    wl.user_id === viewerId ||
    wl.privacy === 'public' ||
    (wl.privacy === 'friends' &&
      !!viewerId &&
      areFriends(viewerId, wl.user_id));

  const findWishlist = (id) => {
    const wl = db.wishlists.find((w) => w.id === id);
    if (!wl) throw notFound('Вишлист не найден');
    return wl;
  };

  const viewable = (me, id) => {
    const wl = findWishlist(id);
    if (!canView(me?.id, wl)) throw forbidden();
    return wl;
  };

  const owned = (me, id) => {
    const wl = findWishlist(id);
    if (wl.user_id !== me.id) throw forbidden();
    return wl;
  };

  const findItem = (id) => {
    const it = db.items.find((i) => i.id === id);
    if (!it) throw notFound('Желание не найдено');
    return it;
  };

  const ownedProduct = (me, id) => {
    const p = db.products.find((x) => x.id === id);
    if (!p) throw notFound('Товар не найден');
    if (p.owner_id !== me.id) throw forbidden();
    return p;
  };

  const friendDTO = (f, otherId) => {
    const u = db.users.find((x) => x.id === otherId);
    return {
      friendship_id: f.id,
      id: u.id,
      login: u.login,
      avatar_url: u.avatar_url,
      status: f.status,
      created_at: f.created_at,
    };
  };

  const login = (loginOrEmail) => {
    const key = loginOrEmail.trim().toLowerCase();
    let u = db.users.find(
      (x) => x.login.toLowerCase() === key || x.email === key
    );
    if (!u) {
      u = {
        id: randomUUID(),
        login: key.split('@')[0] || 'user',
        email: key.includes('@') ? key : `${key}@example.com`,
        phone: null,
        avatar_url: null,
        birthday: null,
        created_at: now(),
        updated_at: now(),
      };
      db.users.push(u);
    }
    return { token: tokenFor(u), user: publicUser(u) };
  };

  // [method, pattern, handler(ctx), auth?]
  const routes = [
    [
      'POST',
      '/auth/login',
      async ({ body }) => [200, login(body.login_or_email ?? 'demo')],
      false,
    ],
    [
      'POST',
      '/auth/register',
      async ({ body }) => {
        const exists = db.users.some(
          (u) =>
            u.login.toLowerCase() === String(body.login).toLowerCase() ||
            u.email === String(body.email).toLowerCase()
        );
        if (exists) throw new HttpError(409, 'Логин или email уже заняты');
        const u = {
          id: randomUUID(),
          login: body.login,
          email: String(body.email).toLowerCase(),
          phone: body.phone ?? null,
          avatar_url: null,
          birthday: body.birthday ?? null,
          created_at: now(),
          updated_at: now(),
        };
        db.users.push(u);
        return [201, { token: tokenFor(u), user: u }];
      },
      false,
    ],
    ['POST', '/__reset', async () => ((db = createDb()), [204]), false],

    // users
    ['GET', '/users/me', async ({ me }) => [200, publicUser(me)]],
    [
      'PATCH',
      '/users/me',
      async ({ me, body }) => {
        Object.assign(me, body, { updated_at: now() });
        return [200, publicUser(me)];
      },
    ],
    [
      'DELETE',
      '/users/me',
      async ({ me }) => {
        db.users = db.users.filter((u) => u.id !== me.id);
        return [204];
      },
    ],
    [
      'GET',
      '/users/search',
      async ({ me, query }) => {
        const q = (query.get('login') ?? '').toLowerCase();
        return [
          200,
          db.users
            .filter((u) => u.id !== me.id && u.login.toLowerCase().includes(q))
            .slice(0, 10)
            .map(({ id, login: l, avatar_url }) => ({
              id,
              login: l,
              avatar_url,
            })),
        ];
      },
    ],

    // products
    [
      'GET',
      '/products/me',
      async ({ me }) => [
        200,
        db.products
          .filter((p) => p.owner_id === me.id)
          .reverse()
          .map(productDTO),
      ],
    ],
    [
      'POST',
      '/products',
      async ({ me, body }) => {
        const p = {
          id: randomUUID(),
          owner_id: me.id,
          created_at: now(),
          ...body,
        };
        db.products.push(p);
        return [201, productDTO(p)];
      },
    ],
    [
      'PUT',
      '/products/:id',
      async ({ me, params, body }) => {
        const p = ownedProduct(me, params.id);
        Object.assign(p, {
          title: body.title,
          url: body.url ?? null,
          image_url: body.image_url ?? null,
          description: body.description ?? null,
          price: body.price ?? null,
        });
        return [200, productDTO(p)];
      },
    ],
    [
      'DELETE',
      '/products/:id',
      async ({ me, params }) => {
        ownedProduct(me, params.id);
        db.products = db.products.filter((p) => p.id !== params.id);
        db.items = db.items.filter((i) => i.product_id !== params.id);
        return [204];
      },
    ],

    // wishlists
    [
      'GET',
      '/wishlists',
      async ({ me }) => [
        200,
        db.wishlists.filter((w) => w.user_id === me.id).map(wishlistDTO),
      ],
    ],
    [
      'POST',
      '/wishlists',
      async ({ me, body }) => {
        const wl = {
          id: randomUUID(),
          user_id: me.id,
          name: body.name,
          description: body.description ?? null,
          privacy: body.privacy ?? 'public',
          deadline: body.deadline ?? null,
          created_at: now(),
          updated_at: now(),
        };
        db.wishlists.unshift(wl);
        return [201, wishlistDTO(wl)];
      },
    ],
    [
      'GET',
      '/wishlists/:id',
      async ({ me, params, query }) => {
        const wl = viewable(me, params.id);
        const out = wishlistDTO(wl);
        if (query.get('with_items') === 'true') {
          out.items = db.items
            .filter((i) => i.wishlist_id === wl.id)
            .map((i) => itemDTO(i, me.id));
        }
        return [200, out];
      },
    ],
    [
      'PUT',
      '/wishlists/:id',
      async ({ me, params, body }) => {
        const wl = owned(me, params.id);
        for (const k of ['name', 'description', 'privacy', 'deadline']) {
          if (body[k] !== undefined) wl[k] = body[k];
        }
        wl.updated_at = now();
        return [200, wishlistDTO(wl)];
      },
    ],
    [
      'DELETE',
      '/wishlists/:id',
      async ({ me, params }) => {
        owned(me, params.id);
        db.wishlists = db.wishlists.filter((w) => w.id !== params.id);
        db.items = db.items.filter((i) => i.wishlist_id !== params.id);
        return [204];
      },
    ],
    [
      'GET',
      '/wishlists/:id/items',
      async ({ me, params }) => {
        const wl = viewable(me, params.id);
        return [
          200,
          db.items
            .filter((i) => i.wishlist_id === wl.id)
            .map((i) => itemDTO(i, me.id)),
        ];
      },
    ],
    [
      'POST',
      '/wishlists/:id/items',
      async ({ me, params, body }) => {
        const wl = owned(me, params.id);
        ownedProduct(me, body.product_id);
        if (
          db.items.some(
            (i) => i.wishlist_id === wl.id && i.product_id === body.product_id
          )
        ) {
          throw new HttpError(409, 'Это желание уже есть в вишлисте');
        }
        const it = {
          id: randomUUID(),
          wishlist_id: wl.id,
          product_id: body.product_id,
          reserved_by: null,
          comment: body.comment ?? null,
          order: body.order ?? null,
          created_at: now(),
          updated_at: now(),
        };
        db.items.push(it);
        return [201, itemDTO(it, me.id)];
      },
    ],

    // items
    [
      'POST',
      '/items/:id/reserve',
      async ({ me, params }) => {
        const it = findItem(params.id);
        const wl = viewable(me, it.wishlist_id);
        if (wl.user_id === me.id) throw forbidden();
        if (it.reserved_by && it.reserved_by !== me.id) {
          throw new HttpError(409, 'Желание уже забронировано');
        }
        it.reserved_by = me.id;
        return [204];
      },
    ],
    [
      'DELETE',
      '/items/:id/reserve',
      async ({ me, params }) => {
        const it = findItem(params.id);
        const wl = viewable(me, it.wishlist_id);
        if (
          it.reserved_by &&
          it.reserved_by !== me.id &&
          wl.user_id !== me.id
        ) {
          throw forbidden();
        }
        it.reserved_by = null;
        return [204];
      },
    ],
    [
      'DELETE',
      '/items/:id',
      async ({ me, params }) => {
        const it = findItem(params.id);
        owned(me, it.wishlist_id);
        db.items = db.items.filter((i) => i.id !== it.id);
        return [204];
      },
    ],

    // public
    [
      'GET',
      '/public/wishlists/:id',
      async ({ params }) => {
        const wl = findWishlist(params.id);
        if (wl.privacy !== 'public') throw notFound('Вишлист не найден');
        return [200, wishlistDTO(wl)];
      },
      false,
    ],
    [
      'GET',
      '/public/wishlists/:id/items',
      async ({ params }) => {
        const wl = findWishlist(params.id);
        if (wl.privacy !== 'public') throw notFound('Вишлист не найден');
        return [
          200,
          db.items
            .filter((i) => i.wishlist_id === wl.id)
            .map((i) => itemDTO(i)),
        ];
      },
      false,
    ],

    // friends
    [
      'GET',
      '/friends',
      async ({ me }) => [
        200,
        db.friendships
          .filter(
            (f) =>
              f.status === 'accepted' &&
              (f.user_id === me.id || f.friend_id === me.id)
          )
          .map((f) =>
            friendDTO(f, f.user_id === me.id ? f.friend_id : f.user_id)
          ),
      ],
    ],
    [
      'GET',
      '/friends/requests',
      async ({ me }) => [
        200,
        db.friendships
          .filter((f) => f.status === 'pending' && f.friend_id === me.id)
          .map((f) => friendDTO(f, f.user_id)),
      ],
    ],
    [
      'POST',
      '/friends/request',
      async ({ me, body }) => {
        if (body.friend_id === me.id)
          throw new HttpError(400, 'Нельзя добавить себя в друзья');
        if (!db.users.some((u) => u.id === body.friend_id))
          throw notFound('Пользователь не найден');
        const existing = db.friendships.find(
          (f) =>
            (f.user_id === me.id && f.friend_id === body.friend_id) ||
            (f.user_id === body.friend_id && f.friend_id === me.id)
        );
        if (existing && existing.status !== 'declined') {
          throw new HttpError(409, 'Заявка уже отправлена или вы уже друзья');
        }
        const f = existing ?? { id: randomUUID() };
        Object.assign(f, {
          user_id: me.id,
          friend_id: body.friend_id,
          status: 'pending',
          created_at: now(),
        });
        if (!existing) db.friendships.push(f);
        return [201, f];
      },
    ],
    [
      'PATCH',
      '/friends/:id/respond',
      async ({ me, params, query }) => {
        const f = db.friendships.find((x) => x.id === params.id);
        if (!f || f.status !== 'pending') throw notFound('Заявка не найдена');
        if (f.friend_id !== me.id) throw forbidden();
        f.status = query.get('status');
        return [204];
      },
    ],
    [
      'DELETE',
      '/friends/:id',
      async ({ me, params }) => {
        const f = db.friendships.find((x) => x.id === params.id);
        if (!f) throw notFound('Не найдено');
        if (f.user_id !== me.id && f.friend_id !== me.id) throw forbidden();
        db.friendships = db.friendships.filter((x) => x.id !== f.id);
        return [204];
      },
    ],

    // notifications
    [
      'PATCH',
      '/notifications/read-all',
      async ({ me }) => {
        db.notifications.forEach(
          (n) => n.user_id === me.id && (n.is_read = true)
        );
        return [204];
      },
    ],
    [
      'PATCH',
      '/notifications/:id/read',
      async ({ me, params }) => {
        const n = db.notifications.find(
          (x) => x.id === params.id && x.user_id === me.id
        );
        if (n) n.is_read = true;
        return [204];
      },
    ],
  ].map(([method, pattern, handler, auth = true]) => {
    const keys = [];
    const re = new RegExp(
      '^' +
        pattern.replace(/:(\w+)/g, (_, k) => (keys.push(k), '([^/]+)')) +
        '$'
    );
    return { method, re, keys, handler, auth };
  });

  const stream = (req, res, me) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    const sent = new Set();
    const push = () => {
      for (const n of db.notifications) {
        if (n.user_id !== me.id || n.is_read || sent.has(n.id)) continue;
        sent.add(n.id);
        res.write(`data: ${JSON.stringify(omit(n, 'user_id'))}\n\n`);
      }
      res.write(': ping\n\n');
    };
    push();
    const timer = setInterval(push, 5000);
    req.on('close', () => clearInterval(timer));
  };

  return {
    name: 'wishlist-mock-api',
    configureServer(server) {
      server.config.logger.info(
        '\n  Mock API включён: /api/* обслуживается из памяти (dev/mockApi.js).' +
          '\n  Вход под любым логином/паролем, демо-аккаунт: demo\n'
      );

      server.middlewares.use('/api', async (req, res, next) => {
        const url = new URL(req.url, 'http://mock');
        const path = url.pathname;
        const auth = req.headers.authorization?.replace(/^Bearer /, '');
        const me = userByToken(auth ?? url.searchParams.get('token'));

        try {
          if (req.method === 'GET' && path === '/notifications/stream') {
            if (!me) throw new HttpError(401, 'Требуется авторизация');
            return stream(req, res, me);
          }

          for (const r of routes) {
            if (r.method !== req.method) continue;
            const m = path.match(r.re);
            if (!m) continue;
            if (r.auth && !me)
              throw new HttpError(401, 'Требуется авторизация');

            const params = Object.fromEntries(
              r.keys.map((k, i) => [k, m[i + 1]])
            );
            const body = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)
              ? await readBody(req)
              : {};
            const [status, data] = await r.handler({
              me,
              params,
              body,
              query: url.searchParams,
            });
            return send(res, status, data);
          }
          return next();
        } catch (err) {
          if (err instanceof HttpError) {
            return send(res, err.status, {
              status: err.status,
              message: err.message,
              code: err.status === 401 ? 'UNAUTHORIZED' : 'MOCK_ERROR',
            });
          }
          server.config.logger.error(`[mock-api] ${err.stack}`);
          return send(res, 500, {
            status: 500,
            message: 'Mock error',
            code: 'INTERNAL_ERROR',
          });
        }
      });
    },
  };
};
