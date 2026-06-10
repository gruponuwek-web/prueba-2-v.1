# 📤 Guía Completa: Subir tu Restaurante a GitHub

Esta guía te lleva paso a paso para subir tu sistema a GitHub y desplegarlo en GitHub Pages.

## 🎯 Resumen de Pasos

1. Crear repositorio en GitHub
2. Clonar el repositorio
3. Copiar archivos del proyecto
4. Configurar Git
5. Hacer push
6. Habilitar GitHub Pages
7. ¡Listo!

---

## 📋 PASO A PASO

### PASO 1: Crear Repositorio en GitHub

**1.1 Accede a tu cuenta GitHub**
- Ve a https://github.com
- Inicia sesión o crea una cuenta

**1.2 Crea un nuevo repositorio**
- Haz clic en el icono `+` (arriba a la derecha)
- Selecciona **New repository**

**1.3 Configura el repositorio**

| Campo | Valor |
|-------|-------|
| Repository name | `restaurante` |
| Description | `Sistema de Gestión de Restaurante con Supabase` |
| Visibility | ⭕ Public |
| Initialize | ☐ No marques nada |

**1.4 Copia la URL**

Después de crear, verás una URL como:
```
https://github.com/tu-usuario/restaurante.git
```

**Cópiala, la necesitarás después.**

---

### PASO 2: Preparar tu Computadora

**2.1 Instala Git (si no lo tienes)**

- **Windows:** Descarga desde https://git-scm.com
- **Mac:** `brew install git`
- **Linux:** `sudo apt-get install git`

**2.2 Abre Terminal/Command Prompt**

- **Windows:** Presiona `Win + R`, escribe `cmd`, Enter
- **Mac/Linux:** Abre Terminal

**2.3 Configura Git (primera vez)**

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

Reemplaza con tus datos reales.

**2.4 Verifica que funcionó**

```bash
git config --global user.name
git config --global user.email
```

Deberían mostrar tus datos.

---

### PASO 3: Clonar el Repositorio

En la terminal, crea una carpeta y clona:

```bash
# Navega a donde quieras guardar el proyecto
cd Documentos
# O cd Desktop, etc.

# Clona el repositorio
git clone https://github.com/tu-usuario/restaurante.git

# Entra a la carpeta
cd restaurante
```

---

### PASO 4: Copiar Archivos del Proyecto

Copia estos archivos a la carpeta `restaurante`:

```
restaurante/
├── index.html
├── README.md
├── .gitignore
├── .env.example
├── css/
│   └── styles.css
├── js/
│   ├── config.js
│   └── app.js
└── [otros archivos que tengas]
```

**Desde Windows Explorer / Finder:**
1. Abre la carpeta `restaurante` que clonaste
2. Copia-pega los archivos aquí

**Desde la Terminal:**
```bash
# Si tienes los archivos en otra carpeta:
cp -r /ruta/a/tus/archivos/* .

# O copialos manualmente usando el explorador
```

---

### PASO 5: Revisar el Contenido

En la terminal, desde la carpeta `restaurante`:

```bash
# Lista los archivos
ls
# o en Windows: dir

# Deberías ver:
# index.html
# README.md
# .gitignore
# css/
# js/
# etc.
```

---

### PASO 6: Agregar Archivos a Git

```bash
# Agregar todos los archivos
git add .

# Verificar qué se va a agregar
git status

# Deberías ver archivos en verde (listos para subir)
```

---

### PASO 7: Hacer el Primer Commit

```bash
git commit -m "Initial commit: Sistema de Gestión de Restaurante"
```

El mensaje puede ser cualquier descripción de lo que hiciste.

---

### PASO 8: Hacer Push a GitHub

```bash
# Subir los archivos
git push -u origin main

# Si pide usuario/contraseña:
# Usuario: tu usuario de GitHub
# Contraseña: tu token (mira sección de TOKENS más abajo)
```

---

### PASO 9: Verificar en GitHub

1. Ve a https://github.com/tu-usuario/restaurante
2. Deberías ver tus archivos listados
3. Verifica que `.env` y `.env.local` NO están (por el `.gitignore`)

---

### PASO 10: Habilitar GitHub Pages

**10.1 Ve a Configuración**

En tu repositorio:
1. Haz clic en **Settings** (engranaje)
2. En el menú izquierdo, selecciona **Pages**

**10.2 Configura**

- **Source:** Selecciona `main` (rama principal)
- **Folder:** Selecciona `/ (root)`
- Presiona **Save**

**10.3 Espera 1-2 minutos**

GitHub Pages está procesando tu sitio.

**10.4 Accede a tu Sitio**

Tu URL será:
```
https://tu-usuario.github.io/restaurante
```

---

## 🔑 Usar Token en Lugar de Contraseña (Recomendado)

**Paso 1: Crear un Token**

1. Ve a GitHub Settings → Developer settings → Personal access tokens
2. Clic en **Generate new token**
3. Nombre: `git-push`
4. Selecciona permisos:
   - ☑ `repo` (acceso a repositorios)
   - ☑ `workflow` (si usas GitHub Actions)
5. Genera y **copia el token**

**Paso 2: Usar el Token**

```bash
# Cuando pida contraseña, pega el token en lugar de tu contraseña
```

---

## 📝 Futuros Cambios (Después del Primer Push)

Cada vez que hagas cambios:

```bash
# 1. Ver qué cambió
git status

# 2. Agregar cambios
git add .

# 3. Hacer commit
git commit -m "Descripción de los cambios"

# 4. Hacer push
git push
```

Ejemplo real:
```bash
# Edité index.html para agregar un botón nuevo

git add .
git commit -m "Agregar botón de reportes"
git push
```

---

## ⚠️ Errores Comunes

### "fatal: not a git repository"
**Solución:** Asegúrate de estar en la carpeta `restaurante`
```bash
cd restaurante
pwd  # Verifica la ruta
```

### "rejected... (non-fast-forward)"
**Solución:** Haz un pull primero
```bash
git pull origin main
git push
```

### ".env aparece en Git"
**Solución:** Agrégalo a .gitignore y quítalo del historial
```bash
# Primero, agrega a .gitignore (ya está incluido)

# Quita del historial
git rm --cached .env
git commit -m "Remove .env from tracking"
git push
```

### "Authentication failed"
**Solución:** Usa un token en lugar de contraseña (ver arriba)

---

## 🧪 Verificar que Todo Funciona

### En Local (Antes de Push)

```bash
# Abre el archivo en el navegador
# Windows: start index.html
# Mac: open index.html

# O usa un servidor:
python -m http.server 8000
# Accede a http://localhost:8000
```

### En GitHub Pages (Después de Push)

1. Accede a tu URL: `https://tu-usuario.github.io/restaurante`
2. Abre la consola (F12 → Console)
3. Verifica que no hay errores de conexión a Supabase
4. Si ves errores, revisa tu `config.js`

---

## 🔒 Checklist de Seguridad

Antes de hacer push, verifica:

- [ ] `.env.local` está en `.gitignore`
- [ ] No veo `.env` en `git status`
- [ ] El `.gitignore` existe y tiene contenido
- [ ] No subí credenciales en `config.js` (están en variables)

```bash
# Para estar seguro, usa:
git status

# No debe mostrar .env ni .env.local
```

---

## 📚 Recursos Útiles

- **Documentación Git:** https://git-scm.com/doc
- **GitHub Pages:** https://pages.github.com/
- **Supabase:** https://supabase.com/docs
- **Markdown (para README):** https://guides.github.com/features/mastering-markdown/

---

## ✅ ¿Listo?

Sigue los pasos en orden y tendrás tu sitio en GitHub Pages en 10 minutos.

**Cualquier duda:** Revisa los errores en la consola (F12) o contacta soporte.

¡Éxito! 🚀
