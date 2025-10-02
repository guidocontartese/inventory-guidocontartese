# Sistema de Gestión de Inventario

Sistema de gestión de inventario desarrollado con Node.js, Express y PostgreSQL, diseñado para despliegue en AWS Elastic Beanstalk.

## Descripción

Aplicación web Progressive Web App (PWA) para gestionar inventario de productos con funcionalidades completas de CRUD (Crear, Leer, Actualizar, Eliminar). Incluye dashboard con estadísticas y funciona completamente offline.

## Tecnologías Utilizadas

- **Backend**: Node.js, Express.js
- **Base de Datos**: PostgreSQL
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **PWA**: Service Worker, Web App Manifest
- **Cloud**: AWS Elastic Beanstalk, AWS RDS
- **Herramientas**: dotenv para configuración

## Características

- ✅ Gestión completa de productos (CRUD)
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Progressive Web App (PWA)
- ✅ Funcionalidad offline
- ✅ Responsive design
- ✅ API RESTful
- ✅ Health check endpoint
- ✅ Preparado para AWS Elastic Beanstalk

## Instalación Local

### Prerrequisitos
- Node.js >= 18.x
- PostgreSQL >= 12
- npm >= 9.x

### Pasos de instalación

1. **Clonar el repositorio**:
```bash
git clone https://github.com/guidocontartese/inventory-guidocontartese.git
cd inventory-guidocontartese
```

2. **Instalar dependencias**:
```bash
npm install
```

3. **Configurar variables de entorno**:
Editar el archivo `.env` con tus configuraciones:
```env
PORT=80
RDS_HOSTNAME=localhost
RDS_USERNAME=postgres
RDS_PASSWORD=tu_password
RDS_DB_NAME=inventory_db
RDS_PORT=5432
DB_TYPE=postgresql
NODE_ENV=development
```

4. **Crear la base de datos**:
```sql
CREATE DATABASE inventory_db;
```

5. **Ejecutar la aplicación**:
```bash
npm start
```

La aplicación estará disponible en `http://localhost`

## API Endpoints

### Productos
- `GET /api/products` - Obtener todos los productos
- `GET /api/products/:id` - Obtener un producto específico
- `POST /api/products` - Crear nuevo producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto

### Estadísticas
- `GET /api/stats` - Obtener estadísticas del inventario

### Salud
- `GET /health` - Health check endpoint

## Estructura del Proyecto

```
inventory-guidocontartese/
├── public/                 # Archivos del frontend
│   ├── app.js             # Lógica principal de la aplicación
│   ├── index.html         # Página principal
│   ├── manifest.json      # Manifest de PWA
│   └── sw.js             # Service Worker
├── .env                   # Variables de entorno (no incluir en Git)
├── server.js              # Servidor Express
├── package.json           # Dependencias y configuración
├── README.md              # Este archivo
└── LICENSE               # Licencia MIT
```

## Despliegue en AWS Elastic Beanstalk

### Preparación del ZIP

1. **Archivos a incluir**:
   - `server.js`
   - `package.json`
   - `public/` (carpeta completa)
   - `.env` (opcional, mejor usar variables de entorno de AWS)

2. **Crear el ZIP**:
```bash
zip -r inventory-app.zip server.js package.json public/ -x "node_modules/*" ".git/*"
```

### Configuración en AWS

1. **Subir el ZIP a Elastic Beanstalk**

2. **Configurar variables de entorno** en Configuration → Software:
   - `PORT=80`
   - `RDS_HOSTNAME=tu-rds-endpoint.region.rds.amazonaws.com`
   - `RDS_USERNAME=postgres`
   - `RDS_PASSWORD=tu-password-seguro`
   - `RDS_DB_NAME=inventory_db`
   - `RDS_PORT=5432`
   - `NODE_ENV=production`

3. **Configurar RDS PostgreSQL**:
   - Crear instancia RDS PostgreSQL
   - Configurar Security Groups para permitir conexión desde EB
   - Crear la base de datos `inventory_db`

## Scripts Disponibles

- `npm start` - Ejecutar en producción
- `npm run dev` - Ejecutar con nodemon para desarrollo
- `npm test` - Ejecutar tests (pendiente implementar)

## Base de Datos

### Tabla Products
```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Desarrollo

### Agregar nuevas funcionalidades
1. Fork del repositorio
2. Crear rama para nueva feature
3. Desarrollar y probar
4. Crear Pull Request

### Variables de entorno para desarrollo
```env
PORT=3000
RDS_HOSTNAME=localhost
RDS_USERNAME=postgres
RDS_PASSWORD=5788
RDS_DB_NAME=inventory_db
RDS_PORT=5432
NODE_ENV=development
```

## Licencia

MIT License - ver archivo [LICENSE](LICENSE) para más detalles.

## Autor

**Guido Contartese**
- GitHub: [@guidocontartese](https://github.com/guidocontartese)

## Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork del proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## Soporte

Si encuentras algún problema o tienes preguntas:

1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue si es necesario

---

**Versión**: 1.0.0  
**Última actualización**: Octubre 2025
