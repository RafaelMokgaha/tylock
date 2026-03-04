import React, { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import {
    Save, X, Loader2, CheckCircle2,
    Volume2, Bell, Mic, Headphones, LogOut, Moon, Sun
} from 'lucide-react';

interface SettingsModalProps {
    onClose: () => void;
    currentTheme: string;
    onThemeChange: (theme: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
    onClose, currentTheme, onThemeChange
}) => {
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('tylock-mode') !== 'light';
    });

    // Audio & Notifications
    const [audioInputs, setAudioInputs] = useState<MediaDeviceInfo[]>([]);
    const [audioOutputs, setAudioOutputs] = useState<MediaDeviceInfo[]>([]);
    const [selectedInput, setSelectedInput] = useState(localStorage.getItem('nexus-input') || 'default');
    const [selectedOutput, setSelectedOutput] = useState(localStorage.getItem('nexus-output') || 'default');
    const [notifications, setNotifications] = useState({
        messages: localStorage.getItem('nexus-notif-messages') !== 'false',
        announcements: localStorage.getItem('nexus-notif-announcements') !== 'false',
        sounds: localStorage.getItem('nexus-notif-sounds') !== 'false',
    });

    useEffect(() => {
        const getDevices = async () => {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                setAudioInputs(devices.filter(d => d.kind === 'audioinput'));
                setAudioOutputs(devices.filter(d => d.kind === 'audiooutput'));
            } catch (err) {
                console.error("Error getting audio devices:", err);
            }
        };
        getDevices();
    }, []);

    // Apply dark/light mode to html element
    const toggleMode = () => {
        const newDark = !isDarkMode;
        setIsDarkMode(newDark);
        localStorage.setItem('tylock-mode', newDark ? 'dark' : 'light');
        if (newDark) {
            document.documentElement.classList.remove('light');
        } else {
            document.documentElement.classList.add('light');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            localStorage.setItem('nexus-input', selectedInput);
            localStorage.setItem('nexus-output', selectedOutput);
            localStorage.setItem('nexus-notif-messages', String(notifications.messages));
            localStorage.setItem('nexus-notif-announcements', String(notifications.announcements));
            localStorage.setItem('nexus-notif-sounds', String(notifications.sounds));

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 1000);
        } catch (err: any) {
            console.error("Save error:", err);
        } finally {
            setSaving(false);
        }
    };

    const selectClass = "w-full bg-nexus-surface border border-nexus-border rounded-xl px-4 py-3 text-white font-bold appearance-none focus:border-accent/60 outline-none transition-all pr-12";
    const sectionTitle = "text-xs font-black text-accent uppercase tracking-[0.3em] flex items-center gap-3 mb-6";

    return (
        <div className="w-full max-w-3xl bg-nexus-card border border-nexus-border rounded-2xl p-8 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <span className="w-2 h-8 bg-accent rounded-full inline-block" />
                        Settings
                    </h2>
                    <p className="text-nexus-subtext text-sm mt-1 ml-5">System Configuration</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all border border-transparent hover:border-white/10">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <form onSubmit={handleSave} className="space-y-10">

                {/* Appearance — Dark / Light Mode */}
                <div>
                    <h3 className={sectionTitle}>
                        <Sun className="w-4 h-4" /> Appearance
                    </h3>
                    <div className="flex items-center justify-between p-4 bg-nexus-surface rounded-xl border border-nexus-border">
                        <div className="flex items-center gap-3">
                            {isDarkMode ? <Moon className="w-5 h-5 text-accent" /> : <Sun className="w-5 h-5 text-accent" />}
                            <div>
                                <p className="text-sm font-bold text-white">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</p>
                                <p className="text-[10px] text-nexus-subtext">Toggle interface brightness</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={toggleMode}
                            className={`relative w-14 h-7 rounded-full transition-all duration-300 ${isDarkMode ? 'bg-accent' : 'bg-gray-300'}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${isDarkMode ? 'left-8' : 'left-1'}`} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                    {/* Audio */}
                    <div>
                        <h3 className={sectionTitle}>
                            <Volume2 className="w-4 h-4" /> Audio
                        </h3>
                        <div className="space-y-5">
                            <div>
                                <label className="text-[10px] font-black text-nexus-subtext uppercase tracking-widest mb-2 block">Microphone</label>
                                <div className="relative">
                                    <select value={selectedInput} onChange={(e) => setSelectedInput(e.target.value)} className={selectClass}>
                                        <option value="default">Default Device</option>
                                        {audioInputs.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || 'Microphone'}</option>)}
                                    </select>
                                    <Mic className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-nexus-subtext uppercase tracking-widest mb-2 block">Speakers / Headphones</label>
                                <div className="relative">
                                    <select value={selectedOutput} onChange={(e) => setSelectedOutput(e.target.value)} className={selectClass}>
                                        <option value="default">Default Device</option>
                                        {audioOutputs.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || 'Speaker'}</option>)}
                                    </select>
                                    <Headphones className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div>
                        <h3 className={sectionTitle}>
                            <Bell className="w-4 h-4" /> Notifications
                        </h3>
                        <div className="space-y-3">
                            {[
                                { id: 'messages', label: 'Messages', desc: 'Private and support messages' },
                                { id: 'announcements', label: 'Announcements', desc: 'Global news and updates' },
                                { id: 'sounds', label: 'Sounds', desc: 'Auditory feedback' },
                            ].map(item => (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-nexus-surface rounded-xl border border-nexus-border hover:border-accent/30 transition-all">
                                    <div>
                                        <p className="text-sm font-bold text-white">{item.label}</p>
                                        <p className="text-[10px] text-nexus-subtext">{item.desc}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setNotifications(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof notifications] }))}
                                        className={`relative w-12 h-6 rounded-full transition-all duration-300 ${notifications[item.id as keyof typeof notifications] ? 'bg-accent' : 'bg-gray-700'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${notifications[item.id as keyof typeof notifications] ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sign Out */}
                <div className="pt-4 border-t border-nexus-border">
                    <button
                        type="button"
                        onClick={() => auth.signOut()}
                        className="w-full px-6 py-4 bg-red-600/10 border border-red-600/30 text-red-500 font-bold uppercase tracking-wide rounded-xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-3 group mb-4"
                    >
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Sign Out
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-4 bg-accent text-white font-black text-lg uppercase tracking-wide rounded-xl flex items-center justify-center gap-3 hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {saving ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /><span>Saving...</span></>
                        ) : success ? (
                            <><CheckCircle2 className="w-5 h-5" /><span>Saved!</span></>
                        ) : (
                            <><Save className="w-5 h-5" /><span>Save Settings</span></>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SettingsModal;
