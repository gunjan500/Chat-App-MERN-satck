import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "./firebase";

const upload = async (imageFile) => {
    console.log(imageFile);

    // Generate a unique name for the file using a timestamp
    const uniqueName = `${new Date().getTime()}-${imageFile.file.name}`;
    const storageRef = ref(storage, `images/${uniqueName}`);

    const uploadTask = uploadBytesResumable(storageRef, imageFile.file);

    return new Promise((resolve, reject) => {
        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress =
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log("Upload is " + progress + "% done");
            },
            (error) => {
                reject("Something went wrong! " + error.code);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL); // Return the download URL after the upload is complete
                });
            }
        );
    });
};

export default upload;
