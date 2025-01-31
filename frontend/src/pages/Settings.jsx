import { useLocation } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export default function Settings() {
  const { state } = useLocation();
  const user = state?.userData;

  const [formData, setFormData] = useState({
    bio: user.bio || "",
    email: user.email || "",
    profile_picture: user.profile_picture || "",
  });
  const [uploaded, setUploaded] = useState(false); // track the upload status
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, files, type } = e.target;

    //file input
    if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0], //unique syntax for accessing a file since it gets stored as an object
      }));

      setUploaded(true); //track that a new file has been uploaded for UI update
    } else {
      // For other form inputs, update as usual
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedFields = {};

    //object.keys() retrusn an array of all keys
    // so bio,email,profilepicture
    //for each key, compare to the formData keys
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== user[key]) {
        updatedFields[key] = formData[key]; //add changed fields to updatedFields object
      }
    });

    // Only submit if there's at least one change
    if (Object.keys(updatedFields).length > 0) {
      console.log("Sending updated fields: ", updatedFields);
      try {
        const token = localStorage.getItem("token"); // Or use context to get token if needed
        await axios.put(`${backend}settings`, updatedFields, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        setError("Error fetching user profile."); // Handle errors
        console.error("Error fetching user profile:", error);
      }
    } else {
      alert("No changes to submit");
    }
  };

  return (
    <div>
      <h2>Edit Profile</h2>
      {uploaded && <p style={{ color: "green" }}>Successful upload!</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Profile Picture
          <input
            type="file"
            name="profile_picture"
            value={formData.profile_picture}
            onChange={handleChange}
          />
        </label>

        <br />
        <label>
          Bio:
          <textarea name="bio" value={formData.bio} onChange={handleChange} />
        </label>
        <br />
        <label>
          Email:
          <input name="email" value={formData.email} onChange={handleChange} />
        </label>
        <br />
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}
