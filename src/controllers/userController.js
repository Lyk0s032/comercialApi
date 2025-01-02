const express = require('express');
const { client, user, contact } = require('../db/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// CONTROLADORES DEL CLIENTE

const getUserById = async (req, res) => {
    try{
        // Recibimos por params
        const { id } = req.params;

        // Consultamos todo.
        const searchUser = await user.findByPk(id).catch(err => {
            console.log(err);
            return null;
        });

        if(!searchUser || !searchUser.length) return res.status(404).json({msg:'No hemos encontrado este usuario.'});
        // Caso contrario, enviamos resultados.
        res.status(200).json(searchUser)
    }catch(err) {
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'})
    }
}
// CREAR USUARIO
const createUser = async (req, res) => {
    try{
        // Recibo toda la informacion por body
        const { name, lastName, nick, phone, email, password, photo, age, rango} = req.body; 
        // Validamos que entren los datos necesarios
        if(!name || !lastName || !nick || !phone || !password || !rango) res.status(501).json({msg: 'Parametros no validos.'});

        // caso contrario, creamos el cliente.
        const createUsuario = await user.create({
            name,
            lastName,
            nick,
            phone,
            email,
            password,
            photo,
            age,
            rango,
            state: 'active'
        }).catch(err => {
            console.log(err);
            return null;
        });

        if(!createUsuario) return res.status(502).json({msg: 'No hemos podido crear este cliente.'});
        // Caso contrario, enviamos respuesta.
        res.status(201).json(createUsuario);

    }catch(err ){
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'})
    }
}

// CREAMOS FUNCION PARA OBTENER TODOS LOS REGISTROS GENERALES DENTRO DEL EMBUDO
const systemFunctionEmbudo = async (req, res) => {
    try{
        // Recibimos datos por body
        const { range } = req.body;
        // Valiamos que los parametros sean los correctos.
        if(!range) return res.status(500).json({msg: 'Parametros no son validos.'});

        // Caso contrario, avanzamos..
        

        // Entregamos resultado.
        res.status(200).json({msg: 'Resultado'})

    }catch(err){
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la princiapal.'})
    }
}

module.exports = {
    getUserById,
    createUser
}