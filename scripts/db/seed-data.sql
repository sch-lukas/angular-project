-- Testdaten für die Buchhandlung
-- Zuerst Titel löschen wegen Foreign Key, dann Bücher

DELETE FROM buch.abbildung;
DELETE FROM buch.titel;
DELETE FROM buch.buch;

-- Bücher einfügen
INSERT INTO buch.buch (isbn, rating, art, preis, rabatt, lieferbar, datum, homepage, schlagwoerter, version) VALUES
('978-3-16-148410-0', 5, 'EPUB', 29.99, 0.1, true, '2024-01-15', 'https://example.com/buch1', '["JavaScript", "TypeScript"]'::jsonb, 0),
('978-3-16-148411-7', 4, 'HARDCOVER', 39.99, 0.15, true, '2024-02-20', 'https://example.com/buch2', '["NestJS", "Backend"]'::jsonb, 0),
('978-3-16-148412-4', 3, 'PAPERBACK', 19.99, 0.05, false, '2024-03-10', 'https://example.com/buch3', '["Angular", "Frontend"]'::jsonb, 0),
('978-3-16-148413-1', 5, 'EPUB', 49.99, 0.2, true, '2024-04-05', 'https://example.com/buch4', '["Docker", "DevOps"]'::jsonb, 0),
('978-3-16-148414-8', 4, 'HARDCOVER', 34.99, 0.1, true, '2024-05-12', 'https://example.com/buch5', '["PostgreSQL", "Datenbank"]'::jsonb, 0);

-- Titel für die Bücher
INSERT INTO buch.titel (titel, untertitel, buch_id) VALUES
('JavaScript Grundlagen', 'Von den Basics bis zu fortgeschrittenen Konzepten', 1),
('NestJS in Action', 'Backend-Entwicklung mit Node.js', 2),
('Angular komplett', 'Das umfassende Handbuch', 3),
('Docker für Entwickler', 'Container-Technologie meistern', 4),
('PostgreSQL Administration', 'Datenbankmanagement für Profis', 5);
