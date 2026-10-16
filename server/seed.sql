INSERT INTO categories (name) VALUES ('Electronics'), ('Clothing'), ('Books');

INSERT INTO products (category_id, name, description, price, stock, image_url) VALUES
(1, 'Wireless Earbuds', 'Bluetooth earbuds with charging case', 1499, 25, 'https://picsum.photos/seed/p1/400/300'),
(1, 'Smart Watch', 'Fitness tracker with heart rate monitor', 2999, 15, 'https://picsum.photos/seed/p2/400/300'),
(1, 'Power Bank 10000mAh', 'Fast charging portable charger', 999, 40, 'https://picsum.photos/seed/p3/400/300'),
(1, 'Bluetooth Speaker', 'Portable waterproof speaker', 1799, 12, 'https://picsum.photos/seed/p4/400/300'),
(1, 'USB Keyboard', 'Full size wired keyboard', 599, 3, 'https://picsum.photos/seed/p5/400/300'),
(2, 'Cotton T-Shirt', 'Comfortable round neck t-shirt', 399, 50, 'https://picsum.photos/seed/p6/400/300'),
(2, 'Denim Jeans', 'Slim fit blue jeans', 1299, 30, 'https://picsum.photos/seed/p7/400/300'),
(2, 'Hoodie', 'Warm fleece hoodie', 1199, 20, 'https://picsum.photos/seed/p8/400/300'),
(2, 'Running Shoes', 'Lightweight sports shoes', 1999, 18, 'https://picsum.photos/seed/p9/400/300'),
(2, 'Cap', 'Adjustable cotton cap', 249, 0, 'https://picsum.photos/seed/p10/400/300'),
(3, 'JavaScript Basics', 'Beginner guide to JavaScript', 450, 22, 'https://picsum.photos/seed/p11/400/300'),
(3, 'Learn SQL', 'Step by step SQL book', 380, 16, 'https://picsum.photos/seed/p12/400/300'),
(3, 'Node.js in Action', 'Build backend apps with Node', 650, 10, 'https://picsum.photos/seed/p13/400/300'),
(3, 'Notebook Pack', 'Pack of 5 ruled notebooks', 220, 60, 'https://picsum.photos/seed/p14/400/300'),
(3, 'Story Book', 'Short stories for all ages', 299, 4, 'https://picsum.photos/seed/p15/400/300');