// import { toast } from "react-toastify"
// import "./login.css"
// import { useState } from "react"
// import {
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
// } from "firebase/auth";
// import { auth, db } from "../../lib/firebase";
// import { doc, setDoc } from "firebase/firestore";
// import upload from "../../lib/upload";


// const Login = () => {
//   const [avatar, setAvatar] = useState({
//     file: null,
//     url: ""
//   })

//   const [loading, setLoading] = useState(false)

//   const handleAvatar = (e) => {
//     if (e.target.files[0]) {
//       setAvatar({
//         file: e.target.files[0],
//         url: URL.createObjectURL(e.target.files[0])
//       })
//     }console.log(err)
//     toast.error(err.message)
//   }

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     const formData = new FormData(e.target);
//     const { email, password } = Object.fromEntries(formData);

//     try {
//       await signInWithEmailAndPassword(auth, email, password);
//       toast.success("Logged in successfully!");
//     } catch (err) {
//       console.log(err);
//       toast.error(err.message);
//     }
//     finally {
//       setLoading(false);
//     }
//   };

//   const handleRegister = async (e) => {
//     e.preventDefault()
//     setLoading(true);
//     const formData = new FormData(e.target);
//     const { username, email, password } = Object.fromEntries(formData);

//     try {
//       const res = await createUserWithEmailAndPassword(auth, email, password);

//       console.log(avatar)
//       const imgUrl = await upload(avatar);

//       await setDoc(doc(db, "users", res.user.uid), {
//         username,
//         email,
//         avatar: imgUrl,
//         id: res.user.uid,
//         blocked: [],
//       });


//       await setDoc(doc(db, "userchats", res.user.uid), {
//         chats: [],
//       });

//       toast.success(" Account created!,You can now Login!");
//       window.location.reload();
//     } catch (err) {
//       console.log(err);
//       toast.error(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className='login'>
//       <div className="item">
//         <h2>Welcome Back</h2>
//         <form onSubmit={handleLogin}>
//           <input type="email" placeholder="Email" name="email" />
//           <input type="password" placeholder="Password" name="password" />
//           <button disabled={loading}>{loading ? "Loading" : "Sign In"}</button>
//         </form>
//       </div>
//       <div className="separator"></div>
//       <div className="item">
//         <h2>Don't have an account?</h2>
//         <form onSubmit={handleRegister}>
//           <label htmlFor="file">
//             <img src={avatar.url || "./avatar.png"} alt="Selected avatar" />
//             Upload an image
//           </label>
//           <input type="file" id="file" style={{ display: "none" }} onChange={handleAvatar} />
//           <input type="text" placeholder="Username" name="username" />
//           <input type="email" placeholder="Email" name="email" />
//           <input type="password" placeholder="Password" name="password" />
//           <button disabled={loading}>{loading ? "Loading" : "Sign up"}</button>
//         </form>

//       </div>
//     </div>
//   )
// }


// export default Login;




import { toast } from "react-toastify"
import "./login.css"
import { useState } from "react"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import upload from "../../lib/upload";


const Login = () => {
  const [avatar, setAvatar] = useState({
    file: null,
    url: ""
  });

  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);  // Add state to toggle between login and register

  const toggleForm = () => {
    setIsRegister(!isRegister);  // Toggle between login and register form
  };

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0])
      });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged in successfully!");
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formData);

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      const imgUrl = await upload(avatar);

      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        avatar: imgUrl,
        id: res.user.uid,
        blocked: [],
      });

      await setDoc(doc(db, "userchats", res.user.uid), {
        chats: [],
      });

      toast.success("Account created! You can now log in.");
      window.location.reload();
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="item">
        <h2>{isRegister ? "Create an Account" : "Welcome Back"}</h2>
        <form onSubmit={isRegister ? handleRegister : handleLogin}>
          {isRegister && (
            <>
              <label htmlFor="file">
                <img src={avatar.url || "./avatar.png"} alt="Selected avatar" />
                Upload an image
              </label>
              <input
                type="file"
                id="file"
                style={{ display: "none" }}
                onChange={handleAvatar}
              />
              <input type="text" placeholder="Username" name="username" />
            </>
          )}
          <input type="email" placeholder="Email" name="email" />
          <input type="password" placeholder="Password" name="password" />
          <button disabled={loading}>
            {loading ? "Loading" : isRegister ? "Sign Up" : "Sign In"}
          </button>
        </form>
        <div className="link">
          <span>{isRegister ? "Already have an account?" : "Don't have an account?"}</span>
          <a onClick={toggleForm}>
            {isRegister ? "Sign in here" : "Register here"}
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;




