const express = require('express');
const { client, user, call, visita, cotizacion, calendary } = require('../db/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { addNoteServices } = require('./services/notesServices');
const { Resend } = require("resend");

// CONTROLADORES DEL CALENDARIO
// obtenemos los datos del calendario
const getAllCalendary = async(req, res) => {
    try{
        // Buscamos registros
        const { userId }= req.params;

        if(!userId) return res.status(501).json({msg: 'Ha ocurrido un error en la principal.'});
        // Caso contrario, avanzamos

        const searchUser = await user.findByPk(userId).catch(err => null);
        if(!searchUser) return res.status(404).json({msg: 'No existe.'});
        // caso contrario

        if(searchUser.rango == 'lider'){
            const searchCalendar = await calendary.findAll({
                include:[{
                    model: user, required:false
                }, {model:client, required:true}, {model: call,required:false}, {model:visita,required:false}, {model:cotizacion, required:false}]
            }).catch(err => {
                console.log(err);
                return null;
            });
    
            if(!searchCalendar || !searchCalendar.length) return res.status(404).json({msg: 'No hemos encontrado resultados.'});
            // Caso contrario, respondemos
            return res.status(200).json(searchCalendar);
        }else if(searchUser.rango == 'asesor'){
            const searchCalendar = await calendary.findAll({
                where: {
                    userId: searchUser.id

                },
                include:[{
                    model: user, required:false
                }, {model:client, required:true}, {model: call,required:false}, {model:visita,required:false}, {model:cotizacion, required:false}]
            }).catch(err => {
                console.log(err);
                return null;
            });
    
            if(!searchCalendar || !searchCalendar.length) return res.status(404).json({msg: 'No hemos encontrado resultados.'});
            // Caso contrario, respondemos
            return res.status(200).json(searchCalendar);
        }
        

    }catch(err){
        console.log(err);
        res.status(500).json({msg:'Ha ocurrido un error en la principal.'});
    }
}

// CREAR EVENTO EN EL CALENDARIO
const newEvent = async (req, res) => {
    try{
        // Recibimos todos los datos por body
        const { userId, clientId, callId, visitaId, prospectoId, cotizacionId,  
        contacto, prospectos, tags, type, caso, note, time, hour, extra, state } = req.body;

        // Validamos los datos necesarios.
        if(!note || !type || !time || !hour ) return res.status(501).json({msg:'Parametros invalidos.'});
        // Caso contrario, avanzamos...
        
        const addEvento = await calendary.create({
            type: type,
            prospectos, // aplica si es en prospecto
            contacto, // Aplica si en contacto
            case: caso, // Aplica si es en contacto o prospecto
            note,
            time,
            hour,
            extra: extra, // Aplica si esta en espera o en perdido.
            callId,
            clientId,
            prospectoId,
            visitumId: visitaId,
            cotizacionId,
            userId,
            state: 'active' // Hay momentos, donde se crea un registro en calendario, pero en Cumplido
        })
        .then(async (result) => {
            // type, contacto, prospecto, tags, note, extra, manual, userId, clientId, callId, visitaId, prospectId, calendaryId,
            const addRegister = await addNoteServices(type, contacto, prospectos, tags, note, extra, 'automatico', userId, clientId, callId, visitaId, prospectoId, result.id)
            if(addRegister == 404){
                return null
            }else{
                return result
            }
        })
        .catch(err =>{
            console.log(err);
            return null;
        });

        if(!addEvento) return res.status(404).json({msg: 'No hemos podido crear esto.'});
        // Caso contrario, enviamos el registro
        res.status(200).json(addEvento);
        
    }catch(err) {
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'})
    }
}
const getCalendary = async (req, res) => {
    try{
        // Consultamos todo.
        const searchClient = await client.findAll({
            where: {
                state: 'active'
            }
        }).catch(err => {
            console.log(err);
            return null;
        });

        if(!searchClient || !searchClient.length) return res.status(404).json({msg:'Sin resultados.'});
        // Caso contrario, enviamos resultados.

        res.status(200).json(searchClient)

    }catch(err) {
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'})
    }
}

const updateCalendary = async (req, res) => {
    try{
        // Recibimos datos por body
        const {note, time, hour, calendaryId} = req.body;

        const updateCalendary = await calendary.update({
            note,
            time,
            hour,
        }, {
            where: {
                id: calendaryId
            }
        })
        .then(async (result) => {
            const searchCal = await calendary.findByPk(calendaryId,{
                include:[{
                    model: user
                }, {model:client}, {model: call}, {model:visita}, {model:cotizacion}]
            })
            .catch(err => null)

            if(!searchCal) return null
            return searchCal
        })
        .catch(err => {
            console.log(err);
            return;
        })

        if(!updateCalendary) return res.status(502).json({msg: 'No hemos logrado actualizar esto.'});
        // Caso contrario, avanzamos
        res.status(200).json(updateCalendary)
    }catch(err){
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'});
    }
}
// ENVIAR EMAIL
const sendEmaiToTalentoHumano = async (req, res) => {
    const { cliente, direccion, fecha, asesor, transporte, de, a, emailAsesor } = req.body;

    const resend = new Resend('re_WZFbbnSx_Ez81TDShYs3tnroMNyfUbFgM');
 
    const sendEmail  = await resend.emails.send({
        from: 'CRM - Área comercial <areacomercial@noahdigital.com.co>',
        to: ["kabo200127@gmail.com", `${emailAsesor}`],
        subject: "Informe de visita de asesor",
        html: `
        <html>
            <div style="background-color:white; ">
                <div style="">
                    <img src="https://www.metalicascosta.com.co/assets/img/logo_metalicas_costa.png">
                </div><br >

                <div>
                    <p>
                    Cordial saludo  
                    </p>
                </div>
                <div>
                    <br /><br />
                    <span>
                    Se informa que el asesor <strong>${asesor}</strong> tiene programada una reunión de manera presencial con el cliente ${cliente}. <br ><br>
                    Lugar reunión: ${direccion} 
                    Fecha reunión: ${fecha}.

                    Horario de visita al cliente:
                    De: ${de} a ${a}

                    Metódo de transporte: ${transporte}

                    Atentamente;
                    Área comercial
                    </span>
                </div>
            </div>
        </html>
        `,
    })
    .catch(err => {
        console.log(err);
        return null
    });
    console.log(sendEmail)
    // Si no envia, enviamos este error
    if(!sendEmail) return res.status(400).json({msg: 'No hemos logrado enviar este correo'});

    res.status(200).json({msg: 'Finalizó'}) 
}

module.exports = {
    getAllCalendary,
    getCalendary,
    newEvent,
    updateCalendary,
    sendEmaiToTalentoHumano
}