import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  MapPin,
  Phone,
  Mail,
  Scale,
  Sprout,
  Save,
  CheckCircle,
  Camera,
  AlertCircle
} from 'lucide-react';

const Profile = () => {
  const { user, setUser } = useAuth();

  // Form edit states
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [farmLocation, setFarmLocation] = useState(user.farmLocation);
  const [farmSize, setFarmSize] = useState(user.farmSize);
  const [cropType, setCropType] = useState(user.cropType);

  // Status indicators
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !phone || !farmLocation || !farmSize || !cropType) {
      setError('Please fill in all fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email format.');
      return;
    }

    // Save back to AuthContext state
    setUser({
      name,
      email,
      phone,
      farmLocation,
      farmSize,
      cropType,
      profilePicture: user.profilePicture
    });

    setSuccess('Profile updated successfully!');
    setIsEditing(false);
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Profile</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Update your farmer identity profile details, farm dimensions, and cultivated crops settings.
          </p>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 1. LEFT CARD: VISUAL IDENTIFICATION */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-between text-center relative overflow-hidden">
          
          {/* Header image cover simulation */}
          <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-r from-emerald-500 to-teal-600 opacity-80"></div>
          
          <div className="relative z-10 pt-8 w-full flex flex-col items-center">
            {/* Profile Avatar with editable overlay */}
            <div className="relative w-24 h-24 rounded-full border-4 border-white dark:border-slate-900 bg-emerald-700 text-white flex items-center justify-center font-black text-2xl shadow-md">
              {user.name.split(' ').map(n => n[0]).join('')}
              <button className="absolute bottom-0 right-0 p-1.5 bg-slate-900 hover:bg-slate-850 text-white rounded-full border border-white dark:border-slate-800 focus:outline-none cursor-pointer">
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <h2 className="font-extrabold text-lg mt-4">{user.name}</h2>
            <span className="text-xs text-slate-450 dark:text-slate-400 font-semibold flex items-center gap-1 mt-1 justify-center">
              <MapPin className="w-3.5 h-3.5 text-slate-405" />
              {user.farmLocation}
            </span>

            {/* Micro stats */}
            <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 dark:border-slate-800 py-4 w-full mt-6 text-xs">
              <div className="text-center">
                <span className="block text-[10px] text-slate-400 uppercase font-bold">Crop Range</span>
                <span className="font-bold text-slate-700 dark:text-slate-200 block mt-1.5">{user.cropType}</span>
              </div>
              <div className="text-center">
                <span className="block text-[10px] text-slate-400 uppercase font-bold">Farm Area</span>
                <span className="font-bold text-slate-700 dark:text-slate-200 block mt-1.5">{user.farmSize}</span>
              </div>
            </div>
          </div>

          <div className="w-full text-left text-xs space-y-3.5 border-t border-slate-100 dark:border-slate-800 pt-4 mt-6">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="text-slate-500 dark:text-slate-400">{user.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-slate-400" />
              <span className="text-slate-500 dark:text-slate-400">{user.phone}</span>
            </div>
          </div>
        </div>

        {/* 2. EDITABLE PROFILE FORM */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-base">Account Information</h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-xs font-semibold hover:opacity-80 transition-opacity cursor-pointer"
              >
                Modify Fields
              </button>
            )}
          </div>

          {/* Alert feedback banners */}
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-sm flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-500" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5" htmlFor="fullName">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    id="fullName"
                    type="text"
                    disabled={!isEditing}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 disabled:opacity-60 border border-slate-205 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-white"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5" htmlFor="emailAddress">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="emailAddress"
                    type="email"
                    disabled={!isEditing}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 disabled:opacity-60 border border-slate-205 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-white"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5" htmlFor="phoneNumber">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    id="phoneNumber"
                    type="text"
                    disabled={!isEditing}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 disabled:opacity-60 border border-slate-205 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-white"
                  />
                </div>
              </div>

              {/* Farm Location */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5" htmlFor="location">
                  Farm Location
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <input
                    id="location"
                    type="text"
                    disabled={!isEditing}
                    value={farmLocation}
                    onChange={(e) => setFarmLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 disabled:opacity-60 border border-slate-205 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-white"
                  />
                </div>
              </div>

              {/* Farm Size */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5" htmlFor="size">
                  Farm Size
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Scale className="w-4 h-4" />
                  </span>
                  <input
                    id="size"
                    type="text"
                    disabled={!isEditing}
                    value={farmSize}
                    onChange={(e) => setFarmSize(e.target.value)}
                    placeholder="e.g. 45 Acres"
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 disabled:opacity-60 border border-slate-205 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-white"
                  />
                </div>
              </div>

              {/* Crop Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5" htmlFor="crops">
                  Cultivated Crop Types
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Sprout className="w-4 h-4" />
                  </span>
                  <input
                    id="crops"
                    type="text"
                    disabled={!isEditing}
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value)}
                    placeholder="e.g. Organic Wheat"
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 disabled:opacity-60 border border-slate-205 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-white"
                  />
                </div>
              </div>

            </div>

            {/* Save Buttons */}
            {isEditing && (
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setError('');
                  }}
                  className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/10 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;
