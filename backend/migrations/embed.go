// Package migrations встраивает SQL-миграции (формат goose) в бинарник.
package migrations

import "embed"

// FS содержит все файлы миграций *.sql.
//
//go:embed *.sql
var FS embed.FS
