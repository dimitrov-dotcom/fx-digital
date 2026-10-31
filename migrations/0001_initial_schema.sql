CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_code TEXT NOT NULL UNIQUE,

    customer_name TEXT NOT NULL,
    customer_whatsapp TEXT NOT NULL,

    category TEXT NOT NULL,
    service TEXT NOT NULL,
    package_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit TEXT,

    estimated_total INTEGER NOT NULL DEFAULT 0,
    final_total INTEGER,

    customer_notes TEXT,
    admin_note TEXT,

    order_status TEXT NOT NULL DEFAULT 'Menunggu Persetujuan'
        CHECK (order_status IN (
            'Menunggu Persetujuan',
            'Disetujui',
            'Dalam Proses',
            'Sedang Dikerjakan',
            'Revisi',
            'Selesai',
            'Dibatalkan'
        )),

    approved_at TEXT,
    approved_by TEXT,

    invoice_token_hash TEXT UNIQUE,
    invoice_number TEXT UNIQUE,
    invoice_published_at TEXT,

    payment_status TEXT NOT NULL DEFAULT 'Belum Dibayar'
        CHECK (payment_status IN (
            'Belum Dibayar',
            'DP Dibayar',
            'Lunas'
        )),

    payment_note TEXT,
    payment_verified_at TEXT,
    payment_verified_by TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at
    ON orders(created_at);

CREATE INDEX IF NOT EXISTS idx_orders_status
    ON orders(order_status);

CREATE INDEX IF NOT EXISTS idx_orders_customer
    ON orders(customer_whatsapp);

CREATE TABLE IF NOT EXISTS admin_sessions (
    id TEXT PRIMARY KEY,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_expiry
    ON admin_sessions(expires_at);
