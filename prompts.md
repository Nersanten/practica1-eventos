# Prompts utilizados con Antigravity

Proyecto generado con Antigravity a partir del contexto definido en `agents.md`.
Los prompts se han lanzado en este orden. Después de cada uno se ha revisado el código generado antes de pasar al siguiente.

---

## Prompt 1 – Preparar el proyecto

```
Lee el fichero agents.md de este proyecto y respeta todas sus reglas en este y en los siguientes pasos.

En este primer paso solo quiero preparar el proyecto, sin escribir todavía código de la API:
1. Crea el package.json (con npm init -y) y configúralo con "type": "module" y el script "start": "node index.js".
2. Instala únicamente las dependencias express, mongoose y dotenv.
3. Crea el fichero .gitignore con node_modules y .env.
4. Crea las carpetas models/ y routes/ vacías.

No crees ningún otro fichero ni carpeta. Al terminar, muéstrame el package.json resultante.
```

---

## Prompt 2 – Modelos

```
Siguiendo el apartado 3 de agents.md, crea los modelos de Mongoose:
- models/recinto.js con recintoSchema y el modelo 'recintos'.
- models/evento.js con entradaSchema (solo esquema, sin modelo, usado como subdocumento) y eventoSchema con el modelo 'eventos'. El campo recinto debe ser un ObjectId con ref: 'recintos'.

Respeta exactamente los nombres de los campos y las validaciones indicadas. Usa ES Modules y exporta cada modelo con export default.
```

---

## Prompt 3 – Enrutador de recintos

```
Siguiendo los apartados 4 y 5.1 de agents.md, crea routes/recintos.js con un express.Router() y los 5 endpoints de recintos:
GET /, GET /:id, GET /localidad/:nombre, POST / y DELETE /:id.

Usa async/await con try/catch en todos, responde siempre con res.status(codigo).send({ ok, resultado }) o { ok, error } y usa exactamente los códigos de estado y mensajes de error de la tabla. Ten en cuenta los casos de resultado nulo y de listado vacío. Las rutas deben ser relativas al prefijo /recintos.
```

---

## Prompt 4 – Enrutador de eventos

```
Siguiendo los apartados 4 y 5.2 de agents.md, crea routes/eventos.js con un express.Router() y los 6 endpoints de eventos:
GET /, GET /:id, GET /localidad/:nombre, POST /, PUT /:id y DELETE /:id.

- GET / y GET /:id deben usar populate('recinto').
- GET /localidad/:nombre debe hacerse en dos pasos como indica agents.md (recintos de la localidad -> map de ids -> eventos con $in y fecha $gte new Date()).
- PUT /:id con findByIdAndUpdate, $set y { returnDocument: 'after', runValidators: true }.

Mismo formato de respuesta, códigos y mensajes exactos que en la tabla. No añadas todavía los endpoints de entradas.
```

---

## Prompt 5 – Endpoints de entradas

```
Siguiendo el apartado 5.3 de agents.md, añade al final de routes/eventos.js (antes del export) los dos endpoints de entradas:
- GET /entradas/:idEvento/:tipoEntrada -> devuelve en resultado un objeto { precio, disponibles }.
- PUT /entradas/:idEvento/:tipoEntrada/:cantidad -> resta la cantidad a las disponibles y guarda con evento.save().

Controla los casos de error indicados (evento o tipo de entrada inexistente, cantidad que no sea un entero positivo, o que no haya suficientes entradas disponibles) y usa exactamente los códigos y mensajes de la tabla, donde X es el idEvento.
No modifiques los endpoints que ya existen.
```

---

## Prompt 6 – Servidor principal

```
Siguiendo el apartado 6 de agents.md, crea index.js en la raíz del proyecto, en el orden indicado:
cargar dotenv/config, importar express, mongoose y los dos enrutadores, conectar con process.env.URL_BD, crear la app con express.json(), montar los enrutadores en /recintos y /eventos y arrancar el servidor en process.env.PORT || 8080.

Muestra un mensaje por consola al conectar con la base de datos y al arrancar el servidor. No crees el fichero .env (ya lo tengo creado yo).
```

---

## Prompt 7 – Fichero de pruebas

```
Crea un fichero pruebas.http para la extensión REST Client con una variable @baseUrl = http://localhost:8080 y peticiones de ejemplo para los 13 endpoints de agents.md.

Incluye, en este orden: crear dos recintos de localidades distintas, listarlos y buscarlos por id y por localidad; crear eventos (uno con fecha futura y otro pasada) con un array de entradas de tipos "VIP" y "General"; probar todos los GET, el PUT y los dos endpoints de entradas; y al final los DELETE.
Añade también algunas peticiones que provoquen errores (id inexistente, datos que no cumplen las validaciones, cantidad de entradas mayor que las disponibles). Donde haga falta un id, pon ID_RECINTO o ID_EVENTO para que yo lo sustituya.
```
