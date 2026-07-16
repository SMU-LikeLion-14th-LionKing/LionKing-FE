export default function UserProfile() {
  return (
    <div className="mt-10 flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green text-lg font-bold text-white">
        김
      </div>

      <div>
        <p className="text-base font-medium leading-[140%]">김멋사</p>

        <p className="text-sm font-normal leading-[140%] text-gray-3">
          likelion@gmail.com
        </p>
      </div>
    </div>
  );
}
