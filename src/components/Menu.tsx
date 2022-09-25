import { Menu as HeadlessUiMenu } from "@headlessui/react";
import clsx from "clsx";
import { ReactNode } from "react";
import { TransitionFloat } from "./lib/TransitionFloat";

type MenuProps = {
  triggerButton: ReactNode;
  children: ReactNode;
};

type ChildrenRenderProp = ({ active }: { active: boolean }) => ReactNode;
type MenuItemProps = {
  children: ReactNode | ChildrenRenderProp;
  onClick: () => void;
  variant?: "primary" | "secondary" | "destructive";
};

type MenuType = React.FC<MenuProps> & {
  Button: React.FC<MenuItemProps>;
};

export const Menu: MenuType = ({ triggerButton, children }: MenuProps) => {
  return (
    <HeadlessUiMenu as="div" className="relative inline-block text-left">
      <TransitionFloat placement="bottom-end" offset={0}>
        <HeadlessUiMenu.Button className="group flex h-8 w-8 items-center justify-center rounded-md text-white transition-colors duration-100 hover:bg-rose-200 hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
          {triggerButton}
        </HeadlessUiMenu.Button>

        <HeadlessUiMenu.Items className="absolute right-0 z-20 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {children}
        </HeadlessUiMenu.Items>
      </TransitionFloat>
    </HeadlessUiMenu>
  );
};

Menu.Button = ({ onClick, children, variant = "secondary" }) => {
  const activeStylesMap = (active: boolean) =>
    clsx({
      "bg-rose-200 text-black hover:bg-rose-400 hover:text-white":
        variant === "primary",
      "bg-white text-black hover:bg-rose-400 hover:text-white":
        variant === "secondary",
      "text-gray-900 hover:bg-rose-500 hover:text-white":
        variant === "destructive",
    });

  return (
    <div className="px-1 py-1">
      <HeadlessUiMenu.Item>
        {({ active }) => (
          <button
            type="button"
            onClick={onClick}
            className={clsx(
              "flex w-full items-center rounded-md px-2 py-2 text-sm transition-colors duration-100",
              activeStylesMap(active)
            )}
          >
            {(children as ChildrenRenderProp)({ active })}
          </button>
        )}
      </HeadlessUiMenu.Item>
    </div>
  );
};

Menu.Button.displayName = "MenuButton";
