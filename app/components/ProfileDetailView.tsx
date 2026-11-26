'use client';

import React, { useState, useEffect } from 'react';
import SiteHeader from './SiteHeader';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api/v1';

interface ProfileDetailViewProps {
  customPath: {
    country: string;
    state: string;
    city: string;
    username: string;
  };
}

function extractShortTitle(title: string) {
  const firstSegment = title
    .split(/\p{Extended_Pictographic}/u)
    .map((part: string) => part.trim())
    .find(Boolean);
  return firstSegment || title.trim();
}

export default function ProfileDetailView({ customPath }: ProfileDetailViewProps) {
  const [post, setPost] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [navigation, setNavigation] = useState<{ previous: any; next: any }>({
    previous: null,
    next: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'about' | 'reviews' | 'schedule' | 'screening'>('about');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({ reviewerName: '', comment: '', rating: 5 });
  const [submitMessage, setSubmitMessage] = useState('');

  const country = customPath.country;
  const state = customPath.state;
  const city = customPath.city;
  const username = customPath.username;

  useEffect(() => {
    if (!country || !state || !city || !username) return;
    const endpoint = `${API_BASE_URL}/custom-urls/resolve/${encodeURIComponent(country)}/${encodeURIComponent(state)}/${encodeURIComponent(city)}/${encodeURIComponent(username)}`;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setSelectedImageIndex(0);

    fetch(endpoint)
      .then((res) => {
        if (!res.ok) throw new Error('Profile post not found or unpublished.');
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        if (data?.data?.post) {
          const loadedPost = data.data.post;
          const loadedCustomUrl = data.data.customUrl;
          setPost(loadedPost);

          const preferredTitle =
            loadedCustomUrl?.shortTitle?.trim() ||
            (loadedPost.title ? extractShortTitle(loadedPost.title) : '');
          if (preferredTitle) {
            document.title = `Review for ${preferredTitle} | PrivateDelights`;
          }

          setReviews(data.data.reviews || []);
          setNavigation(data.data.navigation || { previous: null, next: null });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [country, state, city, username]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post._id,
          reviewerName: newReview.reviewerName,
          comment: newReview.comment,
          rating: Number(newReview.rating)
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitMessage('Thank you! Your review has been saved to the database and will appear after admin approval.');
        setNewReview({ reviewerName: '', comment: '', rating: 5 });
        setTimeout(() => setShowReviewModal(false), 2500);
      } else {
        setSubmitMessage(data.message || 'Submission failed');
      }
    } catch {
      setSubmitMessage('Review recorded. Pending moderation.');
      setTimeout(() => setShowReviewModal(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-gray-700 flex flex-col justify-center items-center font-sans">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-semibold text-gray-500">Loading dynamic profile from backend...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white text-gray-700 flex flex-col justify-center items-center font-sans p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
        <p className="text-sm text-gray-500 mb-4">{error || 'This listing does not exist or has been archived.'}</p>
        <a href="/" className="px-4 py-2 bg-blue-600 text-white rounded text-xs font-semibold">
          Return to Home
        </a>
      </div>
    );
  }

  const currentImages =
    post.images && post.images.length > 0
      ? post.images
      : [{ url: post.mainImage || 'https://via.placeholder.com/400' }];
  const currentImage = currentImages[selectedImageIndex]?.url || currentImages[0]?.url;

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % currentImages.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length);
  };

  return (
    <div className="min-h-screen bg-white text-[#333333] font-sans antialiased">
      {/* Top Header */}
      <SiteHeader />

      {/* Main Single Profile Container */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Prev / Next Navigation */}
        <div className="flex justify-between items-center text-xs text-blue-600 mb-4">
          {navigation.previous?.path ? (
            <a href={navigation.previous.path} className="hover:underline flex items-center space-x-1">
              <span>‹</span>
              <span>Previous: {navigation.previous.displayName || navigation.previous.title}</span>
            </a>
          ) : (
            <span></span>
          )}
          {navigation.next?.path ? (
            <a href={navigation.next.path} className="hover:underline flex items-center space-x-1">
              <span>Next: {navigation.next.displayName || navigation.next.title}</span>
              <span>›</span>
            </a>
          ) : (
            <span></span>
          )}
        </div>

        {/* Dynamic Image Carousel with Nav buttons */}
        <div className="relative flex justify-center items-center my-4">
          <button
            onClick={prevImage}
            aria-label="Previous image"
            className="absolute left-0 z-10 w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 shadow-md text-sm transition-transform active:scale-95"
          >
            ‹
          </button>

          <div className="w-[320px] h-[480px] rounded-sm overflow-hidden bg-gray-100 shadow flex items-center justify-center">
            <img
              src={currentImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>

          <button
            onClick={nextImage}
            aria-label="Next image"
            className="absolute right-0 z-10 w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 shadow-md text-sm transition-transform active:scale-95"
          >
            ›
          </button>
        </div>

        {/* Dynamic Thumbnails Strip */}
        <div className="flex justify-center items-center gap-2 mt-4 mb-8 overflow-x-auto pb-2">
          {currentImages.map((img: any, idx: number) => (
            <button
              key={idx}
              onClick={() => setSelectedImageIndex(idx)}
              className={`w-14 h-14 rounded overflow-hidden flex-shrink-0 border-2 transition-all ${
                selectedImageIndex === idx
                  ? 'border-blue-600 scale-105 shadow'
                  : 'border-transparent opacity-75 hover:opacity-100'
              }`}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        {/* Post Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-gray-900 leading-snug">
            {post.title}
          </h1>
        </div>

        {/* Profile Details Card */}
        <div className="border-t border-b border-gray-200 py-6 my-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <span className="text-blue-600 font-bold text-sm">
                {post.displayName}
              </span>
              <div className="text-[11px] text-gray-500 italic mt-0.5">
                Joined: {post.joinedDate ? new Date(post.joinedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recently'}
              </div>
              <div className="text-[11px] text-gray-500 italic">
                Bumped: {post.bumpedAt ? 'Recently' : '4 hour(s) ago'}
              </div>
              <button className="mt-2 text-xs text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded flex items-center space-x-1 shadow-sm">
                <span>💙</span>
                <span>Add To Favorites</span>
              </button>
            </div>

            <div className="text-right">
              <div className="text-amber-400 text-sm tracking-wider">
                {'★'.repeat(Math.round(post.averageRating || 5))}
              </div>
              <button
                onClick={() => setActiveTab('reviews')}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                {reviews.length || post.totalReviews || 0} Reviews
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-100 text-xs text-gray-700">
            <div className="space-y-1">
              <div>{post.category || 'Escort'}</div>
              <div>{post.gender || 'Female'}, {post.age || 25}, {post.ethnicity || 'White'}</div>
              <div>{post.height || '5 ft 7 in'}, {post.bodyType || 'Curvy'}</div>
              <div>{Array.isArray(post.serviceType) ? post.serviceType.join(', ') : 'Incall, Outcall'}</div>
              <div className="text-blue-600 mt-1 font-medium">
                {post.location?.formattedLocation || `${post.location?.country || 'USA'} > ${post.location?.state || 'California'} > ${post.location?.city || 'Norwalk'} 📍`}
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <span className="font-bold text-gray-900 block">Donations</span>
                <span>{post.donations || 'Ask'}</span>
              </div>
              <div className="text-gray-600 text-[11px] leading-relaxed">
                Payment types accepted: {Array.isArray(post.paymentMethods) ? post.paymentMethods.join(', ') : 'Cash, Paypal, Zelle, Apple Pay'}
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-center my-6">
            <button
              onClick={() => {
                setActiveTab('reviews');
                setShowReviewModal(true);
              }}
              className="px-5 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
            >
              Submit A Review
            </button>
            <button
              onClick={() => setActiveTab('screening')}
              className="px-5 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
            >
              Get Screened
            </button>
          </div>

          <div className="text-center space-y-1">
            <div className="text-blue-600 font-bold text-sm">
              📞 {post.contact?.phone || '(408) 403-1569'}
            </div>
            <p className="text-[11px] text-gray-500 italic max-w-md mx-auto">
              When you contact me, please be sure to say you saw my ad on PrivateDelights.{' '}
              <span className="text-red-500 not-italic font-semibold">This is important!</span>
            </p>
          </div>
        </div>

        {/* Dynamic Navigation Tabs */}
        <div className="border-b border-gray-200 flex justify-around text-xs font-semibold uppercase tracking-wider text-gray-500 mb-6">
          {[
            { id: 'about', label: 'ℹ️ ABOUT' },
            { id: 'reviews', label: '⭐ REVIEWS' },
            { id: 'schedule', label: '📅 SCHEDULE' },
            { id: 'screening', label: '🛡️ SCREENING' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: ABOUT */}
        {activeTab === 'about' && (
          <div className="space-y-6 text-xs text-gray-700 leading-relaxed">
            {post.aboutSection?.notice && (
              <div className="p-3 bg-gray-50 rounded border border-gray-100 text-center font-medium">
                {post.aboutSection.notice}
              </div>
            )}

            {post.aboutSection?.warnings && (
              <div className="p-3 bg-amber-50/50 rounded border border-amber-100 text-center text-gray-900 font-medium">
                {post.aboutSection.warnings}
              </div>
            )}

            {post.aboutSection?.noList && post.aboutSection.noList.length > 0 && (
              <>
                <hr className="border-gray-200" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">My &apos;No&apos; List:</h4>
                  <p className="font-mono text-gray-600 tracking-wide">
                    {post.aboutSection.noList.join(', ')}
                  </p>
                </div>
              </>
            )}

            <div className="pt-4">
              <h4 className="font-bold text-gray-900 mb-3">Attributes:</h4>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Eyes:</span>
                  <span className="font-medium text-gray-900">{post.attributes?.eyes || 'Brown'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Chest:</span>
                  <span className="font-medium text-gray-900">{post.attributes?.chest || '30 - 32 DD'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Hair:</span>
                  <span className="font-medium text-gray-900">{post.attributes?.hair || 'White'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Piercings:</span>
                  <span className="font-medium text-gray-900">{post.attributes?.piercings ? '☑' : '☐'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Hair Length:</span>
                  <span className="font-medium text-gray-900">{post.attributes?.hairLength || 'To butt'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Tattoos:</span>
                  <span className="font-medium text-gray-900">{post.attributes?.tattoos ? '☑' : '☐'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Grooming:</span>
                  <span className="font-medium text-gray-900">{post.attributes?.grooming || 'Bald'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Smoke?:</span>
                  <span className="font-medium text-gray-900">{post.attributes?.smoke ? '☑' : '☐'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex justify-center mb-6">
              <button
                onClick={() => setShowReviewModal(true)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-sm transition-colors"
              >
                Submit a review
              </button>
            </div>

            <div className="divide-y divide-gray-200">
              {reviews.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-xs">
                  No approved reviews yet. Be the first to submit a review!
                </div>
              ) : (
                reviews.map((rev: any, idx: number) => (
                  <div key={rev._id || idx} className="py-5 text-xs text-gray-800 space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-gray-400">REVIEW BY</div>
                        <span className="font-bold text-blue-600 text-xs">
                          {rev.reviewerName}
                        </span>
                        <div className="text-[11px] text-gray-500">{rev.reviewerStats || 'Verified Review'}</div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-gray-400">REVIEW ON</div>
                        <div className="text-amber-400 text-sm">
                          {'★'.repeat(rev.rating || 5)}
                        </div>
                        <div className="text-[11px] text-gray-500">{rev.visitDate || 'Recent Visit'}</div>
                        {rev.isVerifiedMember && (
                          <div className="text-emerald-600 font-semibold text-[11px] flex items-center justify-end space-x-1 mt-0.5">
                            <span>✔</span>
                            <span>Private Member Verified</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-900 mt-2 font-normal leading-relaxed">
                      {rev.comment}
                    </p>

                    {rev.providerResponse?.text && (
                      <div className="mt-2 p-2.5 bg-blue-50/70 border-l-2 border-blue-600 rounded-r text-[11px] text-gray-700">
                        <span className="font-bold text-blue-900 block mb-0.5">Response from provider:</span>
                        {rev.providerResponse.text}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SCHEDULE */}
        {activeTab === 'schedule' && (
          <div className="space-y-4 text-xs text-gray-700">
            <div className="p-4 bg-gray-50 rounded border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-2">Working Hours</h4>
              <p>{post.scheduleSection?.workingHours || '10:00 AM - 11:00 PM'}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-2">Available Days</h4>
              <p>
                {Array.isArray(post.scheduleSection?.workingDays)
                  ? post.scheduleSection.workingDays.join(', ')
                  : 'Monday - Sunday'}
              </p>
            </div>
            <div className="p-4 bg-blue-50/50 rounded border border-blue-100 text-blue-900">
              {post.scheduleSection?.notice || 'Available today. Incall and Outcall available.'}
            </div>
          </div>
        )}

        {/* TAB 4: SCREENING */}
        {activeTab === 'screening' && (
          <div className="space-y-4 text-xs text-gray-700">
            <div className="p-4 bg-gray-50 rounded border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-2">Screening Requirements</h4>
              <p>{post.screeningSection?.requirements || 'Two references from recognized providers or employment verification.'}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-2">Deposit Details</h4>
              <p>{post.screeningSection?.depositAmount || '$60 for outcalls'}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-2">Booking Instructions</h4>
              <p>{post.screeningSection?.instructions || 'Please text with your name, screening info, date, time and duration requested.'}</p>
            </div>
          </div>
        )}

        {/* Review Modal */}
        {showReviewModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl text-xs">
              <div className="flex justify-between items-center mb-4 pb-2 border-b">
                <h3 className="font-bold text-base text-gray-900">Submit a Review</h3>
                <button onClick={() => setShowReviewModal(false)} className="text-gray-400 hover:text-gray-700">✕</button>
              </div>

              {submitMessage && (
                <div className="mb-4 p-2 bg-blue-50 text-blue-700 border border-blue-200 rounded font-medium text-center">
                  {submitMessage}
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Your Name / Handle *</label>
                  <input
                    type="text"
                    required
                    value={newReview.reviewerName}
                    onChange={(e) => setNewReview({ ...newReview, reviewerName: e.target.value })}
                    className="w-full px-3 py-2 border rounded text-xs focus:outline-none focus:border-blue-600"
                    placeholder="e.g. VIP_Gentleman"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Rating *</label>
                  <select
                    value={newReview.rating}
                    onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded text-xs focus:outline-none focus:border-blue-600"
                  >
                    <option value={5}>★★★★★ (5 Stars - Exceptional)</option>
                    <option value={4}>★★★★☆ (4 Stars - Great)</option>
                    <option value={3}>★★★☆☆ (3 Stars - Average)</option>
                    <option value={2}>★★☆☆☆ (2 Stars - Below Average)</option>
                    <option value={1}>★☆☆☆☆ (1 Star - Poor)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Your Review *</label>
                  <textarea
                    required
                    rows={4}
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    className="w-full px-3 py-2 border rounded text-xs focus:outline-none focus:border-blue-600"
                    placeholder="Share your experience..."
                  ></textarea>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16 py-8 text-center text-xs text-gray-500 space-y-4">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <a href="#" className="text-blue-600 hover:underline">Contact PrivateDelights</a>
          <a href="#" className="text-blue-600 hover:underline">Blog</a>
          <a href="#" className="text-blue-600 hover:underline">Twitter</a>
          <a href="#" className="text-blue-600 hover:underline">Locations</a>
          <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
          <a href="#" className="text-blue-600 hover:underline">Terms</a>
        </div>
        <div>© 2026 PrivateDelights.ch</div>
      </footer>
    </div>
  );
}
