// ══════════════════════════════════════════════════════════════════
//  dataProspectController.js
//  Controladores para el registro de datos adicionales del prospecto.
//
//  El usuario puede llenar esta información de forma gradual,
//  campo por campo, sin necesidad de enviar todo de una sola vez.
// ══════════════════════════════════════════════════════════════════

const {
    createDataProspectService,
    getDataProspectService,
    updateDataProspectFieldService,
} = require('./services/dataProspectService');


// ─────────────────────────────────────────────────────────────────
// POST /data-prospect/create
// Crea el registro dataProspect asociado a un prospecto.
// Body obligatorio: prospectoId
// Body opcional:    categoria, categoriaProducto, venta, cotizado,
//                   valorCotizado, asesorAsignado, motivoDescripcion
// ─────────────────────────────────────────────────────────────────
const createDataProspect = async (req, res) => {
    try {
        const {
            prospectoId,
            categoria,
            categoriaProducto,
            venta,
            cotizado,
            valorCotizado,
            asesorAsignado,
            motivoDescripcion,
        } = req.body;

        // Validación mínima
        if (!prospectoId) {
            return res.status(400).json({ msg: 'El campo prospectoId es obligatorio.' });
        }

        const result = await createDataProspectService(prospectoId, {
            categoria,
            categoriaProducto,
            venta,
            cotizado,
            valorCotizado,
            asesorAsignado,
            motivoDescripcion,
        });

        if (result === 404) return res.status(404).json({ msg: 'Prospecto no encontrado.' });
        if (result === 409) return res.status(409).json({ msg: 'Ya existe un registro de datos para este prospecto.' });
        if (result === 502 || result === 500) return res.status(500).json({ msg: 'No se pudo crear el registro.' });

        return res.status(201).json(result);

    } catch (err) {
        console.error('[dataProspectController] createDataProspect:', err);
        return res.status(500).json({ msg: 'Error interno del servidor.' });
    }
};


// ─────────────────────────────────────────────────────────────────
// GET /data-prospect/:prospectoId
// Obtiene el dataProspect de un prospecto (incluye datos del prospecto).
// ─────────────────────────────────────────────────────────────────
const getDataProspect = async (req, res) => {
    try {
        const { prospectoId } = req.params;

        if (!prospectoId) {
            return res.status(400).json({ msg: 'prospectoId es obligatorio.' });
        }

        const result = await getDataProspectService(prospectoId);

        if (result === 404) return res.status(404).json({ msg: 'No se encontró registro de datos para este prospecto.' });
        if (result === 500 || result === 502) return res.status(500).json({ msg: 'Error al obtener el registro.' });

        return res.status(200).json(result);

    } catch (err) {
        console.error('[dataProspectController] getDataProspect:', err);
        return res.status(500).json({ msg: 'Error interno del servidor.' });
    }
};


// ─────────────────────────────────────────────────────────────────
// PATCH /data-prospect/update/:prospectoId
// Actualiza uno o varios campos del dataProspect de forma parcial.
// El usuario puede enviar solo el campo que desea actualizar.
//
// Ejemplo de body:   { "categoria": "Tecnología" }
// Otro ejemplo:      { "cotizado": true, "valorCotizado": "1500000" }
// ─────────────────────────────────────────────────────────────────
const updateDataProspectField = async (req, res) => {
    try {
        const { prospectoId } = req.params;

        if (!prospectoId) {
            return res.status(400).json({ msg: 'prospectoId es obligatorio.' });
        }

        // Tomamos todo lo que llegue en el body como campos a actualizar
        const fields = req.body;

        if (!fields || Object.keys(fields).length === 0) {
            return res.status(400).json({ msg: 'Debes enviar al menos un campo para actualizar.' });
        }

        const result = await updateDataProspectFieldService(prospectoId, fields);

        if (result === 400) return res.status(400).json({ msg: 'No se enviaron campos válidos para actualizar.' });
        if (result === 404) return res.status(404).json({ msg: 'No existe un registro de datos para este prospecto.' });
        if (result === 502 || result === 500) return res.status(500).json({ msg: 'No se pudo actualizar el registro.' });

        return res.status(200).json({ msg: 'Registro actualizado con éxito.' });

    } catch (err) {
        console.error('[dataProspectController] updateDataProspectField:', err);
        return res.status(500).json({ msg: 'Error interno del servidor.' });
    }
};


module.exports = {
    createDataProspect,
    getDataProspect,
    updateDataProspectField,
};
