import { useLocation } from "react-router-dom";
import { useState } from "react";

export default function Settings() {
  const { state } = useLocation();
  const user = state?.userData;

  const [formData, setFormData] = useState({
    bio: user?.bio || "",
    email: user?.email || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated Data: ", formData);
  };

  return (
    <div>
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input
            type="text"
            name="username"
            value={formData.username}
            disabled
          />
        </label>
        <br />
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Bio:
          <textarea name="bio" value={formData.bio} onChange={handleChange} />
        </label>
        <br />
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}
