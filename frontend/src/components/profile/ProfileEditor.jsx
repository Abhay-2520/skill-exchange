import { Plus, Save, X } from "lucide-react";
import { useState } from "react";

const levels = ["Beginner", "Intermediate", "Expert"];
const emptySkill = { name: "", level: "Beginner" };

const SkillListEditor = ({ title, value, onChange }) => {
  const updateSkill = (index, field, fieldValue) => {
    onChange(value.map((skill, i) => (i === index ? { ...skill, [field]: fieldValue } : skill)));
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        <button
          type="button"
          className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white"
          onClick={() => onChange([...value, emptySkill])}
          title="Add skill"
        >
          <Plus size={16} />
        </button>
      </div>
      <div className="space-y-2">
        {value.map((skill, index) => (
          <div className="grid grid-cols-[1fr_150px_36px] gap-2" key={`${title}-${index}`}>
            <input
              className="focus-ring rounded-lg border border-slate-200 px-3 py-2"
              placeholder="Skill name"
              value={skill.name}
              onChange={(event) => updateSkill(index, "name", event.target.value)}
            />
            <select
              className="focus-ring rounded-lg border border-slate-200 px-3 py-2"
              value={skill.level}
              onChange={(event) => updateSkill(index, "level", event.target.value)}
            >
              {levels.map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>
            <button
              type="button"
              className="focus-ring grid h-10 place-items-center rounded-lg border border-slate-200 bg-white"
              onClick={() => onChange(value.filter((_, i) => i !== index))}
              title="Remove skill"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

const ProfileEditor = ({ user, onSave }) => {
  const [form, setForm] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    location: user?.location || "",
    availability: user?.availability || [],
    skillsToTeach: user?.skillsToTeach?.length ? user.skillsToTeach : [emptySkill],
    skillsToLearn: user?.skillsToLearn?.length ? user.skillsToLearn : [emptySkill]
  });

  const save = (event) => {
    event.preventDefault();
    const cleanSkills = (skills) => skills.filter((skill) => skill.name.trim());
    onSave({
      ...form,
      availability: String(form.availabilityInput || form.availability.join(","))
        .split(",")
        .map((slot) => slot.trim())
        .filter(Boolean),
      skillsToTeach: cleanSkills(form.skillsToTeach),
      skillsToLearn: cleanSkills(form.skillsToLearn)
    });
  };

  return (
    <form className="space-y-5 rounded-lg border border-slate-200 bg-white p-5" onSubmit={save}>
      <div>
        <h2 className="text-xl font-bold">Profile</h2>
        <p className="text-sm text-slate-500">Keep skills specific for better matches.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <input
          className="focus-ring rounded-lg border border-slate-200 px-3 py-2"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          placeholder="Name"
        />
        <input
          className="focus-ring rounded-lg border border-slate-200 px-3 py-2"
          value={form.location}
          onChange={(event) => setForm({ ...form, location: event.target.value })}
          placeholder="Location"
        />
      </div>
      <textarea
        className="focus-ring min-h-24 w-full rounded-lg border border-slate-200 px-3 py-2"
        value={form.bio}
        onChange={(event) => setForm({ ...form, bio: event.target.value })}
        placeholder="Short bio"
      />
      <SkillListEditor
        title="Skills I can teach"
        value={form.skillsToTeach}
        onChange={(skillsToTeach) => setForm({ ...form, skillsToTeach })}
      />
      <SkillListEditor
        title="Skills I want to learn"
        value={form.skillsToLearn}
        onChange={(skillsToLearn) => setForm({ ...form, skillsToLearn })}
      />
      <input
        className="focus-ring w-full rounded-lg border border-slate-200 px-3 py-2"
        defaultValue={form.availability.join(", ")}
        onChange={(event) => setForm({ ...form, availabilityInput: event.target.value })}
        placeholder="Availability, comma separated"
      />
      <button className="focus-ring inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 font-semibold text-white">
        <Save size={17} />
        Save profile
      </button>
    </form>
  );
};

export default ProfileEditor;
