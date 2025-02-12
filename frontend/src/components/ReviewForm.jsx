import { useState } from "react";
import PropTypes from "prop-types";
export default function ReviewForm({
  user,
  userReview,
  handleDeleteReview,
  onSubmitReview,
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false); //editing state

  const handleToggleForm = () => {
    setIsFormVisible(!isFormVisible);
    if (userReview.review !== null) {
      setIsEditing(true);
    }
  };

  const handleEditReview = () => {
    setTitle(userReview.title || "");
    setContent(userReview.content || "");
    setIsFormVisible(true);
    setIsEditing(true); //form appears instead of the review
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitReview(title, content);
    setIsFormVisible(true);
    setIsEditing(false);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    handleDeleteReview();
    setIsFormVisible(false);
    setIsEditing(false);
  };

  return (
    <div>
      <button onClick={handleToggleForm} className="toggleButton">
        Review
      </button>
      {isFormVisible && !isEditing && userReview.review !== null && (
        <div>
          <h4>{user.username}</h4>
          <h4>{userReview.title}</h4>
          <p>{userReview.content}</p>
          <button onClick={handleEditReview}>Edit Review</button>
          <button onClick={handleDelete}>Delete Review</button>
        </div>
      )}
      {isFormVisible && (isEditing || !userReview.review) && (
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
              {userReview ? "Update Review" : "Submit Review"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
ReviewForm.propTypes = {
  user: PropTypes.object,
  userReview: PropTypes.object,
  handleDeleteReview: PropTypes.func.isRequired,
  onSubmitReview: PropTypes.func.isRequired,
};
