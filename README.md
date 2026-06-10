# 🍽️ Sistema de Gestión de Restaurante

Sistema web completo para gestionar ventas, productos, mesas, clientes y reportes en tiempo real con Supabase.

## 📋 Características

✅ **Ventas en tiempo real** - Registro de ventas con detalles de productos  
✅ **Gestión de Mesas** - Control de disponibilidad y ocupación  
✅ **Catálogo de Productos** - CRUD completo de menú  
✅ **Clientes** - Base de datos de clientes y contactos  
✅ **Dashboard** - Estadísticas y reportes diarios  
✅ **Empleados** - Gestión de personal del restaurante  
✅ **Reportes** - Análisis de ventas por fecha  

## 🏗️ Estructura del Proyecto

```
restaurante/
├── index.html              # Página principal
├── css/
│   └── styles.css         # Estilos de la aplicación
├── js/
│   ├── config.js          # Conexión a Supabase
│   └── app.js             # Lógica de la aplicación
├── .env.example           # Template de variables de entorno
├── .gitignore             # Archivos a ignorar en Git
└── README.md              # Este archivo
```

## 🔧 Instalación Local

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/restaurante.git
cd restaurante
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto (NO subir a GitHub):

```bash
# .env.local
SUPABASE_URL=https://vuxuwgwhbseyhhiypcrg.supabase.co
SUPABASE_ANON_KEY=tu_clave_publica_aqui
```

**Obtener tus credenciales Supabase:**
1. Ve a https://supabase.com/
2. Abre tu proyecto
3. Configuración → API
4. Copia la URL y la clave anon/public

### 3. Abrir en el Navegador

Simplemente abre `index.html` en tu navegador:
```bash
# En Windows
start index.html

# En Mac/Linux
open index.html
# O usa un servidor local:
python -m http.server 8000
# Luego accede a http://localhost:8000
```

## 📤 Desplegar en GitHub Pages

### 1. Crear Repositorio en GitHub

Ve a [github.com/new](https://github.com/new) y crea:
- **Repository name:** `restaurante`
- **Visibility:** `Public`
- **Initialize with README:** Sin marcar

### 2. Clonar el Repositorio Remoto
```bash
git clone https://github.com/tu-usuario/restaurante.git
cd restaurante
```

### 3. Copiar tus Archivos

Copia todos los archivos del proyecto a esta carpeta:
```
restaurante/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── config.js
│   └── app.js
├── .env.example
├── .gitignore
└── README.md
```

### 4. Configurar Git

```bash
# Configurar usuario Git (una sola vez)
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"

# Verificar
git config --global user.name
git config --global user.email
```

### 5. Hacer Push a GitHub

```bash
# Agregar archivos
git add .

# Commit
git commit -m "Initial commit: Sistema de restaurante con Supabase"

# Push
git push -u origin main
```

### 6. Habilitar GitHub Pages

En GitHub:
1. Ve a tu repositorio
2. **Settings** → **Pages**
3. **Source:** selecciona `main` (rama)
4. **Folder:** selecciona `/ (root)`
5. Guarda

**Tu sitio estará en:** `https://tu-usuario.github.io/restaurante`

## ⚠️ Seguridad - NO Hagas Push de Credenciales

**NUNCA subas a GitHub:**
- `.env` o `.env.local`
- Claves privadas de Supabase
- Tokens o API keys

**Cómo evitarlo:**

1. El archivo `.gitignore` ya excluye `.env` y `.env.local`

2. Verifica que no hayas subido credenciales:
```bash
git log --name-only
# Si ves .env, contacta a Supabase para revocar las claves
```

3. Usa variables de entorno en producción:
   - Algunos servicios (como Railway, Vercel) permiten agregar variables en el panel
   - El archivo `config.js` está listo para cargarlas

## 🚀 Desplegar en Producción (Opcional)

Si quieres un servidor mejor que GitHub Pages:

### Opción 1: Railway (Recomendado)
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Opción 2: Vercel
```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Opción 3: Netlify
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=.
```

## 📱 Actualizaciones Futuras

Para actualizar el código:

```bash
# Hacer cambios en los archivos
# Ejemplo: editar index.html

# Agregar cambios
git add .

# Commit con descripción clara
git commit -m "Añadir feature de reportes mensales"

# Push
git push
```

## 🐛 Solucionar Problemas

### "Error de conexión a Supabase"
- Verifica tu URL y clave en `config.js`
- Revisa que Supabase esté online: https://status.supabase.com/

### "CORS error"
- Supabase debe permitir tu dominio
- Ve a Configuración → API → CORS en Supabase
- Agrega tu dominio de GitHub Pages

### "Página en blanco"
- Abre la consola de desarrollador (F12)
- Busca mensajes de error
- Verifica que todos los archivos estén en las carpetas correctas

## 📞 Soporte

Si tienes problemas:
1. Revisa la consola del navegador (F12 → Console)
2. Verifica la documentación de Supabase: https://supabase.com/docs
3. Lee los comentarios en `config.js` y `app.js`

## 📄 Licencia

Este proyecto está disponible bajo la licencia MIT.

---

**Creado por:** Carlos  
**Última actualización:** 2026-06-10  
**Stack:** HTML5 + CSS3 + JavaScript + Supabase
