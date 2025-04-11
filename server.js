const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const db = require("./db");

const PORT = 3000;
const app = express();

// Middlewares para JSON y x-www-form-urlencoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware para form-data (sin archivos)
const formParser = multer().none();

// Obtener todos los estudiantes
app.get("/students", (req, res) => {
    db.all("SELECT * FROM students", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Agregar un nuevo estudiante
app.post("/students", formParser, (req, res) => {
    const { firstname, lastname, gender, age } = req.body;
    db.run(
        `INSERT INTO students (firstname, lastname, gender, age) VALUES (?, ?, ?, ?)`,
        [firstname, lastname, gender, age],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, firstname, lastname, gender, age });
        }
    );
});

// Obtener un estudiante por ID
app.get("/student/:id", (req, res) => {
    db.get("SELECT * FROM students WHERE id = ?", [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        row ? res.json(row) : res.status(404).json({ error: "Estudiante no encontrado" });
    });
});

// Modificar un estudiante
app.put("/student/:id", formParser, (req, res) => {
    const { firstname, lastname, gender, age } = req.body;
    db.run(
        `UPDATE students SET firstname = ?, lastname = ?, gender = ?, age = ? WHERE id = ?`,
        [firstname, lastname, gender, age, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: req.params.id, firstname, lastname, gender, age });
        }
    );
});

// Eliminar un estudiante
app.delete("/student/:id", (req, res) => {
    db.run("DELETE FROM students WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: `Estudiante con ID ${req.params.id} eliminado` });
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
