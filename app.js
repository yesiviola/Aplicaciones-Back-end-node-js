const express = require('express');
const app = express();
const path = require('path');
const mysql = require('mysql2');
const bodyParser = require('body-parser'); 

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'xyzLDyese#arge3528',
  database: 'inventarios'
});


app.set('view engine', 'ejs');

// Conexión a la base de datos
connection.connect((err) => {
  if (err) throw err;
  console.log('Conexión exitosa a la base de datos');
});



app.post('/api/productos', (req, res) => {

  const { nombre, cantidad, precio } = req.body;

  if (!nombre || !cantidad || !precio) {
    return res.status(400).json({ error: 'Por favor, completa todos los campos del formulario.' });
  }

  if (isNaN(cantidad) || isNaN(precio)) {
    return res.status(400).json({ error: 'La cantidad y el precio deben ser números válidos.' });
  }
  const sql = 'INSERT INTO productos (nombre, cantidad, precio) VALUES (?, ?, ?)';
  connection.query(sql, [nombre, cantidad, precio], (err, result) => {
    if (err) {
      console.error('Error al insertar el producto:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    const nuevoId = result.insertId;

    const obtenerProductoSql = 'SELECT * FROM productos WHERE id = ?';
    connection.query(obtenerProductoSql, [nuevoId], (err, producto) => {
      if (err) {
        console.error('Error al obtener el producto recién creado:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      res.json(producto[0]);
    });
  });
});

app.get('/api/productos/buscar/:nombre', (req, res) => {
  const productName = req.params.nombre;

  const sql = 'SELECT * FROM productos WHERE nombre LIKE ?';
  connection.query(sql, [`%${productName}%`], (err, result) => {
    if (err) {
      console.error('Error al buscar productos por nombre:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

  
    res.json(result);
  });
});

app.get('/api/productos/:id', (req, res) => {
  const productId = req.params.id;

  const sql = 'SELECT * FROM productos WHERE id = ?';
  connection.query(sql, [productId], (err, result) => {
    if (err) {
      console.error('Error al obtener el producto:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(result[0]);
  });
});

app.get('/api/productos', (req, res) => {

  const sortby = req.query.sortby || 'nombre'; 

  let sql = 'SELECT * FROM productos ';

  switch (sortby) {
    case 'id':
    case 'cantidad':
      sql += `ORDER BY ${sortby}`;
      break;
    case 'nombre':
      sql += 'ORDER BY nombre COLLATE utf8mb4_unicode_ci';
      break;
    case 'precio':
      sql += 'ORDER BY precio + 0'; 
      break;
    default:
      sql += 'ORDER BY nombre';
  }

  connection.query(sql, (err, result) => {
    if (err) {
      console.error('Error al obtener los productos:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    res.json(result);
  });
});


app.get('/api/productos', (req, res) => {

  const sql = 'SELECT * FROM productos';
  connection.query(sql, (err, result) => {
    if (err) {
      console.error('Error al obtener los productos:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

  
    res.json(result);
  });
});


app.get('/', (req, res) => {
  // Obtener los productos desde la base de datos
  const sortby = req.query.sortby || 'nombre'; 
  let sql = 'SELECT * FROM productos ';

  switch (sortby) {
    case 'id':
    case 'cantidad':
      sql += `ORDER BY ${sortby}`;
      break;
    case 'nombre':
      sql += 'ORDER BY nombre COLLATE utf8mb4_unicode_ci';
      break;
    case 'precio':
      sql += 'ORDER BY precio + 0'; 
      break;
    default:
      sql += 'ORDER BY nombre';
  }

  
  connection.query(sql, (err, result) => {
    if (err) {
      console.error('Error al obtener los productos:', err);
      return res.status(500).send('Error interno del servidor');
    }

  
    res.render('index', { productos: result, totalproductos: result.length });
  });
});


app.use(bodyParser.urlencoded({ extended: true }));


app.post('/agregar_producto', (req, res) => {
  
  const { nombre, cantidad, precio } = req.body;

  if (!nombre || !cantidad || !precio) {
    return res.send('Por favor, completa todos los campos del formulario.');
  }


  if (isNaN(cantidad) || isNaN(precio)) {
    return res.send('La cantidad y el precio deben ser números válidos.');
  }

  const sql = 'INSERT INTO productos (nombre, cantidad, precio) VALUES (?, ?, ?)';
  connection.query(sql, [nombre, cantidad, precio], (err, result) => {
    if (err) {
      console.error('Error al insertar el registro:', err);
      return res.status(500).send('Error interno del servidor');
    }
    console.log('Producto agregado a la base de datos:', result);
    res.redirect('/'); 
  });
});

app.get('/eliminar_producto/:id', (req, res) => {
  const productId = req.params.id;

  const sql = 'SELECT * FROM productos WHERE id = ?';
  connection.query(sql, [productId], (err, result) => {
    if (err) {
      console.error('Error al consultar el producto:', err);
      return res.status(500).send('Error interno del servidor');
    }

    if (result.length === 0) {
      return res.send('Producto no encontrado en la base de datos.');
    }

    const deleteSql = 'DELETE FROM productos WHERE id = ?';
    connection.query(deleteSql, [productId], (err, result) => {
      if (err) {
        console.error('Error al eliminar el producto:', err);
        return res.status(500).send('Error interno del servidor');
      }
      console.log('Producto eliminado de la base de datos:', result);
      res.redirect('/'); 
    });
  });
});


app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; font-src 'self' http://localhost:3000 data:; img-src 'self' https://uploads-ssl.webflow.com"
  );
  next();
});


app.listen(3000, () => {
  console.log('Servidor iniciado en el puerto 3000');
});

