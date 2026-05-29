'use client';

import { useState } from 'react';
import Button from '@/components/common/Button';
import { Textarea } from '@/components/common/Input';

/**
 * ReviewForm component for submitting reviews
 * @param {Object} props
 * @param {number} props.restaurantId - Restaurant ID to review (optional)
 * @param {number} props.ngoId - NGO ID to review (optional)
 * @param {number} props.foodRequestId - Food request ID related to review (optional)
 * @param {Function} props.onSubmit - Callback when review is submitted
 * @param {Function} props.onCancel - Callback when form is cancelled
 */
export default function ReviewForm({ restaurantId, ngoId, foodRequestId, onSubmit, onCancel }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate rating
    if (rating === 0) {
      setErrors({ rating: 'Please select a rating' });
      return;
    }

    // Validate that either restaurantId or ngoId is provided
    if (!restaurantId && !ngoId) {
      setErrors({ general: 'Either restaurant or NGO must be specified' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await onSubmit({
        rating,
        comment: comment.trim() || null,
        restaurantId: restaurantId || null,
        ngoId: ngoId || null,
        foodRequestId: foodRequestId || null
      });
    } catch (error) {
      setErrors({ general: error.message || 'Failed to submit review' });
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <svg
              className={`w-8 h-8 ${
                star <= (hoverRating || rating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Select rating'}
        </span>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">
          {restaurantId ? 'Review Restaurant' : 'Review NGO'}
        </h3>
      </div>

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating *
        </label>
        {renderStars()}
        {errors.rating && (
          <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
        )}
      </div>

      {/* Comment */}
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
          Comment (optional)
        </label>
        <Textarea
          id="comment"
          name="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
          rows={4}
          maxLength={1000}
        />
        <p className="mt-1 text-sm text-gray-500">
          {comment.length}/1000 characters
        </p>
      </div>

      {/* General Error */}
      {errors.general && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{errors.general}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Review'}
        </Button>
      </div>
    </form>
  );
}
