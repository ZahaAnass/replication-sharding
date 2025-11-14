const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

const shard1Db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',  // replace with your password
    database: 'shard1',
    port: 3307
});

const shard2Db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',  // replace with your password
    database: 'shard2',
    port: 3307
});

// Check the connection to shard1
shard1Db.connect((err) => {
    if (err) {
        console.error('Error connecting to shard1:', err.stack);
    } else {
        console.log('Connected to shard1');
    }
});

// Check the connection to shard2
shard2Db.connect((err) => {
    if (err) {
        console.error('Error connecting to shard2:', err.stack);
    } else {
        console.log('Connected to shard2');
    }
});

// Function to get the appropriate shard based on the first letter of the name
const getShardDb = (name) => {
    const firstLetter = name.charAt(0).toUpperCase();
    return (firstLetter >= 'A' && firstLetter <= 'M') ? shard1Db : shard2Db;
};

// CRUD: Create phonebook entry
app.post('/phonebook', (req, res) => {
    const { name, phone_number } = req.body;
    const db = getShardDb(name);

    const query = 'INSERT INTO phone_book (name, phone_number) VALUES (?, ?)';
    db.query(query, [name, phone_number], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error creating phonebook entry' });
        }
        res.status(201).json({ id: result.insertId, name, phone_number });
    });
});

// CRUD: Get all phonebook entries
app.get('/phonebook', (req, res) => {
    const { name } = req.query;

    let query = 'SELECT * FROM phone_book';
    if (name) {
        const db = getShardDb(name);
        query = 'SELECT * FROM phone_book WHERE name LIKE ?';
        db.query(query, [`${name}%`], (err, rows) => {
            if (err) {
                return res.status(500).json({ error: 'Error fetching phonebook entries' });
            }
            res.status(200).json({
                data: rows,
                shard: db === shard1Db ? 'Shard 1' : 'Shard 2'
            });
        });
    } else {
        // Fetch from both shards
        shard1Db.query(query, (err, rows) => {
            if (err) {
                return res.status(500).json({ error: 'Error fetching phonebook entries from shard1' });
            }
            shard2Db.query(query, (err2, rows2) => {
                if (err2) {
                    return res.status(500).json({ error: 'Error fetching phonebook entries from shard2' });
                }
                res.status(200).json({
                    data: [...rows, ...rows2],
                    shard: 'Both shards'
                });
            });
        });
    }
});

// CRUD: Get a phonebook entry by Name
app.get('/phonebook/:name', (req, res) => {
    const { name } = req.params;
    const query = 'SELECT * FROM phone_book WHERE name LIKE ?';

    const db = getShardDb(name);

    db.query(query, [`${name}%`], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching phonebook entry' });
        }
        if (rows.length > 0) {
            return res.status(200).json({
                data: rows,
                shard: db === shard1Db ? 'Shard 1' : 'Shard 2'
            });
        }
        return res.status(404).json({ error: 'Entry not found' });
    });
});

// CRUD: Update phonebook entry
app.put('/phonebook/:id', (req, res) => {
    const { id } = req.params;
    const { name, phone_number } = req.body;
    const db = getShardDb(name);

    const query = 'UPDATE phone_book SET name = ?, phone_number = ? WHERE id = ?';
    db.query(query, [name, phone_number, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error updating phonebook entry' });
        }
        res.status(200).json({ id, name, phone_number });
    });
});

// CRUD: Delete phonebook entry
app.delete('/phonebook/:id', (req, res) => {
    const { id } = req.params;
    const { name } = req.query;
    const db = getShardDb(name);

    const query = 'DELETE FROM phone_book WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error deleting phonebook entry' });
        }
        res.status(200).json({ message: 'Phonebook entry deleted', id });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
