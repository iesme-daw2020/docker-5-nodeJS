const fs = require('fs');
const path = require('path');

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const Goal = require('./models/goal');

const app = express();

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'logs', 'access.log'),
  { flags: 'a' }
);

app.use(morgan('combined', { stream: accessLogStream }));

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/goals', async (req, res) => {
  console.log('Tratando de obtener los objetivos');
  try {
    const goals = await Goal.find();
    res.status(200).json({
      goals: goals.map((goal) => ({
        id: goal.id,
        text: goal.text,
      })),
    });
    console.log('Objetivos obtenidos');
  } catch (err) {
    console.error('Error obteniendo los objetivos');
    console.error(err.message);
    res.status(500).json({ message: 'Fallo al cargar los objetivos.' });
  }
});

app.post('/goals', async (req, res) => {
  console.log('Tratando de guardar un objetivo');
  const goalText = req.body.text;

  if (!goalText || goalText.trim().length === 0) {
    console.log('Entrada inválida - no hay texto');
    return res.status(422).json({ message: 'Objetivo inválido' });
  }

  const goal = new Goal({
    text: goalText,
  });

  try {
    await goal.save();
    res.status(201).json({
      message: 'Objetivo guardado',
      goal: { id: goal.id, text: goalText },
    });
    console.log('Objetivo guardado');
  } catch (err) {
    console.error('Error al guardar un objetivo');
    console.error(err.message);
    res.status(500).json({ message: 'Fallo al guardar un objetivo.' });
  }
});

app.delete('/goals/:id', async (req, res) => {
  console.log('Tratando de borrar un objetivo');
  try {
    await Goal.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: 'Objetivo borrado!' });
    console.log('Objetivo borrado');
  } catch (err) {
    console.error('Error al borrar un objetivo');
    console.error(err.message);
    res.status(500).json({ message: 'Fallo al borrar un objetivo.' });
  }
});

mongoose.connect(
  'mongodb://localhost:27017/course-goals',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) {
      console.error('Fallo al conectar a MongoDB');
      console.error(err);
    } else {
      console.log('Conectado a MongoDB');
      app.listen(80);
    }
  }
);
