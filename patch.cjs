const fs = require('fs');
const file = 'e:\\My codding Project\\tylock\\tylock\\components\\VoiceBox.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

const insert = `                ) : currentRoom ? (() => {
                    const theme = ROOM_THEMES[currentRoom];
                    const participants = globalRoomState[currentRoom] || [];
                    const activeScreenEmail = Object.keys(remoteScreenStreams)[0];
                    const screenToRender = isScreenSharing ? screenStreamRef.current : activeScreenEmail ? remoteScreenStreams[activeScreenEmail] : null;

                    return (
                        <div className="relative z-10 flex flex-col items-center w-full h-full py-6 px-6 animate-fade-in">
                            {/* Header */}
                            <div className="text-center mb-4">
                                <h2 className={\`text-3xl font-black mb-2 tracking-tight uppercase italic \${theme.accent} drop-shadow-[0_0_15px_currentColor]\`}>{currentRoom}</h2>
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/[0.03] border border-white/10 rounded-full backdrop-blur-md shadow-lg">
                                    <div className={\`w-2 h-2 rounded-full \${theme.dot} animate-pulse\`} />
                                    <span className="text-xs text-gray-300 font-bold uppercase tracking-wider">
                                        {participants.length} Active Player{participants.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>

                            {/* Main Content Area */}
                            <div className="flex-1 w-full flex flex-col items-center min-h-0">
                                {screenToRender && (
                                    <div className="w-full max-w-4xl flex-1 flex flex-col items-center justify-center p-2 mb-4 animate-[fade-in_0.3s_ease-out] relative group shrink">
                                        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-black/50">
                                            <video 
                                                autoPlay 
                                                playsInline 
                                                muted={isScreenSharing} 
                                                className="absolute inset-0 w-full h-full object-contain"
                                                ref={el => { if (el && el.srcObject !== screenToRender) el.srcObject = screenToRender }}
                                            />
                                        </div>
                                        <div className="absolute top-6 left-6 px-3 py-1 bg-black/60 backdrop-blur-md rounded-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider shadow-lg z-20">
                                            {isScreenSharing ? 'Your Screen' : \`\${activeScreenEmail.split('@')[0]}'s Screen\`}
                                        </div>
                                    </div>
                                )}

                                {/* Participants Grid */}
                                <div className={\`flex flex-wrap items-center justify-center gap-6 max-w-4xl p-4 shrink-0 overflow-y-auto custom-scrollbar 
                                                \${screenToRender ? 'scale-75 origin-bottom max-h-[150px]' : 'scale-100'}\`}>
                                    {/* Local User */}
                                    <div className="flex flex-col items-center gap-3 animate-fade-in text-center relative">
                                        <div className={\`relative w-24 h-24 rounded-full border-[3px] \${isMuted ? 'border-red-500/50' : theme.activeBorder} bg-gradient-to-br \${theme.gradient} flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)] z-10\`}>
                                            {!isMuted && <AudioWave stream={localStreamRef.current} isMuted={isMuted} activeColor={theme.activeBorder} />}
                                            <span className="text-3xl font-black text-white relative z-10">{currentUserEmail.charAt(0).toUpperCase()}</span>
                                            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#16101e] border border-white/10 flex items-center justify-center z-20 shadow-xl">
                                                {isMuted ? <MicOff className="w-4 h-4 text-red-500" /> : <Mic className={\`w-4 h-4 \${theme.accent}\`} />}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs font-black text-white truncate max-w-[120px]">{currentUserEmail.split('@')[0]}</span>
                                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">You</span>
                                        </div>
                                    </div>

                                    {/* Remote Users */}
                                    {participants.filter(email => email !== currentUserEmail).map(email => (
                                        <div key={email} className="flex flex-col items-center gap-3 animate-fade-in text-center relative">
                                            <div className="relative w-24 h-24 rounded-full border-[3px] border-white/5 bg-white/[0.02] flex items-center justify-center shadow-xl z-10">
                                                {remoteStreams[email] && <AudioWave stream={remoteStreams[email]} isMuted={false} activeColor={theme.activeBorder} />}
                                                <span className="text-3xl font-black text-gray-400 relative z-10">{email.charAt(0).toUpperCase()}</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-xs font-bold text-gray-300 truncate max-w-[120px]">{email.split('@')[0]}</span>
                                                <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-0.5">Connected</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Controls */}
                            <div className="mt-4 flex items-center gap-4 bg-black/40 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-2xl shadow-2xl shrink-0">
                                 <button onClick={toggleMute}
                                     className={\`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95
                                         \${isMuted
                                             ? 'bg-red-500/10 text-red-500 border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.15)] hover:bg-red-500/20'
                                             : 'bg-white/5 text-white border border-white/10 hover:bg-white/10 shadow-lg'}\`}>
                                     {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                 </button>
                                 <button onClick={toggleScreenShare}
                                     className={\`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95
                                         \${isScreenSharing
                                             ? \`bg-white/5 \${theme.accent} border \${theme.activeBorder} shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:bg-white/10\`
                                             : 'bg-white/5 text-white border border-white/10 hover:bg-white/10 shadow-lg'}\`}>
                                     {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <MonitorUp className="w-5 h-5" />}
                                 </button>
                                 <div className="w-px h-8 bg-white/10 mx-2" />
                                 <button onClick={leaveRoom}
                                     className="w-12 h-12 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:bg-red-600 hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all duration-300 hover:scale-105 active:scale-95">
                                     <PhoneOff className="w-5 h-5" />
                                 </button>
                            </div>

                            {/* Remote Audio Streams */}
                            {Object.entries(remoteStreams).map(([email, stream]) => (
                                <audio key={email} autoPlay
                                    ref={(el) => { if (el && el.srcObject !== stream) el.srcObject = stream; }} />
                            ))}
                        </div>
                    );
                })() : (`;

lines.splice(579, 85, insert);
fs.writeFileSync(file, lines.join('\n'));
console.log('done');
