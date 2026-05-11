# Documentación API — Doings (tareas / pendientes)

Los endpoints viven bajo el mismo router de cotizaciones. El prefijo global de la aplicación es **`/api`** y el de este módulo **`/cotizacion`**, por lo que todas las rutas de doing quedan como:

**Base:** `{BASE_URL}/api/cotizacion/doing/...`

Sustituye `{BASE_URL}` por tu host (por ejemplo `https://tu-servidor.com` o `http://localhost:PUERTO`).

---

## Resumen rápido

| Acción              | Método | Ruta                                                  |
|---------------------|--------|-------------------------------------------------------|
| Crear doing         | POST   | `/api/cotizacion/doing`                               |
| Cambiar estado      | PUT    | `/api/cotizacion/doing/state`                         |
| Listar pendientes   | GET    | `/api/cotizacion/doing/pendientes/:userId`           |

---

## Modelo conceptual

Cada **doing** está asociado a un usuario (`userId`). Campos principales:

- **name** — Título del doing.
- **description** — Detalle opcional.
- **state** — `pendiente` o `cumplida` (el servidor normaliza mayúsculas/minúsculas; se guarda en minúsculas).
- **fechaCumplido** — La API la rellena al pasar el estado a `cumplida`; se borra (`null`) al volver a `pendiente`.

---

## 1. Crear doing

**Endpoint:** `POST /api/cotizacion/doing`

**Descripción:** Crea un registro asociado a un usuario. Si no envías `state`, queda **`pendiente`**. Si creas ya en **`cumplida`**, se asigna **`fechaCumplido`** automáticamente.

**Ejemplo:**

```javascript
const response = await fetch('/api/cotizacion/doing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        name: 'Seguir cotización ABC',
        description: 'Cliente pidió cotización técnica',
        userId: 12,
        // state opcional: "pendiente" | "cumplida"
    })
});

const data = await response.json();
```

**Respuesta exitosa (`201`):** objeto del doing creado (incluye `id`, `userId`, `createdAt`, etc.).

**Parámetros (body JSON):**

| Campo           | Obligatorio | Descripción                                                |
|-----------------|------------|------------------------------------------------------------|
| `name`          | Sí          | Nombre del doing.                                           |
| `userId`        | Sí          | ID del usuario propietario.                                 |
| `description`   | No          | Texto largo opcional.                                      |
| `state`         | No          | `pendiente` o `cumplida` (variantes tipo `Pendiente` válidas por normalización al guardar). |

---

## 2. Cambiar estado del doing

**Endpoint:** `PUT /api/cotizacion/doing/state`

**Descripción:** Actualiza el `state`. Al pasar a **`cumplida`**, **`fechaCumplido`** se actualiza al momento actual. Si vuelves a **`pendiente`**, **`fechaCumplido`** queda `null`.

**Ejemplo:**

```javascript
const response = await fetch('/api/cotizacion/doing/state', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        doingId: 5,
        state: 'cumplida'
    })
});

const updated = await response.json();
```

**Respuesta exitosa (`200`):** objeto actualizado del doing.

**Parámetros (body JSON):**

| Campo      | Obligatorio | Descripción                                      |
|------------|------------|--------------------------------------------------|
| `doingId`  | Sí          | ID del registro doing.                           |
| `state`    | Sí          | Solo valores normalizados: `pendiente` o `cumplida`. Otros valores devuelven `400`. |

---

## 3. Listar doings pendientes por usuario

**Endpoint:** `GET /api/cotizacion/doing/pendientes/:userId`

**Descripción:** Devuelve todos los doings del usuario con estado pendiente (búsqueda **insensible** a mayúsculas/minúsculas sobre `pendiente`). Orden: más recientes primero (`createdAt` descendente).

**Ejemplo:**

```javascript
const userId = 12;
const response = await fetch(`/api/cotizacion/doing/pendientes/${userId}`, {
    method: 'GET'
});

const pendientes = await response.json();
// Si no hay datos: []
```

**Respuesta exitosa (`200`):** array de doings (puede ser vacío `[]`).

---

## Ejemplo de integración (frontend)

```javascript
async function crearDoing({ name, userId, description, state }) {
    const res = await fetch('/api/cotizacion/doing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, userId, description, state })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || 'Error al crear doing');
    return data;
}

async function marcarCumplido(doingId) {
    const res = await fetch('/api/cotizacion/doing/state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doingId, state: 'cumplida' })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || 'Error al actualizar');
    return data;
}

async function listarPendientes(userId) {
    const res = await fetch(`/api/cotizacion/doing/pendientes/${userId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || 'Error al listar');
    return data;
}
```

---

## Códigos HTTP y mensajes típicos

### Crear doing (`POST /doing`)

| Código | Significado habitual |
|--------|----------------------|
| `201`  | Creado correctamente. |
| `400`  | Faltan `name` o `userId` (mensaje: *Los parámetros no son válidos.*). |
| `404`  | Usuario no existe (*No hemos encontrado este usuario.*). |
| `502`  | Fallo persistiendo (*No hemos logrado crear esto.*). |
| `500`  | Error genérico del servidor. |

### Cambiar estado (`PUT /doing/state`)

| Código | Significado habitual |
|--------|----------------------|
| `200`  | Actualización correctamente; body = doing actualizado. |
| `400`  | Faltan parámetros o `state` no es `pendiente`/`cumplida`. |
| `404`  | Doing no existe. |
| `502`  | Error al guardar en base de datos. |
| `500`  | Error genérico del servidor. |

### Listar pendientes (`GET /doing/pendientes/:userId`)

| Código | Significado habitual |
|--------|----------------------|
| `200`  | Lista obtenida (array, posiblemente vacío). |
| `404`  | Usuario no encontrado. |
| `502`  | Fallo consultando datos. |
| `500`  | Error genérico del servidor. |

---

## Relación con la base de datos

En Sequelize, el modelo **`doing`** pertenece a **`user`** mediante **`userId`** (`user.hasMany(doing)` / `doing.belongsTo(user)`). Los campos del modelo incluyen al menos:

- `name`, `description`, `fechaCumplido`, `state`, y por asociación `userId`.

---

## Documentación relacionada

Otras rutas del mismo recurso cotización (notas, estados comerciales, etc.) están descritas en **`COTIZACION_API_DOCS.md`** en este repositorio.
