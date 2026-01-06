import { FILE_ASCII } from './ascii-art.js';

export const files = {
  "nota_bienvenida.txt": {
    content: "Bienvenido, sujeto. La puerta debería abrirse sola al despertar, pero suele atascarse. He dejando un código de anulación por si acaso. Buena suerte!",
    perms: {
      read: true,
      write: false,
      execute: false,
    },
  },
  "panel.exe": {
    content: "El panel muestra un teclado numérico para introducir un código.",
    perms: {
      read: true,
      write: false,
      execute: true,
    },
    run: () => {
      document.dispatchEvent(new CustomEvent("run_panel"));
    },
    asciiArt: FILE_ASCII.PANEL_EXE,

  },
  "calcetin_viejo.txt": {
    content: "Un calcetín viejo y sucio. ¿Dónde podría estar el otro?",
    perms: {
      read: true,
      write: false,
      execute: false,
    },
  },
  "trapo_sucio.txt": {
    content: "Un trozo de tela manchado.",
    perms: {
      read: true,
      write: false,
      execute: false,
    },
  },
  "papel_viejo.txt": {
    content: "Un trozo de papel desgastado. No puede leerse nada.",
    perms: {
      read: true,
      write: false,
      execute: false,
    },
  },
  "papel_desgastado.txt": {
    content: "Un papel muy deteriorado. No puede leerse nada.",
    perms: {
      read: true,
      write: false,
      execute: false,
    },
  },
  "herramienta_rota": {
    content: "Una herramienta con mucho uso. Está tan rota que no puede saberse qué es.",
    perms: {
      read: true,
      write: false,
      execute: false,
    },
  },
  "paquete_de_folios.zip": {
    content: "Un paquete de folios en blanco.",
    perms: {
      read: true,
      write: false,
      execute: false,
    },
  },
  "paquete_de_folios_abierto.zip": {
    content: "Un paquete de folios en blanco. Está abierto y faltan algunos.",
    perms: {
      read: true,
      write: false,
      execute: false,
    },
  },
  "roca.stl": {
    content: "¿Quién guardaría una roca aquí?",
    perms: {
      read: true,
      write: false,
      execute: false,
    },
  },
  "garabato.md": {
    content: "Un garabato de un gato. Hay una nota debajo que dice 'Mi número favorito al revés'.",
    perms: {
      read: true,
      write: false,
      execute: false,
    },
  },
  "herramienta": {
    content: "Una herramienta multiusos. Tiene una pequeña hoja, un destornillador y unas pinzas.",
    perms: {
      read: true,
      write: false,
      execute: false,
    },
  },
  "manual_usuario.pdf": {
    content: "Un manual de usuario para la herramienta multiusos. Explica cómo usar cada función.",
    perms: {
      read: true,
      write: false,
      execute: false,
    },
  },
  "post_it.txt": {
    content: "Cambiar el sistema de la puerta, no para de romperse.",
    perms: {
      read: true,
      write: false,
      execute: false,
    },
  },
  "uniforme.txt": {
    content: "Un uniforme de trabajo con el número 42 bordado en el pecho. Alguien le ha dibujado un corazón encima.",
    perms: {
      read: true,
      write: false,
      execute: false,
    },
  },
  "poster_1.psd": {
    content: "LA SEGURIDAD ES LO PRIMERO. Reporta cualquier anomalía.",
    perms: {
      read: true,
      write: false,
      execute: false,
    },
  },
  "nota_de_personal.txt": {
    content: "Les recordamos que por motivos de seguridad se ha activado el protocolo ECHO en la sección. A partir del día 33 deberán usar las nuevas contraseñas.",
    perms: {
      read: true,
      write: false,
      execute: false,
    },
  },
  "poster_2.psd": {
    content: "KEEP CALM AND FOLLOW THE RULES. Parece que hay algo escrito detrás.",
    perms: {
      read: true,
      write: true,
      execute: false,
    },
    moved: () => {
      document.dispatchEvent(new CustomEvent("poster_moved"))
      
    },
  },
  "keypad.exe": {
    content: "Un teclado numérico para introducir códigos.",
    perms: {
      read: true,
      write: false,
      execute: true,
    },
    run: () => {
      document.dispatchEvent(new CustomEvent("run_keypad"));
    },
  },
  "texto_en_pared.txt": {
    content: "Hay dos números casi borrados en la pared: 8 y 7",
    perms: {
      read: true,
      write: false,
      execute: false,
    },
  },
  "notas_de_investigacion.txt": {
    content: "Los códigos de emergencia para la sala de control se almacenan con el patrón 'ACCESO=[A-Za-z0-9]{8}'",
    perms: {
      read: true,
      write: false,
      execute: false,
    }
  },
  "consola.exe":{
    content: "Un teclado numérico para introducir códigos. Da acceso a la sala de Control.",
    perms: {
      read: true,
      write: false,
      execute: true,
    },
    run: () => {
      document.dispatchEvent(new CustomEvent("run_consola"));
    },
  },
  "estatua.obj": {
    content: "Una estatua de porcelana. Parece que hay algo debajo. Está muy agrietada y parece frágil.",
    perms: {
      read: true,
      write: true,
      execute: false,
    },
  },
  "boton-almacen":{
    content: "Un botón oculto debajo de la estatua. Tiene una marca que dice 'Almacén'.",
    perms: {
      read: true,
      write: false,
      execute: true,
    },
    run: () => {
      document.dispatchEvent(new CustomEvent("run_boton_almacen"));
    }
  },
  "nota_seguridad.txt":{
    content: "Recuerda recoger tu nueva tarjeta de seguridad del almacén. -Kev",
    perms: {
      read: true,
      write: false,
      execute: false,
    }
  },
  "tarjeta_seguridad.bin":{
    content: "Tarjeta de seguridad de nivel 2. Permite sobreescribir permisos",
    perms: {
      read: true,
      write: false,
      execute: false,
    }
  },
  "admin.pub":{
    content: "El archivo tiene escrita la clave de administrador. No se ha cambiado nunca, es 'admin'",
    perms: {
      read: true,
      write: false,
      execute: false,
    }
  },
  ".nota_borrosa.md":{
    content: "####idad### ### ###almacén #### ##admin ### #####",
    perms: {
      read: false,
      write: false,
      execute: false,
    }
  },
  ".servidor_1.bat":{
    content: "",
    perms: {
      read: true,
      write: false,
      execute: false,
    },
    run: () => {
      document.dispatchEvent(new CustomEvent("run_servidor1"));
    }
  },
  ".servidor_2.bat":{
    content: "",
    perms: {
      read: true,
      write: false,
      execute: false,
    },
    run: () => {
      document.dispatchEvent(new CustomEvent("run_servidor2"));
    }
  },
  ".servidor_3.bat":{
    content: "",
    perms: {
      read: true,
      write: false,
      execute: false,
    },
    run: () => {
      document.dispatchEvent(new CustomEvent("run_servidor3"));
    }
  },
  ".servidor_4.bat":{
    content: "",
    perms: {
      read: true,
      write: false,
      execute: false,
    },
    run: () => {
      document.dispatchEvent(new CustomEvent("run_servidor4"));
    }
  },
  "escaner_de_retina.exe":{
    content: "",
    perms: {
      read: true,
      write: false,
      execute: true,
    },
    run: () => {
      document.dispatchEvent(new CustomEvent("run_escaner"));
    }
  },
};