import React, { useState } from "react"
import SideNavMain from "./includes/SideNavMain"
import TopNav from "./includes/TopNav"
import { usePathname } from "next/navigation"

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

	const [isSideNavOpen, setIsSideNavOpen] = useState<boolean>(false)

    return (
      	<>
			<TopNav setIsSideNavOpen={setIsSideNavOpen} isSideNavOpen={isSideNavOpen}/>
			<div className={`flex justify-between mx-auto w-full lg:px-2.5 px-0 ${pathname == '/' ? 'max-w-[1140px]' : ''}`}>
				<SideNavMain isSideNavOpen={isSideNavOpen} />
				{children}
			</div>
      	</>
    )
}
  