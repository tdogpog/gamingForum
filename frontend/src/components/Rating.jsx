import { Rating as MuiRating } from "@mui/material";
import PropTypes from "prop-types";

export default function RatingComponent({ userRating, onSubmitRating }) {
  const handleRatingChange = (event, newValue) => {
    if (newValue !== null) {
      onSubmitRating(newValue);
    }
  };

  return (
    <div>
      <h3>Your Rating:</h3>
      <MuiRating
        name="user-rating"
        value={userRating}
        precision={0.5}
        onChange={handleRatingChange}
      />
    </div>
  );
}

RatingComponent.propTypes = {
  userRating: PropTypes.number,
  onSubmitRating: PropTypes.func.isRequired,
};
