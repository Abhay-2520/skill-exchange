import { CalendarPlus, Star } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/client";
import ChatPanel from "../components/chat/ChatPanel";
import AppShell from "../components/layout/AppShell";
import ProfileEditor from "../components/profile/ProfileEditor";
import VideoCall from "../components/video/VideoCall";
import { useAuth } from "../context/AuthContext";

const SkillChips = ({ skills }) => (
  <div className="flex flex-wrap gap-2">
    {skills?.map((skill) => (
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700" key={`${skill.name}-${skill.level}`}>
        {skill.name} · {skill.level}
      </span>
    ))}
  </div>
);

const DashboardPage = () => {
  const { user, setUser } = useAuth();
  const [matches, setMatches] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [review, setReview] = useState({ rating: 5, comment: "" });
  const [sessionForm, setSessionForm] = useState({ scheduledFor: "", teachSkill: "", learnSkill: "" });

  const refresh = useCallback(async () => {
    const [matchesRes, suggestionsRes, sessionsRes] = await Promise.all([
      api.get("/users/matches"),
      api.get("/users/suggestions"),
      api.get("/sessions")
    ]);
    setMatches(matchesRes.data.matches);
    setSuggestions(suggestionsRes.data.suggestions);
    setSessions(sessionsRes.data.sessions);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onPresence = useCallback(({ userId, online, lastSeenAt }) => {
    const apply = (items) =>
      items.map((item) =>
        item.user._id === userId ? { ...item, user: { ...item.user, online, lastSeenAt } } : item
      );
    setMatches(apply);
    setSuggestions(apply);
    setSelectedUser((current) =>
      current?._id === userId ? { ...current, online, lastSeenAt } : current
    );
  }, []);

  const saveProfile = async (payload) => {
    const { data } = await api.patch("/users/me", payload);
    setUser(data.user);
    await refresh();
  };

  const createSession = async (event) => {
    event.preventDefault();
    if (!selectedUser) return;
    await api.post("/sessions", {
      guest: selectedUser._id,
      teachSkill: sessionForm.teachSkill,
      learnSkill: sessionForm.learnSkill,
      scheduledFor: sessionForm.scheduledFor
    });
    setSessionForm({ scheduledFor: "", teachSkill: "", learnSkill: "" });
    await refresh();
  };

  const submitReview = async (event) => {
    event.preventDefault();
    if (!selectedUser) return;
    await api.post("/reviews", {
      reviewee: selectedUser._id,
      rating: Number(review.rating),
      comment: review.comment
    });
    setReview({ rating: 5, comment: "" });
  };

  const activity = useMemo(
    () =>
      sessions.map((session) => {
        const partner = session.host._id === user?._id ? session.guest : session.host;
        return { ...session, partner };
      }),
    [sessions, user?._id]
  );

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <ProfileEditor user={user} onSave={saveProfile} />

        <div className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Matches</h2>
                <p className="text-sm text-slate-500">Complementary teach and learn skills.</p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {matches.map((match) => (
                <button
                  className={`rounded-lg border p-4 text-left transition ${
                    selectedUser?._id === match.user._id ? "border-coral bg-coral/5" : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                  key={match.user._id}
                  onClick={() => setSelectedUser(match.user)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{match.user.name}</h3>
                    <span className={`h-2.5 w-2.5 rounded-full ${match.user.online ? "bg-mint" : "bg-slate-300"}`} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{match.user.location || "Remote"}</p>
                  <p className="mt-3 text-xs font-semibold text-slate-500">Can teach you</p>
                  <p className="text-sm">{match.canTeachMe.join(", ") || "Related skills"}</p>
                  <p className="mt-2 text-xs font-semibold text-slate-500">Wants from you</p>
                  <p className="text-sm">{match.wantsWhatITeach.join(", ") || "Open exchange"}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-xl font-bold">AI Smart Suggestions</h2>
            <p className="text-sm text-slate-500">Heuristic scoring using skills, availability, and profile depth.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {suggestions.map((item) => (
                <button
                  className="rounded-lg border border-slate-200 p-4 text-left hover:border-coral"
                  key={item.user._id}
                  onClick={() => setSelectedUser(item.user)}
                >
                  <p className="font-semibold">{item.user.name}</p>
                  <p className="text-sm text-slate-500">Score {item.smartScore}</p>
                  <p className="mt-2 text-xs text-slate-500">{item.sharedAvailability.join(", ") || "Flexible availability"}</p>
                </button>
              ))}
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-2">
            <ChatPanel selectedUser={selectedUser} onPresence={onPresence} />
            <div className="space-y-6">
              <VideoCall selectedUser={selectedUser} />
              <section className="rounded-lg border border-slate-200 bg-white p-5">
                <h2 className="text-lg font-bold">Session Scheduling</h2>
                <form className="mt-3 grid gap-2" onSubmit={createSession}>
                  <input className="focus-ring rounded-lg border border-slate-200 px-3 py-2" placeholder="Skill you will teach" value={sessionForm.teachSkill} onChange={(event) => setSessionForm({ ...sessionForm, teachSkill: event.target.value })} />
                  <input className="focus-ring rounded-lg border border-slate-200 px-3 py-2" placeholder="Skill you will learn" value={sessionForm.learnSkill} onChange={(event) => setSessionForm({ ...sessionForm, learnSkill: event.target.value })} />
                  <input className="focus-ring rounded-lg border border-slate-200 px-3 py-2" type="datetime-local" value={sessionForm.scheduledFor} onChange={(event) => setSessionForm({ ...sessionForm, scheduledFor: event.target.value })} />
                  <button className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2 font-semibold text-white disabled:opacity-50" disabled={!selectedUser}>
                    <CalendarPlus size={17} />
                    Schedule
                  </button>
                </form>
              </section>
              <section className="rounded-lg border border-slate-200 bg-white p-5">
                <h2 className="text-lg font-bold">Rate a Session</h2>
                <form className="mt-3 grid gap-2" onSubmit={submitReview}>
                  <select className="focus-ring rounded-lg border border-slate-200 px-3 py-2" value={review.rating} onChange={(event) => setReview({ ...review, rating: event.target.value })}>
                    {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}
                  </select>
                  <textarea className="focus-ring min-h-20 rounded-lg border border-slate-200 px-3 py-2" placeholder="What went well?" value={review.comment} onChange={(event) => setReview({ ...review, comment: event.target.value })} />
                  <button className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-coral px-4 py-2 font-semibold text-white disabled:opacity-50" disabled={!selectedUser}>
                    <Star size={17} />
                    Submit review
                  </button>
                </form>
              </section>
            </div>
          </div>

          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-xl font-bold">Session Activity</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {activity.map((session) => (
                <div className="rounded-lg border border-slate-200 p-4" key={session._id}>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{session.partner.name}</p>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">{session.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{new Date(session.scheduledFor).toLocaleString()}</p>
                  <p className="mt-2 text-sm">Teach {session.teachSkill} · Learn {session.learnSkill}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
};

export default DashboardPage;
