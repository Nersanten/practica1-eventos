# Reglas de arquitectura y estilo para la API REST de Eventos

## 1. Descripción del proyecto

Este proyecto es una API RESTful construida con Node.js, Express y Mongoose para gestionar las entradas a un conjunto de eventos que se celebran en distintos recintos. La base de datos es MongoDB Atlas y la aplicación se desplegará en Render.

## 2. Estructura de carpetas obligatoria

Todo el código fuente debe estar estructurado estrictamente de la siguiente manera:

- `models/` (Esquemas y modelos de Mongoose)
  - `models/evento.js` (esquema de entradas + esquema y modelo de eventos)
  - `models/recinto.js` (esquema y modelo de recintos)
- `routes/` (Enrutadores de Express)
  - `routes/recintos.js`
  - `routes/eventos.js`
- `index.js` (Punto de entrada de la aplicación)
- `.env` (variables de entorno, NO se sube al repositorio)
- `.gitignore` (debe incluir `node_modules` y `.env`)

**Prohibido** crear otras carpetas como `controllers/`, `services/`, `middlewares/` o `config/`. Toda la lógica de cada endpoint (acceso a la base de datos y respuesta) va dentro de su enrutador en `routes/`.

## 3. Modelos de datos

Se deben respetar exactamente los nombres de los campos, incluidas mayúsculas y minúsculas.

### 3.1. Entradas (subdocumento, en `models/evento.js`)

Esquema `entradaSchema` (NO se crea modelo para él, solo se usa como subdocumento):

- **tipo**: `String`, obligatorio (`required`), longitud mínima 3 (`minlength: 3`), `trim`. Ejemplos: "VIP", "General".
- **precio**: `Number`, obligatorio, mínimo `0`.
- **disponibles**: `Number`, obligatorio, mínimo `0`, y debe ser un número entero (usar un validador con `Number.isInteger`).

### 3.2. Eventos (en `models/evento.js`)

Esquema `eventoSchema` y modelo `eventos`:

- **nombre**: `String`, obligatorio, longitud mínima 5, `trim`.
- **fecha**: `Date`, obligatorio.
- **recinto**: `mongoose.Schema.Types.ObjectId` con `ref: 'recintos'`, obligatorio. Relaciona el evento con un recinto por su id.
- **entradas**: array de subdocumentos `entradaSchema` (`entradas: [entradaSchema]`).

Crear el modelo con `mongoose.model('eventos', eventoSchema)` y exportarlo.

### 3.3. Recintos (en `models/recinto.js`)

Esquema `recintoSchema` y modelo `recintos`:

- **nombre**: `String`, obligatorio, longitud mínima 5, `trim`.
- **direccion**: `String`, obligatorio, longitud mínima 10, `trim`.
- **localidad**: `String`, obligatorio, longitud mínima 3, `trim`.
- **aforoMaximo**: `Number`, NO obligatorio.

Crear el modelo con `mongoose.model('recintos', recintoSchema)` y exportarlo.

## 4. Estilo de código y convenciones

- **Módulos**: Utilizar SIEMPRE la sintaxis de **ES Modules** (`import` / `export default`) en todo el proyecto, nunca `require()` ni `module.exports`. El `package.json` debe tener `"type": "module"`. Al importar ficheros propios, incluir siempre la extensión `.js` (ej: `import Evento from "../models/evento.js";`).
- **Asincronía**: Usar `async/await` con bloques `try / catch` en TODOS los endpoints, sin mezclar con `.then()/.catch()`.
- **Enrutadores**: En cada fichero de `routes/` crear un `express.Router()`, definir las rutas relativas al prefijo (por ejemplo `router.get('/:id', ...)`, no `router.get('/recintos/:id', ...)`) y exportarlo con `export default router;`.
- **Formato de respuesta**: TODAS las respuestas son JSON enviadas con `res.status(codigo).send({...})` y SIEMPRE incluyen el booleano `ok`:
  - Si va bien: `{ ok: true, resultado: ... }`
  - Si hay error: `{ ok: false, error: "mensaje" }`
  - No usar otros nombres de campo (nada de `message`, `data`, `msg`...).
- **Códigos de estado y mensajes**: usar EXACTAMENTE los indicados en el apartado 5, sin cambiar ni una palabra de los mensajes. Donde aparece `X`, se sustituye por el id que llega en la URL.
- **No encontrado**: cuando `findById`, `findByIdAndUpdate` o `findByIdAndDelete` devuelvan `null`, responder con el mismo código y mensaje de error que si fallara la operación.
- **Listados vacíos**: cuando un `find` devuelva un array vacío, responder con el código y mensaje de error indicados.
- **Datos del body**: construir los documentos a partir de los campos concretos de `req.body` (ej: `nombre: req.body.nombre`), igual que se hace en clase.

## 5. Endpoints requeridos

### 5.1. Recintos (`routes/recintos.js`, montado en `/recintos`)

| Método y ruta | Éxito | Error |
|---|---|---|
| `GET /recintos` | 200, `resultado` = listado de recintos (si hay al menos uno) | 500, `"No se han encontrado recintos"` (si no hay ninguno o falla la consulta) |
| `GET /recintos/:id` | 200, `resultado` = el recinto | 404, `"Recinto X no encontrado"` (si es nulo o hay error) |
| `GET /recintos/localidad/:nombre` | 200, `resultado` = recintos de esa localidad (si hay al menos uno) | 404, `"No se han encontrado recintos de la localidad indicada"` |
| `POST /recintos` | 201, `resultado` = el recinto creado (datos en el body JSON) | 500, `"Error añadiendo recinto"` |
| `DELETE /recintos/:id` | 200, `resultado` = el recinto eliminado | 404, `"Error eliminando recinto X"` (si es nulo o hay error) |

### 5.2. Eventos (`routes/eventos.js`, montado en `/eventos`)

| Método y ruta | Éxito | Error |
|---|---|---|
| `GET /eventos` | 200, `resultado` = listado de eventos con los datos del recinto (usar `populate('recinto')`) | 500, `"No se han encontrado eventos"` |
| `GET /eventos/:id` | 200, `resultado` = el evento (con `populate('recinto')`) | 404, `"Evento X no encontrado"` |
| `GET /eventos/localidad/:nombre` | 200, `resultado` = eventos de esa localidad cuya fecha aún no haya pasado | 404, `"No se han encontrado eventos"` |
| `POST /eventos` | 201, `resultado` = el evento creado (datos en el body JSON, incluido el array `entradas`) | 500, `"Error añadiendo evento"` |
| `PUT /eventos/:id` | 200, `resultado` = el evento actualizado | 404, `"Error actualizando evento X"` |
| `DELETE /eventos/:id` | 200, `resultado` = el evento eliminado | 404, `"Error eliminando evento X"` |

Detalles de implementación:

- **`GET /eventos/localidad/:nombre`**: los eventos no guardan la localidad, la guarda el recinto. Hacerlo en dos pasos, como se ha visto en clase: (1) buscar los recintos con esa `localidad` y quedarse con sus ids con `map`; (2) buscar los eventos cuyo `recinto` esté en esos ids (`$in`) y cuya `fecha` sea mayor o igual que la actual (`$gte: new Date()`).
- **`PUT /eventos/:id`**: usar `findByIdAndUpdate` con `$set` y las opciones `{ returnDocument: 'after', runValidators: true }`.

### 5.3. Entradas (dentro de `routes/eventos.js`)

| Método y ruta | Éxito | Error |
|---|---|---|
| `GET /eventos/entradas/:idEvento/:tipoEntrada` | 200, `resultado` = `{ precio, disponibles }` de ese tipo de entrada en ese evento | 404, `"Error obteniendo datos de entrada para evento X"` (X = idEvento) |
| `PUT /eventos/entradas/:idEvento/:tipoEntrada/:cantidad` | 200, `resultado` = el evento con sus entradas actualizadas | 404, `"Error actualizando entradas del evento X"` (X = idEvento) |

Detalles de implementación:

- Buscar el evento con `findById` y, dentro de su array `entradas`, la entrada cuyo `tipo` coincida con `tipoEntrada`.
- En el PUT: convertir `cantidad` a número con `Number()`. Si no existe el evento o la entrada, si la cantidad no es un entero positivo, o si no hay suficientes entradas `disponibles`, responder con el error. Si todo es correcto, restar la cantidad a `disponibles` y guardar con `evento.save()`.

## 6. Servidor principal (`index.js`)

Debe hacer, en este orden, lo mismo que en los ejercicios de clase:

1. Cargar las variables de entorno con `import 'dotenv/config';` (primera línea).
2. Importar las librerías (`express`, `mongoose`) y los enrutadores.
3. Conectar con la base de datos usando `mongoose.connect(process.env.URL_BD)`.
4. Crear la app de Express y cargar el middleware `express.json()`.
5. Cargar los enrutadores: `app.use('/recintos', recintos)` y `app.use('/eventos', eventos)`.
6. Poner en marcha el servidor con `app.listen` en el puerto `process.env.PORT || 8080` (Render asigna el puerto en la variable `PORT`).

El `package.json` debe incluir el script `"start": "node index.js"` (lo usa Render para arrancar la aplicación).

## 7. Librerías

Únicamente: `express`, `mongoose` y `dotenv`. No añadir ninguna otra dependencia.
