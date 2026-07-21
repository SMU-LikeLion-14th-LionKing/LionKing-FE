import ActivitySection from "./ActivitySection";
import FeedbackSection from "./FeedbackSection";
import ProfileCard from "./ProfileCard";

export default function MyPageLayout() {
  return (
    <main className="min-w-0 flex-1 bg-white p-5 sm:p-8 lg:p-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-7">
        <ProfileCard />
        <div className="grid grid-cols-1 justify-items-center gap-[55px] lg:grid-cols-2">
          <ActivitySection />
          <FeedbackSection />
        </div>
      </div>
    </main>
  );
}
