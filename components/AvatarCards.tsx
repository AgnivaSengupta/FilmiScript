import { Avatar, AvatarImage } from "@/components/ui/avatar"

export const AvatarCard = () => {

  const num = Math.floor(Math.random() * 9) + 1;
  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50/50 border border-gray-100 rounded-lg">
      {/*<div className="w-8 h-8 rounded-full bg-emerald-500 mr-3 flex items-center justify-center text-xs text-white font-bold border-2 border-white shadow-sm"></div>*/}
      <Avatar className="w-15 h-15 items-center justify-center">
        <AvatarImage
          src={`avatar-${num}.png`}
          className="w-13 h-13 object-cover"
        />
      </Avatar>
      <div className="flex-1 space-y-1.5">
        <div className="h-1.5 w-full bg-gray-200 rounded-full"></div>
        <div className="h-1.5 w-full bg-gray-200 rounded-full"></div>
        <div className="h-1.5 w-full bg-gray-200 rounded-full"></div>
        <div className="h-1.5 w-full bg-gray-200 rounded-full"></div>
        <div className="h-1.5 w-2/3 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  )
}