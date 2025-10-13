const express = require('express');
const router = express.Router();
const multer = require('multer');
const { UserController } = require('../controllers');

const uploadDestination = 'uploads';

//Показываем где хранить файлы
const storage = multer.diskStorage({
  destination: uploadDestination,
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const uploads = multer({ storage: storage });

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/current', UserController.currentUser);
router.get('/users/:id', UserController.getUserById);
router.put('/users/:id', UserController.updateUser);

module.exports = router;
