const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// ------------------- DATABASE CONNECTIONS -------------------

// Shard 1
const shard1Master = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'shard1',
    port: 3308 // Master
});

const shard1Slave = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'shard1',
    port: 3309 // Slave
});

// Shard 2
const shard2Master = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'shard2',
    port: 3308 // Master
});

const shard2Slave = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'shard2',
    port: 3309 // Slave
});

// ------------------- CONNECTION CHECK -------------------
[shard1Master, shard1Slave, shard2Master, shard2Slave].forEach((conn, idx) => {
    conn.connect(err => {
        if (err) console.error(`Error connecting to DB ${idx}:`, err.stack);
        else console.log(`Connected to DB ${idx}`);
    });
});

// ------------------- SHARD + REPLICATION LOGIC -------------------
const getShardDb = (name, isWrite = false) => {
    const firstLetter = name.charAt(0).toUpperCase();
    if (firstLetter >= 'A' && firstLetter <= 'M') return isWrite ? shard1Master : shard1Slave;
    return isWrite ? shard2Master : shard2Slave;
};

// ------------------- CRUD ROUTES -------------------

// CREATE
app.post('/phonebook', (req, res) => {
    const { name, phone_number } = req.body;
    const db = getShardDb(name, true); // Write → Master

    db.query(
        'INSERT INTO phone_book (name, phone_number) VALUES (?, ?)',
        [name, phone_number],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: result.insertId, name, phone_number });
        }
    );
});

// READ ALL / BY NAME
app.get('/phonebook', (req, res) => {
    const { name } = req.query;

    if (name) {
        const db = getShardDb(name); // Read → Slave
        db.query('SELECT * FROM phone_book WHERE name LIKE ?', [`${name}%`], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ data: rows, shard: db === shard1Slave ? 'Shard1' : 'Shard2' });
        });
    } else {
        // Read all → read from Slaves both shards
        shard1Slave.query('SELECT * FROM phone_book', (err1, rows1) => {
            if (err1) return res.status(500).json({ error: err1.message });
            shard2Slave.query('SELECT * FROM phone_book', (err2, rows2) => {
                if (err2) return res.status(500).json({ error: err2.message });
                res.json({ data: [...rows1, ...rows2], shard: 'Both shards' });
            });
        });
    }
});

// READ BY PARAM NAME
app.get('/phonebook/:name', (req, res) => {
    const { name } = req.params;
    const db = getShardDb(name); // Read → Slave
    db.query('SELECT * FROM phone_book WHERE name LIKE ?', [`${name}%`], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (rows.length > 0) res.json({ data: rows, shard: db === shard1Slave ? 'Shard1' : 'Shard2' });
        else res.status(404).json({ error: 'Entry not found' });
    });
});

// UPDATE
app.put('/phonebook/:id', (req, res) => {
    const { id } = req.params;
    const { name, phone_number } = req.body;
    const db = getShardDb(name, true); // Write → Master

    db.query('UPDATE phone_book SET name = ?, phone_number = ? WHERE id = ?', [name, phone_number, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id, name, phone_number });
    });
});

// DELETE
app.delete('/phonebook/:id', (req, res) => {
    const { id } = req.params;
    const { name } = req.query;
    const db = getShardDb(name, true); // Write → Master

    db.query('DELETE FROM phone_book WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Phonebook entry deleted', id });
    });
});

// ------------------- START SERVER -------------------
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
