
import { useState } from 'react';
import { Event } from '../types/Event';

interface RSVPFormProps {
  event: Event;
  onSuccess: () => void;
  onCancel: () => void;
}

const RSVPForm = ({ event, onSuccess, onCancel }: RSVPFormProps) => {
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.userName.trim()) {
      newErrors.userName = 'Name is required';
    }
    
    if (!formData.userEmail.trim()) {
      newErrors.userEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.userEmail)) {
      newErrors.userEmail = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API calls
      // Step 1: Create/find user
      const userResponse = await simulateCreateUser(formData.userName, formData.userEmail);
      
      // Step 2: Create RSVP
      await simulateCreateRSVP(userResponse.userId, event.id);
      
      // Store RSVP in localStorage for persistence
      const existingRSVPs = JSON.parse(localStorage.getItem('userRSVPs') || '[]');
      existingRSVPs.push({
        eventId: event.id,
        eventName: event.eventName,
        userName: formData.userName,
        userEmail: formData.userEmail,
        rsvpDate: new Date().toISOString()
      });
      localStorage.setItem('userRSVPs', JSON.stringify(existingRSVPs));
      
      onSuccess();
    } catch (error) {
      console.error('RSVP failed:', error);
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simulate API call to create/find user
  const simulateCreateUser = async (userName: string, userEmail: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { userId: `user_${Date.now()}` };
  };

  // Simulate API call to create RSVP
  const simulateCreateRSVP = async (userId: string, eventId: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { id: `rsvp_${Date.now()}`, userId, eventId };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Your RSVP</h3>
        <p className="text-gray-600">Just a few details and you're all set!</p>
      </div>

      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div>
          <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            id="userName"
            name="userName"
            value={formData.userName}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.userName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your full name"
            disabled={isSubmitting}
          />
          {errors.userName && (
            <p className="text-red-600 text-sm mt-1">{errors.userName}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="userEmail" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="userEmail"
            name="userEmail"
            value={formData.userEmail}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.userEmail ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your email address"
            disabled={isSubmitting}
          />
          {errors.userEmail && (
            <p className="text-red-600 text-sm mt-1">{errors.userEmail}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Confirming...
              </>
            ) : (
              'Confirm RSVP'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RSVPForm;
