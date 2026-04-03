import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

function Sheet({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
    return <DialogPrimitive.Root {...props} />
}

function SheetTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
    return <DialogPrimitive.Trigger {...props} />
}

function SheetClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
    return <DialogPrimitive.Close {...props} />
}

function SheetPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
    return <DialogPrimitive.Portal {...props} />
}

function SheetOverlay({
    className,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
    return (
        <DialogPrimitive.Overlay
            className={cn(
                "fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                className
            )}
            {...props}
        />
    )
}

interface SheetContentProps extends React.ComponentProps<typeof DialogPrimitive.Content> {
    side?: "top" | "bottom" | "left" | "right"
}

function SheetContent({
    side = "right",
    className,
    children,
    ...props
}: SheetContentProps) {
    const sideClasses = {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
    }

    return (
        <SheetPortal>
            <SheetOverlay />
            <DialogPrimitive.Content
                className={cn(
                    "fixed z-50 gap-4 bg-white p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
                    sideClasses[side],
                    className
                )}
                {...props}
            >
                {children}
                <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100 cursor-pointer">
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
            </DialogPrimitive.Content>
        </SheetPortal>
    )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            className={cn("flex flex-col space-y-2 text-left", className)}
            {...props}
        />
    )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
            {...props}
        />
    )
}

function SheetTitle({
    className,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
    return (
        <DialogPrimitive.Title
            className={cn("text-lg font-semibold text-gray-900", className)}
            {...props}
        />
    )
}

function SheetDescription({
    className,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
    return (
        <DialogPrimitive.Description
            className={cn("text-sm text-gray-500", className)}
            {...props}
        />
    )
}

export {
    Sheet,
    SheetPortal,
    SheetOverlay,
    SheetTrigger,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetFooter,
    SheetTitle,
    SheetDescription,
}
