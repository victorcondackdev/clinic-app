const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const { v4: uuidv4 } = require('uuid');

app.use(cors({
  origin: "*",
}));
app.use(bodyParser.json());

const port = 3000;

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'clinica',
});

db.connect((err) => {
  if (err) {
    console.error('MySQL connection failed: ', err);
    throw err;
  }
  console.log('Connected to MySQL database');
});

app.post('/api/create-tables', (req, res) => {
  const createDadosPressaoTableQuery = `
    CREATE TABLE dados_pressao (
      id INT AUTO_INCREMENT PRIMARY KEY,
      dia DATE NOT NULL,
      hora TIME NOT NULL,
      pressaoMax INT NOT NULL,
      pressaoMin INT NOT NULL
    );
  `;

  db.query(createDadosPressaoTableQuery, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error creating dados_pressao table');
    } else {
      res.status(200).send('Table created successfully');
    }
  });
});

app.post('/api/dados-pressao', (req, res) => {
  const { dia, hora, pressaoMax, pressaoMin } = req.body;

  const insertQuery = `
    INSERT INTO dados_pressao (dia, hora, pressaoMax, pressaoMin)
    VALUES (?, ?, ?, ?)
  `;

  db.query(insertQuery, [dia, hora, pressaoMax, pressaoMin], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error adding pressure data');
    } else {
      res.status(201).json({ id: result.insertId, dia, hora, pressaoMax, pressaoMin });
    }
  });
});

app.get('/api/dados-pressao', (req, res) => {
  const selectQuery = 'SELECT * FROM dados_pressao';

  db.query(selectQuery, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error retrieving pressure data');
    } else {
      res.status(200).json(results);
    }
  });
});

app.put('/api/dados-pressao/:id', (req, res) => {
  const id = req.params.id;
  const { pressaoMax, pressaoMin, dia, hora } = req.body;

  const updateQuery = `
    UPDATE dados_pressao
    SET pressaoMax = ?, pressaoMin = ?, dia = ?, hora = ?
    WHERE id = ?
  `;

  db.query(updateQuery, [pressaoMax, pressaoMin, dia, hora, id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Erro atualizando dia' });
    } else {
      if (result.affectedRows > 0) {
        res.status(200).json({ success: true, message: 'Pressure data updated successfully' });
      } else {
        res.status(404).json({ success: false, message: 'Pressure data not found for the given ID' });
      }
    }
  });
});

app.delete('/api/dados-pressao/:id', (req, res) => {
  const id = req.params.id;

  const deleteQuery = `
    DELETE FROM dados_pressao
    WHERE id = ?
  `;

  db.query(deleteQuery, [id], (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error deleting pressure data');
    } else {
      res.status(200).json({ success: true, message: 'Dado apagado com sucesso' });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
