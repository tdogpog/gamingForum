import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Rating as MuiRating } from "@mui/material";

export default function ReviewForm({
  user,
  userReview,
  handleDeleteReview,
  onSubmitReview,
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Update form state when userReview changes
  useEffect(() => {
    if (userReview && userReview.content) {
      setTitle(userReview.title || "");
      setContent(userReview.content || "");
    }
  }, [userReview]); // Runs when userReview updates

  const handleToggleForm = () => {
    setIsFormVisible(!isFormVisible);
    if (!userReview || !userReview.content) {
      setIsEditing(true); // no review, open form for new entry
    } else {
      setIsEditing(false);
    }
  };

  const handleEditReview = () => {
    setIsFormVisible(true);
    setIsEditing(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitReview(title, content);
    setIsEditing(false);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    handleDeleteReview();
    setTitle("");
    setContent("");
    setIsFormVisible(false);
    setIsEditing(false);
  };

  console.log("userreview form", userReview);

  return (
    <div>
      <button onClick={handleToggleForm} className="toggleButton">
        Review
      </button>

      {/* Show existing review if it exists and not editing */}
      {isFormVisible && !isEditing && userReview?.content && (
        <div>
          <h4>{user.username}</h4>
          <p>{userReview.createdAt}</p>
          <MuiRating
            name="user-rating"
            value={userReview.rating?.score || 0}
            precision={0.5}
            readOnly
          />
          <h4>{userReview.title}</h4>
          <p>{userReview.content}</p>
          <button onClick={handleEditReview}>Edit Review</button>
          <button onClick={handleDelete}>Delete Review</button>
        </div>
      )}

      {/* Show form if creating a new review or editing */}
      {isFormVisible && (!userReview?.content || isEditing) && (
        <div className="reviewFormContainer visible">
          <form onSubmit={handleSubmit} className="newReviewForm">
            <div className="formGroup">
              <label htmlFor="title">Title (Optional)</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
              />
            </div>
            <div className="formGroup">
              <label htmlFor="content">Content</label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Review Content"
                cols="70"
                rows="15"
                required
              ></textarea>
            </div>
            <button type="submit" className="submitButton">
              {userReview?.content ? "Update Review" : "Submit Review"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

ReviewForm.propTypes = {
  user: PropTypes.object.isRequired,
  userReview: PropTypes.object,
  handleDeleteReview: PropTypes.func.isRequired,
  onSubmitReview: PropTypes.func.isRequired,
};
