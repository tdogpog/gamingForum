import { useState } from "react";
import PropTypes from "prop-types";

export default function ReviewForm({
  userReview,
  handleDeleteReview,
  onSubmitReview,
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleToggleForm = () => {
    setIsFormVisible(!isFormVisible);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitReview(title, content);
    setIsFormVisible(false);
  };

  return (
    <div>
      {/* toggle logic */}
      {!userReview ? (
        <button onClick={handleToggleForm} className="toggleButton">
          {isFormVisible ? "Cancel" : "Write a Review"}
        </button>
      ) : (
        <div>
          {!isFormVisible ? (
            <div>
              <h4>{userReview.title}</h4>
              <p>{userReview.content}</p>
              <button onClick={() => setIsFormVisible(true)}>
                Edit Review
              </button>
              <button onClick={handleDeleteReview}>Delete Review</button>
            </div>
          ) : null}
        </div>
      )}

      {/* css logic for styling  */}
      <div className={`reviewFormContainer ${isFormVisible ? "visible" : ""}`}>
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
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
}

ReviewForm.propTypes = {
  userReview: PropTypes.object,
  setUserReview: PropTypes.func.isRequired,
  handleDeleteReview: PropTypes.func.isRequired,
  onSubmitReview: PropTypes.func.isRequired,
};
