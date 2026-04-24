# Documentación API - Cotizaciones

## Nuevas Funcionalidades Implementadas

### 1. Cambiar Estado de Cotización

**Endpoint:** `PUT /api/cotizacion/estado`

**Descripción:** Permite cambiar el campo `estado` de una cotización específica.

**Estados permitidos:**
- `Enviada`
- `en seguimiento`  
- `cierre`
- `perdida`
- `sin respuesta`

**Ejemplo de uso:**

```javascript
// Solicitud
const response = await fetch('/api/cotizacion/estado', {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        cotizacionId: 5,
        estado: "en seguimiento"
    })
});

// Respuesta exitosa (200)
{
    "msg": "Estado actualizado con éxito."
}
```

**Parámetros requeridos:**
- `cotizacionId` (number): ID de la cotización a actualizar
- `estado` (string): Nuevo estado de la cotización

---

### 2. Agregar Nota a Cotización

**Endpoint:** `POST /api/cotizacion/notes/add`

**Descripción:** Permite agregar una nota asociada a una cotización específica.

**Ejemplo de uso:**

```javascript
// Solicitud
const response = await fetch('/api/cotizacion/notes/add', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        cotizacionId: 5,
        note: "El cliente solicitó revisión de precios para el próximo mes.",
        imagen: "https://ejemplo.com/imagen.jpg", // Opcional
        estado: "guardado" // Opcional, por defecto "guardado"
    })
});

// Respuesta exitosa (201)
{
    "id": 23,
    "note": "El cliente solicitó revisión de precios para el próximo mes.",
    "imagen": "https://ejemplo.com/imagen.jpg",
    "estado": "guardado",
    "cotizacionId": 5,
    "createdAt": "2026-04-22T10:30:00.000Z",
    "updatedAt": "2026-04-22T10:30:00.000Z"
}
```

**Parámetros:**
- `cotizacionId` (number) - **Requerido**: ID de la cotización
- `note` (string) - **Requerido**: Contenido de la nota
- `imagen` (string) - **Opcional**: URL o texto de imagen asociada
- `estado` (string) - **Opcional**: Estado de la nota (por defecto: "guardado")

**Estados de nota permitidos:**
- `guardado`
- `Editado`
- `Eliminado`

---

## Ejemplos de Integración

### Ejemplo Frontend - Cambiar Estado

```javascript
async function cambiarEstadoCotizacion(cotizacionId, nuevoEstado) {
    try {
        const response = await fetch('/api/cotizacion/estado', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cotizacionId: cotizacionId,
                estado: nuevoEstado
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('Estado actualizado:', data.msg);
            return data;
        } else {
            console.error('Error:', data.msg);
            throw new Error(data.msg);
        }
    } catch (error) {
        console.error('Error al cambiar estado:', error);
        throw error;
    }
}

// Uso
cambiarEstadoCotizacion(5, "cierre")
    .then(() => console.log('¡Estado cambiado exitosamente!'))
    .catch(error => console.error('Error:', error));
```

### Ejemplo Frontend - Agregar Nota

```javascript
async function agregarNotaCotizacion(cotizacionId, nota, imagen = null) {
    try {
        const response = await fetch('/api/cotizacion/notes/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cotizacionId: cotizacionId,
                note: nota,
                imagen: imagen,
                estado: "guardado"
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('Nota agregada:', data);
            return data;
        } else {
            console.error('Error:', data.msg);
            throw new Error(data.msg);
        }
    } catch (error) {
        console.error('Error al agregar nota:', error);
        throw error;
    }
}

// Uso
agregarNotaCotizacion(5, "Cliente muy interesado, programar seguimiento")
    .then(nota => console.log('Nota creada con ID:', nota.id))
    .catch(error => console.error('Error:', error));
```

---

## Códigos de Respuesta

### Cambiar Estado
- `200` - Estado actualizado correctamente
- `400` - Parámetros inválidos o faltantes
- `502` - Error al actualizar en la base de datos
- `500` - Error interno del servidor

### Agregar Nota
- `201` - Nota creada correctamente
- `400` - Parámetros inválidos o faltantes
- `404` - Cotización no encontrada
- `502` - Error al crear la nota en la base de datos
- `500` - Error interno del servidor

---

## Estructura de Base de Datos

### Tabla `cotizacion`
```javascript
{
    id: number,
    name: string,
    nit: string,
    nro: string,
    fecha: Date,
    fechaAprobada: Date,
    bruto: string,
    descuento: number,
    iva: number,
    neto: string,
    state: string, // Activa, Aprobada, Perdida, Aplazada, desarrollando
    estado: string // Enviada, en seguimiento, cierre, perdida, sin respuesta
}
```

### Tabla `noteCotizacion`
```javascript
{
    id: number,
    note: text,
    imagen: text,
    estado: string, // guardado, Editado, Eliminado
    cotizacionId: number // FK hacia cotizacion
}
```

---

## Notas Importantes

1. **Validación**: Ambos endpoints validan que la cotización exista antes de realizar operaciones.

2. **Campos estado**: No confundir `state` (estado del proceso de cotización) con `estado` (estado de seguimiento comercial).

3. **Relaciones**: Las notas están relacionadas con cotizaciones mediante `cotizacionId` como clave foránea.

4. **Endpoint existente**: Para obtener las notas de una cotización, usar el endpoint ya existente:
   `GET /api/cotizacion/getNotes/notes/:cotizacionId`