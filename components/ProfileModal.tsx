import React, { useState, useRef } from 'react';
import { updateProfile } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { supabase } from '../lib/supabase';
import {
    User, Camera, Save, X, Loader2, CheckCircle2
} from 'lucide-react';
import type { User as UserType } from '../types';

interface ProfileModalProps {
    currentUser: Omit<UserType, 'password'>;
    onUpdate: (updatedUser: Omit<UserType, 'password'>) => void;
    onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
    currentUser, onUpdate, onClose
}) => {
    const [name, setName] = useState(currentUser.name);
    const [username, setUsername] = useState(currentUser.username);
    const [photoURL, setPhotoURL] = useState(currentUser.photoURL || '');
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            setError('Image must be less than 2MB');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const user = auth.currentUser;
            if (!user) throw new Error("No authenticated user");

            const fileExt = file.name.split('.').pop();
            const filePath = `${user.uid}-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) {
                console.error("Supabase Storage Error:", uploadError);
                throw new Error(`Upload Failed: ${uploadError.message}`);
            }

            const { data } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setPhotoURL(data.publicUrl);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            console.error("Upload error:", err);
            setError(err.message || "Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const user = auth.currentUser;
            if (!user) throw new Error("No authenticated user");

            await updateProfile(user, {
                displayName: name,
                photoURL: photoURL
            });

            // Sync to Firestore users collection
            await updateDoc(doc(db, 'users', user.uid), {
                displayName: name,
                photoURL: photoURL,
                updatedAt: serverTimestamp()
            });

            onUpdate({
                ...currentUser,
                name,
                username,
                photoURL
            });

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 1000);
        } catch (err: any) {
            console.error("Save error:", err);
            setError(err.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="w-full max-w-2xl bg-nexus-card border border-nexus-border rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <span className="w-2 h-7 bg-accent rounded-full inline-block" />
                        Edit Profile
                    </h2>
                    <p className="text-nexus-subtext text-sm mt-1 ml-5">Update your identity</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                    {/* Avatar */}
                    <div className="relative group cursor-pointer" onClick={handleImageClick}>
                        <div className="w-36 h-36 rounded-2xl overflow-hidden border-2 border-nexus-border flex items-center justify-center bg-nexus-surface relative group-hover:border-accent transition-all duration-300 shadow-lg">
                            {photoURL ? (
                                <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-16 h-16 text-gray-700" />
                            )}
                            <div className="absolute inset-0 bg-accent/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                                {uploading ? <Loader2 className="w-10 h-10 text-white animate-spin" /> : <Camera className="w-10 h-10 text-white" />}
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-accent p-2.5 rounded-xl shadow-lg border-2 border-nexus-card">
                            <Camera className="w-5 h-5 text-black" />
                        </div>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

                    {/* Basic Info */}
                    <div className="flex-1 w-full space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Callsign (Display Name)</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-nexus-surface border border-nexus-border rounded-xl px-4 py-3 text-white font-bold focus:border-accent/60 outline-none transition-all"
                                placeholder="Enter your name"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Matrix ID (Unique Username)</label>
                            <input
                                type="text"
                                value={username}
                                readOnly
                                className="w-full bg-nexus-surface/50 border border-nexus-border rounded-xl px-4 py-3 text-gray-500 font-bold outline-none cursor-not-allowed"
                                placeholder="Username"
                            />
                        </div>
                    </div>
                </div>

                {error && <p className="text-red-500 text-xs font-bold uppercase tracking-widest text-center">{error}</p>}

                <div className="flex pt-6">
                    <button
                        type="submit"
                        disabled={saving || uploading}
                        className="w-full py-4 bg-accent text-white font-black text-lg uppercase tracking-wide rounded-xl flex items-center justify-center gap-3 hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {saving ? (
                            <><Loader2 className="w-6 h-6 animate-spin" /><span>Synchronizing...</span></>
                        ) : success ? (
                            <><CheckCircle2 className="w-6 h-6" /><span>Matrix Verified</span></>
                        ) : (
                            <><Save className="w-6 h-6" /><span>Update Identity</span></>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileModal;
