-- +goose Up
-- Требуется PostgreSQL 13+ (gen_random_uuid встроен).

CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'declined');
CREATE TYPE privacy_status AS ENUM ('private', 'friends', 'public');
CREATE TYPE notification_type AS ENUM ('wishlist_deadline', 'friend_request', 'friend_accepted', 'item_reserved');

CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    login         VARCHAR(50)  NOT NULL CHECK (position('@' in login) = 0),
    email         VARCHAR(100) NOT NULL,
    phone         VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    avatar_url    TEXT,
    birthday      DATE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Логин и email уникальны без учёта регистра.
CREATE UNIQUE INDEX users_login_lower_key ON users (lower(login));
CREATE UNIQUE INDEX users_email_lower_key ON users (lower(email));

-- Желание (товар) принадлежит одному пользователю и удаляется вместе с ним.
CREATE TABLE products (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(200) NOT NULL,
    url         TEXT,
    image_url   TEXT,
    description TEXT,
    price       DECIMAL(10, 2),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE wishlists (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    description TEXT,
    privacy     privacy_status NOT NULL DEFAULT 'public',
    deadline    TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE wishlist_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wishlist_id UUID NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
    product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    reserved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    comment     TEXT,
    "order"     INT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_wishlist_product UNIQUE (wishlist_id, product_id)
);

CREATE TABLE friendships (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    friend_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status     friendship_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT friendship_not_self CHECK (user_id <> friend_id)
);

-- Одна строка на пару пользователей независимо от направления заявки.
CREATE UNIQUE INDEX unique_friendship_pair
    ON friendships (LEAST(user_id, friend_id), GREATEST(user_id, friend_id));

CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    actor_id    UUID REFERENCES users(id) ON DELETE SET NULL,
    wishlist_id UUID REFERENCES wishlists(id) ON DELETE CASCADE,
    type        notification_type NOT NULL,
    title       VARCHAR(200),
    message     TEXT,
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at     TIMESTAMPTZ
);

CREATE INDEX idx_products_owner_id ON products(owner_id);
CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_wishlists_deadline ON wishlists(deadline) WHERE deadline IS NOT NULL;
CREATE INDEX idx_wishlist_items_product_id ON wishlist_items(product_id);
CREATE INDEX idx_wishlist_items_reserved_by ON wishlist_items(reserved_by);
CREATE INDEX idx_friendships_user_id ON friendships(user_id);
CREATE INDEX idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_wishlist_id ON notifications(wishlist_id) WHERE wishlist_id IS NOT NULL;

-- +goose Down
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS friendships;
DROP TABLE IF EXISTS wishlist_items;
DROP TABLE IF EXISTS wishlists;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;
DROP TYPE IF EXISTS notification_type;
DROP TYPE IF EXISTS privacy_status;
DROP TYPE IF EXISTS friendship_status;
