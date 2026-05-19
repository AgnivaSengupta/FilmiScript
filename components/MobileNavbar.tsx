import { Menu} from "lucide-react"
import Image from "next/image"
import { Button } from "./ui/button"

interface MobileNavbarProps {
  setIsRightSidebarOpen: (isOpen: boolean) => void;
  setIsLeftSidebarOpen: (isOpen: boolean) => void;
}

export const MobileNavbar = ({setIsRightSidebarOpen, setIsLeftSidebarOpen}: MobileNavbarProps) => {
  return (
    <div className="md:hidden flex justify-between items-center w-full mb-10">
      <Menu
        onClick={() => setIsLeftSidebarOpen(true)}
        className="w-4 h-4" />

      <div className="flex items-center gap-2">
        <Image src="/Logo3.png" alt='Logo' width={30} height={30} />
        <h1 className="font-serif text-xl">FilmiScript</h1>
      </div>
      
      <Button
        onClick={() => setIsRightSidebarOpen(true)}
        variant='outline'>
        Characters
      </Button>
    </div>
  )
}