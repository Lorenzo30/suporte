import firebase from "../forebaseConnection";
export const getContactList = (userId) => {
   return (dispatch) => {
      firebase.database().ref('users').orderByChild('name').once('value').then((snapshot) => {
         let users = [];

         snapshot.forEach((childItem) => {
            if (childItem.key != userId) {
               users.push({
                  key: childItem.key,
                  name: childItem.val().name,
                  foto: childItem.val().foto,
                  online:childItem.val().online
               });
            }

         });

         dispatch({
            type: "setContatoList",
            payload: {
               users: users,
               carregouConatos: true
            }
         });

      });


   };

};

export const createChat = (userUid, userUid2) => {
   return (dispatch) => {

      firebase.database().ref("users").child(userUid).child("chats").orderByChild("user2").equalTo(userUid2).once("value").then((snapshot) => {
         if (snapshot.val() != null) {
            snapshot.forEach((childItem) => {
               dispatch({
                  type: "setActiveChat",
                  payload: {
                     chatId: childItem.key,
                     idUser2:userUid2
                  }
               });
            })
         } else {
            //Criando o propio chat
            let newChat = firebase.database().ref("chats").push();
            newChat.child("members").child(userUid).set({
               id: userUid
            });

            newChat.child("members").child(userUid2).set({
               id: userUid2
            });
            //Associando aos envolvidos
            let chatId = newChat.key;

            let tokenID2 =  null;
            firebase.database().ref("users").child(userUid2).child("devices").once("value").then((snapshot) => {
               snapshot.forEach((childItem) => {
                  console.log("aquii" + childItem.val().token)
                  tokenID2 = childItem.val().token;
               })
            }).then(() => {
               firebase.database().ref("users").child(userUid2).once("value").then((snapshot) => {
                  firebase.database().ref("users").child(userUid).child("chats").child(chatId).set({
                     id: chatId,
                     title: snapshot.val().name,
                     user2: snapshot.key,
                     foto: snapshot.val().foto,
                     tokenUser2: tokenID2,
                     online2: snapshot.val().online,
                     notificacao:0
                  })
               });
            });

            let tokenID1 = null;
            firebase.database().ref("users").child(userUid).child("devices").once("value").then((snapshot) => {
               snapshot.forEach((childItem) => {
                  console.log("aquii" + childItem.val().token)
                  tokenID1 = childItem.val().token;
               })
            }).then(() => {
               firebase.database().ref("users").child(userUid).once("value").then((snapshot) => {
                  firebase.database().ref("users").child(userUid2).child("chats").child(chatId).set({
                     id: chatId,
                     title: snapshot.val().name,
                     user2: snapshot.key,
                     foto: snapshot.val().foto,
                     tokenUser2: tokenID1,
                     online2: snapshot.val().online,
                     notificacao:0
                  }).then(() => {
                     dispatch({
                        type: "setActiveChat",
                        payload: {
                           chatId: chatId,
                           idUser2:userUid2
                        }
                     });

                  })
               }); 


            })
         }
      })
   }
}
  
     
export const getChatList = (userUid) => {
   return (dispatch) => {
      firebase.database().ref("users").child(userUid).child("chats").on("value", (snapshot)  => {
         console.log('message firebase: ', snapshot)
         let logado = 33;
         let chats = [];
              
            snapshot.forEach((childItem) => {
               //Verificando usuario online
               firebase.database().ref("users").child(childItem.val().user2).once("value").then((snapshot) => {
                  logado = snapshot.val().online
               })
               .then(() => {
                  if (!chats.find(a => a.key == childItem.key)) {
                        chats.push({
                        key: childItem.key,  
                        title: childItem.val().title,
                        foto: childItem.val().foto,
                        tokenUser2: childItem.val().tokenUser2,
                        online2: logado,
                        user2:childItem.val().user2,
                        notificacao:childItem.val().notificacao
                     })
                  }
               }) 
            })
         
               dispatch({
                  type: "setChatList",
                  payload: {
                     chats,
                  }
               });
         console.log('my chats', chats)
               
   })
   }
}



export const setActiveChat = (chatId) => {
   return {
      type: "setActiveChat",
      payload: {
         chatId: chatId
      }

   };
}

export const sendMessage = (msgType, msgContent, author, activeChat,author2) => {
   return (dispatch) => {

      let msgId = firebase.database().ref("chats").child(activeChat).child("messages").push();

      firebase.database().ref("users").child(author2).child("chats").child(activeChat).child("notificacao").set("+1");
        

      let currentDate = "";
      let cDate = new Date();

      currentDate = cDate.getUTCFullYear()+"/"+(cDate.getUTCMonth() + 1)+"/"+cDate.getUTCDate();
      currentDate += " ";
      currentDate += cDate.getUTCHours()+":"+cDate.getUTCMinutes()+":"+cDate.getUTCSeconds();
      switch (msgType) {
         case "text":
            msgId.set({

               msgType: "text",
               date: currentDate,
               m: msgContent,
               uid: author

            })
            break;

         case "image":
            msgId.set({
               msgType: "image",
               date: currentDate,
               imgSource: msgContent,
               uid: author

            })
      }

   }


}



export const monitorChat = (activeChat,idUser) => {
   return (dispatch) => {
      
      //lendo mensagem
    
      firebase.database().ref("chats").child(activeChat).child("messages").orderByChild("date").on("value", (snapshot) => {
         let arrayMsg = [];

         firebase.database().ref("users").child(idUser).child("chats").child(activeChat).child("notificacao").set(0);

         snapshot.forEach((childItem) => {
                  arrayMsg.push({
                     key: childItem.key,
                     date: childItem.val().date,
                     msgType: "text",
                     m: childItem.val().m,
                     uid: childItem.val().uid
                  })

         })

         dispatch({
            type: "setActiveChatMessage",
            payload: {
               msgs: arrayMsg
            }

         })
      })


   };

}

export const monitorChatOff = (activeChat) => {
   return (dispatch) => {

      firebase.database().ref("chats").child(activeChat).child("messages").off();


   };



}












