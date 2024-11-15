// Import required modules
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');

// Initialize the app and set the port
const app = express();
const PORT = 3000;

// Set up body-parser to handle form data
// Express built-in middleware for URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Set up public folder for static files (CSS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Set up view engine to serve HTML files from the 'templates' directory
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);  // Using EJS to render HTML files

// MySQL Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Raahi@12345@',
  database: 'hotel_management_system'
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    return;
  }
  console.log('Connected to MySQL database');
});

// Route to render the homepage
app.get('/', (req, res) => {
  res.render('homepage'); // Renders 'homepage.html' from the templates folder
});

// Staff
app.get('/staff', (req, res) => {
  res.render('staff'); // Renders 'staff.html' from the templates folder
});
// Route to handle adding a new staff member
app.post('/add-staff', (req, res) => {
  const { firstName, lastName, position, email, phoneNumber } = req.body;
  const query = 'INSERT INTO staff (first_name, last_name, position, email, phone_number) VALUES (?, ?, ?, ?, ?)';

  db.query(query, [firstName, lastName, position, email, phoneNumber], (err, result) => {
    if (err) throw err;
    res.redirect('/staff'); // Redirect back to staff page
  });XMLDocument.js
});
//rneder rooms 
app.get('/rooms', (req, res) => {
  res.render('rooms');
});
app.post('/add-rooms', (req, res) => {
  const { roomNumber, roomTypeId, price } = req.body;
  const query = `INSERT INTO rooms (room_number, room_type_id, price, created_at)
                 VALUES (?, ?,?, CURRENT_TIMESTAMP)`;
  
  db.query(query, [roomNumber, roomTypeId, price], (err, result) => {
    if (err) throw err;
    res.redirect('/rooms'); // Redirect back to rooms page
  });
});


app.get('/fetch-rooms', (req, res) => {
  const query = 'SELECT * FROM rooms';
  db.query(query, (err, results) => {
      if (err) throw err;
      res.json(results); // Send room data as JSON
  });
});


// Route to get a single room by room_id for editing
app.get('/get-room/:room_id', (req, res) => {
  const { room_id } = req.params;
  const query = 'SELECT * FROM rooms WHERE room_id = ?';
  db.query(query, [room_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error fetching room data');
    }
    if (results.length === 0) {
      return res.status(404).send('Room not found');
    }
    res.json(results[0]); // Send the first result back as JSON
  });
});

// Route to update room data
app.post('/update-room', (req, res) => {
  const { room_id, room_number, room_type_id, price, status } = req.body;
  const query = `
    UPDATE rooms
    SET room_number = ?, room_type_id = ?, price = ?, status = ?
    WHERE room_id = ?
  `;
  db.query(query, [room_number, room_type_id, price, status, room_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error updating room data');
    }
    res.redirect('/'); // Adjust based on your application's flow
  });
});






//Route to render Bookings page
app.get('/bookings',(req,res)=>{
  res.render('bookings');
});
app.post('/add-booking', (req, res) => {
  const { customer_id, room_id, check_in, check_out, number_of_guests, total_amount, room_type } = req.body;
  const query = 'INSERT INTO bookings (customer_id, room_id, check_in, check_out, number_of_guests, total_amount, room_type) VALUES (?, ?, ?, ?, ?, ?, ?)';
  
  // Notice booking_id is not included here
  db.query(query, [customer_id, room_id, check_in, check_out, number_of_guests, total_amount, room_type], (err, result) => {
    if (err) throw err;
    res.redirect('/bookings'); // Redirect back to the bookings page after submission
  });
});
// Route to call the stored procedure to get bookings by customer_id
app.post('/get-bookings-by-customer', (req, res) => {
  const customerId = req.body.customer_id;

  if (!customerId) {
      return res.status(400).json({ message: 'Customer ID is required' });
  }

  const query = 'CALL GetBookingsByCustomer(?)';
  db.query(query, [customerId], (err, results) => { // Use 'db.query' instead of 'connection.query'
      if (err) {
          console.error('Error executing stored procedure:', err);
          return res.status(500).json({ message: 'Error fetching bookings' });
      }

      // Get the bookings from the results (MySQL returns it as an array)
      const bookings = results[0]; // The first element contains the rows

      // Log the results to the console
      console.log('Bookings for Customer ID ' + customerId + ':', bookings);

      // Optionally, send a success response to the client
      res.json({ message: 'Bookings fetched successfully, check server console for details.' });
  });
});

// Assuming you have a database connection established as 'db'

// Route to handle the form submission and search customers by room type
app.post('/search-customers', (req, res) => {
  const roomTypeId = req.body.room_type_id;
  console.log('Received room type ID:', roomTypeId);

  if (!roomTypeId) {
      return res.status(400).json({ error: 'Room Type ID is required' });
  }

  const query = `
      SELECT c.customer_id, c.first_name, c.last_name, c.email, c.phone_number, c.address
      FROM customers c
      JOIN bookings b ON c.customer_id = b.customer_id
      JOIN room_types rt ON b.room_type = rt.type_name
      WHERE rt.type_name = 'Suite';

  `;
  db.query(query, [roomTypeId], (err, results) => {
      if (err) {
          console.error('Error fetching customer data:', err);
          return res.status(500).json({ error: 'Database error' });
      }
      res.json(results);
  });
});



// Route to render reviews page
app.get('/reviews', (req, res) => {
  db.query('SELECT * FROM reviews', (err, results) => {
    if (err) throw err;
    res.render('reviews', { reviews: results });  // Pass review data to the reviews page
  });
});

// Route to handle adding a review
app.post('/add-review', (req, res) => {
  const { customer_id, room_id, rating, review_text } = req.body;
  const query = 'INSERT INTO reviews (customer_id, room_id, rating, review_text) VALUES (?, ?, ?, ?)';

  db.query(query, [customer_id, room_id, rating, review_text], (err, result) => {
    if (err) throw err;
    res.redirect('/reviews'); // Redirect back to the reviews page after submission
  });
});

// Route to render room types page
app.get('/room_types', (req, res) => {
  db.query('SELECT * FROM room_types', (err, results) => {
    if (err) throw err;
    res.render('room_types', { room_types: results });  // Pass room type data to the room_types page
  });
});

// Route to handle adding a new room type
app.post('/add-room-type', (req, res) => {
  const { room_type_id, type_name, description} = req.body;
  const query = 'INSERT INTO room_types (room_type_id, type_name, description) VALUES (?, ?, ?)';
  
  db.query(query, [room_type_id, type_name, description], (err, result) => {
    if (err) throw err;
    res.redirect('/room_types'); // Redirect back to the room types page after submission
  });
});

// Route to render services page
app.get('/services', (req, res) => {
  db.query('SELECT * FROM services', (err, results) => {
    if (err) throw err;
    res.render('services', { services: results });  // Pass services data to the services page
  });
  
});

// Route to handle adding a new service
app.post('/add-service', (req, res) => {
  const {service_id, service_name, description, price } = req.body;
  const query = 'INSERT INTO services (service_id, service_name, description, price) VALUES (?, ?, ?, ?)';
  
  db.query(query, [service_id, service_name, description, price], (err, result) => {
    if (err) throw err;
    res.redirect('/services'); // Redirect back to the services page after submission
  });
});

// Route to render payments page
app.get('/payments', (req, res) => {
  res.render('payments'); // Renders 'payments.html' from the templates folder
});

// Route to handle adding a payment entry
app.post('/add-payment', (req, res) => {
  const { booking_id, payment_date, amount, payment_method } = req.body;
  const query = 'INSERT INTO payments (booking_id, payment_date, amount, payment_method) VALUES (?, ?, ?, ?)';

  db.query(query, [booking_id, payment_date, amount, payment_method], (err, result) => {
    if (err) throw err;
    res.redirect('/payments');
  });
});

// Route to render customers page
app.get('/customers', (req, res) => {
  db.query('SELECT * FROM customers', (err, results) => {
    if (err) throw err;
    res.render('customers', { customers: results });  // Pass customer data to the customers page
  });
});

// Route to handle adding a new customer
app.post('/add-customer', (req, res) => {
  const { first_name, last_name, email, phone_number, address } = req.body;
  const query = 'INSERT INTO customers (first_name, last_name, email, phone_number, address) VALUES (?, ?, ?, ?, ?)';

  db.query(query, [first_name, last_name, email, phone_number, address], (err, result) => {
    if (err) throw err;
    res.redirect('/customers'); // Redirect back to the customers page after submission
  });
});

// Route to render discounts page
app.get('/discounts', (req, res) => {
  res.render('discounts');
});


// Route to handle adding a new discount
app.post('/add-discount', (req, res) => {
  const { discount_code, description, discount_percentage, start_date, end_date } = req.body;
  const query = 'INSERT INTO discounts (discount_code, description, discount_percentage) VALUES (?, ?, ?)';

  db.query(query, [discount_code, description, discount_percentage, start_date, end_date], (err, result) => {
    if (err) throw err;
    res.redirect('/discounts'); // Redirect back to the discounts page
  });
});
app.post('/update-discount', (req, res) => {
  const { discount_code, discountType, discountValue } = req.body;
  const query = 'UPDATE discounts SET description = ?, discount_percentage = ? WHERE discount_code = ?';

  db.query(query, [discountType, discountValue, discount_code], (err, result) => {
    if (err) throw err;
    res.redirect('/discounts'); // Redirect back to the discounts page after the update
  });
});







// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
