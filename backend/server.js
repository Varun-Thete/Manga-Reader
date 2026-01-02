import express from 'express';
import cors from 'cors';
import { glob } from 'glob';
import path from 'path';
import yauzl from 'yauzl';
import { fileURLToPath } from 'url';
import { openDb } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const LIBRARY_PATH = path.join(__dirname, '..', 'library');

app.use(cors());
app.use(express.json());

// --- UTILITY FUNCTIONS ---

// Sorts pages naturally (e.g., page_10.jpg after page_2.jpg)
const naturalSort = (a, b) => {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
};

// Extracts image files from a zip archive buffer
const getArchivePages = (buffer) => {
  return new Promise((resolve, reject) => {
    const pages = [];
    yauzl.fromBuffer(buffer, { lazyEntries: true }, (err, zipfile) => {
      if (err) reject(err);
      zipfile.readEntry();
      zipfile.on('entry', (entry) => {
        if (/\/$/.test(entry.fileName) || entry.fileName.startsWith('__MACOSX')) {
          zipfile.readEntry();
        } else {
          const fileExtension = path.extname(entry.fileName).toLowerCase();
          if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fileExtension)) {
            pages.push(entry.fileName);
          }
          zipfile.readEntry();
        }
      });
      zipfile.on('end', () => {
        resolve(pages.sort(naturalSort));
      });
    });
  });
};


// --- LIBRARY SCANNING ---

const scanLibrary = async () => {
    console.log('Starting library scan...');
    const db = await openDb();
    const comicFiles = await glob(`${LIBRARY_PATH}/**/*.cbz`, { nodir: true });

    for (const comicPath of comicFiles) {
        const relativePath = path.relative(LIBRARY_PATH, comicPath);
        const seriesName = path.basename(path.dirname(comicPath));
        const fileName = path.basename(comicPath);

        // Ensure series exists
        let series = await db.get('SELECT * FROM series WHERE name = ?', seriesName);
        if (!series) {
            const result = await db.run('INSERT INTO series (name, path) VALUES (?, ?)', seriesName, path.dirname(comicPath));
            series = { id: result.lastID, name: seriesName };
        }

        // Check if comic exists
        let comic = await db.get('SELECT * FROM comics WHERE path = ?', relativePath);
        if (!comic) {
            console.log(`New comic found: ${relativePath}`);
            await db.run(
                'INSERT INTO comics (series_id, path, file_name) VALUES (?, ?, ?)',
                series.id, relativePath, fileName
            );
        }
    }
    console.log('Library scan finished.');
};

// --- API ENDPOINTS ---

// GET all series
app.get('/api/series', async (req, res) => {
    const db = await openDb();
    const series = await db.all('SELECT * FROM series ORDER BY name');
    res.json(series);
});

// GET all comics for a series
app.get('/api/series/:seriesId/comics', async (req, res) => {
    const db = await openDb();
    const comics = await db.all(
        'SELECT * FROM comics WHERE series_id = ? ORDER BY file_name',
        req.params.seriesId
    );
    res.json(comics);
});

// GET comic details
app.get('/api/comics/:comicId', async (req, res) => {
    const db = await openDb();
    const comic = await db.get('SELECT * FROM comics WHERE id = ?', req.params.comicId);
    if (!comic) return res.status(404).send('Comic not found');
    res.json(comic);
});


// GET pages for a comic
app.get('/api/comics/:comicId/pages', async (req, res) => {
    const db = await openDb();
    const comic = await db.get('SELECT * FROM comics WHERE id = ?', req.params.comicId);
    if (!comic) return res.status(404).send('Comic not found');

    const comicPath = path.join(LIBRARY_PATH, comic.path);

    yauzl.open(comicPath, { lazyEntries: true }, (err, zipfile) => {
        if (err) return res.status(500).send('Failed to open comic file.');
        const pages = [];
        zipfile.readEntry();
        zipfile.on('entry', (entry) => {
            const fileExtension = path.extname(entry.fileName).toLowerCase();
            if (!/\/$/.test(entry.fileName) && !entry.fileName.startsWith('__MACOSX') && ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fileExtension)) {
                pages.push(entry.fileName);
            }
            zipfile.readEntry();
        });
        zipfile.on('end', async () => {
            const sortedPages = pages.sort(naturalSort);
            await db.run('UPDATE comics SET page_count = ? WHERE id = ?', sortedPages.length, comic.id);
            res.json(sortedPages);
        });
    });
});

// GET a specific page (or cover) from a comic
app.get('/api/comics/:comicId/page/:pageIndex', async (req, res) => {
    const { comicId, pageIndex } = req.params;
    const db = await openDb();
    const comic = await db.get('SELECT * FROM comics WHERE id = ?', comicId);
    if (!comic) return res.status(404).send('Comic not found');

    const comicPath = path.join(LIBRARY_PATH, comic.path);

    yauzl.open(comicPath, { lazyEntries: true }, (err, zipfile) => {
        if (err) return res.status(500).send('Failed to open comic file.');
        const pages = [];
        zipfile.readEntry();
        zipfile.on('entry', (entry) => {
            const fileExtension = path.extname(entry.fileName).toLowerCase();
            if (!/\/$/.test(entry.fileName) && !entry.fileName.startsWith('__MACOSX') && ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fileExtension)) {
                pages.push(entry);
            }
            zipfile.readEntry();
        });

        zipfile.on('end', () => {
            const sortedPages = pages.sort((a, b) => naturalSort(a.fileName, b.fileName));
            const targetPage = sortedPages[pageIndex];

            if (!targetPage) return res.status(404).send('Page not found.');

            zipfile.openReadStream(targetPage, (err, readStream) => {
                if (err) return res.status(500).send('Failed to read page.');
                const mimeType = `image/${path.extname(targetPage.fileName).substring(1)}`;
                res.setHeader('Content-Type', mimeType);
                readStream.pipe(res);
            });
        });
    });
});

// POST update reading progress
app.post('/api/comics/:comicId/progress', async (req, res) => {
    const { comicId } = req.params;
    const { currentPage } = req.body;

    if (typeof currentPage !== 'number') {
        return res.status(400).send('Invalid page number.');
    }

    const db = await openDb();
    await db.run('UPDATE comics SET current_page = ? WHERE id = ?', currentPage, comicId);

    res.status(200).send({ message: 'Progress saved.' });
});


// --- SERVER STARTUP ---

app.listen(PORT, async () => {
    await openDb();
    await scanLibrary();
    console.log(`Backend server running on http://localhost:${PORT}`);
});