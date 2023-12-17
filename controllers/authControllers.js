const User = require('../models/User');
const bcrypt = require('bcrypt');

const authController = {
  getRegister: (req, res) => {
    res.render('signup');
  },

  postRegister: async (req, res) => {
    const { username, email, password } = req.body;
  
    try {
      const existingUser = await User.findOne({ username }).lean();
  
      if (existingUser) {
        return res.redirect('/signup?error=Nombre%20de%20usuario%20ya%20en%20uso');
      }
  
      // Hash de la contraseña antes de almacenarla en la base de datos
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Crear un nuevo usuario
      const newUser = await User.create({ username, email, password: hashedPassword });
  
      // Autenticar al usuario y redirigir a la página de inicio
      req.session.user = newUser;
      res.redirect('/profile');
    } catch (error) {
      console.error(error);
      res.redirect('/signup?error=Error%20interno%20del%20servidor');
    }
  },

  getLogin: (req, res) => {
    console.log(__dirname)
    res.render('user/login');
  },

  postLogin: async (req, res) => {
    const { username, password } = req.body;

    try {
      console.log('Antes de findOne');
      const user = await User.findOne({ username });
      console.log('Después de findOne');

      if (user && (await bcrypt.compare(password, user.password))) {
        // Autenticar al usuario y redirigir a la página de inicio
        req.session.user = user;
        res.redirect('/profile');
      } else {
        res.status(401).json({ error: 'Datos incorrectos' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  postLogout: (req, res) => {
    // Cerrar la sesión y redirigir a la página de inicio
    req.session.destroy();
    res.redirect('/');
  },
};

module.exports = authController;
