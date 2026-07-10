'use client';

import { useState } from 'react';
import Button from '@/components/common/Button';
import { formatDate } from '@/utils/formatDate';

/**
 * ReviewList component for displaying reviews
 * @param {Object} props
 * @param {Array} props.reviews - Array of review objects
 * @param {number} props.averageRating - Average rating (optional)
 * @param {number} props.totalReviews - Total number of reviews (optional)
 * @param {Function} props.onEdit - Callback when edit is clicked (optional)
 * @param {Function} props.onDelete - Callback when delete is clicked (optional)
 * @param {number} props.currentUserId - Current user ID to show edit/delete options (optional)
 * @param {boolean} props.loading - Loading state (optional)
 */
export default function ReviewList({ 
  reviews = [], 
  averageRating, 
  totalReviews,
  onEdit, 
  onDelete, 
  currentUserId,
  loading = false 
}) {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    setDeletingId(reviewId);
    try {
      await onDelete(reviewId);
    } catch (error) {
      console.error('Error deleting review:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
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
        ))}
        <span className="ml-2 text-sm text-gray-600 dark:text-slate-300">{rating}/5</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      {(averageRating !== undefined || totalReviews !== undefined) && (
        <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-lg">
          <div className="flex items-center gap-4">
            {averageRating !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {averageRating.toFixed(1)}
                </span>
                {renderStars(Math.round(averageRating))}
              </div>
            )}
            {totalReviews !== undefined && (
              <span className="text-sm text-gray-600 dark:text-slate-300">
                ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
              </span>
            )}
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-slate-400">
          <p>No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div 
              key={review.id} 
              className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-500 dark:text-slate-400">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {review.reviewer?.name || 'Anonymous'}
                    <span className="ml-2 text-xs text-gray-500 dark:text-slate-400">
                      ({review.reviewerRole})
                    </span>
                  </p>
                </div>

                {/* Edit/Delete Actions */}
                {currentUserId && review.reviewerId === currentUserId && (
                  <div className="flex gap-2">
                    {onEdit && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(review)}
                      >
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(review.id)}
                        disabled={deletingId === review.id}
                      >
                        {deletingId === review.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {review.comment && (
                <p className="text-gray-700 dark:text-slate-200 mt-3">{review.comment}</p>
              )}

              {/* Show what was reviewed */}
              {(review.restaurant || review.ngo) && (
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                  Reviewed: {review.restaurant?.shopName || review.ngo?.ngoName}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
