const { io } = require('../server');
const {Usuarios} = require('../clases/usuarios')
const usuarios = new Usuarios()
const {crearMensaje} = require('../utilidades/utilidades')
 
io.on('connection', (client) => {

  
    client.on('entrarChat',(usuario,callback)=>{

        
        if(!usuario.nombre||!usuario.sala){
            return callback({
                error:true,
                message:'El nombre/sala es obligatorio'
            })
        }

        client.join(usuario.sala)
        let personas = usuarios.agregarPersona(client.id,usuario.nombre,usuario.sala)
        client.broadcast.to(usuario.sala).emit('listaPersonas',usuarios.getPersonas())
        callback(usuarios.getPersonasPorSala(usuario.sala));


        console.log(usuario);

    });
    client.on('crearMensaje',(data)=>{
        let persona= usuarios.getPersona(client.id);
        let mensaje = crearMensaje(persona,data.mensaje)
        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje)
    });


    client.on('disconnect',()=>{
        let personaBorrada = usuarios.borrarPersona(client.id)
        client.broadcast.to(personaBorrada.sala).emit('crearMensaje',crearMensaje('Administrador',`${personaBorrada.nombre}salio`))
        client.broadcast.to(personaBorrada.sala).emit('listaPersonas',usuarios.getPersonasPorSala(personaBorrada.sala))

    })
    //Mensajes pRIVADO
    client.on('mensajePrivado',data=>{
        let persona = usuarios.getPersona(client.id)
        client.broadcast.to(data.para).emit('mensajePrivado',crearMensaje(persona.nombre,data.mensaje ))
    })

});