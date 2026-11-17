import express from 'express';
import Recinto from '../models/recinto.js';

const router = express.Router();

// GET / - Listado de todos los recintos
router.get('/', async (req, res) => {
  try {
    const resultado = await Recinto.find();
    if (!resultado || resultado.length === 0) {
      return res.status(500).send({ ok: false, error: 'No se han encontrado recintos' });
    }
    res.status(200).send({ ok: true, resultado });
  } catch (error) {
    res.status(500).send({ ok: false, error: 'No se han encontrado recintos' });
  }
});

// GET /localidad/:nombre - Recintos de una localidad
router.get('/localidad/:nombre', async (req, res) => {
  try {
    const resultado = await Recinto.find({ localidad: req.params.nombre });
    if (!resultado || resultado.length === 0) {
      return res.status(404).send({ ok: false, error: 'No se han encontrado recintos de la localidad indicada' });
    }
    res.status(200).send({ ok: true, resultado });
  } catch (error) {
    res.status(404).send({ ok: false, error: 'No se han encontrado recintos de la localidad indicada' });
  }
});

// GET /:id - Obtener un recinto por su id
router.get('/:id', async (req, res) => {
  try {
    const resultado = await Recinto.findById(req.params.id);
    if (!resultado) {
      return res.status(404).send({ ok: false, error: `Recinto ${req.params.id} no encontrado` });
    }
    res.status(200).send({ ok: true, resultado });
  } catch (error) {
    res.status(404).send({ ok: false, error: `Recinto ${req.params.id} no encontrado` });
  }
});

// POST / - Crear un nuevo recinto
router.post('/', async (req, res) => {
  try {
    const nuevoRecinto = new Recinto({
      nombre: req.body.nombre,
      direccion: req.body.direccion,
      localidad: req.body.localidad,
      aforoMaximo: req.body.aforoMaximo
    });
    const resultado = await nuevoRecinto.save();
    res.status(201).send({ ok: true, resultado });
  } catch (error) {
    res.status(500).send({ ok: false, error: 'Error añadiendo recinto' });
  }
});

// DELETE /:id - Eliminar un recinto por su id
router.delete('/:id', async (req, res) => {
  try {
    const resultado = await Recinto.findByIdAndDelete(req.params.id);
    if (!resultado) {
      return res.status(404).send({ ok: false, error: `Error eliminando recinto ${req.params.id}` });
    }
    res.status(200).send({ ok: true, resultado });
  } catch (error) {
    res.status(404).send({ ok: false, error: `Error eliminando recinto ${req.params.id}` });
  }
});

export default router;
