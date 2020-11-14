$(function () {
    var myName = null;
    var socket = io();

    $('form').submit(function(e) {
      e.preventDefault(); // prevents page reloading
      var message = $('#m').val();
      if (message.includes("/")){
          //console.log("command");
          socket.emit('command', message);
          //console.log(message);
      }else{
      socket.emit('chat message', $('#m').val());
      }
      $('#m').val('');
      return false;
    });

    socket.on('invalid', (msg)=>{
        alert("invalid inputs");
      })

    socket.on('chat message', function(msg){
        console.log("cookies:",document.cookie)
        console.log(myName+"   "+msg.message);

        if (msg.message.includes(myName)){

            const mydiv = document.createElement("li")
            mydiv.innerHTML = msg.message;
            mydiv.className = "me";
            //console.log("color:"+msg.color);
            mydiv.style.cssText = `color:#${msg.color}`;
            $('#messages').append(mydiv);

        }else{
        const mydiv2 = document.createElement("li")
        mydiv2.innerHTML = msg.message;
        mydiv2.style.cssText = `color:#${msg.color}`;
        $('#messages').append(mydiv2);
        }
        var messages = $('.message');
        messages.scrollTop(messages.prop('scrollHeight'));
    });

    socket.on('your name', (name)=>{
        myName=name;
        document.cookie= `user=${name}`;
        console.log("cookies:",document.cookie);
    })

    socket.on('update user', (users) => {
        $('#users').empty();
        const mydiv = document.createElement("li")
        mydiv.innerHTML = myName + "(You)";
        mydiv.className = "myname";
        $('#users').append(mydiv);
        for (user of users){
            if (user!==myName){
                $('#users').append($('<li>').text(user));
            }

        }
    })

    socket.on('update messages',(TotalMessages)=>{
        $('#messages').empty();
        for (message of TotalMessages){
            const mydiv = document.createElement("li")
            mydiv.innerHTML = message.Message;
            mydiv.style.cssText = `color:#${message.Color}`;
            if (message.Name===myName){
                mydiv.className="me";
            }
            $('#messages').append(mydiv);
        }
    })
  });

//window.addEventListener("DOMContentLoaded",myName = document.cookie.user);