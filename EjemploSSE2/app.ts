import { Hono } from "https://deno.land/x/hono@v3.11.11/mod.ts";

import { serveStatic } from "https://deno.land/x/hono@v3.11.11/middleware.ts"
import { streamSSE } from "https://deno.land/x/hono@v3.11.11/helper/streaming/index.ts"
import { decodeBase64 } from "https://deno.land/x/hono@v3.11.11/utils/encode.ts";

const app = new Hono();
const db = await Deno.openKv();
let i = 0;

app.get("/", serveStatic({path: "./index.html"}));


//Server Events (no es como un socket!!) es unidireccional
//Aqui estamos haciendo algo parecido a un socket pero no es bidireccional
//En este caso estamos haciendo un servidor de eventos que envia datos el servidor es (counter) pero el source envia los datos a "update"
//En el html podemos ver como dentro de <script> se hace un EventSource accediendo a /counter y escuchando el evento "update"
//El codigo de abajo lo que hace es enviar un mensaje cada segundo con la hora actual
app.get('/counter', (c) => {
    return streamSSE(c,async (stream) => {
        // ------------------------ CON OBSERVADOR -----------------------------
        const visitsKey = ["visits"];
        const listOfKeysToWatch = [visitsKey];
        const watcher = await db.watch(listOfKeysToWatch);

        //Cada vez que el watcher detecte un cambio en la base de datos, se ejecutara el codigo de abajo
        for await (const entry of watcher) {
            const { value } = entry[0];
            if (entry !== null ){
                await stream.writeSSE({data: Number(value).toString(), event: "update", id: String(i++) });
            }
        }


        // ------------------------ SIN OBSERVADOR -----------------------------
        // while(true){

        //     // -- mostramos el contador de visitas --
        //     const { value } = await db.get(["visits"]);
        //     await stream.writeSSE({data: Number(value).toString(), event: "update", id: String(i++) });
        //     await stream.sleep(1000);
        //     // para aumentar el contador hacemos curl -X POST localhost:8000/counter
        //     // pero de esta forma estamos enviando informacion cada segundo, lo cual no tiene sentido en una aplicación real



        //     // const message = `Son las ${new Date().toLocaleTimeString()}`;
        //     // await stream.writeSSE({data: message, event: "update", id: String(i++) });
        //     // await stream.sleep(1000);
        // }
        // -------------------------------------------------------------------
    })
})


app.post('/counter', async (c) => {
    await db.atomic().sum(["visits"], 1n).commit()
    return c.json({message: "ok"})
})

Deno.serve(app.fetch);
