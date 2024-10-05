// import { useEffect, useRef, useState } from "react";
// import "./chat.css"
// import EmojiPicker from "emoji-picker-react";
// import { arrayUnion, doc, getDoc, onSnapshot, updateDoc, } from "firebase/firestore";
// import { db } from "../../lib/firebase";
// import { useChatStore } from "../../lib/chatStore";
// import { useUserStore } from "../../lib/userStore";
// import upload from "../../lib/upload";

// const Chat = () => {
//   const [chat, setChat] = useState();
//   const [open, setOpen] = useState(false);
//   const [text, setText] = useState("");
//   const [img, setImg] = useState({
//     file: null,
//     url: "",
//   });


//   const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();
//   const { currentUser } = useUserStore();

//   const endRef = useRef(null);

//   useEffect(() => {
//     endRef.current?.scrollIntoView({ behaviour: "smooth" });
//   }, [chat]);

//   useEffect(() => {
//     const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
//       setChat(res.data())
//     });

//     return () => {
//       unSub();
//     }
//   }, [chatId]);


//   const handleEmoji = (e) => {
//     setText((prev) => prev + e.emoji);
//     setOpen(false)
//   }

//   const handleImg = (e) => {
//     if (e.target.files[0]) {
//       setImg({
//         file: e.target.files[0],
//         url: URL.createObjectURL(e.target.files[0])
//       })
//     }
//   }

//   const handleSend = async () => {
//     if (text === "") return;
//     let imgUrl = null

//     try {

//       if (img.file) {
//         imgUrl = await upload(img.file);
//       }
//       await updateDoc(doc(db, "chats", chatId), {
//         messages: arrayUnion({
//           senderId: currentUser.id,
//           text,
//           createdAt: new (Date),
//           ...(imgUrl && { img: imgUrl }),
//         }),
//       });

//       // console.log(currentUser, user)
//       const userIds = [currentUser?.id, user?.id];
//       // console.log(userIds)

//       userIds.forEach(async (id) => {


//         const userChatsRef = doc(db, "userchats", id);
//         const userChatsSnapshot = await getDoc(userChatsRef);

//         if (userChatsSnapshot.exists()) {
//           const userChatsData = userChatsSnapshot.data();

//           const chatIndex = userChatsData.chats.findIndex((c) => c.chatId === chatId);
//           userChatsData.chats[chatIndex].lastMessage = text;
//           userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
//           userChatsData.chats[chatIndex].updatedAt = Date.now();

//           await updateDoc(userChatsRef, {
//             chats: userChatsData.chats
//           })

//         }
//       })
//     } catch (err) {
//       console.log(err)
//     }
//     setImg({
//       file: null,
//       url: ""
//     })

//     setText("")
//   }



//   return (
//     <div className='chat'>
//       <div className="top">
//         <div className="user">
//           <img src={user?.avatar || "./avatar.png"} alt="" />
//           <div className="texts">
//             <span>{user?.username}</span>
//           </div>
//         </div>
//         <div className="icons">
//           <img src="./phone.png" alt="" />
//           <img src="./video.png" alt="" />
//           <img src="./info.png" alt="" />
//         </div>
//       </div>
//       <div className="center">
//         {chat?.messages?.map((message, key) => (
//           <div className={message.senderId === currentUser?.id ? "message own" : "message"} key={key}>
//             <div className="texts">
//               {message.img && <img src={message.img} alt="" />}
//               <p>{message.text}
//               </p>
//               {/* <span>1 min ago</span> */}
//             </div>
//           </div>
//         ))}
//         {img.url && <div className="message own">
//           <div className="texts">
//             <img src={img.url} alt="" />
//           </div>
//         </div>}
//         <div ref={endRef}></div>
//       </div>
//       <div className="bottom">
//         <div className="icons">
//           <label htmlFor="file">
//             <img src="./img.png" alt="" />
//           </label>
//           <input type="file" id="file" style={{ display: "none" ,
//              cursor: isCurrentUserBlocked || isReceiverBlocked ? "not-allowed" : "pointer" }} onChange={handleImg}
//              disabled={isCurrentUserBlocked || isReceiverBlocked} />
          
//           <img src="./mic.png" alt="" />
//         </div>
//         <input type="text" placeholder={
//           isCurrentUserBlocked || isReceiverBlocked
//             ? "You cannot send a message"
//             : "Type a message..."
//         }
//           value={text}
//           onChange={e => setText(e.target.value)} disabled={isCurrentUserBlocked || isReceiverBlocked} />

//         <div className="emoji">
//           <img src="./emoji.png" alt="" onClick={() => setOpen((prev) => !prev)} />
//           <div className="picker">
//             <EmojiPicker open={open} onEmojiClick={handleEmoji} /></div>
//         </div>
//         <button className="sendButton" onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked}>Send</button>
//       </div>
//     </div>
//   )
// }

// export default Chat


import { useEffect, useRef, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";
import { format } from "timeago.js";

const Chat = () => {
  const [chat, setChat] = useState();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [img, setImg] = useState({
    file: null,
    url: "",
  });

  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  // const handleSend = async () => {
  //   if (text === "") return;

  //   let imgUrl = null;

  //   try {
  //     if (img.file) {
  //       imgUrl = await upload(img.file);
  //     }

  //     await updateDoc(doc(db, "chats", chatId), {
  //       messages: arrayUnion({
  //         senderId: currentUser.id,
  //         text,
  //         createdAt: new Date(),
  //         ...(imgUrl && { img: imgUrl }),
  //       }),
  //     });

  //     const userIDs = [currentUser.id, user.id];

  //     userIDs.forEach(async (id) => {
  //       const userChatsRef = doc(db, "userchats", id);
  //       const userChatsSnapshot = await getDoc(userChatsRef);

  //       if (userChatsSnapshot.exists()) {
  //         const userChatsData = userChatsSnapshot.data();

  //         const chatIndex = userChatsData.chats.findIndex(
  //           (c) => c.chatId === chatId
  //         );

  //         userChatsData.chats[chatIndex].lastMessage = text;
  //         userChatsData.chats[chatIndex].isSeen =
  //           id === currentUser.id ? true : false;
  //         userChatsData.chats[chatIndex].updatedAt = Date.now();

  //         await updateDoc(userChatsRef, {
  //           chats: userChatsData.chats,
  //         });
  //       }
  //     });
  //   } catch (err) {
  //     console.log(err);
  //   } finally{
  //   setImg({
  //     file: null,
  //     url: "",
  //   });

  //   setText("");
  //   }
  // };

  const handleSend = async () => {
    // Check if there is neither text nor image to send
    if (text === "" && !img.file) return;
  
    let imgUrl = null;
  
    try {
      // Upload the image if it exists
      if (img.file) {
        imgUrl = await upload(img.file);
      }
  
      // Prepare the message object
      const message = {
        senderId: currentUser.id,
        text: text.trim() || null, // Send text as null if it's empty
        createdAt: new Date(),
        ...(imgUrl && { img: imgUrl }), // Attach image URL if exists
      };
  
      // Update chat with the message
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion(message),
      });
  
      // Update user chats
      const userIds = [currentUser?.id, user?.id];
      userIds.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);
  
        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          const chatIndex = userChatsData.chats.findIndex((c) => c.chatId === chatId);
  
          if (chatIndex !== -1) {
            userChatsData.chats[chatIndex].lastMessage = imgUrl ? 'Image sent' : text.trim(); // Handle last message text
            userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
            userChatsData.chats[chatIndex].updatedAt = Date.now();
  
            await updateDoc(userChatsRef, {
              chats: userChatsData.chats
            });
          }
        }
      });
    } catch (err) {
      console.log(err);
    } finally {
      // Reset image and text after sending
      setImg({ file: null, url: "" });
      setText("");
    }
  };
  

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.username}</span>
            <p>Lorem ipsum dolor, sit amet.</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </div>
      </div>
      <div className="center">
        {chat?.messages?.map((message) => (
          <div
            className={
              message.senderId === currentUser?.id ? "message own" : "message"
            }
            key={message?.createAt}
          >
            <div className="texts">
              {message.img && <img src={message.img} alt="" />}
              <p>{message.text}</p>
              <span>{format(message.createdAt.toDate())}</span>
            </div>
          </div>
        ))}
        {img.url && (
          <div className="message own">
            <div className="texts">
              <img src={img.url} alt="" />
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" alt="" />
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleImg}
          />
          <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" />
        </div>
        <input
          type="text"
          placeholder={
            isCurrentUserBlocked || isReceiverBlocked
              ? "You cannot send a message"
              : "Type a message..."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />
        <div className="emoji">
          <img
            src="./emoji.png"
            alt=""
            onClick={() => setOpen((prev) => !prev)}
          />
          <div className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button
          className="sendButton"
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;