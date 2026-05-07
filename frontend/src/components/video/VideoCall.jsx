import { Camera, CameraOff, Mic, MicOff, MonitorUp, Phone, PhoneOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

const rtcConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

const VideoCall = ({ selectedUser }) => {
  const { token } = useAuth();
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const peer = useRef(null);
  const socketRef = useRef(null);
  const localStream = useRef(null);
  const [active, setActive] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  const cleanup = () => {
    peer.current?.close();
    peer.current = null;
    localStream.current?.getTracks().forEach((track) => track.stop());
    localStream.current = null;
    if (localVideo.current) localVideo.current.srcObject = null;
    if (remoteVideo.current) remoteVideo.current.srcObject = null;
    setActive(false);
  };

  const ensureMedia = async () => {
    if (!localStream.current) {
      localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideo.current) localVideo.current.srcObject = localStream.current;
    }
    return localStream.current;
  };

  const createPeer = async () => {
    const pc = new RTCPeerConnection(rtcConfig);
    const stream = await ensureMedia();
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    pc.ontrack = (event) => {
      if (remoteVideo.current) remoteVideo.current.srcObject = event.streams[0];
    };
    pc.onicecandidate = (event) => {
      if (event.candidate && selectedUser) {
        socketRef.current.emit("call:ice-candidate", {
          recipientId: selectedUser._id,
          candidate: event.candidate
        });
      }
    };
    peer.current = pc;
    return pc;
  };

  useEffect(() => {
    if (!token) return undefined;
    const socket = io(SOCKET_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on("call:offer", async ({ from, offer }) => {
      const pc = await createPeer();
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("call:answer", { recipientId: from, answer });
      setActive(true);
    });

    socket.on("call:answer", async ({ answer }) => {
      await peer.current?.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on("call:ice-candidate", async ({ candidate }) => {
      if (peer.current && candidate) await peer.current.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.on("call:end", cleanup);
    return () => {
      cleanup();
      socket.disconnect();
    };
  }, [token, selectedUser?._id]);

  const startCall = async () => {
    if (!selectedUser || !socketRef.current) return;
    const pc = await createPeer();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socketRef.current.emit("call:offer", { recipientId: selectedUser._id, offer });
    setActive(true);
  };

  const endCall = () => {
    if (selectedUser) socketRef.current?.emit("call:end", { recipientId: selectedUser._id });
    cleanup();
  };

  const toggleAudio = () => {
    localStream.current?.getAudioTracks().forEach((track) => {
      track.enabled = muted;
    });
    setMuted(!muted);
  };

  const toggleVideo = () => {
    localStream.current?.getVideoTracks().forEach((track) => {
      track.enabled = cameraOff;
    });
    setCameraOff(!cameraOff);
  };

  const shareScreen = async () => {
    if (!peer.current) return;
    const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
    const screenTrack = screen.getVideoTracks()[0];
    const sender = peer.current.getSenders().find((item) => item.track?.kind === "video");
    await sender?.replaceTrack(screenTrack);
    screenTrack.onended = async () => {
      const cameraTrack = localStream.current?.getVideoTracks()[0];
      if (cameraTrack) await sender?.replaceTrack(cameraTrack);
    };
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Video Call</h2>
          <p className="text-sm text-slate-500">
            {selectedUser ? `Ready with ${selectedUser.name}` : "Select a match to call"}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs ${active ? "bg-mint/10 text-mint" : "bg-slate-100"}`}>
          {active ? "Live" : "Idle"}
        </span>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <video ref={localVideo} autoPlay muted playsInline className="aspect-video rounded-lg bg-slate-900 object-cover" />
        <video ref={remoteVideo} autoPlay playsInline className="aspect-video rounded-lg bg-slate-900 object-cover" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {!active ? (
          <button
            className="focus-ring inline-flex items-center gap-2 rounded-lg bg-mint px-4 py-2 font-semibold text-white disabled:opacity-50"
            disabled={!selectedUser}
            onClick={startCall}
          >
            <Phone size={17} />
            Start call
          </button>
        ) : (
          <button className="focus-ring inline-flex items-center gap-2 rounded-lg bg-coral px-4 py-2 font-semibold text-white" onClick={endCall}>
            <PhoneOff size={17} />
            End call
          </button>
        )}
        <button className="focus-ring grid h-10 w-10 place-items-center rounded-lg border border-slate-200" onClick={toggleAudio} title="Mute audio">
          {muted ? <MicOff size={17} /> : <Mic size={17} />}
        </button>
        <button className="focus-ring grid h-10 w-10 place-items-center rounded-lg border border-slate-200" onClick={toggleVideo} title="Toggle camera">
          {cameraOff ? <CameraOff size={17} /> : <Camera size={17} />}
        </button>
        <button className="focus-ring grid h-10 w-10 place-items-center rounded-lg border border-slate-200" onClick={shareScreen} title="Share screen">
          <MonitorUp size={17} />
        </button>
      </div>
    </section>
  );
};

export default VideoCall;
