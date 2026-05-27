# Ruleta de la Fortuna Arribística

Juego del rosco en el navegador. El progreso se guarda en **Firebase Realtime Database** (plan Spark, gratuito) para que cualquier persona que abra la misma URL continúe la misma partida — en GitHub Pages, Vercel o en local.

## Configurar Firebase (una vez, gratis)

1. [Firebase Console](https://console.firebase.google.com/) → **Crear proyecto** (o usar uno existente).
2. **Build** → **Realtime Database** → **Crear base de datos**  
   - Elige la región más cercana (p. ej. `europe-west1`).  
   - Empieza en modo de prueba; luego publica las reglas del repo.
3. **Project settings** (engranaje) → **Your apps** → **Web** (`</>`) → registra la app y copia el objeto `firebaseConfig`.
4. Pega los valores en `firebase-config.js` (sustituye los `YOUR_*`).
5. **Realtime Database** → pestaña **Rules** → pega el contenido de `database.rules.json` del repo → **Publish**.

Las reglas permiten leer/escribir solo `ruleta/state`. La API key de Firebase es pública por diseño; la seguridad básica va por reglas y, si quieres, restricción de dominio en Google Cloud.

### Límites del plan gratuito (Spark)

Para una partida entre amigos vas sobrado: lecturas/escrituras y almacenamiento muy por encima de lo que usa este juego. No hace falta tarjeta para Spark.

## Publicar

### GitHub Pages

1. Sube el repo con `firebase-config.js` ya configurado.
2. **Settings** → **Pages** → origen `main` / carpeta raíz.
3. Comparte la URL `https://tu-usuario.github.io/ruleta-fortuna/`.

### Vercel

Importa el repo y despliega sin build ni variables de entorno. Solo archivos estáticos.

## Probar en local

Sirve la carpeta con cualquier servidor estático, por ejemplo:

```bash
npx serve .
```

Abre la URL que indique (p. ej. `http://localhost:3000`). No uses `file://` directamente: el navegador puede bloquear la carga de `firebase-config.js`.

## Reiniciar la partida

Pulsa el botón de reinicio (↺) en la barra superior. Borra el progreso en Firebase para todos los dispositivos.

Si ves **Sin guardar**, revisa `firebase-config.js` y que las reglas de Realtime Database estén publicadas.
