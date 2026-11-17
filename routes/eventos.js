import express from 'express';
import Evento from '../models/evento.js';
import Recinto from '../models/recinto.js';

const router = express.Router();

// GET / - Listado de eventos con los datos del recinto
router.get('/', async (req, res) => {
  try {
    const resultado = await Evento.find().populate('recinto');
    if (!resultado || resultado.length === 0) {
      return res.status(500).send({ ok: false, error: 'No se han encontrado eventos' });
    }
    res.status(200).send({ ok: true, resultado });
  } catch (error) {
    res.status(500).send({ ok: false, error: 'No se han encontrado eventos' });
  }
});

// GET /localidad/:nombre - Eventos de esa localidad cuya fecha aún no haya pasado
router.get('/localidad/:nombre', async (req, res) => {
  try {
    // 1. Buscar los recintos con esa localidad y quedarse con sus ids
    const recintos = await Recinto.find({ localidad: req.params.nombre });
    const idsRecintos = recintos.map(r => r._id);

    // 2. Buscar los eventos cuyo recinto esté en esos ids y cuya fecha sea >= actual
    const resultado = await Evento.find({
      recinto: { $in: idsRecintos },
      fecha: { $gte: new Date() }
    });

    if (!resultado || resultado.length === 0) {
      return res.status(404).send({ ok: false, error: 'No se han encontrado eventos' });
    }

    res.status(200).send({ ok: true, resultado });
  } catch (error) {
    res.status(404).send({ ok: false, error: 'No se han encontrado eventos' });
  }
});

// GET /:id - Obtener un evento por su id con los datos del recinto
router.get('/:id', async (req, res) => {
  try {
    const resultado = await Evento.findById(req.params.id).populate('recinto');
    if (!resultado) {
      return res.status(404).send({ ok: false, error: `Evento ${req.params.id} no encontrado` });
    }
    res.status(200).send({ ok: true, resultado });
  } catch (error) {
    res.status(404).send({ ok: false, error: `Evento ${req.params.id} no encontrado` });
  }
});

// POST / - Crear un nuevo evento
router.post('/', async (req, res) => {
  try {
    const nuevoEvento = new Evento({
      nombre: req.body.nombre,
      fecha: req.body.fecha,
      recinto: req.body.recinto,
      entradas: req.body.entradas
    });
    const resultado = await nuevoEvento.save();
    res.status(201).send({ ok: true, resultado });
  } catch (error) {
    res.status(500).send({ ok: false, error: 'Error añadiendo evento' });
  }
});

// PUT /:id - Actualizar un evento por su id
router.put('/:id', async (req, res) => {
  try {
    const resultado = await Evento.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          nombre: req.body.nombre,
          fecha: req.body.fecha,
          recinto: req.body.recinto,
          entradas: req.body.entradas
        }
      },
      { returnDocument: 'after', runValidators: true }
    );

    if (!resultado) {
      return res.status(404).send({ ok: false, error: `Error actualizando evento ${req.params.id}` });
    }

    res.status(200).send({ ok: true, resultado });
  } catch (error) {
    res.status(404).send({ ok: false, error: `Error actualizando evento ${req.params.id}` });
  }
});

// DELETE /:id - Eliminar un evento por su id
router.delete('/:id', async (req, res) => {
  try {
    const resultado = await Evento.findByIdAndDelete(req.params.id);
    if (!resultado) {
      return res.status(404).send({ ok: false, error: `Error eliminando evento ${req.params.id}` });
    }
    res.status(200).send({ ok: true, resultado });
  } catch (error) {
    res.status(404).send({ ok: false, error: `Error eliminando evento ${req.params.id}` });
  }
});

// GET /entradas/:idEvento/:tipoEntrada - Obtener precio y disponibles de un tipo de entrada en un evento
router.get('/entradas/:idEvento/:tipoEntrada', async (req, res) => {
  const { idEvento, tipoEntrada } = req.params;
  try {
    const evento = await Evento.findById(idEvento);
    if (!evento) {
      return res.status(404).send({
        ok: false,
        error: `Error obteniendo datos de entrada para evento ${idEvento}`
      });
    }

    const entrada = evento.entradas.find(e => e.tipo === tipoEntrada);
    if (!entrada) {
      return res.status(404).send({
        ok: false,
        error: `Error obteniendo datos de entrada para evento ${idEvento}`
      });
    }

    res.status(200).send({
      ok: true,
      resultado: {
        precio: entrada.precio,
        disponibles: entrada.disponibles
      }
    });
  } catch (error) {
    res.status(404).send({
      ok: false,
      error: `Error obteniendo datos de entrada para evento ${idEvento}`
    });
  }
});

// PUT /entradas/:idEvento/:tipoEntrada/:cantidad - Restar cantidad a las disponibles y guardar
router.put('/entradas/:idEvento/:tipoEntrada/:cantidad', async (req, res) => {
  const { idEvento, tipoEntrada, cantidad } = req.params;
  try {
    const cant = Number(cantidad);
    if (!Number.isInteger(cant) || cant <= 0) {
      return res.status(404).send({
        ok: false,
        error: `Error actualizando entradas del evento ${idEvento}`
      });
    }

    const evento = await Evento.findById(idEvento);
    if (!evento) {
      return res.status(404).send({
        ok: false,
        error: `Error actualizando entradas del evento ${idEvento}`
      });
    }

    const entrada = evento.entradas.find(e => e.tipo === tipoEntrada);
    if (!entrada) {
      return res.status(404).send({
        ok: false,
        error: `Error actualizando entradas del evento ${idEvento}`
      });
    }

    if (entrada.disponibles < cant) {
      return res.status(404).send({
        ok: false,
        error: `Error actualizando entradas del evento ${idEvento}`
      });
    }

    entrada.disponibles -= cant;
    const resultado = await evento.save();

    res.status(200).send({ ok: true, resultado });
  } catch (error) {
    res.status(404).send({
      ok: false,
      error: `Error actualizando entradas del evento ${idEvento}`
    });
  }
});

export default router;
