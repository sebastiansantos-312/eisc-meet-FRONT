import { Camera, Mail, User, Calendar, BookOpen, Award, Clock } from "lucide-react";

export function ProfileContent() {
  return (
    <>
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <h2 className="text-2xl font-semibold text-card-foreground">Profile Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <span className="text-4xl font-semibold text-primary">JS</span>
                  </div>
                  <button className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card">
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
                <h3 className="font-semibold text-lg text-card-foreground">Jane Smith</h3>
                <p className="text-sm text-muted-foreground mb-4">Computer Science Major</p>
                <div className="pt-4 border-t border-border space-y-3">
                  <StatRow icon={<Clock className="w-4 h-4" />} label="Study Hours" value="127.5 hrs" />
                  <StatRow icon={<Award className="w-4 h-4" />} label="Sessions" value="42" />
                  <StatRow icon={<Calendar className="w-4 h-4" />} label="Member Since" value="Jan 2026" />
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Personal Information
                </h3>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-card-foreground mb-2">
                        First Name
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        defaultValue="Jane"
                        className="w-full px-3 py-2.5 bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-card-foreground mb-2">
                        Last Name
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        defaultValue="Smith"
                        className="w-full px-3 py-2.5 bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-card-foreground mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        id="email"
                        type="email"
                        defaultValue="jane.smith@university.edu"
                        className="w-full pl-10 pr-4 py-2.5 bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-card-foreground mb-2">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      rows={3}
                      defaultValue="Computer Science student passionate about algorithms and data structures. Always happy to help with coding questions!"
                      className="w-full px-3 py-2.5 bg-input-background border border-input rounded-lg text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <button
                    type="button"
                    className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    Save Changes
                  </button>
                </form>
              </div>

              {/* Academic Information */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Academic Information
                </h3>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="university" className="block text-sm font-medium text-card-foreground mb-2">
                        University
                      </label>
                      <input
                        id="university"
                        type="text"
                        defaultValue="State University"
                        className="w-full px-3 py-2.5 bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label htmlFor="major" className="block text-sm font-medium text-card-foreground mb-2">
                        Major
                      </label>
                      <input
                        id="major"
                        type="text"
                        defaultValue="Computer Science"
                        className="w-full px-3 py-2.5 bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="year" className="block text-sm font-medium text-card-foreground mb-2">
                        Year
                      </label>
                      <select
                        id="year"
                        defaultValue="junior"
                        className="w-full px-3 py-2.5 bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="freshman">Freshman</option>
                        <option value="sophomore">Sophomore</option>
                        <option value="junior">Junior</option>
                        <option value="senior">Senior</option>
                        <option value="graduate">Graduate</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="gpa" className="block text-sm font-medium text-card-foreground mb-2">
                        GPA (Optional)
                      </label>
                      <input
                        id="gpa"
                        type="text"
                        defaultValue="3.8"
                        className="w-full px-3 py-2.5 bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    Update Academic Info
                  </button>
                </form>
              </div>

              {/* Study Preferences */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold text-card-foreground mb-4">Study Preferences</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-sm text-card-foreground">
                      Allow others to find me for study sessions
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-sm text-card-foreground">Enable email notifications for new sessions</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-sm text-card-foreground">
                      Show my study hours on public profile
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function StatRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <span className="font-semibold text-card-foreground">{value}</span>
    </div>
  );
}
