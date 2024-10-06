


import { useEffect, useRef, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  doc,
  onSnapshot,
  updateDoc,
  arrayRemove,
} from "firebase/firestore";
import { db, storage } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";
import { format } from "timeago.js";
import UserInfoModal from "./UserInfoModal.jsx";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const Chat = () => {
  const [chat, setChat] = useState();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [img, setImg] = useState({ file: null, url: "" });
  const [selectedMessage, setSelectedMessage] = useState(null);

  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState([]); // Use state to manage audio chunks
  const [showUserInfo, setShowUserInfo] = useState(false);

  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();

  const endRef = useRef(null);
  let mediaRecorder;

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

  const handleInfoClick = () => {
    setShowUserInfo(true);
  };

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleImg = async (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setImg({
        file: file,
        url: URL.createObjectURL(file),
      });

      // Upload image to Firebase Storage
      try {
        const storageRef = ref(storage, `images/${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        await updateDoc(doc(db, "chats", chatId), {
          messages: arrayUnion({
            senderId: currentUser.id,
            img: downloadURL,
            createdAt: new Date(),
          }),
        });
      } catch (error) {
        console.error("Error uploading image: ", error);
      }
    }
  };

  const openCamera = () => {
    document.getElementById("file").click(); // Programmatically click the file input
  };

  const startRecording = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.start();
        setIsRecording(true);
        setAudioChunks([]); // Reset audio chunks on start

        mediaRecorder.ondataavailable = (event) => {
          setAudioChunks((prevChunks) => [...prevChunks, event.data]);
          console.log("Audio data available:", event.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          console.log("Recording stopped, uploading audio...");
          await uploadAudio(audioBlob);
        };
      } catch (error) {
        console.error("Error accessing microphone:", error);
      }
    } else {
      console.error("getUserMedia not supported on your browser!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      console.log("Recording stopped.");
    }
  };

  const uploadAudio = async (audioBlob) => {
    const storageRef = ref(storage, `audio/${Date.now()}.wav`);
    await uploadBytes(storageRef, audioBlob);
    const downloadURL = await getDownloadURL(storageRef);

    await updateDoc(doc(db, "chats", chatId), {
      messages: arrayUnion({
        senderId: currentUser.id,
        audio: downloadURL,
        createdAt: new Date(),
      }),
    });
    console.log("Audio uploaded successfully:", downloadURL);
  };

  const handleSend = async () => {
    if (text === "" && !img.file) return;

    let imgUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }

      const message = {
        senderId: currentUser.id,
        text: text.trim(),
        createdAt: new Date(),
        ...(imgUrl && { img: imgUrl }),
      };

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion(message),
      });

      setImg({ file: null, url: "" });
      setText("");
    } catch (err) {
      console.log(err);
    }
  };

  // Handle message selection and show delete button
  const handleSelectMessage = (message) => {
    setSelectedMessage(message === selectedMessage ? null : message); // Toggle selection
  };

  const handleDelete = async (message) => {
    try {
      const chatRef = doc(db, "chats", chatId);
      await updateDoc(chatRef, {
        messages: arrayRemove(message),
      });
      console.log("Message deleted successfully");
    } catch (err) {
      console.log(err);
    } finally {
      setSelectedMessage(null); // Deselect the message after deletion
    }
  };

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.username}</span>
            {/* Add additional user info if necessary */}
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" onClick={handleInfoClick} />

          {showUserInfo && (
            <UserInfoModal
              user={user} // Ensure user data is passed correctly
              onClose={() => setShowUserInfo(false)} // Close handler
            />
          )}
        </div>
      </div>

      <div className="center">
        {chat?.messages?.map((message) => (
          <div
            className={
              message.senderId === currentUser?.id ? "message own" : "message"
            }
            key={message.createdAt}
            onClick={() => handleSelectMessage(message)} // Click to select message
          >
            <div className="texts">
              {message.img && <img src={message.img} alt="" />}
              <p>{message.text}</p>
              {message.audio && (
                <audio controls>
                  <source src={message.audio} type="audio/wav" />
                  Your browser does not support the audio element.
                </audio>
              )}
              <span>{format(message.createdAt.toDate())}</span>

              {selectedMessage === message && (
                <button
                  className="deleteButton"
                  onClick={() => handleDelete(message)}
                >
                  Delete
                </button>
              )}
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
            accept="image/*"
            capture="camera"
            style={{ display: "none" }}
            onChange={handleImg}
          />
          <label htmlFor="camera" onClick={openCamera}>
            <img src="./camera.png" alt="" />
          </label>
          <div onClick={isRecording ? stopRecording : startRecording}>
            <img src="./mic.png" alt="" style={{ color: isRecording ? 'red' : 'black' }} />
          </div>
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
