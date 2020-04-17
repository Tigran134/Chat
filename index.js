const express = require('express');
const router = express.Router();
const path = require('path');
const hbs = require('hbs')
const { Strategy } = require("passport-jwt")
const mongoose = require('mongoose');
const Message = require('./models/message');
const moment = require('moment');
const app = express();
const cookieParser = require("cookie-parser");
const server = require('http').Server(app);
const io = require('socket.io')(server, { serverClient: true });
const VKontakteStrategy = require('passport-vkontakte').Strategy;
const passport = require("passport");
const findOrCreate = require('mongoose-findorcreate')
const User = require("./models/user");
mongoose.connect('mongodb+srv://elbrus:bootCamp2020@cluster-qfwn0.mongodb.net/chat?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });



app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(`${__dirname}/views/templates/`, function (err) { });
app.use(cookieParser());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
})

app.use(passport.initialize());
app.use(passport.session());


// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
// parse application/json
app.use(express.json());

app.get('/auth/vkontakte',
passport.authenticate('vkontakte'),
function(req, res){
  // The request will be redirected to vk.com for authentication, so
  // this function will not be called.
});

app.get('/auth/vkontakte/callback',
passport.authenticate('vkontakte', { failureRedirect: '/1' }),
function(req, res) {
  // Successful authentication, redirect home.
  res.redirect('/2');
});




passport.use(new VKontakteStrategy({
  clientID:  '7413895', // VK.com docs call it 'API ID', 'app_id', 'api_id', 'client_id' or 'apiId'
  clientSecret: 'TKougbJgTKoPtugjCXWs',
  callbackURL:  "http://localhost:3000/auth/vkontakte/callback"
},
function(accessToken, refreshToken, params, profile, done) {
 // getting the email
  User.findOrCreate({ vkontakteId: profile.id, name: profile.displayName, photo: profile.photos[0].value}, function (err, user) {
    return done(err, user);
  });
  
}

));


// passport.use(
  
//   new VKontakteStrategy({
  
//   clientID: '7413895', // VK.com docs call it 'API ID', 'app_id', 'api_id', 'client_id' or 'apiId'
//   clientSecret: 'TKougbJgTKoPtugjCXWs',
//   callbackURL:  "http://localhost:3000/auth/vkontakte/callback"
// },
// async function(accessToken, refreshToken, params, profile, done) {
//   console.log(profile);
  
//   const a = await User.findOne({vkontakteId:profile.id})
//   console.log(a);
  
//   User.findOrCreate({ vkontakteId: profile.id }, function (err, User) {
    
//     return done(err, User);
//   });
// }

// )

// );










app.get('/', async (req, res, next) => {
  let allMessages = await Message.find({ type: 'message' }).populate('messages').sort({ date: 1 });
  // правим дату сообщений перед отправкой
  // #### Доделать время!
  // allMessages.forEach(item => {
  //   item.date = moment().startOf(`${item.date}`).fromNow();
  // })
  res.render('index', { allMessages: allMessages });
});

// При подключении пользователя
io.on('connection', (socket) => {
  // Передаем ему сообщение 'You are connected'
  socket.emit('connected', 'You are connected');
  //создание комнаты 
  socket.join('all');
  // Формирование и отправка сообщения на фронт
  socket.on('msg', async content => {

    // создаем message по модели Message
    let newMessage = new Message({
      username: "Yurii",
      content: content,
      likes: 0,
      date: moment().format("MMM Do YY"),
      messages: [],
      type: 'message'
    });

    // console.log(newMessage)
    // Записываем mesaage в базу Mongo
    await newMessage.save();
    // берем _id у newMessage из Mongo
    const newMessageId = await Message.findOne({ content: `${content}` });
    // и кладем его в объект, который уходит на фронт
    newMessage.id = newMessageId['_id'];
    //Отправка на фронт
    socket.emit("message", newMessage)
    //Отправка всем остальным пользователям
    socket.to('all').emit("message", newMessage)
  });
  //
  //
  // 
  // Ожидаем получить объект data: {content, id }
  //Формирование и отправка комментария на фронт
  socket.on('cmt', async data => {
    const parent = await Message.findById(data.id);

    // Создаем comment по модели Message
    let newComment = new Message({
      username: 'Vasya',
      content: `${data.content}`,
      likes: 0,
      date: `${new Date}`,
      type: 'comment'
    });
    // Записываем comment в базу Mongo
    await newComment.save();

    parent.messages.push(newComment);
    parent.markModified('messages');
    await parent.save();

    const obj = newComment.toObject();
    obj.parentId = parent._id;
    socket.emit("comment", obj);
    socket.to('all').emit("comment", obj);

  });

  
});
server.listen(3000)
// server.listen(3000, '0.0.0.0', () => {
//   console.log('Server started on post 3000')
// })








