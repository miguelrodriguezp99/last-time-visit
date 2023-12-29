ejecutamos con esta linea de comando:
```
deno run --unstable --allow-net  --allow-read --watch app.ts
```

El programa consiste en que estamos haciendo algo parecido a un socket pero no es bidireccional
En este caso estamos haciendo un servidor de eventos que envia datos el servidor es (counter) pero el source envia los datos a "update"
En el html podemos ver como dentro de <script/> se hace un EventSource accediendo a /counter y escuchando el evento "update"
El codigo de abajo lo que hace es enviar un mensaje cada segundo con la hora actual