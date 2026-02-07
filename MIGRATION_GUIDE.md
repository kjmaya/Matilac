# Migración a Base de Datos Neon PostgreSQL

## 📋 Pasos para la migración

### 1. Configurar la Base de Datos en Neon

1. Accede a tu database en Neon con la URL proporcionada:
   ```bash
   psql 'postgresql://neondb_owner:npg_Cc7B8nSIjtKO@ep-patient-field-adc7pmyn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
   ```

2. Ejecuta el schema de la base de datos:
   ```sql
   \i database/schema.sql
   ```

3. Ejecuta los datos iniciales:
   ```sql
   \i database/initial_data.sql
   ```

### 2. Configurar Variables de Entorno en Vercel

1. Ve a tu proyecto en Vercel Dashboard
2. Accede a **Settings** > **Environment Variables**
3. Agrega la siguiente variable:

```
DATABASE_URL = postgresql://neondb_owner:npg_Cc7B8nSIjtKO@ep-patient-field-adc7pmyn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

4. **Elimina las variables anteriores de GitHub:**
   - `GITHUB_TOKEN`
   - `GITHUB_OWNER`  
   - `GITHUB_REPO`

### 3. Instalar Dependencias

Ejecuta en tu terminal:

```bash
npm install
```

### 4. Probar Localmente

```bash
npx vercel dev
```

### 5. Desplegar a Producción

```bash
npx vercel --prod
```

## 🗃️ Estructura de la Base de Datos

### Tablas Principales

- **personas**: Información base de personas (empleados y clientes)
- **empleados**: Usuarios del sistema con roles
- **clientes**: Clientes de Matilac
- **categorias**: Categorías de productos (Lácteos, Panadería, Otros)
- **productos**: Productos disponibles
- **variantes_producto**: Variantes como sabores, tamaños, tipos
- **pedidos**: Pedidos realizados
- **detalle_pedidos**: Items de cada pedido
- **costos**: Registro de gastos
- **pagos**: Pagos recibidos

### Datos Iniciales Incluidos

#### Categorías:
- 🥛 Lácteos
- 🥖 Panadería  
- 🍯 Otros

#### Productos:
- **Yogurt** (con sabores: Durazno, Fresa, Mora, Guanábana, Feijoa)
- **Queso** (tipos: Campesino, Doble Crema, Pera)
- **Arepas** (Boyacense, de Chocolo)
- **Envueltos** (Normal, Especial)
- Almojábanas, Rellenas, Panela, Huevos, Longaniza

#### Usuario por defecto:
- **Usuario**: admin
- **Contraseña**: admin123

## 🔄 Cambios en la Aplicación

### APIs Creadas:
- `/api/config` - Configuración de la aplicación
- `/api/productos` - Gestión de productos
- `/api/categorias` - Gestión de categorías  
- `/api/pedidos` - Gestión de pedidos
- `/api/costos` - Gestión de costos

### Frontend:
- Nuevo cliente de base de datos (`js/database-client.js`)
- Reemplaza el sistema anterior de GitHub
- Mantiene la misma interfaz de usuario

## 🚀 Ventajas de la Nueva Implementación

1. **Base de datos real** - PostgreSQL en lugar de archivos JSON
2. **Mejor rendimiento** - Consultas optimizadas
3. **Integridad de datos** - Claves foráneas y validaciones
4. **Escalabilidad** - Soporta más usuarios y datos
5. **Funcionalidades avanzadas** - Filtros, búsquedas, reportes
6. **Auditoría** - Registro de cambios
7. **Seguridad** - Mejores controles de acceso

## 🔧 Configuración Adicional (Opcional)

### Para desarrollo local con base de datos:

1. Instala PostgreSQL localmente
2. Crea una base de datos llamada `matilac_dev`
3. Configura `DATABASE_URL` en archivo `.env.local`:
   ```
   DATABASE_URL=postgresql://usuario:password@localhost:5432/matilac_dev
   ```

### Para backups:

```bash
# Exportar datos
pg_dump "postgresql://neondb_owner:npg_Cc7B8nSIjtKO@ep-patient-field-adc7pmyn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" > backup.sql

# Restaurar datos
psql "postgresql://..." < backup.sql
```

## ⚠️ Notas Importantes

1. **Migración de datos**: Si tienes datos existentes en GitHub, necesitarás migrarlos manualmente
2. **Credenciales**: Nunca commits las credenciales de la base de datos al repositorio
3. **Testing**: Prueba todas las funcionalidades después de la migración
4. **Monitoreo**: Neon ofrece dashboards para monitorear el rendimiento

## 🆘 Solución de Problemas

### Error de conexión:
- Verifica que `DATABASE_URL` esté configurada en Vercel
- Confirma que la base de datos esté activa en Neon

### Errores de SQL:
- Revisa los logs de Vercel en el dashboard
- Verifica que el schema se haya ejecutado completamente

### Performance:
- Neon tiene límites en el plan gratuito
- Considera optimizar queries si hay lentitud
