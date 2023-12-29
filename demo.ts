//conexion a base de datos de deno
const db = await Deno.openKv();

const user = 'miguel'
//Guardo en base de datos el usuario con la key username
await db.set(["username"], user)
const username = await db.get(["username"])
console.log(username)

// ------ incremento de counter ------
const { value } = await db.get<number>(["counter"])
const newCounter = value == null ? 0 : value + 1;
const result = await db.set(["counter"], newCounter)
console.log(result)

// ------- mejor forma de incrementar counter ------
//await db.set(["visits"], new Deno.KvU64(0n)) // 0n es un bigint
//Hacemos una transaccion atomica para incrementar el valor de visits en 1
await db
    .atomic()
    .sum(["visits"], 1n)
    .commit()

const visitResult = await db.get<Deno.KvU64>(["visits"])

console.log(visitResult)