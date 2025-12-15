# Guía de Inicio Rápido (PowerShell)

Sigue estos pasos para ejecutar tu **Tutor de Inglés con IA**.

## 1. Abrir PowerShell y Navegar
Abre tu terminal (PowerShell) y entra a la carpeta del proyecto:

```powershell
cd c:\Users\Usuario\Documents\Proyectos\backend-node
```

## 2. Instalar Dependencias
Si es la primera vez que lo usas, instala las librerías necesarias:

```powershell
npm install
```

## 3. Configurar tu API Key (Google Gemini)
Para que el tutor sea inteligente, necesita una clave.
1. Crea un archivo llamado `.env` en esta carpeta.
2. Escribe tu clave dentro del archivo así:

```text
LLM_API_KEY=tu_clave_secreta_aqui
```
*(Si no tienes clave, el sistema usará el modo "Mock" de prueba automáticamente)*.

## 4. Ejecutar el Tutor
Escribe este comando para iniciar la aplicación:

```powershell
npx ts-node src/tutor-app.ts
```

---
**Problemas Comunes:**
- *Error de scripts deshabilitados*: Ejecuta `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`.
- *Error "ts-node" no reconocido*: Asegúrate de ejecutar `npm install` primero.

## 5. Comandos Útiles de PowerShell

| Acción | Comando | Ejemplo |
| :--- | :--- | :--- |
| **Cambiar carpeta** | `cd` | `cd src` (Entra a carpeta src) |
| **Listar archivos** | `dir` o `ls` | `dir` (Muestra qué hay) |
| **Leer archivo (en consola)** | `type` o `cat` | `type README.md` |
| **Editar archivo (Notepad)** | `notepad` | `notepad .env` |
| **Editar archivo (VS Code)** | `code` | `code .env` |

