import { Hono } from "https://deno.land/x/hono@v3.11.11/mod.ts";

import { serveStatic } from "https://deno.land/x/hono@v3.11.11/middleware.ts"
import { streamSSE } from "https://deno.land/x/hono@v3.11.11/helper/streaming/index.ts"

const app = new Hono();
let i = 0;

app.get("/", serveStatic({path: "./index.html"}));

//Aqui estamos haciendo algo parecido a un socket pero no es bidireccional
//En este caso estamos haciendo un servidor de eventos que envia datos el servidor es (counter) pero el source envia los datos a "update"
//En el html podemos ver como dentro de <script> se hace un EventSource accediendo a /counter y escuchando el evento "update"
//El codigo de abajo lo que hace es enviar un mensaje cada segundo con la hora actual
app.get('/counter', (c) => {
    return streamSSE(c,async (stream) => {
        while(true){
        const message = `Son las ${new Date().toLocaleTimeString()}`;
        await stream.writeSSE({data: message, event: "update", id: String(i++) });
        await stream.sleep(1000);
    }
    })
})

Deno.serve(app.fetch);
