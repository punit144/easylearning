const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Server is running'));
app.listen(3001, () => console.log('Backend on port 3001'));
