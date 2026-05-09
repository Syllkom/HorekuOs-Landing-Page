# HorekuOs-Base

## Sinopsis

Framework modular para bots de WhatsApp construido sobre `@whiskeysockets/baileys`. Implementa una arquitectura **Event-Driven** con aislamiento de procesos mediante `child_process.fork()`. El sistema de plugins utiliza **hot-reload** vía `chokidar`, persistencia JSON con escritura diferida (debounced writes), y un pipeline de procesamiento de mensajes basado en **handlers encadenados**. Requiere Node.js ≥18.x con soporte ESM nativo.

---

## Tabla de Contenidos

- [Visión General](#visión-general)
- [Requisitos y Dependencias](#requisitos-y-dependencias)
- [Instalación y Configuración](#instalación-y-configuración)
- [Arquitectura y Lógica](#arquitectura-y-lógica)
  - [Diagrama de Flujo](#diagrama-de-flujo)
  - [Estructura de Directorios](#estructura-de-directorios)
  - [Disponibilidad de Propiedades por Index](#disponibilidad-de-propiedades-por-index)
- [Referencia de API](#referencia-de-api)
  - [Core Modules](#core-modules)
  - [Library Modules](#library-modules)
  - [Objeto `m` (Message Context)](#objeto-m-message-context)
- [Sistema de Plugins](#sistema-de-plugins)
  - [Taxonomía de Plugins](#taxonomía-de-plugins)
  - [Ciclo de Vida](#ciclo-de-vida)
  - [Estructura de un Plugin](#estructura-de-un-plugin)
  - [Sistema de Consulta](#sistema-de-consulta)
  - [Exportación entre Plugins](#exportación-entre-plugins)
  - [ReplyHandler](#replyhandler-flujos-conversacionales)
- [Ejemplos de Uso](#ejemplos-de-uso)
  - [Ejemplos Básicos](#ejemplo-1-comando-con-verificación-de-roles)
  - [Sistema de Economía Completo](#ejemplo-5-sistema-de-economía-completo)
- [Edge Cases y Consideraciones](#edge-cases-y-consideraciones)
- [Apéndices](#apéndices)
  - [Apéndice A: Eventos StubType](#apéndice-a-eventos-stubtype)
  - [Apéndice B: Variables Globales](#apéndice-b-variables-globales)

---

## Visión General

### Características Principales
- **Hyper-DB v3 (LMDB)**: Base de datos nativa ultrarrápida impulsada por LMDB, con serialización V8, Memory Arenas y persistencia transparente mediante Proxies Dinámicos (Zero-config saves).
- **Hot-reload**: Los plugins se recargan al guardar, sin reiniciar el bot.
- **Objeto `m` unificado**: Acceso normalizado a mensaje, remitente, chat y contenido.
- **Sistema de roles**: root, owner, mod, vip, admin (configurable).
- **Flujos conversacionales**: ReplyHandler para interacciones multi-paso con guardado automático en BD.
- **Aislamiento de procesos**: El bot corre en proceso hijo (`child_process.fork()`) con reconexión automática.

### Casos de Uso

| Tipo | Ejemplo |
|------|---------|
| Moderación | Anti-spam, anti-links, bienvenidas automáticas |
| Utilidades | Stickers, descargas, conversiones |
| Juegos/Economía | Sistemas de puntos, tiendas virtuales, rankings |
| Integración | APIs externas, webhooks, notificaciones |

---

## Requisitos y Dependencias

### Runtime

| Requisito | Versión Mínima |
|-----------|----------------|
| Node.js   | 18.x LTS       |
| npm       | 9.x            |

### Dependencias Principales

```json
{
  "@whiskeysockets/baileys": "^7.0.0-rc.8",
  "chokidar": "^4.0.1",
  "@hapi/boom": "^10.0.1",
  "pino": "9.1.0",
  "chalk": "^5.3.0",
  "dotenv": "^17.0.0",
  "lodash": "^4.17.21",
  "moment-timezone": "^0.5.43"
}
```

### Variables de Entorno

Crear archivo `.env` en la raíz:

```bash
GOOGLE_API_KEY=tu_api_key_aqui  # Opcional: para integraciones con Google AI
```

---

## Instalación y Configuración

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/Syllkom/HorekuOs
cd HorekuOs-Base
npm install
```

### 2. Configurar el bot

Editar `config.js`:

```javascript
global.config = {
    name: "MiBot",              // Nombre del bot
    prefixes: ".¿?¡!#%&/,~@",   // Caracteres que activan comandos
    saveHistory: true,          // Guardar historial de mensajes
    autoRead: true              // Marcar mensajes como leídos
    silentConsole: true         // Oculta los mensajes de entrada de la consola
};

// Roles de usuario (usar número sin símbolos)
global.config.userRoles = {
    "36082607472889@lid": {
        root: true,   // Acceso total
        owner: true,  // Propietario
        mod: true,    // Moderador
        vip: true     // Usuario premium
    }
}
```

### 3. Iniciar el bot

```bash
npm start
```

El sistema presentará un menú interactivo:

```
~> ¿Cómo desea conectarse?
1. Código QR.
2. Código de 8 dígitos.
```

### 4. Estructura de almacenamiento generada

```
storage/
├── creds/          # Credenciales de sesión (creds.json)
├── store/          # Base de datos JSON
│   ├── index.json  # Índice de bases de datos
│   └── *.json      # Datos persistidos
└── temp/           # Archivos temporales (purgados cada 60s)
```

---

## Arquitectura y Lógica

### Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              PROCESO PRINCIPAL                          │
│  index.js                                                               │
│  └─> ForkManager ──fork()──> core/index.js (PROCESO HIJO)               │
│          │                        │                                     │
│          │ IPC                    ├─> Baileys WebSocket                 │
│          │ (process.send)         ├─> Plugin Watcher                    │
│          ▼                        └─> Handler Pipeline                  │
│  ┌───────────────┐                         │                            │
│  │ Event Handler │◄────────────────────────┘                            │
│  │ - qr-code     │                                                      │
│  │ - pin-code    │         ┌──────────────────────────────────┐         │
│  │ - connection  │         │     HANDLER PIPELINE             │         │
│  │ - console:log │         │                                  │         │
│  └───────────────┘         │  message ──► m.content.js        │         │
│                            │          ──► m.bot.js            │         │
│                            │          ──► m.chat.js           │         │
│                            │          ──► m.sender.js         │         │
│                            │          ──► m.parser.js         │         │
│                            │          ──► plugin.script()     │         │
│                            └──────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Estructura de Directorios

```
HorekuOs-3.0.0/
├── index.js              # Entry point: inicia ForkManager y sistema IPC
├── config.js             # Configuración global del bot, roles y mensajes UI
├── package.json
│
├── core/
│   ├── index.js          # Bootstrap del proceso hijo
│   ├── main.js           # Conexión Baileys, inicialización y event listeners
│   ├── config.js         # Carga variables globales, prototipos y rutas
│   ├── format.js         # Schema TypeScript-like del objeto `m`
│   │
│   └── handlers/         # Pipeline de procesamiento de mensajes
│       ├── core.handler.js         # Orquestador principal (secuencia de ejecución)
│       ├── m.content.js            # Extrae texto y media del mensaje
│       ├── m.bot.js                # Info del bot (id, nombre, métodos nativos)
│       ├── m.chat.js               # Info del chat (grupo/privado) y bases de datos
│       ├── m.chat.group.js         # Metadata específica de grupos (admins, size)
│       ├── m.sender.js             # Info del remitente, contador de mensajes y roles
│       ├── m.quoted.sender.js      # Info y roles del mensaje citado
│       ├── m.assign.js             # Asigna métodos utilitarios (`reply`, `react`, `sms`)
│       ├── m.parser.js             # Parsea comandos, prefijos y argumentos
│       ├── m.pre.parser.js         # ReplyHandler (flujos conversacionales multi-paso)
│       ├── m.cache.js              # Cache memoizado para fotos y metadatos
│       └── [+] extrator.content.js # Extractores nativos por tipo de mensaje
│
├── library/              # Librería Core (Modularizada)
│   ├── media/
│   │   └── MediaConverter.js       # Procesamiento FFmpeg y metadatos WebP (Exif)
│   │
│   ├── modules/
│   │   ├── HandlerLoader.js        # Cargador dinámico (hot-reload) de handlers
│   │   ├── PluginInspector.js      # Análisis estático y metadatos de comandos
│   │   ├── PluginRegistry.js       # Sistema global de plugins con hot-reload
│   │   └── ScraperRegistry.js      # Caché RAM de scrapers con auto-actualización
│   │
│   ├── network/
│   │   ├── SocketExtensions.js     # Extiende Baileys (sendSticker, setReplyHandler, etc.)
│   │   └── SocketFactory.js        # Patron Factory (MakeBot) para la conexión
│   │
│   ├── storage/
│   │   ├── GarbageCollector.js     # Tarea cron que limpia /temp cada 60 segundos
│   │   └── HyperDBAdapter.js       # Base de datos nativa NoSQL Hyper-DB (LMDB)
│   │
│   ├── system/
│   │   ├── BootPrompt.js           # Wizard CLI interactivo (Código QR / Pin 8 dígitos)
│   │   ├── IPCBridge.js            # Wrapper de process para comunicación entre hilos
│   │   └── ProcessManager.js       # ForkManager: ciclo de vida de los subprocesos
│   │
│   └── utils/
│       ├── CacheUtils.js           # SimpleTimer, TmpStore y utilidades de color ANSI
│       └── Logger.js               # Logger centralizado para consola (con chalk)
│
├── plugins/              # Directorio de plugins ejecutables (hot-reload)
│   └── *.plugin.js
│
├── library/scrapers/     # Funciones de extracción de datos (hot-reload en RAM)
│   ├── downloader/
│   ├── search/
│   └── tools/
│
└── storage/              # Directorios generados dinámicamente en runtime
    ├── creds/            # Credenciales de sesión de Baileys
    ├── store/            # Archivos binarios (.mdb) nativos de Hyper-DB
    └── temp/             # Archivos multimedia temporales
```

### Disponibilidad de Propiedades por Index

El objeto `m` se construye progresivamente. Acceder a propiedades antes de su inicialización produce `undefined`. La siguiente tabla muestra qué propiedades están disponibles en cada punto del pipeline:

| Index | Propiedades Disponibles |
|-------|-------------------------|
| **1** | `m.id`, `m.message`, `m.cache`, `m.bot.id`, `m.bot.name`, `m.bot.fromMe`, `m.chat.id`, `m.chat.isGroup`, `m.sender.id`, `m.sender.name`, `m.sender.number`, `m.content.text`, `m.content.args`, `m.content.media`, `m.quoted` (si existe) |
| **2** | Todo lo anterior + `m.chat.admins`, `m.chat.participants`, `m.chat.name`, `m.chat.desc`, `m.chat.size`, `m.chat.owner`, `m.bot.roles.admin`, `m.sender.roles.admin` |
| **3** | Todo lo anterior + `m.command`, `m.args`, `m.text`, `m.body`, `m.tag`, `m.isCmd`, `m.plugin` |

**Ejemplo de acceso seguro en plugin before:**

```javascript
// INCORRECTO: m.chat.admins no existe en index=1
export default {
    before: true,
    index: 1,
    script: async (m) => {
        console.log(m.chat.admins); // undefined
    }
}

// CORRECTO: Verificar existencia o usar index apropiado
export default {
    before: true,
    index: 2,  // Aquí ya existe m.chat.admins
    script: async (m) => {
        if (m.chat.isGroup) {
            console.log(m.chat.admins); // Array<String>
        }
    }
}
```

---

## Referencia de API

### Core Modules

#### `MakeBot(options, store)` — `library/network/SocketFactory.js`

Crea una conexión autenticada con WhatsApp.

```javascript
/**
 * @param {Object} options
 * @param {string} options.connectType - 'qr-code' | 'pin-code'
 * @param {string} options.phoneNumber - Número para pin-code (sin símbolos)
 * @param {Object} store - Instancia de store (opcional)
 * 
 * @returns {Promise<Object>} sock - Instancia de Baileys extendida
 */
```

**Comportamiento:**
- `qr-code`: Muestra QR en terminal, browser se establece como `macOS('Desktop')`
- `pin-code`: Solicita código de 8 dígitos, browser se establece como `ubuntu('Chrome')`

---

#### `class Plugins` — `library/modules/PluginRegistry.js`

Sistema de plugins con hot-reload.

```javascript
const plugins = new Plugins(folderPath, defaultContext)
```

**Métodos:**

| Método | Firma | Retorno | Descripción |
|--------|-------|---------|-------------|
| `load()` | `() -> Promise<void>` | — | Inicia watcher y carga plugins existentes |
| `query(filter)` | `(Object) -> Array<Plugin>` | Plugins que coinciden | Busca plugins por propiedades |
| `import(key)` | `(string \| {file}) -> any` | Valor exportado | Obtiene exports compartidos |
| `export(key, value)` | `(string, any) -> any` | Valor almacenado | Registra valor compartido entre plugins |
| `remove(key)` | `(string) -> boolean` | Éxito | Elimina plugin del registro |

**Lógica de coincidencia en `query()`:**

| Query | Plugin | ¿Coincide? |
|-------|--------|------------|
| `case: 'help'` | `case: ['help', 'ayuda']` | ✓ Sí |
| `case: ['help', 'ayuda']` | `case: 'help'` | ✓ Sí |
| `case: ['a', 'b']` | `case: ['b', 'c']` | ✓ Sí (intersección) |
| `case: 'test'` | `case: 'otro'` | ✗ No |

---

## `db` — `library/storage/HyperDBAdapter.js`

Implementación de `@syllkom/hyper-db` (v3.0.0). Es una base de datos NoSQL fragmentada (sharded) de alto rendimiento respaldada por **LMDB**. Utiliza **Proxies de JS** para interceptar cambios de forma transparente, eliminando la necesidad de comandos explícitos de guardado.

```javascript
import db from './library/storage/HyperDBAdapter.js'

await db.start()  // Inicializar motor LMDB
```

**Métodos y Propiedades:**

| Interfaz | Retorno | Descripción |
|----------|---------|-------------|
| `db.open(path)` | `Promise<Proxy>` | Abre o crea un registro. Devuelve un Proxy reactivo. |
| `db.data` | `Proxy` | Acceso a la raíz de la BD. Todo cambio aquí se persiste. |
| `db.metrics()` | `Object` | Estadísticas del caché en memoria (Memory Arenas). |
| `db.flush()` | `Promise` | Fuerza la escritura en disco de LMDB de todos los búferes. |

**El poder de los Proxies Transparentes:**
Gracias a `HyperDB`, ya no existe el concepto manual de "guardar". Simplemente editas el objeto y el *EntityRouter* con su búfer (`debounce`) lo escribirá en LMDB.

```javascript
// Método 1: Usando db.open() para aislar datos
const users = await global.db.open('@users');

// ¡Mutar el objeto dispara el guardado automático!
users['123456@lid'] = { name: 'Syllkom', baneado: false };
users['123456@lid'].baneado = true; 

// Método 2: Acceso profundo por Proxy nativo
global.db.data.configuraciones = { prefijo: '.', autoRead: true };
```

---

#### `class ForkManager` — `library/system/ProcessManager.js`

Gestiona procesos hijo con comunicación IPC.

```javascript
const bot = new ForkManager(modulePath, {
    execArgv: ['--max-old-space-size=512'],
    env: { dataConfig: {}, connOptions: {} }
})
```

**Métodos:**

| Método | Firma | Retorno | Descripción |
|--------|-------|---------|-------------|
| `start(callback?)` | `(Function?) -> Promise<void>` | — | Inicia el proceso hijo |
| `stop(callback?)` | `(Function?) -> Promise<void>` | — | Detiene el proceso (SIGTERM) |
| `send(content, type?)` | `(Object, 'send'\|'request') -> Promise` | — | Envía mensaje IPC |
| `event.set(name, fn)` | `(string, Function) -> boolean` | — | Registra handler de evento |

**Eventos disponibles:** `message`, `error`, `exit`

---

### Library Modules

#### `TmpStore` — `library/utils/CacheUtils.js`

Cache en memoria con TTL automático.

```javascript
const cache = new TmpStore(60000)  // 60 segundos TTL

cache.set('key', value)   // Almacena con TTL
cache.get('key')          // Obtiene valor
cache.has('key')          // Verifica existencia
cache.delete('key')       // Elimina manualmente
cache.clear()             // Limpia todo
cache.keys()              // Array de claves
cache.values()            // Array de valores
```

---

#### `SimpleTimer` — `library/utils/CacheUtils.js`

Wrapper para setTimeout/setInterval con control de estado.

```javascript
const timer = new SimpleTimer(
    () => console.log('tick'), 
    5000, 
    'interval'  // 'timeout' | 'interval'
)

timer.start()   // Inicia
timer.stop()    // Detiene
timer.status    // true si está corriendo
```

---

#### `color` — `library/utils/CacheUtils.js`

Colores ANSI para terminal.

```javascript
import { color } from './library/utils/CacheUtils.js';

console.log(color.rgb(255, 100, 0) + 'Texto naranja' + color.reset)
console.log(color.bg.rgb(0, 0, 255) + 'Fondo azul' + color.reset)
```

---

### Objeto `m` (Message Context)

El objeto `m` se construye en cada mensaje y contiene toda la información normalizada.

```typescript
interface MessageContext {
    id: string                    // ID único del mensaje
    type: string                  // Tipo: 'conversation', 'imageMessage', etc.
    message: Object               // Mensaje raw de Baileys
    body: string                  // Texto del mensaje
    command: string               // Comando extraído (sin prefijo)
    args: string[]                // Argumentos del comando
    text: string                  // Texto completo después del comando
    tag: string[]                 // Tags extraídos (tag=value)
    isCmd: boolean                // ¿Es un comando válido?
    plugin: Object | null         // Plugin que maneja el comando

    bot: {
        id: string                // JID del bot
        name: string              // Nombre del bot
        number: string            // Número sin @lid
        fromMe: boolean           // ¿Mensaje enviado por el bot?
        roles: { admin: boolean } // Roles del bot en el chat
        
        // Métodos
        getDesc(): Promise<string>
        getPhoto(): Promise<string>
        setPhoto(image: Buffer): Promise<void>
        setDesc(desc: string): Promise<void>
        setName(name: string): Promise<void>
        join(inviteCode: string): Promise<void>
        mute(id: string, state: boolean, time?: number): Promise<void>
        block(id: string, state: boolean): Promise<void>
        role(...roles: string[]): boolean
    }

    chat: {
        id: string                // JID del chat
        isGroup: boolean          // ¿Es un grupo?
        name: string              // Nombre del grupo/contacto
        desc: string              // Descripción
        size: number              // Número de participantes
        created: number           // Timestamp de creación
        owner: string             // JID del creador
        participants: Object[]    // Lista de participantes
        admins: string[]          // JIDs de administradores
        
        // Métodos (solo grupos)
        db(): Promise<{data, update}>
        add(user: string): Promise<void>
        remove(user: string): Promise<void>
        promote(user: string): Promise<void>
        demote(user: string): Promise<void>
        getPhoto(type?: string): Promise<string>
        setPhoto(image: Buffer): Promise<void>
        setDesc(desc: string): Promise<void>
        setName(name: string): Promise<void>
        getCodeInvite(): Promise<string>
        getLinkInvite(): Promise<string>
        revoke(): Promise<void>
        settings: {
            lock(bool: boolean): Promise<void>
            announce(bool: boolean): Promise<void>
            memberAdd(bool: boolean): Promise<void>
            joinApproval(bool: boolean): Promise<void>
        }
    }

    sender: {
        id: string                // JID del remitente
        name: string              // pushName
        number: string            // Número sin @lid
        user: string              // Formato @número
        mentioned: string[]       // JIDs mencionados
        roles: {
            root: boolean         // Dueño absoluto
            owner: boolean        // Propietario
            mod: boolean          // Moderador
            vip: boolean          // Usuario premium
            admin: boolean        // Admin del grupo
            bot: boolean          // Es el bot
        }
        
        // Métodos
        db(): Promise<{data, _data, update}>
        getDesc(): Promise<string>
        getPhoto(): Promise<string>
        role(...roles: string[]): boolean
    }

    content: {
        text: string              // Texto del mensaje
        args: string[]            // Texto dividido por espacios
        media: false | {
            mimeType: string
            fileName: string
            download(): Promise<Buffer>
        }
    }

    quoted?: {                    // Presente si cita un mensaje
        id: string
        type: string
        sender: { /* igual que sender */ }
        content: { /* igual que content */ }
    }

    // Métodos utilitarios
    reply(text: string | Object): Promise<Message>
    react(emoji: string): Promise<void>    // 'wait' | 'done' | 'error' | emoji
    sms(type: string): Promise<void>       // Envía mensaje predefinido
    db(id: string): Promise<{data, update}>
    setBan(id: string, state: boolean): Promise<void>
    setRole(id: string, state: boolean, ...roles: string[]): Promise<boolean>
}
```

**Tipos de `sms()` disponibles:**

| Tipo | Mensaje |
|------|---------|
| `root` | "Este comando solo puede ser utilizado por el *dueño*" |
| `owner` | "Este comando solo puede ser utilizado por un *propietario*" |
| `mod` | "Este comando solo puede ser utilizado por un *moderador*" |
| `vip` | "Esta solicitud es solo para usuarios *premium*" |
| `group` | "Este comando solo se puede usar en *grupos*" |
| `private` | "Este comando solo se puede usar por *chat privado*" |
| `admin` | "Este comando solo puede ser usado por los *administradores del grupo*" |
| `botAdmin` | "El bot necesita *ser administrador* para usar este comando" |
| `unreg` | "Regístrese para usar esta función..." |
| `restrict` | "Esta función está desactivada" |

---

# Builders

El archivo `SocketExtensions.js` actúa como un inyector de métodos nativos de alto rendimiento directamente sobre el objeto `sock` de Baileys. 

Estas funciones están diseñadas para **bypassear las validaciones estándar de Meta**, manipulando los nodos de Protobuf para generar interfaces de usuario de nivel Empresarial (Native Flow V1 y V3, Rich Responses, y Commerce).

---

## Botones Dinámicos (`mapButtons`)

Todos los Interactive Builders y Commerce Builders utilizan un mapeador interno que traduce objetos simples de JavaScript a los nodos complejos que exige WhatsApp. 

**Propiedades de `type` soportadas en el array de botones:**

- `reply` *(default)*: Botón de respuesta rápida estándar (`quick_reply`).
- `url`: Redirección a un enlace externo (`cta_url`).
- `call`: Inicia una llamada telefónica (`cta_call`).
- `copy`: Copia un texto oculto al portapapeles del usuario (`cta_copy`).
- `reminder` / `cancel_reminder`: Sistema nativo para agendar eventos o alarmas en el calendario de WhatsApp (`cta_reminder`).
- `address`: Solicita al usuario que envíe su dirección estructurada (`address_message`).
- `location`: Solicita al usuario que comparta su ubicación GPS (`send_location`).
- `vcard`: Adjunta y envía un contacto directamente (`vcard_message`).
- `list`: Despliega un menú modal inferior con secciones y filas seleccionables (`single_select`).
- `galaxy` / `flow`: Abre un **WhatsApp Flow** nativo (formularios interactivos, pantallas personalizadas) sin salir del chat (`galaxy_message`). Requiere pasar `token`, `flowId` y `metadata`.

---

## 1. Commerce Builders (E-Commerce)
*Estos métodos simulan interacciones de WhatsApp Business sin necesidad de tener una cuenta comercial vinculada a un catálogo real de Meta.*

### 1. Catálogo (`catalog`)
**Explicación:** Genera un nodo `productMessage`. Bypassea la validación de catálogo de Meta, permitiendo enviar un producto visual con precio, imagen y enlace, simulando que pertenece a una tienda oficial.
**Caso de uso:** Mostrar items VIP, rangos o productos físicos/digitales.
```javascript
await sock.sendMessage(m.chat.id, {
    catalog: {
        id: "ITEM_01",
        title: "Rango VIP",
        body: "Acceso a comandos exclusivos",
        price: 5, // El builder lo multiplica x1000 automático
        currency: "USD",
        image: "https://files.catbox.moe/obz4b4.jpg",
        retailerId: "HorekuOs",
        url: "https://github.com/Syllkom"
    }
}, { quoted: m.message })
```

### 2. Orden / Recibo (`order`)
**Explicación:** Construye un `orderMessage`. Muestra un recibo de compra nativo en el chat con el estado "Completado".
**Caso de uso:** Confirmar transacciones en el sistema de economía (ej. "Has comprado 3 waifus por 1500 Soles").
```javascript
await sock.sendMessage(m.chat.id, {
    order: {
        id: "ORDEN_123",
        title: "Compra de Waifus",
        text: "Transacción completada",
        itemCount: 3,
        price: 1500,
        currency: "PEN",
        image: "https://files.catbox.moe/obz4b4.jpg"
    }
}, { quoted: m.message })
```

### 3. Pago Nativo (`payment`)
**Explicación:** Inyecta un `interactiveMessage` con el botón nativo `review_and_pay`. Permite integrar pasarelas de pago reales (como PIX en Brasil o tarjetas) directamente en la UI de WhatsApp.
**Caso de uso:** Cobrar por servicios de hosting, sub-bots o accesos premium.
```javascript
await sock.sendMessage(m.chat.id, {
    payment: {
        amount: 50,
        currency: "BRL",
        merchant: "Syllkom Store",
        key: "pagos@syllkom.com", // Tu llave Pix o email
        body: "Pago por servicios de hosting",
        footer: "Transacción segura"
    }
}, { quoted: m.message })
```

### 4. Factura Interactiva (`invoice`)
**Explicación:** Crea un desglose de cobro (`payment_requested`) con subtotales, impuestos y envío. Es la versión detallada y formal del `payment`.
**Caso de uso:** Generar facturas formales para clientes del bot.
```javascript
await sock.sendMessage(m.chat.id, {
    invoice: {
        title: "Factura #001",
        subtitle: "Pendiente de pago",
        body: "Detalles de tu compra en el bot",
        footer: "Gracias por tu preferencia",
        price: 25.50,
        currency: "USD",
        itemName: "Suscripción Mensual",
        itemCount: 1,
        orderId: "INV_001",
        image: "https://files.catbox.moe/obz4b4.jpg"
    }
}, { quoted: m.message })
```

---

## 2. Interactive Builders (Menús y UI)

### 5. Menú Multimedia (`mediaMenu`)
**Explicación:** Construye un menú interactivo con un encabezado multimedia. Su mayor hack es la inyección del nodo `limited_time_offer`, que crea una cuenta regresiva nativa en el chat.
**Caso de uso:** Menús principales, eventos temporales o promociones con límite de tiempo.
```javascript
await sock.sendMessage(m.chat.id, {
    mediaMenu: {
        title: "Menú Principal",
        subtitle: "HorekuOs",
        body: "Elige una opción:",
        footer: "V3.0.0",
        image: "https://files.catbox.moe/obz4b4.jpg", 
        offer: { // Crea una oferta (icono)
            text: "Descuento VIP",
            code: "HOREKU2026"
        },
        buttons:[
            { type: 'reply', text: 'Ping', id: 'btn_ping' },
            { type: 'url', text: 'GitHub', url: 'https://github.com/Syllkom' }
        ]
    }
}, { quoted: m.message })
```

### 6. Menú de Ubicación (`locationMenu`)
**Explicación:** Envía un mapa interactivo. Inyecta un thumbnail en Base64 para renderizar la previsualización del mapa sin requerir coordenadas GPS reales validadas por Meta. Esta configurado para que las imágenes de de dimensionen a 300x300 ya que es lo máximo para que se pueda ver una imagen en vez del mapa.
**Caso de uso:** Compartir la ubicación del servidor o solicitar el GPS del usuario mediante un botón.
```javascript
await sock.sendMessage(m.chat.id, {
    locationMenu: {
        title: "Servidor Central",
        body: "Ubicación del host",
        locationName: "Data Center",
        locationAddress: "Cali, Colombia",
        mapImage: "https://files.catbox.moe/obz4b4.jpg",
        // opcional:
        buttons:[
            { type: 'location', text: 'Compartir mi ubicación', id: 'loc_1' }
        ]
    }
}, { quoted: m.message })
```

### 7. Menú Interactivo Base (`interactiveMenu`)
**Explicación:** Genera una interfaz interactiva universal inyectando un documento fantasma (`fileLength: 0` o un PNG de 1x1)
**Caso de uso:** Enviar PDFs, manuales o imágenes de alta calidad acompañadas de botones de acción.
```javascript
await sock.sendMessage(m.chat.id, {
    interactiveMenu: {
        title: "Documentación",
        body: "Descarga el manual",
        footer: "HorekuOs",
        document: bufferDelPDF,
        fileName: "Manual.pdf",
        thumbnail: bufferImagen, // Se renderizará en HD
        buttons:[
            { type: 'reply', text: 'Aceptar', id: 'btn_ok' }
        ]
    }
}, { quoted: m.message })
```

### 8. Carrusel de Tarjetas (`cards`)
**Explicación:** Genera un carrusel deslizable horizontalmente (Native Flow V3). Permite agrupar múltiples opciones visuales en un solo bloque.
**Caso de uso:** Mostrar inventarios de Gacha, selección de personajes o catálogos de tiendas.
```javascript
await sock.sendMessage(m.chat.id, {
    cards: {
        image: "https://files.catbox.moe/obz4b4.jpg",
        text: "Waifu #1",
        footer: "Desliza para ver más",
        buttons:[{ type: 'reply', text: 'Reclamar', id: 'claim_1' }]
    }
}, { quoted: m.message })
```

### 9. Snapshot de Encuesta (`pollSnapshot`)
**Explicación:** Falsifica el resultado de una encuesta. Envía un nodo `pollResultSnapshotMessage` que muestra una encuesta ya cerrada con votos predefinidos por el bot.
**Caso de uso:** Mostrar estadísticas visuales o resultados de minijuegos.
```javascript
await sock.sendMessage(m.chat.id, {
    pollSnapshot: {
        title: "Resultados de la votación",
        stats:[
            { name: "Opción A", value: 150 },
            { name: "Opción B", value: 45 }
        ]
    }
}, { quoted: m.message })
```

---

## 3. Rich Builders (Estilo Meta AI)

### 10. Respuesta Enriquecida (`richResponse`)
**Explicación:** El hack definitivo. Falsifica el nodo `botForwardedMessage` para clonar la interfaz exclusiva de Meta AI. Permite enviar mensajes con citas (fuentes clickeables), bloques de código con resaltado de sintaxis, tablas nativas y carruseles de Reels.
**Caso de uso:** Respuestas de la IA (Groq/Copilot), mostrar código fuente o resultados de búsqueda complejos.
```javascript
await sock.sendMessage(m.chat.id, {
    richResponse: {
        text: "Aquí tienes los resultados de tu búsqueda:",
        links: [ // Crea las citas tipo[1] [2]
            { title: "Repo Oficial", url: "https://github.com/Syllkom" }
        ],
        code: { // Bloque de código con colores
            language: "javascript",
            code: "const db = await global.db.open('@rpg');"
        },
        table: { // Tabla nativa
            title: "Top Usuarios",
            headers:["Nombre", "Nivel"],
            rows: [["Syllkom", "99"],["Zeppth", "98"] ]
        },
        reels:[ // Carrusel de Instagram Reels
            { title: "Video 1", creator: "Syllkom", verified: true, videoUrl: "https://..." }
        ]
    }
}, { quoted: m.message })
```

### 11. Álbum Nativo (`album`)
**Explicación:** Agrupa múltiples elementos multimedia en un solo mensaje colapsable usando `messageAssociation`. Evita el spam visual en el chat.
**Caso de uso:** Enviar resultados de búsquedas de imágenes (Pinterest/Google) o galerías de eventos.
```javascript
await sock.sendMessage(m.chat.id, {
    album:[
        { type: 'image', data: bufferImg1 },
        { type: 'image', data: bufferImg2 },
        { type: 'video', data: bufferVid1 }
    ],
    caption: "Galería del evento"
}, { quoted: m.message })
```

---

## 4. Fake Context Builders (Spoofing)

**Explicación General:** Estos métodos **NO envían un mensaje**. Generan un objeto de contexto falso (`key` y `message`). Son útiles exclusivamente para inyectarlos en la propiedad `quoted` de otras funciones, simulando que el bot está respondiendo a un mensaje del sistema que en realidad nunca existió en el chat.

### 12. Fake Order
Simula que se está respondiendo a una orden de compra. Soporta imagen de miniatura y detalles completos del pedido.
```javascript
const fakeQ = await sock.fakeOrder(m.chat.id, { 
    image: "https://files.catbox.moe/obz4b4.jpg", // Buffer o URL
    orderId: "HK_V3",
    itemCount: 374,
    message: "Powered by Syllkom",
    orderTitle: "HorekuOs Store",
    price: 374,
    currency: "USD"
})
await m.reply({ text: "Procesado." }, { quoted: fakeQ })
```

### 13. Fake Catalog
Simula que se está respondiendo a un producto de catálogo.
```javascript
const fakeQ = await sock.fakeCatalog(m.chat.id, { 
    image: "https://files.catbox.moe/obz4b4.jpg",
    id: "PROD_001",
    title: "Producto Estrella", 
    body: "Descripción detallada del producto",
    currency: "USD",
    price: 50,
    retailerId: "Syllkom",
    url: "https://github.com/Syllkom"
})
await m.reply({ text: "Añadido al carrito." }, { quoted: fakeQ })
```

### 14. Fake Payment
Simula que se está respondiendo a una solicitud de pago.
```javascript
const fakeQ = await sock.fakePayment(m.chat.id, { 
    id: "PAY_123",
    fromMe: false,
    participant: "0@s.whatsapp.net", // Opcional, útil en grupos
    price: 100, 
    currency: "USD", 
    requestFrom: "0@s.whatsapp.net",
    message: "Pago por servicios premium" 
})
await m.reply({ text: "Pago recibido." }, { quoted: fakeQ })
```

### 15. Fake Invoice
Simula que se está respondiendo a una factura emitida.
```javascript
const fakeQ = await sock.fakeInvoice(m.chat.id, { 
    image: "https://files.catbox.moe/obz4b4.jpg",
    title: "Factura #001",
    subtitle: "Pendiente",
    body: "Detalles de la compra",
    footer: "HorekuOs Store",
    price: 100, 
    currency: "USD",
    orderId: "INV_001",
    type: "physical-goods",
    itemName: "Suscripción Premium",
    itemCount: 1
})
await m.reply({ text: "Factura cancelada." }, { quoted: fakeQ })
```

### 16. Fake Link
Simula que se está respondiendo a una previsualización de enlace (Link Preview) generada por el sistema.
```javascript
const fakeQ = await sock.fakeLink(m.chat.id, { 
    image: "https://files.catbox.moe/obz4b4.jpg",
    url: "https://horekuos.vercel.app", 
    text: "Visita nuestro sitio web", // Texto que acompaña al link
    title: "HorekuOs System", 
    body: "Advanced Engine Verificado" 
})
await m.reply({ text: "Enlace seguro." }, { quoted: fakeQ })
```


## Sistema de Plugins

### Taxonomía de Plugins

```
┌──────────────────────────────────────────────────────────────────────┐
│                         TAXONOMÍA DE PLUGINS                         │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ 1. PLUGINS DE COMANDO                                          │  │
│  │    command: true                                               │  │
│  │    case: String | Array<String>                                │  │
│  │    usePrefix: Boolean (default: true)                          │  │
│  │                                                                │  │
│  │    Se activan cuando m.command coincide con case               │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ 2. PLUGINS DE INTERCEPTACIÓN (BEFORE)                          │  │
│  │    before: true                                                │  │
│  │    index: 1 | 2 | 3                                            │  │
│  │    priority: Number (menor = mayor prioridad)                  │  │
│  │                                                                │  │
│  │    Se ejecutan en puntos específicos del pipeline              │  │
│  │    Pueden interrumpir el flujo con control.end = true          │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ 3. PLUGINS DE EVENTO (STUBTYPE)                                │  │
│  │    stubtype: true                                              │  │
│  │    case: String (nombre del evento WebMessageInfo.StubType)    │  │
│  │                                                                │  │
│  │    Se activan con eventos del protocolo WhatsApp               │  │
│  │    Ejemplos: GROUP_PARTICIPANT_ADD, GROUP_PARTICIPANT_LEAVE    │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Ciclo de Vida

```
┌────────────────────────────────────────────────────────────────────────┐
│                     CICLO DE VIDA DE UN PLUGIN                         │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌─────────────┐                                                       │
│  │   CARGA     │  Plugins.load() → fs.readdir() → import()             │
│  │  INICIAL    │  Se almacena en Map con fileName como key             │
│  └──────┬──────┘                                                       │
│         │                                                              │
│         ▼                                                              │
│  ┌─────────────┐                                                       │
│  │  REGISTRO   │  Se parsean propiedades (case, command, etc.)         │
│  │   EN MAP    │  Se mezclan con defaultObjects del constructor        │
│  └──────┬──────┘                                                       │
│         │                                                              │
│         ▼                                                              │
│  ┌─────────────┐                                                       │
│  │ OBSERVACIÓN │  chokidar.watch() monitorea cambios                   │
│  │  (WATCHER)  │  Eventos: add, change, unlink                         │
│  └──────┬──────┘                                                       │
│         │                                                              │
│         ├──────────────────────┐                                       │
│         │                      │                                       │
│         ▼                      ▼                                       │
│  ┌─────────────┐        ┌─────────────┐                                │
│  │   CAMBIO    │        │ ELIMINACIÓN │                                │
│  │  (change)   │        │  (unlink)   │                                │
│  │             │        │             │                                │
│  │ delete(key) │        │ delete(key) │                                │
│  │ reimport()  │        │             │                                │
│  │ (delay 1s)  │        │             │                                │
│  └─────────────┘        └─────────────┘                                │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                         EJECUCIÓN                               │   │
│  │                                                                 │   │
│  │  messages.upsert → core.handler → plugins.query() → script()    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### Estructura de un Plugin

Los archivos deben terminar en `.plugin.js` y ubicarse en `/plugins/`.

```javascript
// plugins/ejemplo.plugin.js

export default {
    // === IDENTIFICACIÓN ===
    case: ['ping', 'p'],      // String o Array<String>
    
    // === CLASIFICACIÓN ===
    usePrefix: true,          // Requiere prefijo (default: true)
    command: true,            // Plugin de comando
    
    // === PARA PLUGINS BEFORE ===
    // before: true,
    // index: 1,              // Punto de ejecución (1, 2 o 3)
    // priority: 10,          // Menor = mayor prioridad
    
    // === PARA PLUGINS STUBTYPE ===
    // stubtype: true,
    // case: 'GROUP_PARTICIPANT_ADD',
    
    // === FUNCIÓN PRINCIPAL ===
    async script(m, context) {
        const { sock, plugin, store } = context
        // Para plugins before: context.control
        // Para plugins stubtype: context.parameters, context.even
        
        await m.reply('Pong!')
    }
}
```

**Objeto `context` según tipo de plugin:**

| Tipo | Propiedades de `context` |
|------|--------------------------|
| Comando | `sock`, `plugin`, `store` |
| Before | `sock`, `plugin`, `store`, `control` |
| StubType | `sock`, `plugin`, `store`, `parameters`, `even` |

### Sistema de Consulta

```javascript
// Buscar comandos con prefijo
const cmds = await plugins.query({ 
    case: 'ping', 
    usePrefix: true, 
    command: true 
});

// Buscar plugins before con index 2
const beforePlugins = await plugins.query({
    before: true,
    index: 2
});

// Buscar eventos stubtype
const events = await plugins.query({ 
    case: 'GROUP_PARTICIPANT_ADD', 
    stubtype: true 
});
```

### Exportación entre Plugins

Los plugins pueden exportar funciones y valores para ser consumidos por otros:

**Plugin que exporta:**

```javascript
// plugins/utils/helpers.plugin.js

const formatNumber = (n) => n.toLocaleString('es-ES');
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export default {
    before: true,
    index: 1,
    
    export: {
        '@helpers': {
            formatNumber,
            randomInt
        }
    },
    
    async script() {
        // Plugin mínimo, solo exporta
    }
}
```

**Plugin que consume:**

```javascript
// plugins/comandos/dado.plugin.js

export default {
    case: 'dado',
    command: true,
    
    async script(m, { plugin }) {
        const helpers = plugin.import('@helpers');
        const resultado = helpers.randomInt(1, 6);
        
        await m.reply(`🎲 Obtuviste: ${resultado}`);
    }
}
```

### ReplyHandler (Flujos Conversacionales)

Permite crear interacciones multi-paso donde el bot espera respuestas específicas:

```javascript
async script(m, { sock }) {
    const msg = await m.reply('¿Cuál es tu nombre?')
    
    await sock.setReplyHandler(msg, {
        security: {
            userId: m.sender.id,    // Solo este usuario puede responder
            chatId: m.chat.id,      // Solo en este chat
            scope: 'all'            // 'all' | 'private' | 'group'
        },
        lifecycle: {
            consumeOnce: true       // Eliminar después de una respuesta
        },
        state: {
            step: 'name',           // Estado personalizado
            intentos: 0
        },
        routes: [{
            priority: 1,
            code: {
                // guard retorna true para SALTAR esta ruta
                guard: (m, ctx) => m.body.length < 2,
                
                // executor se ejecuta si guard retorna false/undefined
                executor: async (m, ctx) => {
                    await m.reply(`¡Hola ${m.body}!`)
                }
            }
        }]
    }, 1000 * 60 * 5)  // Expira en 5 minutos
}
```

**Parámetros de `setReplyHandler`:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `message` | Object | Mensaje al que se responderá (debe tener `key.id`) |
| `options.security.userId` | String | `'all'` o JID específico |
| `options.security.chatId` | String | `'all'` o JID específico |
| `options.security.scope` | String | `'all'`, `'private'`, `'group'` |
| `options.lifecycle.consumeOnce` | Boolean | Eliminar tras primera ejecución |
| `options.state` | Object | Estado personalizado accesible en rutas |
| `options.routes` | Array | Rutas ordenadas por `priority` |
| `expiresIn` | Number | Milisegundos hasta expiración |

---

## Ejemplos de Uso

### Ejemplo 1: Comando con Verificación de Roles

```javascript
// plugins/admin/ban.plugin.js

export default {
    case: 'ban',
    usePrefix: true,
    command: true,
    
    async script(m, { sock }) {
        // Verificar que el ejecutor sea moderador o superior
        if (!m.sender.role('root', 'owner', 'mod')) {
            return m.sms('mod')
        }
        
        // Verificar que haya un usuario mencionado o citado
        const target = m.sender.mentioned[0] || m.quoted?.sender.id
        if (!target) {
            return m.reply('Menciona o cita al usuario a banear')
        }
        
        // Banear usuario
        await m.setBan(target, true)
        await m.reply(`Usuario @${target.split('@')[0]} baneado.`)
    }
}
```

### Ejemplo 2: Descarga de Media

```javascript
// plugins/media/sticker.plugin.js

export default {
    case: ['sticker', 's'],
    usePrefix: true,
    command: true,
    
    async script(m, { sock }) {
        // Verificar si hay imagen en el mensaje o citada
        const media = m.content.media || m.quoted?.content.media
        
        if (!media || !media.mimeType.startsWith('image/')) {
            return m.reply('Envía o cita una imagen')
        }
        
        await m.react('wait')
        
        try {
            const buffer = await media.download()
            
            await sock.sendMessage(m.chat.id, {
                sticker: buffer
            }, { quoted: m.message })
            
            await m.react('done')
        } catch (e) {
            await m.react('error')
            await m.reply('Error al crear el sticker')
        }
    }
}
```

### Ejemplo 3: Plugin Before (Middleware Anti-Spam)

```javascript
// plugins/middleware/antispam.plugin.js

const cooldowns = new Map();
const COOLDOWN_MS = 3000;

export default {
    before: true,
    index: 1,
    priority: 5,
    
    async script(m, { control }) {
        // Ignorar al bot
        if (m.sender.roles.bot) return
        
        // Ignorar admins/owners
        if (m.sender.role('root', 'owner', 'mod')) return
        
        const key = m.sender.id;
        const now = Date.now();
        
        if (cooldowns.has(key)) {
            const lastTime = cooldowns.get(key);
            if (now - lastTime < COOLDOWN_MS) {
                control.end = true;  // Detiene el pipeline
                return;
            }
        }
        
        cooldowns.set(key, now);
    }
}
```

### Ejemplo 4: Plugin de Evento (Bienvenida)

```javascript
// plugins/events/bienvenida.plugin.js

export default {
    case: 'GROUP_PARTICIPANT_ADD',
    stubtype: true,
    
    async script(m, { sock, parameters }) {
        const newMember = parameters[0];
        const groupName = m.chat.name || 'el grupo';
        
        await sock.sendMessage(m.chat.id, {
            text: `¡Bienvenido/a a *${groupName}*, @${newMember.split('@')[0]}! 🎉`,
            mentions: [newMember]
        });
    }
}
```

### Ejemplo 5: Sistema de Economía Completo

Este ejemplo demuestra un sistema completo con persistencia, roles, exportación entre plugins y flujos interactivos.

#### Estructura de archivos

```
plugins/
└── economia/
    ├── _init.plugin.js       # Inicialización y exports
    ├── balance.plugin.js     # Consulta de saldo
    ├── daily.plugin.js       # Recompensa diaria
    ├── transferir.plugin.js  # Transferencias
    └── tienda.plugin.js      # Tienda con ReplyHandler
```

#### Plugin de Inicialización (Economía)

Aviso: Con Hyper-DB v3 ya no necesitamos devolver funciones de `guardar()` o `.update()`.

```javascript
// plugins/economia/_init.plugin.js

const MONEDA = '💎';
const INICIAL = 1000;

const obtenerCuenta = async (userId) => {
    // Abrimos el shard '@economia'. Retorna un Proxy reactivo.
    const ecoDB = await global.db.open('@economia');
    
    // Si el usuario no existe, la asignación se guarda sola en LMDB
    if (!ecoDB[userId]) {
        ecoDB[userId] = {
            balance: INICIAL,
            banco: 0,
            ultimoDaily: 0,
            streak: 0,
            inventario:[],
            creado: Date.now()
        };
    }
    
    // Retornamos directamente el puntero al objeto del usuario
    return ecoDB[userId];
};

const formatearBalance = (cantidad) => {
    return `${cantidad.toLocaleString('es-ES')} ${MONEDA}`;
};

export default {
    before: true,
    index: 1,
    export: {
        '@economia': {
            obtenerCuenta,
            formatearBalance,
            MONEDA,
            INICIAL
        }
    },
    async script() {}
}
```

#### Plugin de Recompensa Diaria (Optimizada)

```javascript
// plugins/economia/daily.plugin.js

const COOLDOWN = 24 * 60 * 60 * 1000; // 24 horas
const RECOMPENSA_BASE = 500;
const BONUS_POR_STREAK = 50;

export default {
    case:['daily', 'diario'],
    command: true,
    usePrefix: true,
    
    async script(m, { plugin }) {
        const eco = plugin.import('@economia');
        
        // Obtenemos la cuenta (es un Proxy, lo que mutemos aquí, se guarda en disco)
        const cuenta = await eco.obtenerCuenta(m.sender.id);
        
        const ahora = Date.now();
        const diferencia = ahora - cuenta.ultimoDaily;
        
        // Verificar cooldown
        if (diferencia < COOLDOWN) {
            const restante = COOLDOWN - diferencia;
            const horas = Math.floor(restante / (60 * 60 * 1000));
            const minutos = Math.floor((restante % (60 * 60 * 1000)) / (60 * 1000));
            return m.reply(`⏰ Espera *${horas}h ${minutos}m* para tu próxima recompensa.`);
        }
        
        // Calcular streak
        const nuevoStreak = diferencia < COOLDOWN * 2 ? cuenta.streak + 1 : 1;
        const recompensa = RECOMPENSA_BASE + (nuevoStreak * BONUS_POR_STREAK);
        
        // ¡Al hacer esta re-asignación, Hyper-DB intercepta y persiste en LMDB instantáneamente!
        cuenta.balance += recompensa;
        cuenta.ultimoDaily = ahora;
        cuenta.streak = nuevoStreak;
        
        await m.reply([
            `*🎁 Recompensa Diaria*`,
            `├ Total ganado: ${eco.formatearBalance(recompensa)}`,
            `└ Nuevo balance: ${eco.formatearBalance(cuenta.balance)}`,
            `🔥 Racha: ${nuevoStreak} día(s)`
        ].join('\n'));
    }
}
```

#### Plugin de Balance

```javascript
// plugins/economia/balance.plugin.js

export default {
    case: ['balance', 'bal', 'saldo'],
    command: true,
    usePrefix: true,
    
    async script(m, { plugin }) {
        const eco = plugin.import('@economia');
        const { cuenta } = await eco.obtenerCuenta(m.sender.id);
        
        const texto = [
            `*💰 Balance de ${m.sender.name}*`,
            '',
            `├ Efectivo: ${eco.formatearBalance(cuenta.balance)}`,
            `├ Banco: ${eco.formatearBalance(cuenta.banco)}`,
            `└ Total: ${eco.formatearBalance(cuenta.balance + cuenta.banco)}`
        ].join('\n');
        
        await m.reply(texto);
    }
}
```

#### Plugin de Recompensa Diaria

```javascript
// plugins/economia/daily.plugin.js

const COOLDOWN = 24 * 60 * 60 * 1000; // 24 horas
const RECOMPENSA_BASE = 500;
const BONUS_POR_STREAK = 50;
const MAX_BONUS = 500;

export default {
    case: ['daily', 'diario'],
    command: true,
    usePrefix: true,
    
    async script(m, { plugin }) {
        const eco = plugin.import('@economia');
        const { cuenta, guardar } = await eco.obtenerCuenta(m.sender.id);
        
        const ahora = Date.now();
        const diferencia = ahora - cuenta.ultimoDaily;
        
        // Verificar cooldown
        if (diferencia < COOLDOWN) {
            const restante = COOLDOWN - diferencia;
            const horas = Math.floor(restante / (60 * 60 * 1000));
            const minutos = Math.floor((restante % (60 * 60 * 1000)) / (60 * 1000));
            
            return m.reply(`⏰ Debes esperar *${horas}h ${minutos}m* para tu próxima recompensa.`);
        }
        
        // Calcular streak
        const dentroDeVentana = diferencia < COOLDOWN * 2;
        const nuevoStreak = dentroDeVentana ? cuenta.streak + 1 : 1;
        
        // Calcular recompensa
        const bonus = Math.min(nuevoStreak * BONUS_POR_STREAK, MAX_BONUS);
        const recompensa = RECOMPENSA_BASE + bonus;
        
        // Actualizar cuenta
        cuenta.balance += recompensa;
        cuenta.ultimoDaily = ahora;
        cuenta.streak = nuevoStreak;
        
        await guardar();
        
        await m.reply([
            `*🎁 Recompensa Diaria*`,
            '',
            `├ Base: ${eco.formatearBalance(RECOMPENSA_BASE)}`,
            `├ Bonus (x${nuevoStreak}): +${eco.formatearBalance(bonus)}`,
            `├ Total: ${eco.formatearBalance(recompensa)}`,
            `└ Nuevo balance: ${eco.formatearBalance(cuenta.balance)}`,
            '',
            `🔥 Racha: ${nuevoStreak} día${nuevoStreak > 1 ? 's' : ''}`
        ].join('\n'));
    }
}
```

#### Plugin de Transferencias

```javascript
// plugins/economia/transferir.plugin.js

const COMISION = 0.05; // 5%

export default {
    case: ['transferir', 'pay', 'enviar'],
    command: true,
    usePrefix: true,
    
    async script(m, { plugin }) {
        const eco = plugin.import('@economia');
        
        // Validar destinatario
        if (m.sender.mentioned.length === 0) {
            return m.reply([
                '*📤 Transferir*',
                '',
                'Uso: .transferir @usuario <cantidad>',
                'Ejemplo: .transferir @Juan 1000',
                '',
                `Comisión: ${COMISION * 100}%`
            ].join('\n'));
        }
        
        const destinatarioId = m.sender.mentioned[0];
        
        // No transferir a sí mismo
        if (destinatarioId === m.sender.id) {
            return m.reply('❌ No puedes transferirte a ti mismo.');
        }
        
        // Validar cantidad
        const cantidad = parseInt(m.args[1]);
        if (isNaN(cantidad) || cantidad <= 0) {
            return m.reply('❌ Especifica una cantidad válida.');
        }
        
        // Obtener cuentas
        const { cuenta: origen, guardar: guardarOrigen } = 
            await eco.obtenerCuenta(m.sender.id);
        const { cuenta: destino, guardar: guardarDestino } = 
            await eco.obtenerCuenta(destinatarioId);
        
        // Calcular comisión
        const comision = Math.floor(cantidad * COMISION);
        const total = cantidad + comision;
        
        // Validar balance
        if (origen.balance < total) {
            return m.reply([
                '❌ *Balance insuficiente*',
                '',
                `├ Cantidad: ${eco.formatearBalance(cantidad)}`,
                `├ Comisión: ${eco.formatearBalance(comision)}`,
                `├ Total requerido: ${eco.formatearBalance(total)}`,
                `└ Tu balance: ${eco.formatearBalance(origen.balance)}`
            ].join('\n'));
        }
        
        // Ejecutar transferencia
        origen.balance -= total;
        destino.balance += cantidad;
        
        await guardarOrigen();
        await guardarDestino();
        
        await m.reply([
            '✅ *Transferencia Exitosa*',
            '',
            `├ Enviado: ${eco.formatearBalance(cantidad)}`,
            `├ Comisión: ${eco.formatearBalance(comision)}`,
            `├ Destinatario: @${destinatarioId.split('@')[0]}`,
            `└ Tu nuevo balance: ${eco.formatearBalance(origen.balance)}`
        ].join('\n'));
    }
}
```

#### Plugin de Tienda con ReplyHandler

```javascript
// plugins/economia/tienda.plugin.js

const CATALOGO = [
    { id: 'vip_1d', nombre: '⭐ VIP 1 Día', precio: 5000, tipo: 'rol' },
    { id: 'vip_7d', nombre: '🌟 VIP 7 Días', precio: 25000, tipo: 'rol' },
    { id: 'lootbox', nombre: '📦 Caja Misteriosa', precio: 1000, tipo: 'item' },
    { id: 'titulo_custom', nombre: '🏷️ Título Personalizado', precio: 10000, tipo: 'item' }
];

export default {
    case: ['tienda', 'shop'],
    command: true,
    usePrefix: true,
    
    async script(m, { sock, plugin }) {
        const eco = plugin.import('@economia');
        const { cuenta } = await eco.obtenerCuenta(m.sender.id);
        
        // Construir catálogo
        let texto = [
            `*🛒 Tienda*`,
            '',
            `Tu balance: ${eco.formatearBalance(cuenta.balance)}`,
            ''
        ].join('\n');
        
        CATALOGO.forEach((item, index) => {
            texto += `${index + 1}. ${item.nombre}\n`;
            texto += `   └ ${eco.formatearBalance(item.precio)}\n`;
        });
        
        texto += '\n_Responde con el número del artículo que deseas comprar._';
        
        const mensaje = await m.reply(texto);
        
        // Registrar ReplyHandler
        await sock.setReplyHandler(mensaje, {
            security: {
                userId: m.sender.id,
                chatId: m.chat.id,
                scope: 'all'
            },
            lifecycle: {
                consumeOnce: true
            },
            state: {
                catalogo: CATALOGO,
                compradorId: m.sender.id
            },
            routes: [
                {
                    priority: 1,
                    code: {
                        // Validar entrada
                        guard: (m, ctx) => {
                            const seleccion = parseInt(m.content.text);
                            return isNaN(seleccion) || 
                                   seleccion < 1 || 
                                   seleccion > ctx.state.catalogo.length;
                        },
                        
                        // Procesar compra
                        executor: async (m, ctx) => {
                            const seleccion = parseInt(m.content.text) - 1;
                            const item = ctx.state.catalogo[seleccion];
                            
                            // Obtener cuenta actualizada
                            const db = await global.db.open('@economia');
                            const cuenta = db.data[ctx.state.compradorId];
                            
                            // Verificar balance
                            if (cuenta.balance < item.precio) {
                                return m.reply([
                                    '❌ *Balance insuficiente*',
                                    '',
                                    `├ Precio: ${item.precio.toLocaleString()} 💎`,
                                    `└ Tu balance: ${cuenta.balance.toLocaleString()} 💎`
                                ].join('\n'));
                            }
                            
                            // Procesar compra
                            cuenta.balance -= item.precio;
                            cuenta.inventario.push({
                                id: item.id,
                                nombre: item.nombre,
                                tipo: item.tipo,
                                obtenido: Date.now()
                            });
                            
                            await db.update();
                            
                            await m.reply([
                                '✅ *Compra Exitosa*',
                                '',
                                `├ Artículo: ${item.nombre}`,
                                `├ Precio: ${item.precio.toLocaleString()} 💎`,
                                `└ Nuevo balance: ${cuenta.balance.toLocaleString()} 💎`
                            ].join('\n'));
                        }
                    }
                },
                {
                    priority: 2,
                    code: {
                        // Ruta por defecto si guard anterior fue true
                        executor: async (m) => {
                            await m.reply('❌ Opción no válida. Escribe un número del 1 al ' + CATALOGO.length);
                        }
                    }
                }
            ]
        }, 1000 * 60 * 2); // 2 minutos
    }
}
```

---

## Edge Cases y Consideraciones

### Manejo de Errores en Plugins

Los errores dentro de `plugin.script()` son capturados automáticamente. El bot:
1. Reacciona con ❌ (`react('error')`)
2. Envía un mensaje con el stack trace al chat
3. Continúa procesando otros mensajes

### Mutabilidad del Objeto m

El objeto `m` es mutable. Las modificaciones persisten a lo largo del pipeline:

```javascript
// Plugin before:index=2
export default {
    before: true,
    index: 2,
    script: async (m) => {
        m.customFlag = true;
        m.sender.roles.customRole = true;
    }
}

// Plugin de comando posterior
export default {
    case: 'test',
    command: true,
    script: async (m) => {
        console.log(m.customFlag);           // true
        console.log(m.sender.roles.customRole); // true
    }
}
```

### Límites de la Base de Datos

- Las bases inactivas por 60s se descargan de memoria
- Escrituras se agrupan cada 5 segundos o cada 5 llamadas a `update()`
- No hay límite de tamaño, pero archivos JSON grandes impactan rendimiento

### Historial de Mensajes

Si `saveHistory: true`:
- Se almacenan los últimos 50 mensajes por usuario por grupo
- Se puede recuperar un mensaje con `sock.loadMessage(jid, id)`

### Reconexión Automática

El bot se reconecta automáticamente excepto en caso de `loggedOut`, donde es necesario re-autenticar eliminando `/storage/creds/`.

---

## Apéndices

### Apéndice A: Eventos StubType

Lista de eventos de `WebMessageInfo.StubType` que pueden capturarse con plugins `stubtype: true`:

| Evento | Descripción |
|--------|-------------|
| `GROUP_PARTICIPANT_ADD` | Usuario añadido al grupo |
| `GROUP_PARTICIPANT_REMOVE` | Usuario eliminado del grupo |
| `GROUP_PARTICIPANT_LEAVE` | Usuario abandonó el grupo |
| `GROUP_PARTICIPANT_PROMOTE` | Usuario promovido a admin |
| `GROUP_PARTICIPANT_DEMOTE` | Admin degradado a miembro |
| `GROUP_CHANGE_SUBJECT` | Nombre del grupo cambiado |
| `GROUP_CHANGE_DESCRIPTION` | Descripción del grupo cambiada |
| `GROUP_CHANGE_ICON` | Foto del grupo cambiada |
| `GROUP_CHANGE_INVITE_LINK` | Link de invitación regenerado |
| `GROUP_CHANGE_RESTRICT` | Configuración de restricción cambiada |
| `GROUP_CHANGE_ANNOUNCE` | Modo solo admins activado/desactivado |
| `GROUP_PARTICIPANT_INVITE` | Usuario invitado al grupo |
| `GROUP_CREATE` | Grupo creado |
| `BROADCAST_CREATE` | Lista de difusión creada |
| `BROADCAST_ADD` | Añadido a lista de difusión |
| `BROADCAST_REMOVE` | Eliminado de lista de difusión |
| `CALL_MISSED_VOICE` | Llamada de voz perdida |
| `CALL_MISSED_VIDEO` | Videollamada perdida |

**Ejemplo de uso:**

```javascript
export default {
    case: 'GROUP_PARTICIPANT_LEAVE',
    stubtype: true,
    
    async script(m, { parameters }) {
        const usuario = parameters[0];
        await m.reply(`👋 @${usuario.split('@')[0]} ha abandonado el grupo.`);
    }
}
```

### Apéndice B: Variables Globales

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `global.config` | Object | Configuración principal del bot |
| `global.config.name` | String | Nombre del bot |
| `global.config.prefixes` | String | Caracteres válidos como prefijo |
| `global.config.saveHistory` | Boolean | Guardar historial de mensajes |
| `global.config.autoRead` | Boolean | Marcar mensajes como leídos |
| `global.config.userRoles` | Object | Roles predefinidos por número |
| `global.db` | Object | Instancia del sistema de persistencia |
| `global.sock` | Object | Socket de Baileys (disponible tras conexión) |
| `global.REACT_EMOJIS` | Object | Mapeo de alias a emojis (`wait`, `done`, `error`) |
| `global.MSG` | Object | Mensajes de sistema predefinidos |
| `global.PLUGINS_MSG` | Object | Mensajes de gestión de plugins |
| `global.$proto` | Object | Protobuf de WhatsApp |
| `global.$package` | Object | Contenido de package.json |
| `global.$dir_main` | Object | Rutas de directorios principales |
| `global.$dir_bot` | Object | Rutas adicionales del bot |
| `global.readMore` | String | Carácter invisible para "leer más" (850 repeticiones) |
| `global.googleApiKey` | String | API Key de Google (desde .env) |

**Ejemplo de acceso:**

```javascript
export default {
    case: 'info',
    command: true,
    
    async script(m) {
        await m.reply([
            `*${global.config.name}*`,
            `Versión: ${global.$package.version}`,
            `Prefijos: ${global.config.prefixes}`,
            `Historial: ${global.config.saveHistory ? 'Sí' : 'No'}`
        ].join('\n'));
    }
}
```
---
