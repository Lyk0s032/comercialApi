const { dataProspect, prospecto } = require('../../db/db');

// ─────────────────────────────────────────────────
// CREAR registro dataProspect para un prospecto
// ─────────────────────────────────────────────────
const createDataProspectService = async (prospectoId, fields = {}) => {
    try {
        if (!prospectoId) return 501;

        // Verificamos que el prospecto exista
        const existProspecto = await prospecto.findByPk(prospectoId).catch(() => null);
        if (!existProspecto) return 404;

        // Verificamos que no haya ya un dataProspect para este prospectoId
        const existing = await dataProspect.findOne({ where: { prospectoId } }).catch(() => null);
        if (existing) return 409; // Conflicto: ya existe

        const {
            categoria,
            categoriaProducto,
            venta,
            cotizado,
            valorCotizado,
            asesorAsignado,
            motivoDescripcion,
        } = fields;

        const newData = await dataProspect.create({
            prospectoId,
            categoria:          categoria          ?? null,
            categoriaProducto:  categoriaProducto  ?? null,
            venta:              venta              ?? null,
            cotizado:           cotizado           ?? null,
            valorCotizado:      valorCotizado      ?? null,
            asesorAsignado:     asesorAsignado     ?? null,
            motivoDescripcion:  motivoDescripcion  ?? null,
            state: 'active',
        }).catch(err => {
            console.error('[dataProspectService] createDataProspectService:', err);
            return null;
        });

        if (!newData) return 502;
        return newData;

    } catch (err) {
        console.error('[dataProspectService] createDataProspectService:', err);
        return 500;
    }
};

// ─────────────────────────────────────────────────
// OBTENER dataProspect por prospectoId
// ─────────────────────────────────────────────────
const getDataProspectService = async (prospectoId) => {
    try {
        if (!prospectoId) return 501;

        const data = await dataProspect.findOne({
            where: { prospectoId },
            include: [{ model: prospecto }],
        }).catch(err => {
            console.error('[dataProspectService] getDataProspectService:', err);
            return null;
        });

        if (!data) return 404;
        return data;

    } catch (err) {
        console.error('[dataProspectService] getDataProspectService:', err);
        return 500;
    }
};

// ─────────────────────────────────────────────────────────────────────
// ACTUALIZAR uno o varios campos de dataProspect (campo por campo / PATCH)
// Solo se actualizan los campos que vienen en el body — el resto se ignora.
// ─────────────────────────────────────────────────────────────────────
const updateDataProspectFieldService = async (prospectoId, fields = {}) => {
    try {
        if (!prospectoId) return 501;

        // Campos permitidos para actualizar
        const ALLOWED_FIELDS = [
            'categoria',
            'categoriaProducto',
            'venta',
            'cotizado',
            'valorCotizado',
            'asesorAsignado',
            'motivoDescripcion',
            'state',
        ];

        // Filtramos solo los campos que vienen y son permitidos
        const updatePayload = {};
        ALLOWED_FIELDS.forEach(field => {
            if (fields[field] !== undefined) {
                updatePayload[field] = fields[field];
            }
        });

        if (Object.keys(updatePayload).length === 0) return 400; // Nada para actualizar

        // Verificamos que exista el registro
        const existing = await dataProspect.findOne({ where: { prospectoId } }).catch(() => null);
        if (!existing) return 404;

        const [affectedRows] = await dataProspect.update(updatePayload, {
            where: { prospectoId },
        }).catch(err => {
            console.error('[dataProspectService] updateDataProspectFieldService:', err);
            return [0];
        });

        if (affectedRows === 0) return 502;
        return 200;

    } catch (err) {
        console.error('[dataProspectService] updateDataProspectFieldService:', err);
        return 500;
    }
};

module.exports = {
    createDataProspectService,
    getDataProspectService,
    updateDataProspectFieldService,
};
