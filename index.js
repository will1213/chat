const app = require('express')();
const cookieParser = require('cookie-parser');
const express = require('express')
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const cookie = require('cookie');

const names = ["Keira","Bonnie","Tabitha","Katherine","Josie","Kayleigh","Emmie","Ashley","Kelly","Bethan"];
const users = [];
const TotalMessages = [];
const connections = [];
class User {
  consturctor(name,RGB){
    this.name = name;
    this.RGB = RGB;
  }
}
app.use(cookieParser());

app.get('/', (req, res) => {

  if(req.cookies.user==undefined){
    var name = names[0];
    names.shift();
    users.push(name);
    res.cookie ("user",name, { maxAge: 60 * 60 * 1000 });
    //console.log("unddddddddddd");
  }else{
    setTimeout(() => {}, 10);
    if(users.includes(req.cookies.user)){
      var name = names[0];
      names.shift();
      users.push(name);
      res.cookie ("user",name, { maxAge: 60 * 60 * 1000 });
    }
    else{
    var name = req.cookies.user;
    users.push(name);
    }

  }
  res.sendFile(__dirname + '/client/index.html');
  //res.clearCookie("user");
});


app.use(express.static('client'));

io.on('connection', (socket) => {

  var cookies = cookie.parse(socket.request.headers.cookie || '');
  name = cookies.user;

  console.log(cookies);
  socket.emit('your name',name);
  console.log("user connect ", name);
  socket.emit('update messages',TotalMessages);
  //var name = names[0];
  //var cookies = cookie.parse(`user=${name};`);
  //var cookies = cookie.parse('user=will');
  //socket.request.headers.cookie("user",name,{ maxAge: 60 * 60 * 1000 });
  //socket.request.headers.cookie = "user="+name;

  //
  //var name = names[0];
  //names.shift();
  //users.push(name);

  //console.log(cookies);
  //console.log(name);
  //names.shift();
 // users.push(name);
  var RGB = "000000";
  //socket.emit('your name',name);
  io.emit('update user', users);
  console.log("users : "+users.length);
  //socket.emit('chat log',TotalMessages);

    socket.on('command', (msg)=>{
      name = cookie.parse(socket.request.headers.cookie || '').user;
      if(msg.includes("/name ")){
        NewName = msg.substr(msg.indexOf(" ")+1,msg.length);
        if(users.includes(NewName)){
          socket.emit('invalid');
        }else{
        names.push(name);
        users.splice(users.findIndex(element => element === name),1,NewName);
        for (obj of TotalMessages){
          if (obj.Name === name){
            obj.Message=obj.Message.replace(name,NewName);
            obj.Name = NewName;
          }
        }
        name = NewName;
        socket.emit('your name',name);
        io.emit('update user', users);
        io.emit('update messages',TotalMessages);
      }
      }
      else if(msg.includes("/color ")){
        NewColor = msg.substr(msg.indexOf(" ")+1,msg.length);
        RGB=NewColor;
        for (obj of TotalMessages){
          if (obj.Name === name){
            obj.Color = RGB;
          }
        }
        console.log("total message:"+ TotalMessages);
        io.emit('update messages',TotalMessages);
      }
      else{
        socket.emit('invalid');
      }
    })

    socket.on('chat message', (msg) => {
      name = cookie.parse(socket.request.headers.cookie || '').user;
        console.log('message: ' + name +msg); 
        if (msg.includes(":)")){
          msg = msg.replace(":)","&#128513")
        }
        if(msg.includes(":(")){
          msg = msg.replace(":(","&#128577")
        }
        if(msg.includes(":o")){
          msg = msg.replace(":o","&#128562")
        }
        var now = new Date();
        for (mes of TotalMessages){
          if (mes.Name === name){
            RGB = mes.Color;
            break;
          }
        }
        var message = {Color:RGB,Message:now.getHours()+":"+now.getMinutes()+ " "+name+":"+msg,Name:name};
        if (TotalMessages.length >= 200){
          TotalMessages.shift();
        }
        
        TotalMessages.push(message);

        //console.log("Total Message :"+TotalMessages[0].Color);
        io.emit('chat message', {message:now.getHours()+":"+now.getMinutes()+ " "+name +":"+msg, color:RGB});
    });

      socket.on('disconnect', () => {
      name = cookie.parse(socket.request.headers.cookie || '').user;
      console.log('user disconnected');
      names.push(name);
      users.splice(users.findIndex(element => element === name),1);
      io.emit('update user', users);
      //console.log("usres:++",users.length);
      //console.log("total users:",users);
    });
  });
var port_number = (process.env.PORT || 3000);
http.listen(port_number, () => {
  console.log('listening on *:',port_number);
});
